> **Confirmed product/fulfillment update — 7 October 2026:** All designs are PVC/NFC, 85.60 × 53.98 mm; Wood is printed artwork. Staff manually prepares final designs. Every personalized card requires an emailed proof with a 10-hour reply window starting only after real sending. SMTP is pending; printing stays held. NASTP Delta 3 pickup: Mon–Fri 9 am–5 pm, contact +92 304 414 9674 after arrival once ready. Delivery costs extra, paid directly to the rider; staff records the actual booked fare/message. Hosting and updates have no separate fee for now. **007–009 are local only; hosted remains 001–006.** See [BUSINESS_CONFIGURATION.md](BUSINESS_CONFIGURATION.md). Earlier conflicting claims below are historical and superseded. Launch remains on hold.

# Latest application workflow update — 7 October 2026

Hosted remains **001–006**. Local **007–009** implement private drafts/review/customer and admin workflows, fixed PVC/NFC size, manually prepared private final artwork, every-personalized-card email proof/ten-hour printing gate, direct rider fares/messages and confirmed NASTP collection details. No hosted schema/user/file/order/SMTP/billing/Firebase/DukanKhata change, deployment or push occurs in this follow-up.

LOCAL VERIFIED: 53 SQL/RLS/administration cases; 67 complete workflow browser checks (actual local PostgreSQL/RLS, simulated Auth/Storage/transport acknowledgement); 344 responsive assertions; typecheck, real-config export, lint zero errors/six existing image warnings and offline migration preservation. No actual email, transfer or hosted workflow success is inferred.

HOSTED VERIFIED: earlier foundation only, 21 read-only API and 12 anonymous browser checks. Intended admin **sardaribraheem277@gmail.com** was absent at last read-only inspection; no new account inspection or enrollment claimed. Real signup/confirmation/login/recovery/private file/order/staff/publication success remains pending. SMTP/sender/real proof worker are pending; queues are not sent email. No fake public example is created.

Current blockers/configuration: [LAUNCH_REPORT.md](LAUNCH_REPORT.md), [ORDER_WORKFLOW_REPORT.md](ORDER_WORKFLOW_REPORT.md), [BUSINESS_CONFIGURATION.md](BUSINESS_CONFIGURATION.md). The prior setup evidence below concerns applied 001–006; its earlier pending business statements and paused checkout describe historical states.

---

# EdgeTap hosted Supabase setup — 7 October 2026

**Hosted foundation configured and verified. EdgeTap is NOT READY TO LAUNCH: real account/email, authorized staff/customer operations, physical card checks and website release remain.** Work remains on `launch-readiness`; nothing was deployed or pushed. Firebase and DukanKhata remain untouched; no billing/payment method, paid project/add-on, reset or deletion was performed.

## Destination and clean start

The owner approved ONLY `https://dxyxvervvlxhwwbcbttd.supabase.co`. Existing CLI login confirmed reference `dxyxvervvlxhwwbcbttd`, project name **Edgetap**, status **ACTIVE_HEALTHY**, region **ap-southeast-2**, PostgreSQL **17.11**. `supabase/project.json` records this public destination; setup/hosted-check scripts reject another reference. The linked project cache matches this exact reference. DukanKhata was not linked, resumed or modified.

Inspection before applying found only Supabase's standard schemas, with no custom public/private tables/functions/policies, no private schema, zero Auth users and no Storage buckets/objects. The clean-target guard passed. No existing Supabase data was cleared or overwritten.

**Firebase test data was intentionally NOT migrated.** Source Firestore records, the old test Auth identity/password and four legacy images are permanently waived and remain untouched. No Firebase extraction/recovery/download/bypass was attempted. Production Supabase starts clean: zero Auth users, staff memberships, customers, profiles, orders, payments, reviews and Storage objects. The sole `ibraheem` handle reservation has no profile attached; this is real-handle configuration, not a fake account/profile.

