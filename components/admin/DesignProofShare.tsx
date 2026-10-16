"use client";
import {useState} from 'react';
import type {Order} from '@/lib/data/order';
import {shareDesignProof,recordDesignEditPayment} from '@/lib/application';
import {APP_URL} from '@/lib/site';
export default function DesignProofShare({order:o,action}:{order:Order;action:(work:()=>Promise<void>)=>Promise<void>}){
 const [copied,setCopied]=useState(false),[amount,setAmount]=useState(''),[note,setNote]=useState(''),[verified,setVerified]=useState(false);
 if(!o.designRevisionPolicy)return <p className="text-sm">Private proof sharing needs the reviewed backend update. Existing email guards remain active.</p>;
 const shared=!!o.printSnapshot&&o.designReviewChannel==='account'&&o.designSharedRevision===o.printRevision;
 const link=APP_URL+'/account/orders?order='+encodeURIComponent(o.id||'');
 const message=`Your EdgeTap order ${o.orderNumber} card proof r${o.printRevision} is ready. Sign in with your order account to check both sides and approve the design: ${link}\n${o.designRevisionPolicy==='one_included'?o.includedDesignEditUsed?'Your included revision has been used; further edits need an agreed extra payment.':'One revision request is included. Put all changes in one note. Further edits are quoted separately.':''}`.trim();
 const digits=o.customer.phone.replace(/\D/g,''),phone=digits.startsWith('0')&&digits.length===11?'92'+digits.slice(1):digits;
 const validAmount=/^\d+(?:\.\d{1,2})?$/.test(amount)&&Number(amount)>0&&Number.isSafeInteger(Math.round(Number(amount)*100));
 const canShare=!!o.printSnapshot&&o.applicationStatus==='accepted'&&['awaiting_email','awaiting_response'].includes(o.designProofStatus||'')&&!shared;
 return <section className="rounded-xl bg-white p-4"><h3 className="font-display text-xl">Share card proof</h3>
  {!o.printSnapshot?<p className="mt-2 text-sm">Accept the paid order, confirm its destination, then open Print package and save the front/back proof.</p>:<>
   <p className="mt-2 text-sm">{shared?'The current proof is available privately in My orders. Send the message below to the customer.':'Save the final draft, then make this revision available to the customer.'} Account sharing sends no email and starts no email timer.</p>
   {canShare&&<button type="button" className="btn btn-ink mt-3 px-5 py-3" onClick={()=>{void action(()=>shareDesignProof(o));}}>Make proof available to customer</button>}
   {shared&&<><textarea aria-label="Customer proof message" readOnly value={message} rows={5} className="mt-3 w-full rounded-xl border p-3 text-sm"/><div className="mt-3 flex flex-wrap gap-3"><button type="button" className="btn btn-ghost px-4 py-2" onClick={()=>{void action(async()=>{await navigator.clipboard.writeText(message);setCopied(true);});}}>{copied?'Copied':'Copy review message'}</button>{/^[1-9]\d{6,14}$/.test(phone)&&<a className="btn btn-ghost px-4 py-2" href={'https://wa.me/'+phone+'?text='+encodeURIComponent(message)} target="_blank" rel="noreferrer">Open customer WhatsApp</a>}</div></>}
  </>}
  {o.designRevisionPolicy==='one_included'&&<p className="mt-3 text-sm">{o.includedDesignEditUsed?'Included revision used.':'One included revision available.'}{(o.paidDesignEditCredits||0)>0?' One paid revision available.':''} Full redesigns go to a graphic designer.</p>}
  {o.designRevisionPolicy==='one_included'&&o.includedDesignEditUsed&&!o.paidDesignEditCredits&&o.designProofStatus==='awaiting_response'&&<details className="mt-4"><summary className="cursor-pointer text-sm font-semibold">Record a further edit payment</summary><p className="mt-3 text-xs">Agree the fee first and check the actual transfer. This records one paid revision; it does not collect or automatically verify money.</p><label className="mt-3 block text-sm">Agreed edit fee (Rs.)<input aria-label="Agreed edit fee (Rs.)" type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label><label className="mt-3 block text-sm">Private payment verification note<textarea aria-label="Private payment verification note" maxLength={2000} value={note} onChange={e=>setNote(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label><label className="mt-3 flex items-start gap-3 text-sm"><input type="checkbox" checked={verified} onChange={e=>setVerified(e.target.checked)}/>I agreed this fee with the customer and checked the actual transfer.</label><button type="button" className="btn btn-ink mt-3 px-4 py-2" disabled={!verified||!note.trim()||!validAmount} onClick={()=>{void action(()=>recordDesignEditPayment(o,Number(amount),note));}}>Record verified edit payment</button></details>}
 </section>;
}
