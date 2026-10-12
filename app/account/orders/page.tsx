"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { auth,onAuthStateChanged,type User } from '@/lib/auth';
import { getMyApplications,getMyOrders,isOrderingUnavailable,REVIEW_LABELS,type ApplicationDraft } from '@/lib/application';
import type { Order } from '@/lib/data/order';
import OrderSummary from '@/components/orders/OrderSummary';
import { SUPPORT_URL } from '@/lib/site';

export default function CustomerOrders(){
 const [user,setUser]=useState<User|null>(null),[ready,setReady]=useState(false),[orders,setOrders]=useState<Order[]>([]),[drafts,setDrafts]=useState<ApplicationDraft[]>([]),[selected,setSelected]=useState(''),[error,setError]=useState('');
 const accountUid=useRef<string|undefined>(undefined);
 const [retry,setRetry]=useState(0),[loading,setLoading]=useState(false);
 useEffect(()=>onAuthStateChanged(auth,u=>{if(accountUid.current!==u?.uid){accountUid.current=u?.uid;setOrders([]);setDrafts([]);setSelected('');setError('');}setUser(u);setReady(true);}),[]);
 const uid=user?.uid;
 useEffect(()=>{
  if(!uid)return;let active=true,initial=true;
  const load=async()=>{if(!active||accountUid.current!==uid)return;setLoading(true);try{const [o,d]=await Promise.all([getMyOrders(),getMyApplications()]);if(active&&accountUid.current===uid){if(initial){setSelected(new URLSearchParams(window.location.search).get('order')||'');initial=false;}setOrders(o);setDrafts(d);setError('');}}catch(e){if(active&&accountUid.current===uid)setError(isOrderingUnavailable(e)?'You are signed in, but online ordering is temporarily unavailable. Try again later or contact EdgeTap.':'Orders could not be loaded. Your sign-in is active; try refreshing.');}finally{if(active&&accountUid.current===uid)setLoading(false);}};
  void load();
  const timer=setInterval(()=>{if(document.visibilityState==='visible')void load();},20000);
  const visible=()=>{if(document.visibilityState==='visible')void load();};window.addEventListener('focus',visible);
  return()=>{active=false;clearInterval(timer);window.removeEventListener('focus',visible);};
 },[uid,retry]);
 if(!ready)return <main className="min-h-screen px-4 py-28">Checking your account…</main>;
 if(!user)return <main className="min-h-screen px-4 py-28"><section className="card-paper mx-auto max-w-xl p-8"><h1 className="font-display text-3xl">My orders & applications</h1><Link href="/account?next=/account/orders" className="btn btn-ink mt-5 px-5 py-3">Sign in to view your private orders</Link></section></main>;
 const current=orders.find(o=>o.id===selected)||orders[0];
 return <main className="min-h-screen bg-[var(--cream)] px-4 py-24"><div className="mx-auto max-w-6xl"><div className="flex flex-wrap justify-between gap-4"><h1 className="font-display text-3xl">My orders & applications</h1><Link href="/pricing" className="btn btn-ink px-5 py-3">Start another application</Link></div><p className="mt-3 text-sm">Statuses and EdgeTap messages update while this page is open. Refresh to check immediately. Email notifications are not enabled yet.</p>{loading&&<p role="status" className="mt-4">Loading your private applications…</p>}{error&&<div className="mt-5"><p role="alert">{error}</p><a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="mt-3 mr-5 inline-block font-bold underline">Contact EdgeTap on WhatsApp</a><button type="button" disabled={loading} onClick={()=>setRetry(n=>n+1)} className="mt-3 font-bold underline">Retry loading orders</button></div>}
  {drafts.length>0&&<section className="card-paper mt-6 p-6"><h2 className="font-display text-xl">Saved drafts / corrections</h2><ul className="mt-4 space-y-3">{drafts.map(d=><li key={d.id}><Link href={'/order?draft='+d.id} className="font-bold underline">{d.state==='changes_required'?'Correct application':'Resume draft'}: {d.payload.profileDraft.displayName||'Incomplete application'}</Link><p className="text-sm">Last saved {new Date(d.updatedAt).toLocaleString()}</p></li>)}</ul></section>}
   <div className="mt-6 grid gap-5 lg:grid-cols-3"><aside className="space-y-3">{orders.map(o=><button key={o.id} onClick={()=>setSelected(o.id||'')} className="card-paper w-full p-4 text-left"><p className="font-bold">{o.orderNumber}</p><p className="mt-2 text-sm">{REVIEW_LABELS[o.applicationStatus||'']||o.fulfillment.status}</p></button>)}{!orders.length&&!loading&&!error&&<p className="card-paper p-6">No submitted applications yet. Saved drafts are not submitted orders.</p>}</aside>{current&&<article className="card-paper p-6 lg:col-span-2"><h2 className="mb-5 font-display text-2xl">{current.orderNumber}</h2><OrderSummary order={current}/>{current.applicationStatus==='changes_required'&&current.applicationId&&<Link className="btn btn-ink mt-5 px-5 py-3" href={'/order?draft='+current.applicationId}>Correct and resubmit application</Link>}</article>}</div>
 </div></main>;
}
