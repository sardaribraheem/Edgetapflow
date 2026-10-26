"use client";

import {useState} from 'react';
import type {Order} from '@/lib/data/order';
import {adminUpdateOrderContact} from '@/lib/application';

export default function OrderContactEditor({order,onSave}:{order:Order;onSave:(work:()=>Promise<unknown>)=>Promise<void>}) {
  const [editing,setEditing]=useState(false);
  const [contact,setContact]=useState({fullName:order.customer.fullName,phone:order.customer.phone,email:order.customer.email});
  const [reason,setReason]=useState('');
  return <section className="mt-5 rounded-xl bg-white p-4">
    <h4 className="font-bold">Login account & order contact</h4>
    <p className="mt-2 break-all text-sm">{order.account?.kind==='staff_managed'?'Staff-managed customer · No login access':order.account?.email?`Login account: ${order.account.email}`:'Login account details are unavailable.'}</p>
    <p className="mt-2 text-xs">The order contact can be different from the login account. Correcting it does not change anyone’s sign-in or public profile.</p>
    {!editing?<button type="button" className="btn btn-ghost mt-3 px-4 py-3" onClick={()=>setEditing(true)}>Correct order contact</button>:<div className="mt-4 space-y-4">
      <label className="block text-sm font-bold">Order contact name<input aria-label="Order contact name" value={contact.fullName} maxLength={120} onChange={e=>setContact({...contact,fullName:e.target.value})} className="mt-2 w-full rounded-xl border p-3"/></label>
      <label className="block text-sm font-bold">Order contact phone<input aria-label="Order contact phone" value={contact.phone} maxLength={30} type="tel" onChange={e=>setContact({...contact,phone:e.target.value})} className="mt-2 w-full rounded-xl border p-3"/></label>
      <label className="block text-sm font-bold">Order contact email<input aria-label="Order contact email" value={contact.email} maxLength={254} type="email" onChange={e=>setContact({...contact,email:e.target.value})} className="mt-2 w-full rounded-xl border p-3"/></label>
      <label className="block text-sm font-bold">Reason for contact correction<textarea aria-label="Reason for contact correction" value={reason} maxLength={1000} onChange={e=>setReason(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label>
      <p className="text-xs">Leave a wrong phone or email blank if the correct one is unknown. No email or notification is sent.</p>
      <div className="flex flex-wrap gap-3"><button type="button" disabled={!contact.fullName.trim()||reason.trim().length<3} className="btn btn-ink px-4 py-3" onClick={()=>{void onSave(async()=>{
        await adminUpdateOrderContact(order,contact,reason);
        setEditing(false);setReason('');
      });}}>Save corrected contact</button><button type="button" className="btn btn-ghost px-4 py-3" onClick={()=>setEditing(false)}>Cancel correction</button></div>
    </div>}
  </section>;
}