## Applied and configured

The existing inspector needed two installed-CLI corrections: `db query` requires `--linked` with an explicit project reference, and its Management API returns only the last result set. Inspection now aggregates every metadata/count section into a single JSON result; full clean inspection completed before application. The setup script checks the actual linked reference before pushing.

Exact executed sequence: `--inspect`; clean-target SQL guard; explicit project link; `supabase db push --dry-run`; `supabase db push`; clean-bootstrap verification. Dry run showed ONLY the five expected migrations, with empty seed/role lists. An additional reviewed dry run then applied only `202610070006_profile_handle_paths.sql`, rejecting browser-normalized dot handles without changing records. Final migration history confirms `202610070001` through `202610070006`. No reset, destructive diff/import, seed or role overwrite was used.

| Hosted object | Verified state |
|---|---|
| Application tables | 11 public + 6 private, all 17 with RLS enabled |
| Indexes / constraints | 31 indexes; 19 foreign keys, 17 primary keys, 7 uniqueness constraints, 45 checks; zero unvalidated constraints |
| Functions | 18 public RPCs + 8 private helpers; controlled grants and empty search paths verified |
| Policies | 14 public SELECT policies + 2 Storage policies; private tables have no client grants/policies |
| Accounts/business records/assets | All zero after setup and probes; no fake production fixtures |
| Public access | Exact active-profile/review RPC only; anonymous base-table and staff/mutation access denied |
| Private schema | Data API returns HTTP 406 `PGRST106`; app roles have no schema usage |
| Payment/order control | Server card price 99900 paisa; account-bound idempotency/recovery; staff quote required before manual confirmation; paid quotes cannot change; payment/publication/fulfillment gated |

Money, contact/profile draft snapshots, ownership, handles, order/payment/fulfillment relationships and original ID/provenance support remain in the reviewed relational model. No Firebase source import is needed for these new production relationships.

| Storage bucket | Visibility | Limit | MIME types |
|---|---|---|---|
| avatars | Public bytes | 5 MB | JPEG/PNG/WebP |
| order-artwork | Private | 25 MB | JPEG/PNG/WebP |
| payment-receipts | Private | 8 MB | JPEG/PNG/WebP |
| migration-quarantine | Private, empty | 25 MB | JPEG/PNG/WebP |

Account-owned UUID paths are required for new uploads; no app overwrite/delete/upsert. Artwork/receipts use authenticated downloads, not permanent public URLs. Existing-object byte isolation cannot be demonstrated with an empty project; it still needs an approved real asset/account or separate explicitly approved test environment. Avatar bytes remain public before publication/after hiding.

## Auth and application configuration

A protected temporary workdir pulled the actual hosted configuration. The original Site URL was `http://localhost:3000`, callbacks empty, password minimum six. A minimal declared-property diff then changed ONLY:

- Site URL to `https://edgetapflow.web.app`.
- Redirects to `https://edgetapflow.web.app/account` and `/account/recovery`.
- Password minimum to eight.

Email provider/signup/confirmation were already enabled; anonymous signup already disabled and stay so. Actual public Auth settings confirm these booleans. CLI push reports exactly three changed properties and ten undeclared remote properties left unchanged, including existing MFA/Storage/platform settings. The subsequent declared-property diff is empty. `supabase/config.production.toml` records only intended Auth properties; the full LOCAL development config was not blindly pushed. No sender, SMTP credential, provider, email recipient, automatic administrator or invented customer identity was configured.

