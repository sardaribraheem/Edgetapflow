import {boundedRpcRead} from './rpc-read';
import {getSupabase} from './supabase';
export type OfferId='two_card_bundle'|'three_card_bundle';
export type ProductPricing={price:number;comparison:number|null;offers:Record<OfferId,{price:number;enabled:boolean}>};
export type PricingData={direct_link:ProductPricing;profile:ProductPricing;website:{price:number;comparison:number|null;renewal:number};additionalCardPrice:number;extraLinkPrice:number};
export type PricingCatalog=PricingData&{version:number};
// Historical version-3 orders retain these agreed terms. New orders use the server catalog.
export const LEGACY_PRICING:PricingCatalog={version:0,direct_link:{price:999,comparison:1399,offers:{two_card_bundle:{price:1599,enabled:true},three_card_bundle:{price:1999,enabled:true}}},profile:{price:1499,comparison:2200,offers:{two_card_bundle:{price:2099,enabled:true},three_card_bundle:{price:2499,enabled:true}}},website:{price:29999,comparison:36999,renewal:3000},additionalCardPrice:700,extraLinkPrice:50};
export const formatPrice=(value:number)=>value.toLocaleString('en',{useGrouping:false,maximumFractionDigits:2});
export async function getPricingCatalog(version?:number):Promise<PricingCatalog>{return boundedRpcRead('get_pricing_catalog',{p_version:version??null});}
export async function savePricingCatalog(catalog:PricingCatalog):Promise<PricingCatalog>{const {version,...data}=catalog;const {data:saved,error}=await getSupabase().rpc('save_pricing_catalog',{p_catalog:data,p_version:version});if(error)throw error;return saved as PricingCatalog;}
export function selectedOfferPrice(product:string,offer:OfferId,catalog?:PricingCatalog){return (catalog||LEGACY_PRICING)[product==='direct_link'?'direct_link':'profile'].offers[offer].price;}
