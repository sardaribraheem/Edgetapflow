"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { NfcWaves, SparkleDoodle, StarDoodle } from "@/components/doodles";
import ProfilePage from "@/components/ProfilePage";
import {
  CARD_TEMPLATES,
  CardTemplateId,
  Order,
  CustomerInfo,
  PaymentInfo,
  LINK_PRESETS,
  LINK_ACCENTS,
  FULFILLMENT_STATES,
} from "@/lib/data/order";
import type { Profile, ProfileLink } from "@/lib/data/profile";
import { createOrder } from "@/lib/firestore";
import { uploadCustomDesign, uploadInboxAvatar, fileToDataUrl } from "@/lib/storage";
import { APP_URL } from "@/lib/site";

const STEPS = ["Card", "Profile", "Links", "Preview", "Delivery", "Payment", "Done"];

const PLACEHOLDER_AVATAR = `${APP_URL}/ibraheem.png`;

type WizardDraft = {
  plan: Order["plan"];
  cardTemplate: CardTemplateId;
  customDesignUrl?: string;
  customDesignPreview?: string; // client-side data URL for instant preview
  avatarUrl?: string;
  avatarPreview?: string; // client-side data URL for instant preview
  displayName: string;
  bio: string;
  links: ProfileLink[];
  customer: CustomerInfo;
  payment: PaymentInfo;
};

function blankDraft(): WizardDraft {
  return {
    plan: "standard",
    cardTemplate: "classic",
    displayName: "",
    bio: "",
    links: [],
    customer: { fullName: "", phone: "", email: "", address: "", city: "" },
    payment: { method: "online", status: "pending" },
  };
}

