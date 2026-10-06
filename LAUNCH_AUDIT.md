# EdgeTap launch audit — 6 October 2026

Audit of actual source on `main` at `4ce757b`, before implementation. Existing user changes: `.gitignore` modified and root QA screenshots deleted; preserve them. Work branch: `launch-readiness`. Historical README/BUILD claims are not verification.

## What exists today

Next.js 16.3.4 / React 19 static export, Tailwind 4, Firebase Hosting. Browser SDKs provide Authentication, Firestore and Storage; no API server, payment gateway, delivery integration or notification worker. Landing, pricing, seven-step order wizard, founder profile, dynamic-profile attempt, legal pages, customer sign-in and staff dashboard exist. Orders require email/password authentication and manual transfer receipt; staff manually confirm payment, create profiles, generate QR and track fulfillment. NFC programming is a physical operator task, not browser functionality. Customer editor changes identity fields but not links. QR helper exists only in staff production UI. Menu/review screens are illustrations; attendance, team dashboards, analytics, enterprise integration and automatic email updates are not implemented. No real testimonials are mounted, but placeholder testimonial code remains. Existing Playwright script logs checks without asserting them and falsely reports every check passed.

## P0 — blocks public launch

### P0-1: Arbitrary NFC/profile links resolve to founder content
- Problem/evidence: `firebase.json` rewrites `/u/**` to `/u/ibraheem`; explicit `app/u/ibraheem/page.tsx` always mounts founder data. Dynamic client route uses build-time params instead of incoming browser pathname. Catch-all rewrite returns homepage for missing routes.
- Why: customer cards may identify the wrong person; missing pages return successful homepage.
- Fix: export a dedicated generic profile shell; resolve handle from browser pathname; remove catch-all rewrite, retain real 404.
- Verify: serve production export with Hosting-equivalent routing; test multiple handles, missing/inactive profile, reload and failure without founder flash. Final Firebase preview check remains mandatory.

### P0-2: Database write and reservation integrity
- Evidence: `firestore.rules` permits owner mutation of arbitrary profile fields; reads hidden profiles; handles are unreadable even to admin, breaking `usernameAvailable`. `createClientProfileFromOrder` checks availability outside transaction then unconditionally overwrites profile/handle.
- Why: checkout fulfillment fails; concurrent staff can overwrite customer identity; users can change lifecycle fields. Orders accept arbitrary lifecycle/profileId extras.
- Fix: staff-only profile creation/deletion and handle reservation; owners may change only identity/link fields; constrain payloads, pending order lifecycle and link limits; check profile, handle and order inside transaction before creation.
- Verify: rules emulator allow/deny matrix and concurrent collision regression; then deploy reviewed rules. Source inspection alone is insufficient.

### P0-3: Live Firebase operations not demonstrated
- Evidence: BUILD.md claims Auth/Firestore blocked; local env contains public Firebase configuration but no proof of enabled services, deployed rules, staff allowlist, Storage billing or correct authorized domains.
- Why: payment receipt upload, order persistence and fulfillment depend on these services.
- Fix: verify project configuration; enable services, provision staff UID allowlist, deploy rules and run a controlled end-to-end order with approved test account.
- Verify: actual Auth → receipt/artwork → private order → staff payment confirmation → profile creation → NFC/QR → owner edit. Do not place charges or production test orders without appropriate test setup.

### P0-4: Commercial policy/payment claims require owner confirmation
- Evidence: pricing Rs. 999 vs Business Rs. 2,499; checkout always charges quantity × 999; lifetime/free forever/24-hour promises; delivery total is null; hardcoded transfer destinations; pickup NASTP hours; legal contacts use unverified edgetap.com inboxes.
- Why: customer cannot determine actual contract, complete cost or correct transfer recipient.
- Fix: sell only implemented standard card; request confirmation of domain/contact, hosting term, delivery fees/coverage/dispatch, pickup, refund policy and payment recipient/methods. Do not invent policy.
- Verify: owner approval and a customer walkthrough against actual fulfillment. Remaining business decisions block launch.

## P1 — serious before launch

### P1-1: Consumer leaks and unsupported functionality
- Evidence: Hero private-beta badge; Navbar `/admin` login; pricing links admin and sells unavailable packages; Footer `#` social/legal and incorrect company anchors; placeholder testimonials; menus/reviews/attendance presented as delivered products; confirmation promises email with no mail service.
- Why: trust and navigation fail; customer buys nonexistent functionality.
- Fix: customer `/account`, actual legal/contact links, concrete NFC + QR + profile offer and Rs. 999 disclosure; remove unsupported offers and fake testimonial data, avoid automatic-email promise.
- Verify: repository scan and rendered routes/CTA assertions at 320/360/390/768/1440 widths.

### P1-2: Unsafe navigation and profile links
- Evidence: account `next` accepts `//external`; profile links rendered without scheme validation; raw Firebase exceptions reach consumer pages; profile load has uncaught rejection; owner state persists after logout.
- Why: open redirect, malicious link navigation, internal information leakage and misleading edit UI.
- Fix: allow only local profile return routes; shared safe HTTP(S)/mailto/tel validation; catch and sanitize customer errors; reset owner state on auth changes.
- Verify: hostile return URLs and javascript/data links; simulated Firebase failure; logout verification.

