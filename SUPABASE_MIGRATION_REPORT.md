# Supabase clean production setup — 7 October 2026

**Status: local application/schema prepared and verified; hosted setup awaits the correct destination. EdgeTap is NOT READY TO LAUNCH.** Work remains on `launch-readiness`. Nothing was deployed or pushed. Firebase services, users, data, rules, objects, billing and Hosting remain untouched.

## Clean-start decision

The owner explicitly classified existing Firebase Firestore records, the Firebase Auth user and all four legacy `avatarInbox` objects as disposable test data. **Firebase test data was intentionally NOT migrated.** Their inaccessible bytes/records are no longer migration blockers. No recovery, download, permission bypass, deletion or further Firebase extraction was attempted in this continuation.

Supabase production is intended to start clean, with NEW accounts only. Local bootstrap verification proves the migrations create no users, customers, profiles, orders, payments, reviews or Storage objects. The real reserved `ibraheem` handle and four bucket definitions are configuration, not fabricated business records. Hosted cleanliness is not claimed because no EdgeTap destination is selected yet. Offline legacy extraction/normalization tools remain available but are not part of this clean setup.

## Destination inspection actually performed

In this continuation on 7 October 2026, the installed Supabase CLI was version 2.117.0. Existing terminal login works. `supabase projects list --output json` returned exactly one accessible, unlinked project:

| Name | Reference | Status | Region |
|---|---|---|---|
| DukanKhata | `ondgpbyqxynitwfyfpdz` | INACTIVE | ap-southeast-1 |

No EdgeTap project, project link, public Supabase URL/key or operator database configuration exists in this repository/process environment. `.env.local` still contains only the original six public Firebase variables and was not changed. CLI login is not equivalent to an application project/key configuration.

The unrelated inactive project was not resumed, linked, inspected for customer records or modified. The owner has been asked for the correct EdgeTap project reference or explicit reuse confirmation. No Supabase schema, bucket, Auth account, staff membership or Auth dashboard setting has been changed remotely. No plan/add-on, project provisioning or billing action was taken.

## Configured locally

- Supabase is now the application's default data backend. Missing public configuration fails the build before bundling; there is no silent Firebase fallback. Explicit Firebase selection remains available for legacy development. The original Firebase helpers/rules/config/package remain intact.
- Five additive SQL migrations implement customers, profiles, ordered links, unique handle reservations, orders/contact/draft snapshots, payments, fulfillment history and reviews, with protected ownership/staff/provenance tables. Money is integer paisa; new cards cost 99900 paisa each; delivery fee and total remain null until agreed and entered by staff.
- RLS and narrow security-definer RPCs control exact public lookup, owner updates, staff reads, atomic/idempotent order submission, versioned quote, manual JazzCash verification, profile publication and sequential fulfillment. Staff membership is private operator-controlled data; signup/user metadata cannot promote an account. Unique profile/handle constraints prevent duplicate handles and NFC misrouting.
- Payment confirmation now requires an explicitly recorded agreed delivery fee and complete total. Zero is allowed only when entered. Verified payment quotes cannot subsequently change. Staff UI exposes this quote action and disables confirmation until a quote exists. No gateway, delivery fee or automatic payment claim was invented.
- Order refresh reconciliation uses an account-bound RPC and a tab-scoped marker containing only account UUID/request UUID. A lost response followed by refresh recovers the persisted order number/status without creating another order. Unknown results remain blocked for recheck/support; the app does not fabricate success or automatically abandon an ambiguous submission. Passwords/contact details/files are not stored in the marker. Tab closure/new-device reconciliation remains an operational support case.
- Supabase Auth handles new signup/password login/logout/confirmation-required signup and session-bound password recovery. `/account?next=/order` is a safe allowed return destination. Signup without a confirmed session cannot upload/submit. Common Supabase login failures receive useful, sanitized messages.
- Buckets: public `avatars` (5 MB); private `order-artwork` (25 MB), `payment-receipts` (8 MB), `migration-quarantine` (25 MB). JPEG/PNG/WebP only. Uploads require authenticated UUID-owned flat paths, without overwrite/delete. Private downloads use authorized sessions; permanent public URLs are not generated for receipts/artwork. Public avatar bytes remain public even before publication/after profile hiding.
- The staff owner-profile editor starts empty and cannot save an empty/loading/failed record. It does not pre-fill demo data. The fixed `/u/ibraheem` handle cannot be silently renamed. No example profile was seeded. Homepage card/profile illustrations are static presentation, not database records or proof of a live profile.
- Local `supabase/config.toml` enables new email signup, email confirmation, eight-character passwords, explicit callback paths, public-only Data API exposure and disables automatic seeds. This is LOCAL CLI configuration, not proof of remote Auth configuration.
- Environment templates and privacy/cookie wording describe the Supabase account service and interrupted-order marker. NFC/QR destinations retain `https://edgetapflow.web.app/u/<handle>`; Firebase Hosting/domain stay intact.

