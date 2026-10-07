import Link from "next/link";
import { SUPPORT_URL } from "@/lib/site";
export const metadata = { alternates: { canonical: "/cookies" }, title: "Cookies & Browser Storage", description: "EdgeTap account, product and service information." };
export default function PolicyPage() {
  return <main className="container-x max-w-3xl min-h-screen py-16">
    <Link href="/" className="underline">← Back to EdgeTap</Link>
    <h1 className="text-display text-4xl text-[--ink] mt-6">Cookies & Browser Storage</h1>
    <p className="mt-3 text-sm text-[--ink-soft]">Updated 7 October 2026</p>
    <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-[--ink-soft]">
<section><h2 className="font-display text-xl font-semibold text-[--ink]">Sign-in persistence</h2><p className="mt-3">Our account service uses browser storage to remember your signed-in session. This enables customer profile editing and staff access. The card builder uses IndexedDB to keep your unfinished card details and selected images on this device before account saving. The recovery window is seven days, checked when you return; browser settings, eviction or clearing site data can remove it sooner. You can use Clear device draft to remove it. Guest drafts do not store passwords, session credentials or payment proof. After you save to your signed-in account before payment, its private account draft supports recovery and order tracking. The marketing website does not implement preference or analytics cookies.</p></section>
<section><h2 className="font-display text-xl font-semibold text-[--ink]">Tracking</h2><p className="mt-3">This application does not include advertising trackers, analytics scripts or embedded social media widgets. Profile links navigate to other websites, whose privacy and storage practices may differ.</p></section>
<section><h2 className="font-display text-xl font-semibold text-[--ink]">Managing your session</h2><p className="mt-3">Sign out to end your account session on a shared device. You can also clear site data through your browser settings. Blocking browser storage may prevent sign-in from persisting.</p></section>
<section><h2 className="font-display text-xl font-semibold text-[--ink]">Contact</h2><p className="mt-3">Contact EdgeTap on WhatsApp if you have questions about your account or browser storage.</p></section>
    </div>
    <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="btn btn-ink mt-10 px-6 py-3">Contact EdgeTap on WhatsApp</a>
  </main>;
}
