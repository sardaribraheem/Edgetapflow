import { solutions } from "@/lib/data/content";
import SolutionCard from "./SolutionCard";
import { ArrowCurveDoodle } from "./doodles";

export default function SolutionGrid() {
  const standard = solutions.filter((s) => !s.custom);

  return (
    <section id="offer" className="section relative">
      <div className="container-x">
        {/* heading */}
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="eyebrow mb-3 text-[--coral]">What we offer</div>
            <h2 className="text-display max-w-2xl text-[clamp(2.4rem,6vw,4.5rem)] text-[--ink]">
              Your card. Your <span className="text-[--sky]">connection.</span>
            </h2>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed text-[--ink-soft]">
            One card, endless possibilities. Every EdgeTap is a physical key
            that opens the digital experience you design.
          </p>
        </div>
      </div>

      {/* horizontal scroll-snap showcase */}
      <div className="scroll-x mt-10 lg:mt-14">
        {standard.map((s) => (
          <SolutionCard key={s.index} solution={s} />
        ))}


      </div>

      {/* scroll hint */}
      <div className="mt-4 flex justify-center">
        <span className="scroll-hint">
          Scroll sideways to explore <ArrowCurveDoodle className="h-4 w-4 -rotate-45" />
        </span>
      </div>
    </section>
  );
}