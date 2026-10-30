"use client";

import {useEffect, useState, type ReactNode} from 'react';

export default function PricingDetails({children}: {children: ReactNode}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const reveal = () => {
      if (window.location.hash !== '#price-details') return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        setOpen(true);
        document.getElementById('price-details')?.scrollIntoView({block: 'start'});
      }, 0);
    };
    reveal();
    window.addEventListener('hashchange', reveal);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', reveal);
    };
  }, []);

  return <section id="price-details" className="pricing-details">
    <button type="button" className="pricing-details-toggle" aria-expanded={open} aria-controls="pricing-details-content" onClick={() => setOpen(value => !value)}>
      <span>{open ? 'Hide detailed prices' : 'Show detailed prices'}</span>
      <span aria-hidden="true" className="text-xl">{open ? '−' : '+'}</span>
    </button>
    <div id="pricing-details-content" hidden={!open}>{children}</div>
  </section>;
}
