> **Confirmed product/fulfillment update — 7 October 2026:** All designs are PVC/NFC, 85.60 × 53.98 mm; Wood is printed artwork. Staff manually prepares final designs. Every personalized card requires an emailed proof with a 10-hour reply window starting only after real sending. SMTP is pending; printing stays held. NASTP Delta 3 pickup: Mon–Fri 9 am–5 pm, contact +92 304 414 9674 after arrival once ready. Delivery costs extra, paid directly to the rider; staff records the actual booked fare/message. Hosting and updates have no separate fee for now. **007–009 are local only; hosted remains 001–006.** See [BUSINESS_CONFIGURATION.md](BUSINESS_CONFIGURATION.md). Earlier conflicting claims below are historical and superseded. Launch remains on hold.

## Current application workflow status — 7 October 2026

**NOT READY TO LAUNCH.** The complete application workflow is implemented and verified locally on `launch-readiness`; no frontend or hosted database release was made in this task. The hosted Edgetap project remains on migrations 001–006. Migrations 007–009 are prepared locally and NOT applied under the owner's no-deploy instruction. Firebase test-data migration stays waived; Firebase and DukanKhata are untouched.

See [ORDER_WORKFLOW_REPORT.md](ORDER_WORKFLOW_REPORT.md) for history findings, schema/RLS changes, every customer/admin/payment/fulfillment step, configuration locations, exact implementation files and limitations.

### LOCAL VERIFIED

- Account-owned progressive cloud drafts/new-session recovery; desired handle and fixed standard PVC size, original and staff-prepared private artwork; private manual JazzCash proof/reference; delivery and NASTP pickup; submitted staff inbox; customer corrections to the same order; independent payment/specification/application approval; public profile/QR; actual operator printing/NFC/QA and delivery/pickup completion; customer messages/history and private staff notes.
- 24 baseline SQL/RLS + 29 application/administration checks pass. Includes owner isolation, stale review/payment denial, private notes/proofs, revoked staff, both lifecycle branches, proof approval/revision/10-hour guards, rider-direct fare/dispatch, unsent email and verified-only owner enrollment safeguards.
- 67 browser checks pass against isolated PostgreSQL/RLS with Auth/Storage HTTP simulated: complete customer/staff workflows at 320/390/1440px, invalid prepared-artwork proportions, actual-send-only proof clock (local simulated transport), printing hold and customer confirmation, rider fare/messages and NASTP arrival contact, settings, refresh-safe unfinished staff notes/messages, public profiles, owner editing, confirmation-required signup and recovery guards. No production fixtures/payments/emails are created.
- Typecheck and real public-config static export pass. Lint has zero errors and six static-image warnings. Final export contains the approved project, no fixture backend/key or privileged credential patterns.
- 344 broader responsive/route/link/metadata/menu/error assertions pass at 320/360/390/768/1440px. Offline migration preservation regression passes; no Firebase extraction runs.

### HOSTED VERIFIED

- Existing 001–006 foundation only. Previous verification: twenty-one read-only API boundary checks and twelve anonymous real-backend browser checks passed. No real signup/login/email/order/existing-file/payment success is inferred.
- At the last read-only inspection, `sardaribraheem277@gmail.com` was not registered/verified/enrolled. No user/membership was created. The owner will register/verify normally; deliberate enrollment then uses `scripts/enroll-edgetap-admin.mjs`, protected UUID staff membership, no runtime email gate.
- Empty public profiles correctly render missing; a real published example remains required. Production website is still the previous Firebase client because release is forbidden.

### TECHNICAL BLOCKERS

- Separately authorize, inspect and apply only unapplied additive migrations 007–009 to ONLY `dxyxvervvlxhwwbcbttd`; verify hosted RLS/RPCs/Storage boundaries. Do not reset or rerun the original clean installer. New frontend cannot be released against only 001–006.
- Register/verify the real designated owner, deliberately enroll staff, and perform real hosted customer draft/proof/review/payment/correction/specification/publication and private-existing-byte tests. No fake production record will substitute for this.
- Approve and test actual Hosting release/callbacks/routes, a public example, owner editing and physical NFC/QR on real iPhone/Android devices; verify actual manual transfer, card printing, delivery and pickup operations.
- Current inbox/read RPCs load the newest 200 orders and latest 100 drafts. Add pagination before volume requires access to older records.

### BUSINESS DECISIONS

