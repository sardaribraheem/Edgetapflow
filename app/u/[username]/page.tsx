import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ibraheemProfile } from "@/lib/data/profile";
import ProfilePage from "@/components/ProfilePage";
import { NfcWaves } from "@/components/doodles";

// For now, only ibraheem exists as a static profile. The dynamic route
// stays ready for the future Firebase-backed profile system.
const known = new Set([ibraheemProfile.username]);

export function generateStaticParams() {
  return [{ username: ibraheemProfile.username }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  if (!known.has(username)) return { title: "Profile not found · EdgeTap" };
  return {
    title: ibraheemProfile.displayName,
    description: ibraheemProfile.title,
  };
}

export default async function ProfileRoute({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  if (!known.has(username)) notFound();

  return <ProfilePage />;
}
