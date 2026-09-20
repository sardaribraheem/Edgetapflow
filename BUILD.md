# EdgeTap — Developer Build & Architecture Map (`BUILD.md`)

> **One tap. Infinite possibilities.**
> Art-directed marketing site + profile experience powered by NFC, built with Next.js 16 App Router, Tailwind CSS v4, GSAP, and Firebase Firestore & Auth.

---

## Tech Stack
- **Framework**: Next.js 16 App Router + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (`@theme inline` design tokens in `app/globals.css`)
- **Typography**: Fredoka (display headers, `--font-display`) + Inter (body text, `--font-sans`) via `next/font/google`
- **Animation**: GSAP + ScrollTrigger (`gsap`, `gsap/ScrollTrigger`) with `prefersReducedMotion()` safeguards
- **Database & Storage**: Firebase Firestore (Dynamic Profiles & Link Management)
- **Authentication**: Firebase Authentication (Secure dashboard logins)
- **Hosting / Deployment**: Firebase Hosting & dynamic Next.js App Route deployment

---

## Project Structure

```
/
├── app/
│   ├── favicon.ico
│   ├── layout.tsx                 # Root layout, fonts, metadata, theme color
│   ├── page.tsx                   # Marketing homepage composing all landing sections
│   ├── order/page.tsx             # Customer purchase flow (7-step wizard)
│   ├── pricing/page.tsx           # Transparent Pricing plans (CTAs seed /order?plan=…)
│   ├── globals.css                # Tailwind v4 tokens, design primitives, animations, scroll-snap utilities
│   ├── admin/page.tsx             # Secure sign-in gate → AdminApp shell (login has NO fallback)
│   ├── cookies/page.tsx           # Cookie Policy compliance page
│   ├── privacy/page.tsx           # Privacy Policy compliance page
│   ├── terms/page.tsx             # Terms & Conditions compliance page
│   └── u/
│       ├── [username]/layout.tsx  # generateStaticParams (pre-renders /u/ibraheem shell only)
│       ├── [username]/page.tsx    # Client route → live Firestore resolution, loading + honest not-found states
│       └── ibraheem/page.tsx      # Static metadata wrapper for Ibraheem's profile
│
├── components/
│   ├── Navbar.tsx                 # Floating rounded pill navigation + mobile drawer trigger
│   ├── MobileMenu.tsx             # Full-screen mobile navigation drawer
│   ├── Hero.tsx                   # Giant display headline + illustrated doodle field & mobile floating band
│   ├── DoodleField.tsx            # Absolute positioned doodle container with GSAP parallax
│   ├── EdgeTapCard.tsx            # Physical NFC card visual component
│   ├── PhoneMockup.tsx            # Generic hand-drawn phone frame
│   ├── PhoneProfile.tsx           # Phone screen showing digital profile (Use Case 01)
│   ├── RestaurantMenu.tsx         # Phone screen showing interactive menu (Use Case 02)
│   ├── ReviewExperience.tsx       # Phone screen showing 5-star review experience (Use Case 03)
│   ├── SolutionGrid.tsx           # Full-bleed horizontal scroll-snap showcase of products/services + Idea CTA card
│   ├── SolutionCard.tsx           # Individual solution card in the horizontal grid
│   ├── UseCaseStory.tsx           # Full-bleed horizontal scroll-snap storytelling panels (Meet, Restaurant, Review)
│   ├── CustomCTA.tsx              # "And that's just the start / Let's bring your idea to life" section
│   ├── FAQ.tsx                    # Accordion FAQ section
│   ├── FinalCTA.tsx               # Bottom conversion CTA section
│   ├── Footer.tsx                 # Site footer with brand, products, company links, and legal links
│   ├── ProfilePage.tsx            # Home-feel responsive digital profile layout for /u/ibraheem (with previewOnly prop)
│   ├── order/
│   │   └── OrderWizard.tsx        # 7-step customer purchase flow (Card → Profile → Links → Preview → Delivery → Payment → Done)
│   ├── admin/
│   │   ├── AdminApp.tsx           # Admin shell (sidebar: Dashboard/Orders/Clients/Profiles/Reviews/Settings) + metrics
│   │   ├── OrdersView.tsx         # Order list, full detail, fulfillment transitions, QR/NFC production summary, Create-Client-Profile
│   │   └── ProfilesView.tsx       # Owner profile editor (moved from old /admin)
│   └── doodles/                   # Hand-crafted inline SVG brand doodle components
│       ├── index.ts
│       ├── Business.tsx
│       ├── Connectivity.tsx
│       ├── Decorative.tsx
│       └── Social.tsx
│
├── lib/
│   ├── firebase.ts                # Firebase SDK App, Auth, Firestore, Storage init
│   ├── firestore.ts               # Orders, profiles, reviews, username/handles, fulfillment transactions
│   ├── storage.ts                 # uploadInboxAvatar (public), uploadCustomDesign (admin-read), fileToDataUrl
│   ├── site.ts                    # APP_URL single source — NFC/QR destination base
│   ├── qr.ts                      # qrDataUrl() — wraps `qrcode` (client-side QR as data URL)
│   ├── animations.ts              # GSAP setup + prefersReducedMotion() utility guard
│   ├── data/
│   │   ├── content.ts             # Marketing copy, solutions, use cases, FAQs
│   │   ├── profile.ts             # Single source of truth for Ibraheem's profile (avatar, links, bio)
│   │   ├── order.ts               # Order/Card/Customer/Payment/Fulfillment types + canTransition() state machine
│   │   └── cardArt.ts             # Admin card-thumbnail tokens per template
│   └── models.ts                  # Review, ClientProfileMeta (stable profileId→username), AdminConfig
│
├── public/
│   ├── ibrahema.png               # Real photo for Ibraheem's profile
│   └── (default svgs)
│
├── CLAUDE.md                      # Project instructions & guardrails
├── BUILD.md                       # This developer map
├── next.config.ts                 # Next.js configuration
├── firebase.json                  # Firebase Hosting configuration (pointing to 'out' directory)
├── .firebaserc                    # Firebase project targets
└── package.json                   # Dependencies & scripts
```

