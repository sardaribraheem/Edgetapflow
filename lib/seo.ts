import type { Metadata } from 'next';
import { APP_URL } from './site';

export const INDEXABLE_PATHS = ['/', '/pricing', '/privacy', '/terms', '/cookies'] as const;
export const SITE_DESCRIPTION = 'NFC business cards in Lahore, Pakistan. Share your own link or an editable EdgeTap profile with optional QR. Cards from Rs. 999; delivery charged separately.';
export const SOCIAL_IMAGE = { url: `${APP_URL}/social-card.png`, width: 1200, height: 630, alt: 'EdgeTap NFC business cards, digital profiles and QR fallback' };
export function publicPageMetadata(path: typeof INDEXABLE_PATHS[number], title: string, description: string): Metadata {
  const url = new URL(path, APP_URL).href;
  return { title:{absolute:`${title} · EdgeTap`}, description, alternates: {canonical: url},
    openGraph: {type:'website',siteName:'EdgeTap',locale:'en_PK',url,title:`${title} · EdgeTap`,description,images:[SOCIAL_IMAGE]},
    twitter: {card:'summary_large_image',title:`${title} · EdgeTap`,description,images:[SOCIAL_IMAGE.url]} };
}
export const organizationGraph = { '@context':'https://schema.org', '@graph': [
  {'@type':'Organization','@id':`${APP_URL}/#organization`,name:'EdgeTap',url:APP_URL,logo:`${APP_URL}/favicon-512.png`},
  {'@type':'WebSite','@id':`${APP_URL}/#website`,url:APP_URL,name:'EdgeTap',inLanguage:'en',description:SITE_DESCRIPTION,publisher:{'@id':`${APP_URL}/#organization`}},
] };
