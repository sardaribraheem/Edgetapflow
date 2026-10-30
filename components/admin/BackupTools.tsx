"use client";

import {useEffect,useRef,useState} from 'react';
import {buildBusinessArchive,downloadBackup,getBackupOverview,getBusinessBackup,type BackupOverview,type BackupScope} from '@/lib/admin-backup';
import {BACKUP_MAX_BYTES,decryptBackup,encryptBackup} from '@/lib/backup-format';
import PublicImagePolicySettings from './PublicImagePolicySettings';
import Icon from '@/components/ui/Icon';

export function ExportBackupDialog({scope,onClose}:{scope:BackupScope;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),controller=useRef<AbortController|null>(null);
 const [includeFiles,setIncludeFiles]=useState(true),[encrypted,setEncrypted]=useState(true);
 const [passphrase,setPassphrase]=useState(''),[confirmation,setConfirmation]=useState('');
 const [busy,setBusy]=useState(false),[progress,setProgress]=useState(''),[error,setError]=useState(''),[finished,setFinished]=useState(false);
 useEffect(()=>{const node=dialog.current,focus=document.activeElement as HTMLElement|null;node?.showModal();return()=>{controller.current?.abort();node?.close();focus?.focus();};},[]);
 async function save(){
  if(controller.current)return;const run=new AbortController();controller.current=run;setBusy(true);setError('');setProgress('Preparing current records…');
  try{
   if(encrypted&&(passphrase.length<12||passphrase!==confirmation))throw new Error('Use a matching passphrase of at least 12 characters.');
   const snapshot=await getBusinessBackup(scope);run.signal.throwIfAborted();
   const archive=await buildBusinessArchive(snapshot,includeFiles,setProgress,run.signal);
   setProgress(encrypted?'Encrypting your backup…':'Preparing download…');
   const bytes=encrypted?await encryptBackup(archive,passphrase):archive;run.signal.throwIfAborted();
   const date=new Date().toISOString().replace(/[:.]/g,'-');
   downloadBackup(bytes,`edgetap-${scope.kind}-${date}.${encrypted?'etbackup':'zip'}`,encrypted?'application/octet-stream':'application/zip');
   setPassphrase('');setConfirmation('');setFinished(true);setProgress('Your backup is ready. Your browser has started the download.');
  }catch(e){if(!run.signal.aborted)setError(e instanceof Error?e.message:'Could not prepare the backup.');else setProgress('Export cancelled. No complete backup was downloaded.');}
  finally{controller.current=null;setBusy(false);}
 }
 return <dialog ref={dialog} aria-label="Export local backup" className="admin-modal" onCancel={event=>{event.preventDefault();if(busy)controller.current?.abort();else onClose();}}>
  <div className="admin-modal-heading"><div><p className="admin-eyebrow">Local download</p><h2 className="font-display text-2xl">Export a backup</h2></div><button type="button" className="icon-button" aria-label="Close export" onClick={()=>{if(busy)controller.current?.abort();else onClose();}}><Icon name="close"/></button></div>
  <p className="mt-3 break-words text-sm">{scope.kind==='all'?'All current business records':scope.label||scope.kind+' records'}. Exporting keeps the cloud records and files in place.</p>
  {finished?<div className="mt-5 space-y-4"><p role="status" className="admin-feedback">{progress}</p><p className="text-sm">Keep another copy on a separate drive. The archive includes a SHA-256 manifest. Unlocking it does not import records into the live site.</p><button className="btn btn-ink px-5 py-3" onClick={onClose}>Done</button></div>:<form onSubmit={e=>{e.preventDefault();void save();}} className="mt-5 space-y-4">
   <fieldset disabled={busy} className="space-y-4">
    <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={includeFiles} onChange={e=>setIncludeFiles(e.target.checked)}/><span><strong>Include stored files</strong><br/>Photos, receipts, artwork and print files. Uncheck for business records and file references only.</span></label>
    <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={encrypted} onChange={e=>setEncrypted(e.target.checked)}/><span><strong>Encrypt with a passphrase</strong><br/>Recommended for private customer details. Keep the passphrase separately; it cannot be recovered.</span></label>
    {encrypted?<div className="grid gap-3"><label className="text-sm font-bold">Backup passphrase<input aria-label="Backup passphrase" type="password" autoComplete="new-password" minLength={12} required value={passphrase} onChange={e=>setPassphrase(e.target.value)} className="admin-input mt-2"/></label><label className="text-sm font-bold">Confirm backup passphrase<input aria-label="Confirm backup passphrase" type="password" autoComplete="new-password" required value={confirmation} onChange={e=>setConfirmation(e.target.value)} className="admin-input mt-2"/></label></div>:<p className="text-sm text-[var(--coral-ink)]">The ZIP will contain readable private customer records. Store it securely.</p>}
    <p className="text-xs text-[var(--ink-soft)]">Exports include business data and supported file buckets. Auth passwords/sessions, SQL schema/roles, server secrets and raw migration archives are excluded. This is not a full Supabase recovery image. Browser exports are limited to 64 MB; use a customer/profile export for a smaller bundle.</p>
    <button type="submit" className="btn btn-ink px-5 py-3" disabled={busy||(encrypted&&(passphrase.length<12||passphrase!==confirmation))}><Icon name="save" size={18}/>Download local backup</button>
   </fieldset>
   {busy&&<div className="flex flex-wrap items-center gap-3"><p role="status" className="text-sm">{progress}</p><button type="button" className="text-sm underline" onClick={()=>controller.current?.abort()}>Cancel export</button></div>}
   {!busy&&progress&&<p role="status" className="text-sm">{progress}</p>}
   {error&&<p role="alert" className="admin-feedback admin-feedback-error">{error}</p>}
  </form>}
 </dialog>;
}

