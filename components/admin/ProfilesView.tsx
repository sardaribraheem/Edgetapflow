"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { Profile, ibraheemProfile, ProfileLink } from "@/lib/data/profile";

// Editors the owner's own profile (the ibraheem seed) — same save/link logic
// as the old /admin editor, kept in the shell under "Profiles".
export default function ProfilesView({ user }: { user: User }) {
  const [profile, setProfile] = useState<Profile>(ibraheemProfile);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "profiles", "ibraheem"));
        if (snap.exists()) setProfile(snap.data() as Profile);
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "Couldn't load the current profile — Firestore may not be live yet.");
      }
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      if (profile.links.length > 10) {
        setMessage("Maximum 10 links allowed.");
        setSaving(false);
        return;
      }
      const toSave = { ...profile };
      if (!toSave.ownerUid && user) toSave.ownerUid = user.uid;
      await setDoc(doc(db, "profiles", "ibraheem"), toSave, { merge: true });
      setMessage("Profile saved to Firestore ✓");
    } catch (err) {
      console.error("Error saving profile:", err);
      setMessage("Error saving profile: " + (err instanceof Error ? err.message : "unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const addLink = () => {
    if (profile.links.length >= 10) return;
    const newLink: ProfileLink = { type: "portfolio", label: "New Link", url: "https://", icon: "globe", accent: "#7FA8FF" };
    setProfile({ ...profile, links: [...profile.links, newLink] });
  };

  const updateLink = (index: number, field: keyof ProfileLink, value: string) => {
    const updatedLinks = [...profile.links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setProfile({ ...profile, links: updatedLinks });
  };

  const removeLink = (index: number) => {
    setProfile({ ...profile, links: profile.links.filter((_, i) => i !== index) });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-[--ink]">Profiles</h1>
          <p className="text-sm text-[--ink-soft]">Edit the owner profile. Client profiles are created from orders under Orders.</p>
        </div>
        <Link
          href="/u/ibraheem"
          target="_blank"
          className="rounded-xl bg-[--yellow-soft] px-4 py-2 text-[12px] font-bold text-[--ink] hover:bg-[--yellow]"
        >
          View live /u/ibraheem ↗
        </Link>
      </div>

      {message && (
        <div className="card-paper mt-4 border-l-4 border-[--mint] p-4 font-display font-semibold text-[--ink]">{message}</div>
      )}
      {loadError && !message && (
        <div className="card-paper mt-4 border-l-4 border-[--coral] p-4 text-sm text-[--coral]">{loadError}</div>
      )}

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        {/* General info */}
        <div className="card-paper p-6">
          <h2 className="mb-4 font-display text-base font-bold text-[--ink]">General Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
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
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[--ink]">Username (handle)</label>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-sm font-bold text-[--ink-faint]">/u/</span>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  className="w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-3 text-[--ink] focus:outline-none focus:ring-2 focus:ring-[--ink]"
                />
              </div>
              <p className="mt-1 text-[11px] text-[--ink-faint]">Public handle — rename here if the profile needs a new /u/ URL.</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[--ink]">Avatar Image URL</label>
              <input
                type="text"
                value={profile.avatar}
                onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-3 text-[--ink] focus:outline-none focus:ring-2 focus:ring-[--ink]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[--ink]">Bio</label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-3 text-[--ink] focus:outline-none focus:ring-2 focus:ring-[--ink]"
              />
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="card-paper p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-[--ink]">Manage Links</h2>
              <p className="text-sm text-[--ink-soft]">Add, edit, or remove profile links (max 10)</p>
            </div>
            <span className="rounded-full bg-[--yellow-soft] px-3 py-1 text-xs font-bold text-[--ink]">
              {profile.links.length} / 10 Links
            </span>
          </div>

          <div className="space-y-4">
            {profile.links.map((link, index) => (
              <div key={index} className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-[--ink]/10 sm:flex-row sm:items-center">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row">
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
                    className="flex-1 rounded-xl border border-[--ink]/15 px-3 py-2 text-sm text-[--ink]"
                    required
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
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
                    className="rounded-xl bg-[--coral]/10 px-3 py-2 text-sm font-semibold text-[--coral] hover:bg-[--coral]/20"
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
              className="mt-4 w-full rounded-xl border-2 border-dashed border-[--ink]/20 py-3 font-display font-semibold text-[--ink] hover:border-[--ink] hover:bg-white/50"
            >
              + Add New Link ({10 - profile.links.length} remaining)
            </button>
          ) : (
            <p className="mt-4 text-center text-sm font-semibold text-[--coral]">Maximum limit of 10 links reached.</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-[--ink] px-8 py-3.5 font-display font-bold text-white shadow-[0_6px_0_0_rgba(16,11,74,0.4)] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {saving ? "Saving to Firestore..." : "Save All Changes"}
          </button>
        </div>
      </form>

      <p className="mt-4 text-[12px] text-[--ink-faint]">
        Tip: client profiles are auto-created from orders (Orders → Create Client Profile) and stay editable by the customer through their /u/ link.
      </p>
    </div>
  );
}