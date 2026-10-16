import { db } from "./firebase";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { Profile, ibraheemProfile } from "./data/profile";
import {
  Order,
  FulfillmentStatus,
  canTransition,
  CustomerInfo,
  calculateSubtotal,
} from "./data/order";
import { isSafeContactUrl } from "./links";
import { Review, ClientProfileMeta } from "./models";

// ── Profiles ──────────────────────────────────────────────────────

export async function getProfile(username: string = "ibraheem"): Promise<Profile> {
  const docRef = doc(db, "profiles", username);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const profile = docSnap.data() as Profile;
    if (profile.active === false) throw new Error("Profile not found.");
    return profile;
  }
  // Document doesn't exist yet — return the static seed for known profiles.
  // Once Firestore is seeded, this path only hits for unknown usernames.
  if (username === "ibraheem") {
    return ibraheemProfile;
  }
  throw new Error(`Profile not found: profiles/${username}`);
}

export async function saveProfile(username: string = "ibraheem", profile: Profile): Promise<void> {
  // Ensure max 10 links constraint
  if (profile.links && profile.links.length > 10) {
    profile.links = profile.links.slice(0, 10);
  }
  if (!profile.displayName.trim() || profile.links.some((l) => !isSafeContactUrl(l.url))) throw new Error("Invalid profile details.");
  const docRef = doc(db, "profiles", username);
  await updateDoc(docRef, {
    displayName: profile.displayName.trim(), title: profile.title, bio: profile.bio,
    location: profile.location, links: profile.links, updatedAt: serverTimestamp(),
  });
}

// ── Orders ────────────────────────────────────────────────────────

export function orderNumber(from = new Date()): string {
  const y = from.getFullYear();
  const m = String(from.getMonth() + 1).padStart(2, "0");
  const d = String(from.getDate()).padStart(2, "0");
  const time = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `ET-${y}${m}${d}-${time}`;
}

/**
 * Create an order after the customer has authenticated with Firebase.
 * Errors propagate to the caller, which presents a generic customer-safe message.
 */
export async function createOrder(order: Order): Promise<string> {
  const now = Date.now();
  const data = {
    ...order,
    orderNumber: order.orderNumber || orderNumber(),
    plan: "standard",
    payment: { ...order.payment, method: "jazzcash", status: "pending" },
    subtotal: calculateSubtotal(order.card.quantity,'standard'),
    deliveryFee: null,
    total: null,
    createdAt: now,
    updatedAt: now,
    fulfillment: { status: "new", history: [{ status: "new", at: now }] },
  };
  const ref = await addDoc(collection(db, "orders"), data);
  return ref.id;
}

export async function getOrders(): Promise<Order[]> {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(200));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Order) }));
}

export async function getOrder(orderId: string): Promise<Order> {
  const snap = await getDoc(doc(db, "orders", orderId));
  if (!snap.exists()) throw new Error(`Order not found: ${orderId}`);
  return { id: snap.id, ...(snap.data() as Order) };
}

export async function adminUpdateOrder(orderId: string, patch: Partial<Order>): Promise<void> {
  await updateDoc(doc(db, "orders", orderId), { ...patch, updatedAt: Date.now() });
}

export async function confirmPayment(order: Order): Promise<void> {
  if (!order.id) throw new Error("Order is missing its Firestore ID.");
  if (order.payment.status === "paid") return;
  await runTransaction(db, async (tx) => {
    const ref = doc(db, "orders", order.id!);
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Order not found.");
    const current = snap.data() as Order;
    if (current.payment.status === "paid") return;
    if (current.fulfillment.status === "cancelled") throw new Error("Cannot confirm payment for a cancelled order.");
    const now = Date.now();
    const status = current.fulfillment.status === "new" || current.fulfillment.status === "payment_pending" ? "paid" : current.fulfillment.status;
    tx.update(ref, {
      payment: { ...current.payment, status: "paid" },
      fulfillment: status === current.fulfillment.status
        ? current.fulfillment
        : { status, history: [...(current.fulfillment.history || []), { status, at: now }] },
      updatedAt: now,
    });
  });
}

/**
 * Advance an order's fulfillment status with a valid-transition guard.
 * `expect` is the status the admin UI believed the order was in — if the
 * doc moved underneath us we surface a conflict instead of clobbering it.
 */
export async function advanceFulfillment(
  orderId: string,
  expect: FulfillmentStatus,
  to: FulfillmentStatus
): Promise<void> {
  if (!canTransition(expect, to)) {
    throw new Error(`Invalid transition: ${expect} → ${to}`);
  }
  await runTransaction(db, async (tx) => {
    const ref = doc(db, "orders", orderId);
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error(`Order not found: ${orderId}`);
    const data = snap.data() as Order;
    if (to === "paid" || to === "profile_created") throw new Error("Use payment confirmation or profile creation for this transition.");
    const current = data.fulfillment.status;
    if (current !== expect) {
      throw new Error(`Order moved to "${current}" meanwhile — refresh and try again.`);
    }
    const now = Date.now();
    tx.update(ref, {
      fulfillment: {
        status: to,
        history: [...((snap.data() as Order).fulfillment?.history || []), { status: to as string, at: now }],
      },
      updatedAt: now,
    });
  });
}

