"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap, prefersReducedMotion } from "@/lib/animations";
import {ibraheemProfile} from '@/lib/data/profile';
import CardStack from "./CardStack";
import DoodleField from "./DoodleField";
import {
  NfcWaves,
  QrDoodle,
  ArrowDoodle,
  SparkleDoodle,
  StarDoodle,
  ScribbleDoodle,
  UnderlineDoodle,
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

// Only these five real links are interactive and magnetic. Decorations stay inert.
const heroDestinations={Instagram:ibraheemProfile.links.find(l=>l.type==='instagram')!.url,WhatsApp:ibraheemProfile.links.find(l=>l.type==='whatsapp')!.url,LinkedIn:ibraheemProfile.links.find(l=>l.type==='linkedin')!.url,Website:ibraheemProfile.links.find(l=>l.type==='portfolio')!.url,'u/you':'/u/ibraheem'};
function Chip({icon,label,className='',delay=0}:{icon:React.ReactNode;label:keyof typeof heroDestinations;className?:string;delay?:number}){
 const href=heroDestinations[label],external=href.startsWith('https:');
 return <div data-hero-link={label} className={`hero-chip animate-float absolute ${className}`} style={{animationDelay:`${delay}s`}}><a href={href} className="hero-link" data-magnetic-link aria-label={label==='u/you'?'View Ibraheem’s example profile':`EdgeTap founder on ${label}`} target={external?'_blank':undefined} rel={external?'noopener noreferrer':undefined}><span className="hero-link-icon grid h-12 w-12 place-items-center rounded-full bg-white text-[var(--ink)] shadow-[var(--shadow-doodle)] ring-1 ring-[var(--ink)]/8">{icon}</span><span className="rounded-full bg-[var(--ink)] px-2.5 py-0.5 font-display text-[10px] font-semibold text-[var(--cream)]">{label}</span></a></div>;
}

export default function Hero() {
  const headlineRef = useRef<HTMLDivElement>(null);
  const heroRef=useRef<HTMLElement>(null);
  useEffect(()=>{
    const hero=heroRef.current,media=window.matchMedia('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)');
    if(!hero)return;
    let cleanup=()=>{};
    const setup=()=>{cleanup();if(!media.matches)return;const links=Array.from(hero.querySelectorAll<HTMLElement>('[data-magnetic-link]'));
      const movers=links.map(link=>({link,x:gsap.quickTo(link,'x',{duration:.55,ease:'power3.out'}),y:gsap.quickTo(link,'y',{duration:.55,ease:'power3.out'})}));
      let frame=0,x=0,y=0;
      const render=()=>{frame=0;for(const item of movers){const box=item.link.parentElement!.getBoundingClientRect(),dx=x-(box.left+box.width/2),dy=y-(box.top+box.height/2),distance=Math.hypot(dx,dy),weight=Math.max(0,1-distance/260);item.x(dx*.11*weight);item.y(dy*.11*weight);}};
      const move=(event:PointerEvent)=>{if(event.pointerType!=='mouse')return;x=event.clientX;y=event.clientY;if(!frame)frame=requestAnimationFrame(render);};
      const reset=()=>{cancelAnimationFrame(frame);frame=0;movers.forEach(item=>{item.x(0);item.y(0);});};
      hero.addEventListener('pointermove',move);hero.addEventListener('pointerleave',reset);
      cleanup=()=>{hero.removeEventListener('pointermove',move);hero.removeEventListener('pointerleave',reset);cancelAnimationFrame(frame);movers.forEach(item=>{gsap.killTweensOf(item.link);gsap.set(item.link,{clearProps:'transform'});});};
    };setup();media.addEventListener('change',setup);return()=>{cleanup();media.removeEventListener('change',setup);};
  },[]);

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
    <section ref={heroRef} className="relative min-h-[100dvh] overflow-hidden pt-28 pb-16" id="top">
      {/* soft background washes */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[var(--yellow-soft)] opacity-70 blur-3xl" />
        <div className="absolute -right-20 top-40 h-80 w-80 rounded-full bg-[var(--sky-soft)] opacity-60 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[var(--coral-soft)] opacity-50 blur-3xl" />
      </div>

      {/* ===== The scattered possibilities ===== */}
      <DoodleField interactive parallax={-70} className="hero-doodles z-20 hidden md:block">
        {/* QR bottom-left */}
        <QrDoodle className="absolute bottom-[12%] left-[8%] h-16 w-16 rotate-[-10deg] text-[var(--ink)] animate-float-slow" />
        {/* menu bottom */}
        <MenuDoodle className="absolute bottom-[6%] right-[22%] h-12 w-12 rotate-[12deg] text-[var(--coral)] animate-float" />
        {/* review stars */}
        <ReviewStars className="absolute bottom-[20%] left-[12%] w-24 rotate-[-6deg] text-[var(--yellow)] animate-float" style={{ animationDelay: "1.2s" }} />
        {/* attendance top */}
        <AttendanceDoodle className="absolute left-[16%] top-[10%] h-12 w-12 rotate-[8deg] text-[var(--sky)] animate-wobble" />

        {/* social / link chips near headline — all monochrome ink */}
        <Chip icon={<InstagramIcon className="h-6 w-6" />} label="Instagram" className="left-[10%] top-[200px] rotate-[-6deg]" delay={0} />
        <Chip icon={<WhatsAppIcon className="h-6 w-6" />} label="WhatsApp" className="right-[8%] top-[160px] rotate-[5deg]" delay={0.4} />
        <Chip icon={<LinkedInIcon className="h-6 w-6" />} label="LinkedIn" className="left-[6%] top-[62%] rotate-[6deg]" delay={0.8} />
        <Chip icon={<GlobeIcon className="h-6 w-6" />} label="Website" className="right-[6%] top-[60%] rotate-[-5deg]" delay={1.1} />
        <Chip icon={<NfcWaves className="h-6 w-6" />} label="u/you" className="left-[9%] top-[120px] rotate-[-4deg]" delay={0.2} />

        {/* decorative */}
        <SparkleDoodle className="absolute left-[27%] top-[44%] h-7 w-7 text-[var(--yellow)] animate-pulse-soft" />
        <SparkleDoodle className="absolute right-[12%] top-[34%] h-6 w-6 text-[var(--coral)] animate-pulse-soft" style={{ animationDelay: "0.7s" }} />
        <StarDoodle className="absolute left-[52%] top-[10%] h-7 w-7 text-[var(--sky)] animate-wobble" />
        <ArrowDoodle className="absolute left-[12%] top-[80%] h-10 w-10 text-[var(--ink-mid)] rotate-[20deg] animate-float-slow" />
        <ScribbleDoodle className="absolute right-[12%] bottom-[10%] h-6 w-24 text-[var(--ink-faint)] rotate-[-8deg]" />

        {/* extra floating icons */}
        <SignalDoodle className="absolute left-[2%] top-[30%] h-10 w-10 text-[var(--ink-faint)] animate-pulse-soft" />
        <PlateDoodle className="absolute left-[20%] bottom-[14%] h-11 w-11 rotate-[-8deg] text-[var(--mint)] animate-float-slow" />
        <ChainLink className="absolute right-[3%] top-[40%] h-9 w-9 rotate-[12deg] text-[var(--ink-faint)] animate-wobble" />
        <WebsiteDoodle className="absolute right-[28%] top-[8%] h-9 w-9 rotate-[6deg] text-[var(--sky)] animate-float" style={{ animationDelay: "0.9s" }} />
        <PhoneDoodle className="absolute left-[34%] bottom-[8%] h-10 w-10 rotate-[-6deg] text-[var(--ink-mid)] animate-float-slow" style={{ animationDelay: "1.4s" }} />
      </DoodleField>

      {/* ===== Center content ===== */}
      <div className="container-x relative z-10 flex flex-col items-center text-center">
        {/* headline */}
        <div ref={headlineRef} className="relative">
          <h1 className="text-display text-[clamp(3.2rem,10vw,8rem)] text-[var(--ink)]">
            One tap.
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 text-[var(--ink)]">Infinite</span>{" "}
              <span className="relative z-10">
                <span className="text-[var(--coral-ink)]">poss</span>ibilities.
              </span>
              <UnderlineDoodle className="absolute -bottom-[0.06em] left-0 h-[0.18em] w-full text-[var(--yellow)]" />
            </span>
          </h1>

          {/* decorative underline lives inside the headline span */}
        </div>

        {/* sub */}
        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[var(--ink-soft)]">
          Share your world with one card. Tap or scan to connect, without an app.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/pricing" className="btn btn-ink px-7 py-3.5 text-[15px]">
            Get Your EdgeTap <span aria-hidden="true">→</span>
          </Link>
          <Link href="/#solutions" className="btn btn-ghost px-7 py-3.5 text-[15px]">
            See how it works
          </Link>
        </div>

        <div className="hero-main-card"><CardStack highPriority/></div>


      </div>
    </section>
  );
}
