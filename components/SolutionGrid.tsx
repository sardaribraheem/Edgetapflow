import { solutions } from "@/lib/data/content";
import SolutionCard from "./SolutionCard";
import { ArrowCurveDoodle, NfcWaves, SparkleDoodle, ScribbleDoodle } from "./doodles";

export default function SolutionGrid() {
  const standard = solutions.filter((s) => !s.custom);
  const custom = solutions.find((s) => s.custom)!;

  return (
    <section id="offer" className="section relative">
      <div className="container-x">
        {/* heading */}
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="eyebrow mb-3 text-[--coral]">What we offer</div>
            <h2 className="text-display max-w-2xl text-[clamp(2.4rem,6vw,4.5rem)] text-[--ink]">
              What can we <span className="text-[--sky]">build</span> for you?
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

        {/* last card — the "bring your idea to life" moment */}
        <a
          href="#get-started"
          className="card-paper group relative flex w-[92%] shrink-0 flex-col justify-between overflow-hidden bg-[--ink] p-8 text-[--cream] sm:w-[80%] sm:p-10 md:w-[66%] lg:w-[54%]"
        >
          {/* wash + doodles */}
          <div className="absolute inset-0 opacity-40" aria-hidden="true">
            <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[--sky]/30 blur-2xl" />
            <div className="absolute -bottom-12 left-10 h-56 w-56 rounded-full bg-[--coral]/30 blur-2xl" />
            <NfcWaves className="absolute bottom-8 right-8 h-28 w-28 rotate-12 text-[--cream]/15" />
            <SparkleDoodle className="absolute right-6 top-6 h-8 w-8 text-[--yellow]" />
            <ScribbleDoodle className="absolute left-1/3 top-9 h-6 w-32 text-[--cream]/20" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[--yellow]" aria-hidden="true" />
              <div className="eyebrow text-[--yellow]">{custom.tag}</div>
            </div>
            <h3 className="text-display mt-4 text-[clamp(2.3rem,7vw,4.4rem)]">
              Got a project?
              <br />
              Let&apos;s bring your
              <br />
              <span className="text-[--sky]">idea</span> to life.
            </h3>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[--cream]/75">
              {custom.description}
            </p>
          </div>

          <div className="relative mt-9 flex items-center gap-4">
            <span className="btn btn-yellow px-7 py-3.5 text-[15px] transition-transform group-hover:-translate-y-0.5">
              Start the conversation <span aria-hidden="true">→</span>
            </span>
            <ArrowCurveDoodle className="hidden h-12 w-12 text-[--yellow] sm:block" />
          </div>
        </a>
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