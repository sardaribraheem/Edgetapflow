import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "EdgeTap Terms & Conditions — service description, acceptable use, and liability.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[--cream]">
      <div className="container-x py-20 max-w-3xl">
        <Link href="/" className="eyebrow mb-6 inline-block text-[--ink-mid] hover:text-[--ink]">
          ← Back to EdgeTap
        </Link>
        <h1 className="text-display text-[clamp(2.4rem,6vw,4rem)] text-[--ink] mt-4">
          Terms &amp; Conditions
        </h1>
        <p className="mt-2 text-[13px] text-[--ink-faint]">Last updated: September 2026</p>

        <div className="mt-10 flex flex-col gap-8 text-[15px] leading-relaxed text-[--ink-soft]">
          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">1. Service Description</h2>
            <p>
              EdgeTap provides NFC-enabled cards and digital profile experiences. When a physical EdgeTap card
              is tapped against a compatible smartphone, it opens a digital profile, menu, review page, or
              other web experience in the browser — no app required.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">2. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mt-2">
              <li>Use EdgeTap for any unlawful purpose.</li>
              <li>Upload content that is misleading, harmful, or violates third-party rights.</li>
              <li>Attempt to reverse-engineer, exploit, or disrupt the platform.</li>
              <li>Use automated tools to access or scrape EdgeTap profiles.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">3. Intellectual Property</h2>
            <p>
              The EdgeTap brand, NFC card designs, website, and software are owned by EdgeTap. Profile
              content (text, images, links) remains the property of the profile owner. By uploading content,
              you grant EdgeTap a limited licence to display it on your profile.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">4. Limitation of Liability</h2>
            <p>
              EdgeTap is provided &quot;as is&quot; without warranties of any kind. We are not liable for any
              indirect, incidental, or consequential damages arising from use of the platform or NFC cards.
              Our total liability shall not exceed the amount you paid for the service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">5. Changes to Terms</h2>
            <p>
              We reserve the right to update these terms at any time. Material changes will be communicated
              via the website. Continued use of EdgeTap after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">6. Governing Law</h2>
            <p>
              These terms are governed by the laws of Pakistan. Any disputes shall be resolved in the courts
              of Pakistan.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">7. Contact</h2>
            <p>
              Questions about these terms? Email{" "}
              <a href="mailto:hello@edgetap.com" className="underline hover:text-[--ink]">hello@edgetap.com</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
