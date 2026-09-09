import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "EdgeTap Cookie Policy — how we use cookies on edgetap.com.",
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[--cream]">
      <div className="container-x py-20 max-w-3xl">
        <Link href="/" className="eyebrow mb-6 inline-block text-[--ink-mid] hover:text-[--ink]">
          ← Back to EdgeTap
        </Link>
        <h1 className="text-display text-[clamp(2.4rem,6vw,4rem)] text-[--ink] mt-4">
          Cookie Policy
        </h1>
        <p className="mt-2 text-[13px] text-[--ink-faint]">Last updated: September 2026</p>

        <div className="mt-10 flex flex-col gap-8 text-[15px] leading-relaxed text-[--ink-soft]">
          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help the site
              remember your preferences and function correctly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">Cookies We Use</h2>
            <p>
              EdgeTap uses <strong>only essential cookies</strong> required for the website to function.
              These include session cookies that ensure the site loads correctly and remembers your
              preferences during your visit.
            </p>
            <p className="mt-2">
              We <strong>do not</strong> use:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mt-2">
              <li>Analytics cookies (no Google Analytics, Vercel Analytics, or similar)</li>
              <li>Advertising or marketing cookies</li>
              <li>Social media tracking cookies</li>
              <li>Third-party embed cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">Third-Party Services</h2>
            <p>
              EdgeTap does not embed third-party scripts, analytics trackers, or social media widgets that
              set cookies. All fonts are self-hosted via Next.js and do not make external requests.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">Managing Cookies</h2>
            <p>
              Since we only use essential cookies, there is no opt-out mechanism needed. You can clear
              cookies at any time through your browser settings. Disabling essential cookies may affect
              site functionality.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">Changes to This Policy</h2>
            <p>
              If we add any non-essential cookies in the future (e.g., analytics), we will update this
              policy and provide a consent mechanism before any such cookies are set.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-[--ink] mb-3">Contact</h2>
            <p>
              Questions about cookies? Email{" "}
              <a href="mailto:hello@edgetap.com" className="underline hover:text-[--ink]">hello@edgetap.com</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
