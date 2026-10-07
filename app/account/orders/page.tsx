"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth,onAuthStateChanged,type User } from '@/lib/auth';
import { getMyApplications,getMyOrders,REVIEW_LABELS,type ApplicationDraft } from '@/lib/application';
import type { Order } from '@/lib/data/order';
import OrderSummary from '@/components/orders/OrderSummary';

export default function CustomerOrders(){
 const [user,setUser]=useState<User|null>(null),[ready,setReady]=useState(false),[orders,setOrders]=useState<Order[]>([]),[drafts,setDrafts]=useState<ApplicationDraft[]>([]),[selected,setSelected]=useState(''),[error,setError]=useState('');
 useEffect(()=>onAuthStateChanged(auth,u=>{setUser(u);setReady(true);setOrders([]);setDrafts([]);}),[]);
 const uid=user?.uid;
 useEffect(()=>{
  if(!uid)return;let active=true,initial=true;
  const load=async()=>{try{const [o,d]=await Promise.all([getMyOrders(),getMyApplications()]);if(active){if(initial){setSelected(new URLSearchParams(window.location.search).get('order')||'');initial=false;}setOrders(o);setDrafts(d);setError('');}}catch{if(active){setOrders([]);setDrafts([]);setError('Orders could not be loaded. Check your account and try refreshing.');}}};
  void load();
  const timer=setInterval(()=>{if(document.visibilityState==='visible')void load();},20000);
  const visible=()=>{if(document.visibilityState==='visible')void load();};window.addEventListener('focus',visible);
  return()=>{active=false;clearInterval(timer);window.removeEventListener('focus',visible);};
 },[uid]);
 if(!ready)return <main className="min-h-screen px-4 py-28">Checking your account…</main>;
 if(!user)return <main className="min-h-screen px-4 py-28"><section className="card-paper mx-auto max-w-xl p-8"><h1 className="font-display text-3xl">My orders & applications</h1><Link href="/account?next=/account/orders" className="btn btn-ink mt-5 px-5 py-3">Sign in to view your private orders</Link></section></main>;
 const current=orders.find(o=>o.id===selected)||orders[0];
 return <main className="min-h-screen bg-[--cream] px-4 py-24"><div className="mx-auto max-w-6xl"><div className="flex flex-wrap justify-between gap-4"><h1 className="font-display text-3xl">My orders & applications</h1><Link href="/pricing" className="btn btn-ink px-5 py-3">Start another application</Link></div><p className="mt-3 text-sm">Statuses and EdgeTap messages update while this page is open. Refresh to check immediately. Email notifications are not enabled yet.</p>{error&&<p role="alert" className="mt-5">{error}</p>}
  {drafts.length>0&&<section className="card-paper mt-6 p-6"><h2 className="font-display text-xl">Saved drafts / corrections</h2><ul className="mt-4 space-y-3">{drafts.map(d=><li key={d.id}><Link href={'/order?draft='+d.id} className="font-bold underline">{d.state==='changes_required'?'Correct application':'Resume draft'}: {d.payload.profileDraft.displayName||'Incomplete application'}</Link><p className="text-sm">Last saved {new Date(d.updatedAt).toLocaleString()}</p></li>)}</ul></section>}
  <div className="mt-6 grid gap-5 lg:grid-cols-3"><aside className="space-y-3">{orders.map(o=><button key={o.id} onClick={()=>setSelected(o.id||'')} className="card-paper w-full p-4 text-left"><p className="font-bold">{o.orderNumber}</p><p className="mt-2 text-sm">{REVIEW_LABELS[o.applicationStatus||'']||o.fulfillment.status}</p></button>)}{!orders.length&&<p className="card-paper p-6">No submitted applications yet. Saved drafts are not submitted orders.</p>}</aside>{current&&<article className="card-paper p-6 lg:col-span-2"><h2 className="mb-5 font-display text-2xl">{current.orderNumber}</h2><OrderSummary order={current}/>{current.applicationStatus==='changes_required'&&current.applicationId&&<Link className="btn btn-ink mt-5 px-5 py-3" href={'/order?draft='+current.applicationId}>Correct and resubmit application</Link>}</article>}</div>
 </div></main>;
}
