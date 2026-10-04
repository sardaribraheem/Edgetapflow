"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Order, FulfillmentStatus, CardTemplateId } from "@/lib/data/order";
import { CARD_TEMPLATES, canTransition, FULFILLMENT_FLOW } from "@/lib/data/order";
import {
  advanceFulfillment,
  confirmPayment,
  createClientProfileFromOrder,
  getOrders,
  usernameAvailable,
  suggestUsername,
} from "@/lib/firestore";
import { qrDataUrl } from "@/lib/qr";
import { profileUrl } from "@/lib/site";
import { NfcWaves, QrDoodle, ProfileDoodle } from "@/components/doodles";
import { CARD_TEMPLATE_ART } from "@/lib/data/cardArt";

type Props = {
  orders: Order[];
  onChanged: () => void;
};

const STATUS_LABEL: Record<string, string> = {
  new: "New order",
  payment_pending: "Payment pending",
  paid: "Paid",
  cod_pending_confirmation: "COD — pending confirmation",
  profile_created: "Profile created",
  production_ready: "Production ready",
  printing: "Printing",
  ready_for_nfc: "Ready for NFC",
  nfc_programmed: "NFC programmed",
  qa_passed: "QA passed",
  ready_to_ship: "Ready to ship",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrdersView({ orders, onChanged }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [busy, setBusy] = useState<string | null>(null); // orderId being advanced
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [creatingProfileFor, setCreatingProfileFor] = useState<Order | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.fulfillment.status !== statusFilter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        (o.usernameFinal || "").toLowerCase().includes(q)
      );
    });
  }, [orders, query, statusFilter]);

  const selected = selectedId ? orders.find((o) => o.id === selectedId) : null;

  const advance = async (o: Order, next: FulfillmentStatus) => {
    setBusy(o.id!);
    setError("");
    try {
      await advanceFulfillment(o.id!, o.fulfillment.status, next);
      setToast(`${o.orderNumber} → ${STATUS_LABEL[next] ?? next}`);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't update status.");
      onChanged();
    } finally {
      setBusy(null);
    }
  };

  const confirm = async (o: Order) => {
    setBusy(o.id!);
    setError("");
    try {
      await confirmPayment(o);
      setToast(`${o.orderNumber} payment confirmed`);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't confirm payment.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-[--ink]">Orders</h1>
          <p className="text-sm text-[--ink-soft]">{orders.length} total · authenticated checkout.</p>
        </div>
        <button
          onClick={async () => {
            try {
              await getOrders();
              onChanged();
            } catch {}
          }}
          className="rounded-xl bg-[--ink]/5 px-4 py-2 text-[12px] font-bold text-[--ink] hover:bg-[--ink]/10"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="card-paper mt-4 border-l-4 border-[--coral] p-4 text-sm text-[--coral]">{error}</div>
      )}
      {toast && (
        <div className="card-paper mt-4 border-l-4 border-[--mint] p-4 text-sm font-bold text-[--ink]">✓ {toast}</div>
      )}

      {/* filter bar */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search order, customer or username…"
          className="min-w-0 flex-1 rounded-xl border border-[--ink]/10 bg-white px-4 py-2.5 text-sm text-[--ink] outline-none placeholder:text-[--ink-faint] focus:border-[--ink]/30"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-[--ink]/10 bg-white px-3 py-2.5 text-sm font-semibold text-[--ink] outline-none"
        >
          <option value="all">All statuses</option>
          {FULFILLMENT_FLOW.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* list + detail */}
      <div className="mt-5 grid gap-4 lg:grid-cols-5">
        <ul className="space-y-2 lg:col-span-2">
          {filtered.map((o) => (
            <li key={o.id}>
              <button
                onClick={() => setSelectedId(o.id!)}
                className={`w-full rounded-2xl p-4 text-left transition-colors ${
                  selectedId === o.id ? "bg-[--ink] text-white" : "card-paper hover:border-[--ink]/20"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={`font-display text-sm font-bold ${selectedId === o.id ? "text-white" : "text-[--ink]"}`}>
                    {o.customer.fullName}
                  </p>
                  <p className={`text-[11px] font-bold ${selectedId === o.id ? "text-white/60" : "text-[--ink-faint]"}`}>
                    {o.orderNumber}
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      selectedId === o.id ? "bg-white/15 text-white" : "bg-[--yellow-soft] text-[--ink]"
                    }`}
                  >
                    {o.plan}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      selectedId === o.id ? "bg-white/10 text-white/70" : "bg-[--ink]/5 text-[--ink-soft]"
                    }`}
                  >
                    {STATUS_LABEL[o.fulfillment.status] ?? o.fulfillment.status}
                  </span>
                </div>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="card-paper p-6 text-sm text-[--ink-faint]">No orders match.</li>
          )}
        </ul>

        <div className="lg:col-span-3">
          {selected ? (
            <OrderDetail
              order={selected}
              busy={busy === selected.id}
              onAdvance={(next) => advance(selected, next)}
              onConfirmPayment={() => confirm(selected)}
              onCreateProfile={() => setCreatingProfileFor(selected)}
            />
          ) : (
            <div className="card-paper flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
              <QrDoodle className="h-10 w-10 text-[--ink-faint]" />
              <p className="text-sm text-[--ink-soft]">Select an order to see its full detail.</p>
            </div>
          )}
        </div>
      </div>

      {creatingProfileFor && (
        <CreateClientProfileModal
          order={creatingProfileFor}
          onClose={() => setCreatingProfileFor(null)}
          onDone={() => {
            setCreatingProfileFor(null);
            setToast(`Profile created for ${creatingProfileFor.customer.fullName}`);
            setSelectedId(creatingProfileFor.id!);
            onChanged();
          }}
        />
      )}
    </div>
  );
}

// ── Order detail ──────────────────────────────────────────────────
function Section({
  title,
  eye,
  children,
  privateNote,
}: {
  title: string;
  eye?: string;
  children: React.ReactNode;
  privateNote?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[--ink]/8 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[--ink]/8 bg-[--cream] px-4 py-2.5">
        <p className="font-display text-[12px] font-bold uppercase tracking-widest text-[--ink]">{title}</p>
        <span className="text-[11px] font-semibold text-[--ink-faint]">{eye}</span>
      </div>
      <div className="p-4">{children}</div>
      {privateNote && <p className="border-t border-[--ink]/8 px-4 py-2 text-[11px] text-[--ink-faint]">{privateNote}</p>}
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <span className="text-[13px] text-[--ink-faint]">{k}</span>
      <span className="text-right text-[13px] font-semibold text-[--ink]">{v}</span>
    </div>
  );
}

function OrderDetail({
  order,
  busy,
  onAdvance,
  onCreateProfile,
  onConfirmPayment,
}: {
  order: Order;
  busy: boolean;
  onAdvance: (next: FulfillmentStatus) => void;
  onCreateProfile: () => void;
  onConfirmPayment: () => void;
}) {
  const validNext = FULFILLMENT_FLOW.filter((s) => canTransition(order.fulfillment.status, s));
  const inProductionPhase = ["profile_created", "production_ready", "printing", "ready_for_nfc", "nfc_programmed", "qa_passed"].includes(
    order.fulfillment.status
  );

  const templateName = CARD_TEMPLATES.find((t) => t.id === order.card.template)?.name ?? order.card.template;

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="card-paper p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-[--ink]">{order.customer.fullName}</h2>
            <p className="text-sm text-[--ink-soft]">
              {order.orderNumber} · placed {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${order.fulfillment.status === "cancelled" ? "bg-[--coral]/15 text-[--coral]" : "bg-[--mint-soft] text-[--ink]"}`}>
              {STATUS_LABEL[order.fulfillment.status] ?? order.fulfillment.status}
            </span>
          </div>
        </div>

        {order.profileId && order.usernameFinal && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-[--sky-soft] px-4 py-2.5">
            <NfcWaves className="h-4 w-4 text-[--ink]" />
            <p className="text-[13px] font-bold text-[--ink]">
              Profile live:{" "}
              <Link href={profileUrl(order.usernameFinal)} target="_blank" className="text-[--sky] underline">
                {order.usernameFinal}
              </Link>
            </p>
          </div>
        )}
      </div>

      {/* actions */}
      <div className="card-paper flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="flex flex-wrap gap-2">
          {validNext.map((s) => (
            <button
              key={s}
              disabled={busy}
              onClick={() => onAdvance(s)}
              className="rounded-xl bg-[--ink] px-4 py-2 text-[12px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "…" : `→ ${STATUS_LABEL[s] ?? s}`}
            </button>
          ))}
          {order.fulfillment.status !== "delivered" && order.fulfillment.status !== "cancelled" && (
            <button
              disabled={busy}
              onClick={() => onAdvance("cancelled")}
              className="rounded-xl bg-[--coral]/10 px-4 py-2 text-[12px] font-bold text-[--coral] hover:bg-[--coral]/20 disabled:opacity-50"
            >
              Cancel order
            </button>
          )}
          {validNext.length === 0 && (
            <p className="text-[12px] text-[--ink-faint]">No further transitions for this state.</p>
          )}
        </div>
        {order.payment.status !== "paid" && (
          <button onClick={onConfirmPayment} disabled={busy} className="rounded-xl bg-[--mint] px-5 py-2.5 text-[13px] font-bold text-[--ink]">
            Confirm Payment
          </button>
        )}
        {!order.profileId && order.payment.status === "paid" && (
          <button onClick={onCreateProfile} className="btn btn-ink px-5 py-2.5 text-[13px]">
            Generate Profile
          </button>
        )}
      </div>

      {/* fields */}
      <div className="grid gap-4 md:grid-cols-2">
        <Section title="CUSTOMER" eye="contact">
          <Row k="Full name" v={order.customer.fullName} />
          <Row k="Phone" v={order.customer.phone || "—"} />
          <Row k="Email" v={order.customer.email || "—"} />
        </Section>

        <Section title="CARD" eye={`qty ×${order.card.quantity}`}>
          <Row k="Template" v={templateName} />
          {order.card.template === "upload" && order.card.customDesignUrl ? (
            <Row k="Custom art" v={<span className="break-all">{order.card.customDesignUrl}</span>} />
          ) : (
            <Row k="Custom art" v="—" />
          )}
          <div className="mt-2">
            <CardThumb template={order.card.template} />
          </div>
        </Section>
      </div>

      <Section
        title="PROFILE DRAFT"
        eye="what the customer built"
        privateNote="Only public profile fields (avatar, name, bio, links) become the live profile. Never delivery or payment info."
      >
        <div className="flex flex-wrap gap-4">
          {order.profileDraft.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={order.profileDraft.avatarUrl} alt="" className="h-14 w-14 rounded-full object-cover ring-1 ring-[--ink]/10" />
          ) : (
            <span className="grid h-14 w-14 place-items-center rounded-full bg-[--ink]/5">
              <ProfileDoodle className="h-7 w-7 text-[--ink-faint]" />
            </span>
          )}
          <div className="min-w-0">
            <p className="font-display font-bold text-[--ink]">{order.profileDraft.displayName || "—"}</p>
            <p className="text-[13px] text-[--ink-soft]">{order.profileDraft.title || ""}{order.profileDraft.title && order.profileDraft.bio ? " · " : ""}{order.profileDraft.bio || ""}</p>
            {order.profileDraft.usernameSuggested && (
              <p className="text-[12px] text-[--ink-faint]">Suggested handle: /u/{order.profileDraft.usernameSuggested}</p>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(order.profileDraft.links || []).map((l, i) =>
            l.url && l.url.trim() && l.url !== "https://" ? (
              <span key={i} className="rounded-full bg-[--ink]/5 px-2.5 py-1 text-[11px] font-semibold text-[--ink]">
                {l.type || "link"}: {l.url}
              </span>
            ) : null
          )}
          {(order.profileDraft.links || []).filter((l) => l.url && l.url.trim()).length === 0 && (
            <span className="text-[12px] text-[--ink-faint]">No links added.</span>
          )}
        </div>
      </Section>

      {/* PRIVATE sections */}
      <Section title="DELIVERY" eye="private · never public" privateNote="This address is used only to ship the card. It never appears on /u/[username].">
        <Row k="Name" v={order.customer.fullName} />
        <Row k="Phone" v={order.customer.phone || "—"} />
        <Row k="Address" v={order.customer.address || "—"} />
        <Row k="City" v={order.customer.city || "—"} />
        <Row k="Postal code" v={order.customer.postalCode || "—"} />
      </Section>

      <Section title="PAYMENT" eye="manual verification">
          <Row k="Method" v={order.payment.method} />
        <Row
          k="Status"
          v={
            <span className={order.payment.status === "paid" ? "text-[--mint]" : order.payment.status === "pending" ? "text-[--sky]" : "text-[--coral]"}>
              {order.payment.status.replace(/_/g, " ")}
            </span>
          }
        />
        {order.payment.providerRef && <Row k="Provider ref" v={order.payment.providerRef} />}
        {order.payment.reference && <Row k="Transaction/reference" v={order.payment.reference} />}
        {order.payment.receiptUrl && <Row k="Receipt" v={<a href={order.payment.receiptUrl} target="_blank" rel="noreferrer" className="text-[--sky] underline">Open receipt</a>} />}
        <p className="mt-2 text-[11px] leading-relaxed text-[--ink-faint]">
          Confirm the receipt manually before moving this order to paid.
        </p>
      </Section>

      {/* FULFILLMENT timeline */}
      <Section title="FULFILLMENT" eye="state machine">
        <ul className="space-y-1">
          {order.fulfillment.history.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px]">
              <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${i === order.fulfillment.history.length - 1 ? "bg-[--coral]" : "bg-[--ink]/30"}`} />
              <span>
                <strong className="text-[--ink]">{STATUS_LABEL[h.status] ?? h.status}</strong>
                <span className="text-[--ink-faint]"> — {new Date(h.at).toLocaleString()}</span>
              </span>
            </li>
          ))}
        </ul>
        {inProductionPhase && order.usernameFinal && <ProductionSummary order={order} />}
      </Section>
    </div>
  );
}

function CardThumb({ template }: { template: CardTemplateId }) {
  const art = CARD_TEMPLATE_ART[template] ?? CARD_TEMPLATE_ART.classic;
  if (["simple", "lux", "wood", "inverted"].includes(template)) {
    return <img src={`/card-designs/${template}.png`} alt={`${template} card design`} className="h-20 w-32 rounded-xl object-cover ring-1 ring-[--ink]/10" />;
  }
  return (
    <div className={`grid h-20 w-32 place-items-center rounded-xl ring-1 ring-[--ink]/10 ${art.bg}`}>
      <div className="text-center">
        <NfcWaves className={`mx-auto h-6 w-6 ${art.icon}`} />
        <p className={`mt-1 font-display text-[10px] font-bold ${art.text}`}>EDGE TAP</p>
      </div>
    </div>
  );
}

// ── Production summary (spec §10) ────────────────────────────────
function ProductionSummary({ order }: { order: Order }) {
  const [qr, setQr] = useState<string>("");
  useEffect(() => {
    if (!order.usernameFinal) return;
    qrDataUrl(profileUrl(order.usernameFinal)).then(setQr).catch(() => {});
  }, [order.usernameFinal]);

  const url = order.nfcUrl || (order.usernameFinal ? profileUrl(order.usernameFinal) : "");

  const text =
    `EDGE TAP — PRODUCTION ORDER\n` +
    `Order: ${order.orderNumber}\n` +
    `Customer: ${order.customer.fullName}\n` +
    `Card: ${order.card.template} ×${order.card.quantity}\n` +
    `Profile URL: ${url}\n` +
    `NFC destination: ${url}\n` +
          (order.card.template === "upload" && order.card.customDesignUrl ? `Custom art: ${order.card.customDesignUrl}\n` : "") +
    `Status: ${order.fulfillment.status}`;

  return (
    <div className="mt-4 rounded-xl border border-dashed border-[--ink]/20 bg-[--yellow-soft]/40 p-4">
      <p className="font-display text-[12px] font-bold uppercase tracking-widest text-[--ink]">Production summary</p>
      <p className="mt-1 text-[13px] text-[--ink-soft]">Program the NFC chip and print this QR onto the card — both point to the EdgeTap profile.</p>
      <div className="mt-3 flex flex-wrap gap-4">
        <div className="rounded-lg bg-white p-2 ring-1 ring-[--ink]/10">
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt={`QR for ${url}`} className="h-28 w-28" />
          ) : (
            <span className="grid h-28 w-28 place-items-center text-[11px] text-[--ink-faint]">generating…</span>
          )}
        </div>
        <pre className="min-w-0 flex-1 overflow-auto rounded-lg bg-white p-3 text-[11px] leading-relaxed text-[--ink] ring-1 ring-[--ink]/10">
          {text}
        </pre>
      </div>
      <button
        onClick={() => navigator.clipboard?.writeText(text)}
        className="mt-3 rounded-xl bg-[--ink]/5 px-4 py-2 text-[12px] font-bold text-[--ink] hover:bg-[--ink]/10"
      >
        Copy block
      </button>
    </div>
  );
}

// ── Create Client Profile modal ───────────────────────────────────
function CreateClientProfileModal({
  order,
  onClose,
  onDone,
}: {
  order: Order;
  onClose: () => void;
  onDone: () => void;
}) {
  const [username, setUsername] = useState(() => order.profileDraft.usernameSuggested || "");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username && order.customer.fullName) {
      const parts = order.customer.fullName.trim().split(/\s+/);
      suggestUsername(parts[0], parts.slice(1).join("")).then((s) => setUsername(s));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.customer.fullName]);

  const check = async (u: string) => {
    const clean = u.toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 30);
    if (!clean) return setAvailable(null);
    setChecking(true);
    try {
      setAvailable(await usernameAvailable(clean));
    } catch {
      setAvailable(null);
    } finally {
      setChecking(false);
    }
  };

  const create = async () => {
    setError("");
    if (!username.trim()) return setError("Enter a username.");
    setBusy(true);
    try {
      await createClientProfileFromOrder(order, username);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't create profile.");
      setBusy(false);
    }
  };

  const availableNow = available === true || (available === null && username.trim().toLowerCase() === (order.usernameFinal || "").toLowerCase());

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[--ink]/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-[--cream] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-[--ink]/10 px-6 py-4">
          <h3 className="font-display text-lg font-bold text-[--ink]">Create Client Profile</h3>
          <button onClick={onClose} className="text-[--ink-faint] hover:text-[--ink]" aria-label="Close">✕</button>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-widest text-[--ink-faint]">Customer</p>
            <p className="font-display text-base font-bold text-[--ink]">{order.customer.fullName}</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-[--ink]">Profile handle</label>
            <div className="flex gap-2">
              <span className="grid place-items-center rounded-xl bg-[--ink]/5 px-3 text-sm font-bold text-[--ink]">/u/</span>
              <input
                value={username}
                onChange={(e) => {
                  const v = e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 30);
                  setUsername(v);
                  setAvailable(null);
                }}
                onBlur={() => check(username)}
                placeholder="ahmadkhan"
                className="min-w-0 flex-1 rounded-xl border border-[--ink]/10 bg-white px-3 py-2.5 text-sm text-[--ink] outline-none focus:border-[--ink]/30"
              />
              <button
                onClick={() => check(username)}
                disabled={checking}
                className="rounded-xl bg-[--ink]/5 px-3 py-2 text-[12px] font-bold text-[--ink] hover:bg-[--ink]/10"
              >
                {checking ? "…" : "Check"}
              </button>
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-[12px]">
              {available === true && <span className="font-bold text-[--mint]">✓ Available</span>}
              {available === false && <span className="font-bold text-[--coral]">✕ Taken — try another.</span>}
              {availableNow && order.usernameFinal && <span className="text-[--ink-faint]">(already live as {order.usernameFinal})</span>}
              {checking && <span className="text-[--ink-faint]">Checking…</span>}
            </div>
          </div>

          <div className="rounded-xl bg-[--yellow-soft]/50 p-3 text-[12px] leading-relaxed text-[--ink-soft]">
            Creates the profile from this order&apos;s draft: avatar, name, bio and links. The username is checked for collisions —
            nothing is overwritten. After this, the NFC chip and QR both point to <strong>/u/{username}</strong> (never to a social platform).
          </div>

          {error && <p className="rounded-xl bg-[--coral]/10 p-3 text-sm text-[--coral]">{error}</p>}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-xl bg-[--ink]/5 px-4 py-2.5 text-sm font-bold text-[--ink]">Cancel</button>
            <button onClick={create} disabled={busy} className="btn btn-ink flex-1 px-4 py-2.5 text-sm">
              {busy ? "Creating…" : "Create profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}