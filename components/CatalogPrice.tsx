"use client";
import {usePricing} from './PricingProvider';
import {formatPrice} from '@/lib/pricing';
export function CatalogPrice({product}:{product:'direct_link'|'profile'|'website'}){
 const {catalog,productCatalog,profilePolicy,error,refresh}=usePricing();
 const annual=product==='profile'&&profilePolicy&&(profilePolicy.accountKnown?profilePolicy.newAccountTrial:profilePolicy.futureAccountTrial);
 const p=annual&&productCatalog?{price:productCatalog.prices.profileAnnual+productCatalog.prices.cardPrinted,comparison:null}:catalog?.[product];
 if(!p)return <p role="status" className="pricing-price-detail">{error||'Loading price…'}{error&&<button type="button" className="ml-2 underline" onClick={()=>{void refresh().catch(()=>{});}}>Retry</button>}</p>;
 return <div className="pricing-discount font-display" aria-label={p.comparison&&p.comparison>p.price?`Previously Rs. ${formatPrice(p.comparison)}, now Rs. ${formatPrice(p.price)}`:`Rs. ${formatPrice(p.price)}`}><p className="pricing-price"><span className="pricing-currency">Rs.</span> {formatPrice(p.price)}</p>{p.comparison!==null&&p.comparison>p.price&&<del>{formatPrice(p.comparison)}</del>}</div>;
}
export function CatalogRenewal(){const {catalog}=usePricing();return <>Renewal estimate: {catalog?'Rs. '+formatPrice(catalog.website.renewal)+'/year':'quote required'}. Confirm the chosen domain and hosting cost before starting</>;}
export function CatalogExtras(){const {catalog}=usePricing();if(!catalog)return null;return <p className="mt-4 text-sm text-[var(--ink-soft)]">Additional matching cards: Rs. {formatPrice(catalog.additionalCardPrice)} each. First ten profile links included; extra links: Rs. {formatPrice(catalog.extraLinkPrice)} each, once per profile. Available card bundles are shown when you order.</p>;}
