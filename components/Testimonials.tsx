import { testimonials } from "@/lib/data/content";
import { StarDoodle, SparkleDoodle, ScribbleDoodle } from "./doodles";

const toneMap: Record<string, string> = {
  yellow: "bg-[--yellow-soft]",
  coral: "bg-[--coral-soft]",
  sky: "bg-[--sky-soft]",
};

// Offset / rotated paper-note style testimonial cards.
// Content is clearly-marked placeholder (no real customers yet).
export default function Testimonials() {
  const rotations = ["rotate-[-2deg]", "rotate-[1.5deg]", "rotate-[-1deg]"];
  const offsets = ["md:mt-8", "md:-mt-4", "md:mt-10"];

  return (
    <section id="testimonials" className="section relative">
      <div className="container-x">
        <div className="mb-12 flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="eyebrow mb-3 text-[--sky]">Testimonials</div>
            <h2 className="text-display text-[clamp(2.4rem,6vw,4.5rem)] text-[--ink]">
              What people <span className="text-[--coral]">say</span>
            </h2>
          </div>
          <StarDoodle className="h-10 w-10 text-[--yellow] rotate-12" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure
              key={i}
              className={`card-paper relative flex flex-col gap-4 p-6 ${rotations[i % 3]} ${offsets[i % 3]}`}
            >
              <SparkleDoodle className="absolute -right-2 -top-3 h-7 w-7 text-[--yellow]" />
              <div className="flex gap-0.5 text-[--yellow]">
                {[0, 1, 2, 3, 4].map((s) => (
                  <StarDoodle key={s} className="h-4 w-4" />
                ))}
              </div>
              <blockquote className="text-[15px] leading-relaxed text-[--ink-soft]">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-auto border-t border-[--ink]/8 pt-4">
                <div className={`inline-block rounded-full px-3 py-1 text-[12px] font-semibold text-[--ink] ${toneMap[t.tone]}`}>
                  {t.author}
                </div>
                <div className="mt-1 text-[12px] text-[--ink-mid]">{t.role}</div>
              </figcaption>
              <ScribbleDoodle className="absolute bottom-4 right-4 h-4 w-16 text-[--ink-faint]" />
            </figure>
          ))}
        </div>

        <p className="mt-10 text-center text-[13px] text-[--ink-faint]">
          Placeholder voices — real stories coming as EdgeTap goes live.
        </p>
      </div>
    </section>
  );
}
