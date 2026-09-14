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
│   ├── pricing/page.tsx           # Transparent Pricing plans and custom bulk sales page
│   ├── globals.css                # Tailwind v4 tokens, design primitives, animations, scroll-snap utilities
│   ├── admin/page.tsx             # Interactive dashboard (Sign In, Profile Editor, Link Management, Security Rules)
│   ├── cookies/page.tsx           # Cookie Policy compliance page
│   ├── privacy/page.tsx           # Privacy Policy compliance page
│   ├── terms/page.tsx             # Terms & Conditions compliance page
│   └── u/
│       ├── [username]/page.tsx    # Dynamic Firestore/static profile route (resolves usernames or falls back)
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
│   ├── ProfilePage.tsx            # Home-feel responsive digital profile layout for /u/ibraheem
│   └── doodles/                   # Hand-crafted inline SVG brand doodle components
│       ├── index.ts
│       ├── Business.tsx
│       ├── Connectivity.tsx
│       ├── Decorative.tsx
│       └── Social.tsx
│
├── lib/
│   ├── firebase.ts                # Firebase SDK App, Auth, and Firestore Client Initialization
│   ├── firestore.ts               # CRUD profile methods & maximum link validations
│   ├── animations.ts              # GSAP setup + prefersReducedMotion() utility guard
│   └── data/
│       ├── content.ts             # Marketing copy, solutions, use cases, FAQs
│       └── profile.ts             # Single source of truth for Ibraheem's profile (avatar, links, bio)
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

## "DO NOT BREAK"

1. **Maximum link validation**: Constrain any single user profile to 10 active social and contact links. Both UI client-side arrays and Firestore update pipelines validate this ceiling.
2. **Fallback states**: Keep fallback local objects (`ibraheemProfile` in [lib/data/profile.ts](lib/data/profile.ts)) intact if internet connection or database queries timeout.
3. **Typography**: Ensure "Fredoka" and "Inter" display and body styling remains responsive across 1440px desktop, tablet, and 390px mobile screens.