---

## "WHERE DO I EDIT?"

### Dynamic Dashboard Profile Editor
- **File**: [app/admin/page.tsx](app/admin/page.tsx)
- **Contains**: Owner login, edit details (Display Name, Bio, Location, Avatar Image URL), add, arrange, and edit up to 10 contact links with direct Firebase Firestore synchronization.

### Pricing Page
- **File**: [app/pricing/page.tsx](app/pricing/page.tsx)
- **Contains**: Transparent non-subscription pricing models (Standard, Business NFC, Custom Enterprise).

### Profile Experience (`/u/[username]`)
- **Files**: [components/ProfilePage.tsx](components/ProfilePage.tsx), [app/u/[username]/page.tsx](app/u/[username]/page.tsx)
- **Contains**: Responsive paper card layout, real-time load from Firestore database, and beautiful social icons. Empty URL links are cleanly hidden for standard visitors.

---

## "RUN / BUILD / DEPLOY"

```bash
# Install dependencies
npm install

# Run development server with live next.config and .env.local variables (http://localhost:3000)
npm run dev

# Verify static routes, TypeScript compilation and next build
npm run build

# Verify E2E behaviors, overlays, and responsiveness across viewports using Playwright
node scripts/test-site.mjs
```

---

## CUSTOMER → FULFILLMENT WORKFLOW

Two actors: the **customer** orders on `/order`; the **admin** fulfills on `/admin`.

### Customer flow — [`/order`](app/order/page.tsx)
`OrderWizard` runs entirely client-side (static export) and submits a guest checkout order to Firestore — **no account required**:
Choose card (Classic / Bold / Executive / Custom+upload) → Build profile (avatar, name, bio only) → Add links (WhatsApp/Instagram/LinkedIn/Website/Portfolio/Email/Phone presets) → **Preview reuses the real `ProfilePage`** via its `previewOnly` prop (no fake preview) → Delivery (name/phone/address/city — private) → Payment (Online = honest `pending` placeholder; COD = `cod_pending_confirmation`) → Confirmation (order number + progress tracker, renders only real fulfillment states).

