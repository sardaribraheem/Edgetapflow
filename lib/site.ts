// Single source of truth for the public app base URL.
// This is what NFC codes and QR codes encode for customer profiles, so it
// must be the real public site (never a localhost / dev host).

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://edgetapflow.web.app";

// The NFC/QR destination for a profile handle — ALWAYS the EdgeTap profile,
// never a social platform directly (the customer can change links later).
export function profileUrl(username: string): string {
  return `${APP_URL}/u/${encodeURIComponent(username)}`;
}