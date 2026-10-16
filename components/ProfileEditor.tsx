"use client";

import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Profile, ProfileLink } from '@/lib/data/profile';
import { LINK_PRESETS, LINK_ACCENTS } from '@/lib/data/order';
import { getCurrentUser } from '@/lib/auth';
import { getProfile, saveProfile } from '@/lib/data-service';
import { uploadPublicAvatar } from '@/lib/upload-service';
import { isSafeContactUrl } from '@/lib/links';
import DefaultAvatar from './ui/DefaultAvatar';
import Icon from './ui/Icon';

export default function ProfileEditor({profile,uid,onClose,onSaved}:{profile:Profile;uid:string;onClose:()=>void;onSaved:(profile:Profile)=>void}) {
  const [draft,setDraft]=useState<Profile>(()=>({...profile,links:profile.links.map(link=>({...link}))}));
  const [photo,setPhoto]=useState<File|null>(null),[preview,setPreview]=useState('');
  const [logoFile,setLogoFile]=useState<File|null>(null),[logoPreview,setLogoPreview]=useState('');
  const uploadedLogo=useRef<{file:File;url:string}|null>(null);
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const dialog=useRef<HTMLDialogElement>(null),operation=useRef(false),mounted=useRef(false);
  const uploaded=useRef<{file:File;url:string}|null>(null);
  useEffect(()=>{
    mounted.current=true;
    const modal=dialog.current,focus=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;
    modal?.showModal();document.body.style.overflow='hidden';
    return()=>{mounted.current=false;modal?.close();document.body.style.overflow=overflow;focus?.focus();};
  },[]);
  useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
  useEffect(()=>()=>{if(logoPreview)URL.revokeObjectURL(logoPreview);},[logoPreview]);
  const selectLogo=(file:File|undefined)=>{if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size<=0||file.size>5*1024*1024){setError('Choose a JPEG, PNG or WebP logo up to 5 MB.');return;}setError('');setLogoFile(file);setLogoPreview(URL.createObjectURL(file));uploadedLogo.current=null;};
  const changeLink=(index:number,patch:Partial<ProfileLink>)=>setDraft(value=>({...value,links:value.links.map((link,i)=>i===index?{...link,...patch}:link)}));
  const selectPhoto=(file:File|undefined)=>{
    if(!file)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size<=0||file.size>5*1024*1024){setError('Choose a JPEG, PNG or WebP image up to 5 MB.');return;}
    setError('');setPhoto(file);setPreview(URL.createObjectURL(file));uploaded.current=null;
  };
  const save=async(event:FormEvent)=>{
    event.preventDefault();if(operation.current)return;
    if(!draft.displayName.trim()||draft.links.length>10||draft.links.some(link=>!link.label.trim()||!isSafeContactUrl(link.url))){setError('Add a name and valid contact URLs, with no more than ten links.');return;}
    operation.current=true;setBusy(true);setError('');
    try{
      const check=async()=>{if(!mounted.current||(await getCurrentUser())?.uid!==uid)throw new Error('Your sign-in changed. Reopen the profile with its owner account.');};
      await check();let avatar=draft.avatar;
      if(photo){
        if(uploaded.current?.file!==photo)uploaded.current={file:photo,url:await uploadPublicAvatar(uid,photo)};
        avatar=uploaded.current.url;await check();
      }
      let logo=draft.logo;if(logoFile){if(uploadedLogo.current?.file!==logoFile)uploadedLogo.current={file:logoFile,url:await uploadPublicAvatar(uid,logoFile)};logo=uploadedLogo.current.url;await check();}
      const parts=draft.displayName.trim().split(/\s+/);
      await saveProfile(profile.username,{...draft,username:profile.username,avatar,logo,firstName:parts[0],lastName:parts.slice(1).join(' ')});
      await check();const saved=await getProfile(profile.username);await check();onSaved(saved);
    }catch(e){if(mounted.current)setError(e instanceof Error&&/changed|Reload|reopen/i.test(e.message)?e.message:'Could not publish your changes. Your edits are still here; try again.');}
    finally{operation.current=false;if(mounted.current)setBusy(false);}
  };
  return <dialog ref={dialog} aria-label="Edit profile" className="profile-editor" onCancel={event=>{event.preventDefault();if(!operation.current)onClose();}} onClick={event=>{if(event.target===event.currentTarget&&!operation.current)onClose();}}>
    <form onSubmit={event=>{void save(event);}}>
      <header className="profile-editor-header"><div><h2 className="font-display text-2xl">Edit profile</h2><p className="mt-1 text-xs text-[var(--ink-soft)]">/u/{profile.username} <Icon name="shield" size={13}/></p></div><button type="button" aria-label="Close profile editor" disabled={busy} className="icon-button" onClick={onClose}><Icon name="close"/></button></header>
      <fieldset disabled={busy} className="profile-editor-fields">
        <div className="flex flex-wrap items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-full">{photo&&preview||draft.avatar?<img src={photo&&preview||draft.avatar} alt="New profile photo preview" className="h-full w-full object-cover"/>:<DefaultAvatar size={44}/>}</div>
          <div><label className="btn btn-ghost cursor-pointer px-4 py-3"><Icon name="camera" size={18}/>Change photo<input type="file" aria-label="Profile picture" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={event=>selectPhoto(event.target.files?.[0])}/></label><p className="mt-2 text-xs text-[var(--ink-soft)]">Public when saved · Up to 5 MB</p></div>
          {(photo||draft.avatar)&&<button type="button" className="icon-button" aria-label="Remove profile picture" title="Remove photo" onClick={()=>{setPhoto(null);setPreview('');uploaded.current=null;setDraft(value=>({...value,avatar:''}));}}><Icon name="trash"/></button>}
        </div>
        {'logo' in profile&&<div className="flex flex-wrap items-center gap-4">{(logoPreview||draft.logo)&&<img src={logoPreview||draft.logo} alt="Logo preview" className="h-14 max-w-32 object-contain"/>}<label className="btn btn-ghost cursor-pointer px-4 py-3"><Icon name="camera" size={18}/>Logo (optional)<input type="file" aria-label="Profile logo" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={event=>selectLogo(event.target.files?.[0])}/></label>{(logoFile||draft.logo)&&<button type="button" className="icon-button" aria-label="Remove logo" onClick={()=>{setLogoFile(null);setLogoPreview('');uploadedLogo.current=null;setDraft(value=>({...value,logo:''}));}}><Icon name="trash"/></button>}<p className="text-xs text-[var(--ink-soft)]">Public when saved · Digital profile only. Printed cards keep their approved design.</p></div>}
        <div className="grid gap-4 sm:grid-cols-2">
          {([{key:'displayName',label:'Display name',max:120},{key:'title',label:'Professional title',max:160},{key:'location',label:'Location',max:160}] as const).map(field=><label key={field.key} className="profile-editor-label">{field.label}<input value={draft[field.key]} maxLength={field.max} required={field.key==='displayName'} onChange={event=>setDraft(value=>({...value,[field.key]:event.target.value}))}/></label>)}
          <label className="profile-editor-label sm:col-span-2">Bio<textarea aria-label="Bio" rows={4} maxLength={2000} value={draft.bio} onChange={event=>setDraft(value=>({...value,bio:event.target.value}))}/></label>
        </div>
        <section><div className="flex items-center justify-between"><h3 className="font-display text-lg">Links</h3><span className="text-xs">{draft.links.length}/10</span></div>
          <div className="mt-3 flex flex-wrap gap-2">{LINK_PRESETS.filter((preset,index,array)=>array.findIndex(p=>p.type===preset.type)===index).map(preset=><button type="button" key={preset.type} disabled={draft.links.length>=10} className="profile-link-preset" onClick={()=>setDraft(value=>({...value,links:[...value.links,{type:preset.type,label:preset.label,icon:preset.type,accent:LINK_ACCENTS[preset.type]||'#100B4A',url:preset.type==='email'?'mailto:':preset.type==='whatsapp'?'https://wa.me/':'https://'}]}))}>+ {preset.label}</button>)}</div>
          <div className="mt-4 space-y-3">{draft.links.map((link,index)=><div key={index} className="profile-link-editor"><label className="profile-editor-label">Label<input aria-label={`Link ${index+1} label`} maxLength={80} value={link.label} required onChange={event=>changeLink(index,{label:event.target.value})}/></label><label className="profile-editor-label">URL<input aria-label={`Link ${index+1} URL`} maxLength={2048} value={link.url} required onChange={event=>changeLink(index,{url:event.target.value})}/></label><button type="button" className="icon-button" aria-label={`Remove link ${index+1}`} onClick={()=>setDraft(value=>({...value,links:value.links.filter((_,i)=>i!==index)}))}><Icon name="trash" size={18}/></button></div>)}</div>
          <button type="button" disabled={draft.links.length>=10} className="btn btn-ghost mt-4 px-4 py-2" onClick={()=>setDraft(value=>({...value,links:[...value.links,{type:'portfolio',label:'Website',url:'https://',icon:'globe',accent:'#100B4A'}]}))}>+ Add link</button>
        </section>
      </fieldset>
      <footer className="profile-editor-footer">{error&&<p role="alert" className="w-full text-sm text-[var(--coral-ink)]">{error}</p>}<button type="button" disabled={busy} className="btn btn-ghost px-4 py-3" onClick={onClose}>Cancel</button><button type="submit" disabled={busy} className="btn btn-ink px-5 py-3"><Icon name="save" size={18}/>{busy?'Publishing…':'Save & publish'}</button></footer>
    </form>
  </dialog>;
}
