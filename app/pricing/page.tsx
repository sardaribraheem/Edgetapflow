import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { SUPPORT_URL } from "@/lib/site";

export const metadata = {
  title: "Pricing",
  alternates: { canonical: "/pricing" },
  description: "Rs. 999 for a physical EdgeTap NFC card with QR fallback and a digital profile. Delivery quoted separately.",
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="container-x min-h-screen pt-32 pb-20">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow text-[--ink-soft]">Transparent Pricing</p>
          <h1 className="text-display mt-3 text-4xl sm:text-6xl text-[--ink]">Your EdgeTap card.</h1>
          <section className="card-paper mt-8 p-7 sm:p-10">
            <h2 className="font-display text-2xl font-bold text-[--ink]">NFC Digital Profile Card</h2>
            <p className="mt-4 font-display text-4xl font-bold text-[--ink]">Rs. 999 <span className="text-base font-normal">per physical card</span></p>
            <ul className="mt-6 space-y-3 text-[--ink-soft]">
              <li>One physical NFC card, with a choice of design</li>
              <li>A QR code linking to the same digital profile</li>
              <li>Your name, bio and up to ten contact links</li>
              <li>Downloadable contact card</li>
              <li>Account access to update your activated profile</li>
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-[--ink-soft]">Pakistan-focused delivery. Delivery costs and timing depend on your location and are confirmed separately. Contact us before paying to confirm the complete cost and current hosting, update and return terms.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/order" className="btn btn-ink px-6 py-3">Order your card →</Link>
              <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="btn btn-ghost px-6 py-3">Ask on WhatsApp</a>
            </div>
          </section>
          <p className="mt-6 text-sm leading-relaxed text-[--ink-soft]">Multiple cards in one order share the same profile and cost Rs. 999 each. For cards for different people or other requirements, contact us first.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
