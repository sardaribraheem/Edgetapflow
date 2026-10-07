# EdgeTap launch audit — 6 October 2026; follow-up 7 October

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

Confirmed during this audit: canonical `https://edgetapflow.web.app`; WhatsApp +92 304 414 9674 as primary support; physical card Rs. 999; Pakistan-focused delivery; JazzCash 0304 4149674 only. No verified business email, pickup offer, lifetime hosting or delivery fee/time. On 7 October the owner confirmed the personalized-card policy framework: non-returnable/non-refundable after production begins except required law; damage/defect/EdgeTap printing error/wrong card assessed for remedy, with no automatic remedy for customer-provided errors. Hosting/update terms, delivery coverage/cost/dispatch and pre-production cancellation/approval/claim procedure remain decisions. Legal applicability is not certified.

Read-only live check on 6 October 2026: Auth public configuration HTTP 200 and launch host authorized; public founder Firestore read HTTP 403 PERMISSION_DENIED (also with the confirmed launch referrer); anonymous order and Storage listing HTTP 403. The denials do not prove staff/customer operations or production private-data isolation; follow-up identified a billing gate for Firestore. The public-profile denial is a live launch blocker. No production write or deployment was performed.


## Follow-up investigation — 7 October 2026

The actual unauthenticated production browser targets `(default)` through Firestore WebChannel. The exact failing document is `projects/edgetapflow/databases/(default)/documents/profiles/ibraheem`. Its REST read returns HTTP 403 `PERMISSION_DENIED` with “This API method requires billing to be enabled.” An authenticated operator read is denied too. Cloud Billing metadata confirms `billingEnabled: false`. No billing change was attempted.

Database metadata identifies two distinct IDs: `(default)` has `freeTier: false`; `default` has `freeTier: true`. The deployed `(default)` profile rule permits public reads, so this 403 is not a profile authorization failure. App Check is unenforced for Firestore, Storage and Auth. Hosting `/`, `/order` and `/u/ibraheem` return 200, Auth config responds and the host is authorized. The named free-tier database instead returns a genuine rules denial: its deployed catch-all rule denies all reads/writes; privileged founder read is 404 and a bounded order listing is empty. Inaccessible paid-database data was not inventoried or assumed empty.

The live founder UI masks failure with old static fallback; a missing arbitrary profile URL returns 404. Neither proves functional public customer profiles. The branch has already corrected fallback/routing, but no release was deployed. A live-SDK check against the local export also exposed loading beyond 30 seconds; customer profile loading now times out after 15 seconds with a sanitized unavailable state, never founder fallback. Public-profile access does not call Storage or Cloud Functions. A Functions API listing was denied, so there is no claim that console-managed functions are absent.

