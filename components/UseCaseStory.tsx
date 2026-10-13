"use client";

import { useEffect, useRef } from "react";
import { useCases } from "@/lib/data/content";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/animations";
import EdgeTapCard from "./EdgeTapCard";
import PhoneMockup from "./PhoneMockup";
import PhoneProfile from "./PhoneProfile";
import {
  ArrowDoodle,
  SparkleDoodle,
  StarDoodle,
} from "./doodles";

function PhoneScreen() {
  return <PhoneProfile />;
}

// Physical card -> TAP -> phone sequence used inside each panel.
function TapSequence() {
  return (
    <div className="story-tap mt-4 flex items-center justify-center gap-3 md:gap-6">
      <div className="story-card w-[104px] rotate-[-6deg] md:w-[150px]">
        <EdgeTapCard />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--ink)] font-display text-[10px] font-bold uppercase text-[var(--cream)]">
          Tap
        </span>
        <ArrowDoodle className="h-7 w-7 rotate-[-20deg] text-[var(--ink-faint)]" />
      </div>
      <PhoneMockup className="story-phone w-[96px] md:w-[150px]">
        <PhoneScreen />
      </PhoneMockup>
    </div>
  );
}

const toneText: Record<string, string> = {
  yellow: "text-[var(--ink)]",
  coral: "text-[var(--coral-ink)]",
  sky: "text-[var(--sky-ink)]",
};

export default function UseCaseStory() {
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const current = useRef(0);
  const counter = useRef<HTMLSpanElement>(null);
  const dots = useRef<HTMLDivElement>(null);
  const count = useCases.length + 1;
  useEffect(() => {
    const wrapper = section.current, view = viewport.current, row = track.current;
    if (!wrapper || !view || !row) return;
    let active = true;
    const media = gsap.matchMedia();
    media.add({ motion: "(prefers-reduced-motion: no-preference)", room: "(min-height: 640px)" }, context => {
      if (!context.conditions?.motion || !context.conditions?.room) return;
      wrapper.dataset.pinned = "true";
      const distance = () => row.scrollWidth - view.clientWidth;
      const tween = gsap.to(row, {
        x: () => -distance(), ease: "none",
        scrollTrigger: {
          trigger: wrapper, pin: view, start: "top top", end: () => `+=${distance()}`,
          scrub: true, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: self => {
            const index = Math.round(self.progress * (count - 1));
            current.current = index;
            if (counter.current) counter.current.textContent = `${index + 1} / ${count}`;
            dots.current?.querySelectorAll("button").forEach((button, i) => { if (i === index) button.setAttribute("aria-current", "step"); else button.removeAttribute("aria-current"); });
          },
        },
      });
      trigger.current = tween.scrollTrigger || null;
      void document.fonts.ready.then(() => { if (active) ScrollTrigger.refresh(); });
      return () => { delete wrapper.dataset.pinned; trigger.current = null; row.scrollLeft = 0; };
    }, section);
    return () => { active = false; media.revert(); };
  }, [count]);
  const show = (index: number) => {
    const next = Math.max(0, Math.min(count - 1, index));
    if (trigger.current) window.scrollTo({ top: trigger.current.start + next / (count - 1) * (trigger.current.end - trigger.current.start), behavior: prefersReducedMotion() ? "instant" : "smooth" });
    else track.current?.scrollTo({ left: next * (viewport.current?.clientWidth || 0), behavior: "smooth" });
  };
  return (
    <section ref={section} id="solutions" aria-label="How it works" className="usecase-pin relative bg-[var(--paper-deep)]">
      <div ref={viewport} className="usecase-viewport">
      <div ref={track} className="usecase-track">
        {useCases.map((uc) => (
          <div key={uc.id} className="usecase-panel relative">
            {/* backdrop doodles — subtle, not chaotic */}
            <SparkleDoodle className="absolute left-[8%] top-[14%] h-8 w-8 text-[var(--yellow)] opacity-50" />
            <StarDoodle className="absolute right-[10%] top-[20%] h-7 w-7 text-[var(--sky)] opacity-50" />

            <div className="story-content container-x relative flex flex-col items-center text-center">
              <div className="flex flex-col items-center gap-2">
                <span className="eyebrow text-[var(--ink-soft)]">{uc.kicker}</span>
                <span className={`font-display text-lg ${toneText[uc.tone]}`}>
                  {uc.id === "scan" ? "Scan → Profile" : "Tap → Contact"}
                </span>
              </div>

              <h3 className="text-display max-w-3xl text-[clamp(2.6rem,7vw,5.5rem)] text-[var(--ink)]">
                {uc.headline}
              </h3>
              <p className="max-w-xl text-[16px] leading-relaxed text-[var(--ink-soft)]">
                {uc.context}
              </p>

              <TapSequence />
            </div>
          </div>
        ))}

        {/* final "that's just the start" panel — links into CustomCTA */}
        <div className="usecase-panel relative">
          <div className="container-x flex flex-col items-center text-center">
            <SparkleDoodle className="mb-4 h-10 w-10 text-[var(--yellow)]" />
            <span className="eyebrow mb-3 text-[var(--coral)]">The takeaway</span>
            <h3 className="text-display max-w-4xl text-[clamp(2.4rem,6vw,5rem)] text-[var(--ink)]">
              And that&apos;s
              <br />
              just the <span className="text-[var(--sky)]">start.</span>
            </h3>
            <p className="mt-4 max-w-md text-[16px] text-[var(--ink-soft)]">
              One card. Your contact details and links.
              A profile you can update as your work grows.
            </p>
          </div>
        </div>
      </div>
      <div className="story-controls">
        <button type="button" className="icon-button" aria-label="Previous how-it-works slide" onClick={() => show(current.current - 1)}>←</button>
        <div ref={dots} className="story-dots">{Array.from({ length: count }, (_, index) => <button type="button" key={index} aria-label={`How it works: slide ${index + 1}`} aria-current={index === 0 ? "step" : undefined} onClick={() => show(index)}><span /></button>)}</div>
        <span ref={counter} className="story-count">1 / {count}</span>
        <button type="button" className="icon-button" aria-label="Next how-it-works slide" onClick={() => show(current.current + 1)}>→</button>
      </div>
      </div>
    </section>
  );
}
