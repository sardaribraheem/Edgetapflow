"use client";
import { useState } from "react";
import ProfilePage from "@/components/ProfilePage";
import { CARD_TEMPLATES, LINK_PRESETS, LINK_ACCENTS, type CardTemplateId, type CustomerInfo, type DeliveryMethod } from "@/lib/data/order";
import type { Profile, ProfileLink } from "@/lib/data/profile";
import { fileToDataUrl } from "@/lib/upload-service";
import { NfcWaves, SparkleDoodle } from "@/components/doodles";
import { SUPPORT_URL } from '@/lib/site';
import type { WizardDraft } from "@/lib/application";
export function CardStep({
  draft,
  onChange,
  onFileChange,
}: {
  draft: WizardDraft;
  onChange: (p: Partial<WizardDraft>) => void;
  onFileChange: (file: File | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleUpload = async (file: File) => {
    setUploadError("");
    if (!["image/jpeg","image/png","image/webp"].includes(file.type) || file.size > 25*1024*1024) { setUploadError("Use a JPEG, PNG or WebP image within the upload limit."); return; }
    setUploading(true);
    try {
      const preview = await fileToDataUrl(file);
      onFileChange(file);
      onChange({ customDesignPreview: preview, customDesignUrl: "pending" });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Could not read the design image. Choose a supported file and try again.");
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
      <p className="mt-2 text-[15px] text-[--ink-soft]">The design that gets tapped. Every design is printed on a PVC card with embedded NFC, 85.60 × 53.98 mm.</p>

      <div className="mt-4 rounded-xl bg-[--mint-soft]/60 px-4 py-3 text-sm font-bold text-[--ink]">
        Your EdgeTap card · Design selected for review
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARD_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={draft.cardTemplate === t.id}
            onClick={() => onChange({ cardTemplate: t.id })}
            className={`group relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[--ink]/50 ${
              draft.cardTemplate === t.id ? "border-[--ink] bg-[--yellow-soft]/30 shadow-[var(--shadow-card)]" : "border-[--ink]/10 bg-white"
            }`}
          >
            <span className={`relative grid h-32 w-full place-items-center overflow-hidden rounded-md ring-1 ring-[--ink]/10 ${t.tone}`}>
              {(["simple", "lux", "wood", "inverted"] as CardTemplateId[]).includes(t.id) ? (
                <img src={`/card-designs/${t.id}.png`} alt={`${t.name} card design`} className="h-full w-full object-cover" />
              ) : (
                <NfcWaves className={`h-9 w-9 ${t.id === "inverted" ? "text-[--yellow]" : "text-[--ink]"}`} />
              )}
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

      {draft.cardTemplate === "upload" && (
        <div className="mt-6 rounded-2xl bg-[--sky-soft]/40 p-5 ring-1 ring-[--sky]/30">
          <p className="text-sm font-bold text-[--ink]">Upload your own card design</p><p className="mt-2 text-sm">Your original is kept private. Staff will manually prepare the final layout for the standard PVC card size.</p>
          <input aria-label="Card artwork image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} className="mt-3 block w-full text-sm" />
          {uploading && <p className="mt-2 text-sm text-[--ink-soft]">Uploading…</p>}
          {uploadError && <p className="mt-2 text-sm font-semibold text-[--coral]">{uploadError}</p>}
          {draft.customDesignUrl && <p className="mt-2 text-sm font-semibold text-[--ink]">{draft.customDesignUrl === 'pending' ? 'Design upload in progress.' : 'Private artwork uploaded. Wait for the draft save before leaving.'}</p>}
        </div>
      )}

      {draft.cardTemplate === "designer" && (
        <div className="mt-6 rounded-2xl bg-[--mint-soft]/60 p-5">
          <p className="text-sm font-bold text-[--ink]">Need a custom design?</p>
          <p className="mt-1 text-sm text-[--ink-soft]">We&apos;ll contact you about a professional design request and any additional fee before proceeding.</p>
          <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="btn btn-ink mt-4 inline-flex px-4 py-2 text-sm">Request a designer</a>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between rounded-xl bg-white p-4 ring-1 ring-[--ink]/10">
        <span className="text-sm font-bold text-[--ink]">Quantity</span>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => onChange({ quantity: Math.max(1, draft.quantity - 1) })} className="grid h-8 w-8 place-items-center rounded-full bg-[--ink]/8 font-bold">−</button>
          <span className="w-6 text-center font-display font-bold">{draft.quantity}</span>
          <button type="button" onClick={() => onChange({ quantity: Math.min(20, draft.quantity + 1) })} className="grid h-8 w-8 place-items-center rounded-full bg-[--ink] text-white font-bold">+</button>
        </div>
      </div>
    </section>
  );
}

// ── Step 2: Build your profile ───────────────────────────────────
export function ProfileStep({
  draft,
  onChange,
  onFileChange,
}: {
  draft: WizardDraft;
  onChange: (p: Partial<WizardDraft>) => void;
  onFileChange: (file: File | null) => void;
}) {
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleUpload = async (file: File) => {
    setUploadError("");
    setUploading(true);
    onChange({ avatarUploadPending: true });
    try {
      const dataUrl = await fileToDataUrl(file);
      setPreview(dataUrl);
      onFileChange(file);
      onChange({ avatarPreview: dataUrl, avatarUploadPending: false });
    } finally {
      setUploading(false);
      onChange({ avatarUploadPending: false });
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
          <p className="mb-2 text-sm">Avatar images are publicly accessible after upload, even before profile publication. Upload only an image you intend to share.</p><label className="block text-sm font-bold text-[--ink]">Profile picture <span className="font-normal text-[--ink-faint]">(optional)</span></label>
          <div className="mt-3 flex items-center gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-[--yellow] ring-2 ring-white shadow-[var(--shadow-card)]">
              {draft.avatarPreview || draft.avatarUrl || preview ? (
                <img
                  src={draft.avatarPreview || draft.avatarUrl || preview}
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
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              />
            </label>
          </div>
          {uploadError && <p className="mt-2 text-[13px] font-semibold text-[--coral]">{uploadError}</p>}
        </div>

        <div>
          <label htmlFor="ow-name" className="block text-sm font-bold text-[--ink]">
            Name
          </label>
          <input
            id="ow-name"
            maxLength={120}
            type="text"
            value={draft.displayName}
            onChange={(e) => onChange({ displayName: e.target.value })}
            placeholder="Ahmad Khan"
            className="mt-2 w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-3 text-[--ink] focus:outline-none focus:ring-2 focus:ring-[--ink]"
          />
        </div>

        <div>
          <label htmlFor="ow-title" className="block text-sm font-bold text-[--ink]">
            Title <span className="font-normal text-[--ink-faint]">(optional)</span>
          </label>
          <input
            id="ow-title"
            maxLength={160}
            type="text"
            value={draft.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g. Software Developer · Founder"
            className="mt-2 w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-3 text-[--ink] focus:outline-none focus:ring-2 focus:ring-[--ink]"
          />
        </div>

        <div>
          <label htmlFor="ow-bio" className="block text-sm font-bold text-[--ink]">
            Bio <span className="font-normal text-[--ink-faint]">(optional)</span>
          </label>
          <textarea
            id="ow-bio"
            maxLength={2000}
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
export function LinksStep({
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
        url: type === "email" ? "mailto:" : type === "whatsapp" ? "https://wa.me/" : "https://",
        icon: type,
        accent: LINK_ACCENTS[type] || LINK_ACCENTS.globe,
      },
    ]);
  };

  const updateUrl = (index: number, value: string) => {
    const link = links[index];
    let url = value.trim();
    if (link.type === "email" && url && !url.startsWith("mailto:")) url = `mailto:${url}`;
    if (link.type === "whatsapp") {
      const digits = value.replace(/\D/g, "");
      url = digits ? `https://wa.me/${digits}` : "https://wa.me/";
    }
    update(index, "url", url);
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
      Add at least one useful way for people to connect with you. You can add more anytime.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {LINK_PRESETS.map((p) => (
          <button
            key={p.label + p.type + LINK_PRESETS.indexOf(p)}
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
              aria-label={`Link ${i + 1} label`}
              maxLength={80}
              placeholder="Label"
              value={l.label}
              onChange={(e) => update(i, "label", e.target.value)}
              className="rounded-xl border border-[--ink]/15 px-3 py-2 text-sm text-[--ink]"
            />
            <input
              type="text"
              aria-label={`Link ${i + 1} URL`}
              maxLength={2048}
              placeholder={l.type === "email" ? "example@gmail.com" : l.type === "whatsapp" ? "+92 300 1234567" : "URL (https://…)"}
              value={l.type === "email" ? l.url.replace(/^mailto:/, "") : l.type === "whatsapp" ? l.url.replace("https://wa.me/", "") : l.url}
              onChange={(e) => updateUrl(i, e.target.value)}
              className="flex-1 rounded-xl border border-[--ink]/15 px-3 py-2 text-sm text-[--ink]"
            />
            <select
              value={l.type}
              onChange={(e) => update(i, "type", e.target.value)}
              className="rounded-xl border border-[--ink]/15 px-3 py-2 text-sm text-[--ink]"
              aria-label={`Link ${i + 1} type`}
            >
              {[
                ["email", "Email"],
                ["whatsapp", "WhatsApp"],
                ["instagram", "Instagram"],
                ["linkedin", "LinkedIn"],
                ["github", "GitHub"],
                ["portfolio", "Website/Portfolio"],
                ["telegram", "Telegram"],
                ["facebook", "Facebook"],
                ["tiktok", "TikTok"],
                ["youtube", "YouTube"],
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

      {links.length === 0 && <p className="mt-6 text-sm font-semibold text-[--coral]">Add Email to continue.</p>}
      <p className="mt-2 text-[12px] text-[--ink-faint]">{links.length} / 10 links</p>
    </section>
  );
}

// ── Step 4: Preview ──────────────────────────────────────────────
export function PreviewStep({ profile }: { profile: Profile }) {
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
export function DeliveryStep({
  customer,
  deliveryMethod,
  onDeliveryMethodChange,
  onChange,
  pickupDetails,
  deliveryDetails,
}: {
  pickupDetails: string;
  deliveryDetails: string;
  customer: CustomerInfo;
  deliveryMethod: DeliveryMethod;
  onDeliveryMethodChange: (method: DeliveryMethod) => void;
  onChange: (c: CustomerInfo) => void;
}) {
  const FIELDS: { key: keyof CustomerInfo; placeholder: string; type: string; span?: boolean }[] = [
    { key: "fullName", placeholder: "Full name", type: "text" },
    { key: "phone", placeholder: "Phone number", type: "tel" },
    { key: "email", placeholder: "Account email", type: "email" },
    { key: "address", placeholder: "Delivery address", type: "text", span: true },
    { key: "city", placeholder: "Delivery city", type: "text" },
  ];
  return (
    <section className="card-paper mb-6 p-7 sm:p-10">
      <p className="eyebrow mb-1 text-[--ink-mid]">Step 5 · Delivery</p>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight text-[--ink]">
        Where should we send your card?
      </h1>
      <p className="mt-2 text-[15px] text-[--ink-soft]">
        Your address stays private. Delivery charges are calculated separately based on your location.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {([
          ["delivery", "Delivery", deliveryDetails],
          ["nastp_pickup", "NASTP Pickup", pickupDetails],
        ] as const).map(([value, label, description]) => (
          <button type="button" key={value} aria-pressed={deliveryMethod === value} onClick={() => onDeliveryMethodChange(value)} className={`rounded-xl border-2 p-4 text-left transition-colors hover:border-[--ink]/50 ${deliveryMethod === value ? "border-[--ink] bg-[--yellow-soft]/30" : "border-[--ink]/10 bg-white"}`}>
            <span className="flex items-center justify-between font-display font-bold text-[--ink]"><span>{label}</span>{deliveryMethod === value && <span aria-hidden="true">✓</span>}</span>
            <span className="mt-1 block text-[12px] text-[--ink-soft]">{description}</span>
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {FIELDS.filter(({ key }) => deliveryMethod === "delivery" || !["address","city","postalCode"].includes(key)).map(({ key, placeholder, type, span }) => (
          <div key={key} className={span ? "sm:col-span-2" : ""}>
            <label htmlFor={`delivery-${key}`} className="block text-sm font-bold text-[--ink]">{placeholder}</label>
            <input
              id={`delivery-${key}`}
              maxLength={key === "address" ? 1000 : key === "email" ? 254 : key === "phone" ? 30 : 120}
              type={type}
              readOnly={key === "email"}
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
