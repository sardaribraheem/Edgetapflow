"use client";
import { useEffect, useRef, useState } from 'react';
import { LINK_PRESETS, LINK_ACCENTS } from '@/lib/data/order';
import type { ProfileLink } from '@/lib/data/profile';
import { contactLinkUrl, contactLinkValue, extraLinkCost, MAX_PROFILE_LINKS } from '@/lib/checkout';

export default function LinksEditor({ links, onChange, extraLinkPrice=50 }: { extraLinkPrice?:number; links: ProfileLink[]; onChange: (links: ProfileLink[]) => void }) {
  const root = useRef<HTMLDivElement>(null), previousCount = useRef(links.length);
  const [message, setMessage] = useState('');
  useEffect(() => { if (links.length) root.current?.querySelector<HTMLInputElement>('[data-contact-value]')?.focus({ preventScroll: true }); }, []);
  useEffect(() => { if (links.length > previousCount.current) root.current?.querySelectorAll<HTMLInputElement>('[data-contact-value]').item(links.length - 1)?.focus(); previousCount.current = links.length; }, [links.length]);
  function add(type = 'portfolio', label = 'Website') {
    if (links.length >= MAX_PROFILE_LINKS) { setMessage('Contact EdgeTap if you need more links.'); return; }
    if (links.length >= 10 && extraLinkPrice>0 && !window.confirm(`This additional link costs Rs. ${extraLinkPrice} once. Extra links total: Rs. ${extraLinkCost(links.length + 1,extraLinkPrice)}. Add it?`)) return;
    setMessage(''); onChange([...links, { type, label, url: contactLinkUrl(type, ''), icon: type, accent: LINK_ACCENTS[type] || '#100B4A' }]);
  }
  function patch(index: number, value: Partial<ProfileLink>) { onChange(links.map((link, i) => i === index ? { ...link, ...value } : link)); }
  return <section className="card-paper mb-6 p-7 sm:p-10"><p className="eyebrow mb-1">Step 3 · Links</p><h1 className="font-display text-[clamp(1.8rem,4vw,2.6rem)]">What do you want people to find?</h1><p className="mt-3 text-sm">Choose the links you want to show. Your sign-in email stays private unless you add an Email link.</p><div className="contact-presets mt-6 flex flex-wrap gap-2">{LINK_PRESETS.map(p => <button type="button" key={p.label} onClick={() => add(p.type, p.label)} className="btn btn-ghost px-3 py-2 text-sm">+ {p.label}</button>)}<button type="button" className="btn btn-ghost px-3 py-2 text-sm" onClick={() => add('portfolio', 'New Link')}>+ Custom</button></div>
    <div ref={root} className="mt-6 space-y-4">{links.map((link, i) => <div key={i} className="contact-link-row"><label>Label<input aria-label={`Link ${i + 1} label`} maxLength={80} value={link.label} onChange={e => patch(i, { label: e.target.value })}/></label><label>{link.type === 'email' ? 'Email address' : link.type === 'whatsapp' ? 'WhatsApp number' : 'Username or link'}<input data-contact-value aria-label={`Link ${i + 1} URL`} type={link.type === 'email' ? 'email' : link.type === 'whatsapp' ? 'tel' : 'text'} autoComplete={link.type === 'email' ? 'email' : link.type === 'whatsapp' ? 'tel' : 'off'} maxLength={2048} value={contactLinkValue(link)} placeholder={link.type === 'email' ? 'you@example.com' : link.type === 'whatsapp' ? '+92 300 1234567' : '@username or https://…'} onChange={e => patch(i, { url: link.type === 'email' || link.type === 'whatsapp' ? contactLinkUrl(link.type, e.target.value) : e.target.value })} onBlur={() => patch(i, { url: contactLinkUrl(link.type, contactLinkValue(link)) })}/></label><label>Type<select aria-label={`Link ${i + 1} type`} value={link.type} onChange={e => patch(i, { type: e.target.value, icon: e.target.value, url: contactLinkUrl(e.target.value, ''), label: LINK_PRESETS.find(p => p.type === e.target.value)?.label || 'Website' })}>{LINK_PRESETS.filter((p, n, all) => all.findIndex(other => other.type === p.type) === n).map(p => <option key={p.type} value={p.type}>{p.label}</option>)}</select></label><button type="button" className="min-h-11 text-sm underline" onClick={() => onChange(links.filter((_, n) => n !== i))}>Remove</button></div>)}</div>
    {!links.length && <p className="mt-4 text-sm">Add a way to reach you.</p>}{links.length > 10 && <p role="status" className="mt-4 text-sm font-semibold">{links.length - 10} extra {links.length === 11 ? 'link' : 'links'} · Rs. {extraLinkCost(links.length,extraLinkPrice)} once</p>}{message && <p role="status" className="mt-4">{message}</p>}
  </section>;
}
