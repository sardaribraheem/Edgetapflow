"use client";
import {useEffect,useState} from 'react';
import type {WizardDraft} from '@/lib/application';
import {getPricingCatalog} from '@/lib/pricing';
import {calculateSubtotal} from '@/lib/data/order';
import {usePricing} from '@/components/PricingProvider';
export function useDraftPricing(draft:WizardDraft,onChange:(p:Partial<WizardDraft>)=>void,hydrated:boolean,locked=false){
 const {catalog,error:catalogError,refresh}=usePricing();const [error,setError]=useState(''),[reviewRequired,setReviewRequired]=useState(false);
 const target=locked?draft.pricingCatalogVersion:catalog?.version;
 useEffect(()=>{if(!hydrated||locked&&draft.pricingVersion!==4||!target||draft.pricingVersion===4&&draft.pricingSnapshot?.version===target&&draft.pricingCatalogVersion===target)return;
  let active=true;void (locked?getPricingCatalog(target):Promise.resolve(catalog!)).then(value=>{
   if(!active)return;const offer=draft.offer&&value[draft.product==='direct_link'?'direct_link':'profile'].offers[draft.offer].enabled?draft.offer:undefined;
   const next={...draft,pricingVersion:4 as const,pricingCatalogVersion:value.version,pricingSnapshot:value,offer};
   if(!locked&&draft.payment.receiptUrl){let oldTotal:number|undefined;try{oldTotal=calculateSubtotal(draft.quantity,draft.product||'profile',draft.links.length,draft);}catch{}if(draft.pricingVersion===4?draft.pricingCatalogVersion!==value.version:oldTotal!==calculateSubtotal(next.quantity,next.product||'profile',next.links.length,next))setReviewRequired(true);}
   onChange({pricingVersion:4,pricingCatalogVersion:value.version,pricingSnapshot:value,offer});setError('');
  }).catch(()=>{if(active)setError('Your saved order prices could not be loaded. Please retry.');});return()=>{active=false;};
 },[hydrated,locked,target,draft,onChange,catalog]);
 const ready=hydrated&&(locked&&draft.pricingVersion!==4||draft.pricingVersion===4&&!!draft.pricingSnapshot&&draft.pricingSnapshot.version===target&&draft.pricingCatalogVersion===target);
 return {ready,error:error||catalogError,refresh,reviewRequired,acceptPrices:()=>setReviewRequired(false)};
}
