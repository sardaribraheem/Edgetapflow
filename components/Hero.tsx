"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap, prefersReducedMotion } from "@/lib/animations";
import EdgeTapCard from "./EdgeTapCard";
import PhoneMockup from "./PhoneMockup";
import PhoneProfile from "./PhoneProfile";
import DoodleField from "./DoodleField";
import {
  NfcWaves,
  QrDoodle,
  ArrowDoodle,
  SparkleDoodle,
  StarDoodle,
  ScribbleDoodle,
  UnderlineDoodle,
  TapRipple,
  InstagramIcon,
  WhatsAppIcon,
  LinkedInIcon,
  GlobeIcon,
  ReviewStars,
  MenuDoodle,
  AttendanceDoodle,
  SignalDoodle,
  PlateDoodle,
  ChainLink,
  WebsiteDoodle,
  PhoneDoodle,
} from "./doodles";

// Small labelled chip used for the "possibilities" orbiting the headline.
function Chip({
  icon,
  label,
  className = "",
  delay = 0,
  iconColor = "text-[--ink]",
}: {
  icon: React.ReactNode;
  label: string;
  className?: string;
  delay?: number;
  iconColor?: string;
}) {
  return (
    <div
      className={`animate-float absolute flex flex-col items-center gap-1 ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-[var(--shadow-doodle)] ring-1 ring-[--ink]/8">
        <span className={iconColor}>{icon}</span>
      </div>
      <span className="rounded-full bg-[--ink] px-2.5 py-0.5 font-display text-[10px] font-semibold text-[--cream]">
        {label}
      </span>
    </div>
  );
}

export default function Hero() {
  const headlineRef = useRef<HTMLDivElement>(null);

  // Headline drifts slower than the page on scroll (subtle parallax).
  useEffect(() => {
    const el = headlineRef.current;
    if (!el || prefersReducedMotion()) return;
    const tween = gsap.to(el, {
      yPercent: 14,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden pt-28 pb-16" id="top">
      {/* soft background washes */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[--yellow-soft] opacity-70 blur-3xl" />
        <div className="absolute -right-20 top-40 h-80 w-80 rounded-full bg-[--sky-soft] opacity-60 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[--coral-soft] opacity-50 blur-3xl" />
      </div>

      {/* ===== The scattered possibilities ===== */}
      <DoodleField parallax={-70} className="hidden md:block">
        {/* physical card (right) — hidden on tablet, visible on desktop */}
        <div className="absolute right-[4%] top-[16%] hidden w-[190px] rotate-[7deg] animate-float-slow lg:block">
          <EdgeTapCard />
        </div>

        {/* phone (left) — hidden on tablet, visible on desktop */}
        <div className="absolute left-[5%] top-[38%] hidden w-[110px] -rotate-[8deg] animate-float lg:block" style={{ animationDelay: "0.6s" }}>
          <PhoneMockup>
            <PhoneProfile />
          </PhoneMockup>
        </div>

        {/* QR bottom-left */}
        <QrDoodle className="absolute bottom-[12%] left-[8%] h-16 w-16 rotate-[-10deg] text-[--ink] animate-float-slow" />
        {/* menu bottom */}
        <MenuDoodle className="absolute bottom-[6%] right-[22%] h-12 w-12 rotate-[12deg] text-[--coral] animate-float" />
        {/* review stars */}
        <ReviewStars className="absolute bottom-[20%] left-[12%] w-24 rotate-[-6deg] text-[--yellow] animate-float" style={{ animationDelay: "1.2s" }} />
        {/* attendance top */}
        <AttendanceDoodle className="absolute left-[16%] top-[10%] h-12 w-12 rotate-[8deg] text-[--sky] animate-wobble" />

        {/* social / link chips near headline — all monochrome ink */}
        <Chip icon={<InstagramIcon className="h-6 w-6" />} label="Instagram" className="left-[10%] top-[24%] rotate-[-6deg]" delay={0} />
        <Chip icon={<WhatsAppIcon className="h-6 w-6" />} label="WhatsApp" className="right-[8%] top-[24%] rotate-[5deg]" delay={0.4} />
        <Chip icon={<LinkedInIcon className="h-6 w-6" />} label="LinkedIn" className="left-[6%] top-[62%] rotate-[6deg]" delay={0.8} />
        <Chip icon={<GlobeIcon className="h-6 w-6" />} label="Website" className="right-[6%] top-[60%] rotate-[-5deg]" delay={1.1} />
        <Chip icon={<NfcWaves className="h-6 w-6" />} label="u/you" className="left-[9%] top-[5%] rotate-[-4deg]" delay={0.2} />

        {/* decorative */}
        <SparkleDoodle className="absolute left-[27%] top-[44%] h-7 w-7 text-[--yellow] animate-pulse-soft" />
        <SparkleDoodle className="absolute right-[12%] top-[34%] h-6 w-6 text-[--coral] animate-pulse-soft" style={{ animationDelay: "0.7s" }} />
        <StarDoodle className="absolute left-[52%] top-[10%] h-7 w-7 text-[--sky] animate-wobble" />
        <ArrowDoodle className="absolute left-[12%] top-[80%] h-10 w-10 text-[--ink-mid] rotate-[20deg] animate-float-slow" />
        <ScribbleDoodle className="absolute right-[12%] bottom-[10%] h-6 w-24 text-[--ink-faint] rotate-[-8deg]" />

        {/* extra floating icons */}
        <SignalDoodle className="absolute left-[2%] top-[30%] h-10 w-10 text-[--ink-faint] animate-pulse-soft" />
        <PlateDoodle className="absolute left-[20%] bottom-[14%] h-11 w-11 rotate-[-8deg] text-[--mint] animate-float-slow" />
        <ChainLink className="absolute right-[3%] top-[40%] h-9 w-9 rotate-[12deg] text-[--ink-faint] animate-wobble" />
        <WebsiteDoodle className="absolute right-[28%] top-[8%] h-9 w-9 rotate-[6deg] text-[--sky] animate-float" style={{ animationDelay: "0.9s" }} />
        <PhoneDoodle className="absolute left-[34%] bottom-[8%] h-10 w-10 rotate-[-6deg] text-[--ink-mid] animate-float-slow" style={{ animationDelay: "1.4s" }} />
      </DoodleField>

      {/* ===== Center content ===== */}
      <div className="container-x relative z-10 flex flex-col items-center text-center">
        {/* badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 ring-1 ring-[--ink]/8 backdrop-blur">
          <span className="h-2 w-2 animate-pulse-soft rounded-full bg-[--mint]" />
          <span className="text-[12px] font-medium text-[--ink-soft]">
            Now in Private Beta · Works on iPhone & Android
          </span>
        </div>

        {/* headline */}
        <div ref={headlineRef} className="relative">
          <h1 className="text-display text-[clamp(3.2rem,13vw,10.5rem)] text-[--ink]">
            One tap.
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 text-[--ink]">Infinite</span>{" "}
              <span className="relative z-10">
                <span className="text-[--coral]">poss</span>ibilities.
              </span>
              <UnderlineDoodle className="absolute -bottom-[0.06em] left-0 h-[0.18em] w-full text-[--yellow]" />
            </span>
          </h1>

          {/* tap ripple behind card-ish center */}
          <TapRipple className="absolute left-1/2 top-1/2 h-[120%] w-[90%] -translate-x-1/2 -translate-y-1/2 text-[--ink]/8 opacity-0" />
        </div>

        {/* sub */}
        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[--ink-soft]">
          Tap a physical EdgeTap card against any phone and watch a digital
          profile, menu, review or website appear instantly — no app, no
          searching. Just one tap.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="#get-started" className="btn btn-ink px-7 py-3.5 text-[15px]">
            Get Your EdgeTap <span aria-hidden="true">→</span>
          </Link>
          <Link href="#offer" className="btn btn-ghost px-7 py-3.5 text-[15px]">
            See what we build
          </Link>
        </div>

        {/* ===== Mobile floating band — scattered, not a strip ===== */}
        <div className="relative mx-auto mt-12 h-44 w-full max-w-sm md:hidden" aria-hidden="true">
          <Chip icon={<InstagramIcon className="h-6 w-6" />} label="Instagram" className="left-0 top-0 -rotate-6" delay={0} />
          <Chip icon={<WhatsAppIcon className="h-6 w-6" />} label="WhatsApp" className="left-1/2 top-1 -translate-x-1/2 rotate-3" delay={0.4} />
          <Chip icon={<LinkedInIcon className="h-6 w-6" />} label="LinkedIn" className="right-0 top-2 rotate-6" delay={0.8} />
          <Chip icon={<GlobeIcon className="h-6 w-6" />} label="Website" className="right-10 bottom-7 -rotate-3" delay={1.1} />
          <Chip icon={<NfcWaves className="h-6 w-6" />} label="u/you" className="left-8 bottom-8 rotate-3" delay={0.2} />
          <QrDoodle className="absolute bottom-0 left-0 h-12 w-12 -rotate-6 text-[--ink] animate-float-slow" />
          <MenuDoodle className="absolute bottom-1 right-0 h-10 w-10 rotate-12 text-[--coral] animate-float" style={{ animationDelay: "1s" }} />
          <ReviewStars className="absolute bottom-0 left-1/2 w-24 -translate-x-1/2 -rotate-2 text-[--yellow] animate-float" style={{ animationDelay: "0.6s" }} />
          <SparkleDoodle className="absolute left-1/3 top-3 h-6 w-6 text-[--yellow] animate-pulse-soft" />
          <StarDoodle className="absolute bottom-2 right-1/3 h-6 w-6 text-[--sky] animate-wobble" />
          <AttendanceDoodle className="absolute left-1/4 top-0 h-9 w-9 rotate-8 text-[--sky] animate-wobble" />
          <SignalDoodle className="absolute right-1/4 top-4 h-9 w-9 text-[--ink-faint] animate-pulse-soft" />
          <PlateDoodle className="absolute bottom-2 left-1/4 h-9 w-9 -rotate-6 text-[--mint] animate-float-slow" />
        </div>
      </div>
    </section>
  );
}
