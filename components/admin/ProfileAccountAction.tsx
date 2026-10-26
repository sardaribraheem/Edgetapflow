"use client";

import {useEffect,useRef,useState} from 'react';
import type {ManagedProfile} from '@/lib/website-profiles';

export default function ProfileAccountAction({profile,action,busy,error,onClose,onConfirm}:{
  profile:ManagedProfile;action:'delete'|'separate';busy:boolean;error:string;onClose:()=>void;
  onConfirm:(confirmation:string,reason:string)=>Promise<void>;
}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const [confirmation,setConfirmation]=useState('');
  const [reason,setReason]=useState('');
  useEffect(()=>{
    const element=dialog.current,focused=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;
    element?.showModal();document.body.style.overflow='hidden';
    return()=>{element?.close();document.body.style.overflow=overflow;focused?.focus();};
  },[]);
  const deleting=action==='delete';
  const title=deleting?'Permanently delete profile':'Separate from login account';
  return <dialog ref={dialog} aria-label={title} aria-modal="true" className="publication-dialog w-[calc(100%_-_2rem)] max-w-lg overflow-auto rounded-3xl bg-[var(--cream)] p-6 text-[var(--ink)]" onCancel={e=>{e.preventDefault();if(!busy)onClose();}}>
    <h2 className="font-display text-2xl">{title}</h2>
    <p className="mt-3 break-all font-bold">/u/{profile.username}</p>
    <p className="mt-4 text-sm">{deleting?'Deletes the saved profile and its links. It cannot be restored in the dashboard. The handle stays reserved so old cards cannot open someone else’s profile. Accounts, order/payment history and uploaded files are kept.':`Removes ${profile.account?.email||'this login account'} from this profile and its ${profile.linkedOrders?.length||0} linked order(s). The records stay staff-managed, without a new login. Any copied login email is cleared from those order contacts. Other profiles on the account stay unchanged.`}</p>
    <p className="mt-3 text-sm font-bold">No email, confirmation or notification is sent.</p>
    {error&&<p role="alert" className="mt-4 rounded-xl bg-[var(--coral)]/10 p-3">{error}</p>}
    <form onSubmit={e=>{e.preventDefault();if(!busy)void onConfirm(confirmation,reason);}} className="mt-5 space-y-4">
      <fieldset disabled={busy} className="space-y-4">
        <label className="block text-sm font-bold">Type the profile handle<input aria-label="Type the profile handle" required autoComplete="off" value={confirmation} onChange={e=>setConfirmation(e.target.value)} className="mt-2 w-full rounded-xl border bg-white p-3"/></label>
        <label className="block text-sm font-bold">Reason for this action<textarea aria-label="Reason for this action" required minLength={3} maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)} className="mt-2 w-full rounded-xl border bg-white p-3"/></label>
        <div className="flex flex-wrap gap-3"><button type="submit" disabled={confirmation!==profile.username||reason.trim().length<3} className="btn btn-ink px-4 py-3">{busy?'Saving and confirming…':deleting?'Permanently delete this profile':'Separate this profile'}</button><button type="button" onClick={onClose} className="btn btn-ghost px-4 py-3">Cancel</button></div>
      </fieldset>
    </form>
  </dialog>;
}
