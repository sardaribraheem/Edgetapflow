"use client";
import { useEffect } from 'react';
import { CARD_TEMPLATES } from '@/lib/data/order';

export default function CardArtworkWarmup() {
  useEffect(() => {
    // Start after the landing page finishes loading, at low network priority.
    // The chooser uses these same small URLs, so the browser can reuse them.
    const images: HTMLImageElement[] = [];
    const warm = () => {
      for (const template of CARD_TEMPLATES) {
        if (!template.preview) continue;
        const image = new Image();
        image.fetchPriority = 'low'; image.decoding = 'async';
        image.src = template.preview; images.push(image);
      }
    };
    if (document.readyState === 'complete') warm();
    else window.addEventListener('load', warm, { once: true });
    return () => { window.removeEventListener('load', warm); };
  }, []);
  return null;
}
