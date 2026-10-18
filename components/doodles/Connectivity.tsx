import type { SVGProps } from "react";

// Connectivity doodles: NFC waves, tap ripple, QR, link, phone, signal.
// Hand-drawn stroke style: wobbly paths, round caps, inherit currentColor.

type P = SVGProps<SVGSVGElement>;

export function NfcWaves({ className, ...props }: P) {
  return (
    <svg
      viewBox="6 3 52 38"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M18 20c8-7 20-7 28 0" />
      <path d="M13 13.5C25 5 39 5 51 13.5" />
      <path d="M23 26.5c4.5-3.5 13.5-3.5 18 0" />
      <path d="M32 34a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    </svg>
  );
}

export function TapRipple({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="40" cy="40" r="10" />
      <circle cx="40" cy="40" r="24" strokeDasharray="6 8" />
      <circle cx="40" cy="40" r="38" strokeDasharray="10 14" />
    </svg>
  );
}

export function QrDoodle({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="8" y="8" width="20" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="3.5" />
      <rect x="36" y="8" width="20" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="3.5" />
      <rect x="8" y="36" width="20" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="3.5" />
      <rect x="14" y="14" width="8" height="8" rx="2" />
      <rect x="42" y="14" width="8" height="8" rx="2" />
      <rect x="14" y="42" width="8" height="8" rx="2" />
      <rect x="42" y="38" width="8" height="8" rx="2" />
      <rect x="54" y="38" width="8" height="8" rx="2" />
      <rect x="38" y="52" width="8" height="8" rx="2" />
      <rect x="54" y="54" width="6" height="6" rx="2" />
    </svg>
  );
}

export function ChainLink({ className, ...props }: P) {
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
      <path d="M26 38 38 26" />
      <path d="M22 42l-5 5a6 6 0 0 0 8.5 8.5l7-7a6 6 0 0 0 0-8.5" />
      <path d="M42 22l5-5a6 6 0 0 0-8.5-8.5l-7 7a6 6 0 0 0 0 8.5" />
    </svg>
  );
}

export function PhoneDoodle({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 48 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="9" y="5" width="30" height="54" rx="7" />
      <path d="M17 11h14" />
      <circle cx="24" cy="50" r="2" fill="currentColor" stroke="none" />
      <path d="M20 21a4 4 0 0 0 8 0" />
      <path d="M17 28h14" />
      <path d="M17 33h14" />
      <path d="M17 38h9" />
    </svg>
  );
}

export function SignalDoodle({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.4}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="32" cy="34" r="5" fill="currentColor" stroke="none" />
      <path d="M17 49a21 21 0 0 1 0-30" />
      <path d="M10 56a32 32 0 0 1 0-44" />
      <path d="M47 49a21 21 0 0 0 0-30" />
      <path d="M54 56a32 32 0 0 0 0-44" />
    </svg>
  );
}

export function WebsiteDoodle({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="32" cy="32" r="25" />
      <path d="M7 32h50" />
      <path d="M32 7a38 38 0 0 1 0 50 38 38 0 0 1 0-50Z" />
      <circle cx="32" cy="32" r="4" />
    </svg>
  );
}
