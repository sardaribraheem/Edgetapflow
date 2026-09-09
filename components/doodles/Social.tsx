import type { SVGProps } from "react";

// Social / brand icons drawn in the EdgeTap hand-drawn stroke style
// so they read as one coherent system (not generic Lucide).

type P = SVGProps<SVGSVGElement>;

export function InstagramIcon({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="6" y="6" width="20" height="20" rx="6" />
      <circle cx="16" cy="16" r="4.5" />
      <circle cx="22" cy="10" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsAppIcon({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M16 4a12 12 0 0 0-10.3 18L4 28l6.2-1.6A12 12 0 1 0 16 4Z" />
      <path d="M12 11.5c0 4 4.5 8.5 8.5 8.5l2-2-3-2-1.5 1.5a8 8 0 0 1-3.5-3.5l1.5-1.5-2-3-2 2Z" />
    </svg>
  );
}

export function LinkedInIcon({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="5" y="5" width="22" height="22" rx="5" />
      <path d="M11 14v7" />
      <path d="M11 11v.5" />
      <path d="M15 21v-7" />
      <path d="M15 17.5c0-2.5 2.5-3.5 3.5-1.5 1-2 3-1.5 3 1V21" />
    </svg>
  );
}

export function GlobeIcon({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="16" cy="16" r="12" />
      <path d="M4 16h24" />
      <path d="M16 4a18 18 0 0 1 0 24 18 18 0 0 1 0-24Z" />
      <circle cx="16" cy="16" r="2.5" />
    </svg>
  );
}

export function MailIcon({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="5" y="8" width="22" height="16" rx="4" />
      <path d="M7 10l9 7 9-7" />
    </svg>
  );
}

export function GitHubIcon({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M16 4a12 12 0 0 0-4 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6a4.7 4.7 0 0 1 1.3-3.3 4.4 4.4 0 0 1 .1-3.2s1-.3 3.4 1.3a11.7 11.7 0 0 1 6.2 0c2.3-1.6 3.4-1.3 3.4-1.3a4.4 4.4 0 0 1 .1 3.2 4.7 4.7 0 0 1 1.3 3.3c0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 16 4Z" />
    </svg>
  );
}

export function SaveIcon({ className, ...props }: P) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M6 4h16l4 4v20H6V4Z" />
      <path d="M10 4v8h10V4" />
      <path d="M10 28v-9h12v9" />
    </svg>
  );
}
