"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { solutions } from "@/lib/data/content";
import SolutionCard from "./SolutionCard";
import Icon from "./ui/Icon";

function subscribeMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const reducedSnapshot = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const serverSnapshot = () => true;

export default function SolutionGrid() {
  const standard = solutions.filter(solution => !solution.custom);
  const carousel = useRef<HTMLDivElement>(null);
  const hovered = useRef(false), focused = useRef(false);
  const [paused, setPaused] = useState(false);
  const reduced = useSyncExternalStore(subscribeMotion, reducedSnapshot, serverSnapshot);
  useEffect(() => {
    const row = carousel.current;
    if (!row) return;
    let visible = false, frame = 0, previousTime = 0, position = row.scrollLeft;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: .05 });
    observer.observe(row);
    const advance = (time: number) => {
      const elapsed = previousTime ? Math.min(time - previousTime, 64) : 0;
      previousTime = time;
      const cards = row.querySelectorAll<HTMLElement>(".offer-card");
      const distance = cards[standard.length] ? cards[standard.length].offsetLeft - cards[0].offsetLeft : 0;
      const moving = !paused && !reduced && !hovered.current && !focused.current && visible && !document.hidden && distance > 0;
      row.dataset.moving = String(moving);
      if (moving) { position = (position + elapsed * .024) % distance; row.scrollLeft = position; }
      else {
        position = row.scrollLeft;
        if (distance > 0 && position >= distance) { position %= distance; row.scrollLeft = position; }
      }
      frame = requestAnimationFrame(advance);
    };
    frame = requestAnimationFrame(advance);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [paused, reduced, standard.length]);
  const move = (direction: number) => {
    setPaused(true);
    const row = carousel.current, card = row?.querySelector<HTMLElement>(".offer-card");
    if (row && card) {
      const cards = row.querySelectorAll<HTMLElement>(".offer-card");
      const distance = cards[standard.length] ? cards[standard.length].offsetLeft - cards[0].offsetLeft : 0;
      const next = row.scrollLeft + direction * (card.offsetWidth + parseFloat(getComputedStyle(row).gap));
      const wrapped = !reduced && distance > 0 ? (next + distance) % distance : next;
      row.scrollTo({ left: wrapped, behavior: reduced || next !== wrapped ? "instant" : "smooth" });
    }
  };
  return <section id="offer" className="section relative">
    <div className="container-x">
      <div className="flex flex-col gap-4">
        <div>
          <div className="eyebrow mb-3 text-[var(--coral-ink)]">What we offer</div>
          <h2 className="text-display max-w-2xl text-[clamp(2.4rem,6vw,4.5rem)]">Your card. Your <span className="text-[var(--sky-ink)]">connection.</span></h2>
        </div>
        <p className="max-w-lg text-[15px] leading-relaxed text-[var(--ink-soft)]">One physical card. Your profile, your contact details, and a QR fallback.</p>
      </div>
    </div>
    <div ref={carousel} className="offer-carousel mt-10 lg:mt-14" role="region" aria-label="EdgeTap card features" tabIndex={0}
      onPointerEnter={event => { if (event.pointerType === "mouse") hovered.current = true; }} onPointerLeave={() => { hovered.current = false; }}
      onPointerDown={() => setPaused(true)} onWheel={event => { if (Math.abs(event.deltaX) > 0) setPaused(true); }}
      onFocusCapture={() => { focused.current = true; }} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) focused.current = false; }}>
      {[...standard, ...standard].map((solution, index) => <SolutionCard key={solution.index + "-" + index} solution={solution} duplicate={index >= standard.length} />)}
    </div>
    <div className="offer-controls container-x">
      <button type="button" className="icon-button" aria-label="Previous card feature" onClick={() => move(-1)}>←</button>
      <button type="button" className="offer-play" disabled={reduced} aria-label={reduced ? "Automatic motion disabled" : paused ? "Resume card features" : "Pause card features"} onClick={() => setPaused(value => !value)}><Icon name={paused || reduced ? "play" : "pause"} size={16} /><span>{reduced ? "Motion off" : paused ? "Resume" : "Pause"}</span></button>
      <button type="button" className="icon-button" aria-label="Next card feature" onClick={() => move(1)}>→</button>
    </div>
  </section>;
}
