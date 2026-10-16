"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion } from "@/lib/animations";

type Props = {
  children: ReactNode;
  className?: string;
  /** Vertical parallax offset in px over the scroll range (0 = none). */
  parallax?: number;
  interactive?:boolean;
};

// Positions a scattered set of doodles in an absolute layer and gives the
// whole field its own scroll speed so it drifts against the page.
export default function DoodleField({
  children,
  className = "",
  parallax = -60,
  interactive=false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || parallax === 0) return;
    const tween = gsap.to(el, {
      y: parallax,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [parallax]);

  return (
    <div ref={ref} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden={interactive?undefined:true}>
      {children}
    </div>
  );
}
