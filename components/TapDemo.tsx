"use client";
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import EdgeTapCard from './EdgeTapCard';
import PhoneProfile from './PhoneProfile';
import { NfcWaves } from './doodles';
import { prefersReducedMotion } from '@/lib/animations';
import StoryLabels from './StoryLabels';

// The interactive visual belongs to the first panel of the original story.
export default function TapDemo() {
  const phone = useRef<HTMLDivElement>(null), card = useRef<HTMLButtonElement>(null);
  const dragged = useRef(false), frame = useRef(0);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const [connected, setConnected] = useState(false);
  const [holding,setHolding] = useState(false);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  function reset() {
    cancelAnimationFrame(frame.current); frame.current = 0; origin.current = null;
    if (card.current) card.current.style.transform = '';
    setConnected(false);
    setHolding(false);
  }
  function touches() {
    const target = phone.current?.getBoundingClientRect(), face = card.current?.getBoundingClientRect();
    return !!(target && face && face.right >= target.left && face.left <= target.right && face.bottom >= target.top && face.top <= target.bottom);
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    if (!origin.current || connected || frame.current) return;
    const x = event.clientX - origin.current.x, y = event.clientY - origin.current.y;
    if (Math.hypot(x, y) > 5) dragged.current = true;
    event.currentTarget.style.transform = `translate(${x}px, ${y}px)`;
    if (touches()) { origin.current = null; setHolding(false); setConnected(true); }
  }
  function tryTap() {
    if (connected || frame.current || !card.current || !phone.current) return;
    const face = card.current.getBoundingClientRect(), target = phone.current.getBoundingClientRect();
    const x = target.left - face.right + 2, y = target.top + target.height / 2 - (face.top + face.height / 2);
    const duration = prefersReducedMotion() ? 0 : 400, start = performance.now();
    const tick = (now: number) => {
      if (!card.current) return;
      const progress = duration ? Math.min(1, (now - start) / duration) : 1;
      const eased = 1 - (1 - progress) ** 3;
      card.current.style.transform = `translate(${x * eased}px, ${y * eased}px)`;
      if (touches()) setConnected(true);
      if (progress < 1) frame.current = requestAnimationFrame(tick);
      else frame.current = 0;
    };
    frame.current = requestAnimationFrame(tick);
  }
  return <div className="story-tap-demo">
    <p className="tap-demo-instruction">Pick up the card. Drag it to the phone.</p>
    <div className={`tap-demo-stage ${holding?'is-holding':''} ${connected?'is-connected':''}`}>
      <div className="story-card-target"><StoryLabels target="card"/>
      <button ref={card} type="button" className="tap-demo-card" aria-label="Drag card to touch the phone or press to try a tap"
        onPointerDown={event => { if (connected || frame.current) return; setHolding(true); dragged.current = false; origin.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerMove={move}
        onPointerUp={() => { setHolding(false); origin.current = null; if (!connected && !frame.current && card.current) card.current.style.transform = ''; }}
        onPointerCancel={() => { setHolding(false); origin.current = null; if (!connected && card.current) card.current.style.transform = ''; }}
        onClick={() => { if (!dragged.current) tryTap(); }}><EdgeTapCard /></button></div>
      <div className="tap-demo-cue" aria-hidden="true"><NfcWaves className="h-7 w-7" /><span>Tap</span></div>
      <div className="story-phone-target"><StoryLabels target="phone"/>
        <div ref={phone} className={`tap-demo-phone ${connected ? 'is-connected' : ''}`} aria-label={connected ? 'Connected phone showing Ibraheem’s profile' : 'Black phone screen, tap target'}>{connected && <PhoneProfile />}</div>
      </div>
    </div>
    <button type="button" className="story-tap-button underline" onClick={() => connected ? reset() : tryTap()}>{connected ? 'Try again' : 'Try a tap'}</button>
    <p role="status" className="story-tap-status">{connected ? 'Connected. The profile is open.' : 'Touch the phone with the card to see the profile open.'}</p>
  </div>;
}
