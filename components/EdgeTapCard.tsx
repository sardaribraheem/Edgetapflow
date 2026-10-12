import { NfcWaves } from "./doodles";

type Props = {
  username?: string;
  className?: string;
  rotate?: boolean;
};

// The physical EdgeTap NFC card — a premium illustrated object.
// Ink card with a yellow NFC mark and cream branding.
export default function EdgeTapCard({
  username = "ibraheem",
  className = "",
  rotate = false,
}: Props) {
  return (
    <div
      className={`relative aspect-[1.586/1] w-full max-w-[320px] select-none ${rotate ? "animate-wobble" : ""} ${className}`}
      aria-hidden="true"
    >
      {/* body */}
      <div className="absolute inset-0 rounded-[18px] bg-[var(--ink)] shadow-[0_22px_50px_-18px_rgba(16,11,74,0.55)]">
        {/* subtle sheen */}
        <div className="absolute inset-0 rounded-[18px] bg-gradient-to-br from-white/10 via-transparent to-transparent" />
        <div className="absolute inset-0 rounded-[18px] ring-1 ring-inset ring-white/10" />
      </div>

      {/* NFC waves mark */}
      <div className="absolute left-[16px] top-[14px]">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--yellow)] shadow-[0_6px_0_-2px_rgba(16,11,74,0.35)]">
          <NfcWaves className="h-7 w-7 text-[var(--ink)]" />
        </div>
      </div>

      {/* wordmark */}
      <div className="absolute left-[78px] top-[16px]">
        <div className="font-display text-[19px] font-semibold leading-none tracking-tight text-[var(--cream)]">
          EdgeTap
        </div>
        <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--cream)]/55">
          One tap · Infinite
        </div>
      </div>

      {/* account */}
      <div className="absolute bottom-[14px] left-[16px]">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--cream)]/10 px-3 py-1 text-[11px] font-semibold text-[var(--cream)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--mint)]" />
          u/{username}
        </div>
      </div>

      {/* card number dots */}
      <div className="absolute bottom-[18px] right-[16px] flex gap-[3px]">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-[var(--cream)]/40" />
        ))}
      </div>
    </div>
  );
}
