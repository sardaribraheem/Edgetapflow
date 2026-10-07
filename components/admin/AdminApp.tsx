"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@/lib/auth";
import { NfcWaves, SparkleDoodle } from "@/components/doodles";
import { getOrders, listReviews } from "@/lib/data-service";
import { Order } from "@/lib/data/order";
import { Review } from "@/lib/models";
import OrdersView from "./OrdersView";
import ProfilesView from "./ProfilesView";

export type AdminView = "dashboard" | "orders" | "clients" | "profiles" | "reviews" | "settings";

const VIEWS: { id: AdminView; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "orders", label: "Orders" },
  { id: "clients", label: "Clients" },
  { id: "profiles", label: "Profiles" },
  { id: "reviews", label: "Reviews" },
  { id: "settings", label: "Settings" },
];

export default function AdminApp({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [view, setView] = useState<AdminView>("dashboard");
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadError, setLoadError] = useState("");
  const [loadedOnce, setLoadedOnce] = useState(false);

  const applyData = (o: Order[], r: Review[]) => {
    setOrders(o);
    setReviews(r);
    setLoadError("");
  };

  const failData = (e: unknown) => {
    console.error("[EdgeTap] Admin data load failed:", e);
    setLoadError(
      e instanceof Error ? e.message : "Couldn't load service data. Verify configuration and staff access."
    );
  };

  const refresh = async () => {
    try {
      const [o, r] = await Promise.all([getOrders(), listReviews(20)]);
      applyData(o, r);
    } catch (e) {
      failData(e);
    } finally {
      setLoadedOnce(true);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [o, r] = await Promise.all([getOrders(), listReviews(20)]);
        if (!active) return;
        applyData(o, r);
      } catch (e) {
        if (!active) return;
        failData(e);
      } finally {
        if (active) setLoadedOnce(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[--cream]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row">
        {/* sidebar / tabs */}
        <aside className="lg:w-60 lg:shrink-0">
          <div className="card-paper p-4">
            <Link href="/" className="mb-4 flex items-center gap-2 rounded-xl px-2 py-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[--yellow]">
                <NfcWaves className="h-5 w-5 text-[--ink]" />
              </span>
              <div>
                <p className="font-display text-sm font-bold leading-none text-[--ink]">EdgeTap Admin</p>
                <p className="mt-1 text-[11px] text-[--ink-faint]">{user.email}</p>
              </div>
            </Link>

            <nav className="flex flex-wrap gap-1 lg:flex-col" aria-label="Admin sections">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  aria-current={view === v.id ? "page" : undefined}
                  className={`admin-nav-button rounded-xl px-4 py-2.5 text-left text-[13px] font-bold transition-colors ${
                    view === v.id
                      ? "bg-[--ink] text-white"
                      : "hover:bg-[--ink]/5"
                  }`}
                >
                  {v.label}
                  {v.id === "orders" && orders.filter((o) =>
                    ["new", "payment_pending", "paid", "cod_pending_confirmation"].includes(o.fulfillment.status)
                  ).length > 0 && (
                    <span className="ml-2 rounded-full bg-[--coral] px-1.5 text-[10px] font-bold text-white">
                      {orders.filter((o) =>
                        ["new", "payment_pending", "paid", "cod_pending_confirmation"].includes(o.fulfillment.status)
                      ).length}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="mt-4 flex flex-col gap-2 border-t border-[--ink]/10 pt-4">
              <Link href="/u/ibraheem" target="_blank" className="rounded-xl bg-[--yellow-soft] px-4 py-2 text-center text-[12px] font-bold text-[--ink] hover:bg-[--yellow]">
                View Live Profile ↗
              </Link>
              <button onClick={onLogout} className="rounded-xl bg-[--ink]/5 px-4 py-2 text-[12px] font-bold text-[--ink] hover:bg-[--ink]/10">
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* content */}
        <main className="min-w-0 flex-1">
          {!loadedOnce ? (
            <div className="card-paper flex items-center justify-center p-16 font-display text-[--ink]">
              Loading dashboard…
            </div>
          ) : loadError ? (
            <div className="card-paper p-8">
              <div className="flex items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[--coral]/15 text-[--coral]">⚠️</span>
                <div>
                  <h2 className="font-display text-lg font-bold text-[--ink]">Couldn&apos;t load dashboard data</h2>
                  <p className="mt-1 text-sm text-[--ink-soft]">{loadError}</p>
                  <button onClick={refresh} className="btn btn-ink mt-4 px-5 py-2 text-[12px]">Retry</button>
                </div>
              </div>
            </div>
          ) : view === "dashboard" ? (
            <DashboardView orders={orders} reviews={reviews} onOpenOrders={() => setView("orders")} />
          ) : view === "orders" ? (
            <OrdersView orders={orders} onChanged={refresh} />
          ) : view === "clients" ? (
            <ClientsView orders={orders} />
          ) : view === "profiles" ? (
            <ProfilesView user={user} />
          ) : view === "reviews" ? (
            <ReviewsView reviews={reviews} />
          ) : (
            <SettingsView user={user} />
          )}
        </main>
      </div>
    </div>
  );
}

// ── Dashboard metrics ────────────────────────────────────────────
function DashboardView({
  orders,
  reviews,
  onOpenOrders,
}: {
  orders: Order[];
  reviews: Review[];
  onOpenOrders: () => void;
}) {
  const awaiting = orders.filter((o) =>
    ["new", "payment_pending", "paid", "cod_pending_confirmation"].includes(o.fulfillment.status)
  ).length;
  const inProduction = orders.filter((o) =>
    ["profile_created", "production_ready", "printing", "ready_for_nfc", "nfc_programmed", "qa_passed"].includes(o.fulfillment.status)
  ).length;
  const readyToShip = orders.filter((o) =>
    ["ready_to_ship", "shipped"].includes(o.fulfillment.status)
  ).length;
  const completed = orders.filter((o) => o.fulfillment.status === "delivered").length;
  const recentCompleted = orders.filter((o) => o.fulfillment.status === "delivered").slice(0, 5);
  const clients = orders.map((o) => o.customer.email).filter((e, i, a) => e && a.indexOf(e) === i).length;
  const profiles = orders.filter((o) => o.profileId).length; // profiles created from orders
  const freshReviews = reviews.length;

  const metrics = [
    { label: "Orders awaiting action", value: awaiting, tone: "text-[--coral]" },
    { label: "Total clients", value: clients, tone: "text-[--ink]" },
    { label: "Active profiles", value: profiles, tone: "text-[--ink]" },
    { label: "Reviews", value: freshReviews, tone: "text-[--ink]" },
    { label: "In production", value: inProduction, tone: "text-[--ink]" },
    { label: "Ready for NFC", value: orders.filter((o) => o.fulfillment.status === "ready_for_nfc").length, tone: "text-[--ink]" },
    { label: "Ready to ship", value: readyToShip, tone: "text-[--ink]" },
    { label: "Recently completed", value: completed, tone: "text-[--mint]" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-[--ink]">Dashboard</h1>
      <p className="text-sm text-[--ink-soft]">A live snapshot of your EdgeTap pipeline.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="card-paper p-5">
            <p className={`font-display text-3xl font-bold ${m.tone}`}>{m.value}</p>
            <p className="mt-1 text-[12px] font-semibold text-[--ink-soft]">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card-paper p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[--ink]">Orders awaiting action</h2>
            <button onClick={onOpenOrders} className="text-[12px] font-bold text-[--sky] hover:underline">View all →</button>
          </div>
          <div className="mt-4 space-y-2">
            {orders.slice(0, 6).map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-[--ink]/8">
                <div>
                  <p className="text-sm font-bold text-[--ink]">{o.customer.fullName}</p>
                  <p className="text-[12px] text-[--ink-soft]">{o.orderNumber} · {o.card.template}</p>
                </div>
                <span className="rounded-full bg-[--coral]/10 px-2.5 py-1 text-[11px] font-bold text-[--coral]">
                  {o.fulfillment.status.replace(/_/g, " ")}
                </span>
              </div>
            ))}
            {orders.length === 0 && <p className="text-sm text-[--ink-faint]">No orders yet.</p>}
          </div>
        </div>

        <div className="card-paper p-6">
          <h2 className="font-display text-base font-bold text-[--ink]">Recently completed</h2>
          <div className="mt-4 space-y-2">
            {recentCompleted.length === 0 && <p className="text-sm text-[--ink-faint]">None yet.</p>}
            {recentCompleted.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-[--ink]/8">
                <p className="text-sm font-bold text-[--ink]">{o.customer.fullName}</p>
                <span className="rounded-full bg-[--mint]/15 px-2.5 py-1 text-[11px] font-bold text-[--ink]">✓ Delivered</span>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-[--ink]/8 pt-4">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[--ink-faint]">Latest reviews</p>
            {freshReviews === 0 ? (
              <p className="mt-2 text-sm text-[--ink-faint]">No reviews yet — review cards go out after delivery.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {reviews.slice(0, 3).map((r) => (
                  <li key={r.id} className="text-sm text-[--ink]">
                    <strong>{"★".repeat(r.rating)}</strong> {r.text.slice(0, 80)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Clients ──────────────────────────────────────────────────────
function ClientsView({ orders }: { orders: Order[] }) {
  const clients: (Order["customer"] & { orderId: string; orderNumber: string; createdAt: number })[] = [];
  for (const o of orders) {
    const entry = { ...o.customer, orderId: o.id || "", orderNumber: o.orderNumber, createdAt: o.createdAt };
    if (o.customer.email && !clients.some((x) => x.email === entry.email)) clients.push(entry);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-[--ink]">Clients</h1>
      <p className="text-sm text-[--ink-soft]">Customers by email (deduplicated from orders).</p>
      <div className="mt-6 space-y-3">
        {clients.map((c) => (
          <div key={c.orderId} className="card-paper flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <p className="font-display font-bold text-[--ink]">{c.fullName}</p>
              <p className="text-[13px] text-[--ink-soft]">{c.email} · {c.phone}</p>
              <p className="text-[12px] text-[--ink-faint]">{c.city} · {c.orderNumber}</p>
            </div>
            <span className="rounded-full bg-[--sky-soft] px-3 py-1 text-[11px] font-bold text-[--ink]">
              {new Date(c.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
        {clients.length === 0 && <p className="card-paper p-6 text-sm text-[--ink-faint]">No clients yet.</p>}
      </div>
    </div>
  );
}

// ── Reviews ──────────────────────────────────────────────────────
function ReviewsView({ reviews }: { reviews: Review[] }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-[--ink]">Reviews</h1>
      <p className="text-sm text-[--ink-soft]">Public reviews left for client profiles.</p>
      <div className="mt-6 space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="card-paper p-5">
            <div className="flex items-center justify-between">
              <p className="font-display font-bold text-[--ink]">{r.authorName}</p>
              <span className="font-display text-[--yellow]">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
            </div>
            <p className="mt-2 text-sm text-[--ink-soft]">{r.text}</p>
            <p className="mt-2 text-[11px] text-[--ink-faint]">
              /u/{r.username} · reviewed {new Date(r.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="card-paper p-6 text-sm text-[--ink-faint] flex items-center gap-3">
            <SparkleDoodle className="h-5 w-5 text-[--yellow]" />
            No reviews yet. Review cards go out after delivery.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Settings ─────────────────────────────────────────────────────
function SettingsView({ user }: { user: User }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-[--ink]">Settings</h1>
      <div className="card-paper mt-6 space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[--ink]">Signed in as</p>
            <p className="text-sm text-[--ink-soft]">{user.email}</p>
          </div>
          <span className="rounded-full bg-[--mint-soft] px-3 py-1 text-[11px] font-bold text-[--ink]">Admin UID: {user.uid.slice(0, 12)}…</span>
        </div>
        <div className="border-t border-[--ink]/10 pt-4">
          <p className="text-[12px] font-bold uppercase tracking-widest text-[--ink-faint]">Admin authorization</p>
          <p className="mt-2 text-sm text-[--ink-soft]">
            Staff access requires an operator-managed membership linked to your authenticated account. Account metadata cannot grant staff access.
          </p>
        </div>
      </div>
      <div className="card-paper mt-4 p-6">
        <p className="text-sm font-bold text-[--ink]">Service readiness</p>
        <p className="mt-2 text-[13px] leading-relaxed text-[--ink-soft]">
          Orders, profiles, reviews and uploads require configured authentication, database and storage services;
          customer checkout requires an account so profile ownership remains secure. <Link className="font-bold text-[--sky] hover:underline" href="/pricing">See pricing</Link> for the available card.
        </p>
      </div>
    </div>
  );
}