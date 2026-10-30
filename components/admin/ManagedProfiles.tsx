"use client";

import {useEffect,useRef,useState} from 'react';
import {listManagedProfiles,setProfileVisibility,separateProfileAccount,deleteManagedProfile,type ManagedProfile} from '@/lib/website-profiles';
import {getStaffProfile,getProfile} from '@/lib/data-service';
import ProfilePlanNotice from '@/components/ProfilePlanNotice';
import ProfileSectionsEditor from '@/components/ProfileSectionsEditor';
import ProfileShowcaseEditor from '@/components/ProfileShowcaseEditor';
import ProfileEditor from '@/components/ProfileEditor';
import {getCurrentUser} from '@/lib/auth';
import {notifyProfileChanged} from '@/lib/profile-sync';
import ProfileAccountAction from './ProfileAccountAction';
import {ExportBackupDialog} from './BackupTools';
import type {BackupScope} from '@/lib/admin-backup';

export default function ManagedProfiles({onChanged}:{onChanged?:()=>Promise<void>}) {
  const [profiles,setProfiles]=useState<ManagedProfile[]>([]);
  const [query,setQuery]=useState(''),[filter,setFilter]=useState('all');
  const [ready,setReady]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState('');
  const [editing,setEditing]=useState<{profile:ManagedProfile;uid:string}|null>(null);
  const [operation,setOperation]=useState<{profile:ManagedProfile;action:'delete'|'separate'}|null>(null);
  const [exportScope,setExportScope]=useState<BackupScope|null>(null);
  const lock=useRef(false),generation=useRef(0);

  useEffect(()=>{
    let active=true;const request=++generation.current;
    const timer=setTimeout(()=>{void listManagedProfiles(query).then(values=>{
      if(active&&request===generation.current){setProfiles(values);setReady(true);setError('');}
    }).catch(()=>{if(active){setError('Customer profiles could not be loaded.');setReady(true);}});},200);
    return()=>{active=false;clearTimeout(timer);};
  },[query]);

  async function refresh() {const request=++generation.current;const values=await listManagedProfiles(query);if(request===generation.current)setProfiles(values);return values;}

  async function visibility(profile:ManagedProfile) {
    if(lock.current)return;
    const active=profile.active===false;
    if(!active&&window.prompt(`Type ${profile.username} to hide this profile. Its handle and records are kept so it can be restored.`)!==profile.username)return;
    lock.current=true;setBusy(profile.username);setError('');setNotice('');
    try {
      const written=await setProfileVisibility(profile,active),saved=await getStaffProfile(profile.username);
      if(!saved||saved.version!==written.version||saved.active!==active)throw new Error('Could not confirm the change. Refresh before retrying.');
      if(active) {if((await getProfile(profile.username)).profileId!==profile.profileId)throw new Error('Public visibility could not be confirmed.');}
      else {let visible=false;try{await getProfile(profile.username);visible=true;}catch(e){if(!(e instanceof Error&&e.message==='Profile not found.'))throw e;}if(visible)throw new Error('The profile is still publicly visible.');}
      await refresh();notifyProfileChanged(profile.username);
      setNotice(active?'Profile restored.':'Profile hidden. You can restore it or review permanent deletion.');
    } catch(e) {setError(e instanceof Error?e.message:'Could not confirm profile visibility.');}
    finally {setBusy('');lock.current=false;}
  }

  async function confirmAction(confirmation:string,reason:string) {
    if(!operation||lock.current)return;
    const {profile,action}=operation;lock.current=true;setBusy(profile.username);setError('');setNotice('');
    try {
      if(action==='delete') {
        const result=await deleteManagedProfile(profile,confirmation,reason);
        if(!result.deleted||result.profileId!==profile.profileId||await getStaffProfile(profile.username))throw new Error('Permanent deletion could not be confirmed. Refresh before retrying.');
      } else {
        const result=await separateProfileAccount(profile,confirmation,reason);
        const saved=(await listManagedProfiles(profile.username)).find(p=>p.profileId===profile.profileId);
        if(!saved||saved.version!==result.version||saved.account?.userId!==null||saved.account?.kind!=='staff_managed')throw new Error('Account separation could not be confirmed. Refresh before retrying.');
      }
      await refresh();if(onChanged)await onChanged();notifyProfileChanged(profile.username);setOperation(null);
      setNotice(action==='delete'?`/u/${profile.username} was permanently deleted. Its handle remains reserved.`:`/u/${profile.username} and its linked orders are now staff-managed, separate from the login account. No messages were sent.`);
    } catch(e) {setError(e instanceof Error?e.message:'This action could not be confirmed. Refresh before retrying.');}
    finally {setBusy('');lock.current=false;}
  }

  const visible=profiles.filter(p=>filter==='all'||(filter==='hidden'?p.active===false:p.active!==false));
  return <section className="card-paper mb-8 p-6">
    <h1 className="font-display text-2xl">Customer profiles</h1>
    <p className="mt-3 text-sm">Hide keeps a profile restorable. Permanent deletion is a separate confirmed action. Account access and submitted contact details are shown separately.</p>
    <div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="admin-badge">{profiles.filter(p=>p.active!==false).length} live</span><span className="admin-badge">{profiles.filter(p=>p.active===false).length} hidden</span><span className="admin-badge">{profiles.length} loaded</span></div>
    <div className="mt-5 flex flex-wrap gap-3"><label className="min-w-0 flex-1 font-bold">Find a profile<input aria-label="Find a profile" placeholder="Name, handle or login email" value={query} onChange={e=>setQuery(e.target.value)} maxLength={120} className="mt-2 w-full rounded-xl border bg-white p-3"/></label><label className="font-bold">Visibility<select aria-label="Profile visibility filter" value={filter} onChange={e=>setFilter(e.target.value)} className="mt-2 block rounded-xl border bg-white p-3"><option value="all">All profiles</option><option value="live">Live profiles</option><option value="hidden">Hidden profiles</option></select></label></div>
    {error&&<p role="alert" className="mt-4 rounded-xl bg-[var(--coral)]/10 p-4">{error}</p>}
    {notice&&<p role="status" className="mt-4 rounded-xl bg-[var(--mint-soft)] p-4">{notice}</p>}
    {!ready?<p role="status" className="mt-5">Loading profiles…</p>:<ul className="mt-5 space-y-4">{visible.map(profile=><li key={profile.profileId} className="min-w-0 rounded-xl bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-4"><div className="min-w-0"><h2 className="font-display text-lg">{profile.displayName}</h2><a href={'/u/'+profile.username} className="break-all text-sm underline" target="_blank" rel="noreferrer">/u/{profile.username}</a><p className="mt-2 text-xs">{profile.freeProfile?'Free profile':'Customer profile'} · {profile.active===false?'Hidden':profile.plan?.status==='expired'&&!profile.plan.legacyRights?'Service expired':'Live'}{profile.protectedProfile?' · Protected':''}</p></div><div className="flex flex-wrap gap-2">
        {profile.active!==false&&<button type="button" className="btn btn-ghost px-4 py-3" disabled={!!busy} onClick={()=>{void getCurrentUser().then(user=>{if(user)setEditing({profile,uid:user.uid});}).catch(()=>setError('Sign in as staff before editing.'));}}>Edit public details</button>}
        <button type="button" className="btn btn-ghost px-4 py-3" disabled={!!busy||!profile.profileId} onClick={()=>setExportScope({kind:"profile",id:profile.profileId,label:"/u/"+profile.username})}>Export profile</button>
        <button type="button" className="btn btn-ghost px-4 py-3" onClick={()=>{const node=document.getElementById("profile-cleanup-"+profile.profileId) as HTMLDetailsElement|null;if(node){node.open=true;node.scrollIntoView({block:"nearest"});}}}>Review deletion</button>
        <button type="button" disabled={!!busy} onClick={()=>{void visibility(profile);}} className="btn btn-ghost px-4 py-3">{busy===profile.username?'Confirming…':profile.active===false?'Restore profile':'Hide profile'}</button>
      </div></div>
      <ProfilePlanNotice profile={profile} allowRenew={false}/><ProfileSectionsEditor profile={profile}/><ProfileShowcaseEditor key={profile.profileId} profile={profile} staff/>
      <details id={"profile-cleanup-"+profile.profileId} className="admin-details mt-4"><summary>Account access & cleanup</summary><div className="space-y-4 p-4 text-sm">
        <p className="break-all">{profile.account?.kind==='login'?`Login account: ${profile.account.email}`:profile.account?.kind==='staff_managed'?'Staff-managed · No login account':'Account details unavailable.'}</p>
        <p>This is the account that can manage the profile. Public contact links are independent.</p>
        {!!profile.linkedOrders?.length&&<div><p className="font-bold">Linked orders</p><ul className="mt-2 space-y-2">{profile.linkedOrders.map(order=><li key={order.id}><a className="underline" href={'/admin?order='+encodeURIComponent(order.id)} target="_blank" rel="noreferrer">{order.reference}</a> · {order.status.replaceAll('_',' ')}</li>)}</ul></div>}
        {profile.active===false&&!profile.protectedProfile&&profile.account?.kind==='login'&&<button type="button" disabled={!!busy} className="btn btn-ghost px-4 py-3" onClick={()=>setOperation({profile,action:'separate'})}>Separate from login account</button>}
        {profile.deleteBlockers&&<div><h3 className="font-bold">Permanent deletion</h3>{profile.deleteBlockers.length?<ul className="mt-2 list-disc space-y-2 pl-5">{profile.deleteBlockers.map(reason=><li key={reason}>{reason}</li>)}</ul>:<><p className="mt-2">No restore after deletion. Accounts, closed order/payment history and files are kept.</p><button type="button" disabled={!!busy} className="btn btn-ghost mt-3 px-4 py-3 text-[var(--coral-ink)]" onClick={()=>setOperation({profile,action:'delete'})}>Permanently delete profile</button></>}</div>}
      </div></details>
    </li>)}{!visible.length&&<li>No customer profiles match.</li>}</ul>}
    {editing&&<ProfileEditor profile={editing.profile} uid={editing.uid} onClose={()=>setEditing(null)} onSaved={()=>{setEditing(null);void refresh().catch(()=>setError('The profile was saved; reload the directory to see it.'));}}/>}
    {exportScope&&<ExportBackupDialog scope={exportScope} onClose={()=>setExportScope(null)}/>}
    {operation&&<ProfileAccountAction key={operation.profile.profileId+operation.action} {...operation} busy={!!busy} error={error} onClose={()=>{if(!busy)setOperation(null);}} onConfirm={confirmAction}/>}
  </section>;
}
