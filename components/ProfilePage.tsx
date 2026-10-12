"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ibraheemProfile, Profile } from "@/lib/data/profile";
import { saveProfile, canEditProfile } from "@/lib/data-service";
import { isSafeContactUrl } from "@/lib/links";
import { contactVCard } from "@/lib/contact";
import { auth } from "@/lib/auth";
import { onAuthStateChanged, User } from "@/lib/auth";
import DoodleField from "./DoodleField";
import {
  NfcWaves,
  InstagramIcon,
  WhatsAppIcon,
  LinkedInIcon,
  GlobeIcon,
  GitHubIcon,
  MailIcon,
  SaveIcon,
  SparkleDoodle,
  ArrowDoodle,
  QrDoodle,
  StarDoodle,
  ReviewStars,
} from "./doodles";

const iconFor = (type: string, className: string) => {
  switch (type) {
    case "instagram":
      return <InstagramIcon className={className} />;
    case "whatsapp":
      return <WhatsAppIcon className={className} />;
    case "linkedin":
      return <LinkedInIcon className={className} />;
    case "portfolio":
      return <GlobeIcon className={className} />;
    case "github":
      return <GitHubIcon className={className} />;
    case "mail":
      return <MailIcon className={className} />;
    default:
      return <GlobeIcon className={className} />;
  }
};