- Delivery coverage and any dispatch commitment; cancellation-before-production and defect-reporting/remedy procedure; hosting duration and future term-change notice. SMTP provider/sender remains pending.
- Fixed dimensions/material, NASTP Delta 3 / Mon–Fri 9 am–5 pm, rider-direct extra fare, free-for-now profile hosting/updates, and every-personalized-card proof/10-hour policy are **confirmed**, not outstanding decisions. Admin → Settings edits instructions; staff manually prepares artwork and enters actual rider fare/message per order. No invented fare, automatic booking or lifetime promise.

### BILLING / INFRASTRUCTURE BLOCKERS

- Verified SMTP provider/sender for ordinary customer confirmation/recovery. [Supabase default SMTP](https://supabase.com/docs/guides/auth/auth-smtp) is limited to project-team addresses and is not a commercial production service. Do not disable confirmation or fabricate verified users to bypass it.
- Staff inbox and customer account messages/history are the current notification sources. Private event outbox exists locally with disabled transport; final-design email requires a real worker/transport, verified sender and monitored reply mailbox. The private queue/completion hook is implemented but cannot send; this is a printing blocker. Nothing claims an email was delivered.
- Review hosted quotas/operations before release; no paid service/billing/payment method was enabled. Supabase ordering does not require Firebase Blaze. Rotate the privileged key previously shared in chat; it was not used/saved or embedded.

### LEGAL / POLICY REVIEW

Personalized cards are non-returnable/non-refundable once production starts except applicable-law requirements; actual damage/defect/EdgeTap-error/wrong-card remedies need assessment. No blanket refund or automatic remedy for customer-supplied errors. These are owner-approved business directions, not a legal-compliance certification. Review commercial/privacy/retention, cancellation/defect details and the ten-hour silence-as-confirmation/email-evidence policy appropriately.


---

## Historical audit and earlier implementation evidence

The sections below record earlier states. Their paused-checkout, missing-pickup, Firebase-backend and missing-destination statements are superseded by the current status above.

> **Current hosted setup update:** Supabase foundation is configured in the confirmed Edgetap project `dxyxvervvlxhwwbcbttd`. Real public config/build and anonymous/API boundaries are verified; account/email/staff/customer/payment success paths and website release remain blocked. Firebase test-data recovery is permanently waived and Firebase is untouched. See the current hosted-state section below and [SUPABASE_MIGRATION_REPORT.md](SUPABASE_MIGRATION_REPORT.md). Earlier missing-destination/source-preservation requirements are historical and superseded.

> **Current Supabase clean-start update — 7 October 2026:** Firebase test data/user/images are intentionally NOT migrated and remain untouched. Their 403/extraction/password-preservation issues are waived. Supabase is now the local default backend, with no automatic Firebase fallback. Hosted setup is pending the correct project: current CLI login exposes only inactive unlinked `DukanKhata`, not a confirmed EdgeTap destination. No remote schema/Auth/Storage changes or deployments occurred. See [SUPABASE_MIGRATION_REPORT.md](SUPABASE_MIGRATION_REPORT.md) for current evidence; source-preservation requirements below are historical and superseded.

# EdgeTap launch report — updated 7 October 2026

**Verdict: NOT READY TO LAUNCH.** The public-profile failure is traced to the billing-gated `(default)` Firestore database. Mandatory receipt uploads also depend on Blaze-only Cloud Storage. Online submission now defaults to paused, with an honest WhatsApp ordering handoff. No production configuration has been changed.

Work is on `launch-readiness`, starting from `main` at `4ce757b`. Existing user edits to `.gitignore` and root screenshot deletions were preserved. Implementation commit: `fa2372a`. Nothing was pushed, deployed, charged or written to production Firebase.

## What was broken and what changed

| Finding | Implemented fix |
|---|---|
| Private-beta badge and ambiguous offer | Explicit physical NFC card, same-profile QR fallback, Rs. 999 per card and separate delivery disclosure |
| Consumer login linked to staff dashboard | Customer `/account` link; staff dashboard requires an allowlisted UID, not merely a signed-in user |
| Rs. 2,499 business tier/enterprise, lifetime hosting, team/attendance/menu claims | Sell the implemented standard profile card only; remove unsupported product/policy promises and the unconfirmed graphic-design service option |
| Unverified business inboxes, pickup and multiple bank/wallet destinations | Confirmed WhatsApp contact and JazzCash only; no advertised pickup or invented courier/refund promises |
| Dead footer/social/legal/company anchors | Actual routes, valid homepage section links and WhatsApp contact |
| Customer card URLs could show founder profile | Dedicated `/profile.html` export shell resolves incoming browser pathname; founder route uses the same resolver; no catch-all homepage rewrite |
| Username availability denied; check-then-write race | Staff can read handle reservations; transaction reads profile, handle and latest order, rejects collisions/stale order state, then creates atomically |
| Weak profile/order authorization and hidden-profile handling | Staff-only creation/reservation/deletion; owner edits restricted to display fields/links; price, quantity, pending payment, account email, upload paths and initial lifecycle enforced |
| Open redirect and untrusted contact URLs | Local profile return paths only; shared scheme validation before submission/save/render; public-profile rule validation |
| Save Contact anchor did nothing | Escaped downloadable vCard; verified download contents |
| Stale preview and stale owner state after logout | Preview uses current draft; editor access derived from current authentication; owner can edit links with ten-link limit |
| Artwork upload requested a forbidden download URL; private files used permanent share links | Store private Storage paths; authenticated staff downloads; owner metadata/read permission; JPEG/PNG/WebP and size limits; old token links kept only for existing staff records pending migration |
| Fulfillment could skip production and QA | Explicit transitions; payment/profile creation through their dedicated actions; payment must be confirmed before profile creation |
| Checkout claimed “Order received” before submission | Honest review state, receipt validation, edit action and submission lock; confirmation follows successful persistence only |
| Ten-link orders exceeded rule-expression limit | Separate efficient draft validation and published-profile validation; ten-link creation/update boundary tests pass |
| Default icon, mismatched domain, absent social/crawler metadata | Confirmed Firebase origin, branded favicon/apple icon/PNG social image, canonical URLs, robots/sitemap and private-route noindex |
| Missing routes served the homepage; raw SDK messages shown to consumers | Real exported 404/error UI; generic customer-safe errors |
| 320px checkout/profile decoration overflow | Clip decorative backgrounds without clipping main content |
| Hidden mobile menu remained keyboard-focusable | Inert closed drawer, focus containment/restoration, Escape and expanded state |
| Existing QA printed success without assertions | Assertive production-export browser suite plus official Firebase rules and actual-service tests |
| Critical installed Next.js advisory | Next.js and ESLint config patched to 16.3.8; safe transitive fixes applied |
| Outdated architecture/provisioning claims | Updated AGENTS.md, README.md, BUILD.md and CLAUDE.md; historical checklists explicitly treated as unverified |

## Intentionally unchanged

- Next.js static export, Firebase architecture, GSAP and existing cream/ink/yellow visual branding. No UI-framework rewrite, payment gateway or new backend.
- Manual JazzCash verification and physical card production/programming/delivery. These are operator responsibilities, not automated features.
- Founder’s personal contact links/photo and existing card-design artwork; no invented customers, reviews or testimonials.
- Legacy internal fulfillment/payment types and unused menu/review illustrations remain for compatibility, but are not advertised as available products. Placeholder testimonial data is removed and its unused component renders nothing.
- Existing tracked historical `.playwright-mcp` logs/snapshots, `.firebase` cache and unrelated planning documents remain in Git. New ignores prevent future additions; these are not in the public export. Their removal/history cleanup is separate repository housekeeping.
- Five lint warnings about `<img>` remain. Images are deliberately unoptimized for static hosting; layouts constrain their dimensions. No Lighthouse, Safari or physical-device performance score is claimed.
- Customer order tracking, automated email, password-recovery UI, retention automation, App Check/rate limiting and per-profile server SEO remain future work. No automatic email notification is promised.

## Security findings

No service-account private key, private PEM key, Stripe secret, GitHub token or AWS access-key pattern was found in inspected current tracked text. `.env.local` remains untracked and its values were not reported. Public Firebase web configuration is embedded in the browser by design; a Firebase API key in a historical `.playwright-mcp/console-2026-09-14T13-43-36-140Z.log` is a project identifier, not proof of a private service credential. This scan does not certify all Git history, external consoles or previously issued upload tokens.

The critical Next.js advisory was fixed. `npm audit fix` also patched compatible transitive packages. Ten high audit entries remain from two root advisories: Node-only gRPC certificate/server-error behavior and development glob-parser denial of service. Neither dependency appears in exported browser chunks, and this deployment serves static files without Node gRPC or `next/og` request endpoints. These are documented development/build dependency risks, not evidence of an exposed production endpoint. Do not use forced major downgrades; reassess before adding a Node server or processing untrusted build inputs. Advisory references: [Next.js](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j), [gRPC](https://github.com/advisories/GHSA-m9gg-hp2v-232j), [glob parsing](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

Private Storage paths now use authenticated downloads. SDK blob download requires bucket CORS; [Firebase’s download guide](https://firebase.google.com/docs/storage/web/download-files) documents that requirement. Existing receipt/artwork download tokens, if any, require an operator migration/revocation review. Old SVG uploads, if any, need inspection too; new uploads only accept raster formats. Do not blindly revoke a token used for a public profile avatar.

The final export contains no `.env` files, diagnostic logs or source maps. Hosting adds nosniff, frame denial, referrer and permissions headers. Robots/noindex controls are indexing preferences; Firebase rules remain the access boundary. App Check, storage budgets, spam prevention and retention need operational attention before scaling.

## Consumer-facing leaks removed

Private-beta wording; fake testimonial data; admin navigation from customer pages; unsupported product tiers/features and popularity claims; dead social/legal links; unverified EdgeTap email inboxes/custom domain; lifetime/forever hosting; pickup location/hours; Raast/Easypaisa/bank instructions; automatic email-update promises; raw customer-visible Firebase exceptions; premature successful-order status. Source comments, internal staff terminology and historical audit evidence are not public product copy.

## Verification results

| Check | Result and limit |
|---|---|
| `npm run lint` | Passed, zero errors, five image warnings |
| `npm run typecheck` | Passed |
| `npm run build -- --webpack` | Passed with Next.js 16.3.8; static export includes marketing, policies, checkout, staff/account, profile shell, robots and sitemap |
| Default Turbopack build | Failed on this machine: sandboxed worker port binding. Google font network access also required escalation. Webpack is the installed Next.js-supported fallback; no code completion is inferred from the failed command |
| Production browser suite | Follow-up: 364 assertions passed in Chromium at 320, 360, 390, 768 and 1440px in paused mode. Prior enabled-mode build passed 374. Screenshots in ignored `test-results/` |
| Browser coverage | Public/staff/account/policy route status; actual 404; canonical/noindex metadata; branded assets; absent leaks/dead anchors; width overflow; mobile drawer/Escape; profile-shell failure without founder flash or raw errors; card/profile/link/preview/delivery steps; honest WhatsApp handoff with no receipt or submit action; actual vCard download. Prior run covered enabled checkout through final review/edit; no production submission |
| Browser console | No unexpected console/page errors in covered flow. Deliberate Firestore network failures and 404 are isolated as expected errors; this does not mean live Firebase is healthy |
| Firebase rules | 57 allow/deny/collision checks passed, including anonymous/private access, staff gate, owner field restrictions, unsafe URLs, ten-link create/update, price/payment/lifecycle injection, upload isolation and SVG rejection |
| Actual service functions | 36 emulator assertions passed: real Auth signup/sign-in, private receipt/artwork uploads, order persistence, customer denial, staff payment confirmation, concurrent profile creation, QR generation, all production steps, owner save/logout, URL/vCard/redirect safeguards |
| Emulator environment | Firebase CLI 15.23.0; temporary Java 21 in `/tmp` because installed Java 20 was unsupported; `demo-edgetap-qa` only. No emulator code/configuration is imported into the production app |
| Read-only live checks | Fresh production browser and configuration reads traced `(default)` billing gate, distinct free-tier `default` deny-all rules, unenforced App Check, old founder fallback and missing-profile Hosting 404. Full evidence below; no production writes |
| Final live-SDK check on local export | Passed: fresh unauthenticated browser using real Firebase shows sanitized profile unavailable within 23 seconds, without founder fallback or raw billing message, after the 15-second wait bound. This verifies error handling, not successful production profile access. Final Terms export assertions also passed |
| Physical/external checks | Not performed: live paid order, real card programming/tap/QR scan, iOS Safari/Android physical-device QA, WhatsApp response, courier fulfillment, live staff/member operations, legacy-file migration or Hosting preview |

The local export server mirrors clean URLs, profile fallback and 404 routing. It is not proof that Firebase Hosting itself applies the rewrite/headers correctly. Final preview-channel testing is required. QR generation returned a PNG for the verified profile destination; a real camera scan is still required.

## Production 403 investigation — 7 October 2026

Read-only production browser and authenticated configuration inspection were performed using the existing Firebase CLI session. No data, rules, deployment, billing or payment settings were changed. Configuration values and credentials were not printed. `scripts/diagnose-live-profile.mjs` reproduces the unauthenticated probes and browser route trace.

| Layer/resource | Observed evidence | Conclusion |
|---|---|---|
| Firebase Hosting `/`, `/u/ibraheem`, `/order` | HTTP 200 in a fresh Chromium context | Hosting serves the existing release; the profile 403 is downstream |
| Browser → Firestore WebChannel | Target is `projects/edgetapflow/databases/(default)`; transport responses can be HTTP 200 | A transport 200 is not proof of a successful document read |
| Unauthenticated REST `.../databases/(default)/documents/profiles/ibraheem` | HTTP 403 `PERMISSION_DENIED`: “This API method requires billing to be enabled.” Same with launch referrer; privileged document read also denied | Exact failing resource: `(default)` database. Billing gate, not a profile rule rejection |
| Cloud Billing project metadata | `billingEnabled: false` | Confirms the owner's Spark state; no activation attempted |
| Firestore database metadata | `(default)`: `freeTier: false`; separate database `default`: `freeTier: true` | App selects the database without free quota; these IDs are different |
| Active `(default)` rule release | Updated 4 October; `/profiles/{username}` has `allow read: if true` | Current denial is not caused by that read rule. Existing deployed rules still need the reviewed security hardening |
| Named `default` database | Public read: 403 “Missing or insufficient permissions.” Active rules dated 14 September: catch-all `allow read, write: if false`. Privileged founder read: 404; bounded order listing empty | A switch alone would fail: safely publish reviewed rules, provision staff and seed/recover verified data first |
| App Check | Firestore, Storage and Auth all `UNENFORCED` | Not the cause; no enforcement disabled during diagnosis |
| Firebase Auth public configuration | HTTP 200, canonical launch host authorized | Not an Auth/referrer problem for public reads; no authenticated production checkout was tested |
| Founder production UI | Displays founder despite failed backend access | Old release falls back to static founder content, masking the failure. Branch already removed this error fallback |
| Production `/u/launch-audit-missing` | HTTP 404 | Old Hosting release does not provide the branch's arbitrary-profile shell; Hosting rewrite release still needed |
| Anonymous Storage listing | HTTP 403 “Permission denied.” | Expected under private/list rules; this alone does not identify a billing denial or prove uploads work |

There is no Cloud Functions import, backend, or functions deployment configuration in the application. A read-only Functions API listing was itself denied; that is **not** proof that the project has zero externally managed functions. The public-profile request uses Firestore directly and does not call Functions or Storage. Existing avatar availability is a separate Storage dependency. A final local export browser check using live Firebase initially remained loading beyond 30 seconds: the SDK retries service failures. `ProfileRoute` now bounds the customer wait at 15 seconds and shows the sanitized unavailable state without substituting founder data.

The previous anonymous order-list 403 also hits billing-gated `(default)` and **does not prove deployed order privacy**. Local rules tests prove the reviewed source denies private reads; production privacy must be rechecked once the chosen database is accessible.

## Firebase dependencies and Spark-compatible path

[Firestore allows one free-quota database per project](https://firebase.google.com/docs/firestore/pricing); [SDKs select `(default)` unless another ID is specified](https://firebase.google.com/docs/firestore/manage-databases). This project's free-quota database is the existing named `default`, according to live metadata. Do not delete either database, create a replacement, or assume inaccessible `(default)` data is empty. Recover/migrate customer data with a reviewed operator procedure when access permits.

`lib/firebase.ts` now supports `NEXT_PUBLIC_FIRESTORE_DATABASE_ID`; absence still selects `(default)` to preserve existing installations. `.env.local` was not edited. `firebase.spark.json` prepares the reviewed rules/index configuration specifically for named `default`; it does not publish anything or alter the free-quota assignment. If using that database, inventory available data, seed verified public profiles, configure staff UIDs, review/deploy its rules, rebuild with `NEXT_PUBLIC_FIRESTORE_DATABASE_ID=default`, then verify unauthenticated profiles and private-data denials. These steps await release authorization. Do not simply relax catch-all rules.

| Feature | Spark / billing requirement | Current status |
|---|---|---|
| Static Firebase Hosting, email/password Auth | Spark supported within quotas | Hosting and public Auth config respond; real login remains to verify |
| Public profiles, owner updates, orders, staff transactions | Firestore free-quota database can support these within quotas | Existing named `default` needs reviewed rules/data; current `(default)` access requires active billing |
| Receipt/custom artwork uploads, hosted avatars, staff downloads | [Cloud Storage for Firebase requires Blaze](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024) | Mandatory online receipt upload is incompatible with current Spark state; cannot fix this by weakening Storage rules |
| Manual JazzCash transfer and WhatsApp order discussion | No Firebase paid service or payment gateway needed | External customer transfer and human verification; end-to-end operational handling not demonstrated |
| Automatic payment processing/webhooks/notifications | Gateway and trusted infrastructure would be needed; Firebase Functions require Blaze | Not implemented or advertised; not required for manual JazzCash handling |

Storage's current requirement applies to the configured `*.firebasestorage.app` bucket; the 3 February 2026 maintenance cutoff specifically also affected legacy `*.appspot.com` buckets. No billing activation, new paid service, bucket migration or gateway integration was attempted. Storage rules' staff lookup currently targets `(default)`; a named-database migration must review the supported cross-service authorization design before re-enabling uploads. The Firestore-only Spark config deliberately excludes Storage.

## Checkout: implemented behavior and blockers

The seven-step wizard is real code, not a fake payment processor. In enabled mode: account signup/sign-in → mandatory private receipt upload (plus optional avatar/artwork) → pending Firestore order → success only after persistence → staff manual JazzCash verification → atomic profile creation → physical production/NFC/QR/dispatch stages. It never sends money, automatically verifies a receipt, quotes final delivery cost or sends email. Preview and uploaded-file previews are local; they are not submitted orders. Emulator tests verify these services, not production payment receipt or courier behavior.

Currently the Storage upload fails the Spark compatibility requirement before an order can be saved; the chosen Firestore database is independently billing-blocked. Delivery fee and total are intentionally null, so a complete quote must be agreed before payment. The user can now prepare selections and open the approved WhatsApp contact; the site explicitly says selections are not submitted. It does not fabricate an order number, successful payment, receipt upload or order acceptance. The operator must collect details, confirm quote/hosting/production terms, verify the JazzCash transfer, record and fulfill the order. That human workflow still needs a controlled customer walkthrough.

`NEXT_PUBLIC_ONLINE_CHECKOUT_ENABLED` defaults to false. This preserves all checkout functionality behind an explicit release setting while hiding receipt/password/payment collection at the payment step and guarding submission. Enable it only after the actual supported infrastructure and real order persistence are verified. A complete no-Storage website checkout (transaction-reference submission plus receipt sharing over WhatsApp, revised schema/rules/staff workflow) would require additional implementation; it has not been invented or declared ready.

## Remaining launch blockers

### TECHNICAL BLOCKERS

- Release the reviewed profile shell, Hosting rewrite, rules and truthful policy/ordering copy when authorized. No deployment is permitted in this task.
- Provision verified public profiles/staff authorization in the chosen database; verify unauthenticated public read, missing/inactive profiles, owner edit and private order/config denial against production.
- Demonstrate a real supported ordering/payment workflow, including operator acceptance, agreed total, JazzCash verification and persistent order record. WhatsApp link opening alone is not completion.
- Verify physical NFC/QR on iPhone and Android; live profile destinations, delivery operations, authenticated downloads/CORS if enabled, legacy tokens and private-data handling remain to check.

### BUSINESS DECISIONS

- Profile hosting duration, update terms/limits/fees and expiry/closure handling.
- Delivery coverage, delivery charges and credible dispatch estimate; communicate and agree these during ordering before payment. No pickup is advertised.
- Cancellation options before production, production-approval procedure and damage/defect claim handling. The personalized-card non-returnability framework is confirmed; no blanket 30-day refund or automatic remedy for customer-supplied errors is offered.

### BILLING/INFRASTRUCTURE BLOCKERS

- Billing is inactive. Current `(default)` database is not free-tier and returns a billing-required 403. Existing named `default` is free-tier but deny-all/unseeded for the founder. Choose and execute a reviewed data/rules setup without deleting inaccessible data.
- Mandatory website receipt uploads and optional artwork/avatars use Blaze-only Cloud Storage. Keep online collection paused until an explicitly approved infrastructure path works. No billing/payment-method changes or charges are authorized.

### LEGAL/POLICY REVIEW

- Personalized-card terms are an owner-directed business-policy draft, not a legal compliance opinion. Qualified Pakistan counsel must check applicable provincial/jurisdictional consumer rights, mandatory remedies and how the policy is disclosed before payment. [Punjab's official Consumer Protection Act publication](https://pccmdpunjab.gov.pk/custom/mateen/pdf/ruleregulation/20-Punjab%20Consumer%20Protection%20Act%202005.pdf) contains return/refund disclosure and consumer-remedy provisions; it does not establish which law applies to every EdgeTap sale or validate a blanket personalized-product exemption.
- Review cancellation/production approval, evidence/claim process, customer-error treatment, order receipts, business identification and privacy retention/deletion. Do not treat “except where required by law” as proof of legal compliance.

## Customer launch acceptance checklist

| Required customer outcome | Current evidence / remaining condition |
|---|---|
| Visit production | Production homepage HTTP 200 |
| Understand the product | Branch copy explains physical NFC card, QR fallback and internet/phone requirements; reviewed release still pending |
| View a public example/profile | Founder displays static fallback in old production; live Firestore read fails. Genuine unauthenticated backend success required |
| Understand pricing | Rs. 999 physical card; total delivery quote still must be agreed |
| Start a real order | Branch links to approved WhatsApp and preserves selections without claiming submission; production release pending |
| Complete supported payment/order | Manual JazzCash + operator acceptance/record/verification needs a controlled walkthrough. Website submission paused |
| Understand delivery expectations | Coverage, fee and dispatch estimate confirmed during ordering; owner must settle operational terms |
| Understand personalized-card policy | Branch Terms, FAQ and payment/handoff copy updated; legal review and production release pending |

All eight must pass before declaring launch readiness. Also complete physical-device responsiveness/accessibility and NFC/QR checks, staff/customer authorization checks and private-file migration/CORS checks where relevant. No production order, transfer, deployment, billing activation or push was performed.

## Release procedure — deferred, not authorization

1. Preserve and review the `launch-readiness` changes and record existing Hosting/rules releases. Do not deploy or push under this task.
2. Resolve the database/data path and Storage incompatibility first. Never enable billing/services or incur charges merely to make tests pass. Keep `NEXT_PUBLIC_ONLINE_CHECKOUT_ENABLED=false` until actual uploads and order persistence work.
3. For a reviewed Firestore-only Spark path, use `firebase.spark.json` for the existing named `default` and `NEXT_PUBLIC_FIRESTORE_DATABASE_ID=default` for the build, after staff/profile data and safe rules are prepared. Current `firebase.json` still preserves the original `(default)` deployment target. No data migration was executed.
4. Build/lint/typecheck, run the demo-only rules/services tests and export browser QA. After separate release authorization, test Hosting routing and live read-only probes, then a controlled order without sending funds merely for testing. If Storage is ever enabled, separately review database-dependent staff authorization, CORS and legacy tokens.
5. Record all eight customer acceptance outcomes, physical-card checks and legal/policy sign-off before production publication. Keep rollback plans for Hosting and separately reviewed data/rules changes.

## Business decisions for the owner

- Hosting duration and update terms/fees.
- Delivery coverage, fee and dispatch estimate.
- Cancellation before production and the production approval/defect-claim process.

**NOT READY TO LAUNCH.** Production profile access and website checkout remain blocked; the safe source fixes and documented Spark path have not been deployed.

## Supabase implementation status — 7 October 2026

**Still NOT READY TO LAUNCH.** After owner approval, the branch contains an additive Supabase implementation and offline migration safeguards. Firebase is retained/default-selected; online checkout remains paused in normal configuration. No source data or production services were modified, no target project was provisioned/applied, no billing was enabled and nothing was deployed or pushed. See [SUPABASE_MIGRATION_REPORT.md](SUPABASE_MIGRATION_REPORT.md) for implementation evidence and [supabase/README.md](supabase/README.md) for the guarded procedure.

The local schema separates public profile display from private ownership, contacts, drafts, receipts, staff and provenance. Database RPCs control ownership/pricing/status and atomic payment/publication/fulfillment; anon visitors get one active public profile without customer/owner/payment data. Bucket policies protect artwork/receipts/quarantine; only avatars are public. Auth adapters handle session restoration, confirmation-required signup and a static recovery route. Original Firestore helpers/rules remain available; backend selection is explicit and missing/privileged Supabase build configuration is rejected before bundling.

Verification: TypeScript and both backend build selections passed; lint has zero errors/five existing image warnings. The Firebase-selected responsive suite passed 364 assertions. Twenty local SQL/RLS checks and configuration security checks passed. Offline migration fixtures preserve original IDs, relationships, source timestamps, null totals, legacy payment/product states, history and unknown fields; imports refuse populated destinations and incomplete/unresolved input. Fifteen Supabase browser checks passed through customer editing/pending submission, staff receipt download/manual verification/publication, QR, anonymous access/private denial and session-bound recovery. Browser Auth/Storage HTTP is simulated around actual local SQL/RLS. Real SMTP, Storage gateway constraints/CORS, hosted PostgREST/JWT behavior and funds remain unverified.

### TECHNICAL BLOCKERS

- Obtain a complete source export/backup and reconcile all original IDs, owners, handles, contacts, payments, histories and objects. Firestore counts are unknown, not zero.
- Preserve the existing Auth account's state and map its Firebase UID to the real Supabase UUID. Choose/test existing-user password continuity or verified recovery; no automatic account promotion or recovery emails were performed.
- Verify target anonymous profile access and private denials, owner/staff sessions, confirmation/recovery URLs/email delivery, uploads/downloads, actual pending-order persistence, manual JazzCash acceptance and physical NFC/QR/production/dispatch.
- Reconcile refreshed-tab submission recovery, final snapshot/delta/write freeze and rollback before publication. The implemented request key protects component retries; it is not a claim that a new tab can safely resubmit an uncertain existing order.

### BUSINESS DECISIONS

Delivery coverage/fee/dispatch estimate; digital hosting duration/update terms; cancellation before production and print-approval/defect-claim procedure.

### BILLING/INFRASTRUCTURE BLOCKERS

Destination Supabase configuration/operator access remains missing. `(default)` Firestore and all four Storage object byte probes remain HTTP 403; source restoration or an existing backup is necessary. The named `default` database is verified empty and cannot stand in for blocked data. One Auth user, four `avatarInbox` objects (1,163,992 bytes) and unknown Firestore records must be preserved. No Supabase paid service has been selected. Configure actual capacity/region/Auth email settings; retain Firebase Hosting/canonical domain during the backend migration.

### LEGAL/POLICY REVIEW

Personalized-card policy review remains required. Review processor/region/privacy retention and account migration/recovery disclosures against the actual destination before cutover; no legal compliance or hosting/delivery guarantee has been invented.

No production deployment or customer-data migration is claimed. The outstanding source/destination access requests are necessary to finish, not permission to delete/disable Firebase or incur charges.

## Current hosted Supabase launch state — 7 October 2026

The ONLY approved project `dxyxvervvlxhwwbcbttd` (Edgetap, ACTIVE_HEALTHY, region ap-southeast-2) passed clean inspection and guard. Six migrations were applied after reviewed dry runs, including additive dot-path handle safeguards; no seeds/role overwrites/reset/deletion. Hosted state: 11 public + 6 private tables, all 17 RLS-enabled, 31 indexes, 18 public RPCs/8 private helpers, 14 public/2 Storage policies and four buckets. No accounts/customers/orders/profiles/payments/reviews/staff/assets were created. Firebase test data is permanently waived and untouched; DukanKhata/billing/production Hosting are unchanged.

LOCAL VERIFIED: typecheck, lint (zero errors/five image warnings), real-config static export and 24 SQL/RLS regressions. Responsive suite passed 364 assertions. Updated 21 integration browser checks with local SQL/simulated Auth/Storage include standalone signup without a dummy order; these remain local evidence. The final real-config export has no privileged credentials or fixture URL/key matches.

HOSTED VERIFIED: correct project/clean bootstrap/schema/grants/buckets/history; 21 HTTP permission/Auth/JWKS checks; negative hosted PostgreSQL role/RPC probes without fixtures; ten fresh anonymous browser checks from local real-config export to actual hosted Supabase, with no interception or Firebase data-service requests. Missing profiles return null/render missing. Auth production Site URL/callbacks/minimum password configured by reviewed three-property diff; confirmations/signup enabled, anonymous sign-in disabled. No real signup/email/login, owner editing, existing private bytes, authorized staff/order/payment/publication or physical card success is claimed.

### TECHNICAL BLOCKERS

Approved real mailbox/signup/confirmation/recovery/password-session verification; deliberate verified real staff UUID enrollment; real avatar/artwork/receipt and existing-file private denial; successful order/quote/manual JazzCash/profile publication/owner edit/handle-concurrency/fulfillment walkthrough using approved actual operational data or a separately approved test destination. Publish an approved real public example; check NFC/QR on physical devices. Online checkout remains paused. Production callbacks still lead to the old Firebase frontend until separately approved release/preview or a reviewed testing callback arrangement. See [SUPABASE_MIGRATION_REPORT.md](SUPABASE_MIGRATION_REPORT.md).

### BUSINESS DECISIONS

Delivery coverage/fee/dispatch; digital-profile hosting/update terms; cancellation before printing, print-detail approval and defect handling. Specific delivery/full-price terms are agreed during ordering; no delivery fee/time is invented.

### BILLING/INFRASTRUCTURE BLOCKERS

Verified custom SMTP sender/provider and actual email delivery; rotation of the secret key shared in chat (not saved/used by the app); separate approval for website release/Hosting/device checks. Correct destination/public configuration are resolved. No paid plan/add-on/payment method was enabled or changed. Firebase recovery/Blaze is permanently waived; Firebase Hosting/domain remain.

### LEGAL/POLICY REVIEW

Review owner-directed personalized-card cancellation/remedies and actual Supabase processing region/privacy/retention and pre-payment disclosures. No compliance claim is invented. **NOT READY TO LAUNCH** until all eight real customer acceptance outcomes are demonstrated.
