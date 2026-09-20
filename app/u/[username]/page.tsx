"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProfilePage from "@/components/ProfilePage";
import { getProfile } from "@/lib/firestore";
import { Profile } from "@/lib/data/profile";
import { NfcWaves, QrDoodle, SparkleDoodle } from "@/components/doodles";

export default function ProfileRoute() {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params?.username || "ibraheem");
  // key forces a fresh mount per username — no stale flash while switching handles.
  return <ProfileRouteInner key={username} username={username} />;
}

function ProfileRouteInner({ username }: { username: string }) {
  const [result, setResult] = useState<
    { profile: Profile } | { error: { missing: boolean; message: string } } | null
  >(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const profile = await getProfile(username);
        if (active) setResult({ profile });
      } catch (e) {
        if (!active) return;
        const message = String(e instanceof Error ? e.message : e);
        setResult({ error: { missing: message.includes("not found") || message.includes("NotFoundException"), message } });
      }
    })();
    return () => {
      active = false;
    };
  }, [username]);

  if (!result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[--cream] px-4 text-center">
        <span className="grid h-16 w-16 animate-pulse-soft place-items-center rounded-full bg-[--yellow-soft]">
          <NfcWaves className="h-8 w-8 text-[--ink]" />
        </span>
        <p className="font-display text-lg font-bold text-[--ink]">Loading /u/{username}…</p>
        <p className="text-sm text-[--ink-soft]">One tap away.</p>
      </div>
    );
  }

  if ("error" in result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[--cream] px-4 text-center">
        <QrDoodle className="h-14 w-14 origin-center rotate-[-8deg] text-[--ink-faint]" />
        <h1 className="font-display text-3xl font-bold text-[--ink]">Profile not found</h1>
        <p className="max-w-sm text-sm leading-relaxed text-[--ink-soft]">
          There&apos;s no EdgeTap profile at <strong className="text-[--ink]">/u/{username}</strong> — the handle
          may be new, renamed, or never created. Please check the link you tapped.
        </p>
        {result.error.missing ? null : (
          <p className="max-w-sm rounded-xl bg-[--coral]/10 p-3 text-[12px] text-[--coral]">
            Couldn&apos;t load that profile: {result.error.message}
          </p>
        )}
        <Link href="/" className="btn btn-ink mt-2 px-7 py-3 text-[15px]">
          Home <SparkleDoodle className="ml-1 inline h-4 w-4 text-[--yellow]" />
        </Link>
      </div>
    );
  }

  return <ProfilePage initialProfile={result.profile} />;
}