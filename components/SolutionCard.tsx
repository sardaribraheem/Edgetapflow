import OfferVisual from "./OfferVisual";
import { ArrowCurveDoodle } from './doodles';
import Link from "next/link";
import type { Solution } from "@/lib/data/content";
export default function SolutionCard({ solution, duplicate = false }: { solution: Solution; duplicate?: boolean }) {
  return (
    <article aria-hidden={duplicate || undefined} className="offer-card card-paper group relative flex shrink-0 flex-col overflow-hidden p-7 sm:p-8 md:p-9">
      {/* index + tag */}
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-semibold text-[var(--ink-soft)]">
          {solution.index}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="eyebrow text-[var(--ink-soft)]">{solution.tag}</span>
        </span>
      </div>

      {/* big monochrome illustration panel */}
      <div className="relative mt-6 grid h-48 place-items-center overflow-hidden rounded-2xl bg-[var(--ink-ghost)] ring-1 ring-[var(--ink)]/8 sm:h-56">
        <OfferVisual kind={solution.index}/>
      </div>

      {/* big title + description */}
      <h3 className="mt-6 font-display text-[clamp(1.7rem,4.5vw,2.5rem)] font-semibold leading-[1.05] text-[var(--ink)]">
        {solution.title}
      </h3>
      <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--ink-soft)]">
        {solution.description}
      </p>

      {/* bullets */}
      <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
        {solution.bullets.map((b) => (
          <span
            key={b}
            className="rounded-full bg-[var(--ink)]/5 px-3 py-1 text-[12px] font-medium text-[var(--ink-soft)] ring-1 ring-[var(--ink)]/6"
          >
            {b}
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2 font-display text-sm font-semibold text-[var(--ink)]">
        <Link href="/pricing" tabIndex={duplicate ? -1 : undefined} onPointerDown={duplicate ? event => event.preventDefault() : undefined} className="min-h-11 inline-flex items-center underline">
          Get Your EdgeTap
        </Link>
        <ArrowCurveDoodle className="h-5 w-5 text-[var(--ink-soft)] transition-transform group-hover:rotate-12" />
      </div>
    </article>
  );
}
