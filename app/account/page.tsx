"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, type User } from "@/lib/auth";
import { usesSupabase } from "@/lib/backend";
import { NfcWaves } from "@/components/doodles";
import { accountReturnPath } from "@/lib/site";
import { auth } from "@/lib/auth";
import { readGuestDraft } from "@/lib/guest-draft";

export default function AccountPage() {
  const router = useRouter();
  const [draftEmail, setDraftEmail] = useState<string>();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const operation = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"signIn" | "create">("signIn");

  useEffect(() => {
    void readGuestDraft().then(draft => setDraftEmail(draft?.claimEmail)).catch(() => {});
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setReady(true);
      if (user) setPassword("");
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (operation.current) return;
    operation.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = mode === "create" ? await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password) : await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      const requestedPath = new URLSearchParams(window.location.search).get("next");
      const guest = await readGuestDraft().catch(() => null);
      setPassword("");
      setMessage("Signed in. Continuing…");
      router.replace(accountReturnPath(requestedPath, guest?.claimEmail, result.user.email));
      return;
    } catch (caught) {
      const code = (caught as { code?: string }).code || "";
      if (code === "email_confirmation_required") {
        setPassword("");
        setMode("signIn");
        setMessage("Confirm your email, then sign in here to continue. Your card draft stays on this device. If you already have an account, use its password.");
      } else if (["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found", "invalid_credentials"].includes(code)) {
        setError("That email and password do not match an EdgeTap account.");
      } else if (["auth/too-many-requests", "over_request_rate_limit", "over_email_send_rate_limit"].includes(code)) {
        setError("Too many attempts. Wait a moment and try again.");
      } else if (code === "email_not_confirmed") {
        setError("Confirm your email using the signup message before signing in.");
      } else {
        setError(mode === "create" ? "Account creation is unavailable right now. Please try again or contact EdgeTap." : "Sign-in is unavailable right now. Please try again or contact EdgeTap.");
      }
    }
    setBusy(false);
    operation.current = false;
  };

  const handleSignOut = async () => {
    if (operation.current) return;
    operation.current = true;
    setBusy(true);
    try { await signOut(auth); setMessage(""); setError(""); }
    catch { setError("Could not sign out. Please try again."); }
    finally { setBusy(false); operation.current = false; }
  };

  if (!ready) return <main className="min-h-screen grid place-items-center px-4"><p role="status">Checking your sign-in…</p></main>;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[--cream] px-4 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[--yellow]">
            <NfcWaves className="h-5 w-5 text-[--ink]" />
          </span>
          <span className="font-display text-xl font-bold text-[--ink]">EdgeTap</span>
        </Link>
        {draftEmail && !user && <p className="mb-5 text-sm">Your card draft is saved on this device. Sign in with the email you used at checkout to continue.</p>}
        <section className="card-paper p-7 sm:p-9">
          <p className="eyebrow text-[--ink-mid]">Customer account</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-[--ink]">{user ? "You're signed in" : mode === "create" ? "Create your account" : "Sign in to EdgeTap"}</h1>
          {user ? <>
            <p className="mt-4">Signed in as {user.email || "your EdgeTap account"}.</p>
            {busy ? <p role="status" className="mt-4">{message || "Please wait…"}</p> : <>
              {draftEmail && draftEmail.toLowerCase() === user.email?.toLowerCase() && <Link href="/order" className="btn btn-ink mt-6 px-5 py-3">Continue your saved card</Link>}
              <Link href="/account/orders" className="mt-5 block font-bold underline">View my orders & applications</Link>
            </>}
            {error && <p role="alert" className="mt-4">{error}</p>}
            <button type="button" disabled={busy} onClick={handleSignOut} className="mt-6 font-bold underline disabled:opacity-50">Sign out this browser</button>
          </> : <>
          <p className="mt-2 text-sm leading-relaxed text-[--ink-soft]">
            {mode === "create" ? "Create a login to save your profile, follow your order and edit your profile after EdgeTap activates it. Registration does not place an order or create a public profile." : "Sign in to view your orders or update your activated profile. You can build a new card before creating an account."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {(["signIn", "create"] as const).map(value => <button type="button" key={value} aria-pressed={mode === value} disabled={busy} onClick={() => { setMode(value); setPassword(""); setError(""); setMessage(""); }} className="text-sm font-bold underline disabled:opacity-50">
              {value === "create" ? "Create a new account" : "Use existing account"}
            </button>)}
          </div>
          <form onSubmit={handleSubmit} className="mt-7 space-y-4"><fieldset disabled={busy} className="min-w-0 space-y-4">
            <label className="block text-sm font-bold text-[--ink]">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="mt-1.5 w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-3 text-[--ink] outline-none focus:ring-2 focus:ring-[--ink]"
              />
            </label>
            <label className="block text-sm font-bold text-[--ink]">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "create" ? "new-password" : "current-password"}
                minLength={mode === "create" ? (usesSupabase ? 8 : 6) : undefined}
                required
                className="mt-1.5 w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-3 text-[--ink] outline-none focus:ring-2 focus:ring-[--ink]"
              />
            </label>
            {error && <p className="rounded-xl bg-[--coral]/10 p-3 text-sm font-semibold text-[--coral]" role="alert">{error}</p>}
            {message && <p role="status" className="rounded-xl bg-[--mint-soft] p-3 text-sm font-semibold text-[--ink]">{message}</p>}
            <button type="submit" disabled={busy} className="btn btn-ink w-full px-5 py-3 font-bold disabled:opacity-50">
              {busy ? (mode === "create" ? "Creating account…" : "Signing in…") : mode === "create" ? "Create account" : "Sign in"}
            </button>
            <button type="button" className="text-sm font-bold underline" disabled={busy || !email.trim()} onClick={async () => {
              setBusy(true); setError("");
              try { await sendPasswordResetEmail(auth, email.trim().toLowerCase()); setMessage("If this address has an account, check your email for recovery instructions."); }
              catch { setError("Could not request password recovery. Please try again."); }
              finally { setBusy(false); }
            }}>Forgot your password?</button>
          </fieldset></form></>}
        </section>
        <p className="mt-5 text-center text-xs text-[--ink-faint]">
          <Link href="/account/orders" className="block mb-3 font-bold text-[--ink] underline">My orders & saved applications</Link>
          Ordering an EdgeTap card? <Link href="/pricing" className="font-bold text-[--ink] underline">Prepare your card and profile</Link>.
        </p>
      </div>
    </main>
  );
}
