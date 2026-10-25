"use client";
import {createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {getPricingCatalog,type PricingCatalog} from '@/lib/pricing';
const Context=createContext<{catalog:PricingCatalog|null;error:string;refresh:()=>Promise<PricingCatalog>}>({catalog:null,error:'',refresh:async()=>{throw new Error('Pricing unavailable');}});
export default function PricingProvider({children}:{children:ReactNode}){
 const [catalog,setCatalog]=useState<PricingCatalog|null>(null),[error,setError]=useState('');const generation=useRef(0),mounted=useRef(true);
 const refresh=useCallback(()=>{const request=++generation.current;return getPricingCatalog().then(value=>{if(mounted.current&&request===generation.current){setCatalog(old=>old?.version===value.version?old:value);setError('');}return value;}).catch(e=>{if(mounted.current&&request===generation.current)setError('Prices could not be loaded. Please retry.');throw e;});},[]);
 useEffect(()=>{mounted.current=true;const load=()=>{if(document.visibilityState==='visible')void refresh().catch(()=>{});};load();const timer=setInterval(load,30000);window.addEventListener('focus',load);document.addEventListener('visibilitychange',load);window.addEventListener('edgetap-pricing-changed',load);const channel=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('edgetap-pricing'):null;if(channel)channel.onmessage=load;return()=>{mounted.current=false;clearInterval(timer);window.removeEventListener('focus',load);document.removeEventListener('visibilitychange',load);window.removeEventListener('edgetap-pricing-changed',load);channel?.close();};},[refresh]);
 return <Context.Provider value={{catalog,error,refresh}}>{children}</Context.Provider>;
}
export const usePricing=()=>useContext(Context);
export function notifyPricingChanged(){window.dispatchEvent(new Event('edgetap-pricing-changed'));if(typeof BroadcastChannel!=='undefined'){const c=new BroadcastChannel('edgetap-pricing');c.postMessage('updated');c.close();}}
