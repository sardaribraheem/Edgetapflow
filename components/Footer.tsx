import Link from "next/link";
import { NfcWaves, InstagramIcon, LinkedInIcon, WhatsAppIcon } from "./doodles";

const products = [
  "NFC Business Cards",
  "Tap Attendance",
  "Digital Profile",
  "Review Cards",
  "Restaurant Menus",
];
const company = ["What We Offer", "Solutions", "How It Works", "About", "Contact"];

export default function Footer() {
  return (
    <footer className="border-t border-[--ink]/8 bg-[--cream]">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[--yellow]">
                <NfcWaves className="h-5 w-5 text-[--ink]" />
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-[--ink]">
                EDGE TAP
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-[--ink-soft]">
              One tap. Infinite possibilities. Smart NFC experiences for people
              and businesses.
            </p>
            <div className="mt-4 flex gap-2">
              {[
                <InstagramIcon key="ig" className="h-5 w-5" />,
                <LinkedInIcon key="li" className="h-5 w-5" />,
                <WhatsAppIcon key="wa" className="h-5 w-5" />,
              ].map((ico, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-[--ink-soft] ring-1 ring-[--ink]/8 transition-colors hover:text-[--ink]"
                >
                  {ico}
                </a>
              ))}
            </div>
          </div>

          {/* products */}
          <div>
            <h4 className="eyebrow mb-4 text-[--ink-mid]">Products</h4>
            <ul className="flex flex-col gap-2.5">
              {products.map((p) => (
                <li key={p}>
                  <a href="#offer" className="text-[14px] text-[--ink-soft] transition-colors hover:text-[--ink]">
                    {p}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* company */}
          <div>
            <h4 className="eyebrow mb-4 text-[--ink-mid]">Company</h4>
            <ul className="flex flex-col gap-2.5">
              {company.map((c) => (
                <li key={c}>
                  <a href="#top" className="text-[14px] text-[--ink-soft] transition-colors hover:text-[--ink]">
                    {c}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[--ink]/8 pt-6 sm:flex-row">
          <p className="text-[13px] text-[--ink-faint]">
            © 2026 EdgeTap · <a href="#" className="hover:text-[--ink]">Privacy</a> ·{" "}
            <a href="#" className="hover:text-[--ink]">Terms</a>
          </p>
          <p className="text-[13px] text-[--ink-faint]">
            Made in Pakistan <span aria-hidden="true">🇵🇰</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
