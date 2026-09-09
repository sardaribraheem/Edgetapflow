import Link from "next/link";
import EdgeTapCard from "./EdgeTapCard";
import { SparkleDoodle, TapRipple, StarDoodle, ArrowDoodle } from "./doodles";

// Final CTA — the EdgeTap card returns as the culmination of the page.
export default function FinalCTA() {
  return (
    <section id="get-started" className="section relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/4 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[--yellow-soft] opacity-80 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[--sky-soft] opacity-70 blur-3xl" />
      </div>

      <div className="container-x relative flex flex-col items-center text-center">
        <div className="mb-8 rotate-[-4deg] animate-float-slow">
          <EdgeTapCard rotate />
        </div>

        <h2 className="text-display max-w-4xl text-[clamp(2.8rem,8vw,6.5rem)] text-[--ink]">
          Ready to tap into
          <br />
          something <span className="text-[--coral]">better?</span>
        </h2>

        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[--ink-soft]">
          Get your EdgeTap and turn every introduction, table and customer
          moment into a digital experience that matters.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link href="mailto:hello@edgetap.com" className="btn btn-ink px-9 py-4 text-[17px]">
            Get Your EdgeTap <span aria-hidden="true">→</span>
          </Link>
          <Link href="#top" className="btn btn-ghost px-7 py-4 text-[15px]">
            Back to top
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-3 text-[--ink-faint]">
          <span className="font-display text-sm font-semibold uppercase tracking-[0.18em]">
            One tap
          </span>
          <ArrowDoodle className="h-6 w-6 text-[--coral]" />
          <span className="font-display text-sm font-semibold uppercase tracking-[0.18em]">
            Infinite possibilities
          </span>
          <SparkleDoodle className="h-5 w-5 text-[--yellow]" />
        </div>
      </div>
    </section>
  );
}
