"use client";
import { useEffect, useState } from 'react';
import type { Order } from '@/lib/data/order';
import { FULFILLMENT_LABELS, REVIEW_LABELS, nextOrderAction } from '@/lib/application';
import { getPrivateUploadBlob, downloadPrivateUpload } from '@/lib/upload-service';
import Link from 'next/link';

export function PrivateFile({path,label}:{path:string;label:string}){
 const [url,setUrl]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>()=>{if(url)URL.revokeObjectURL(url);},[url]);
 const view=async()=>{setBusy(true);setError('');try{const blob=await getPrivateUploadBlob(path);setUrl(URL.createObjectURL(blob));}catch{setError('Private file unavailable. Check your session and permissions.');}finally{setBusy(false);}};
 return <div className="mt-2"><div className="flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={()=>{void view();}} className="font-bold underline">View {label}</button><button type="button" disabled={busy} onClick={()=>{setError('');void downloadPrivateUpload(path).catch(()=>setError('Download unavailable.'));}} className="underline">Download {label}</button>{url&&<button type="button" className="underline" onClick={()=>setUrl('')}>Close preview</button>}</div>{error&&<p role="alert" className="mt-2 text-sm">{error}</p>}{url&&<img src={url} alt={'Private '+label+' preview'} className="mt-3 max-h-96 max-w-full rounded-xl object-contain"/>}</div>;
}
export default function OrderSummary({order:o}:{order:Order}){
 return <section className="space-y-5 break-words">
  <div className="flex flex-wrap gap-2"><span className="rounded-full bg-[--yellow-soft] px-3 py-1 text-sm font-bold">{REVIEW_LABELS[o.applicationStatus||'']||'Review status unavailable'}</span><span className="rounded-full bg-[--mint-soft] px-3 py-1 text-sm">{o.payment.status==='paid'?'Card Payment Verified':o.payment.status==='failed'?'Card Payment Rejected':'Card Payment Pending'}</span><span className="rounded-full bg-white px-3 py-1 text-sm">{FULFILLMENT_LABELS[o.fulfillment.status]||o.fulfillment.status}</span></div>
  <p className="rounded-xl bg-white p-4">{nextOrderAction(o)}</p>
  <dl className="grid gap-3 text-sm sm:grid-cols-2">
   <div><dt className="font-bold">Customer</dt><dd>{o.customer.fullName}</dd></div><div><dt className="font-bold">Email</dt><dd>{o.customer.email}</dd></div>
   <div><dt className="font-bold">Phone</dt><dd>{o.customer.phone}</dd></div><div><dt className="font-bold">Requested handle</dt><dd>{o.profileDraft.usernameSuggested}</dd></div>
   <div><dt className="font-bold">Requested card choice / size</dt><dd>{o.card.template} · {o.card.size||'Size needs confirmation'} · quantity {o.card.quantity}</dd></div>
   <div><dt className="font-bold">Approved card specification</dt><dd>{o.approvedCardSize ? o.approvedCardTemplate+" / "+o.approvedCardSize : "Pending staff confirmation"}</dd></div><div><dt className="font-bold">Fulfillment</dt><dd>{o.deliveryMethod==='nastp_pickup'?'NASTP Pickup':'Delivery'}</dd></div>
   {o.deliveryMethod==='delivery'&&<div className="sm:col-span-2"><dt className="font-bold">Delivery details</dt><dd>{o.customer.address}, {o.customer.city} {o.customer.postalCode}</dd></div>}
   <div><dt className="font-bold">Card subtotal</dt><dd>Rs. {o.subtotal.toLocaleString()}</dd></div><div><dt className="font-bold">Separate delivery fee</dt><dd>{o.deliveryMethod==='nastp_pickup'?'Not applicable (NASTP pickup)':o.deliveryFee==null?'Pending; confirmed separately':'Rs. '+o.deliveryFee.toLocaleString()}</dd></div>
   <div><dt className="font-bold">Complete total</dt><dd>{o.total==null?'Awaiting agreement':'Rs. '+o.total.toLocaleString()}</dd></div><div><dt className="font-bold">Payment method / reference</dt><dd>{o.payment.method} · {o.payment.reference||'No reference supplied'}</dd></div>
   <div><dt className="font-bold">Delivery payment</dt><dd>{o.deliveryPaymentStatus==="verified"?"Separately verified":o.deliveryPaymentStatus==="not_required"?"Not required":"Pending; card payment is separate"}</dd></div><div><dt className="font-bold">Submitted</dt><dd>{new Date(o.createdAt).toLocaleString()}</dd></div>
   <div className="sm:col-span-2"><dt className="font-bold">Profile information</dt><dd>{o.profileDraft.displayName} · {o.profileDraft.title}<p className="whitespace-pre-wrap">{o.profileDraft.bio}</p><ul>{o.profileDraft.links.map((l,i)=><li key={i}>{l.label}: {l.url}</li>)}</ul></dd></div>
  </dl>
  {o.customerNotes&&<p className="whitespace-pre-wrap">Customer notes: {o.customerNotes}</p>}
  {o.payment.receiptUrl&&<PrivateFile key={o.payment.receiptUrl} path={o.payment.receiptUrl} label="receipt"/>}
  {o.card.customDesignUrl&&<PrivateFile key={o.card.customDesignUrl} path={o.card.customDesignUrl} label="artwork"/>}
  {o.nfcUrl&&o.usernameFinal&&<p>Public profile / NFC: <Link href={'/u/'+encodeURIComponent(o.usernameFinal)} className="underline">{o.nfcUrl}</Link></p>}
  <section><h3 className="font-display text-lg font-bold">Application updates</h3><ol className="mt-3 space-y-3">{(o.events||[]).map(e=><li key={e.id} className="rounded-xl bg-white p-3 text-sm"><p className="font-bold">{REVIEW_LABELS[e.kind]||FULFILLMENT_LABELS[e.kind]||e.kind.replaceAll('_',' ')}</p><time>{new Date(e.at).toLocaleString()}</time>{e.message&&<p className="mt-2 whitespace-pre-wrap">{e.message}</p>}</li>)}</ol></section>
 </section>;
}
