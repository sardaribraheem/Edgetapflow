"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { solutions } from "@/lib/data/content";
import SolutionCard from "./SolutionCard";
import {OFFER_MOTION} from '@/lib/data/motion';

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
  const track = useRef<HTMLDivElement>(null);
  const reduced = useSyncExternalStore(subscribeMotion, reducedSnapshot, serverSnapshot);
  useEffect(() => {
    const row = carousel.current, strip = track.current;
    if (!row || !strip) return;
    let visible=false, focused=false, frame=0, previous=0, distance=0, velocity=0;
    let drag: {id:number;x:number;time:number;distance:number} | null=null;
    let suppressClick=false;
    const slots=Array.from(strip.querySelectorAll<HTMLElement>('.offer-slot'));
    const measure=()=>{distance=slots[standard.length].offsetLeft-slots[0].offsetLeft;};
    const wrap=(value:number)=>distance ? (value % distance + distance) % distance : value;
    const scaleCards=()=>{
      const center=row.scrollLeft+row.clientWidth/2;
      slots.forEach(slot=>{const d=Math.min(1,Math.abs(slot.offsetLeft+slot.offsetWidth/2-center)/(row.clientWidth*.6));const emphasis=(1+Math.cos(Math.PI*d))/2;(slot.firstElementChild as HTMLElement).style.transform=`scale(${OFFER_MOTION.minScale+(OFFER_MOTION.maxScale-OFFER_MOTION.minScale)*emphasis})`;});
    };
    const tick=(now:number)=>{
      const elapsed=Math.min(40,now-(previous||now));previous=now;
      const moving=!reduced&&visible&&!document.hidden&&!focused&&!drag;
      row.dataset.moving=String(moving);
      if(moving){row.scrollLeft=wrap(row.scrollLeft+(OFFER_MOTION.pixelsPerSecond/1000+velocity)*elapsed);velocity*=Math.exp(-elapsed/450);if(Math.abs(velocity)<.005)velocity=0;}
      if(visible&&!document.hidden)scaleCards();frame=requestAnimationFrame(tick);
    };
    const down=(event:PointerEvent)=>{if(event.button!==0)return;drag={id:event.pointerId,x:event.clientX,time:performance.now(),distance:0};velocity=0;suppressClick=false;row.dataset.dragging='true';};
    const move=(event:PointerEvent)=>{
      if(!drag||drag.id!==event.pointerId)return;
      const now=performance.now(),delta=drag.x-event.clientX;
      drag.distance+=Math.abs(delta);
      if(drag.distance>6){suppressClick=true;row.setPointerCapture(event.pointerId);row.scrollLeft=reduced?row.scrollLeft+delta:wrap(row.scrollLeft+delta);velocity=.65*velocity+.35*Math.max(-3,Math.min(3,delta/Math.max(1,now-drag.time)));}
      drag.x=event.clientX;drag.time=now;
    };
    const up=(event:PointerEvent)=>{if(drag?.id!==event.pointerId)return;if(row.hasPointerCapture(event.pointerId))row.releasePointerCapture(event.pointerId);drag=null;row.dataset.dragging='false';};
    const click=(event:MouseEvent)=>{if(suppressClick){event.preventDefault();event.stopPropagation();suppressClick=false;}};
    const focus=(event:FocusEvent)=>{focused=(event.target as HTMLElement).matches(':focus-visible');velocity=0;};
    const blur=(event:FocusEvent)=>{if(!row.contains(event.relatedTarget as Node|null))focused=false;};
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});
    const resize=new ResizeObserver(measure);
    observer.observe(row);resize.observe(row);measure();frame=requestAnimationFrame(tick);
    row.addEventListener('pointerdown',down);row.addEventListener('pointermove',move);row.addEventListener('pointerup',up);row.addEventListener('pointercancel',up);row.addEventListener('click',click,true);
    row.addEventListener('focusin',focus);row.addEventListener('focusout',blur);
    return()=>{
      cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();
      row.removeEventListener('pointerdown',down);row.removeEventListener('pointermove',move);row.removeEventListener('pointerup',up);row.removeEventListener('pointercancel',up);row.removeEventListener('click',click,true);row.removeEventListener('focusin',focus);row.removeEventListener('focusout',blur);
      slots.forEach(slot=>(slot.firstElementChild as HTMLElement).style.removeProperty('transform'));
    };
  }, [reduced, standard.length]);
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
    <div ref={carousel} className="offer-carousel mt-10 lg:mt-14" role="region" aria-label="EdgeTap card features" tabIndex={0}>
      <div ref={track} className="offer-track">
        {[...standard, ...standard, ...standard].map((solution, index) => <div className="offer-slot" key={solution.index + "-" + index}><SolutionCard solution={solution} duplicate={index >= standard.length} /></div>)}
      </div>
    </div>
  </section>;
}