## LOCAL VERIFIED

| Check | Result / limit |
|---|---|
| Typecheck | Passed |
| Lint | Zero errors; five existing image warnings |
| Supabase-selected production static export | Passed for enabled and paused checkout with isolated fixture URL/public key; never published |
| SQL/RLS/RPC | 23 checks passed, plus clean-bootstrap/overwrite-guard verification: public/private boundaries, self-promotion denial, owned uploads, server price/status, retries, safe recovery, agreed quote, manual verification, handle collision/reservation, publication, bounded edits and immediate staff revocation |
| Browser integration | 20 checks passed: public/missing profile, owner login/edit, staff denial, lost-response/refresh recovery without duplicate, staff receipt download/quote/manual verification/publication, anonymous published-profile/private denial, QR, confirmation-required signup and recovery request/session |
| Responsive browser suite | 364 assertions passed at 320/360/390/768/1440 px with paused Supabase fixture export |
| Public config preflight | Passed; missing values, privileged keys and unsafe origins rejected without echoed credentials |
| Normal unconfigured build | Deliberately stopped with `Supabase public configuration is missing.`; no secret echo or Firebase fallback |
| Read-only hosted check command | Refused to run without actual public Supabase configuration; zero hosted endpoint checks completed |
| Retained offline migration tools | Preservation/validation regression passed; no real source exports/imports performed or required |

SQL tests use PGlite PostgreSQL with minimal Auth/Storage schemas. Browser tests use real local SQL/RLS with simulated Auth/Storage HTTP. They do not establish real JWT enforcement, signup email delivery, recovery mail, hosted object bytes/size enforcement/CORS, a real JazzCash transfer or production public-profile rendering. Browser fixtures exist only in the test database, never a hosted project. Generated fixture exports are isolated from the deployable `out/` path after QA.

## HOSTED VERIFIED

Only CLI account authentication/project discovery is verified. **No hosted EdgeTap database, Auth, Storage, customer flow or RLS/byte-access test is verified.** Production still serves the previous Firebase-backed release because deployment is explicitly prohibited. Its previous public-profile 403 has not been repaired by unpublished local changes.

A read-only verifier is available as `npm run check:supabase:hosted`. With real public configuration it checks RPC availability, absent-profile null, anonymous table/staff denial and absent-object public-URL failures without creating data. Even a passing result would not prove an existing private file's byte isolation or complete signup/payment flow. A clean empty production database also cannot provide a real public example: an approved real owner/customer profile must eventually be published, or real-flow tests must run in a separately identified development project.

## Exact setup procedure prepared

The script `scripts/setup-clean-supabase.mjs <confirmed-project-ref> --inspect` verifies CLI access/active project status and runs `supabase/inspect-target.sql`. Inspection returns metadata/policies/functions/bucket settings and aggregate Auth/object counts, not account records or secrets.

`--apply` additionally runs `supabase/require-clean-target.sql`, then `supabase link --project-ref <ref>`, `supabase db push --dry-run`, and `supabase db push`, followed by `supabase/verify-clean-bootstrap.sql`. No reset, diff-generated destructive change, import, seed, role overwrite, auto-resume or paid provisioning is included. Preflight refuses existing application objects, private schema, users/buckets/assets rather than clearing them. Conflicting definitions fail; independently committed migrations may need inspected forward recovery if a later step fails. Do not rerun the clean installer blindly after partial application.

