import type { SVGProps } from "react";

// Decorative hand-drawn doodles: arrows, stars, sparkles, scribbles,
// underlines, circles, bursts. Consistent wobbly stroke language.

type P = SVGProps<SVGSVGElement>;

export function ArrowDoodle({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M8 30c14-8 34-8 46 2" />
      <path d="M40 18l15 14-16 9" />
    </svg>
  );
}

export function ArrowCurveDoodle({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M14 52C10 28 20 12 52 12" />
      <path d="M40 6l12 6-12 10" />
    </svg>
  );
}

export function StarDoodle({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M32 6l6.5 16.5L55 20 44 33l4 20-16-10-16 10 4-20L9 20l16.5 2.5L32 6Z" />
    </svg>
  );
}

export function SparkleDoodle({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M20 4c1 6 3 9 7 11-4 2-6 5-7 11-1-6-3-9-7-11 4-2 6-5 7-11Z" />
      <path d="M32 22c.6 3.4 2 5 4.5 6-2.5 1-3.9 2.6-4.5 6-.6-3.4-2-5-4.5-6 2.5-1 3.9-2.6 4.5-6Z" />
    </svg>
  );
}

export function ScribbleDoodle({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 80 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M6 26C16 10 26 34 36 20 44 8 50 30 58 18c6-9 12-6 16 2" />
    </svg>
  );
}

export function UnderlineDoodle({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 120 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M6 14c30-10 78-10 108 0" />
    </svg>
  );
}

export function CircleDoodle({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.5}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <ellipse cx="32" cy="32" rx="27" ry="24" transform="rotate(-6 32 32)" />
      <path d="M22 14c6-6 14-6 20 0" />
    </svg>
  );
}

export function BurstDoodle({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M32 4l5 13 13-5-5 13 13 5-13 5 5 13-13-5-5 13-5-13-13 5 5-13-13-5 13-5-5-13 13 5L32 4Z" />
    </svg>
  );
}

export function SquiggleBracket({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.4}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M26 6c-8 3-8 10 0 12-8 2-8 9 0 12" />
    </svg>
  );
}
