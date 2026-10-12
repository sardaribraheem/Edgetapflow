"use client";
import { useEffect, useState } from 'react';
import type { Order } from '@/lib/data/order';
import { createClientProfileFromOrder, suggestUsername, usernameAvailable } from '@/lib/data-service';
export default function PublishProfileModal({
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
      suggestUsername(parts[0], parts.slice(1).join("")).then((s) => setUsername(s)).catch(() => setError("Could not suggest a handle. Enter one and check availability."));
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--ink)]/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-[var(--cream)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true" aria-label="Create Client Profile"
      >
        <div className="flex items-center justify-between border-b border-[var(--ink)]/10 px-6 py-4">
          <h3 className="font-display text-lg font-bold text-[var(--ink)]">Create Client Profile</h3>
          <button onClick={onClose} className="text-[var(--ink-faint)] hover:text-[var(--ink)]" aria-label="Close">✕</button>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--ink-faint)]">Customer</p>
            <p className="font-display text-base font-bold text-[var(--ink)]">{order.customer.fullName}</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-[var(--ink)]">Profile handle</label>
            <div className="flex gap-2">
              <span className="grid place-items-center rounded-xl bg-[var(--ink)]/5 px-3 text-sm font-bold text-[var(--ink)]">/u/</span>
              <input
                value={username}
                onChange={(e) => {
                  const v = e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 30);
                  setUsername(v);
                  setAvailable(null);
                }}
                onBlur={() => check(username)}
                placeholder="ahmadkhan"
                className="min-w-0 flex-1 rounded-xl border border-[var(--ink)]/10 bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/30"
              />
              <button
                onClick={() => check(username)}
                disabled={checking}
                className="rounded-xl bg-[var(--ink)]/5 px-3 py-2 text-[12px] font-bold text-[var(--ink)] hover:bg-[var(--ink)]/10"
              >
                {checking ? "…" : "Check"}
              </button>
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-[12px]">
              {available === true && <span className="font-bold text-[var(--mint)]">✓ Available</span>}
              {available === false && <span className="font-bold text-[var(--coral)]">✕ Taken — try another.</span>}
              {availableNow && order.usernameFinal && <span className="text-[var(--ink-faint)]">(already live as {order.usernameFinal})</span>}
              {checking && <span className="text-[var(--ink-faint)]">Checking…</span>}
            </div>
          </div>

          <div className="rounded-xl bg-[var(--yellow-soft)]/50 p-3 text-[12px] leading-relaxed text-[var(--ink-soft)]">
            Creates the profile from this order&apos;s draft: avatar, name, bio and links. The username is checked for collisions —
            nothing is overwritten. After this, the NFC chip and QR both point to <strong>/u/{username}</strong> (never to a social platform).
          </div>

          {error && <p className="rounded-xl bg-[var(--coral)]/10 p-3 text-sm text-[var(--coral)]">{error}</p>}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-xl bg-[var(--ink)]/5 px-4 py-2.5 text-sm font-bold text-[var(--ink)]">Cancel</button>
            <button onClick={create} disabled={busy} className="btn btn-ink flex-1 px-4 py-2.5 text-sm">
              {busy ? "Creating…" : "Create profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
