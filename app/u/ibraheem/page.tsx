import type { Metadata } from "next";
import { ibraheemProfile } from "@/lib/data/profile";
import ProfileRoute from "@/components/ProfileRoute";
import { profileUrl } from "@/lib/site";
import { SOCIAL_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  robots: { index:false, follow:false },
  alternates: {canonical:profileUrl("ibraheem")},
  title: ibraheemProfile.displayName,
  description: `${ibraheemProfile.title} — ${ibraheemProfile.bio.slice(0, 120)}`,
  openGraph: {
    type: "profile",
    siteName:"EdgeTap",url:profileUrl("ibraheem"),images:[SOCIAL_IMAGE],
    title: `${ibraheemProfile.displayName} — ${ibraheemProfile.title}`,
    description: ibraheemProfile.bio,
    firstName: ibraheemProfile.firstName,
    lastName: ibraheemProfile.lastName,
    username: ibraheemProfile.username,
  },
  twitter: {
    card: "summary_large_image",
    images:[SOCIAL_IMAGE.url],
    title: `${ibraheemProfile.displayName} · EdgeTap`,
    description: ibraheemProfile.bio,
  },
};

export default function IbraheemPage() {
  return <ProfileRoute />;
}
