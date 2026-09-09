import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

// Generic hand-drawn phone frame; screens pass their content as children.
export default function PhoneMockup({ children, className = "" }: Props) {
  return (
    <div className={`relative max-w-full select-none ${className}`} aria-hidden="true">
      {/* body */}
      <div className="rounded-[34px] bg-[--ink] p-[10px] shadow-[0_28px_60px_-20px_rgba(16,11,74,0.5)] ring-1 ring-inset ring-[--ink-2]">
        {/* screen */}
        <div className="relative aspect-[9/19] overflow-hidden rounded-[26px] bg-[--paper]">
          {/* notch */}
          <div className="absolute left-1/2 top-2 z-10 h-[16px] w-[70px] -translate-x-1/2 rounded-full bg-[--ink]" />
          {children}
        </div>
      </div>
    </div>
  );
}
