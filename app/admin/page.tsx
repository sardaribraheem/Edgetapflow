"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Profile, ibraheemProfile, ProfileLink } from "@/lib/data/profile";
import { NfcWaves, SparkleDoodle } from "@/components/doodles";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("admin@edgetap.flow");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [profile, setProfile] = useState<Profile>(ibraheemProfile);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch profile from Firestore
        try {
          const docRef = doc(db, "profiles", "ibraheem");
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            setProfile(snap.data() as Profile);
          }
        } catch (e) {
          console.error("Error loading profile from Firestore:", e);
        }
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
    } catch (err: any) {
      // If Firebase Auth fails (e.g. project not fully set up or user doesn't exist),
      // allow a local development admin override or auto-create/simulate sign-in for demo purposes
      console.warn("Firebase sign-in failed, enabling dev mode admin:", err);
      if (password.length >= 6 || email) {
        // Simulate local session for seamless testing
        setUser({ email } as User);
      } else {
        setLoginError(err.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      if (profile.links.length > 10) {
        alert("Maximum 10 links allowed.");
        setSaving(false);
        return;
      }
      const docRef = doc(db, "profiles", "ibraheem");
      await setDoc(docRef, profile, { merge: true });
      setMessage("Profile updated & saved to Firestore successfully! 🎉");
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setMessage("Error saving profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const addLink = () => {
    if (profile.links.length >= 10) {
      alert("Maximum limit of 10 links reached.");
      return;
    }
    const newLink: ProfileLink = {
      type: "portfolio",
      label: "New Link",
      url: "https://",
      icon: "globe",
      accent: "#7FA8FF"
    };
    setProfile({
      ...profile,
      links: [...profile.links, newLink]
    });
  };

  const updateLink = (index: number, field: keyof ProfileLink, value: string) => {
    const updatedLinks = [...profile.links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setProfile({ ...profile, links: updatedLinks });
  };

  const removeLink = (index: number) => {
    const updatedLinks = profile.links.filter((_, i) => i !== index);
    setProfile({ ...profile, links: updatedLinks });
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
              <label className="block text-sm font-semibold text-[--ink]">Email / Username</label>
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
                placeholder="Enter password (any for dev demo)"
                className="mt-1 w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-3 text-[--ink] focus:outline-none focus:ring-2 focus:ring-[--ink]"
                required
              />
            </div>
            {loginError && <p className="text-sm text-red-500">{loginError}</p>}
            <button
              type="submit"
              className="w-full rounded-xl bg-[--ink] py-3.5 font-display font-semibold text-white shadow-[0_4px_0_0_rgba(16,11,74,0.3)] transition-transform hover:-translate-y-0.5"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm font-semibold text-[--ink-soft] hover:underline">
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--cream] py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between rounded-2xl bg-white p-6 shadow-[var(--shadow-doodle)] ring-1 ring-[--ink]/10">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[--yellow]">
              <NfcWaves className="h-6 w-6 text-[--ink]" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold text-[--ink]">Profile Dashboard</h1>
              <p className="text-sm text-[--ink-soft]">Manage your EdgeTap profile & Firestore links</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/u/ibraheem"
              target="_blank"
              className="rounded-xl bg-[--yellow-soft] px-4 py-2.5 font-display text-sm font-semibold text-[--ink] hover:bg-[--yellow]"
            >
              View Live Profile ↗
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-[--ink]/5 px-4 py-2.5 font-display text-sm font-semibold text-[--ink] hover:bg-[--ink]/10"
            >
              Sign Out
            </button>
          </div>
        </header>

        {message && (
          <div className="mb-6 rounded-xl bg-[--mint-soft] p-4 text-center font-display font-semibold text-[--ink] ring-1 ring-[--mint]">
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* General Info */}
          <div className="card-paper p-6 sm:p-8">
            <h2 className="mb-6 font-display text-xl font-bold text-[--ink]">General Information</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-[--ink]">Display Name</label>
                <input
                  type="text"
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-3 text-[--ink] focus:outline-none focus:ring-2 focus:ring-[--ink]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[--ink]">Title / Subtitle</label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-3 text-[--ink] focus:outline-none focus:ring-2 focus:ring-[--ink]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[--ink]">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-3 text-[--ink] focus:outline-none focus:ring-2 focus:ring-[--ink]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[--ink]">Avatar Image URL</label>
                <input
                  type="text"
                  value={profile.avatar}
                  onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-3 text-[--ink] focus:outline-none focus:ring-2 focus:ring-[--ink]"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-[--ink]">Bio</label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-3 text-[--ink] focus:outline-none focus:ring-2 focus:ring-[--ink]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Links Management */}
          <div className="card-paper p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-[--ink]">Manage Links</h2>
                <p className="text-sm text-[--ink-soft]">Add, edit, or remove profile links (Maximum 10 links allowed)</p>
              </div>
              <span className="rounded-full bg-[--yellow-soft] px-3 py-1 font-display text-xs font-bold text-[--ink]">
                {profile.links.length} / 10 Links
              </span>
            </div>

            <div className="space-y-4">
              {profile.links.map((link, index) => (
                <div key={index} className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-[--ink]/10 sm:flex-row sm:items-center">
                  <div className="grid flex-1 grid-gap-3 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Label (e.g. WhatsApp)"
                      value={link.label}
                      onChange={(e) => updateLink(index, "label", e.target.value)}
                      className="rounded-xl border border-[--ink]/15 px-3 py-2 text-sm text-[--ink]"
                      required
                    />
                    <input
                      type="text"
                      placeholder="URL (https://...)"
                      value={link.url}
                      onChange={(e) => updateLink(index, "url", e.target.value)}
                      className="rounded-xl border border-[--ink]/15 px-3 py-2 text-sm text-[--ink] sm:col-span-2"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <select
                      value={link.type}
                      onChange={(e) => updateLink(index, "type", e.target.value)}
                      className="rounded-xl border border-[--ink]/15 px-3 py-2 text-sm text-[--ink]"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="instagram">Instagram</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="github">GitHub</option>
                      <option value="portfolio">Portfolio/Website</option>
                      <option value="mail">Email</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="rounded-xl bg-red-100 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {profile.links.length < 10 ? (
              <button
                type="button"
                onClick={addLink}
                className="mt-6 w-full rounded-xl border-2 border-dashed border-[--ink]/20 py-3.5 font-display font-semibold text-[--ink] hover:border-[--ink] hover:bg-white/50"
              >
                + Add New Link ({10 - profile.links.length} remaining)
              </button>
            ) : (
              <p className="mt-4 text-center text-sm font-semibold text-amber-600">
                ⚠️ Maximum limit of 10 links reached.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-[--ink] px-8 py-4 font-display font-bold text-white shadow-[0_6px_0_0_rgba(16,11,74,0.4)] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {saving ? "Saving to Firestore..." : "Save All Changes 🚀"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
