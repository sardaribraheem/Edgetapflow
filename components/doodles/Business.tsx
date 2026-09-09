import type { SVGProps } from "react";

// Business / product doodles: the physical EdgeTap card, menus,
// reviews, attendance. Same hand-drawn stroke language.

type P = SVGProps<SVGSVGElement>;

export function BusinessCardDoodle({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 72 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="6" y="8" width="60" height="32" rx="6" />
      <circle cx="20" cy="22" r="5" />
      <path d="M12 33c1-4 4-6 8-6s7 2 8 6" />
      <path d="M40 17h14" />
      <path d="M40 24h14" />
      <path d="M40 31h9" />
    </svg>
  );
}

export function MenuDoodle({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="16" y="8" width="32" height="48" rx="6" transform="rotate(-6 32 32)" />
      <path d="M24 20h16" />
      <path d="M24 28h16" />
      <path d="M24 36h10" />
      <path d="M24 44h6" />
    </svg>
  );
}

export function PlateDoodle({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="32" cy="32" r="26" />
      <circle cx="32" cy="32" r="14" />
      <path d="M34 14c7 0 12 3 14 8" />
      <path d="M8 22c3 5 4 10 3 16" />
    </svg>
  );
}

export function ReviewStars({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 120 28"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d="M14 3l2.6 6.6 7.2.4-5.7 4.5 1.9 7-6-4-6 4 1.9-7-5.7-4.5 7.2-.4L14 3Z"
          transform={`translate(${i * 24} 0)`}
        />
      ))}
    </svg>
  );
}

export function AttendanceDoodle({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="30" cy="26" r="10" />
      <path d="M14 50c1-9 6-14 16-14s15 5 16 14" />
      <path d="M50 12v12l7-4" />
      <path d="M44 8h13" />
      <path d="M4 8h9" />
    </svg>
  );
}

export function ProfileDoodle({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="32" cy="22" r="12" />
      <path d="M12 52c2-13 10-19 20-19s18 6 20 19" />
      <path d="M8 8l48 48" />
    </svg>
  );
}
