# EdgeTap Website — CLAUDE.md

> See also [AGENTS.md](./AGENTS.md) — Next.js version-critical notes (the `next dev` agent block).

## Product Vision
**One tap. Infinite possibilities.**
EdgeTap is a physical-to-digital interaction platform powered by NFC. A physical NFC card, when tapped against a phone, opens a digital profile/experience in the browser — no app required. This project is the **art-directed marketing site + profile experience** (Whirrls-inspired: warm cream paper, deep ink, chunky Fredoka display type, hand-drawn doodle system, scroll-driven choreography).

## Project status
- **Build complete** (all sections + `/u/ibraheem`); **not publicly launched**.
- **Launch blockers** (see `todo.md`): Privacy/Terms/Cookie pages absent, placeholder testimonials, unverified domain, NFC-on-iOS claim.
- **No Firebase yet** — keep static until user-editable profiles are wanted. Firebase plan lives in `todo.md`.
- The old MVP app lives at `/Users/arslananwar/Developer/Active/business/edgetap` — **reference only, never modify**. It contains the original Firebase wiring and business facts.

## Tech stack
- Next.js 16 App Router + React 19 + TypeScript, Tailwind CSS v4 (`@theme inline` tokens in `app/globals.css`).
- Fonts: Fredoka (display, `--font-display`) + Inter (body, `--font-sans`) via `next/font/google`.
- Animation: `gsap` + `gsap/ScrollTrigger`, with `prefersReducedMotion()` guard in `lib/animations.ts`.
- Aliases: `@/*` → project root `./` (NOT into `app/`).

## Routes
- `/` — marketing site: Navbar → Hero → SolutionGrid → UseCaseStory → CustomCTA → Testimonials → FAQ → FinalCTA → Footer.
- `/u/ibraheem` — static profile page (real photo + links from `lib/data/profile.ts`).
- `/u/[username]` — dynamic profile route; only `ibraheem` resolves, else `notFound()`.

## Architecture rules
- **Data separated from presentation**: all copy/links/questions live in `lib/data/content.ts`; Ibraheem's profile is the single source of truth in `lib/data/profile.ts` (imported by both ProfilePage and hero). Update data there, not in components.
- **Doodles are hand-crafted inline SVG components** under `components/doodles/` (Connectivity.tsx, Decorative.tsx, Business.tsx, Social.tsx). Never use generic Lucide icons.
- **Doodle positioning convention**: hero doodles are absolutely positioned with `%` offsets in `components/Hero.tsx`. When visual QA shows overlaps, adjust using measured `getBoundingClientRect()` values (headline: "Infinite" spans ~left 460–965 / top 296–499; "possibilities." ~left 277–1148 / top 451–654 at 1440px) — don't guess.
- **Horizontal storytelling**: `UseCaseStory.tsx` pins via ScrollTrigger on desktop, CSS stacking fallback (`.usecase-pin/.usecase-track/.usecase-panel` in `globals.css`) on mobile/`prefers-reduced-motion`.

## Verification workflow
1. Dev server: `npm run dev`. Build: `npm run build` (must pass clean).
2. Playwright QA (via MCP): desktop 1440, mobile 390 — screenshot each section, check overlaps/overflow/console errors.
3. Breakpoints to honor: 1440/1280/1024 (desktop), 768 (tablet), 430/390/375 (mobile).

## Compliance guardrails (from `todo.md`)
- No third-party analytics/embeds unless a consent flow exists.
- No fake testimonials — placeholder voices are labeled in data; remove or go real before launch.
- Accessibility: WCAG 2.1 AA — alt text, 4.5:1 contrast (watch `--ink-faint`/yellow/coral-vs-cream), keyboard-friendly drawers/accordions/forms, visible focus.
- Privacy/Terms/Cookie/Refund pages are required before public launch.

## Don't do (yet)
- Don't wire Firebase/analytics to the static site.
- Don't edit the old `edgetap` project.
- Don't inline brand assets from external CDNs (doodles are local inline SVG).