### Fulfillment state machine — [`lib/data/order.ts`](lib/data/order.ts)
```
new → payment_pending → paid | cod_pending_confirmation → profile_created →
production_ready → printing → ready_for_nfc → nfc_programmed → qa_passed →
ready_to_ship → shipped → delivered        (cancelled from almost anywhere)
```
`canTransition(from, to)` guards all admin status changes; `advanceFulfillment` enforces it **in a Firestore transaction** with an expected-status check so two admins can't clobber each other. History is appended, never overwritten.

### Admin flow — [`/admin`](app/admin/page.tsx)
Sign-in gate with **no local fallback** (real Firebase errors surfaced). Once signed in, `AdminApp` shows a sidebar:
- **Dashboard** — metrics: orders awaiting action, total clients, active profiles, reviews, in production, ready for NFC, ready to ship, recently completed (all computed live from Firestore).
- **Orders** — search/filter list + full detail split into CUSTOMER / CARD / PROFILE DRAFT / **DELIVERY (private)** / **PAYMENT (private)** / FULFILLMENT. Buttons advance status only through `canTransition`. Once in production, a **Production summary** block shows order #, card, quantity, profile URL, NFC destination and a **QR code** (all pointing at the EdgeTap profile — never a social platform directly), copy-able.
- **Create Client Profile** (inside an order) — suggests a username from the customer name, checks availability (`profiles` + `handles`), no silent overwrites, then `createClientProfileFromOrder` transacts: `profiles/{username}` + `handles/{username}` + `profilesById/{profileId}` + order link.
- **Clients** — deduplicated customer list; **Profiles** — owner profile editor (moved from old /admin); **Reviews** — public review list; **Settings** — admin UID + Firebase readiness.

### Why a separate `profileId`?
The **username is a mutable public handle**. Every client profile also gets a stable internal `profileId` (UUID) recorded in `profilesById/{profileId}`. Reviews, NFC/QR destinations and future analytics reference the stable ID so a handle rename never breaks a card already in the wild.

### Dynamic `/u/[username]` (no static per-customer pages)
`app/u/[username]/layout.tsx` pre-renders only `ibraheem` (the shell). The client route fetches the profile from Firestore and shows loading / honest "Profile not found" states. Firebase Hosting rewrites `"/u/**"` → `"/u/ibraheem"` so any handle boots the shell and resolves client-side — no `ahmad.html` files are ever generated.

### Review request
Reviews are stored in `reviews/{id}` (public read, authenticated create, rating 1–5). The review-card flow is data-ready, not yet surfaced on the marketing site.

---

## "DO NOT BREAK"

1. **Maximum link validation**: Constrain any single user profile to 10 active social and contact links. Both UI client-side arrays and Firestore update pipelines validate this ceiling.
2. **Static seed data**: Keep `ibraheemProfile` in [lib/data/profile.ts](lib/data/profile.ts) as the *static seed/fallback* for the marketing site so `/u/ibraheem`, the hero, and the use-case story still render without an active Firestore DB. This is **not** a silent bypass of Firebase errors — [lib/firestore.ts](lib/firestore.ts) only returns the seed for the known `ibraheem` username when the doc is genuinely absent, and logs `console.info` when it does. The `/admin` dashboard has **no** local fallback: login failures surface the real Firebase error.
3. **Typography**: Ensure "Fredoka" and "Inter" display and body styling remains responsive across 1440px desktop, tablet, and 390px mobile screens.

---

## FIREBASE STATUS (CURRENT — 2026-09-14)

> ⚠️ **Firebase Auth & Firestore are NOT yet live.** Fixed in code, blocked at the GCP billing layer.

