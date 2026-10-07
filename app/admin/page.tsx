"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { auth, isStaff } from "@/lib/auth";
import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "@/lib/auth";
import { NfcWaves } from "@/components/doodles";
import AdminApp from "@/components/admin/AdminApp";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setAuthorized(false);
      setUser(currentUser);
      if (currentUser) {
        setLoading(true);
        try {
          const staff = await isStaff();
          if (auth.currentUser?.uid === currentUser.uid) setAuthorized(staff);
        } catch { setLoginError("This account does not have staff access, or access could not be verified."); }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const e = err as { code?: string; message?: string };
      const code = e?.code || "";
      setLoginError(code === "auth/too-many-requests" ? "Too many attempts. Please try again later." : "Sign-in failed. Check your credentials or contact the account owner.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const handlePasswordReset = async () => {
    setLoginError("");
    setResetMessage("");
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setResetMessage("If this address has an account, check your email for reset instructions.");
    } catch (err) {
      void err;
      setLoginError("Could not send password reset instructions. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[--cream] font-display text-xl text-[--ink]">
        Loading EdgeTap Admin...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-[--cream] px-4">
        <div className="card-paper w-full max-w-md p-8 shadow-[var(--shadow-card)]">
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[--yellow]">
              <NfcWaves className="h-5 w-5 text-[--ink]" />
            </span>
            <span className="font-display text-2xl font-bold text-[--ink]">EdgeTap Admin</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-semibold text-[--ink]">Email</label>
              <input
                id="admin-email" type="email" autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-3 text-[--ink] focus:outline-none focus:ring-2 focus:ring-[--ink]"
                required
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-sm font-semibold text-[--ink]">Password</label>
              <input
                id="admin-password" type="password" autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-1 w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-3 text-[--ink] focus:outline-none focus:ring-2 focus:ring-[--ink]"
                required
              />
            </div>
            {loginError && <p className="text-sm text-[--coral]">{loginError}</p>}
            {resetMessage && <p className="rounded-xl bg-[--mint-soft] p-3 text-sm font-semibold text-[--ink]">{resetMessage}</p>}
            <button
              type="submit"
              className="w-full rounded-xl bg-[--ink] py-3.5 font-display font-semibold text-white shadow-[0_4px_0_0_rgba(16,11,74,0.3)] transition-transform hover:-translate-y-0.5"
            >
              Sign In to Dashboard
            </button>
          </form>

          <button onClick={handlePasswordReset} type="button" className="mt-4 w-full text-center text-sm font-semibold text-[--ink-soft] hover:text-[--ink] hover:underline">
            Reset admin password
          </button>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm font-semibold text-[--ink-soft] hover:underline">
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!authorized) return (
    <main className="min-h-screen grid place-items-center p-6">
      <section className="card-paper p-8 text-center">
        <h1 className="font-display text-2xl">Staff access required</h1>
        <p className="mt-4">{loginError || "Your account is not authorized for this dashboard."}</p>
        <button onClick={handleLogout} className="btn btn-ink mt-6 px-6 py-3">Sign out</button>
        <Link href="/" className="block mt-4 underline">Return home</Link>
      </section>
    </main>
  );
  return <AdminApp user={user} onLogout={handleLogout} />;
}