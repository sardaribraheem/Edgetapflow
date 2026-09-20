import { useCases } from "@/lib/data/content";
import EdgeTapCard from "./EdgeTapCard";
import PhoneMockup from "./PhoneMockup";
import PhoneProfile from "./PhoneProfile";
import RestaurantMenu from "./RestaurantMenu";
import ReviewExperience from "./ReviewExperience";
import {
  ArrowCurveDoodle,
  ArrowDoodle,
  SparkleDoodle,
  StarDoodle,
} from "./doodles";

function PhoneScreen({ kind }: { kind: string }) {
  if (kind === "menu") return <RestaurantMenu />;
  if (kind === "review") return <ReviewExperience />;
  return <PhoneProfile />;
}

// Physical card -> TAP -> phone sequence used inside each panel.
function TapSequence({ kind }: { kind: string }) {
  return (
    <div className="mt-6 flex items-center justify-center gap-3 md:gap-6">
      <div className="w-[104px] rotate-[-6deg] md:w-[150px]">
        <EdgeTapCard />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[--ink] font-display text-[10px] font-bold uppercase text-[--cream]">
          Tap
        </span>
        <ArrowDoodle className="h-7 w-7 rotate-[-20deg] text-[--ink-faint]" />
      </div>
      <PhoneMockup className="w-[96px] md:w-[150px]">
        <PhoneScreen kind={kind} />
      </PhoneMockup>
    </div>
  );
}

const toneText: Record<string, string> = {
  yellow: "text-[--yellow]",
  coral: "text-[--coral]",
  sky: "text-[--sky]",
};

// Full-bleed horizontal scroll-snap storytelling. Each panel is one
// viewport-wide slide; swiping / scrolling sideways reveals the next —
// on every breakpoint (no GSAP pin needed).
export default function UseCaseStory() {
  return (
    <section id="solutions" className="usecase-pin relative bg-[--paper-deep]">
      <div className="usecase-track scroll-smooth">
        {useCases.map((uc) => (
          <div key={uc.id} className="usecase-panel relative">
            {/* backdrop doodles — subtle, not chaotic */}
            <SparkleDoodle className="absolute left-[8%] top-[14%] h-8 w-8 text-[--yellow] opacity-50" />
            <StarDoodle className="absolute right-[10%] top-[20%] h-7 w-7 text-[--sky] opacity-50" />

            <div className="container-x relative flex flex-col items-center gap-6 py-10 text-center md:py-0">
              <div className="flex flex-col items-center gap-2">
                <span className="eyebrow text-[--ink-mid]">{uc.kicker}</span>
                <span className={`font-display text-lg ${toneText[uc.tone]}`}>
                  {uc.id === "meet"
                    ? "Tap → Contact"
                    : uc.id === "restaurant"
                      ? "Tap → Menu"
                      : "Tap → Review"}
                </span>
              </div>

              <h3 className="text-display max-w-3xl text-[clamp(2.6rem,7vw,5.5rem)] text-[--ink]">
                {uc.headline}
              </h3>
              <p className="max-w-xl text-[16px] leading-relaxed text-[--ink-soft]">
                {uc.context}
              </p>

              <TapSequence kind={uc.phone} />
            </div>
          </div>
        ))}

        {/* final "that's just the start" panel — links into CustomCTA */}
        <div className="usecase-panel relative">
          <div className="container-x flex flex-col items-center text-center">
            <SparkleDoodle className="mb-4 h-10 w-10 text-[--yellow]" />
            <span className="eyebrow mb-3 text-[--coral]">The takeaway</span>
            <h3 className="text-display max-w-4xl text-[clamp(2.4rem,6vw,5rem)] text-[--ink]">
              And that&apos;s
              <br />
              just the <span className="text-[--sky]">start.</span>
            </h3>
            <p className="mt-4 max-w-md text-[16px] text-[--ink-soft]">
              A card, a menu, a review, an idea — EdgeTap turns physical
              moments into digital experiences.
            </p>
            <span className="scroll-hint mt-6">
              Keep scrolling <ArrowCurveDoodle className="h-4 w-4 -rotate-45" />
            </span>
          </div>
        </div>
      </div>

      {/* floating nudge */}
      <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2" aria-hidden="true">
        <span className="scroll-hint">
          Swipe / scroll <ArrowCurveDoodle className="h-4 w-4 -rotate-45" />
        </span>
      </div>
    </section>
  );
}