export default function OrderWizard() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<WizardDraft>(blankDraft);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [resubmitKey, setResubmitKey] = useState(0); // bump to retry a failed submit
  // Random inbox token per mount — the storage rule lets anonymous uploads
  // into orderInbox/<this token>/ so anyone can send card artwork.
  const [clientToken] = useState(() => (typeof crypto !== "undefined" ? crypto.randomUUID() : "token"));

  // Seed plan from /order?plan=…  (query read client-side — static-export safe).
  // Deferred so the plan applies after mount without a hydration mismatch.
  useEffect(() => {
    const t = window.setTimeout(() => {
      const plan = new URLSearchParams(window.location.search).get("plan");
      if (plan === "standard" || plan === "business" || plan === "enterprise") {
        setDraft((d) => ({ ...d, plan }));
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const patch = (p: Partial<WizardDraft>) => setDraft((d) => ({ ...d, ...p }));

  // Build the public profile this draft will become (live preview, Step 4).
  const previewProfile = useMemo<Profile>(() => {
    const firstName = draft.customer.fullName.split(" ")[0] || "New";
    const lastName = draft.customer.fullName.split(" ").slice(1).join(" ");
    return {
      username: draft.displayName.toLowerCase().replace(/[^a-z0-9]/g, "") || "yourprofile",
      displayName: draft.displayName || "Your Name",
      firstName,
      lastName,
      title: "EdgeTap Profile",
      bio: draft.bio || "Your short bio will appear here.",
      location: draft.customer.city || "Your city",
      avatar: draft.avatarPreview || draft.avatarUrl || PLACEHOLDER_AVATAR,
      links: draft.links.filter((l) => l.url && l.url.trim() !== "" && l.url !== "https://"),
    };
  }, [draft]);

  const validateStep = (): string => {
    switch (step) {
      case 0:
        if (draft.cardTemplate === "custom" && !draft.customDesignUrl) {
          return "Choose Custom, then upload your card design (or paste an image URL).";
        }
        return "";
      case 1:
        if (!draft.displayName.trim()) return "Please add your name.";
        if (!draft.bio.trim()) return "Please add a short bio.";
        if (!draft.avatarUrl && !draft.avatarPreview) {
          return "Please add a profile picture (upload an image or paste a URL).";
        }
        return "";
      case 4: {
        const c = draft.customer;
        if (!c.fullName.trim()) return "Please add your full name.";
        if (!c.phone.trim()) return "Please add your phone number.";
        if (!/.+@.+\..+/.test(c.email)) return "Please add a valid email.";
        if (!c.address.trim()) return "Please add your delivery address.";
        if (!c.city.trim()) return "Please add your city.";
        return "";
      }
      default:
        return "";
    }
  };

  const next = () => {
    const err = validateStep();
    if (err) return setError(err);
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    setError("");
    const err = validateStep();
    if (err) return setError(err);
    setSubmitting(true);
    try {
      const now = Date.now();
      const order: Order = {
        orderNumber: `ET-${now.toString(36).toUpperCase().slice(-6)}-${new Date().getFullYear()}`,
        plan: draft.plan,
        card: {
          template: draft.cardTemplate,
          quantity: 1,
          customDesignUrl: draft.customDesignUrl,
        },
        profileDraft: {
          avatarUrl: draft.avatarUrl,
          displayName: draft.displayName.trim(),
          bio: draft.bio.trim(),
          links: draft.links.slice(0, 10),
        },
        customer: draft.customer,
        payment:
          draft.payment.method === "cod"
            ? { method: "cod", status: "cod_pending_confirmation" }
            : { method: "online", status: "pending" }, // provider not integrated — honest placeholder
        fulfillment: { status: "new", history: [{ status: "new", at: now }] },
        createdAt: now,
        updatedAt: now,
      };
      const id = await createOrder(order);
      setPlaced({ ...order, id });
    } catch (e) {
      console.error("[EdgeTap] Order submit failed:", e);
      setError(
        e instanceof Error ? e.message : "We couldn't place your order right now. Please try again — if this persists, email support@edgetap.flow."
      );
      setResubmitKey((k) => k + 1);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Done — order confirmation ─────────────────────────────────
  if (placed) {
    return <Confirmation order={placed} />;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-[--cream] px-4 py-24">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute left-1/4 top-16 h-72 w-72 rounded-full bg-[--yellow-soft] opacity-60 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-[--sky-soft] opacity-50 blur-3xl" />
      </div>

      {/* brand */}
      <Link href="/" className="mb-8 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-[var(--shadow-doodle)] ring-1 ring-[--ink]/8">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[--yellow]">
          <NfcWaves className="h-4 w-4 text-[--ink]" />
        </span>
        <span className="font-display text-sm font-bold text-[--ink]">EdgeTap</span>
        <span className="hidden text-[12px] text-[--ink-faint] sm:inline">· Let&apos;s build your EdgeTap</span>
      </Link>

      {/* progress tracker */}
      <ol className="mb-10 flex flex-wrap items-center justify-center gap-2" aria-label="Order progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                i < step
                  ? "bg-[--mint] text-[--ink]"
                  : i === step
                  ? "bg-[--ink] text-white"
                  : "bg-[--ink]/8 text-[--ink-faint]"
              }`}
            >
              {i + 1}. {label}
            </span>
            {i < STEPS.length - 1 && <span className="text-[--ink-faint]">→</span>}
          </li>
        ))}
      </ol>

      <div className="w-full max-w-3xl">
        {error && (
          <div className="mb-6 rounded-2xl border border-[--coral]/40 bg-[--coral]/10 p-4 text-sm font-semibold text-[--ink]" role="alert">
            {error}
          </div>
        )}

        {step === 0 && <CardStep draft={draft} onChange={patch} />}
        {step === 1 && <ProfileStep draft={draft} onChange={patch} clientToken={clientToken} />}
        {step === 2 && <LinksStep links={draft.links} onChange={(links) => patch({ links })} />}
        {step === 3 && <PreviewStep profile={previewProfile} />}
        {step === 4 && <DeliveryStep customer={draft.customer} onChange={(customer) => patch({ customer })} />}
        {step === 5 && <PaymentStep payment={draft.payment} onChange={(payment) => patch({ payment })} />}

        {step === 6 && (
          <SubmitStep
            draft={draft}
            submitting={submitting}
            resubmitKey={resubmitKey}
            onSubmit={handleSubmit}
          />
        )}

        {/* nav */}
        {step < 6 && (
          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              onClick={back}
              className="btn bg-white px-6 py-3 ring-1 ring-[--ink]/15 hover:bg-[--cream]"
            >
              ← Back
            </button>
            <button onClick={next} className="btn btn-ink px-8 py-3 font-bold">
              {step === 5 ? "Place Order →" : "Continue →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step 1: Choose your card ─────────────────────────────────────
function CardStep({
  draft,
  onChange,
}: {
  draft: WizardDraft;
  onChange: (p: Partial<WizardDraft>) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleUpload = async (file: File) => {
    setUploadError("");
    setUploading(true);
    try {
      const preview = await fileToDataUrl(file);
      const url = await uploadCustomDesign(
        typeof crypto !== "undefined" ? crypto.randomUUID() : "draft",
        file
      );
      onChange({ customDesignUrl: url, customDesignPreview: `${preview}::${url}` });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Couldn't upload the design. You can paste an image URL instead.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="card-paper mb-6 p-7 sm:p-10">
      <p className="eyebrow mb-1 text-[--ink-mid]">Step 1 · Card</p>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight text-[--ink]">
        Choose your card
      </h1>
      <p className="mt-2 text-[15px] text-[--ink-soft]">The design that gets tapped. We&apos;ll print it on real NFC material.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {CARD_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange({ cardTemplate: t.id })}
            className={`group relative flex flex-col items-start gap-2 rounded-2xl p-5 text-left ring-2 transition-all hover:-translate-y-0.5 ${
              draft.cardTemplate === t.id ? "ring-[--ink] shadow-[var(--shadow-card)]" : "ring-[--ink]/10"
            }`}
          >
            <span className={`grid h-24 w-full place-items-center rounded-xl ring-1 ring-[--ink]/10 ${t.tone}`}>
              <NfcWaves className={`h-9 w-9 ${t.id === "bold" ? "text-[--yellow]" : "text-[--ink]"}`} />
              <span className="mx-auto -mt-1 block font-display text-[13px] font-bold text-[--ink]">EDGE TAP</span>
            </span>
            <span className="font-display text-lg font-bold text-[--ink]">{t.name}</span>
            <span className="text-[13px] font-medium text-[--ink-soft]">{t.tagline}</span>
            {draft.cardTemplate === t.id && (
              <span className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-[--ink] text-white">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {draft.cardTemplate === "custom" && (
        <div className="mt-6 rounded-2xl bg-[--sky-soft]/40 p-5 ring-1 ring-[--sky]/30">
          <p className="text-sm font-bold text-[--ink]">Upload your own card design (front artwork)</p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            className="mt-3 block w-full text-sm text-[--ink-mid] file:mr-3 file:rounded-full file:border-0 file:bg-[--ink] file:px-4 file:py-2 file:text-[12px] file:font-bold file:text-white"
          />
          {uploading && <p className="mt-2 text-sm text-[--ink-soft]">Uploading…</p>}
          {uploadError && <p className="mt-2 text-sm font-semibold text-[--coral]">{uploadError}</p>}
          {draft.customDesignUrl && (
            <p className="mt-2 text-sm font-semibold text-[--mint]">✓ Design uploaded for production.</p>
          )}
          <input
            type="text"
            placeholder="…or paste an image URL"
            value={draft.customDesignUrl || ""}
            onChange={(e) => onChange({ customDesignUrl: e.target.value })}
            className="mt-3 w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-2.5 text-sm text-[--ink]"
          />
        </div>
      )}
    </section>
  );
}

// ── Step 2: Build your profile ───────────────────────────────────
function ProfileStep({
  draft,
  onChange,
  clientToken,
}: {
  draft: WizardDraft;
  onChange: (p: Partial<WizardDraft>) => void;
  clientToken: string;
}) {
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleUpload = async (file: File) => {
    setUploadError("");
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setPreview(dataUrl);
      let url: string;
      try {
        url = await uploadInboxAvatar(clientToken, file);
      } catch (uploadErr) {
        // Storage may not be configured (billing) — keep the local preview and
        // surface the honest error, but don't block typing a URL.
        const msg = uploadErr instanceof Error ? uploadErr.message : "Upload failed";
        setUploadError(msg + " — you can paste an image URL below instead for now.");
        return;
      }
      onChange({ avatarUrl: url, avatarPreview: dataUrl });
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="card-paper mb-6 p-7 sm:p-10">
      <p className="eyebrow mb-1 text-[--ink-mid]">Step 2 · Profile</p>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight text-[--ink]">
        Let&apos;s build your EdgeTap
      </h1>
      <p className="mt-2 text-[15px] text-[--ink-soft]">
        This is the information people will see when they tap your card.
      </p>

      <div className="mt-8 space-y-6">
        {/* avatar */}
        <div>
          <label className="block text-sm font-bold text-[--ink]">Profile picture</label>
          <div className="mt-3 flex items-center gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-[--yellow] ring-2 ring-white shadow-[var(--shadow-card)]">
              {draft.avatarPreview || preview ? (
                <img
                  src={draft.avatarPreview || preview}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <SparkleDoodle className="h-7 w-7 text-[--ink]" />
              )}
            </div>
            <label className="btn cursor-pointer bg-white px-4 py-2.5 text-[13px] font-bold ring-1 ring-[--ink]/15 hover:bg-[--cream]">
              {uploading ? "Uploading…" : "Upload photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              />
            </label>
          </div>
          {uploadError && <p className="mt-2 text-[13px] font-semibold text-[--coral]">{uploadError}</p>}
          <input
            type="text"
            placeholder="…or paste an image URL"
            value={draft.avatarUrl || ""}
            onChange={(e) => onChange({ avatarUrl: e.target.value })}
            className="mt-3 w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-2.5 text-sm text-[--ink]"
          />
        </div>

        <div>
          <label htmlFor="ow-name" className="block text-sm font-bold text-[--ink]">
            Name
          </label>
          <input
            id="ow-name"
            type="text"
            value={draft.displayName}
            onChange={(e) => onChange({ displayName: e.target.value })}
            placeholder="Ahmad Khan"
            className="mt-2 w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-3 text-[--ink] focus:outline-none focus:ring-2 focus:ring-[--ink]"
          />
        </div>

        <div>
          <label htmlFor="ow-bio" className="block text-sm font-bold text-[--ink]">
            Short bio
          </label>
          <textarea
            id="ow-bio"
            rows={3}
            value={draft.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            placeholder="What should people know about you?"
            className="mt-2 w-full resize-none rounded-xl border border-[--ink]/15 bg-white px-4 py-3 text-[--ink] focus:outline-none focus:ring-2 focus:ring-[--ink]"
          />
        </div>
      </div>
    </section>
  );
}

// ── Step 3: Add links ────────────────────────────────────────────
function LinksStep({
  links,
  onChange,
}: {
  links: ProfileLink[];
  onChange: (links: ProfileLink[]) => void;
}) {
  const addLink = (preset?: { type: string; label: string }) => {
    if (links.length >= 10) return;
    const type = preset?.type || "portfolio";
    onChange([
      ...links,
      {
        type,
        label: preset?.label || "New Link",
        url: type === "mail" ? "mailto:" : "https://",
        icon: type,
        accent: LINK_ACCENTS[type] || LINK_ACCENTS.globe,
      },
    ]);
  };

  const update = (index: number, field: keyof ProfileLink, value: string) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <section className="card-paper mb-6 p-7 sm:p-10">
      <p className="eyebrow mb-1 text-[--ink-mid]">Step 3 · Links</p>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight text-[--ink]">
        What do you want people to find?
      </h1>
      <p className="mt-2 text-[15px] text-[--ink-soft]">
        Optional — you can change these anytime later. The card never changes.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {LINK_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => addLink(p)}
            className="rounded-full bg-[--yellow-soft] px-3 py-1.5 text-[12px] font-bold text-[--ink] ring-1 ring-[--ink]/10 hover:bg-[--yellow]"
          >
            + {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => addLink()}
          className="rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-[--ink] ring-1 ring-[--ink]/15 hover:bg-[--cream]"
        >
          + Custom
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {links.map((l, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-[--ink]/10 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Label"
              value={l.label}
              onChange={(e) => update(i, "label", e.target.value)}
              className="rounded-xl border border-[--ink]/15 px-3 py-2 text-sm text-[--ink]"
            />
            <input
              type="text"
              placeholder="URL (https://…)"
              value={l.url}
              onChange={(e) => update(i, "url", e.target.value)}
              className="flex-1 rounded-xl border border-[--ink]/15 px-3 py-2 text-sm text-[--ink]"
            />
            <select
              value={l.type}
              onChange={(e) => update(i, "type", e.target.value)}
              className="rounded-xl border border-[--ink]/15 px-3 py-2 text-sm text-[--ink]"
              aria-label={`Link ${i + 1} type`}
            >
              {[
                ["whatsapp", "WhatsApp"],
                ["instagram", "Instagram"],
                ["linkedin", "LinkedIn"],
                ["github", "GitHub"],
                ["portfolio", "Website/Portfolio"],
                ["mail", "Email"],
                ["phone", "Phone"],
              ].map(([val, lab]) => (
                <option key={val} value={val}>{lab}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onChange(links.filter((_, j) => j !== i))}
              className="rounded-xl bg-red-100 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-200"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {links.length === 0 && (
        <p className="mt-6 text-sm font-semibold text-[--ink-soft]">
          No links yet — that&apos;s fine, you can skip this step.
        </p>
      )}
      <p className="mt-2 text-[12px] text-[--ink-faint]">{links.length} / 10 links</p>
    </section>
  );
}

// ── Step 4: Preview ──────────────────────────────────────────────
function PreviewStep({ profile }: { profile: Profile }) {
  return (
    <section className="mb-6">
      <p className="eyebrow mb-2 text-[--ink-mid]">Step 4 · Preview</p>
      <h1 className="mb-4 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight text-[--ink]">
        This is what people see when they tap
      </h1>
      <ProfilePage initialProfile={profile} previewOnly />
    </section>
  );
}

// ── Step 5: Delivery ─────────────────────────────────────────────
function DeliveryStep({
  customer,
  onChange,
}: {
  customer: CustomerInfo;
  onChange: (c: CustomerInfo) => void;
}) {
  const FIELDS: { key: keyof CustomerInfo; placeholder: string; type: string; span?: boolean }[] = [
    { key: "fullName", placeholder: "Full name", type: "text" },
    { key: "phone", placeholder: "Phone number", type: "tel" },
    { key: "email", placeholder: "Email (for order updates)", type: "email" },
    { key: "city", placeholder: "City", type: "text" },
    { key: "address", placeholder: "Delivery address", type: "text", span: true },
    { key: "postalCode", placeholder: "Postal / ZIP code (optional)", type: "text" },
  ];
  return (
    <section className="card-paper mb-6 p-7 sm:p-10">
      <p className="eyebrow mb-1 text-[--ink-mid]">Step 5 · Delivery</p>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight text-[--ink]">
        Where should we send your card?
      </h1>
      <p className="mt-2 text-[15px] text-[--ink-soft]">
        This stays private. It will <strong>never</strong> appear on your public profile.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {FIELDS.map(({ key, placeholder, type, span }) => (
          <div key={key} className={span ? "sm:col-span-2" : ""}>
            <label className="block text-sm font-bold text-[--ink]">{placeholder}</label>
            <input
              type={type}
              value={customer[key] || ""}
              onChange={(e) => onChange({ ...customer, [key]: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-3 text-[--ink] focus:outline-none focus:ring-2 focus:ring-[--ink]"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Step 6: Payment ──────────────────────────────────────────────
function PaymentStep({
  payment,
  onChange,
}: {
  payment: PaymentInfo;
  onChange: (p: PaymentInfo) => void;
}) {
  return (
    <section className="card-paper mb-6 p-7 sm:p-10">
      <p className="eyebrow mb-1 text-[--ink-mid]">Step 6 · Payment</p>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight text-[--ink]">
        How would you like to pay?
      </h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChange({ method: "online", status: "pending" })}
          className={`rounded-2xl p-5 text-left ring-2 transition-all hover:-translate-y-0.5 ${
            payment.method === "online" ? "ring-[--ink] shadow-[var(--shadow-card)]" : "ring-[--ink]/10"
          }`}
        >
          <span className="font-display text-lg font-bold text-[--ink]">Online Payment</span>
          <p className="mt-1 text-sm text-[--ink-soft]">
            Pay by card or wallet. We&apos;re enabling online payments — for now, choosing this
            marks your order as pending payment confirmation.
          </p>
        </button>
        <button
          type="button"
          onClick={() => onChange({ method: "cod", status: "cod_pending_confirmation" })}
          className={`rounded-2xl p-5 text-left ring-2 transition-all hover:-translate-y-0.5 ${
            payment.method === "cod" ? "ring-[--ink] shadow-[var(--shadow-card)]" : "ring-[--ink]/10"
          }`}
        >
          <span className="font-display text-lg font-bold text-[--ink]">Cash on Delivery</span>
          <p className="mt-1 text-sm text-[--ink-soft]">
            Pay when your card arrives. Order may require confirmation before production.
          </p>
        </button>
      </div>
      <p className="mt-4 rounded-xl bg-[--mint-soft]/60 p-3 text-[13px] text-[--ink]">
        🔒 We never store card details here, and your payment method is kept private.
      </p>
    </section>
  );
}

// ── Step 7: Submit ───────────────────────────────────────────────
function SubmitStep({
  draft,
  submitting,
  resubmitKey,
  onSubmit,
}: {
  draft: WizardDraft;
  submitting: boolean;
  resubmitKey: number;
  onSubmit: () => void;
}) {
  return (
    <section className="card-paper mb-6 p-7 sm:p-10 text-center">
      <p className="eyebrow mb-1 text-[--ink-mid]">Final step</p>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight text-[--ink]">
        {submitting ? "Placing your order…" : "Ready to tap in."}
      </h1>
      <p className="mx-auto mt-2 max-w-md text-[15px] text-[--ink-soft]">
        {draft.displayName || "Your profile"} · {CARD_TEMPLATES.find((t) => t.id === draft.cardTemplate)?.name} card ·{" "}
        {draft.payment.method === "cod" ? "Cash on Delivery" : "Online payment (pending)"}
      </p>
      <button
        onClick={onSubmit}
        disabled={submitting}
        className="btn btn-ink mt-6 px-10 py-4 font-display text-base font-bold disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Place Order 🚀"}
      </button>
      {resubmitKey > 0 && !submitting && (
        <p className="mt-3 text-[12px] text-[--ink-faint]">
          A previous attempt failed — you can retry above, or email support@edgetap.flow.
        </p>
      )}
      <div className="mx-auto mt-8 max-w-md">
        <p className="text-[12px] font-bold uppercase tracking-widest text-[--ink-faint]">Progress</p>
        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          {FULFILLMENT_STATES.slice(0, 3).map((s) => (
            <span key={s.status} className="rounded-full bg-[--ink]/6 px-2.5 py-1 text-[11px] font-semibold text-[--ink-soft]">
              {s.status === "new" ? "✓ Order received" : s.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Confirmation ─────────────────────────────────────────────────
function Confirmation({ order }: { order: Order }) {
  const template = CARD_TEMPLATES.find((t) => t.id === order.card.template);
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[--cream] px-4 py-16">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute left-1/4 top-16 h-72 w-72 rounded-full bg-[--mint-soft] opacity-60 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-[--yellow-soft] opacity-50 blur-3xl" />
      </div>
      <div className="relative w-full max-w-2xl">
        <div className="card-paper p-8 sm:p-12 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[--mint]">
            <StarDoodle className="h-8 w-8 text-[--ink]" />
          </span>
          <h1 className="mt-5 font-display text-[clamp(2rem,5vw,3rem)] font-bold text-[--ink]">
            Order received!
          </h1>
          <p className="mt-2 text-[15px] text-[--ink-soft]">
            Thank you, {order.customer.fullName.split(" ")[0]}. We&apos;ll email updates to{" "}
            <strong className="text-[--ink]">{order.customer.email}</strong>.
          </p>

          <dl className="mx-auto mt-8 max-w-md space-y-3 rounded-2xl bg-white p-6 text-left ring-1 ring-[--ink]/10">
            <div className="flex justify-between gap-4">
              <dt className="text-sm font-semibold text-[--ink-soft]">Order number</dt>
              <dd className="font-display font-bold text-[--ink]">{order.orderNumber}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-sm font-semibold text-[--ink-soft]">Card</dt>
              <dd className="font-display font-bold text-[--ink]">{template?.name} × {order.card.quantity}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-sm font-semibold text-[--ink-soft]">Payment</dt>
              <dd className="font-display font-bold text-[--ink]">
                {order.payment.method === "cod"
                  ? "Cash on Delivery"
                  : `Online · ${order.payment.status === "paid" ? "Paid" : "Payment pending"}`}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-sm font-semibold text-[--ink-soft]">Status</dt>
              <dd className="font-display font-bold text-[--ink]">Order received</dd>
            </div>
          </dl>

          <div className="mt-8">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[--ink-faint]">
              What happens next
            </p>
            <div className="mx-auto mt-3 flex flex-wrap items-center justify-center gap-2">
              {["Order received", "Design prep", "Production", "Shipped", "Delivered"].map((s, i) => (
                <span key={s} className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                      i === 0 ? "bg-[--mint] text-[--ink]" : "bg-[--ink]/6 text-[--ink-faint]"
                    }`}
                  >
                    {s}
                  </span>
                  {i < 4 && <span className="text-[--ink-faint]">→</span>}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/" className="btn btn-ink px-6 py-3">
              Back to Homepage
            </Link>
            <Link href="/" className="btn bg-white px-6 py-3 ring-1 ring-[--ink]/15 hover:bg-[--cream]">
              See how it works →
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[--ink-faint]">
            <NfcWaves className="h-4 w-4 text-[--yellow]" />
            Powered by EdgeTap · One tap. Infinite possibilities.
          </div>
        </div>
      </div>
    </div>
  );
}