[Firestore free quota applies to one database](https://firebase.google.com/docs/firestore/pricing). [Database selection is explicit for named databases](https://firebase.google.com/docs/firestore/manage-databases). Source now supports `NEXT_PUBLIC_FIRESTORE_DATABASE_ID`, preserving `(default)` by default, plus a prepared `firebase.spark.json` for the existing named `default`. No selection/migration/deployment was executed; `.env.local` is intact.

[Cloud Storage requires Blaze](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024), including the configured `*.firebasestorage.app` bucket. Anonymous Storage listing returns generic permission denial, not a diagnostic billing message; the dependency comes from current service requirements and verified inactive billing. Mandatory receipt upload makes existing online checkout incompatible with Spark; artwork/avatar uploads and staff downloads share that dependency. Manual JazzCash transfer and WhatsApp discussion need no external gateway or Firebase paid service. A complete receipt-free website checkout has not been implemented or claimed.

Source checkout defaults to paused via `NEXT_PUBLIC_ONLINE_CHECKOUT_ENABLED=false`. Card/profile preparation and all underlying services remain intact; WhatsApp handoff explicitly states selections are not submitted. No password/receipt collection or online submit action appears in paused mode. Terms, FAQ and ordering copy disclose the owner-directed personalized-card policy and separately confirmed delivery/hosting terms. Legal review is required; no blanket 30-day guarantee or customer-error remedy is invented.

### TECHNICAL BLOCKERS

Reviewed rules/profile routing/copy remain undeployed. Verify real public profiles, safe private-data denial, staff/owner operations, order persistence/manual payment acceptance and physical NFC/QR on customer devices. The free-tier database requires verified public data and staff setup, not just a changed database ID. Old deployed rules remain less restrictive than branch rules.

### BUSINESS DECISIONS

Hosting duration/update terms; delivery coverage/fee/dispatch; cancellation before production and production approval/defect claim process. Exact delivery information must be agreed during ordering before payment; no pickup is advertised.

### BILLING/INFRASTRUCTURE BLOCKERS

Current `(default)` is billing-gated. Existing free-tier `default` is deny-all and lacks the founder document. Safely prepare its data/rules or use another explicitly approved infrastructure path; do not delete/migrate inaccessible customer data blindly. Website receipt/artwork/avatar Storage needs Blaze. Keep payment collection paused. No billing activation, payment method changes, paid provisioning, deployments or push authorized.

### LEGAL/POLICY REVIEW

Owner-directed personalized-card terms are business policy, not a legal opinion. Verify applicable Pakistan/provincial requirements, pre-payment disclosure, mandatory remedies, cancellation/production consent, claim handling and privacy retention/deletion. [Official Punjab Consumer Protection Act publication](https://pccmdpunjab.gov.pk/custom/mateen/pdf/ruleregulation/20-Punjab%20Consumer%20Protection%20Act%202005.pdf) demonstrates why disclosure/remedies need review; it does not certify applicability or EdgeTap compliance.

**NOT READY TO LAUNCH:** all eight customer acceptance outcomes in `LAUNCH_REPORT.md` must be demonstrated, including actual unauthenticated backend profile access and completed supported ordering/payment handling.

Follow-up validation: production export build and typecheck passed; lint zero errors/five existing image warnings; 364 browser assertions across five viewport widths, 57 Firebase rules checks and 36 actual-service emulator assertions passed. After bounding profile loading, a fresh local export browser using live Firebase verified sanitized unavailable state within 23 seconds, without founder fallback. Final personalized-card Terms export checks passed. These are not a successful live order or backend profile access.

## Supabase implementation follow-up — 7 October 2026

The owner approved local implementation after the read-only Firebase/Supabase audit. Additive relational schema, RLS/RPCs, Auth/data/upload adapters, static recovery, Storage policies and guarded offline preservation tooling are now prepared on `launch-readiness`. See [SUPABASE_MIGRATION_REPORT.md](SUPABASE_MIGRATION_REPORT.md) and [supabase/README.md](supabase/README.md). Firebase remains selected by default; `.env.local`, Firebase services/data and production Hosting are intact. No hosted database, bucket, user or deployment was created.

Verification: Firebase-selected static export and 364 responsive browser assertions passed; Supabase-selected fixture export passed; 20 local PostgreSQL/RLS checks, public-key/origin preflight checks, offline ID/relationship/legacy-data preservation checks and 15 browser integration checks passed. Supabase browser checks execute real local SQL/RLS with simulated Auth/Storage HTTP. They cover staff receipt download/manual confirmation/profile publication, anonymous new-profile access, private-file denial, owner edit, session restoration, QR and recovery. They do not verify hosted services, email delivery or a real payment.

### TECHNICAL BLOCKERS

Complete Firestore/Auth/file preservation and normalization, a verified existing-user password/recovery strategy, hosted permission/SMTP/Storage verification, actual order/payment/physical-card walkthrough and final snapshot/delta/rollback plan remain required. Source `(default)` document counts remain unknown; the empty named `default` is not a replacement inventory. A component retry reuses its request key; refreshed-tab order reconciliation is still required before resubmission. The official Auth importer must not be run unchanged: its client-visible raw user metadata/error SQL logging require a sanitized approach. The official Firestore extractor requires fatal read errors and independent count checks.

### BUSINESS DECISIONS

Delivery coverage/fee/dispatch; hosting duration/update terms; cancellation before production and print-approval/defect-claim procedure. Existing personalized-card wording and separately agreed delivery/hosting expectations remain in place. No policy was invented to fill these gaps.

### BILLING/INFRASTRUCTURE BLOCKERS

No selected Supabase URL/public key or operator migration connection is configured. Source Firestore `(default)` and four object byte reads remain HTTP 403 under inactive billing. One Auth user and four legacy `avatarInbox` objects need verified mapping/preservation. Region/capacity and real Auth email settings need configuration; no paid project, add-on or billing activation was attempted. Hosting and canonical `https://edgetapflow.web.app` remain unchanged.

### LEGAL/POLICY REVIEW

Review personalized-card remedies/cancellation disclosure and the actual Supabase processor/region, privacy retention and account migration/recovery procedure before release. Local technical implementation does not establish legal compliance.

**NOT READY TO LAUNCH.** None of the local results substitutes for an actual unauthenticated production profile, completed supported order/payment process or verified customer-data migration.