// ── Reviews ───────────────────────────────────────────────────────

export async function createReview(review: Review): Promise<void> {
  await addDoc(collection(db, "reviews"), {
    ...review,
    createdAt: review.createdAt || Date.now(),
  });
}

export async function listReviews(max = 20): Promise<Review[]> {
  const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Review) }));
}

// ── Username / handles ────────────────────────────────────────────

export async function usernameAvailable(username: string): Promise<boolean> {
  const clean = username.toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 30);
  if (!clean) return false;
  // Reserved: the existing brand profile.
  if (clean === "ibraheem") return false;
  const [profileSnap, handleSnap] = await Promise.all([getDoc(doc(db, "profiles", clean)), getDoc(doc(db, "handles", clean))]);
  return !profileSnap.exists() && !handleSnap.exists();
}

/** Suggest a handle from the customer's name. Best-effort without Firestore,
 * then refines the number suffix if the base is taken. */
export async function suggestUsername(firstName?: string, lastName?: string): Promise<string> {
  const base = ((firstName || "").trim().toLowerCase() + (lastName ? lastName.trim().toLowerCase() : ""))
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 24);
  const start = base || "profile";
  if (await usernameAvailable(start)) return start;
  for (let i = 2; i < 100; i++) {
    if (await usernameAvailable(`${start}${i}`)) return `${start}${i}`;
  }
  return start;
}

// ── Create Client Profile (admin) ─────────────────────────────────

/**
 * Admin action: turn an order's profileDraft into a live EdgeTap profile.
 * Creates (in one transaction):
 *   profiles/{username}   → the public profile
 *   handles/{username}    → claims the handle (collision-safe)
 *   profilesById/{id}     → stable-ID → username mapping
 * then updates the order with the profile link + fulfillment status.
 */
export async function createClientProfileFromOrder(
  order: Order,
  username: string
): Promise<{ profileId: string; profileUrl: string }> {
  const clean = username.toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 30);
  if (!clean) throw new Error("Username must be at least one letter, number, dot, dash or underscore.");
  if (!(await usernameAvailable(clean))) {
    throw new Error(`Username "/${clean}" is already taken.`);
  }

  if (!order.id) throw new Error("Order ID is required.");
  if (order.payment.status !== "paid") throw new Error("Confirm payment before creating a profile.");
  const { profileUrl } = await import("./site");
  const profileId = crypto.randomUUID();
  const now = Date.now();
  const avatar = order.profileDraft.avatarUrl;

  const profile: Profile = {
    username: clean,
    displayName: order.profileDraft.displayName,
    firstName: order.customer.fullName.split(" ")[0] || "",
    lastName: order.customer.fullName.split(" ").slice(1).join(" "),
    title: order.profileDraft.title || "",
    bio: order.profileDraft.bio || "",
    location: order.customer.city || "Pakistan",
    avatar: avatar?.startsWith("http") ? avatar : "",
    links: (order.profileDraft.links || []).filter((l) => isSafeContactUrl(l.url)).slice(0, 10).map((link) => ({
      type: link.type, label: link.label, url: link.url,
      icon: typeof link.icon === "string" ? link.icon : "globe",
      accent: typeof link.accent === "string" ? link.accent : "#100B4A",
    })),
    profileId,
    ...(order.ownerUid ? { ownerUid: order.ownerUid } : {}),
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  await runTransaction(db, async (tx) => {
    const profileRef = doc(db, "profiles", clean);
    const handleRef = doc(db, "handles", clean);
    const orderRef = doc(db, "orders", order.id!);
    const [existingProfile, existingHandle, latestOrder] = await Promise.all([tx.get(profileRef), tx.get(handleRef), tx.get(orderRef)]);
    if (existingProfile.exists() || existingHandle.exists()) throw new Error("Username is already taken.");
    if (!latestOrder.exists()) throw new Error("Order not found.");
    const current = latestOrder.data() as Order;
    if (current.profileId || current.usernameFinal) throw new Error("This order already has a profile.");
    if (current.updatedAt !== order.updatedAt) throw new Error("Order changed. Refresh before creating its profile.");
    if (current.payment.status !== "paid" || !canTransition(current.fulfillment.status, "profile_created")) throw new Error("Order is not ready for profile creation.");
    tx.set(profileRef, profile);
    tx.set(doc(db, "handles", clean), { profileId, createdAt: now });
    const meta: ClientProfileMeta = { profileId, username: clean, active: true, createdAt: now };
    tx.set(doc(db, "profilesById", profileId), meta);
    tx.update(doc(db, "orders", order.id!), {
      profileId,
      usernameFinal: clean,
      nfcUrl: profileUrl(clean),
      fulfillment: {
        status: "profile_created",
        history: [...(current.fulfillment?.history || []), { status: "profile_created", at: now }],
      },
      updatedAt: now,
    });
  });

  return { profileId, profileUrl: profileUrl(clean) };
}

// Re-export CustomerInfo type for callers that build order payloads.
export type { CustomerInfo };