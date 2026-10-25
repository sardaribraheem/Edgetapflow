"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type {User} from '@/lib/auth';
import { nav } from "@/lib/data/content";
import { NfcWaves, SparkleDoodle } from "./doodles";

type Props = {
  user:User|null;
  authReady:boolean;
  open: boolean;
  onClose: () => void;
};

// Side drawer for mobile navigation — visually consistent with EdgeTap.
export default function MobileMenu({ open, onClose, user, authReady }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  // lock scroll + Escape to close
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const nodes = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button') || []);
    nodes()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const items = nodes();
        if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items.at(-1)?.focus(); }
        else if (!e.shiftKey && document.activeElement === items.at(-1)) { e.preventDefault(); items[0]?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      {/* backdrop */}
      <button
        aria-label="Close menu"
        onClick={onClose}
        className={`absolute inset-0 bg-[var(--ink)]/30 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        tabIndex={open ? 0 : -1}
      />

      {/* drawer */}
      <div
        id="mobile-menu"
        ref={dialogRef}
        inert={!open}
        aria-hidden={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`absolute right-0 top-0 flex h-full w-[min(84vw,360px)] flex-col overflow-y-auto bg-[var(--paper)] shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 pt-5">
          <Link href="/" onClick={onClose} className="font-display text-lg font-bold tracking-tight text-[var(--ink)]">
            EDGE TAP
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="grid h-10 w-10 place-items-center rounded-full bg-[var(--ink)]/6 text-[var(--ink)]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* links */}
        <nav className="mt-6 flex flex-col px-5">
          {nav.links.map((l, i) => (
            <a
              key={l.label}
              href={l.href}
              onClick={onClose}
              className="flex items-center justify-between border-b border-[var(--ink)]/8 py-4 font-display text-2xl font-semibold text-[var(--ink)] transition-colors hover:text-[var(--ink-soft)]"
            >
              <span>{l.label}</span>
              <span className="text-[var(--ink-faint)]">0{i + 1}</span>
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="mt-auto px-5 pb-6">
          <Link href="/account" onClick={onClose} className="btn btn-ghost mb-3 w-full px-6 py-3 text-base">
            {authReady?(user?'My account':'Sign in / Login'):'Checking account…'}
          </Link>
          {authReady&&user&&<Link href="/account/profile" onClick={onClose} className="btn btn-ghost mb-3 w-full px-6 py-3 text-base">Edit profile</Link>}
          <a
            href={nav.cta.href}
            onClick={onClose}
            className="btn btn-ink w-full px-6 py-4 text-base"
          >
            {nav.cta.label} <span aria-hidden="true">→</span>
          </a>
          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[var(--ink-mid)]">
            <NfcWaves className="h-4 w-4 text-[var(--yellow)]" />
            One tap. Infinite possibilities.
          </div>
        </div>

        {/* corner sparkle */}
        <SparkleDoodle className="absolute left-4 top-24 h-8 w-8 text-[var(--yellow)]" />
      </div>
    </div>
  );
}
