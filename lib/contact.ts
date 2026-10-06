import type { Profile } from "./data/profile";
import { isSafeContactUrl } from "./links";
import { profileUrl } from "./site";
const escape = (value: string) => value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
export function contactVCard(profile: Profile): string {
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${escape(profile.displayName)}`,
    `N:${escape(profile.lastName)};${escape(profile.firstName)};;;`,
    `TITLE:${escape(profile.title)}`, `NOTE:${escape(profile.bio)}`, `URL:${profileUrl(profile.username)}`];
  for (const link of profile.links.filter((l) => isSafeContactUrl(l.url))) {
    if (link.url.startsWith("mailto:")) lines.push(`EMAIL:${escape(new URL(link.url).pathname)}`);
    else if (link.url.startsWith("https://wa.me/")) lines.push(`TEL;TYPE=CELL:+${new URL(link.url).pathname.slice(1).replace(/\D/g, "")}`);
    else if (link.url.startsWith("tel:")) lines.push(`TEL:${escape(new URL(link.url).pathname)}`);
    else lines.push(`URL:${escape(link.url)}`);
  }
  return [...lines, "END:VCARD", ""].join("\r\n");
}
