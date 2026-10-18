"use client";

import { useEffect, useRef } from "react";
import { useCases } from "@/lib/data/content";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/animations";
import TapDemo from "./TapDemo";
import QrScanDemo from "./QrScanDemo";
import ConnectedProfiles from "./ConnectedProfiles";
import {
  SparkleDoodle,
  StarDoodle,
} from "./doodles";

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
  const stopMomentum = useRef<() => void>(() => {});
  const count = useCases.length + 1;
  useEffect(() => {
    const wrapper = section.current, view = viewport.current, row = track.current;
    if (!wrapper || !view || !row) return;
    let active = true;
    let hashFrame = 0;
    const alignHash = () => {
      let id = '';
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      if (!target) return;
      stopMomentum.current();
      if (['how-to-order', 'solutions'].includes(id)) window.scrollTo({ top:trigger.current?.start ?? wrapper.getBoundingClientRect().top + window.scrollY, behavior:'instant' });
      else target.scrollIntoView({ behavior:'instant', block:'start' });
    };
    const media = gsap.matchMedia();
    media.add({ motion: "(prefers-reduced-motion: no-preference)", room: "(min-height: 640px)" }, context => {
      if (!context.conditions?.motion || !context.conditions?.room) return;
      wrapper.dataset.pinned = "true";
      const distance = () => row.scrollWidth - view.clientWidth;
      const tween = gsap.to(row, {
        x: () => -distance(), ease: "none",
        scrollTrigger: {
          trigger: wrapper, pin: view, start: "top top", end: () => `+=${distance()}`,
          scrub: .65, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: self => {
            const index = Math.round(self.progress * (count - 1));
            current.current = index;
            if (counter.current) counter.current.textContent = `${index + 1} / ${count}`;
            dots.current?.querySelectorAll("button").forEach((button, i) => { if (i === index) button.setAttribute("aria-current", "step"); else button.removeAttribute("aria-current"); });
          },
        },
      });
      trigger.current = tween.scrollTrigger || null;
      // Add a decaying tail to discrete mouse-wheel steps. Trackpads keep
      // their native momentum; touch and reduced-motion scrolling stay native.
      let frame = 0, velocity = 0, lastTime = 0;
      const stop = () => { cancelAnimationFrame(frame); frame = 0; velocity = 0; };
      stopMomentum.current = stop;
      const tick = (time: number) => {
        const dt = Math.min(50, time - lastTime); lastTime = time;
        const decay = Math.exp(-dt / 180);
        const before = window.scrollY;
        const activeTrigger = trigger.current;
        if (!activeTrigger) return stop();
        const next = Math.max(activeTrigger.start, Math.min(activeTrigger.end, before + velocity * 180 * (1 - decay)));
        window.scrollTo({ top: next, behavior: "instant" });
        velocity *= decay;
        if (Math.abs(velocity) < .015 || next === activeTrigger.start || next === activeTrigger.end) return stop();
        frame = requestAnimationFrame(tick);
      };
      const wheel = (event: WheelEvent) => {
        const activeTrigger = trigger.current;
        if (!activeTrigger || event.ctrlKey || event.shiftKey || !event.cancelable) return;
        const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
        const discrete = event.deltaMode !== 0 || (Number.isInteger(event.deltaY) && Math.abs(event.deltaY) >= 40 && !event.deltaX);
        if (!discrete) return stop();
        const position = window.scrollY;
        if (position < activeTrigger.start || position > activeTrigger.end || (position <= activeTrigger.start && delta < 0) || (position >= activeTrigger.end && delta > 0)) return;
        event.preventDefault();
        if (Math.sign(delta) !== Math.sign(velocity)) velocity = 0;
        velocity = Math.max(-3.2, Math.min(3.2, velocity + delta * 1.25 / 180));
        if (!frame) { lastTime = performance.now(); frame = requestAnimationFrame(tick); }
      };
      wrapper.addEventListener("wheel", wheel, { passive: false });
      window.addEventListener("pointerdown", stop);
      window.addEventListener("keydown", stop);
      document.addEventListener("visibilitychange", stop);
      return () => {
        stop(); stopMomentum.current = () => {};
        wrapper.removeEventListener("wheel", wheel);
        window.removeEventListener("pointerdown", stop);
        window.removeEventListener("keydown", stop);
        document.removeEventListener("visibilitychange", stop);
        delete wrapper.dataset.pinned; trigger.current = null; row.scrollLeft = 0;
      };
    }, section);
    // Pin setup and font layout can interrupt the browser's initial smooth
    // hash jump. Resolve both public anchors once that layout is stable.
    void document.fonts.ready.then(() => {
      if (active) { ScrollTrigger.refresh(); hashFrame = requestAnimationFrame(alignHash); }
    });
    window.addEventListener('hashchange', alignHash);
    return () => { active = false; cancelAnimationFrame(hashFrame); window.removeEventListener('hashchange', alignHash); media.revert(); };
  }, [count]);
  const show = (index: number) => {
    stopMomentum.current();
    const next = Math.max(0, Math.min(count - 1, index));
    if (trigger.current) window.scrollTo({ top: trigger.current.start + next / (count - 1) * (trigger.current.end - trigger.current.start), behavior: prefersReducedMotion() ? "instant" : "smooth" });
    else track.current?.scrollTo({ left: next * (viewport.current?.clientWidth || 0), behavior: "smooth" });
  };
  return (
    <section ref={section} id="solutions" aria-label="How it works" className="usecase-pin relative bg-[var(--paper-deep)]">
      <span id="how-to-order" className="anchor-offset" />
      <h2 className="sr-only">How it works</h2>
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
                  {uc.id === "scan" ? "Scan → Profile" : uc.id === "connect" ? "You → Connected" : "Tap → Contact"}
                </span>
              </div>

              <h3 className="text-display max-w-3xl text-[clamp(2.6rem,7vw,5.5rem)] text-[var(--ink)]">
                {uc.headline}
              </h3>
              <p className="max-w-xl text-[16px] leading-relaxed text-[var(--ink-soft)]">
                {uc.context}
              </p>

              {uc.id === "meet" ? <TapDemo /> : uc.id === "scan" ? <QrScanDemo/> : <ConnectedProfiles/>}
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
