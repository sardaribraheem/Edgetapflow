"use client";
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {auth,onAuthStateChanged,type User} from '@/lib/auth';
import {getMyProfiles} from '@/lib/data-service';
import type {Profile} from '@/lib/data/profile';
import ProfileEditor from '@/components/ProfileEditor';
import Navbar from '@/components/Navbar';
export default function EditMyProfilePage(){
 const accountUid=useRef<string|null|undefined>(undefined);
 const router=useRouter();const [user,setUser]=useState<User|null>(null),[ready,setReady]=useState(false),[profiles,setProfiles]=useState<Profile[]>([]),[selected,setSelected]=useState(''),[error,setError]=useState(''),[message,setMessage]=useState(''),[attempt,setAttempt]=useState(0);
 useEffect(()=>onAuthStateChanged(auth,current=>{setUser(current);const uid=current?.uid||null;if(accountUid.current===uid)return;accountUid.current=uid;setProfiles([]);setReady(!current);setError('');setMessage('');}),[]);
 const uid=user?.uid;
 useEffect(()=>{if(!uid)return;let active=true;void getMyProfiles().then(values=>{if(active){const owned=values.filter(p=>p.ownerUid===uid);setProfiles(owned);setSelected(current=>owned.some(p=>p.username===current)?current:owned[0]?.username||'');setReady(true);}}).catch(()=>{if(active){setError('Your profiles could not be loaded. Please retry.');setReady(true);}});return()=>{active=false;};},[uid,attempt]);
 const profile=profiles.find(p=>p.username===selected);
 return <><Navbar/><main className="container-x min-h-screen max-w-4xl pb-16 pt-28"><Link href="/account" className="underline">← My account</Link>{!ready?<p role="status" className="mt-6">Loading your profile…</p>:!user?<section className="card-paper mt-6 p-6"><h1 className="font-display text-3xl">Sign in to edit your profile</h1><Link href="/account?next=%2Faccount%2Fprofile" className="btn btn-ink mt-5 px-5 py-3">Sign in / Login</Link></section>:error?<p role="alert" className="mt-6">{error} <button className="underline" onClick={()=>{setReady(false);setAttempt(value=>value+1);}}>Try again</button></p>:!profile?<section className="card-paper mt-6 p-6"><h1 className="font-display text-2xl">Your profile is not live yet</h1><p className="mt-3">Create a free profile and publish it yourself, or follow the profile in your card order.</p><Link href="/create-profile" className="btn btn-ink mt-4 px-5 py-3">Create my free profile</Link><Link href="/account/orders" className="mt-4 block underline">View my orders</Link></section>:<>{profiles.length>1&&<label className="mt-5 block font-bold">Choose your profile<select aria-label="Choose your profile" className="mt-2 w-full rounded-xl border p-3" value={selected} onChange={e=>{setSelected(e.target.value);setMessage('');}}>{profiles.map(p=><option value={p.username} key={p.username}>{p.displayName} · /u/{p.username}</option>)}</select></label>}{message&&<p role="status" className="mt-5 rounded-xl bg-[var(--mint-soft)] p-4">{message} <Link href={'/u/'+profile.username} className="underline">View public profile</Link></p>}<div className="mt-6"><ProfileEditor key={profile.username+':'+profile.version} inline profile={profile} uid={user.uid} onClose={()=>router.push('/account')} onSaved={saved=>{setProfiles(values=>values.map(p=>p.username===saved.username?saved:p));setMessage('Your profile changes are saved and confirmed on the public page.');}}/></div></>}</main></>;
}
