"use client";
import { useState } from "react";
import ProfilePage from "@/components/ProfilePage";
import { CARD_TEMPLATES, LINK_PRESETS, LINK_ACCENTS, calculateSubtotal, type CardTemplateId, type CustomerInfo, type DeliveryMethod } from "@/lib/data/order";
import type { Profile, ProfileLink } from "@/lib/data/profile";
import { fileToDataUrl } from "@/lib/upload-service";
import { NfcWaves } from "@/components/doodles";
import Icon from "@/components/ui/Icon";
import InfoHelp from "@/components/ui/InfoHelp";
import DefaultAvatar from "@/components/ui/DefaultAvatar";
import { SUPPORT_URL } from '@/lib/site';
import type { WizardDraft } from "@/lib/application";
export function CardStep({
  draft,
  onChange,
  onFileChange,
  localOnly = false,
}: {
  draft: WizardDraft;
  onChange: (p: Partial<WizardDraft>) => void;
  onFileChange: (file: File | null) => Promise<void> | void;
  localOnly?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleUpload = async (file: File) => {
    setUploadError("");
    if (!["image/jpeg","image/png","image/webp"].includes(file.type) || file.size <= 0 || file.size > 25*1024*1024) { setUploadError("Use a JPEG, PNG or WebP image within the upload limit."); return; }
    setUploading(true);
    try {
      const preview = await fileToDataUrl(file);
      onChange({ customDesignPreview: preview, customDesignUrl: "pending" });
      await onFileChange(file);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Could not read the design image. Choose a supported file and try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="card-paper mb-6 p-7 sm:p-10">
      <p className="eyebrow mb-1 text-[var(--ink-mid)]">Step 1 · Card</p>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight text-[var(--ink)]">
        Choose your card
      </h1>
      <div className="order-spec-line">
        <span><Icon name="card" size={18} />PVC · NFC + QR</span>
        <InfoHelp title="Card specifications"><p>85.60 × 53.98 mm. Every design has embedded NFC and a QR fallback. Wood is a printed design on PVC.</p><p>For your own artwork, EdgeTap staff manually prepares the layout for this card size. Your original upload is preserved privately; uploading artwork does not choose a different physical size.</p></InfoHelp>
      </div>

      <div className="card-design-grid mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {CARD_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={draft.cardTemplate === t.id}
            onClick={() => onChange({ cardTemplate: t.id })}
            className={`group relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--ink)]/50 ${
              draft.cardTemplate === t.id ? "border-[var(--ink)] bg-[var(--yellow-soft)]/30 shadow-[var(--shadow-card)]" : "border-[var(--ink)]/10 bg-white"
            }`}
          >
            <span className={`relative grid aspect-[1.586] w-full place-items-center overflow-hidden rounded-md ring-1 ring-[var(--ink)]/10 ${t.tone}`}>
              {(["simple", "lux", "wood", "inverted"] as CardTemplateId[]).includes(t.id) ? (
                <img src={`/card-designs/${t.id}.png`} alt={`${t.name} card design`} className="h-full w-full object-cover" />
              ) : (
                <NfcWaves className={`h-9 w-9 ${t.id === "inverted" ? "text-[var(--yellow)]" : "text-[var(--ink)]"}`} />
              )}
            </span>
            <span className="font-display text-lg font-bold text-[var(--ink)]">{t.name}</span>
            {draft.cardTemplate === t.id && (
              <span className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-[var(--ink)] text-white">
                <Icon name="check" size={14} />
              </span>
            )}
          </button>
        ))}
      </div>

      {draft.cardTemplate === "upload" && (
        <div className="mt-6 rounded-2xl bg-[var(--sky-soft)]/40 p-5 ring-1 ring-[var(--sky)]/30">
          <div className="flex items-center justify-between"><p className="text-sm font-bold text-[var(--ink)]">Upload your own card design</p><InfoHelp title="Private card artwork"><p>Your original is kept private. Staff will manually prepare the final layout for the standard PVC card size.</p><p>Use a JPEG, PNG or WebP image within 25 MB.</p></InfoHelp></div>
          <input aria-label="Card artwork image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} className="mt-3 block w-full text-sm" />
          {uploading && <p className="mt-2 text-sm text-[var(--ink-soft)]">{localOnly ? "Saving on this device…" : "Uploading…"}</p>}
          {uploadError && <p className="mt-2 text-sm font-semibold text-[var(--coral)]">{uploadError}</p>}
          {draft.customDesignUrl && <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{draft.customDesignUrl === 'pending' ? 'Design save in progress.' : localOnly ? 'Artwork selected on this device. Check the draft save status before leaving.' : 'Private artwork uploaded. Wait for the draft save before leaving.'}</p>}
        </div>
      )}

      {draft.cardTemplate === "designer" && (
        <div className="mt-6 rounded-2xl bg-[var(--mint-soft)]/60 p-5">
          <p className="text-sm font-bold text-[var(--ink)]">Need a custom design?</p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">We&apos;ll contact you about a professional design request and any additional fee before proceeding.</p>
          <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="btn btn-ink mt-4 inline-flex px-4 py-2 text-sm">Request a designer</a>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between rounded-xl bg-white p-4 ring-1 ring-[var(--ink)]/10">
        <span className="text-sm font-bold text-[var(--ink)]">Quantity</span>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Decrease quantity" onClick={() => onChange({ quantity: Math.max(1, draft.quantity - 1) })} className="grid h-11 w-11 place-items-center rounded-full bg-[var(--ink)]/8 font-bold">−</button>
          <span className="w-6 text-center font-display font-bold">{draft.quantity}</span>
          <button type="button" aria-label="Increase quantity" onClick={() => onChange({ quantity: Math.min(20, draft.quantity + 1) })} className="grid h-11 w-11 place-items-center rounded-full bg-[var(--ink)] text-white font-bold">+</button>
        </div>
      </div>
      <div className="order-price"><strong className="font-display">Rs. {calculateSubtotal(draft.quantity).toLocaleString()}</strong><span>Delivery extra, paid to the rider</span></div>
    </section>
  );
}

// ── Step 2: Build your profile ───────────────────────────────────
export function ProfileStep({
  draft,
  onChange,
  onFileChange,
  localOnly = false,
}: {
  draft: WizardDraft;
  onChange: (p: Partial<WizardDraft>) => void;
  onFileChange: (file: File | null) => Promise<void> | void;
  localOnly?: boolean;
}) {
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleUpload = async (file: File) => {
    setUploadError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size <= 0 || file.size > 5 * 1024 * 1024) {
      setUploadError("Use a JPEG, PNG or WebP image within 5 MB.");
      return;
    }
    setUploading(true);
    onChange({ avatarUploadPending: true });
    try {
      const dataUrl = await fileToDataUrl(file);
      setPreview(dataUrl);
      onChange({ avatarPreview: dataUrl, avatarUploadPending: true });
      await onFileChange(file);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Could not save your photo.");
    } finally {
      setUploading(false);
      onChange({ avatarUploadPending: false });
    }
  };

  return (
    <section className="card-paper mb-6 p-7 sm:p-10">
      <p className="eyebrow mb-1 text-[var(--ink-mid)]">Step 2 · Profile</p>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight text-[var(--ink)]">
        Let&apos;s build your EdgeTap
      </h1>
      <p className="mt-2 text-[15px] text-[var(--ink-soft)]">Your public profile, your way.</p>

      <div className="mt-8 space-y-6">
        {/* avatar */}
        <div>
          <div className="flex items-center justify-between"><label htmlFor="ow-photo" className="block text-sm font-bold text-[var(--ink)]">Profile picture <span className="font-normal text-[var(--ink-faint)]">(optional)</span></label><InfoHelp title="Profile photo privacy"><p>{localOnly ? "Your photo stays on this device until you save to your account. It becomes publicly accessible after account upload, even before profile publication. Choose a photo you intend to share." : "Avatar images are publicly accessible after upload, even before profile publication. Upload only an image you intend to share."}</p><p>JPEG, PNG or WebP, up to 5 MB. Leave it blank to use the default profile picture.</p></InfoHelp></div>
          <div className="mt-3 flex items-center gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-2 ring-white shadow-[var(--shadow-card)]">
              {draft.avatarPreview || draft.avatarUrl || preview ? (
                <img
                  src={draft.avatarPreview || draft.avatarUrl || preview}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <DefaultAvatar size={44} />
              )}
            </div>
            <label className="btn cursor-pointer bg-white px-4 py-2.5 text-[13px] font-bold ring-1 ring-[var(--ink)]/15 hover:bg-[var(--cream)]">
              <Icon name="camera" size={18} />
              {uploading ? (localOnly ? "Saving…" : "Uploading…") : "Upload photo"}
              <input
                type="file"
                id="ow-photo"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              />
            </label>
          </div>
          <p className="mt-3 text-xs text-[var(--ink-soft)]">Your photo is public after account upload.</p>
          {uploadError && <p className="mt-2 text-[13px] font-semibold text-[var(--coral)]">{uploadError}</p>}
        </div>

        <div>
          <label htmlFor="ow-name" className="block text-sm font-bold text-[var(--ink)]">
            Name
          </label>
          <input
            id="ow-name"
            maxLength={120}
            type="text"
            value={draft.displayName}
            onChange={(e) => onChange({ displayName: e.target.value })}
            placeholder="Ahmad Khan"
            className="mt-2 w-full rounded-xl border border-[var(--ink)]/15 bg-white px-4 py-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]"
          />
        </div>

        <div>
          <label htmlFor="ow-title" className="block text-sm font-bold text-[var(--ink)]">
            Title <span className="font-normal text-[var(--ink-faint)]">(optional)</span>
          </label>
          <input
            id="ow-title"
            maxLength={160}
            type="text"
            value={draft.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g. Software Developer · Founder"
            className="mt-2 w-full rounded-xl border border-[var(--ink)]/15 bg-white px-4 py-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]"
          />
        </div>

        <div>
          <label htmlFor="ow-bio" className="block text-sm font-bold text-[var(--ink)]">
            Bio <span className="font-normal text-[var(--ink-faint)]">(optional)</span>
          </label>
          <textarea
            id="ow-bio"
            maxLength={2000}
            rows={3}
            value={draft.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            placeholder="What should people know about you?"
            className="mt-2 w-full resize-none rounded-xl border border-[var(--ink)]/15 bg-white px-4 py-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]"
          />
        </div>
        <div>
          <div className="flex items-center justify-between"><label htmlFor="ow-handle" className="block text-sm font-bold">Desired profile handle</label><InfoHelp title="Profile handle"><p>This is a request. Your handle is claimed uniquely when staff publishes your profile. Requested handles are confirmed during review.</p><p>Once published, the handle stays fixed so your NFC and QR links keep working.</p></InfoHelp></div>
          <div className="profile-handle-input"><span>/u/</span><input id="ow-handle" aria-label="Desired profile handle" maxLength={30} value={draft.usernameSuggested} onChange={event => onChange({ usernameSuggested: event.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "") })} placeholder="yourname" /></div>
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
      <p className="eyebrow mb-1 text-[var(--ink-mid)]">Step 3 · Links</p>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight text-[var(--ink)]">
        What do you want people to find?
      </h1>
      <p className="mt-2 text-[15px] text-[var(--ink-soft)]">
      Add up to 10 ways to reach you.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {LINK_PRESETS.map((p) => (
          <button
            key={p.label + p.type + LINK_PRESETS.indexOf(p)}
            type="button"
            onClick={() => addLink(p)}
            className="rounded-full bg-[var(--yellow-soft)] px-3 py-1.5 text-[12px] font-bold text-[var(--ink)] ring-1 ring-[var(--ink)]/10 hover:bg-[var(--yellow)]"
          >
            + {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => addLink()}
          className="rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-[var(--ink)] ring-1 ring-[var(--ink)]/15 hover:bg-[var(--cream)]"
        >
          + Custom
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {links.map((l, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-[var(--ink)]/10 sm:flex-row sm:items-center">
            <input
              type="text"
              aria-label={`Link ${i + 1} label`}
              maxLength={80}
              placeholder="Label"
              value={l.label}
              onChange={(e) => update(i, "label", e.target.value)}
              className="rounded-xl border border-[var(--ink)]/15 px-3 py-2 text-sm text-[var(--ink)]"
            />
            <input
              type="text"
              aria-label={`Link ${i + 1} URL`}
              maxLength={2048}
              placeholder={l.type === "email" ? "example@gmail.com" : l.type === "whatsapp" ? "+92 300 1234567" : "URL (https://…)"}
              value={l.type === "email" ? l.url.replace(/^mailto:/, "") : l.type === "whatsapp" ? l.url.replace("https://wa.me/", "") : l.url}
              onChange={(e) => updateUrl(i, e.target.value)}
              className="flex-1 rounded-xl border border-[var(--ink)]/15 px-3 py-2 text-sm text-[var(--ink)]"
            />
            <select
              value={l.type}
              onChange={(e) => update(i, "type", e.target.value)}
              className="rounded-xl border border-[var(--ink)]/15 px-3 py-2 text-sm text-[var(--ink)]"
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

      {links.length === 0 && <p className="mt-6 text-sm font-semibold text-[var(--coral)]">Add Email to continue.</p>}
      <p className="mt-2 text-[12px] text-[var(--ink-faint)]">{links.length} / 10 links</p>
    </section>
  );
}

// ── Step 4: Preview ──────────────────────────────────────────────
export function PreviewStep({ profile }: { profile: Profile }) {
  return (
    <section className="mb-6">
      <p className="eyebrow mb-2 text-[var(--ink-mid)]">Step 4 · Preview</p>
      <h1 className="mb-4 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight text-[var(--ink)]">
        Preview your profile
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
  collectEmail = true,
}: {
  collectEmail?: boolean;
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
      <p className="eyebrow mb-1 text-[var(--ink-mid)]">Step 5 · Delivery</p>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight text-[var(--ink)]">
        Where should we send your card?
      </h1>
      <p className="mt-2 text-[15px] text-[var(--ink-soft)]">Your address stays private. Pay delivery separately to the rider.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {([
          ["delivery", "Delivery", deliveryDetails],
          ["nastp_pickup", "NASTP Pickup", pickupDetails],
        ] as const).map(([value, label, description]) => (
          <div key={value} className={`delivery-option ${deliveryMethod === value ? "is-selected" : ""}`}>
            <button type="button" aria-pressed={deliveryMethod === value} onClick={() => onDeliveryMethodChange(value)} className="delivery-choice">
              <Icon name={value === "delivery" ? "truck" : "pin"} size={28} />
              <span><strong className="font-display">{label}</strong><span>{value === "delivery" ? "Rider fee extra" : "Collect when ready"}</span></span>
              {deliveryMethod === value && <Icon name="check" size={18} />}
            </button>
            <InfoHelp title={value === "delivery" ? "Delivery details" : "NASTP pickup details"}><p>{description}</p></InfoHelp>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {FIELDS.filter(({ key }) => (collectEmail || key !== "email") && (deliveryMethod === "delivery" || !["address","city","postalCode"].includes(key))).map(({ key, placeholder, type, span }) => (
          <div key={key} className={span ? "sm:col-span-2" : ""}>
            <label htmlFor={`delivery-${key}`} className="block text-sm font-bold text-[var(--ink)]">{placeholder}</label>
            <input
              id={`delivery-${key}`}
              maxLength={key === "address" ? 1000 : key === "email" ? 254 : key === "phone" ? 30 : 120}
              type={type}
              readOnly={key === "email"}
              value={customer[key] || ""}
              onChange={(e) => onChange({ ...customer, [key]: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-[var(--ink)]/15 bg-white px-4 py-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
