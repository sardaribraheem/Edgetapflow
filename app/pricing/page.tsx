import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NfcWaves } from "@/components/doodles";
import Link from "next/link";

export const metadata = {
  title: "Pricing · EdgeTap",
  description: "Simple, transparent pricing for NFC digital profiles, review cards, menus, and custom platforms.",
};

export default function PricingPage() {
  const plans = [
    {
      name: "Standard Digital",
      price: "Rs. 999",
      period: "one-time + delivery",
      desc: "Perfect for professionals, freelancers, and creators wanting a smart NFC business card.",
      features: [
        "1x Physical NFC Card (Custom Name/Logo)",
        "Lifetime digital profile hosting",
        "Up to 10 custom links (WhatsApp, IG, LinkedIn)",
        "Instant 'Save Contact' vCard download",
        "QR Code fallback",
        "Free lifetime profile updates"
      ],
      popular: false,
      tone: "bg-[--yellow-soft]",
      btnTone: "btn-yellow",
    },
    {
      name: "Business NFC",
      price: "Rs. 2,499",
      period: "one-time + delivery",
      desc: "Ideal for restaurants, shops, and growing teams looking to upgrade customer experience.",
      features: [
        "3x Physical NFC Cards or Table Tents",
        "Custom branded restaurant menu or review tap",
        "Priority dashboard profile management",
        "Up to 10 links per card/profile",
        "Google Review direct routing",
        "24/7 Priority support"
      ],
      popular: true,
      tone: "bg-[--mint-soft]",
      btnTone: "btn-ink",
    },
    {
      name: "Custom Enterprise",
      price: "Let's Talk",
      period: "custom quote",
      desc: "For offices, large restaurant chains, and unique physical-to-digital integrations.",
      features: [
        "Unlimited NFC cards & staff passes",
        "Custom Web App / Attendance System",
        "Advanced analytics & tap tracking",
        "Dedicated account manager",
        "Custom API integrations",
        "White-label branding"
      ],
      popular: false,
      tone: "bg-[--sky-soft]",
      btnTone: "btn-ink",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-[--cream] pt-32 pb-24 overflow-hidden">
        {/* soft background washes */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-[--yellow-soft] opacity-60 blur-3xl" />
          <div className="absolute right-10 bottom-20 h-96 w-96 rounded-full bg-[--mint-soft] opacity-50 blur-3xl" />
        </div>

        <div className="container-x relative mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 shadow-[var(--shadow-doodle)] ring-1 ring-[--ink]/10 mb-6">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[--yellow]">
                <NfcWaves className="h-3.5 w-3.5 text-[--ink]" />
              </span>
              <span className="font-display text-xs font-bold uppercase tracking-wider text-[--ink]">Transparent Pricing</span>
            </div>
            <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-bold text-[--ink] leading-tight">
              One tap. Infinite possibilities. <br />
              <span className="text-[--ink-soft]">Choose your EdgeTap.</span>
            </h1>
            <p className="mt-4 text-lg text-[--ink-soft]">
              No hidden monthly subscriptions for basic cards. Pay once, tap forever.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((p, idx) => (
              <div
                key={idx}
                className={`card-paper relative flex flex-col justify-between p-8 transition-transform hover:-translate-y-1 ${
                  p.popular ? "ring-2 ring-[--ink] shadow-[0_20px_50px_-15px_rgba(16,11,74,0.25)]" : ""
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[--ink] px-4 py-1 font-display text-xs font-bold uppercase tracking-wider text-white shadow-md">
                    Most Popular ⭐
                  </span>
                )}

                <div>
                  <div className={`inline-block rounded-2xl px-4 py-1.5 font-display text-sm font-bold text-[--ink] mb-4 ${p.tone}`}>
                    {p.name}
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-display text-4xl font-bold text-[--ink]">{p.price}</span>
                    <span className="text-sm font-medium text-[--ink-faint]">{p.period}</span>
                  </div>
                  <p className="text-sm text-[--ink-soft] mb-6">{p.desc}</p>

                  <div className="border-t border-[--ink]/10 pt-6 mb-8 space-y-3">
                    {p.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm font-medium text-[--ink]">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[--mint] text-[--ink] mt-0.5">
                          ✓
                        </span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/order?plan=${p.name.toLowerCase().split(" ")[0]}`}
                  className={`btn w-full py-4 text-center font-display font-bold ${p.btnTone}`}
                >
                  Get Started →
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ / Guarantee Banner */}
          <div className="mt-20 card-paper p-8 sm:p-12 text-center max-w-3xl mx-auto bg-white/80 backdrop-blur">
            <h3 className="font-display text-2xl font-bold text-[--ink] mb-3">Need a custom order or bulk corporate cards?</h3>
            <p className="text-[--ink-soft] mb-6">
              We specialize in customized NFC solutions with your company branding, custom packaging, and automated software integration.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/admin" className="btn btn-ink px-6 py-3">
                Admin Dashboard →
              </Link>
              <a href="mailto:support@edgetap.flow" className="btn bg-white px-6 py-3 ring-1 ring-[--ink]/15 hover:bg-[--cream]">
                Contact Sales ✉️
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
