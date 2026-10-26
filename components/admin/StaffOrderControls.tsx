"use client";

import {useRef,useState,type ReactNode} from 'react';
import dynamic from 'next/dynamic';
import type {Order} from '@/lib/data/order';
import {adminManageOrder,adminReviewApplication,addOrderNote,addCustomerMessage,FULFILLMENT_LABELS,REVIEW_LABELS} from '@/lib/application';
import AdminOrderSheet from './AdminOrderSheet';
import DesignProofShare from './DesignProofShare';
import AdminDisclosure from './AdminDisclosure';
import OrderContactEditor from './OrderContactEditor';

const PrintPackage=dynamic(()=>import('./PrintPackage'));
const steps=[['name','Customer name'],['links','Profile links'],['photo_bio','Photo and bio'],['hardware','Card or tag details'],['payment','Payment details'],['profile','Live profile / destination'],['production','Production ready'],['handoff','NFC check and handoff']] as const;

export default function StaffOrderControls({order:o,onChanged,onPublish,qr,summary}:{summary:ReactNode;order:Order;onChanged:()=>Promise<void>;onPublish:()=>void;qr:string}) {
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const [message,setMessage]=useState(''),[note,setNote]=useState(''),[status,setStatus]=useState('production_ready');
  const [decision,setDecision]=useState<'reject'|'request_changes'|null>(null),[reason,setReason]=useState('');
  const [pendingCheck,setPendingCheck]=useState<{step:string;checked:boolean}|null>(null);
  const lock=useRef(false);
  const closed=o.applicationStatus==='rejected'||o.applicationStatus==='cancelled';
  const fulfilled=['shipped','delivered','picked_up','completed'].includes(o.fulfillment.status);

  async function run(work:()=>Promise<unknown>) {
    if(lock.current)return;
    lock.current=true;setBusy(true);setError('');
    try {await work();await onChanged();}
    catch(e) {setError(e instanceof Error?e.message:'Could not confirm this change. Refresh and try again.');await onChanged().catch(()=>{});}
    finally {lock.current=false;setBusy(false);}
  }
  const action=(name:string,value:Record<string,unknown>={})=>run(()=>adminManageOrder(o,name,value));
  const format=o.physicalFormat||'printed_card';
  const statuses=format==='profile_only'?['completed','cancelled']:['production_ready',...(format==='printed_card'?['printing','ready_for_nfc']:[]),'nfc_programmed','qa_passed',...(o.deliveryMethod==='nastp_pickup'?['ready_for_pickup','picked_up']:['ready_to_ship','shipped','delivered']),'completed','cancelled'];

  return <div>
    {error&&<p role="alert" className="mt-5 rounded-xl bg-[var(--coral)]/10 p-4">{error}</p>}
    <fieldset disabled={busy} className="min-w-0">
      <section className="rounded-2xl bg-white p-4">
        <h3 className="font-display text-xl">Application decision</h3>
        <p className="mt-2 font-bold">{REVIEW_LABELS[o.applicationStatus||'submitted']}</p>
        {!closed&&!fulfilled&&<div className="mt-3 flex flex-wrap gap-3">
          <button type="button" className="btn btn-ghost px-4 py-3 text-[var(--coral-ink)]" onClick={()=>{setDecision('reject');setReason('');}}>Reject application</button>
          {!o.profileId&&o.applicationStatus!=='accepted'&&<button type="button" className="btn btn-ghost px-4 py-3" onClick={()=>{setDecision('request_changes');setReason('');}}>Request changes</button>}
        </div>}
        {closed&&<p className="mt-3 text-sm">This application is closed. Its payment, profile and order history are retained. Rejection does not issue a refund or delete a profile.</p>}
        {fulfilled&&!closed&&<p className="mt-3 text-sm">This order is already fulfilled. Contact and internal-note corrections remain available.</p>}
        {decision&&!closed&&<div className="mt-4 space-y-3">
          <label className="block text-sm font-bold">Reason visible in the customer account<textarea aria-label="Reason visible in the customer account" maxLength={2000} value={reason} onChange={e=>setReason(e.target.value)} className="mt-2 w-full rounded-xl border bg-[var(--paper)] p-3"/></label>
          <p className="text-xs">Saves the decision in My orders. No email is sent. Money, profile visibility and actual fulfillment stay separate.</p>
          <div className="flex flex-wrap gap-3"><button type="button" disabled={reason.trim().length<3} className="btn btn-ink px-4 py-3" onClick={()=>{if(window.confirm(decision==='reject'?'Reject this application? Its records and any payment are kept. No email will be sent.':'Ask the customer to correct this application? No email will be sent.'))void run(async()=>{await adminReviewApplication(o,decision,reason);setDecision(null);setReason('');});}}>{decision==='reject'?'Confirm rejection':'Confirm request for changes'}</button><button type="button" className="btn btn-ghost px-4 py-3" onClick={()=>setDecision(null)}>Cancel decision</button></div>
        </div>}
      </section>

      <AdminDisclosure title="Customer & order details">
        {summary}
        <OrderContactEditor key={o.id+':'+o.version} order={o} onSave={run}/>
      </AdminDisclosure>

      <section className="staff-section">
        <h3 className="font-display text-2xl">Profile & NFC destination</h3>
        <p className="mt-3 text-sm">Review, payment, printed designs and email are separate actions.</p>
        {o.profileId&&o.usernameFinal?<div className="mt-4 rounded-xl bg-[var(--mint-soft)] p-4"><p className="font-bold">Saved profile destination</p><a href={'https://edgetap.tech/u/'+o.usernameFinal} target="_blank" rel="noreferrer" className="mt-2 block break-all underline">https://edgetap.tech/u/{o.usernameFinal}</a><p className="mt-2 text-xs">Manage current visibility and account access under Profiles.</p></div>:o.plan==='direct_link'?<><p className="mt-4 break-all">{o.directLink}</p><button type="button" disabled={closed} className="btn btn-ink mt-4 px-5 py-3" onClick={()=>{void action('confirm_destination');}}>{o.nfcUrl?'Confirm existing link':'Use this NFC link now'}</button></>:o.existingProfileId?<button type="button" disabled={closed} className="btn btn-ink mt-4 px-5 py-3" onClick={()=>{void run(async()=>{const {createClientProfileFromOrder}=await import('@/lib/data-service');await createClientProfileFromOrder(o,o.profileDraft.usernameSuggested||'');});}}>Use existing profile now</button>:<button type="button" disabled={closed} className="btn btn-ink mt-4 px-5 py-3" onClick={onPublish}>Publish profile</button>}
        {qr&&<details className="admin-details mt-4"><summary>Destination QR</summary><div className="p-4"><img src={qr} alt={'QR for '+o.nfcUrl} width={224} height={224} className="max-w-full"/><p className="mt-3 break-all text-sm">{o.nfcUrl}</p></div></details>}
      </section>

      {!closed&&<>
        <AdminDisclosure title="Delivery & fulfillment">
          <label className="block font-bold">Item type<select aria-label="Item type" value={format} onChange={e=>{setStatus('production_ready');void action('physical_format',{format:e.target.value});}} className="mt-2 w-full rounded-xl border bg-white p-3"><option value="printed_card">Printed NFC card</option><option value="nfc_tag">NFC tag / chip only</option><option value="profile_only">Digital profile only</option></select></label>
          <p className="mt-3 text-sm">{format==='nfc_tag'?'Program the tag with the confirmed link. No printed card or print proof is needed.':format==='profile_only'?'Publish the digital profile. No physical production is needed.':'Prepare and print the card yourself. Use a customer proof when needed.'} Changing item type keeps the agreed price.</p>
          <label className="mt-4 block font-bold">Fulfillment status<select aria-label="Fulfillment status" value={statuses.includes(status)?status:statuses[0]} onChange={e=>setStatus(e.target.value)} className="mt-2 w-full rounded-xl border bg-white p-3">{statuses.map(s=><option key={s} value={s}>{s==='production_ready'&&format==='nfc_tag'?'Ready to program tag':FULFILLMENT_LABELS[s]}</option>)}</select></label>
          <button type="button" className="btn btn-ink mt-4 px-5 py-3" onClick={()=>{void action('fulfillment',{status:statuses.includes(status)?status:statuses[0]});}}>Update fulfillment</button>
          <p className="mt-2 text-xs">Record actual work. Checklist steps do not block this action.</p>
        </AdminDisclosure>

        <section className="staff-section"><h3 className="font-display text-xl">Payment</h3><p className="mt-3">Rs. {o.subtotal.toLocaleString('en',{useGrouping:false})} · {o.payment.status==='paid'?'Verified':'Awaiting verification'}</p>{o.payment.reference&&<p className="mt-2 break-all text-sm">Reference: {o.payment.reference}</p>}{o.payment.status!=='paid'&&<><p className="mt-3 text-sm">Check the actual transfer before marking it verified. A receipt upload is not required.</p><button type="button" className="btn btn-ghost mt-4 px-5 py-3" onClick={()=>{void action('verify_payment');}}>Mark payment verified</button></>}</section>

        {format==='printed_card'&&<AdminDisclosure title="Optional print proof & files"><p className="text-sm">Prepare files or ask the customer to approve a design. This is optional for publication and manual fulfillment.</p><button type="button" className="btn btn-ghost mt-4 px-4 py-3" onClick={()=>{void action('confirm_specification');}}>Confirm card specification</button>{o.card.physical&&<PrintPackage order={o} onChanged={onChanged}/>}<DesignProofShare order={o} action={run}/><AdminOrderSheet order={o}/></AdminDisclosure>}
      </>}

      <AdminDisclosure title="Optional customer message"><p className="text-sm">Saves an in-account message only when you press the button. No email is sent.</p><label className="mt-4 block font-bold">Customer-visible message<textarea aria-label="Customer-visible message" maxLength={2000} value={message} onChange={e=>setMessage(e.target.value)} className="mt-2 w-full rounded-xl border bg-white p-3"/></label><button type="button" disabled={!message.trim()} className="btn btn-ghost mt-3 px-4 py-3" onClick={()=>{void run(async()=>{await addCustomerMessage(o,message);setMessage('');});}}>Send message in account</button></AdminDisclosure>

      <AdminDisclosure title="Internal notes"><ul className="space-y-3">{(o.internalNotes||[]).map(n=><li key={n.id} className="whitespace-pre-wrap rounded-xl bg-white p-3 text-sm">{n.note}<time className="mt-2 block text-xs">{new Date(n.at).toLocaleString()}</time></li>)}</ul><label className="mt-4 block font-bold">Internal note<textarea aria-label="Internal note" maxLength={2000} value={note} onChange={e=>setNote(e.target.value)} className="mt-2 w-full rounded-xl border bg-white p-3"/></label><button type="button" disabled={!note.trim()} className="btn btn-ghost mt-3 px-4 py-3" onClick={()=>{void run(async()=>{await addOrderNote(o,note);setNote('');});}}>Save internal note</button><p className="mt-2 text-xs">Only staff can see these notes.</p></AdminDisclosure>

      <AdminDisclosure title="Staff checklist (optional)">
        <p className="text-sm">Tick anything you have checked, in any order. These checks stay private and do not block publication or production.</p>
        {!closed&&<div className="mt-5 flex flex-wrap gap-3"><button type="button" className="btn btn-ghost px-4 py-3" onClick={()=>{void action('start_review');}}>Start review</button><button type="button" className="btn btn-ghost px-4 py-3" onClick={()=>{void action('complete_review');}}>Mark review complete</button></div>}
        <p className="mt-3 text-xs">Review actions update My orders without sending email.</p>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2">{steps.map(([key,label],i)=><li key={key}><label className="flex items-center gap-3 rounded-xl bg-white p-4 text-sm"><input type="checkbox" checked={pendingCheck?.step===key?pendingCheck.checked:!!o.staffChecks?.[key]} onChange={e=>{const checked=e.target.checked;setPendingCheck({step:key,checked});void action('check_step',{step:key,checked}).finally(()=>setPendingCheck(null));}}/>{i+1}. {label}</label></li>)}</ol>
      </AdminDisclosure>
    </fieldset>
    {busy&&<p role="status" className="mt-4 text-sm">Saving and confirming…</p>}
  </div>;
}
