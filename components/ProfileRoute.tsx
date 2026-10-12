"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProfilePage from "@/components/ProfilePage";
import { getProfile } from "@/lib/data-service";
import { Profile } from "@/lib/data/profile";
import { NfcWaves, QrDoodle, SparkleDoodle } from "@/components/doodles";

export default function ProfileRoute() {
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    const match = /^\/u\/([a-z0-9._-]{1,30})\/?$/.exec(window.location.pathname);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resolve the requested path after static-shell hydration
    setUsername(match?.[1] || "");
  }, []);
  if (username === null) return <main className="min-h-screen grid place-items-center" aria-live="polite">Loading profile…</main>;
  return <ProfileRouteInner key={username} username={username} />;
}

function ProfileRouteInner({ username }: { username: string }) {
  const [result, setResult] = useState<
    { profile: Profile } | { error: { missing: boolean; message: string } } | null
  >(null);

  useEffect(() => {
    let active = true;
    (async () => {
      let timeout: ReturnType<typeof setTimeout> | undefined;
      try {
        // Service/transport failures can leave the SDK retrying indefinitely.
        // Bound the customer-facing wait without substituting another profile.
        const profile = await Promise.race([
          getProfile(username),
          new Promise<never>((_, reject) => {
            timeout = setTimeout(() => reject(new Error("Profile request timed out")), 15000);
          }),
        ]);
        if (active) setResult({ profile });
      } catch (e) {
        if (!active) return;
        const message = String(e instanceof Error ? e.message : e);
        setResult({ error: { missing: message.includes("not found") || message.includes("NotFoundException"), message } });
      } finally {
        clearTimeout(timeout);
      }
    })();
    return () => {
      active = false;
    };
  }, [username]);

  if (!result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--cream)] px-4 text-center">
        <span className="grid h-16 w-16 animate-pulse-soft place-items-center rounded-full bg-[var(--yellow-soft)]">
          <NfcWaves className="h-8 w-8 text-[var(--ink)]" />
        </span>
        <p className="font-display text-lg font-bold text-[var(--ink)]">Loading /u/{username}…</p>
        <p className="text-sm text-[var(--ink-soft)]">One tap away.</p>
      </div>
    );
  }

  if ("error" in result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--cream)] px-4 text-center">
        <QrDoodle className="h-14 w-14 origin-center rotate-[-8deg] text-[var(--ink-faint)]" />
        <h1 className="font-display text-3xl font-bold text-[var(--ink)]">{result.error.missing ? "Profile not found" : "Profile unavailable"}</h1>
        <p className="max-w-sm text-sm leading-relaxed text-[var(--ink-soft)]">
          {result.error.missing ? <>There&apos;s no published EdgeTap profile at <strong className="text-[var(--ink)]">/u/{username}</strong>. Please check the card or link.</> : <>We could not load <strong className="text-[var(--ink)]">/u/{username}</strong> right now.</>}
        </p>
        {result.error.missing ? null : (
          <p className="max-w-sm text-sm text-[var(--ink-soft)]">Please try again shortly. If this continues, contact EdgeTap on WhatsApp.</p>
        )}
        <Link href="/" className="btn btn-ink mt-2 px-7 py-3 text-[15px]">
          Home <SparkleDoodle className="ml-1 inline h-4 w-4 text-[var(--yellow)]" />
        </Link>
      </div>
    );
  }

  return <ProfilePage initialProfile={result.profile} />;
}
