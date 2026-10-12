import Link from "next/link";
import EdgeTapCard from "./EdgeTapCard";
import { SparkleDoodle, ArrowDoodle } from "./doodles";

// Final CTA — the EdgeTap card returns as the culmination of the page.
export default function FinalCTA() {
  return (
    <section id="get-started" className="section relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/4 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--yellow-soft)] opacity-80 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[var(--sky-soft)] opacity-70 blur-3xl" />
      </div>

      <div className="container-x relative flex flex-col items-center text-center">
        <div className="mb-8 rotate-[-4deg] animate-float-slow">
          <EdgeTapCard rotate />
        </div>

        <h2 className="text-display max-w-4xl text-[clamp(2.8rem,8vw,6.5rem)] text-[var(--ink)]">
          Ready to tap into
          <br />
          something <span className="text-[var(--coral)]">better?</span>
        </h2>

        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[var(--ink-soft)]">
          Order a physical NFC card with a QR fallback and your own digital profile.
          Rs. 999 per card. Delivery cost and timing are confirmed for your location.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link href="/pricing" className="btn btn-ink px-9 py-4 text-[17px]">
            Get Your EdgeTap <span aria-hidden="true">→</span>
          </Link>
          <Link href="#top" className="btn btn-ghost px-7 py-4 text-[15px]">
            Back to top
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-3 text-[var(--ink-faint)]">
          <span className="font-display text-sm font-semibold uppercase tracking-[0.18em]">
            One tap
          </span>
          <ArrowDoodle className="h-6 w-6 text-[var(--coral)]" />
          <span className="font-display text-sm font-semibold uppercase tracking-[0.18em]">
            Infinite possibilities
          </span>
          <SparkleDoodle className="h-5 w-5 text-[var(--yellow)]" />
        </div>
      </div>
    </section>
  );
}
