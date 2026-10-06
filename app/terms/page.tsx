import Link from "next/link";
import { SUPPORT_URL } from "@/lib/site";
export const metadata = { alternates: { canonical: "/terms" }, title: "Terms", description: "EdgeTap account, product and service information." };
export default function PolicyPage() {
  return <main className="container-x max-w-3xl min-h-screen py-16">
    <Link href="/" className="underline">← Back to EdgeTap</Link>
    <h1 className="text-display text-4xl text-[--ink] mt-6">Terms</h1>
    <p className="mt-3 text-sm text-[--ink-soft]">Updated 6 October 2026</p>
    <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-[--ink-soft]">
<section><h2 className="font-display text-xl font-semibold text-[--ink]">The product</h2><p className="mt-3">EdgeTap is a physical NFC card linked to a digital profile. The card costs Rs. 999. Its QR code opens the same profile as NFC. NFC compatibility depends on the phone and its settings; visitors need internet access to open the profile.</p></section>
<section><h2 className="font-display text-xl font-semibold text-[--ink]">Orders and payment</h2><p className="mt-3">Checkout submits an order request. Payments use the confirmed JazzCash account and are reviewed manually using your receipt. An uploaded receipt does not automatically confirm payment. Contact EdgeTap on WhatsApp before paying to confirm the recipient, full cost and order details.</p></section>
<section><h2 className="font-display text-xl font-semibold text-[--ink]">Delivery and service terms</h2><p className="mt-3">The initial launch focuses on Pakistan. Delivery charges, timing and availability must be confirmed with EdgeTap for your location before payment. Contact EdgeTap to confirm current profile hosting and update terms, and return or refund terms, before placing your order.</p></section>
<section><h2 className="font-display text-xl font-semibold text-[--ink]">Profile content</h2><p className="mt-3">You control the contact details and links you publish. Keep your account credentials private and share only content you have permission to publish. Do not submit unlawful content or attempt to access another customer’s private information.</p></section>
<section><h2 className="font-display text-xl font-semibold text-[--ink]">Support</h2><p className="mt-3">For order, delivery, account or payment questions, contact EdgeTap on WhatsApp and provide your order number if available.</p></section>
    </div>
    <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="btn btn-ink mt-10 px-6 py-3">Contact EdgeTap on WhatsApp</a>
  </main>;
}
