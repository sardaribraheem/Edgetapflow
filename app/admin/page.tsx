"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { NfcWaves } from "@/components/doodles";
import AdminApp from "@/components/admin/AdminApp";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("sardaribraheem277@gmail.com");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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
      if (code === "auth/configuration-not-found" || code === "auth/api-key-not-valid.-please-pass-a-valid-api-key.") {
        setLoginError(
          "Firebase Auth is not configured for this project. Enable Email/Password sign-in in the Firebase Console (Authentication → Get Started → Email/Password)."
        );
      } else if (code === "auth/user-not-found") {
        setLoginError("No account found with this email. Create the owner account in Firebase Console → Authentication → Users → Add User.");
      } else if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setLoginError("Incorrect password. Please try again.");
      } else {
        setLoginError(e.message || "Login failed — check Firebase Auth configuration.");
      }
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
      setResetMessage("Password reset instructions sent. Check your email.");
    } catch (err) {
      const e = err as { message?: string };
      setLoginError(e.message || "Could not send password reset instructions.");
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
              <label className="block text-sm font-semibold text-[--ink]">Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-3 text-[--ink] focus:outline-none focus:ring-2 focus:ring-[--ink]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[--ink]">Password</label>
              <input
                type="password"
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

  return <AdminApp user={user} onLogout={handleLogout} />;
}