### P1-3: Save Contact does nothing; profile preview can be stale
- Evidence: ProfilePage Save Contact `href="#"`; preview state initialized once although props change.
- Why: a central advertised feature fails.
- Fix: escaped downloadable vCard; current draft preview; owner link editor with safe URL and 10-link limits.
- Verify: browser download content, edited preview, saved owner updates.

### P1-4: Private uploads use shareable URLs; custom design upload read denied
- Evidence: storage upload calls `getDownloadURL` for artwork while rules deny owner read; receipt/artwork URLs are saved and opened directly.
- Why: artwork checkout fails after upload; permanent token links weaken privacy if shared.
- Fix: store private Storage paths; authenticated SDK download in staff UI; owner metadata permission for their artwork; preserve legacy URLs in staff UI with migration warning in report.
- Verify: upload/read isolation in emulator, authorized blob retrieval, unrelated customer denied. Revoke old download tokens via trusted operator before release if any exist.

### P1-5: Production metadata, errors and QA insufficient
- Evidence: layout defaults edgetap.com while NFC uses edgetapflow.web.app; no OG image, sitemap or robots, default favicon; no meaningful browser assertions; missing-env initialization only logs and proceeds; lint scans nested `.kilo` worktree.
- Why: previews/links point to wrong host; CI gives false confidence.
- Fix: shared origin, branded exportable SVG icon/social asset, sitemap/robots with private routes excluded, real error page, fail missing build configuration, assertive production QA and isolated checks.
- Verify: build, lint/typecheck, export resources, production HTTP statuses and browser console.

## P2 — important but can follow

### P2-1: Abuse prevention and privacy lifecycle
- Evidence: direct client authenticated order writes, unrestricted upload frequency; no App Check configuration, verified-email requirement, automated retention/deletion, support queue or idempotent retry persistence.
- Why: account-based spam/storage spending and orphan uploads are possible.
- Fix: App Check/budget alerts, retention process and trusted backend rate limits before scaling; preserve order ID across uncertain retries where possible.
- Verify: abuse/duplicate submission tests and operator deletion drill.

### P2-2: Tracked development artifacts and stale docs
- Evidence: tracked `.playwright-mcp` console/snapshots and `.firebase` cache; historical docs refer to nonexistent features and unrelated Masjid project.
- Why: unnecessary repository leakage and future engineering mistakes. They are outside Hosting `out` and not public website assets.
- Fix: ignore future artifacts; update primary instructions/docs; remove tracked legacy artifacts with owner review. No service-account/private key found in inspected current tracked text; Firebase public web API key appears in a historical console log and is not a service secret.
- Verify: exported-file inventory; secret scan without outputting values; historical Git scan before release.

## P3 — future improvement

Payment gateway, order tracking/email automation, staff client-profile management, genuine reviews, dynamic per-profile SEO/stable-ID redirects, attendance/menu/enterprise products. Do not advertise these as available before implementation.

## Additional findings during verification

### P0-5: Installed dependency critical advisory
- Evidence: registry audit found Next.js 16.3.4 affected by GHSA-vcvr-r3jv-pc5j (`next/og` ImageResponse RCE). This app has no ImageResponse endpoint and exports static files, but retaining the vulnerable framework is avoidable.
- Fix: compatible update to Next.js / eslint-config-next 16.3.8; non-breaking transitive audit fixes. No forced Firebase/Next downgrades.
- Verification: production compilation, lint, typecheck and browser QA after update; critical advisory removed. Remaining ten high audit entries represent two root advisories: Node gRPC and development glob parsing. They are not present in the exported browser chunks; future Node deployment requires reassessment.

### P1-6: Boundary conditions exposed by real tests
- Evidence: 320px checkout decorative-background overflow; fulfillment could skip directly to shipped; final checkout showed “Order received” before a write; full ten-link order payload exceeded Firestore's 1,000-expression budget.
- Fix: clip decorative backgrounds, explicit fulfillment steps, separate payment/profile actions, honest review state with edit action, cheaper draft validation plus complete published-profile validation.
- Verification: final production browser suite and ten-link create/update emulator assertions. Tests found these defects after simpler smoke checks passed.

## Owner-confirmed launch facts

Confirmed during this audit: canonical `https://edgetapflow.web.app`; WhatsApp +92 304 414 9674 as primary support; physical card Rs. 999; Pakistan-focused delivery; JazzCash 0304 4149674 only. No verified business email, pickup offer, lifetime hosting, delivery fee/time or refund policy. Three remaining policy decisions: hosting/update terms; delivery coverage/cost/dispatch; returns/refunds.

Read-only live check on 6 October 2026: Auth public configuration HTTP 200 and launch host authorized; public founder Firestore read HTTP 403 PERMISSION_DENIED (also with the confirmed launch referrer); anonymous order and Storage listing HTTP 403. The private-list denials are expected but do not prove staff/customer operations. The public-profile denial is a live launch blocker. No production write or deployment was performed.
