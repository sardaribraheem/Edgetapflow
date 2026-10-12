"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { nav } from "@/lib/data/content";
import MobileMenu from "./MobileMenu";
import { NfcWaves } from "./doodles";

// Floating rounded pill navigation; collapses to a drawer on mobile.
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="fixed inset-x-0 top-4 z-40 px-4">
        <div className="container-x">
          <nav aria-label="Main navigation" className="flex items-center justify-between rounded-full bg-white/85 px-2.5 py-2 shadow-[0_14px_40px_-16px_rgba(16,11,74,0.35)] ring-1 ring-[var(--ink)]/6 backdrop-blur-md">
            {/* brand */}
            <Link href="/" aria-label="EdgeTap home" prefetch={false} className="flex items-center gap-2 rounded-full px-2 py-1.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--yellow)]">
                <NfcWaves className="h-5 w-5 text-[var(--ink)]" />
              </span>
              <span className="hidden font-display text-[15px] font-bold tracking-tight text-[var(--ink)] sm:block">
                EDGE TAP
              </span>
            </Link>

            {/* desktop links */}
            <div className="hidden items-center gap-1 lg:flex">
              {nav.links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="rounded-full px-4 py-2 text-[13px] font-medium text-[var(--ink-soft)] transition-colors hover:bg-[var(--ink)]/5 hover:text-[var(--ink)]"
                >
                  {l.label}
                </a>
              ))}
            </div>

            {/* right actions */}
            <div className="flex items-center gap-2">
              <a href={nav.cta.href} className="nav-order-cta btn btn-ink px-5 py-2.5 text-[13px]">
                {nav.cta.label} <span aria-hidden="true">→</span>
              </a>
              <Link href="/account" prefetch={false} className="nav-account-link btn whitespace-nowrap bg-white px-5 py-2.5 text-[13px] ring-1 ring-[var(--ink)]/15 hover:bg-[var(--cream)]">
                Sign in
              </Link>

              {/* mobile menu button */}
              <button
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className="grid h-11 w-11 place-items-center rounded-full bg-[var(--ink)]/6 text-[var(--ink)] lg:hidden"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                  <path d="M4 7h16M4 12h16M4 17h10" />
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
  );
}