This procedure has NOT been executed on a hosted target. See `supabase/README.md` for Auth/staff/callback and cutover steps.

## Dashboard settings / local configuration still needed

1. Identify an accessible active EdgeTap project. Confirm target/region/current schema first. An inactive unrelated project cannot be selected by inference.
2. Provide the project URL and PUBLIC publishable key locally as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, with `NEXT_PUBLIC_DATA_BACKEND=supabase`. Privileged keys/passwords stay outside browser variables/Git/chat. Existing CLI login can operate through Management API; CLI link/push may require separately available operator/database access.
3. Auth: email provider and signup enabled; anonymous signup disabled; email confirmation enabled; password minimum eight; Site URL `https://edgetapflow.web.app`; exact production redirects `/account` and `/account/recovery`. Allow local callback origins only in a deliberately separate development setup. Do not blindly push the local config to a hosted project.
4. Configure a verified sender/custom SMTP service and test actual confirmation/recovery with an approved real mailbox. Supabase's [default SMTP](https://supabase.com/docs/guides/auth/auth-smtp) restricts delivery to project-team addresses and is unsuitable for commercial signup/recovery. No sender email or mail provider has been invented, purchased or configured here. Check email templates use the generated confirmation URL so the callback works.
5. Restrict Data API exposed schemas to `public`; never expose `private`. Apply/review Storage policies and verify actual private-byte denial after uploading an approved asset in a separate test destination or real operational walkthrough.
6. A real staff member must first register/confirm through normal Auth. An authorized operator must verify the exact UUID and deliberately enroll `private.admin_members` with provenance. No fake/legacy account or metadata-based administrator is created automatically.

## TECHNICAL BLOCKERS

- Apply and inspect the additive schema in the confirmed clean hosted destination; verify real RPC/RLS/Storage behavior and hosted signup/login/confirmation/recovery. Test real-owner edits, staff gates, handle races, interrupted submission, receipt bytes and manual payment/publication/fulfillment in a distinct development project or approved real operational flow.
- Create an approved REAL public owner/example profile and complete the eight customer acceptance outcomes in `LAUNCH_REPORT.md`. Empty clean production intentionally provides no invented sample/customer record.
- Online checkout remains paused until actual quote/payment/Auth/Storage/persistence and physical NFC/QR flow pass. WhatsApp remains the honest order-start path. Test camera scan/NFC on physical customer devices.
- Deployment is still prohibited. Obtain separate release approval, build with verified real public config, test Hosting rewrites/headers, then switch the website backend. Firebase data-layer rollback remains available but its prior billing failure means it cannot be assumed operational. Do not point a rollback at clean Supabase orders as though the two stores share writes.

## BUSINESS DECISIONS

- Delivery coverage, fee and dispatch estimate (agree specific details during ordering until a general policy is confirmed).
- Digital-profile hosting duration and update terms.
- Cancellation before production, print-detail approval and defect-claim handling process.

## BILLING/INFRASTRUCTURE BLOCKERS

- Correct active Supabase destination/project access, real public build configuration, operator migration access and verified SMTP/sender. No plan/payment method/add-on was enabled.
- Existing Firebase test-data extraction/billing restrictions are explicitly WAIVED for this clean setup. Do not retry them or enable Blaze. Firebase Hosting/domain remain in place.

## LEGAL/POLICY REVIEW

Review owner-directed personalized-card cancellation/remedies and actual Supabase processor/region/privacy retention before release. No blanket refund policy, customer-error remedy, lifetime hosting, delivery guarantee or verified legal-compliance claim is introduced.

Firebase SDK helpers/package, emulator tests, Firestore/Storage rules and source-inventory tooling can eventually be removed after an approved successful cutover and rollback decision. Firebase Hosting/CLI/domain must remain while the public site uses `.web.app`. Nothing is removed now; Supabase mode does not initialize/contact Firebase data services. Legacy SDK chunks remain available for explicitly selected development builds.