### What is DONE
- ✅ Firebase web app registered for `edgetapflow` (`1:396560811830:web:9c0524765b85aa69e39597`)
- ✅ `.env.local` points at the real `edgetapflow` project (API key, auth domain, storage bucket, sender ID, app ID)
- ✅ [lib/firebase.ts](lib/firebase.ts) — removed the `edgetap-flow` mock defaults; now fails loudly if env vars are missing
- ✅ [lib/firestore.ts](lib/firestore.ts) — removed silent error fallback; static seed only for the known `ibraheem` username when the doc is absent
- ✅ [app/admin/page.tsx](app/admin/page.tsx) — **dev/fallback sign-in REMOVED**; real Firebase error surfaced (with helpful guidance on `configuration-not-found` / `user-not-found` / `wrong-password`)
- ✅ [firestore.rules](firestore.rules) — profiles public read/owner+admin write; handles collision-safe; orders create (guest) / read+update+delete admin; reviews public read/auth-create; config/admin_uids deny-all
- ✅ [storage.rules](storage.rules) — avatars/{uid} owner-write/public-read; avatarInbox/{clientToken} public-read/anonymous-create; orderInbox/{clientToken} admin-only
- ✅ Next.js production build passes clean (`npm run build`)

### What is BLOCKED (needs one Firebase Console session)
The [edgetapflow](https://console.firebase.google.com/project/edgetapflow) project has **no billing account attached** (`billingEnabled: false`). Without billing, GCP refuses to provision Firestore ("This API method requires billing"), and the Identity Platform config for Auth was never initialized (`CONFIGURATION_NOT_FOUND` on every Auth API). The Firestore database shows in `databases:list` but is **not active** (`404` on the data API).

To finish, in the Firebase Console:
1. **Enable billing** on the project (even the free Spark tier needs the billing step; see `https://console.developers.google.com/billing/enable?project=edgetapflow`).
2. **Create the Firestore database** (Database → Create database → production mode, `(default)` — or regional for Spark).
3. **Enable Authentication** (Authentication → Get started → Email/Password provider → enable).
4. **Create the owner account** (Authentication → Users → Add user → Ibraheem's email) and record the UID; put it on the `profiles/ibraheem` doc as `ownerUid`.

Then, from the CLI (billing enabled):
```bash
npx firebase-tools deploy --only firestore:rules,storage:rules --project edgetapflow
# seed the profile doc via lib/firestore.ts saveProfile, or Firebase Admin SDK
```

### Firestore data model (customer → fulfillment)
```
profiles/{username}            public profile; displayName, title, bio, avatar, links[] (≤10),
                               profileId (stable), active, createdAt/updatedAt, ownerUid?
  read: public · create/update: owner or admin (config/admin_uids)

handles/{username}             { profileId, createdAt } — claimed-handle registry for collision-safe creation

profilesById/{profileId}       { profileId, username, active, createdAt } — stable ID → current handle

orders/{orderId}
  orderNumber (ET-YYYYMMDD-xxxxxx), plan, card{template,quantity,customDesignUrl?},
  profileDraft{avatarUrl, displayName, bio, links[], usernameSuggested?},
  customer{fullName, phone, email, address, city, postalCode?}   ← PRIVATE
  payment{method: online|cod, status: pending|paid|failed|cod_pending_confirmation|refunded|cancelled, providerRef?}
  fulfillment{status, history[]}, profileId?, usernameFinal?, nfcUrl?, createdAt, updatedAt
  create: any visitor (guest checkout) · read/update/delete: admin only
  → delivery address + payment NEVER appear on /u/…

reviews/{id}                   { profileId?, username, rating(1-5), text, authorName, authorUid?, createdAt }
  read: public · create: authenticated only

config/admin_uids              { uids: string[] } — never public-readable; rules check it via get()

storage:
  avatars/{uid}/{file}         public read · owner write (auth.uid == uid, image ≤5 MB)
  avatarInbox/{clientToken}/…  guest avatar upload — public read, anonymous write to random folder (≤5 MB image)
  orderInbox/{clientToken}/…   custom card art — admin read/delete only, anonymous create ≤25 MB
```
