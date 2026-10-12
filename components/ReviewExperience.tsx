// Phone screen: the Google review experience (use case 03 / LOVE THE FOOD?).
export default function ReviewExperience() {
  return (
    <div className="flex h-full flex-col items-center px-4 pt-12">
      <div className="flex flex-col items-center pt-4 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--yellow)] font-display text-[22px] font-bold text-[var(--ink)]">
          G
        </div>
        <div className="mt-2 font-display text-[16px] font-semibold text-[var(--ink)]">
          Loved it? Tap to review
        </div>
        <div className="mt-1 text-[11px] text-[var(--ink-mid)]">Casa Verde</div>
      </div>

      {/* stars */}
      <div className="mt-5 flex gap-1.5 text-[var(--yellow)]">
        {[0, 1, 2, 3, 4].map((i) => (
          <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 drop-shadow-sm">
            <path d="M12 3l2.6 6.6 7.2.4-5.7 4.5 1.9 7L12 17.5 6 21.5l1.9-7L2.2 10l7.2-.4L12 3Z" />
          </svg>
        ))}
      </div>

      <div className="mt-6 w-full">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
          Share your experience
        </div>
        <div className="rounded-xl bg-white px-3 py-3 text-[11px] leading-relaxed text-[var(--ink-mid)] ring-1 ring-[var(--ink)]/8">
          The butter chicken was incredible — will definitely be back!
        </div>
      </div>

      <div className="mt-3 w-full rounded-full bg-[var(--coral)] py-2.5 text-center text-[12px] font-bold text-white shadow-[0_6px_0_-2px_rgba(16,11,74,0.3)]">
        Post review →
      </div>

      <div className="mt-auto flex items-center justify-center gap-1 pb-3 pt-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-faint)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--coral)]" /> Powered by EdgeTap
      </div>
    </div>
  );
}
