import type { Metadata } from "next";
import { ibraheemProfile } from "@/lib/data/profile";
import ProfilePage from "@/components/ProfilePage";

export const metadata: Metadata = {
  title: ibraheemProfile.displayName,
  description: `${ibraheemProfile.title} — ${ibraheemProfile.bio.slice(0, 120)}`,
  openGraph: {
    type: "profile",
    title: `${ibraheemProfile.displayName} — ${ibraheemProfile.title}`,
    description: ibraheemProfile.bio,
    firstName: ibraheemProfile.firstName,
    lastName: ibraheemProfile.lastName,
    username: ibraheemProfile.username,
  },
  twitter: {
    card: "summary",
    title: `${ibraheemProfile.displayName} · EdgeTap`,
    description: ibraheemProfile.bio,
  },
};

export default function IbraheemPage() {
  return <ProfilePage />;
}
