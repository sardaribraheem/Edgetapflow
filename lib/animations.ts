"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** True when the user prefers reduced motion — heavy choreography is skipped. */
export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scroll-driven parallax: moves `target` vertically at a different speed
 * than the page scroll. `fromY`/`toY` are px offsets over the element's
 * scroll range. No-op under reduced motion.
 */
export function parallaxY(
  target: gsap.TweenTarget,
  fromY = 0,
  toY = -80,
  trigger?: gsap.DOMTarget | ScrollTrigger.Vars["trigger"],
) {
  if (prefersReducedMotion()) return;
  return gsap.fromTo(
    target,
    { y: fromY },
    {
      y: toY,
      ease: "none",
      scrollTrigger: {
        trigger: trigger || (target as Element),
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    },
  );
}

/** Smooth float used to give doodles a subtle idle drift via GSAP. */
export function drift(target: gsap.TweenTarget, y = 14, duration = 4) {
  if (prefersReducedMotion()) return;
  return gsap.to(target, {
    y,
    duration,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
  });
}

/** Kill all ScrollTriggers on unmount (call in useEffect cleanup). */
export function refreshScrollTriggers() {
  ScrollTrigger.refresh();
}

export { gsap, ScrollTrigger };
