"use client";

import { useMemo, useState, useRef } from "react";
import Link from "next/link";
import { NfcWaves, SparkleDoodle, StarDoodle } from "@/components/doodles";
import ProfilePage from "@/components/ProfilePage";
import {
  CARD_TEMPLATES,
  CardTemplateId,
  Order,
  CustomerInfo,
  PaymentInfo,
  DeliveryMethod,
  LINK_PRESETS,
  LINK_ACCENTS,
  calculateSubtotal,
} from "@/lib/data/order";
import type { Profile, ProfileLink } from "@/lib/data/profile";
import { isSafeContactUrl } from "@/lib/links";
import { SUPPORT_URL } from "@/lib/site";
import { createOrder, orderNumber } from "@/lib/firestore";
import { uploadCustomDesign, uploadPublicAvatar, uploadPaymentReceipt, fileToDataUrl } from "@/lib/storage";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

const STEPS = ["Card", "Profile", "Links", "Preview", "Delivery", "Payment", "Done"];

type WizardDraft = {
  plan: Order["plan"];
  cardTemplate: CardTemplateId;
  quantity: number;
  customDesignUrl?: string;
  customDesignPreview?: string; // client-side data URL for instant preview
  avatarUrl?: string;
  avatarPreview?: string; // client-side data URL for instant preview
  avatarUploadPending: boolean;
  displayName: string;
  title: string;
  bio: string;
  links: ProfileLink[];
  customer: CustomerInfo;
  deliveryMethod: DeliveryMethod;
  payment: PaymentInfo;
};

type AccountMode = "create" | "signIn";

function blankDraft(): WizardDraft {
  return {
    plan: "standard",
    cardTemplate: "simple",
    quantity: 1,
    displayName: "",
    title: "",
    bio: "",
    links: [],
    avatarUploadPending: false,
    customer: { fullName: "", phone: "", email: "", address: "" },
    deliveryMethod: "delivery",
    payment: { method: "jazzcash", status: "pending" },
  };
}

