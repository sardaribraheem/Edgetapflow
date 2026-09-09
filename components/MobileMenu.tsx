"use client";

import { useEffect } from "react";
import Link from "next/link";
import { nav } from "@/lib/data/content";
import { NfcWaves, SparkleDoodle } from "./doodles";

type Props = {
  open: boolean;
  onClose: () => void;
};

// Side drawer for mobile navigation — visually consistent with EdgeTap.
export default function MobileMenu({ open, onClose }: Props) {
  // lock scroll + Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}>
      {/* backdrop */}
      <button
        aria-label="Close menu"
        onClick={onClose}
        className={`absolute inset-0 bg-[--ink]/30 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        tabIndex={open ? 0 : -1}
      />

      {/* drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`absolute right-0 top-0 flex h-full w-[min(84vw,360px)] flex-col bg-[--paper] shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 pt-5">
          <Link href="/" onClick={onClose} className="font-display text-lg font-bold tracking-tight text-[--ink]">
            EDGE TAP
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="grid h-10 w-10 place-items-center rounded-full bg-[--ink]/6 text-[--ink]"
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
              className="flex items-center justify-between border-b border-[--ink]/8 py-4 font-display text-2xl font-semibold text-[--ink] transition-colors hover:text-[--ink-soft]"
            >
              <span>{l.label}</span>
              <span className="text-[--ink-faint]">0{i + 1}</span>
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="mt-auto px-5 pb-6">
          <a
            href={nav.cta.href}
            onClick={onClose}
            className="btn btn-ink w-full px-6 py-4 text-base"
          >
            {nav.cta.label} <span aria-hidden="true">→</span>
          </a>
          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[--ink-mid]">
            <NfcWaves className="h-4 w-4 text-[--yellow]" />
            One tap. Infinite possibilities.
          </div>
        </div>

        {/* corner sparkle */}
        <SparkleDoodle className="absolute left-4 top-24 h-8 w-8 text-[--yellow]" />
      </div>
    </div>
  );
}
