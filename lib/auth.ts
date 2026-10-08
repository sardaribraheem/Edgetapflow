import { usesSupabase } from "./backend";
import { getSupabase } from "./supabase";

export type User = { uid: string; email: string | null };
let currentUser: User | null = null;
let recoverySession = false;
export const canResetPassword = () => recoverySession;
export const auth = { get currentUser() { return currentUser; } };
type Auth = typeof auth;
const mapUser = (user: { id?: string; uid?: string; email?: string | null } | null): User | null => {
  if (!user) return null;
  const next = { uid: user.id || user.uid || "", email: user.email || null };
  return currentUser?.uid === next.uid && currentUser.email === next.email ? currentUser : next;
};

export function onAuthStateChanged(_auth: Auth, callback: (user: User | null) => void | Promise<void>): () => void {
  let cancelled = false;
  let unsubscribe = () => {};
  const deliver = (user: User | null) => {
    if (cancelled) return;
    currentUser = user;
    // Do not await RPC work inside Supabase's auth callback/session lock.
    setTimeout(() => { if (!cancelled) void Promise.resolve().then(() => callback(user)).catch(() => {}); }, 0);
  };
  if (usesSupabase) {
    try {
      const { data } = getSupabase().auth.onAuthStateChange((event, session) => { if (event === "PASSWORD_RECOVERY") recoverySession = true; if (!session) recoverySession = false; deliver(mapUser(session?.user || null)); });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch { deliver(null); }
  } else {
    void Promise.all([import("firebase/auth"), import("./firebase")]).then(([sdk, app]) => {
      if (!cancelled) unsubscribe = sdk.onAuthStateChanged(app.auth, user => deliver(mapUser(user)));
    }).catch(() => deliver(null));
  }
  return () => { cancelled = true; unsubscribe(); };
}

export async function getCurrentUser(): Promise<User | null> {
  if (usesSupabase) {
    const { data, error } = await getSupabase().auth.getUser();
    if (error && error.name !== "AuthSessionMissingError") throw error;
    currentUser = mapUser(data.user);
  } else {
    const { auth: firebaseAuth } = await import("./firebase");
    await firebaseAuth.authStateReady();
    currentUser = mapUser(firebaseAuth.currentUser);
  }
  return currentUser;
}

export async function signInWithEmailAndPassword(_auth: Auth, email: string, password: string): Promise<{ user: User }> {
  if (usesSupabase) {
    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) throw error;
    currentUser = mapUser(data.user);
  } else {
    const [sdk, app] = await Promise.all([import("firebase/auth"), import("./firebase")]);
    currentUser = mapUser((await sdk.signInWithEmailAndPassword(app.auth, email, password)).user);
  }
  if (!currentUser) throw new Error("Sign-in did not create a session.");
  return { user: currentUser };
}

export async function createUserWithEmailAndPassword(_auth: Auth, email: string, password: string): Promise<{ user: User }> {
  if (usesSupabase) {
    const { data, error } = await getSupabase().auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/account` } });
    if (error) throw error;
    // A returned user without a session may mean email confirmation is required.
    // Never upload/create an order using an unauthenticated signup result.
    if (!data.session) throw Object.assign(new Error("Confirm your email, then sign in to submit your order."), { code: "email_confirmation_required" });
    currentUser = mapUser(data.user);
  } else {
    const [sdk, app] = await Promise.all([import("firebase/auth"), import("./firebase")]);
    currentUser = mapUser((await sdk.createUserWithEmailAndPassword(app.auth, email, password)).user);
  }
  if (!currentUser) throw new Error("Account creation did not create a session.");
  return { user: currentUser };
}

export async function signOut(_auth: Auth): Promise<void> {
  void _auth;
  if (usesSupabase) {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw error;
  } else {
    const [sdk, app] = await Promise.all([import("firebase/auth"), import("./firebase")]);
    await sdk.signOut(app.auth);
  }
  currentUser = null;
}

export async function sendPasswordResetEmail(_auth: Auth, email: string): Promise<void> {
  if (usesSupabase) {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/account/recovery` });
    if (error) throw error;
  } else {
    const [sdk, app] = await Promise.all([import("firebase/auth"), import("./firebase")]);
    await sdk.sendPasswordResetEmail(app.auth, email);
  }
}

export async function isStaff(): Promise<boolean> {
  if (usesSupabase) {
    const { data, error } = await getSupabase().rpc("is_staff");
    if (error) throw error;
    return data === true;
  }
  const [sdk, app] = await Promise.all([import("firebase/firestore"), import("./firebase")]);
  const snap = await sdk.getDoc(sdk.doc(app.db, "config", "admin_uids"));
  return !!currentUser && snap.exists() && snap.data().uids?.includes(currentUser.uid);
}

export async function updateRecoveredPassword(password: string): Promise<void> {
  if (!usesSupabase || !recoverySession || password.length < 8) throw new Error("Use a valid password recovery link and a password of at least 8 characters.");
  const { error } = await getSupabase().auth.updateUser({ password });
  if (error) throw error;
  await signOut(auth);
  recoverySession = false;
}
