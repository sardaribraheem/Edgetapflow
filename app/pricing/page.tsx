import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { SUPPORT_EMAIL, SUPPORT_URL } from "@/lib/site";

export const metadata = {
  title: "Pricing",
  alternates: { canonical: "/pricing" },
  description: "Choose a Rs. 999 EdgeTap NFC card, a Rs. 18,999 custom website and four-card package, or discuss a custom NFC project.",
};

export default function PricingPage() {
  return <><Navbar/><main className="container-x min-h-screen pt-28 pb-20 text-[--ink]">
    <div className="mx-auto max-w-6xl">
      <header className="max-w-3xl"><h1 className="text-display text-4xl sm:text-6xl">Choose your EdgeTap.</h1><p className="mt-5 max-w-xl text-lg leading-relaxed">A card for your everyday introductions, a website of your own, or an NFC idea we build together.</p></header>
      <div className="mt-10 grid gap-6 md:grid-cols-[1.1fr_1fr]">
        <section aria-labelledby="standard-plan" className="card-paper flex min-w-0 flex-col overflow-hidden">
          <div className="bg-[--yellow-soft] p-6 sm:p-8"><img src="/card-designs/simple.png" alt="EdgeTap Simple printed card design" width={640} height={403} className="mx-auto aspect-[1.586] w-full max-w-sm rounded-xl object-contain"/></div>
          <div className="flex flex-1 flex-col p-7 sm:p-9"><h2 id="standard-plan" className="font-display text-2xl font-bold">Standard card</h2><p className="mt-4 font-display text-4xl font-bold">Rs. 999 <span className="text-base font-normal">per card</span></p><p className="mt-3 leading-relaxed">One physical NFC card linked to your EdgeTap digital profile.</p>
            <ul className="mt-6 space-y-3"><li>PVC with embedded NFC and QR fallback</li><li>Your name, bio and up to ten contact links</li><li>Your choice of printed design or uploaded artwork</li><li>Profile hosting and updates at no separate fee for now</li></ul>
            <p className="mt-6 text-sm leading-relaxed">Build and preview first. No account needed until you save your profile before payment.</p><div className="mt-auto pt-7"><Link href="/order" className="btn btn-ink px-6 py-3 whitespace-nowrap">Build my card <span aria-hidden="true">→</span></Link></div>
          </div>
        </section>
        <section aria-labelledby="website-plan" className="card-paper flex min-w-0 flex-col bg-[--paper-2] p-7 sm:p-9">
          <h2 id="website-plan" className="font-display text-2xl font-bold">Your website + cards</h2><p className="mt-4 font-display text-4xl font-bold">Rs. 18,999 <span className="text-base font-normal">package</span></p><p className="mt-4 text-lg leading-relaxed">A custom website or portfolio, with EdgeTap cards that open it.</p>
          <ul className="mt-7 space-y-4"><li>A website built around your work and needs</li><li>Four NFC cards linked to your website</li><li>Request your four cards now or during the first year</li><li>First-year hosting and domain services included</li></ul>
          <div className="mt-7 rounded-xl bg-white/70 p-5"><p className="font-bold">Rs. 3,000 per year from year two</p><p className="mt-2 text-sm leading-relaxed">For hosting and domain services. We discuss the website scope, domain and card arrangements with you before starting.</p></div>
          <p className="mt-6 text-sm leading-relaxed">Arrange this package directly with EdgeTap.</p><div className="mt-auto pt-7"><a href="#contact" className="btn btn-ink px-6 py-3 whitespace-nowrap">Contact EdgeTap <span aria-hidden="true">→</span></a></div>
        </section>
        <section aria-labelledby="custom-nfc" className="card-paper grid gap-7 p-7 sm:p-9 md:col-span-2 lg:grid-cols-[1.3fr_1fr] bg-[--yellow-soft]/40">
          <div><h2 id="custom-nfc" className="font-display text-3xl font-bold">Have a different NFC idea?</h2><p className="mt-4 max-w-xl leading-relaxed">Discuss a custom solution: office attendance, employee NFC cards, event cards, or another physical-to-digital experience.</p></div><div className="flex flex-col items-start justify-center"><p className="mb-5 leading-relaxed">Share your idea. We confirm feasibility, scope and a project quote with you.</p><a href="#contact" className="btn btn-ink px-6 py-3 whitespace-nowrap">Contact EdgeTap <span aria-hidden="true">→</span></a></div>
        </section>
      </div>
      <section className="mt-10 max-w-4xl text-sm leading-relaxed"><h2 className="font-display text-xl font-bold">Before you order a card</h2><p className="mt-4">All physical cards are PVC with embedded NFC, 85.60 × 53.98 mm (approximately 3.375 × 2.125 inches). Wood is a printed design name. Staff manually prepares uploaded artwork for this size.</p><p className="mt-3 font-bold">Delivery costs extra, paid directly to the rider. It is separate from your card payment.</p><p className="mt-2">EdgeTap books a rider when your paid card is ready; My orders shows the actual fare and dispatch message. Confirm delivery availability for your location before paying. Alternatively, collect at NASTP Delta 3, Monday–Friday, 9 am–5 pm (Pakistan time); contact +92 304 414 9674 after reaching NASTP once your card is ready.</p><p className="mt-3">Every personalized card receives a final-design email before printing. Reply within 10 hours of sending to confirm or request changes. With no timely reply, staff checks the inbox and confirms the design after the window. <Link href="/terms" className="underline">Read the personalized-card terms</Link>.</p><p className="mt-3">Multiple standard cards in one order share one EdgeTap profile and cost Rs. 999 each. The standard profile has no separate hosting/update fee for now and no fixed hosting duration promise. The website package has its own annual hosting/domain charge shown above.</p></section>
      <section id="contact" tabIndex={-1} className="mt-12 scroll-mt-28 rounded-[var(--radius-lg)] bg-white p-7 ring-1 ring-[--ink]/10 sm:p-9"><h2 className="font-display text-2xl font-bold">Contact EdgeTap</h2><p className="mt-3">Tell us about your website package or custom NFC idea.</p><div className="mt-6 flex flex-wrap gap-x-10 gap-y-5"><a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="font-bold underline">WhatsApp: +92 304 414 9674</a><a href={'mailto:'+SUPPORT_EMAIL} className="min-w-0 break-all font-bold underline">{SUPPORT_EMAIL}</a></div></section>
    </div>
  </main><Footer/></>;
}
