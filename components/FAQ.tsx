"use client";

import { useState } from "react";
import { faqs } from "@/lib/data/content";
import { CircleDoodle, ScribbleDoodle } from "./doodles";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="section relative bg-[--paper-2]">
      <div className="container-x">
        <div className="mb-10 flex items-center justify-center gap-4">
          <CircleDoodle className="h-12 w-12 text-[--coral]" />
          <h2 className="text-display text-[clamp(2.4rem,6vw,4.5rem)] text-[--ink]">
            Questions<span className="text-[--sky]">?</span>
          </h2>
          <CircleDoodle className="h-10 w-10 rotate-12 text-[--yellow]" />
        </div>

        <div className="mx-auto max-w-3xl">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border-b border-[--ink]/10">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-display text-[18px] font-semibold text-[--ink]">
                    {f.q}
                  </span>
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-transform duration-300 ${
                      isOpen ? "rotate-45 bg-[--ink] text-[--cream]" : "bg-[--ink]/6 text-[--ink]"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 pr-10 text-[15px] leading-relaxed text-[--ink-soft]">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <ScribbleDoodle className="mx-auto mt-8 h-6 w-28 text-[--ink-faint]" />
      </div>
    </section>
  );
}
