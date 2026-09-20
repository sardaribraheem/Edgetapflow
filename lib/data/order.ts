// Order / fulfillment domain data, kept separate from presentation.
// Shared by the /order wizard, the admin dashboard, and lib/firestore.ts.

import type { ProfileLink } from "./profile";

// ── Card templates ────────────────────────────────────────────────
export type CardTemplateId = "classic" | "bold" | "executive" | "custom";

export type CardTemplate = {
  id: CardTemplateId;
  name: string;
  tagline: string;
  tone: string; // tailwind bg tone for the visual preview
  description: string;
};

export const CARD_TEMPLATES: CardTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    tagline: "Clean & timeless",
    tone: "bg-white",
    description: "The standard EdgeTap card. Simple, professional, works everywhere.",
  },
  {
    id: "bold",
    name: "Bold",
    tagline: "Make a statement",
    tone: "bg-[--ink]",
    description: "Deep ink card with a high-contrast yellow NFC mark. For people who stand out.",
  },
  {
    id: "executive",
    name: "Executive",
    tagline: "Premium & understated",
    tone: "bg-[--mint-soft]",
    description: "A refined look for managers, founders, and senior professionals.",
  },
  {
    id: "custom",
    name: "Custom",
    tagline: "Your own design",
    tone: "bg-[--sky-soft]",
    description: "Upload your own card artwork. We'll print it on the NFC card.",
  },
];

// The plan (from /pricing) that seeded an order.
export type OrderPlanId = "standard" | "business" | "enterprise";

// ── Customer / delivery (PRIVATE — never surfaced on /u/…) ───────
export type CustomerInfo = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode?: string;
};

// ── Card selection on an order ────────────────────────────────────
export type OrderCard = {
  template: CardTemplateId;
  quantity: number;
  customDesignUrl?: string; // Storage ref for uploaded Custom artwork
};

// What the customer built during onboarding (draft of the future profile).
export type ProfileDraft = {
  avatarUrl?: string; // Storage ref — "https://" placeholders are treated as empty
  displayName: string;
  bio: string;
  usernameSuggested?: string;
  links: ProfileLink[];
};

// ── Payment (state kept separate from order/fulfillment) ──────────
export type PaymentMethod = "online" | "cod";
export type PaymentStatus =
  | "pending" // online chosen but no provider integrated yet
  | "paid"
  | "failed"
  | "cod_pending_confirmation"
  | "refunded"
  | "cancelled";

export type PaymentInfo = {
  method: PaymentMethod;
  status: PaymentStatus;
  providerRef?: string; // future provider reference (provider not integrated yet)
};

// ── Fulfillment state machine ─────────────────────────────────────
export const FULFILLMENT_FLOW = [
  "new",
  "payment_pending",
  "paid", // online paid
  "cod_pending_confirmation", // COD chosen — awaiting confirmation before production
  "profile_created",
  "production_ready",
  "printing",
  "ready_for_nfc",
  "nfc_programmed",
  "qa_passed",
  "ready_to_ship",
  "shipped",
  "delivered",
] as const;

export type FulfillmentStatus = (typeof FULFILLMENT_FLOW)[number] | "cancelled";

export type FulfillmentEvent = {
  status: FulfillmentStatus;
  at: number; // epoch ms
};

export type FulfillmentInfo = {
  status: FulfillmentStatus;
  history: FulfillmentEvent[];
};

// The ordered "main line" — a status is only reachable from a status that
// precedes it in this list (or from its own immediate branch for paid/COD).
// "cancelled" is a valid target from almost anywhere.
const MAIN_LINE_ORDER: Record<string, number> = FULFILLMENT_FLOW.reduce(
  (acc, s, i) => ({ ...acc, [s]: i }),
  {}
);

export function canTransition(from: FulfillmentStatus, to: FulfillmentStatus): boolean {
  if (from === to) return false;
  if (to === "cancelled") return from !== "delivered";
  if (from === "cancelled") return false;
  // Both must be on the main line, and `to` must come strictly after `from`.
  const f = MAIN_LINE_ORDER[from];
  const t = MAIN_LINE_ORDER[to];
  if (f === undefined || t === undefined) return false;
  return t > f;
}

export type FulfillmentState = {
  status: FulfillmentStatus;
  label: string;
};

// Only statuses the backend can actually report are rendered on the
// customer confirmation tracker (spec: don't show states that don't exist).
export const FULFILLMENT_STATES: FulfillmentState[] = FULFILLMENT_FLOW.map((s) => ({
  status: s,
  label: s.replace(/_/g, " "),
}));

// ── Order ─────────────────────────────────────────────────────────
export type Order = {
  id?: string; // Firestore doc id
  orderNumber: string;
  plan: OrderPlanId;
  card: OrderCard;
  profileDraft: ProfileDraft;
  customer: CustomerInfo; // PRIVATE
  payment: PaymentInfo;
  fulfillment: FulfillmentInfo;
  profileId?: string; // set when admin creates the client profile
  usernameFinal?: string; // chosen handle on /u/
  nfcUrl?: string; // https://edgetapflow.web.app/u/<username>
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
};

export const LINK_PRESETS: { type: string; label: string }[] = [
  { type: "whatsapp", label: "WhatsApp" },
  { type: "instagram", label: "Instagram" },
  { type: "linkedin", label: "LinkedIn" },
  { type: "portfolio", label: "Website" },
  { type: "portfolio", label: "Portfolio" },
  { type: "mail", label: "Email" },
  { type: "phone", label: "Phone" },
];

// Default accents for the common link types (matches ProfilePage icons).
export const LINK_ACCENTS: Record<string, string> = {
  whatsapp: "#25D366",
  linkedin: "#0A66C2",
  instagram: "#E1306C",
  portfolio: "#7FA8FF",
  github: "#100B4A",
  mail: "#FF6B5B",
  phone: "#25D366",
  globe: "#7FA8FF",
};