// The profile page, framed like the EdgeTap home page: cream paper,
// floating doodles, display type. Mobile-first card that opens into
// a two-column "business card" on desktop.
export default function ProfilePage({
  initialProfile = ibraheemProfile,
  previewOnly = false,
}: {
  initialProfile?: Profile;
  previewOnly?: boolean;
}) {
  const [savedProfile, setProfile] = useState<Profile>(initialProfile);
  const profile = previewOnly ? initialProfile : savedProfile;
  const [user, setUser] = useState<User | null>(null);
  const [ownerAccess, setOwnerAccess] = useState(false);
  const isOwner = !previewOnly && !!user && ownerAccess;
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (previewOnly) return;
    let active = true;
    let generation = 0;
    const stop = onAuthStateChanged(auth, async current => {
      const request = ++generation;
      setUser(current);
      setOwnerAccess(false);
      if (!current) return;
      try {
        const allowed = await canEditProfile(initialProfile);
        if (active && request === generation) setOwnerAccess(allowed);
      } catch { if (active && request === generation) setOwnerAccess(false); }
    });
    return () => { active = false; stop(); };
  }, [previewOnly, initialProfile]);

  const downloadContact = () => {
    const url = URL.createObjectURL(new Blob([contactVCard(profile)], { type: "text/vcard;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${profile.username}.vcf`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!isOwner) throw new Error("Sign in as the profile owner.");
      if (!profile.displayName.trim() || profile.links.length > 10 || profile.links.some((l) => !isSafeContactUrl(l.url))) {
        setMessage("Add a name and valid contact URLs, with no more than ten links.");
        return;
      }
      await saveProfile(profile.username, profile);
      setMessage("Profile updated.");
    } catch {
      setMessage("Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-start overflow-y-auto py-12">
      {/* soft washes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute left-1/4 top-16 h-72 w-72 rounded-full bg-[var(--yellow-soft)] opacity-60 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-[var(--sky-soft)] opacity-50 blur-3xl" />
        <div className="absolute -left-16 top-1/2 h-72 w-72 rounded-full bg-[var(--coral-soft)] opacity-40 blur-3xl" />
      </div>

      {/* floating doodles around the card (desktop) */}
      <DoodleField parallax={-40} className="hidden md:block pointer-events-none">
        <QrDoodle className="absolute left-[6%] top-[18%] h-14 w-14 rotate-[-8deg] text-[var(--ink)] animate-float-slow" />
        <StarDoodle className="absolute right-[7%] top-[16%] h-8 w-8 text-[var(--sky)] animate-wobble" />
        <ReviewStars className="absolute bottom-[16%] left-[10%] w-24 rotate-[-4deg] text-[var(--yellow)] animate-float" />
        <ArrowDoodle className="absolute bottom-[20%] right-[12%] h-10 w-10 rotate-[12deg] text-[var(--ink-mid)] animate-float-slow" />
        <SparkleDoodle className="absolute right-[30%] top-[12%] h-8 w-8 text-[var(--yellow)] animate-pulse-soft" />
        <SparkleDoodle className="absolute left-[28%] top-[78%] h-7 w-7 text-[var(--coral)] animate-pulse-soft" />
      </DoodleField>

      <main className="container-x relative mx-auto w-full max-w-5xl py-6 my-auto">
        {/* edge badge — pill back to home */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 self-start rounded-full bg-white px-3 py-2 shadow-[var(--shadow-doodle)] ring-1 ring-[var(--ink)]/8 transition-transform hover:-translate-y-0.5"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--yellow)]">
            <NfcWaves className="h-4 w-4 text-[var(--ink)]" />
          </span>
          <span className="font-display text-sm font-bold text-[var(--ink)]">EdgeTap</span>
          <span className="hidden text-[13px] text-[var(--ink-faint)] sm:inline">→ Home</span>
        </Link>

        {/* the card */}
        <div className="card-paper relative overflow-hidden">
          <SparkleDoodle className="absolute -right-2 -top-2 h-10 w-10 text-[var(--yellow)] md:hidden" aria-hidden="true" />

          <div className="grid gap-8 p-7 sm:p-10 md:grid-cols-[1fr_1.15fr] md:gap-10 md:p-12">
            {/* identity */}
            <header className="flex flex-col items-center text-center md:items-start md:text-left">
              <div className="relative">
                <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-[var(--yellow)] ring-4 ring-white shadow-[var(--shadow-card)] md:h-32 md:w-32">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={`${profile.displayName} — profile photo`}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <SparkleDoodle className="h-8 w-8 text-[var(--ink)]" />
                  )}
                </div>
                <SparkleDoodle className="absolute -right-3 -top-2 h-8 w-8 text-[var(--yellow)]" />
              </div>

              <h1 className="mt-5 font-display text-[clamp(2rem,5vw,3rem)] font-semibold leading-none text-[var(--ink)]">
                {isOwner ? (
                  <input
                    type="text"
                    aria-label="Display name"
                    value={profile.displayName}
                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                    className="w-full bg-transparent border-b-2 border-[var(--ink)]/20 focus:border-[var(--ink)] outline-none text-center md:text-left"
                  />
                ) : (
                  profile.displayName
                )}
              </h1>
              <p className="mt-2 text-[16px] font-medium text-[var(--ink-soft)]">
                {isOwner ? (
                  <input
                    type="text"
                    aria-label="Professional title"
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    className="w-full bg-transparent border-b-2 border-[var(--ink)]/20 focus:border-[var(--ink)] outline-none text-center md:text-left"
                  />
                ) : (
                  profile.title
                )}
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--ink)]/5 px-3 py-1 text-[13px] text-[var(--ink-mid)] ring-1 ring-[var(--ink)]/8">
                📍 {isOwner ? (
                  <input
                    type="text"
                    aria-label="Location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="bg-transparent border-b border-[var(--ink)]/20 focus:border-[var(--ink)] outline-none w-24"
                  />
                ) : (
                  profile.location
                )}
              </span>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[var(--ink-soft)]">
                {isOwner ? (
                  <textarea
                    aria-label="Bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full bg-transparent border-b-2 border-[var(--ink)]/20 focus:border-[var(--ink)] outline-none resize-none"
                    rows={3}
                  />
                ) : (
                  profile.bio
                )}
              </p>

            </header>

            {/* actions */}
            <section className="flex flex-col gap-2.5 pt-1" aria-label="Contact actions">
              <div className="eyebrow mb-1 text-[var(--ink-mid)]">Reach me</div>
              {profile.links.filter(l => isSafeContactUrl(l.url)).map((l) => (
                <a
                  key={l.type + l.url}
                  href={l.url}
                  target={/^https?:\/\//i.test(l.url) ? "_blank" : undefined}
                  rel={/^https?:\/\//i.test(l.url) ? "noreferrer" : undefined}
                  className="group flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 ring-1 ring-[var(--ink)]/8 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--ink)]/5 text-[var(--ink)] ring-1 ring-[var(--ink)]/10 transition-colors group-hover:bg-[var(--ink)] group-hover:text-[var(--cream)]">
                    {iconFor(l.type, "h-5 w-5")}
                  </span>
                  <span className="flex-1 font-display text-[16px] font-semibold text-[var(--ink)]">
                    {l.label}
                  </span>
                  <span className="text-[16px] text-[var(--ink-faint)] transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </a>
              ))}

              {isOwner && (
                <div className="space-y-3 rounded-xl bg-white p-4">
                  <p className="font-bold text-sm">Edit contact links ({profile.links.length}/10)</p>
                  {profile.links.map((link, index) => (
                    <div key={index} className="space-y-2 border-b pb-3">
                      <label className="block text-sm">Link label
                        <input aria-label={`Link ${index + 1} label`} value={link.label} maxLength={80} className="w-full rounded border p-2" onChange={(e) => setProfile({ ...profile, links: profile.links.map((item, i) => i === index ? { ...item, label: e.target.value } : item) })} />
                      </label>
                      <label className="block text-sm">Contact URL
                        <input aria-label={`Link ${index + 1} URL`} value={link.url} maxLength={2048} className="w-full rounded border p-2" onChange={(e) => setProfile({ ...profile, links: profile.links.map((item, i) => i === index ? { ...item, url: e.target.value } : item) })} />
                      </label>
                      <button type="button" className="min-h-11 text-sm underline" onClick={() => setProfile({ ...profile, links: profile.links.filter((_, i) => i !== index) })}>Remove link {index + 1}</button>
                    </div>
                  ))}
                  <button type="button" disabled={profile.links.length >= 10} className="btn btn-ghost min-h-11 px-4 disabled:opacity-50" onClick={() => setProfile({ ...profile, links: [...profile.links, { type: "website", label: "Website", url: "", icon: "globe", accent: "#7FA8FF" }] })}>Add link</button>
                </div>
              )}
              {message && <p role="status" className="text-sm">{message}</p>}
              {/* save contact */}
              <button
                type="button"
                onClick={downloadContact}
                className="group mt-1 flex items-center gap-3 rounded-2xl bg-[var(--ink)] px-4 py-3.5 text-white shadow-[0_6px_0_-3px_rgba(16,11,74,0.35)] transition-transform hover:-translate-y-0.5"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--yellow)] text-[var(--ink)]">
                  <SaveIcon className="h-5 w-5" />
                </span>
                <span className="flex-1 font-display text-[16px] font-semibold">Save Contact</span>
                <span className="text-[16px] text-white/60 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-faint)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--mint)]" />
                u/{profile.username} · One tap. Infinite possibilities.
              </div>
            </section>
          </div>

          {/* foot bar (hidden in preview mode — the /order shell provides Edit/Continue) */}
          <footer className={`flex items-center justify-between gap-3 border-t border-[var(--ink)]/8 bg-[var(--paper-2)]/60 px-7 py-4 sm:px-10 md:px-12 ${previewOnly ? "hidden" : ""}`}>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-faint)]">
              <NfcWaves className="h-4 w-4 text-[var(--yellow)]" />
              Powered by EdgeTap
            </div>
            <div className="flex items-center gap-3">
              {isOwner ? (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn bg-[var(--mint)] px-4 py-2 text-[12px] font-bold text-[var(--ink)] hover:bg-[var(--mint-soft)] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes 💾"}
                </button>
              ) : (
                <Link
                  href={user ? "/account" : `/account?next=${encodeURIComponent(`/u/${profile.username}`)}`}
                  className="btn bg-white px-4 py-2 text-[12px] font-bold text-[var(--ink)] ring-1 ring-[var(--ink)]/15 hover:bg-[var(--cream)]"
                >
                  {user ? "My account" : "Sign in to edit"}
                </Link>
              )}
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
