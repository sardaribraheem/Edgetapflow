"use client";
import {useEffect,useState} from 'react';
import {getProfile} from './data-service';
import type {Profile} from './data/profile';
export function useLiveProfile(username:string){
 const [profile,setProfile]=useState<Profile|null>(null);
 useEffect(()=>{let active=true,generation=0;const load=()=>{if(document.visibilityState!=='visible')return;const request=++generation;void getProfile(username).then(value=>{if(active&&request===generation)setProfile(value);}).catch(()=>{});};load();const changed=(e:Event)=>{if((e as CustomEvent).detail===username)load();};window.addEventListener('focus',load);document.addEventListener('visibilitychange',load);window.addEventListener('edgetap-profile-changed',changed);const c=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('edgetap-profiles'):null;if(c)c.onmessage=e=>{if(e.data===username)load();};return()=>{active=false;window.removeEventListener('focus',load);document.removeEventListener('visibilitychange',load);window.removeEventListener('edgetap-profile-changed',changed);c?.close();};},[username]);
 return profile;
}
