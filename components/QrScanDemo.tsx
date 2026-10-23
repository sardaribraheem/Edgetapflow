"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import EdgeTapCardBack from './EdgeTapCardBack';
import PhoneProfile from './PhoneProfile';
import StoryLabels from './StoryLabels';
import Icon from './ui/Icon';
import { prefersReducedMotion } from '@/lib/animations';

export default function QrScanDemo() {
  const stage = useRef<HTMLDivElement>(null), timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [phase, setPhase] = useState<'ready'|'scanning'|'connected'>('ready');
  const scan = useCallback(() => {
    clearTimeout(timer.current); setPhase('scanning');
    timer.current = setTimeout(() => setPhase('connected'), prefersReducedMotion() ? 900 : 1400);
  }, []);
  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { scan(); observer.disconnect(); }
    }, { threshold:.65 });
    observer.observe(node);
    return () => { observer.disconnect(); clearTimeout(timer.current); };
  }, [scan]);
  return <div className="story-qr-demo">
    <div ref={stage} className="scan-demo-stage">
      <div className="story-card-target"><StoryLabels target="card"/><EdgeTapCardBack className="scan-demo-card"/></div>
      <div className="story-phone-target"><StoryLabels target="phone"/>
      <div className={`scan-demo-phone story-device ${phase === 'connected' ? 'is-connected' : ''}`} aria-label={phase === 'connected' ? 'Phone showing a profile after scanning the QR' : 'Phone camera scanning the card’s QR code'}>
        {phase === 'connected' ? <PhoneProfile/> : <div className="scan-camera-screen">
          <Icon name="camera" size={18}/>
          <div className="scan-viewfinder"><img src="/brand-profile-qr.png" alt="QR code in the camera viewfinder" draggable={false}/><span className={phase === 'scanning' ? 'scan-line is-scanning' : 'scan-line'} /></div>
          <span>{phase === 'scanning' ? 'Scanning QR…' : 'Point at the QR'}</span>
        </div>}
      </div>
      </div>
    </div>
    <button type="button" className="story-tap-button underline" onClick={scan}>{phase === 'connected' ? 'Scan again' : 'Try a scan'}</button>
    <p role="status" className="story-tap-status">{phase === 'connected' ? 'Same card. Same profile. Connected.' : 'The camera reads the QR and opens your profile.'}</p>
  </div>;
}
