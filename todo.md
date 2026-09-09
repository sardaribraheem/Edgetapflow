# EdgeTap Website — Roadmap & Compliance Checklist

Covers the marketing site + `/u/[username]` profile experience. Adapted from the old `edgetap` MVP todo (reference only) and expanded with legal, compliance, accessibility, content-integrity, and Firebase implementation items.

---

## ✅ Done (this site build)

- [x] Next.js 16 + React 19 + TypeScript + Tailwind v4 scaffold
- [x] Design system (CSS tokens, Fredoka + Inter, doodle system)
- [x] Navbar + mobile drawer
- [x] Hero (giant display type + GSAP scroll parallax + doodle composition)
- [x] What We Offer editorial grid
- [x] Use-case storytelling (pinned horizontal on desktop, stacked on mobile)
- [x] CustomCTA / Testimonials / FAQ / FinalCTA / Footer
- [x] `/u/ibraheem` profile experience (real photo, real links)
- [x] Multi-breakpoint Playwright QA (1440/390) — hero overlap fixes applied
- [x] Production build passes (`npm run build`), all routes static
- [x] Fix profile title duplication / broken avatar URL

---

## 🚧 Pre-Launch (immediate)

### Legal pages & policy — ***HIGH PRIORITY***
- [ ] **Privacy Policy page** (`/privacy`) — what data is collected (name, contact info from profile links, NFC tap analytics), how it's used, storage, retention, user rights, contact.
- [ ] **Terms & Conditions page** (`/terms`) — service description, acceptable use, liability limits, governing law, changes to terms.
- [ ] **Cookie Policy page** (`/cookies`) + **cookie consent mechanism**
  - [ ] Decide whether a consent banner is legally required. If **no third-party trackers/analytics** are used (see below), a lightweight "only essential cookies" notice + privacy link is enough. If Vercel Analytics / GA / third-party embeds are added later, a full consent banner with opt-out becomes mandatory (GDPR).
- [ ] **Refund Policy** (`/refunds` or part of Terms) — required if you ever accept payment; document order-cancellation, replacement/defective-card policy, and what "no refunds for used NFC cards" means.
- [ ] **Form consent** — add an explicit consent checkbox + link to Privacy Policy on the contact/waitlist form ("I agree to the Privacy Policy and consent to being contacted about EdgeTap"). Pre-checked consent boxes are illegal under EU rules — keep it opt-in.

### Data privacy — *collect only what you need*
- [ ] **Data minimization audit**: every form field and stored field must justify itself. Remove any field not used.
- [ ] **Contact form** (`mailto:hello@edgetap.com` currently) — if replaced with a form, send to a mailbox you control, add consent + anti-spam (honeypot), never log beyond what's needed.
- [ ] **Analytics inventory** — list every analytics/tracking script. Currently: none (verify in `layout.tsx`). Keep it that way until you add a consent flow.
- [ ] **Third-party embeds inventory** — list every external embed/script (fonts are self-hosted via `next/font`; social links are plain `<a>` navigation, not embeds — no tracking pixels). Verify none of the doodle/icon assets load from external CDNs that could leak. If you add Google Maps embeds, YouTube videos, etc. — get consent first (GDPR).
- [ ] **Don't send data to third parties** — confirm no Google Fonts CDN, no external API calls on load.

### Business & legal facts
- [ ] **Business details** — add company name, registered address, contact email, and (if applicable) registration/VAT number to the Footer and Privacy/Terms pages. Currently the site has an email only.
- [ ] **Verify claims** — audit all copy for unsupported claims:
  - [ ] "Now in Private Beta" (hero badge) — keep only if the product is genuinely in private beta; soften otherwise.
  - [ ] "Works on iPhone & Android" — true only if NFC works on iOS (with a manual/background NFC permission) — add the required "universal link / NFC entitlement" caveat, otherwise adjust the claim.
  - [ ] "Tap against any phone" (hero subtext) — NFC isn't on all Android phones / iPhones < XS; add "most modern phones" phrasing.
  - [ ] "Digital menu opens instantly" etc. — fine as long as demos are honest.
