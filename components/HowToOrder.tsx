import Link from "next/link";
import { orderingSteps } from "@/lib/data/content";

export default function HowToOrder() {
  return (
    <section id="how-to-order" className="section bg-[var(--paper)]" aria-labelledby="ordering-heading">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-3 text-[var(--ink-soft)]">From your idea to your card</p>
          <h2 id="ordering-heading" className="text-display text-[clamp(2.4rem,6vw,4.5rem)]">
            Your next introduction starts here.
          </h2>
          <p className="mt-5 leading-relaxed text-[var(--ink-soft)]">
            Rs. 999 per card. Start with a preview and save your details when you’re ready.
          </p>
        </div>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {orderingSteps.map((step, index) => (
            <li key={step.title} className="rounded-3xl border border-[var(--ink)]/10 bg-[var(--cream)] p-6 sm:p-8">
              <span aria-hidden="true" className="mb-5 grid h-11 w-11 place-items-center rounded-full bg-[var(--yellow)] font-display text-lg font-semibold">
                {index + 1}
              </span>
              <h3 className="font-display text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-soft)]">{step.description}</p>
            </li>
          ))}
        </ol>
        <div className="mt-9 flex flex-col items-center gap-4">
          <Link href="/pricing" className="btn btn-ink px-7 py-3.5">Choose your EdgeTap <span aria-hidden="true">→</span></Link>
          <p className="max-w-xl text-center text-sm leading-relaxed text-[var(--ink-soft)]">
            Payment proof is reviewed by EdgeTap before production. Pickup and delivery details are shown during ordering.
          </p>
        </div>
      </div>
    </section>
  );
}