export default function BackupTools(){
 const [overview,setOverview]=useState<BackupOverview|null>(null),[error,setError]=useState(''),[scope,setScope]=useState<BackupScope|null>(null);
 const [file,setFile]=useState<File|null>(null),[passphrase,setPassphrase]=useState(''),[unlocking,setUnlocking]=useState(false),[unlockMessage,setUnlockMessage]=useState('');
 const alive=useRef(true);
 async function refresh(){try{setOverview(await getBackupOverview());setError('');}catch(e){setError(e instanceof Error?e.message:'Backup counts unavailable.');}}
 useEffect(()=>{alive.current=true;void getBackupOverview().then(v=>{if(alive.current)setOverview(v);}).catch(()=>{if(alive.current)setError('Backup tools are unavailable. Reload or contact the site operator.');});return()=>{alive.current=false;};},[]);
 async function unlock(){if(!file||unlocking)return;setUnlocking(true);setUnlockMessage('');try{
  if(file.size>BACKUP_MAX_BYTES)throw new Error('This file exceeds the 64 MB browser limit. Use the offline unlock tool.');
  const bytes=await decryptBackup(new Uint8Array(await file.arrayBuffer()),passphrase);
  if(bytes[0]!==0x50||bytes[1]!==0x4b)throw new Error('The decrypted file is not a supported ZIP archive.');
  if(!alive.current)return;downloadBackup(bytes,file.name.replace(/\.etbackup$/i,'')+'-unlocked.zip','application/zip');setPassphrase('');setUnlockMessage('Unlocked locally. Your browser started the ZIP download. No records were imported.');
 }catch(e){if(alive.current)setUnlockMessage(e instanceof Error?e.message:'Could not unlock the backup.');}finally{if(alive.current)setUnlocking(false);}}
 return <div className="space-y-6"><div className="admin-page-heading"><div><p className="admin-eyebrow">Keep a copy you control</p><h1 className="font-display text-3xl">Data & backups</h1><p className="mt-2 text-sm text-[var(--ink-soft)]">Download current records and files without removing anything online.</p></div><button className="btn btn-ghost px-4 py-2" onClick={()=>{void refresh();}}><Icon name="refresh" size={16}/>Refresh</button></div>
  {error&&<p role="alert" className="admin-feedback admin-feedback-error">{error}</p>}
  <div className="admin-backup-counts">{(['profiles','accounts','customers','orders','files'] as const).map(k=><div key={k} className="card-paper p-5"><p className="text-xs capitalize text-[var(--ink-soft)]">{k}</p><p className="mt-2 font-display text-3xl">{overview?overview[k]:'—'}</p></div>)}</div>
  <section className="card-paper p-6"><h2 className="font-display text-xl">Business data and files</h2><p className="mt-3 max-w-2xl text-sm text-[var(--ink-soft)]">Profiles, account identities, orders, payment records, notes, catalog settings and supported uploads. You can also export one profile from Profiles or one customer from Clients.</p><button className="btn btn-ink mt-5 px-5 py-3" disabled={!overview||!!error} onClick={()=>setScope({kind:'all'})}><Icon name="save" size={18}/>Export all business data</button><p className="mt-4 text-xs text-[var(--ink-soft)]">A download is a copy. It does not delete cloud files, close accounts, send messages or change payment status.</p></section>
  <section className="card-paper p-6"><h2 className="font-display text-xl">Unlock an encrypted backup</h2><p className="mt-3 text-sm text-[var(--ink-soft)]">Choose your .etbackup file and its passphrase. Unlocking happens in this browser and downloads a ZIP; it does not upload or restore data to the site.</p><form className="mt-5 grid max-w-xl gap-4" onSubmit={e=>{e.preventDefault();void unlock();}}><label className="text-sm font-bold">Encrypted backup file<input aria-label="Encrypted backup file" type="file" accept=".etbackup" required onChange={e=>{setFile(e.target.files?.[0]||null);setUnlockMessage('');}} className="admin-input mt-2"/></label><label className="text-sm font-bold">Unlock passphrase<input aria-label="Unlock passphrase" type="password" autoComplete="off" value={passphrase} required onChange={e=>setPassphrase(e.target.value)} className="admin-input mt-2"/></label><button disabled={!file||!passphrase||unlocking} className="btn btn-ghost justify-self-start px-5 py-3">{unlocking?'Unlocking…':'Unlock locally'}</button>{unlockMessage&&<p role="status" className="text-sm">{unlockMessage}</p>}</form></section>
  <PublicImagePolicySettings/><details className="card-paper p-6"><summary className="cursor-pointer font-display text-lg">Recovery and deletion boundaries</summary><div className="mt-4 space-y-3 text-sm text-[var(--ink-soft)]"><p>Keep an independent second copy and test recovery. Database/schema recovery uses an operator backup; this export contains business records and file bytes only when selected.</p><p>Encrypted files can also be unlocked offline with the included local script <code>scripts/unlock-local-backup.mjs</code>. No account or network connection is needed. <a className="underline" href="/tools/edgetap-unlock.mjs" download>Download the offline unlock tool</a>.</p><p>Use Profiles to review permanent deletion. Hidden eligible profiles require the exact handle and a reason. Protected profiles, paid/open orders and other retention blockers remain protected. No cloud files are removed by these tools.</p></div></details>
  {scope&&<ExportBackupDialog scope={scope} onClose={()=>setScope(null)}/>}
 </div>;
}
