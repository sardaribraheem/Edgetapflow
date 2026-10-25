"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getStaffProfile, saveFounderProfile } from "@/lib/data-service";
import type { User } from "@/lib/auth";
import {notifyProfileChanged} from '@/lib/profile-sync';
import Icon from "@/components/ui/Icon";
import InfoHelp from "@/components/ui/InfoHelp";
import { ibraheemProfile, Profile, ProfileLink } from "@/lib/data/profile";

// The owner explicitly requested restoration of this original founder example.
// Existing service data always takes precedence over the approved original.
export default function ProfilesView({ user }: { user: User }) {
  const operation=useRef(false);
  const [profile, setProfile] = useState<Profile>({ username: "ibraheem", displayName: "", firstName: "", lastName: "", title: "", bio: "", location: "", avatar: "", links: [] });
  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const current = await getStaffProfile("ibraheem");
        if (current) { setProfile(current); setProfileExists(true); }
        else setProfile({...ibraheemProfile, links:ibraheemProfile.links.map(link=>({...link})), active:true});
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "Couldn't load the current profile — the service may be unavailable.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();if(operation.current)return;operation.current=true;
    setSaving(true);
    setMessage("");
    try {
      if (profile.links.length > 10) {
        setMessage("Maximum 10 links allowed.");
        setSaving(false);operation.current=false;
        return;
      }
      const toSave = { ...profile };
      if (!toSave.ownerUid && user) toSave.ownerUid = user.uid;
      const saved=await saveFounderProfile(toSave);
      setProfile(saved);notifyProfileChanged('ibraheem');
      setProfileExists(true);
      setMessage("Profile saved and confirmed ✓");
    } catch (err) {

      setMessage(err instanceof Error ? err.message : "Could not save the profile. Retry or check your staff access.");
    } finally {
      setSaving(false);operation.current=false;
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
          <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Profiles</h1>
          <p className="text-sm text-[var(--ink-soft)]">Your example profile · /u/ibraheem</p>
        </div>
        {profileExists && profile.active !== false && <Link
          href="/u/ibraheem"
          target="_blank"
          className="rounded-xl bg-[var(--yellow-soft)] px-4 py-2 text-[12px] font-bold text-[var(--ink)] hover:bg-[var(--yellow)]"
        >
          <Icon name="eye" size={18}/>View live /u/ibraheem
        </Link>}
      </div>

      {!loading && !loadError && !profileExists && (
        <p role="status" className="mt-4 rounded-xl bg-[var(--yellow-soft)] p-4 text-sm">
          Your owner profile hasn’t been created yet. Your original details are ready to review and publish.
        </p>
      )}

      {message && (
        <div className="card-paper mt-4 border-l-4 border-[var(--mint)] p-4 font-display font-semibold text-[var(--ink)]">{message}</div>
      )}
      {loadError && !message && (
        <div className="card-paper mt-4 border-l-4 border-[var(--coral)] p-4 text-sm text-[var(--coral)]">{loadError}</div>
      )}

      <form onSubmit={handleSave} className="mt-6"><fieldset disabled={saving||loading||!!loadError} className="min-w-0 space-y-6">
        {/* General info */}
        <div className="card-paper p-6">
          <h2 className="mb-4 font-display text-base font-bold text-[var(--ink)]">Profile details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="owner-displayName" className="block text-sm font-semibold text-[var(--ink)]">Display Name</label>
              <input
                type="text"
                id="owner-displayName"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[var(--ink)]/15 bg-white px-4 py-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]"
                required
              />
            </div>
            <div>
              <label htmlFor="owner-title" className="block text-sm font-semibold text-[var(--ink)]">Title / Subtitle</label>
              <input
                type="text"
                id="owner-title"
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[var(--ink)]/15 bg-white px-4 py-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]"
                required
              />
            </div>
            <div>
              <label htmlFor="owner-location" className="block text-sm font-semibold text-[var(--ink)]">Location</label>
              <input
                type="text"
                id="owner-location"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[var(--ink)]/15 bg-white px-4 py-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]"
              />
            </div>
            <div>
              <label htmlFor="owner-username" className="block text-sm font-semibold text-[var(--ink)]">Username (handle)</label>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-sm font-bold text-[var(--ink-faint)]">/u/</span>
                <input
                  type="text"
                  id="owner-username"
                value={profile.username}
                  readOnly
                  className="w-full rounded-xl border border-[var(--ink)]/15 bg-white px-4 py-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]"
                />
              </div>
              <InfoHelp title="Reserved founder handle"><p>The reserved owner handle stays fixed so existing NFC and QR links keep working.</p></InfoHelp>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="owner-avatar" className="block text-sm font-semibold text-[var(--ink)]">Avatar Image URL</label>
              <input
                type="text"
                id="owner-avatar"
                value={profile.avatar}
                onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[var(--ink)]/15 bg-white px-4 py-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="owner-bio" className="block text-sm font-semibold text-[var(--ink)]">Bio</label>
              <textarea
                rows={3}
                id="owner-bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[var(--ink)]/15 bg-white px-4 py-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]"
              />
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="card-paper p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-[var(--ink)]">Manage Links</h2>
              <p className="text-sm text-[var(--ink-soft)]">Up to 10 links</p>
            </div>
            <span className="rounded-full bg-[var(--yellow-soft)] px-3 py-1 text-xs font-bold text-[var(--ink)]">
              {profile.links.length} / 10 Links
            </span>
          </div>

          <div className="space-y-4">
            {profile.links.map((link, index) => (
              <div key={index} className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-[var(--ink)]/10 sm:flex-row sm:items-center">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    aria-label={`Link ${index+1} label`} maxLength={80} placeholder="Label"
                    value={link.label}
                    onChange={(e) => updateLink(index, "label", e.target.value)}
                    className="rounded-xl border border-[var(--ink)]/15 px-3 py-2 text-sm text-[var(--ink)]"
                    required
                  />
                  <input
                    type="text"
                    aria-label={`Link ${index+1} URL`} maxLength={2048} placeholder="URL"
                    value={link.url}
                    onChange={(e) => updateLink(index, "url", e.target.value)}
                    className="flex-1 rounded-xl border border-[var(--ink)]/15 px-3 py-2 text-sm text-[var(--ink)]"
                    required
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <select
                    value={link.type}
                    onChange={(e) => updateLink(index, "type", e.target.value)}
                    className="rounded-xl border border-[var(--ink)]/15 px-3 py-2 text-sm text-[var(--ink)]"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="github">GitHub</option>
                    <option value="portfolio">Portfolio/Website</option>
                    <option value="email">Email</option>
                  </select>
                  <button
                    type="button"
                    aria-label={`Remove link ${index+1}`} title="Remove link" onClick={() => removeLink(index)}
                    className="rounded-xl bg-[var(--coral)]/10 px-3 py-2 text-sm font-semibold text-[var(--coral)] hover:bg-[var(--coral)]/20"
                  >
                    <Icon name="trash" size={18}/>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {profile.links.length < 10 ? (
            <button
              type="button"
              onClick={addLink}
              className="mt-4 w-full rounded-xl border-2 border-dashed border-[var(--ink)]/20 py-3 font-display font-semibold text-[var(--ink)] hover:border-[var(--ink)] hover:bg-white/50"
            >
              + Add link
            </button>
          ) : (
            <p className="mt-4 text-center text-sm font-semibold text-[var(--coral)]">Maximum limit of 10 links reached.</p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4"><label className="flex items-center gap-2 font-bold text-sm"><input type="checkbox" checked={profile.active!==false} onChange={event=>setProfile({...profile,active:event.target.checked})}/>Published</label>
          <button
            type="submit"
            disabled={saving || loading || !!loadError || !profile.displayName.trim()}
            className="rounded-2xl bg-[var(--ink)] px-8 py-3.5 font-display font-bold text-white shadow-[0_6px_0_0_rgba(16,11,74,0.4)] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Icon name="save" size={18}/>{saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </fieldset></form>

      <InfoHelp title="Publishing client profiles" label="Publication help"><p>Client profiles become public through Orders → Publish profile after review and payment verification. A saved draft or submitted order does not publish a profile.</p><p>Handles are reserved atomically so another profile cannot be overwritten.</p></InfoHelp>
    </div>
  );
}
