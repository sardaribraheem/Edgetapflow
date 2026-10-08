import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { SUPPORT_EMAIL, SUPPORT_URL } from "@/lib/site";

export const metadata = {
  title: "Pricing",
  alternates: { canonical: "/pricing" },
  description: "Compare four EdgeTap options: a Rs. 999 NFC card, business NFC, a Rs. 29,999 website and four-card package, or a custom NFC solution.",
};

function Features({ items }: { items: string[] }) {
  return <ul className="pricing-features">{items.map(item => <li key={item}><span aria-hidden="true">✓</span><span>{item}</span></li>)}</ul>;
}

export default function PricingPage() {
  return <><Navbar/><main className="pricing-page">
    <header className="pricing-heading">
      <p className="font-display">One tap. Infinite possibilities.</p>
      <h1 className="font-display">Choose your EdgeTap.</h1>
      <p className="pricing-intro">Start with a card, add your own website, or bring us an NFC idea.</p>
    </header>

    <p className="pricing-scroll-hint">Swipe or use the arrow keys to compare all four options.</p>
    <div className="pricing-options" role="region" aria-label="Compare four EdgeTap options" tabIndex={0}>
      <section aria-labelledby="standard-plan" className="pricing-option">
        <h2 id="standard-plan" className="font-display">Standard Digital</h2>
        <p className="pricing-price font-display">Rs. 999</p>
        <p className="pricing-price-detail">per card + delivery</p>
        <p className="pricing-description">Your everyday introduction, on one personalized NFC business card.</p>
        <Features items={[
          "One PVC card with embedded NFC",
          "Your name and chosen design or uploaded artwork",
          "Your profile with up to 10 contact links",
          "Save Contact download and QR fallback",
          "Profile hosting and updates at no separate fee for now",
        ]}/>
        <div className="pricing-option-action"><p>Build and preview first. Sign up when you save your profile before payment.</p><Link href="/order" className="btn btn-yellow">Build my card <span aria-hidden="true">→</span></Link></div>
      </section>

      <section aria-labelledby="business-plan" className="pricing-option">
        <h2 id="business-plan" className="font-display">Business NFC</h2>
        <p className="pricing-price font-display">Let’s talk</p>
        <p className="pricing-price-detail">custom quote</p>
        <p className="pricing-description">For restaurants, shops and teams exploring NFC for their customers.</p>
        <Features items={[
          "Card quantities and branding discussed with you",
          "Discuss links to business pages or review destinations",
          "Setup and requirements reviewed before quoting",
          "Scope, price and fulfillment agreed directly with EdgeTap",
        ]}/>
        <div className="pricing-option-action"><p>Tell us what your business needs. Arrange this option directly with EdgeTap.</p><a href="#contact" className="btn btn-ink">Contact EdgeTap <span aria-hidden="true">→</span></a></div>
      </section>

      <section aria-labelledby="website-plan" className="pricing-option">
        <h2 id="website-plan" className="font-display">Your Website + Cards</h2>
        <p className="pricing-price font-display">Rs. 29,999</p>
        <p className="pricing-price-detail">package + delivery</p>
        <p className="pricing-description">A custom website or portfolio, with EdgeTap cards that open it.</p>
        <Features items={[
          "A website built around your work and needs",
          "Four NFC cards linked to your website",
          "Request your four cards now or during the first year",
          "First-year hosting and domain services included",
          "Rs. 3,000 per year from year two for hosting and domain services",
        ]}/>
        <div className="pricing-option-action"><p>We discuss website scope, domain and card arrangements with you before starting.</p><a href="#contact" className="btn btn-ink">Contact EdgeTap <span aria-hidden="true">→</span></a></div>
      </section>

      <section aria-labelledby="custom-nfc" className="pricing-option">
        <h2 id="custom-nfc" className="font-display">Custom NFC Solutions</h2>
        <p className="pricing-price font-display">Your idea</p>
        <p className="pricing-price-detail">custom quote</p>
        <p className="pricing-description">Have a different physical-to-digital experience in mind? Let’s explore it.</p>
        <Features items={[
          "Discuss attendance, staff cards or event ideas",
          "Feasibility and requirements reviewed with you",
          "Software and hardware needs scoped together",
          "Project scope and price confirmed with you",
        ]}/>
        <div className="pricing-option-action"><p>Share your idea for a separately scoped project with EdgeTap.</p><a href="#contact" className="btn btn-ink">Contact EdgeTap <span aria-hidden="true">→</span></a></div>
      </section>
    </div>

    <section id="contact" tabIndex={-1} className="pricing-contact">
      <h2 className="font-display">Need a custom order or business cards?</h2>
      <p>Talk to EdgeTap about your website package, business cards or custom NFC idea.</p>
      <div className="pricing-contact-links"><a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="btn btn-ink">WhatsApp: +92 304 414 9674</a><a href={'mailto:'+SUPPORT_EMAIL} className="pricing-email">{SUPPORT_EMAIL}</a></div>
    </section>

    <section className="pricing-order-details">
      <h2 className="font-display">Before you order a card</h2>
      <p>All physical cards are PVC with embedded NFC, 85.60 × 53.98 mm (approximately 3.375 × 2.125 inches). Wood is a printed design name. Staff manually prepares uploaded artwork for this size.</p>
      <p><strong>Delivery costs extra, paid directly to the rider. It is separate from your card payment.</strong> EdgeTap books a rider when your paid card is ready; My orders shows the actual fare and dispatch message. Confirm delivery availability for your location before paying.</p>
      <p>Alternatively, collect at NASTP Delta 3, Monday–Friday, 9 am–5 pm (Pakistan time). Once your card is ready, contact +92 304 414 9674 after reaching NASTP.</p>
      <p>Every personalized card receives a final-design email before printing. Reply within 10 hours of sending to confirm or request changes. With no timely reply, staff checks the inbox and confirms the design after the window. <Link href="/terms" className="underline">Read the personalized-card terms</Link>.</p>
      <p>Multiple standard cards in one order share one EdgeTap profile and cost Rs. 999 each. The standard profile has no separate hosting/update fee for now and no fixed hosting duration promise. The website package has its own annual hosting/domain charge shown above.</p>
    </section>
  </main><Footer/></>;
}
