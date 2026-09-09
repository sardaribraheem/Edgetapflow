import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "EdgeTap Privacy Policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[--cream]">
      <div className="container-x py-20 max-w-3xl">
        <Link href="/" className="eyebrow mb-6 inline-block text-[--ink-mid] hover:text-[--ink]">
          ← Back to EdgeTap
        </Link>
        <h1 className="text-display text-[clamp(2.4rem,6vw,4rem)] text-[--ink] mt-4">
          Privacy Policy
        </h1>
        <p className="mt-2 text-[13px] text-[--ink-faint]">Last updated: September 2026</p>

        <div className="mt-10 flex flex-col gap-8 text-[15px] leading-relaxed text-[--ink-soft]">
          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">1. Introduction</h2>
            <p>
              EdgeTap (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the edgetap.com website and the EdgeTap NFC card
              platform. This Privacy Policy explains what data we collect, how we use it, and your rights.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">2. Data We Collect</h2>
            <p>
              <strong>Profile information</strong> — when you create an EdgeTap profile, we store the information
              you choose to share (name, title, location, links, avatar). This data is publicly visible on your
              profile URL.
            </p>
            <p className="mt-2">
              <strong>Contact form</strong> — if you email us at hello@edgetap.com, we receive your email address
              and message contents. We retain these only to respond to your enquiry.
            </p>
            <p className="mt-2">
              <strong>NFC tap analytics</strong> — in a future version, we may record anonymised tap events
              (device type, approximate location, timestamp) to provide profile owners with usage insights.
              This will only be enabled with explicit consent.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>To display your public profile at the URL your NFC card points to.</li>
              <li>To respond to support enquiries.</li>
              <li>To improve the EdgeTap platform (aggregated, anonymised data only).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">4. Data Storage &amp; Security</h2>
            <p>
              Profile data is stored on secure cloud infrastructure. We use industry-standard encryption in transit
              (TLS) and at rest. We do not sell, trade, or share your personal data with third parties for
              marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">5. Your Rights</h2>
            <p>
              You can request access to, correction of, or deletion of your personal data at any time by emailing
              hello@edgetap.com. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">6. Cookies</h2>
            <p>
              EdgeTap uses only essential cookies required for the site to function. We do not use tracking or
              advertising cookies. See our{" "}
              <Link href="/cookies" className="underline hover:text-[--ink]">Cookie Policy</Link> for details.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">7. Third-Party Services</h2>
            <p>
              We do not embed third-party analytics, advertising trackers, or social media widgets. Fonts are
              self-hosted via Next.js. Social links on profiles are plain hyperlinks — they do not load external
              scripts or tracking pixels.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Changes will be posted on this page with an updated
              date. Continued use of EdgeTap after changes constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">9. Contact</h2>
            <p>
              For privacy-related requests, email{" "}
              <a href="mailto:hello@edgetap.com" className="underline hover:text-[--ink]">hello@edgetap.com</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
