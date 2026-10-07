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
