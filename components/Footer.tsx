import Link from "next/link";
import { NfcWaves } from "./doodles";
import { SUPPORT_URL } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-[--ink]/8 bg-[--cream]">
      <div className="container-x py-12">
        <Link href="/" className="inline-flex items-center gap-2 font-display text-lg font-bold text-[--ink]">
          <NfcWaves className="h-8 w-8" /> EdgeTap
        </Link>
        <p className="mt-3 text-sm text-[--ink-soft]">One tap. Infinite possibilities. Physical NFC cards with a QR fallback.</p>
        <nav aria-label="Footer" className="mt-6 flex flex-wrap gap-x-6 gap-y-4 text-sm text-[--ink]">
          <Link href="/pricing">Pricing</Link>
          <Link href="/pricing">Order your card</Link>
          <Link href="/u/ibraheem">Example profile</Link>
          <Link href="/account">Customer sign in</Link>
          <Link href="/account/orders">My orders</Link>
          <a href={SUPPORT_URL} target="_blank" rel="noreferrer">Contact on WhatsApp</a>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/cookies">Cookies &amp; browser storage</Link>
        </nav>
        <p className="mt-8 text-xs text-[--ink-soft]">© {new Date().getFullYear()} EdgeTap · Pakistan</p>
      </div>
    </footer>
  );
}
