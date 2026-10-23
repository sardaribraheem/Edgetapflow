"use client";

import { useEffect, useRef, useState, type ReactNode } from 'react';

const names = ['Link Card', 'EdgeTap Profile Card', 'Website + Cards'];

export default function PricingCarousel({children}:{children:ReactNode}) {
  const row = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(1);
  useEffect(() => {
    const element = row.current;
    if (!element) return;
    const media = window.matchMedia('(max-width: 900px)');
    const center = () => {
      const middle = element.children[1] as HTMLElement;
      element.scrollLeft = media.matches ? middle.offsetLeft - element.offsetLeft - (element.clientWidth - middle.offsetWidth) / 2 : 0;
    };
    center();
    media.addEventListener('change', center);
    return () => media.removeEventListener('change', center);
  }, []);
  function select(index:number) {
    const element = row.current, card = element?.children[index] as HTMLElement | undefined;
    if (!element || !card) return;
    setActive(index);
    element.scrollTo({left:card.offsetLeft-element.offsetLeft-(element.clientWidth-card.offsetWidth)/2,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  return <div className="pricing-comparison">
    <div className="pricing-browse"><p>Swipe to compare the three offers</p><div className="pricing-position" aria-label="Choose an offer">{names.map((name,index)=><button type="button" key={name} aria-label={`Show ${name}`} aria-pressed={active===index} onClick={()=>select(index)}><span/></button>)}</div></div>
    <div ref={row} className="pricing-options" aria-label="Compare three EdgeTap offers" onScroll={event=>{
      const element=event.currentTarget, center=element.scrollLeft+element.clientWidth/2;
      const distances=Array.from(element.children).map(child=>{const card=child as HTMLElement;return Math.abs(card.offsetLeft-element.offsetLeft+card.offsetWidth/2-center);});
      setActive(distances.indexOf(Math.min(...distances)));
    }} onKeyDown={event=>{if(event.target!==event.currentTarget)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();select(Math.max(0,Math.min(2,active+(event.key==='ArrowRight'?1:-1))));}}} tabIndex={0}>{children}</div>
  </div>;
}