export default function OrderWizard() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<WizardDraft>(blankDraft);
  const [error, setError] = useState("");
  const submissionLock = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [resubmitKey, setResubmitKey] = useState(0); // bump to retry a failed submit
  const [accountMode, setAccountMode] = useState<AccountMode>("create");
  const [accountPassword, setAccountPassword] = useState("");
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [customDesignFile, setCustomDesignFile] = useState<File | null>(null);
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
      title: draft.title,
      bio: draft.bio,
      location: draft.customer.city || "",
      avatar: draft.avatarPreview || draft.avatarUrl || "",
      links: draft.links.filter((l) => isSafeContactUrl(l.url)),
    };
  }, [draft]);

  const validateStep = (): string => {
    switch (step) {
      case 0:
        if (draft.cardTemplate === "upload" && !customDesignFile) {
          return "Upload your card design before continuing.";
        }
        return "";
      case 1:
        if (!draft.displayName.trim()) return "Please add your name.";
        if (draft.avatarUploadPending) return "Please wait for the profile picture upload to finish.";
        return "";
      case 2:
        if (draft.links.some((link) => !isSafeContactUrl(link.url))) return "Use a complete http(s), email or phone contact URL for every link.";
        if (draft.links.filter((link) => link.url && !["https://", "mailto:", "https://wa.me/"].includes(link.url.trim())).length < 1) {
          return "Add at least one way for people to contact you.";
        }
        return "";
      case 4: {
        const c = draft.customer;
        if (!c.fullName.trim()) return "Please add your full name.";
        if (!/^[+\d ()-]{7,30}$/.test(c.phone)) return "Please add a valid phone number.";
        if (!/.+@.+\..+/.test(c.email)) return "Please add a valid email.";
        if (draft.deliveryMethod === "delivery" && !c.address.trim()) return "Please add your delivery address.";
        return "";
      }
      case 5:
      case 6:
        if (!auth.currentUser && accountPassword.length < 6) return "Use a password with at least 6 characters.";
        if (!paymentReceipt) return "Upload your payment receipt before placing the order.";
        if (!["image/jpeg", "image/png", "image/webp"].includes(paymentReceipt.type) || paymentReceipt.size > 8 * 1024 * 1024) return "Use a JPEG, PNG or WebP receipt no larger than 8 MB.";
        return "";
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
    if (submissionLock.current) return;
    setError("");
    const err = validateStep();
    if (err) return setError(err);
    submissionLock.current = true;
    setSubmitting(true);
    try {
      const email = draft.customer.email.trim().toLowerCase();
      let customerUser = auth.currentUser;

      if (!customerUser) {
        if (accountMode === "create") {
          try {
            customerUser = (await createUserWithEmailAndPassword(auth, email, accountPassword)).user;
          } catch (createErr) {
            if ((createErr as { code?: string }).code === "auth/email-already-in-use") {
              try {
                customerUser = (await signInWithEmailAndPassword(auth, email, accountPassword)).user;
              } catch {
                throw new Error(
                  "An account with this email already exists. Please select 'I already have one' and enter your password, or use a different email."
                );
              }
            } else {
              throw createErr;
            }
          }
        } else {
          customerUser = (await signInWithEmailAndPassword(auth, email, accountPassword)).user;
        }
      }
      if (customerUser.email?.toLowerCase() !== email) throw new Error("Sign out first or use your signed-in account email for the order.");
      const now = Date.now();
      if (!paymentReceipt) throw new Error("Payment receipt is required.");
      const [receiptUrl, avatarUrl, customDesignUrl] = await Promise.all([
        uploadPaymentReceipt(customerUser.uid, paymentReceipt),
        avatarFile ? uploadPublicAvatar(customerUser.uid, avatarFile) : Promise.resolve(undefined),
        customDesignFile ? uploadCustomDesign(customerUser.uid, customDesignFile) : Promise.resolve(undefined),
      ]);
      const order: Order = {
        ownerUid: customerUser.uid,
        orderNumber: orderNumber(),
        plan: "standard",
        card: {
          template: draft.cardTemplate,
          quantity: draft.quantity,
          ...(customDesignUrl ? { customDesignUrl } : {}),
        },
        profileDraft: {
          ...(avatarUrl ? { avatarUrl } : {}),
          displayName: draft.displayName.trim(),
          ...(draft.title.trim() ? { title: draft.title.trim() } : {}),
          ...(draft.bio.trim() ? { bio: draft.bio.trim() } : {}),
          links: draft.links.filter((l) => isSafeContactUrl(l.url)).slice(0, 10),
        },
        customer: draft.customer,
        deliveryMethod: draft.deliveryMethod,
        subtotal: calculateSubtotal(draft.quantity),
        deliveryFee: null,
        total: null,
        payment: { ...draft.payment, status: "pending", receiptUrl },
        fulfillment: { status: "new", history: [{ status: "new", at: now }] },
        createdAt: now,
        updatedAt: now,
      };
      const id = await createOrder(order);
      setPlaced({ ...order, id });
    } catch {
      setError("We could not place your order. Check your account email, password and uploads, then try again. If you already paid, contact EdgeTap on WhatsApp before retrying.");
      setResubmitKey((k) => k + 1);
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  };

  // ── Done — order confirmation ─────────────────────────────────
  if (placed) {
    return <Confirmation order={placed} />;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-[--cream] px-4 py-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
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

        {step === 0 && <CardStep draft={draft} onChange={patch} onFileChange={setCustomDesignFile} />}
        {step === 1 && <ProfileStep draft={draft} onChange={patch} onFileChange={setAvatarFile} />}
        {step === 2 && <LinksStep links={draft.links} onChange={(links) => patch({ links })} />}
        {step === 3 && <PreviewStep profile={previewProfile} />}
        {step === 4 && (
          <DeliveryStep
            customer={draft.customer}
            deliveryMethod={draft.deliveryMethod}
            onDeliveryMethodChange={(deliveryMethod) => patch({ deliveryMethod })}
            onChange={(customer) => patch({ customer })}
          />
        )}
        {step === 5 && (
          <PaymentStep
            payment={draft.payment}
            onChange={(payment) => patch({ payment })}
            subtotal={calculateSubtotal(draft.quantity)}
            deliveryMethod={draft.deliveryMethod}
            email={draft.customer.email}
            accountMode={accountMode}
            password={accountPassword}
            onAccountModeChange={setAccountMode}
            onPasswordChange={setAccountPassword}
            onReceiptChange={setPaymentReceipt}
          />
        )}

        {step === 6 && (
          <SubmitStep
            draft={draft}
            submitting={submitting}
            resubmitKey={resubmitKey}
            onSubmit={handleSubmit}
            onBack={back}
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
              {step === 5 ? "Review order →" : "Continue →"}
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
    setUploading(true);
    try {
      const preview = await fileToDataUrl(file);
      onFileChange(file);
      onChange({ customDesignPreview: preview, customDesignUrl: "pending" });
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

      <div className="mt-4 rounded-xl bg-[--mint-soft]/60 px-4 py-3 text-sm font-bold text-[--ink]">
        Your EdgeTap card · {draft.cardTemplate ? "40% complete" : "0% complete"}
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
          <p className="text-sm font-bold text-[--ink]">Upload your own card design</p>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} className="mt-3 block w-full text-sm" />
          {uploading && <p className="mt-2 text-sm text-[--ink-soft]">Uploading…</p>}
          {uploadError && <p className="mt-2 text-sm font-semibold text-[--coral]">{uploadError}</p>}
          {draft.customDesignUrl && <p className="mt-2 text-sm font-semibold text-[--mint]">Design selected. Uploaded when you place the order.</p>}
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
function ProfileStep({
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
          <label className="block text-sm font-bold text-[--ink]">Profile picture <span className="font-normal text-[--ink-faint]">(optional)</span></label>
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
  deliveryMethod,
  onDeliveryMethodChange,
  onChange,
}: {
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
    { key: "city", placeholder: "City (optional)", type: "text" },
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
          ["delivery", "Delivery", "Delivery within Pakistan. Contact us to confirm cost and timing for your location before paying."],
        ] as const).map(([value, label, description]) => (
          <button type="button" key={value} aria-pressed={deliveryMethod === value} onClick={() => onDeliveryMethodChange(value)} className={`rounded-xl border-2 p-4 text-left transition-colors hover:border-[--ink]/50 ${deliveryMethod === value ? "border-[--ink] bg-[--yellow-soft]/30" : "border-[--ink]/10 bg-white"}`}>
            <span className="flex items-center justify-between font-display font-bold text-[--ink]"><span>{label}</span>{deliveryMethod === value && <span aria-hidden="true">✓</span>}</span>
            <span className="mt-1 block text-[12px] text-[--ink-soft]">{description}</span>
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {FIELDS.filter(({ key }) => deliveryMethod === "delivery" || key !== "address").map(({ key, placeholder, type, span }) => (
          <div key={key} className={span ? "sm:col-span-2" : ""}>
            <label htmlFor={`delivery-${key}`} className="block text-sm font-bold text-[--ink]">{placeholder}</label>
            <input
              id={`delivery-${key}`}
              maxLength={key === "address" ? 1000 : key === "email" ? 254 : key === "phone" ? 30 : 120}
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
  subtotal,
  deliveryMethod,
  email,
  accountMode,
  password,
  onAccountModeChange,
  onPasswordChange,
  onReceiptChange,
}: {
  payment: PaymentInfo;
  onChange: (p: PaymentInfo) => void;
  subtotal: number;
  deliveryMethod: DeliveryMethod;
  email: string;
  accountMode: AccountMode;
  password: string;
  onAccountModeChange: (mode: AccountMode) => void;
  onPasswordChange: (password: string) => void;
  onReceiptChange: (file: File | null) => void;
}) {
  const paymentDetails: Record<string, string> = {
    jazzcash: "JazzCash: 0304 4149674. Confirm the recipient and complete cost with EdgeTap on WhatsApp before transferring funds.",
  };
  return (
    <section className="card-paper mb-6 p-7 sm:p-10">
      <p className="eyebrow mb-1 text-[--ink-mid]">Step 6 · Payment</p>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight text-[--ink]">
        How would you like to pay?
      </h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {(["jazzcash"] as const).map((method) => (
          <button type="button" key={method} aria-pressed={payment.method === method} onClick={() => onChange({ method, status: "pending" })} className={`rounded-xl border-2 p-5 text-left transition-colors hover:border-[--ink]/50 ${payment.method === method ? "border-[--ink] bg-[--yellow-soft]/30" : "border-[--ink]/10 bg-white"}`}>
            <span className="font-display text-lg font-bold capitalize text-[--ink]">{method}</span>
            <p className="mt-1 text-sm text-[--ink-soft]">Manual verification</p>
            {payment.method === method && <span className="mt-3 block text-xs font-bold text-[--ink]">✓ Selected</span>}
          </button>
        ))}
      </div>
      <dl className="mt-6 space-y-2 rounded-xl bg-white p-4 text-sm ring-1 ring-[--ink]/10">
        <div className="flex justify-between"><dt className="text-[--ink-soft]">Card subtotal</dt><dd className="font-bold text-[--ink]">Rs. {subtotal.toLocaleString()}</dd></div>
        <div className="flex justify-between"><dt className="text-[--ink-soft]">Delivery</dt><dd className="font-bold capitalize text-[--ink]">{deliveryMethod}</dd></div>
        <div className="flex justify-between"><dt className="text-[--ink-soft]">Delivery fee</dt><dd className="font-bold text-[--ink]">{deliveryMethod === "pickup" ? "Rs. 0" : "Calculated separately"}</dd></div>
        <div className="flex justify-between border-t border-[--ink]/10 pt-2"><dt className="font-display font-bold text-[--ink]">Total</dt><dd className="font-display font-bold text-[--ink]">{deliveryMethod === "pickup" ? `Rs. ${subtotal.toLocaleString()}` : "Calculated separately"}</dd></div>
      </dl>
      <div className="mt-4 rounded-xl bg-[--yellow-soft] p-4 text-sm text-[--ink]">
        <p className="font-bold">{paymentDetails[payment.method]}</p>
        <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="mt-3 inline-block underline">Confirm order details on WhatsApp</a>
      </div>
      <label className="mt-4 block text-sm font-bold text-[--ink]">Payment receipt screenshot
        <input type="file" accept="image/jpeg,image/png,image/webp" required onChange={(event) => onReceiptChange(event.target.files?.[0] || null)} className="mt-2 block w-full text-sm" />
      </label>
      <label className="mt-4 block text-sm font-bold text-[--ink]">Transaction/reference ID <span className="font-normal text-[--ink-faint]">(optional)</span>
        <input maxLength={200} value={payment.reference || ""} onChange={(event) => onChange({ ...payment, reference: event.target.value })} className="mt-2 w-full rounded-xl border border-[--ink]/15 bg-white px-4 py-3 text-[--ink]" />
      </label>
      <p className="mt-4 rounded-xl bg-[--mint-soft]/60 p-3 text-[13px] text-[--ink]">
        🔒 Payment status is pending verification until EdgeTap confirms the receipt.
      </p>

      <div className="mt-6 rounded-2xl border border-[--ink]/10 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-base font-bold text-[--ink]">Create your profile login</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[--ink-soft]">
              Use this account to edit your live profile after your card is shipped.
            </p>
          </div>
          <div className="flex rounded-full bg-[--ink]/5 p-1 text-[12px] font-bold text-[--ink]">
            <button
              type="button"
              onClick={() => onAccountModeChange("create")}
              className={`rounded-full px-3 py-1.5 ${accountMode === "create" ? "bg-[--ink] text-white" : ""}`}
            >
              New account
            </button>
            <button
              type="button"
              onClick={() => onAccountModeChange("signIn")}
              className={`rounded-full px-3 py-1.5 ${accountMode === "signIn" ? "bg-[--ink] text-white" : ""}`}
            >
              I already have one
            </button>
          </div>
        </div>
        <label className="mt-4 block text-[12px] font-bold uppercase tracking-wider text-[--ink-faint]">
          Account email
          <input
            value={email}
            readOnly
            className="mt-1.5 w-full rounded-xl border border-[--ink]/10 bg-[--cream] px-3 py-2.5 text-sm text-[--ink]"
          />
        </label>
        <label className="mt-3 block text-[12px] font-bold uppercase tracking-wider text-[--ink-faint]">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            autoComplete={accountMode === "create" ? "new-password" : "current-password"}
            placeholder="At least 6 characters"
            className="mt-1.5 w-full rounded-xl border border-[--ink]/10 bg-[--cream] px-3 py-2.5 text-sm text-[--ink]"
          />
        </label>
      </div>
    </section>
  );
}

// ── Step 7: Submit ───────────────────────────────────────────────
function SubmitStep({
  draft,
  submitting,
  resubmitKey,
  onSubmit,
  onBack,
}: {
  draft: WizardDraft;
  submitting: boolean;
  resubmitKey: number;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <section className="card-paper mb-6 p-7 sm:p-10 text-center">
      <p className="eyebrow mb-1 text-[--ink-mid]">Final step</p>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight text-[--ink]">
        {submitting ? "Placing your order…" : "Ready to place order"}
      </h1>
      <p className="mx-auto mt-2 max-w-md text-[15px] text-[--ink-soft]">
        {draft.displayName || "Your profile"} · {CARD_TEMPLATES.find((t) => t.id === draft.cardTemplate)?.name} card ·{" "}
        {draft.payment.method} payment · Payment pending verification
      </p>
      <button
        onClick={onSubmit}
        disabled={submitting}
        className="btn btn-ink mt-6 px-10 py-4 font-display text-base font-bold disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Place Order 🚀"}
      </button>
      <button type="button" onClick={onBack} disabled={submitting} className="btn btn-ghost mt-4 px-6 py-3">Edit order</button>
      {resubmitKey > 0 && !submitting && (
        <p className="mt-3 text-[12px] text-[--ink-faint]">
          A previous attempt failed — you can retry above.
        </p>
      )}
      <div className="mx-auto mt-8 max-w-md">
        <p className="text-[12px] font-bold uppercase tracking-widest text-[--ink-faint]">Status</p>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[--yellow-soft] px-4 py-1.5 text-xs font-bold text-[--ink]">
          Not submitted yet · Payment will be verified after submission
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
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
            Thank you, {order.customer.fullName.split(" ")[0]}. Your order has been received and payment is pending verification. For updates, contact us on WhatsApp. Your account email is{" "}
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
                {order.payment.method.toUpperCase()} · Pending verification
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
              {["Order received", "Payment verification", "Production", "Shipped", "Delivered"].map((s, i) => (
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
            <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="btn btn-ink px-6 py-3">Contact on WhatsApp</a>
            <Link href="/" className="btn btn-ghost px-6 py-3">
              Back to Homepage
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