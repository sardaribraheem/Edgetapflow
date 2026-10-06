# EdgeTap launch report — 6 October 2026

**Verdict: NOT READY TO LAUNCH.** The repository is substantially improved and local verification passes. Public Firebase profile reads still fail, live release/physical-card verification remains outstanding, and three commercial policies are undecided.

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
| Production browser suite | 374 assertions passed in Chromium at 320, 360, 390, 768 and 1440px; screenshots in ignored `test-results/`; reviewed mobile homepage, desktop pricing and narrow checkout images |
| Browser coverage | Public/staff/account/policy route status; actual 404; canonical/noindex metadata; branded assets; absent leaks/dead anchors; width overflow; mobile drawer/Escape; profile-shell failure without founder flash or raw errors; all checkout steps through final review/edit; invalid name/link/account/receipt; actual vCard download |
| Browser console | No unexpected console/page errors in covered flow. Deliberate Firestore network failures and 404 are isolated as expected errors; this does not mean live Firebase is healthy |
| Firebase rules | 57 allow/deny/collision checks passed, including anonymous/private access, staff gate, owner field restrictions, unsafe URLs, ten-link create/update, price/payment/lifecycle injection, upload isolation and SVG rejection |
| Actual service functions | 36 emulator assertions passed: real Auth signup/sign-in, private receipt/artwork uploads, order persistence, customer denial, staff payment confirmation, concurrent profile creation, QR generation, all production steps, owner save/logout, URL/vCard/redirect safeguards |
| Emulator environment | Firebase CLI 15.23.0; temporary Java 21 in `/tmp` because installed Java 20 was unsupported; `demo-edgetap-qa` only. No emulator code/configuration is imported into the production app |
| Read-only live checks | Auth configuration HTTP 200 and launch host authorized; public founder Firestore read HTTP 403 PERMISSION_DENIED even with the confirmed launch referrer; anonymous order and Storage listing HTTP 403 |
| Physical/external checks | Not performed: live paid order, real card programming/tap/QR scan, iOS Safari/Android physical-device QA, WhatsApp response, courier fulfillment, live staff/member operations, legacy-file migration or Hosting preview |

The local export server mirrors clean URLs, profile fallback and 404 routing. It is not proof that Firebase Hosting itself applies the rewrite/headers correctly. Final preview-channel testing is required. QR generation returned a PNG for the verified profile destination; a real camera scan is still required.

## Remaining launch blockers

1. **Live Firebase/release verification:** public founder read currently returns HTTP 403. Identify whether deployed rules, project/database/API configuration or API-key restrictions cause this; publish reviewed rules, provision authorized staff and verify real customer Auth, Storage, order, profile and owner-edit operations. Confirm Storage CORS and any legacy upload migration. Then verify Firebase Hosting preview and a programmed physical NFC/QR card.
2. **Hosting/update terms:** duration included with the Rs. 999 card, update limits/fees and what happens on expiry or service closure.
3. **Delivery terms:** supported Pakistan locations, delivery charge/quotation process and dispatch expectations communicated before payment. No pickup offer is confirmed.
4. **Returns/refunds:** eligibility, cancellation and damaged/misprinted-card handling, process and customer-facing policy. Finalize order/privacy terms with the actual operating practices, including retention/deletion.

## Final manual QA checklist

- Confirm the three policies below and update pricing, FAQ, terms/privacy and checkout consistently. Have one person outside the project explain what Rs. 999 buys and the complete delivered cost.
- Open the production preview on an actual iPhone and Android phone. Check navigation, text, quantity, uploads, keyboard, login, edit/logout, focus visibility and error recovery.
- With an approved QA account, place a controlled order (do not send funds merely to test). Ensure the UI confirms only after Firestore persistence and retains its order number. Check the address/receipt is not available anonymously or to a second customer.
- Confirm staff authorization; unauthorized customer must not enter the dashboard or read orders. Complete manual payment confirmation and profile creation; try duplicate username and stale order actions.
- Verify new custom-art/receipt authenticated downloads and bucket CORS in a browser. Check legacy token links and file types before retaining them.
- Program an actual NFC card with the final profile URL. Print/scan the generated QR on both phones and ensure identical customer identity. Update that profile, retap/rescan and download its contact file; verify links, then logout.
- Test unknown/inactive profile, backend failure, invalid credentials, upload rejection and an unknown site route. Check no founder profile appears for another handle.
- Check share previews and branded icons, support WhatsApp availability, payment recipient/account and complete delivery quote. Confirm no unapproved business promises or emails remain.

