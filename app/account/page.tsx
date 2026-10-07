"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "@/lib/auth";
import { NfcWaves } from "@/components/doodles";
import { profileReturnPath } from "@/lib/site";
import { auth } from "@/lib/auth";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setMessage(`Signed in as ${user.email || "your EdgeTap account"}.`);
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      const requestedPath = new URLSearchParams(window.location.search).get("next");
      window.location.assign(profileReturnPath(requestedPath));
    } catch (caught) {
      const code = (caught as { code?: string }).code || "";
      if (["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found", "invalid_credentials"].includes(code)) {
        setError("That email and password do not match an EdgeTap account.");
      } else if (["auth/too-many-requests", "over_request_rate_limit", "over_email_send_rate_limit"].includes(code)) {
        setError("Too many attempts. Wait a moment and try again.");
      } else if (code === "email_not_confirmed") {
        setError("Confirm your email using the signup message before signing in.");
      } else {
        setError("Sign-in is unavailable right now. Please try again or contact EdgeTap.");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setMessage("");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[--cream] px-4 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[--yellow]">
            <NfcWaves className="h-5 w-5 text-[--ink]" />
          </span>
          <span className="font-display text-xl font-bold text-[--ink]">EdgeTap</span>
        </Link>
        <section className="card-paper p-7 sm:p-9">
          <p className="eyebrow text-[--ink-mid]">Customer account</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-[--ink]">Edit your profile</h1>
          <p className="mt-2 text-sm leading-relaxed text-[--ink-soft]">
            Sign in with the account you created during checkout to update your live profile.
          </p>
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
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
                autoComplete="current-password"
                required
                className="mt-1.5 w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-3 text-[--ink] outline-none focus:ring-2 focus:ring-[--ink]"
              />
            </label>
            {error && <p className="rounded-xl bg-[--coral]/10 p-3 text-sm font-semibold text-[--coral]" role="alert">{error}</p>}
            {message && <p className="rounded-xl bg-[--mint-soft] p-3 text-sm font-semibold text-[--ink]">{message}</p>}
            <button type="submit" disabled={busy} className="btn btn-ink w-full px-5 py-3 font-bold disabled:opacity-50">
              {busy ? "Signing in…" : "Sign in"}
            </button>
            <button type="button" className="text-sm font-bold underline" disabled={busy || !email.trim()} onClick={async () => {
              setBusy(true); setError("");
              try { await sendPasswordResetEmail(auth, email.trim().toLowerCase()); setMessage("If this address has an account, check your email for recovery instructions."); }
              catch { setError("Could not request password recovery. Please try again."); }
              finally { setBusy(false); }
            }}>Forgot your password?</button>
          </form>
          <button onClick={handleSignOut} className="mt-4 w-full text-center text-xs font-bold text-[--ink-faint] hover:text-[--ink]">
            Sign out this browser
          </button>
        </section>
        <p className="mt-5 text-center text-xs text-[--ink-faint]">
          Need an account? Start an <Link href="/order" className="font-bold text-[--ink] underline">order</Link> and create one at checkout.
        </p>
      </div>
    </main>
  );
}
