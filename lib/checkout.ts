import type { ProfileLink } from './data/profile';
export const INCLUDED_LINKS = 10;
export const EXTRA_LINK_PRICE = 50;
export const MAX_PROFILE_LINKS = 100;
export const extraLinkCost = (count: number) => Math.max(0, count - INCLUDED_LINKS) * EXTRA_LINK_PRICE;
export type CheckoutMethod = 'jazzcash' | 'easypaisa' | 'bank';
export const PAYMENT_RECIPIENT = 'Muhammad Ibraheem Anwar';
export const PAYMENT_METHODS = [
  { id: 'bank', label: 'Bank', number: 'PK46MEZN0000300116179673' },
  { id: 'jazzcash', label: 'JazzCash', number: '03044149674' },
  { id: 'easypaisa', label: 'Easypaisa', number: '03044149674' },
] as const;
export function contactLinkValue(link: ProfileLink) {
  if (link.type === 'email') return link.url.replace(/^mailto:/i, '');
  if (link.type === 'whatsapp') return link.url.replace(/^https:\/\/wa.me\//i, '');
  return link.url === 'https://' ? '' : link.url;
}
export function contactLinkUrl(type: string, value: string) {
  const clean = value.trim();
  if (type === 'email') return clean ? `mailto:${clean.replace(/^mailto:/i, '')}` : 'mailto:';
  if (type === 'whatsapp') return `https://wa.me/${clean.replace(/\D/g, '')}`;
  if (/^https?:\/\//i.test(clean)) return clean;
  const handle = clean.replace(/^@/, '');
  const prefixes: Record<string, string> = { instagram: 'https://www.instagram.com/', linkedin: 'https://www.linkedin.com/in/', github: 'https://github.com/', telegram: 'https://t.me/', tiktok: 'https://www.tiktok.com/@', youtube: 'https://www.youtube.com/@', facebook: 'https://www.facebook.com/' };
  return prefixes[type] && handle && !handle.includes('/') && !/^(?:www\.)?(?:instagram\.com|linkedin\.com|github\.com|t\.me|tiktok\.com|youtube\.com|facebook\.com)$/i.test(handle) ? prefixes[type] + encodeURIComponent(handle) : clean ? `https://${handle}` : 'https://';
}