## Exact deployment/release steps

These are reviewable operator steps, not actions already performed. Do not publish before the blockers are resolved.

1. Review the `launch-readiness` diff. Preserve pre-existing user work and inspect changes to Firebase rules, routing and policies. Record the previous Hosting release and export backup before replacing it.
2. In the Firebase Console for project `edgetapflow`, verify the `(default)` Firestore database is active, the configured Storage bucket exists, Email/Password Authentication is enabled, and the launch domain is authorized. Enable required billing/services if the Console actually requests them; historical docs are not current billing evidence. Check public API-key HTTP-referrer restrictions support the launch host.
3. Create/confirm staff accounts through the trusted Console. Set `config/admin_uids` to `{ uids: [<approved staff Firebase UID>, ...] }` using privileged access. Do not expose credentials or broaden rules to make the app work. Seed/validate `profiles/ibraheem` with the actual founder content and approved owner UID. Review any existing profile/handle reservations and legacy orders/uploads before changing rules.
4. Confirm the exact bucket name from `.env.local` without copying it to public reports. For authenticated staff blob downloads, apply `storage.cors.json` to that bucket with `gcloud storage buckets update gs://<configured-bucket> --cors-file=storage.cors.json`. Add a temporary exact preview origin only if testing authenticated downloads there; remove it after QA. Enable the Storage rules service agent's Firestore access if Firebase's deployment prompt requires it.
5. After rule review and console readiness, deploy rules and indexes:

   ```sh
   firebase deploy --only firestore:rules,firestore:indexes,storage --project edgetapflow
   ```

6. Supply real public web configuration in `.env.local` or CI; set `NEXT_PUBLIC_APP_URL=https://edgetapflow.web.app`. Install and verify:

   ```sh
   npm ci
   npm run lint
   npm run typecheck
   npm run test:rules
   npm run build -- --webpack
   ```

   Rules tests require Java 21+ and Firebase CLI. For local production QA, in separate terminals:

   ```sh
   PORT=4173 npm run serve:qa
   QA_BASE_URL=http://127.0.0.1:4173 npm run test:browser
   ```

7. Check the read-only probes again with `node scripts/check-live-services.mjs`: the public founder must become readable and private lists must remain denied. This still does not replace a real authenticated order/fulfillment test.
8. Create a Hosting preview (publishes preview assets; obtain release approval when ready):

   ```sh
   firebase hosting:channel:deploy launch-qa --expires 7d --project edgetapflow
   ```

   Test arbitrary `/u/<handle>` deep links/reloads, missing routes, metadata/headers and the manual checklist. Keep actual NFC/QR destinations on the canonical launch origin, not a preview URL. Auth/upload preview tests need the preview origin explicitly authorized; do not substitute permissive domains/CORS.
9. After policies and end-to-end QA pass, publish the reviewed build:

   ```sh
   firebase deploy --only hosting --project edgetapflow
   ```

   Recheck the actual launch origin, the programmed card, staff/customer operations, private-data denials and support. If failures appear, restore the recorded previous Hosting version through the Console; rules/data rollback requires its own reviewed migration, not a blind restoration.

## Business decisions for the owner

- What profile hosting and update service is included, for how long, and with what later fees/limits?
- Which Pakistan locations can you deliver to, how are charges confirmed, and what dispatch expectations can you support?
- What are the cancellation, return, refund and defective-card replacement terms?

**NOT READY TO LAUNCH** — remaining blockers are live Firebase/release/physical-card verification and those three policy decisions.
