"use client";
import {useEffect,useRef,useState} from 'react';
import type {Order} from '@/lib/data/order';
import {respondToDesignProof} from '@/lib/application';
import {SUPPORT_URL,DESIGNER_URL} from '@/lib/site';
import PrivateFile from './PrivateFile';
export default function CustomerDesignProof({order,onChanged}:{order:Order;onChanged?:()=>void}){
 const [note,setNote]=useState(''),[checked,setChecked]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const lock=useRef(false),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 const snapshot=order.printSnapshot;
 const shared=!!snapshot&&((order.designReviewChannel==='account'&&order.designSharedRevision===snapshot.revision&&!!order.designSharedAt)||(order.designReviewChannel==='email'&&!!order.designProofSentAt));
 const waiting=shared&&order.designReviewChannel==='account'&&order.designProofStatus==='awaiting_response';
 const available=order.designRevisionPolicy!=='one_included'||!order.includedDesignEditUsed||(order.paidDesignEditCredits||0)>0;
 const respond=async(action:'confirm'|'request_changes')=>{if(lock.current)return;lock.current=true;setBusy(true);setError('');try{await respondToDesignProof(order,action,note);if(mounted.current){setNote('');onChanged?.();}}catch(e){if(mounted.current)setError(e instanceof Error?e.message:'Could not save your decision. Refresh and retry.');}finally{lock.current=false;if(mounted.current)setBusy(false);}};
 if(!shared)return <section className="rounded-xl bg-white p-4"><h3 className="font-bold">Your card design</h3><p className="mt-2 text-sm">EdgeTap will prepare and share your final proof after accepting the order. Printing waits for design review.</p></section>;
 return <section className="space-y-4 rounded-xl bg-white p-4" aria-label="Customer card proof"><h3 className="font-display text-xl">Your card proof · r{snapshot!.revision}</h3>
  <div className="grid gap-4 sm:grid-cols-2"><PrivateFile key={snapshot!.frontPath} path={snapshot!.frontPath} label="front proof"/><PrivateFile key={snapshot!.backPath} path={snapshot!.backPath} label="back proof"/></div><PrivateFile key={snapshot!.pdfPath} path={snapshot!.pdfPath} label="card proof PDF"/>
  {order.designRevisionPolicy==='one_included'&&<p className="text-sm">{!order.includedDesignEditUsed?'One revision request included. Put all changes in one note.':(order.paidDesignEditCredits||0)>0?'Your separately paid revision is available. Put all changes in one note.':'Your included revision has been used. Further edits need an agreed price and verified payment.'}</p>}
  {order.designProofStatus==='awaiting_response'&&order.designProofDeadlineAt&&<p className="text-sm">Approve or request changes in My orders by {new Date(order.designProofDeadlineAt).toLocaleString()}. The ten-hour window starts after the proof email is sent. Without a response in My orders, this proof is approved for printing.</p>}
  {waiting?<fieldset disabled={busy} className="min-w-0 space-y-4"><label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)}/>I checked both sides, wording, colours and the QR/link.</label><button type="button" disabled={!checked} className="btn btn-ink px-5 py-3" onClick={()=>{void respond('confirm');}}>Approve this design</button>
   {available?<details><summary className="cursor-pointer font-semibold">Request {order.designRevisionPolicy==='one_included'&&!order.includedDesignEditUsed?'my included':'a'} revision</summary><label className="mt-4 block text-sm font-bold">All requested changes<textarea aria-label="All requested changes" maxLength={2000} rows={4} value={note} onChange={e=>setNote(e.target.value)} placeholder="List every change together. Sending this note uses one revision request." className="mt-2 w-full rounded-xl border p-3"/></label><button type="button" className="btn btn-ghost mt-3 px-5 py-3" disabled={!note.trim()} onClick={()=>{void respond('request_changes');}}>Send revision request</button></details>:<a href={SUPPORT_URL+'?text='+encodeURIComponent('Please quote a further design edit for '+order.orderNumber)} target="_blank" rel="noreferrer" className="block font-semibold underline">Ask about a paid edit</a>}
  </fieldset>:<p role="status" className="text-sm">{order.designProofStatus==='changes_requested'?'Your change note is with EdgeTap. A revised proof will need your approval.':['approved','approved_no_response'].includes(order.designProofStatus||'')?'This proof is approved.':'Follow the instructions in your proof email to reply.'}</p>}
  <p className="text-xs text-[var(--ink-soft)]">For a substantial redesign, {DESIGNER_URL?<a href={DESIGNER_URL} target="_blank" rel="noreferrer" className="underline">contact a professional graphic designer</a>:'contact a professional graphic designer'}. For an EdgeTap error or defect, <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="underline">contact EdgeTap</a>; our defect policy still applies.</p>
  {error&&<p role="alert" className="text-sm text-[var(--coral-ink)]">{error}</p>}
 </section>;
}