Auth health and JWKS return HTTP 200; JWKS has one ES256 signing key. These prove service availability/configuration, not real password login/email recovery. No custom SMTP configuration was returned by the configuration pull, and no SMTP provider credentials were available locally. [Supabase's default SMTP](https://supabase.com/docs/guides/auth/auth-smtp) restricts delivery to project-team addresses; commercial signup/recovery needs a verified sender/service and actual email testing.

`.env.local` now contains the REAL PUBLIC Supabase URL/publishable key, explicit Supabase backend, canonical app URL and paused checkout flag. Existing Firebase values remain intact. The file is ignored and mode 0600. The app requires no Supabase secret key/database password; the secret pasted in chat was not used or saved and should be rotated in the Supabase dashboard. No privileged credential was committed or baked into browser assets.

The account page now supports standalone signup as well as login/recovery, so the first real account can register without a dummy order or enabling checkout. Confirmation-required signup clearly reports no order/profile creation and clears the password. Registration never grants staff membership.

Profile handles `.` and `..` are rejected by database constraints, handle availability and URL helpers; browsers would normalize them into a different destination. Existing valid handles retain their canonical path.

The final local production export uses real public configuration, no test fixture URL/key, and `NEXT_PUBLIC_ONLINE_CHECKOUT_ENABLED=false`. Firebase Hosting and NFC/QR URL structure remain `https://edgetapflow.web.app/u/<handle>`. Production still serves its previous Firebase-backed release because deployment is prohibited.

## LOCAL VERIFIED

| Check | Evidence / limit |
|---|---|
| Typecheck | Passed |
| Lint | Zero errors; five existing image warnings |
| Real-config production static export | Passed using `npm run build -- --webpack`, with actual EdgeTap public URL/key and paused checkout; the sandboxed default build initially failed fetching Google Fonts, then the network-enabled webpack build passed |
| PostgreSQL/RLS/RPC regressions | 24 local checks plus clean-bootstrap/overwrite guard passed: account-owned uploads, server price/status, retries/recovery, private staff gates, agreed quote, manual confirmation, handle uniqueness/reservation and dot-path URL rejection, publication, bounded owner updates and revocation |
| Local integration browser suite | 21 checks passed, including standalone confirmation-required signup without an order, alongside the previous order/owner/staff flow; fixture Auth/Storage HTTP remains simulated |
| Responsive suite | 364 assertions passed at 320/360/390/768/1440 px on the real-config export; its backend-failure regression deliberately intercepts requests |
| Export credential/fixture scan | 116 text assets checked: zero matching privileged credentials and zero fixture URL/key matches |

Local fixture tests prove application/SQL paths with controlled data. They do not prove hosted email, valid customer JWTs, existing private-byte access or an actual JazzCash transfer. No local fixture was sent to production.

## HOSTED VERIFIED

1. Correct active project, clean preflight, all six migrations and history, schema/RLS/function grants/indexes/buckets, and clean post-setup counts.
2. **21 actual HTTP API checks** with the public key: absent exact-profile lookup returns null, reviews empty; anonymous orders/staff/receipt/order creation/quote/payment/owner update/publication/table enumeration denied; private schema excluded; malformed JWT rejected; public Auth settings/JWKS accessible; absent private objects fail through public URL endpoints. These last absent-object failures do not prove existing-object byte isolation.
3. Actual PostgreSQL role/RPC boundary probes passed without fixtures: anonymous base/private table and mutations denied; unenrolled/sessionless role cannot promote through metadata, create orders, manage handles, edit profiles, confirm payment, publish or fetch receipts. The profile RPC uses a row lock, so probes run in a rollback transaction, with no records inserted or writes authorized. This is SQL role simulation, not a real authenticated customer login.
4. **10 fresh anonymous browser checks** with the locally served REAL-config export reaching REAL hosted Supabase, without interception: marketing/pricing, exact profile requests, missing-profile rendering without fake fallback, account/staff/recovery UI guards, privacy and actual browser-to-Supabase CORS. No Firebase data-service requests or unexpected console/page errors occurred.
5. Auth health/settings/JWKS and the reviewed production callback/password configuration. Final clean-bootstrap check still passes after probes.

Successful public-profile rendering is intentionally unverified: there is no production profile. `/u/ibraheem` correctly displays “Profile not found” in the local new build. Do not confuse this with a demonstrated real public example. The public deployed website remains old; its historical Firestore 403 is not repaired until the separately approved application release.

Commands: `npm run check:supabase:hosted`; `npm run test:supabase:hosted-browser` (local export server required); `supabase db query --linked --project-ref dxyxvervvlxhwwbcbttd --file supabase/test-hosted-boundaries.sql`. These do not create a user/order/profile/file or send email. Do not run the clean initializer again against the now-initialized target; inspect migration history and use reviewed additive forward migrations for future changes.

## REMAINING BLOCKERS — TECHNICAL

- An approved REAL account/mailbox is required for actual signup, delivered confirmation, password login/logout/refresh and email recovery. No fake account was created. The owner has been asked for the intended first real staff email and existing SMTP provider/protected config. No email/invite was sent without that information.
- After real normal registration/confirmation, an operator must verify the exact user UUID and deliberately enroll `private.admin_members` with truthful owner-authorization provenance. No first-user/metadata/legacy-account promotion occurs automatically.
- Test successful owner editing, handle races, real owned avatar/artwork/receipt uploads, unrelated-user/anonymous existing-file denial, interrupted order submission, agreed quote/manual JazzCash verification, profile publication and sequential fulfillment using real authorized operational data or a separately approved test destination. No fake production order/profile/payment/review will be created to simulate success. These success paths remain LOCAL VERIFIED only.
- Publish an approved real owner/example profile; verify anonymous rendering and canonical QR URL, then actual NFC/camera/device behavior. A real customer/order walkthrough and actual manual payment handling remain.
- Production Auth callbacks target the canonical production site, which still serves the old Firebase client. A local browser can test hosted unauthenticated APIs; the full confirmation/recovery redirect UX needs the approved new frontend release/preview or an explicitly reviewed testing callback arrangement. No preview/deployment was created.
- Keep checkout paused until actual supported account/upload/order/payment/fulfillment checks pass. WhatsApp remains the honest order-start flow, with delivery/full-price terms agreed before transferring to the approved JazzCash account.

## REMAINING BLOCKERS — BUSINESS DECISIONS

- Delivery coverage, fee and dispatch estimate.
- Digital-profile hosting duration and update terms.
- Cancellation before production, print-detail approval and defect-claim handling process.

## REMAINING BLOCKERS — BILLING / INFRASTRUCTURE

- Verified custom SMTP sender/provider and appropriate email rate limits/delivery tests. No sender email/domain/provider purchase is invented. Secret-key rotation after its disclosure in chat; do not put a replacement secret in client configuration.
- Separate approval for website release, verified build/Hosting preview or controlled callback testing, and physical-device QA. The correct destination and public configuration are no longer blockers. No Supabase billing/add-on/payment method was enabled or changed.
- Firebase extraction/Blaze restrictions remain permanently waived for this setup. Firebase Hosting/domain still serve the site; leave all Firebase services/data intact. Do not assume the old billing-gated Firebase data layer is a functioning rollback for new Supabase records.

## REMAINING BLOCKERS — LEGAL / POLICY REVIEW

Review the personalized-card cancellation/remedy disclosures and actual Supabase processing region `ap-southeast-2`, privacy/retention and pre-payment terms. No legal-compliance certification, blanket refund, customer-error remedy, lifetime hosting or delivery guarantee is invented.

## Between this state and launch

Configure/test real email → register/confirm and deliberately authorize the real staff account → create/verify an approved real public profile and actual supported order/payment/Storage/owner workflow → settle business terms/legal/privacy review → verify physical NFC/QR/mobile devices → obtain separate release approval, rebuild with this real public configuration and reviewed checkout flag, then verify Hosting routing/headers and the eight real customer acceptance outcomes. **Do not mark READY TO LAUNCH before those outcomes are demonstrated.** Firebase helpers/package/rules can be considered for later removal only after successful cutover and an explicit rollback decision; nothing is removed now.
