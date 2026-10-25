"use client";
import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/Icon';
import InfoHelp from '@/components/ui/InfoHelp';
import type { Order } from '@/lib/data/order';
import { createClientProfileFromOrder, getProfile, suggestUsername, usernameAvailable } from '@/lib/data-service';
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
  const [published,setPublished]=useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null), checkingVersion = useRef(0), operation = useRef(false);
  useEffect(() => {
    const prior = document.body.style.overflow, focused = document.activeElement as HTMLElement|null;
    const modal = dialog.current, versions = checkingVersion;
    modal?.showModal(); document.body.style.overflow = 'hidden';
    return () => { modal?.close(); document.body.style.overflow = prior; focused?.focus(); versions.current++; };
  }, []);

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
    const version = ++checkingVersion.current;
    setChecking(true);
    try {
      const result = await usernameAvailable(clean);
      if (version === checkingVersion.current) setAvailable(result);
    } catch {
      if (version === checkingVersion.current) setAvailable(null);
    } finally {
      if (version === checkingVersion.current) setChecking(false);
    }
  };

  const create = async () => {
    if (operation.current) return;
    setError("");
    if (!/^[a-z0-9._-]{1,30}$/.test(username) || ['.','..'].includes(username)) return setError("Enter a valid profile handle.");
    operation.current = true;
    setBusy(true);
    try {
      const result=await createClientProfileFromOrder(order, username);
      const visible=await getProfile(username);
      const expected='https://edgetap.tech/u/'+username;
      if(result.profileUrl!==expected||visible.profileId!==result.profileId)throw new Error('The public profile could not be confirmed. Refresh the order before retrying.');
      setPublished(expected);setBusy(false);operation.current=false;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't create profile.");
      setBusy(false);
      operation.current = false;
    }
  };

  const availableNow = available === true || (available === null && username.trim().toLowerCase() === (order.usernameFinal || "").toLowerCase());

  return (
      <dialog ref={dialog}
        className="publication-dialog w-[calc(100%_-_2rem)] max-w-lg overflow-auto rounded-3xl bg-[var(--cream)] p-0 text-[var(--ink)] shadow-2xl"
        onCancel={event=>{event.preventDefault();if(!operation.current)onClose();}}
        onClick={event=>{if(event.target===event.currentTarget&&!operation.current)onClose();}}
        aria-modal="true" aria-label="Create Client Profile"
      >
        <div className="flex items-center justify-between border-b border-[var(--ink)]/10 px-6 py-4">
          <h3 className="font-display text-lg font-bold text-[var(--ink)]">Create Client Profile</h3>
          <button onClick={published?onDone:onClose} disabled={busy} className="icon-button" aria-label="Close"><Icon name="close"/></button>
        </div>

        {published?<div className="space-y-4 p-6"><h4 className="font-display text-2xl">Profile is live</h4><p>The digital profile is available now. Printing and delivery can continue separately.</p><a href={published} target="_blank" rel="noreferrer" className="block break-all font-bold underline">{published}</a><button type="button" className="btn btn-ink px-5 py-3" onClick={onDone}>Done</button></div>:<div className="space-y-4 p-6">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--ink-faint)]">Customer</p>
            <p className="font-display text-base font-bold text-[var(--ink)]">{order.customer.fullName}</p>
          </div>

          <div>
            <label htmlFor="publish-handle" className="mb-1 block text-xs font-bold text-[var(--ink)]">Profile handle</label>
            <div className="flex gap-2">
              <span className="grid place-items-center rounded-xl bg-[var(--ink)]/5 px-3 text-sm font-bold text-[var(--ink)]">/u/</span>
              <input
                id="publish-handle" disabled={busy}
                value={username}
                onChange={(e) => {
                  const v = e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 30);
                  setUsername(v);
                  checkingVersion.current++; setChecking(false);
                  setAvailable(null);
                }}
                onBlur={() => check(username)}
                placeholder="ahmadkhan"
                className="min-w-0 flex-1 rounded-xl border border-[var(--ink)]/10 bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/30"
              />
              <button
                onClick={() => check(username)}
                disabled={checking||busy}
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

          <p className="text-sm">Your live link → <strong>https://edgetap.tech/u/{username}</strong></p>
          <InfoHelp title="Publishing a profile"><p>Publishes the avatar, name, bio and links from this order. The database reserves the handle in a transaction and rejects collisions or stale orders.</p><p>This requires an accepted application, verified card payment and confirmed card details. You can publish now; printing does not need to be finished. Once published, the handle stays fixed so existing cards keep working.</p></InfoHelp>

          {error && <p className="rounded-xl bg-[var(--coral)]/10 p-3 text-sm text-[var(--coral)]">{error}</p>}

          <div className="flex gap-3">
            <button onClick={published?onDone:onClose} disabled={busy} className="flex-1 rounded-xl bg-[var(--ink)]/5 px-4 py-2.5 text-sm font-bold text-[var(--ink)]">Cancel</button>
            <button onClick={create} disabled={busy||available===false} className="btn btn-ink flex-1 px-4 py-2.5 text-sm"><Icon name="eye" size={18}/>
              {busy ? "Creating…" : "Create profile"}
            </button>
          </div>
        </div>}
      </dialog>
  );
}
