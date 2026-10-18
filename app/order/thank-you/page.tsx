"use client";
import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
export default function ThankYou() {
  const search=useSyncExternalStore(callback=>{window.addEventListener('popstate',callback);return()=>window.removeEventListener('popstate',callback);},()=>window.location.search,()=> '');
  const order=new URLSearchParams(search).get('order');
  const path=order&&/^[a-zA-Z0-9_-]{1,128}$/.test(order)?'/account/orders?order='+encodeURIComponent(order):'/account/orders';
  return <main className="min-h-[100dvh] px-4 py-24"><section className="card-paper mx-auto max-w-xl p-8 text-center sm:p-12"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--yellow)]"><Icon name="check" size={28}/></span><h1 className="mt-5 font-display text-4xl">Thank you!</h1><p className="mt-4">Your application is in. We’re reviewing your request.</p><Link href={path} className="btn btn-ink mt-7 px-6 py-3">View my order/application</Link></section></main>;
}
