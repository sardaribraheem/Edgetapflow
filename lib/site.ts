// Single source of truth for the public app base URL.
// This is what NFC codes and QR codes encode for customer profiles, so it
// must be the real public site (never a localhost / dev host).

const origin = new URL(process.env.NEXT_PUBLIC_APP_URL || "https://edgetapflow.web.app");
if (origin.protocol !== "https:" || origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) {
  throw new Error("NEXT_PUBLIC_APP_URL must be a public HTTPS origin.");
}
export const APP_URL = origin.origin;

// The NFC/QR destination for a profile handle — ALWAYS the EdgeTap profile,
// never a social platform directly (the customer can change links later).
export function profileUrl(username: string): string {
  return `${APP_URL}/u/${encodeURIComponent(username)}`;
}
export const SUPPORT_URL = "https://wa.me/923044149674";

export function profileReturnPath(value: string | null): string {
  return value === "/order" || (value && /^\/u\/[a-z0-9._-]{1,30}$/.test(value)) ? value : "/";
}
