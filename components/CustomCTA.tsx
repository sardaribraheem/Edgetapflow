import Link from "next/link";
import { SUPPORT_URL } from "@/lib/site";
import {
  SparkleDoodle,
  ScribbleDoodle,
  NfcWaves,
  ArrowCurveDoodle,
  StarDoodle,
} from "./doodles";

// Major brand moment: use-cases collapse into "let's build your idea".
export default function CustomCTA() {
  return (
    <section id="custom" className="section relative overflow-hidden bg-[--ink] text-[--cream]">
      <div className="absolute inset-0 opacity-50" aria-hidden="true">
        <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-[--sky]/30 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-[--coral]/30 blur-3xl" />
        <SparkleDoodle className="absolute left-[8%] top-[12%] h-10 w-10 text-[--yellow]" />
        <StarDoodle className="absolute right-[10%] top-[20%] h-8 w-8 text-[--sky]" />
        <ScribbleDoodle className="absolute left-1/4 bottom-[14%] h-6 w-32 text-[--cream]/25" />
        <NfcWaves className="absolute bottom-[10%] right-[8%] h-24 w-24 text-[--cream]/12" />
      </div>

      <div className="container-x relative flex flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[--cream]/10 px-4 py-1.5 text-[12px] font-medium text-[--cream]/80">
          <NfcWaves className="h-4 w-4 text-[--yellow]" />
          Physical → Digital experiences
        </div>

        <h2 className="text-display max-w-4xl text-[clamp(2.6rem,7vw,5.5rem)]">
          Your card.
          <br />
          <span className="text-[--yellow]">Your style.</span>
        </h2>

        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[--cream]/75">
          Have a question about your card design or a larger order?
          Contact us to discuss the details before placing your order.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link href="/order" className="btn btn-yellow px-8 py-4 text-[16px]">
            Order your card <span aria-hidden="true">→</span>
          </Link>
          <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="btn btn-ghost px-8 py-4 text-[16px] text-[--cream] [&]:border-[--cream]/25 [&]:text-[--cream] hover:bg-[--cream]/5">
            WhatsApp EdgeTap
          </a>
        </div>

        <ArrowCurveDoodle className="mt-10 hidden h-16 w-16 text-[--yellow] md:block" />
      </div>
    </section>
  );
}
