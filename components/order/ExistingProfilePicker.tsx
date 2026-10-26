"use client";
import {useCallback,useEffect,useRef,useState} from 'react';
import {auth,onAuthStateChanged} from '@/lib/auth';
import Link from 'next/link';
import {getMyProfiles} from '@/lib/data-service';
import {blankApplication,type WizardDraft} from '@/lib/application';
import type {Profile} from '@/lib/data/profile';

export default function ExistingProfilePicker({draft,onChange}:{draft:WizardDraft;onChange:(value:Partial<WizardDraft>)=>void}){
  const [profiles,setProfiles]=useState<Profile[]>([]),[error,setError]=useState(''),[uid,setUid]=useState(''),[requested,setRequested]=useState('');const applied=useRef('');
  useEffect(()=>{let generation=0;const stop=onAuthStateChanged(auth,async user=>{const request=++generation;setUid(user?.uid||'');const hint=new URLSearchParams(window.location.search).get('profile')||'';setRequested(/^[a-z0-9._-]{1,30}$/.test(hint)&&!['.','..'].includes(hint)?hint:'');setProfiles([]);setError('');if(!user)return;try{const result=await getMyProfiles();if(request===generation)setProfiles(result.filter(profile=>profile.ownerUid===user.uid));}catch{if(request===generation)setError('Your existing profiles could not be loaded. Refresh to try again.');}});return()=>{generation++;stop();};},[]);
  const selectProfile=useCallback((profile?:Profile)=>{
    const blank=blankApplication(draft.customer.email);
    onChange(profile?{existingProfileId:profile.profileId,pricingVersion:4,offer:undefined,displayName:profile.displayName,title:profile.title,bio:profile.bio,location:profile.location,usernameSuggested:profile.username,links:profile.links,avatarUrl:profile.avatar,avatarPreview:profile.avatar,logoPreview:profile.logo,physical:{...draft.physical,logoUrl:profile.logo}}:{existingProfileId:undefined,offer:undefined,displayName:'',title:'',bio:'',location:'',usernameSuggested:'',links:blank.links,avatarUrl:undefined,avatarPreview:undefined,logoPreview:undefined,physical:{...draft.physical,logoUrl:undefined}});
  },[onChange,draft.customer.email,draft.physical]);
  useEffect(()=>{const intent=uid+':'+requested;if(!uid||!requested||applied.current===intent)return;const profile=profiles.find(p=>p.username===requested);if(profile){applied.current=intent;selectProfile(profile);}},[uid,requested,profiles,selectProfile]);
  if(!profiles.length&&!draft.existingProfileId&&!error)return requested&&!uid?<div className="mt-5 rounded-xl bg-white p-4 text-sm"><p>Already own /u/{requested}? Sign in to order cards for that profile without entering it again.</p><Link className="mt-3 inline-block font-bold underline" href={'/account?next='+encodeURIComponent('/order?product=profile&profile='+requested)}>Sign in to use my profile</Link></div>:null;
  return <div className="mt-5 rounded-xl bg-white p-4"><label className="block text-sm font-bold" htmlFor="existing-profile">Already have an EdgeTap profile?</label><p className="mt-1 text-xs">Order cards for the same profile at Rs. {draft.pricingSnapshot?.additionalCardPrice??700} each.</p><select id="existing-profile" className="mt-3 w-full rounded-xl border p-3 text-sm" value={draft.existingProfileId||''} onChange={event=>{
    selectProfile(profiles.find(value=>value.profileId===event.target.value));
  }}><option value="">Create a new profile with this order</option>{profiles.map(profile=><option key={profile.profileId} value={profile.profileId}>{profile.displayName} · /u/{profile.username}</option>)}{draft.existingProfileId&&!profiles.some(profile=>profile.profileId===draft.existingProfileId)&&<option value={draft.existingProfileId}>/u/{draft.usernameSuggested} · sign in to confirm ownership</option>}</select>{error&&<p role="status" className="mt-2 text-xs">{error}</p>}</div>;
}

export function ExistingProfileDetails({draft}:{draft:WizardDraft}){
  return <section className="card-paper mb-6 p-7 sm:p-10"><h1 className="font-display text-3xl">Cards for your existing profile</h1><p className="mt-3">These cards will open /u/{draft.usernameSuggested}. Your profile stays the same.</p><div className="mt-5 flex items-center gap-4">{draft.avatarUrl&&<img src={draft.avatarUrl} alt="Your existing profile photo" className="h-20 w-20 rounded-full object-cover"/>}<div><p className="font-bold">{draft.displayName}</p><p>{draft.title}</p></div></div><p className="mt-4 whitespace-pre-wrap">{draft.bio}</p><p className="mt-4 text-sm">To change your profile, open the side menu while signed in and choose Edit profile.</p></section>;
}
