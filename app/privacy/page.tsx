import { usesSupabase } from "@/lib/backend";
import Link from "next/link";
import { SUPPORT_URL } from "@/lib/site";
export const metadata = { alternates: { canonical: "/privacy" }, title: "Privacy", description: "EdgeTap account, product and service information." };
export default function PolicyPage() {
  return <main className="container-x max-w-3xl min-h-screen py-16">
    <Link href="/" className="underline">← Back to EdgeTap</Link>
    <h1 className="text-display text-4xl text-[--ink] mt-6">Privacy</h1>
    <p className="mt-3 text-sm text-[--ink-soft]">Updated 6 October 2026</p>
    <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-[--ink-soft]">
<section><h2 className="font-display text-xl font-semibold text-[--ink]">Information we collect</h2><p className="mt-3">Ordering involves your name, phone number, email, delivery address, card design, profile details and payment receipt. When online submission is available, checkout submits these details to EdgeTap. When arranging an order on WhatsApp, you share the required details with EdgeTap there; preparing selections on this website does not submit them. Your account password is handled by our account service; it is not stored in order records.</p></section>
<section><h2 className="font-display text-xl font-semibold text-[--ink]">Public profiles and private orders</h2><p className="mt-3">Your activated profile name, bio, location, photo and contact links are public. Publish only information you want to share. Order addresses, payment receipts and artwork are restricted to authorized access and are not shown on your public profile. A profile may load an image from the URL supplied by its owner.</p></section>
<section><h2 className="font-display text-xl font-semibold text-[--ink]">How information is used</h2><p className="mt-3">We use order information to review payment, prepare your card and coordinate delivery. Your account lets you update your activated profile. NFC and QR both open the public profile; this application does not collect tap analytics.</p></section>
<section><h2 className="font-display text-xl font-semibold text-[--ink]">Services and browser storage</h2><p className="mt-3">{usesSupabase ? "EdgeTap uses Supabase for accounts, profiles, orders and uploaded files, and Google Firebase Hosting to serve the website." : "EdgeTap uses Google Firebase Authentication, Firestore, Storage and Hosting for accounts, profiles, orders and uploaded files."} Authentication uses browser storage to keep you signed in. In this tab, online ordering stores an account identifier and submission reference to check an interrupted order after a refresh. Passwords, addresses, receipts and card details are not stored in that submission reference. Fonts are hosted with the site.</p></section>
<section><h2 className="font-display text-xl font-semibold text-[--ink]">Questions and requests</h2><p className="mt-3">Contact EdgeTap on WhatsApp to request access, correction or deletion of your information. Sign in to update your public profile. This application does not use advertising or analytics trackers.</p></section>
    </div>
    <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="btn btn-ink mt-10 px-6 py-3">Contact EdgeTap on WhatsApp</a>
  </main>;
}