- [ ] **Replace or remove fake reviews** — the 3 Testimonials are self-labeled placeholders. Either remove the section entirely (cleanest) or gate it behind real customers before launch. Never ship fabricated quotes attributed to fake people.
- [ ] **Image/asset copyright audit** — all doodles are hand-built inline SVG (clean), the avatar is the user's own photo (clean). If any stock photo/illustration is ever added, verify license + attribution. No copyrighted brand logos are used.

### Check applicable local laws & flag risks
- [ ] **Pakistan (where "Made in Pakistan" claims home)**: no comprehensive national data-protection law in force yet, but the **Personal Data Protection Bill 2023** is pending and should be treated as the compliance target. Signatories of contracts worldwide may still be GDPR-liable — the safest bar is "GDPR-minded" privacy practice.
- [ ] **EU/UK visitors**: GDPR + UK GDPR + cookie consent rules apply to any EU/UK visitor data. This is why form consent + cookie inventory matter even with no analytics.
- [ ] **US visitors**: CCPA/CPRA (California) — requires "Do Not Sell My Personal Information" disclosure if personal info is ever sold (EdgeTap won't sell data — state this explicitly in Privacy Policy).
- [ ] **SEO/text**: `edgetap.com` is referenced as a default URL (env `NEXT_PUBLIC_APP_URL`) — confirm domain ownership before launch; do not publish until the domain resolves.

---

## 🌱 Firebase Implementation Plan

Current site: fully static, no Firebase. The old project had Firebase wired but **no credentials/deployed rules**. Don't re-wire until the following is done or profile editing is actually needed.

### Phase 0 — Decide whether you need Firebase yet
- The marketing site + static `/u/ibraheem` profile need **no backend**.
- Firebase becomes worth wiring when: users need to **create/edit** their own profiles, or NFC taps need per-card analytics.
- If you're launching the MVP with just Ibraheem's card: **do not add Firebase yet** — keep it static (simpler, faster, more secure).

### Phase 1 — Project setup (if/when proceeding)
- [ ] Create separate Firebase project (or Dev/Prod setup) at console.firebase.google.com
- [ ] `npm i firebase` + generate `lib/firebase/app.ts` (no manual config blob — use `firebase_options.ts` via FlutterFire-style web config or env vars)
- [ ] Set up `NEXT_PUBLIC_FIREBASE_*` env vars; **never** commit secrets
- [ ] Add `lib/firebase/firestore.ts` with typed helpers, and `lib/data/profile.ts` stays the static fallback
- [ ] Deploy **Firestore Security Rules** before first client read/write (rules disabled = wide open data)

### Phase 2 — Data model (minimal)
- [ ] `profiles/{username}` — public read for `u/:username`, write only by owner (Auth UID)
- [ ] `users/{uid}` — email, displayName, createdAt, plan (private)
- [ ] `analytics/taps/{profileId}/{tapId}` — device type, timestamp, location (agg) — collect **only** with consent
- [ ] Future: `businesses/`, `experiences/`, `menus/`, `reviews/`

### Phase 3 — Auth + profile editor (v1.0)
- [ ] Firebase Auth (email/password + Google)
- [ ] Dashboard route `/dashboard` — sign in, manage profile
- [ ] Visual editor: reorder links, edit bio/avatar, set accent color
- [ ] Image upload to Firebase Storage with size/type validation + signed CORS
- [ ] QR code generator per profile (server-side, cached)
- [ ] Custom domains (`profile.example.com`)

### Phase 4 — Analytics (only with consent + privacy policy live)
- [ ] Tap events: log to `analytics/taps` on profile load (load "1" tap per URL hit)
- [ ] Dashboard to view taps/clicks per profile
- [ ] Aggregate data — never raw falls into logs

### Phase 5 — Monetization & scale (v2.0)
- [ ] Stripe subscriptions (Business tier), order/inventory/fulfillment flow
- [ ] Team/workspace management for businesses
- [ ] Public API + webhooks for tap events

### Firebase Security checklist
- [ ] Firestore rules locked to `request.auth != null` + ownership checks
- [ ] Storage rules: authenticated write, size/type restriction, thumbnails only where needed
- [ ] Enable App Check (reCAPTCHA) before relying on anything sensitive
- [ ] Never ship demo/expo API keys

---

## ♿ Accessibility & Quality (WCAG 2.1 AA target)

- [ ] **Full WCAG 2.1 AA audit** (axe DevTools + manual)
- [ ] **Alt text**: every meaningful image (`/u/*` avatar has alt ✓; hero/phone mockups are illustrative → confirm they're `aria-hidden`); add `alt` where an image conveys info
- [ ] **Color contrast**: verify all text vs background meets 4.5:1 (AA). Flag: ink-on-black, coral-on-cream, yellow-on-white, `--ink-faint` on cream are risk areas — verify with a contrast checker
- [ ] **Keyboard friendly**: FAQ accordion focusable + Enter/Space toggles, mobile menu focusable + Escape closes, skip-to-content link, logical tab order, visible focus rings (never `outline:none` without a replacement)
- [ ] **Forms**: if a form is added, every field needs a `<label>`, `name`/id, required validation with clear messages, and a keyboard-submittable submit
- [ ] **Clear button labels**: "Get Started", "See what we build" ✓ — audit all interactive elements for descriptive names; no "Click here"
- [ ] **Focus management**: moving focus into the mobile drawer on open, back to the trigger on close
- [ ] **ARIA**: landmarks (header/nav/main/footer ✓), `aria-expanded` on accordion buttons and menu toggles
- [ ] **Reduced motion**: already respected in GSAP + CSS ✓ — verify pinned horizontal story is disabled under `prefers-reduced-motion` (it is, confirm in `animations.ts`)
- [ ] Semantic headings: single `h1` per page, logical h2/h3 hierarchy ✓ (verify)

---

## 🔧 Technical Debt & Performance

- [ ] `next/image` + WebP/AVIF for the avatar and any raster assets (currently a plain `<img>`)
- [ ] ESLint rules (design tokens), Prettier + Tailwind plugin
- [ ] Unit tests for `lib/data` and doodle components; component smoke tests via React Testing Library
- [ ] Sitemap + robots.txt + JSON-LD structured data (Profile for `/u/ibraheem`)
- [ ] Dynamic OG image generation for profile share cards (currently static: brownie points)
- [ ] Service worker / offline only if a PWA path is pursued (not now)
- [ ] Bundle analysis + lazy-load below-the-fold components

---

## 📦 Deployment Checklist

- [ ] Confirm domain (`edgetap.com` or chosen) is owned + DNS verified before publishing URLs
- [ ] If Vercel: connect repo, set env vars, preview deployments, custom domain
- [ ] Analytics decision (none → Vercel Analytics with consent → GA4 with consent + GTM)
- [ ] Error monitoring (Sentry) if ops budget allows
- [ ] Legal pages live + linked from Footer **before** public launch
- [ ] Run `npm run build` + full Playwright pass on 375/390/768/1024/1280/1440 after each major change

---

## ⚠️ Risks & Open Questions

1. **NFC on iOS** — "Works on iPhone & Android" needs the iOS App Store universal-link/background-NFC caveat or an adjustment to the claim until it's demonstrably true.
2. **Domain placeholder** — `edgetap.com` in env isn't owned/verified yet; publishing with the wrong domain in meta would leak into share cards.
3. **Legal pages currently absent** — cannot launch publicly without Privacy + Terms + Cookie notice. This is the top blocker.
4. **Fake reviews** — shipping labeled placeholders as testimonials is a brand-integrity (and, in some jurisdictions, consumer-law) risk. Remove or go real.
5. **Analytics creep** — the temptation to add GA "real quick" before a consent flow lands is the most common GDPR mistake. Resist until the cookie inventory + banner exist.
6. **Firebase premature wiring** — adding Firebase to a static site adds attack surface and compile-time complexity with zero benefit until user-editable profiles exist. Keep static.
7. **Pakistan data-protection bill** — pending law should be the compliance target even outside the EU; "GDPR-minded" practice is the safe baseline.

---

*Last updated: 2026-09-09*