// Single source of truth for the public app base URL.
// This is what NFC codes and QR codes encode for customer profiles, so it
// must be the real public site (never a localhost / dev host).

const origin = new URL(process.env.NEXT_PUBLIC_APP_URL || "https://edgetap.tech");
if (origin.protocol !== "https:" || origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) {
  throw new Error("NEXT_PUBLIC_APP_URL must be a public HTTPS origin.");
}
export const LEGACY_APP_ORIGINS = ['https://edgetapflow.web.app', 'https://edgetapflow.firebaseapp.com'] as const;
// Old deployments/developer environments may still name a Firebase alias.
// Normalize those values for newly generated links; stored NFC/print URLs are immutable.
export const APP_URL = LEGACY_APP_ORIGINS.some(value => value === origin.origin) ? 'https://edgetap.tech' : origin.origin;
export function isProfileDestination(value: string | undefined, username: string): boolean {
  const preferred = profileUrl(username);
  return value === preferred || LEGACY_APP_ORIGINS.some(host => value === `${host}/u/${username}`);
}

// The NFC/QR destination for a profile handle — ALWAYS the EdgeTap profile,
// for the EdgeTap Profile product. Link Card uses its validated direct URL.
export function profileUrl(username: string): string {
  if (!/^[a-z0-9._-]{1,30}$/.test(username) || username === "." || username === "..") throw new Error("Invalid profile handle.");
  return `${APP_URL}/u/${encodeURIComponent(username)}`;
}
export const SUPPORT_EMAIL = "sardaribraheem277@gmail.com";
// Owner-supplied designer contact; separate from payment and general support.
export const DESIGNER_URL = 'https://wa.me/923271360809';
export const SUPPORT_URL = "https://wa.me/923044149674";

export function profileReturnPath(value: string | null): string {
  return value === "/#custom" || value === "/order" || value === "/account/orders" || (value && (/^\/account\/orders\?order=[a-zA-Z0-9_-]{1,128}$/.test(value) || (/^\/u\/[a-z0-9._-]{1,30}$/.test(value) && !["/u/.", "/u/.."].includes(value)))) ? value : "/account/orders";
}

export function accountReturnPath(requested: string | null, draftEmail?: string, accountEmail?: string | null): string {
  if (requested !== null) return profileReturnPath(requested);
  return draftEmail && accountEmail && draftEmail.toLowerCase() === accountEmail.toLowerCase() ? '/order' : '/account/orders';
}
