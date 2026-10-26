# EdgeTap backend guide

Updated 26 October 2026. [Launch status](LAUNCH_STATUS.md) records verified service state. Supabase handles Auth, PostgreSQL/RLS/RPCs and Storage; Firebase provides Hosting only. No automatic payment gateway or courier integration exists.

## Files and configuration

| Area | Source |
|---|---|
| Backend selection and client | `lib/backend.ts`, `lib/supabase.ts` |
| Accounts | `lib/auth.ts` |
| Order payloads, RPCs and capabilities | `lib/application.ts`, `lib/checkout.ts` |
| Profile/order access | `lib/data-service.ts` |
| Canonical/public destinations | `lib/site.ts` |
| Device-only draft | `lib/guest-draft.ts` (IndexedDB) |
| Upload/download handling | `lib/upload-service.ts` |
| Physical schema, rendering and printer sheet | `lib/physical-card.ts`, `lib/card-renderer.ts`, `lib/print-job.ts` |
| Database and worker | `supabase/migrations/`, `supabase/functions/order-notifications/` |

`.env.local` supplies public backend selection, Supabase URL/publishable key and canonical origin. Values are embedded at build time. Keep service-role keys, operator tokens, passwords and mail secrets in private server/operator environments, never `NEXT_PUBLIC_*`, logs or Git.

## Data and permissions

| Data | Tables | Boundary |
|---|---|---|
| Published profile/links | `public.profiles`, `profile_links` | Active exact-handle public reads; owner edits permitted fields via versioned RPC |
| Ownership/handles | `private.profile_owners`, `public.handle_reservations` | Transactional staff publication; immutable owner/handle |
| Customers, orders, contacts | `public.customers`, `orders`, `order_contacts` | Actual owner and verified staff |
| Applications/digital drafts | `order_applications`, `order_profile_drafts`, `order_draft_links` | Private until guarded publication |
| Payment and fulfillment | `payments`, `fulfillment_events` | Staff-controlled facts; owner sees relevant status |
| Staff | `private.admin_members` | Protected UUID membership, never signup/email alone |
| Notes, email and templates | `private.order_notes`, `design_proof_emails`, `order_email_jobs`, `print_templates` | Restricted staff/worker operations |

RLS and security-definer RPC identity checks enforce access. Preserve empty search paths and restricted wrapper grants; do not bypass policies with a service-role browser client.

| Storage bucket | Visibility | Limit |
|---|---|---:|
| avatars | Public; disclose portrait/logo visibility | 5 MB |
| order-artwork | Private | 25 MB |
| payment-receipts | Private | 8 MB |
| print-packages | Private staff-produced PNG/PDF; owner reads current proof | 32 MB |
| migration-quarantine | Private operator workflow | 25 MB |

Store private paths and use authenticated downloads. No permanent public receipts or delivery addresses in profiles. Preserve an existing cloud file if its replacement fails.

## Order and proof invariants

1. Device draft → signed-in private application → submitted order. Server fixes price/quantity and validates owned files, links and optimistic versions. Receipt upload never marks payment verified.
2. Staff checks the actual selected-method transfer, confirms specification and accepts. `confirm_link_destination` validates a Link Card URL; guarded profile publication reserves the handle and ownership transactionally. Never overwrite an existing profile.
3. `prepare_print_proof` freezes the current front/back files, settings, wording, QR/destination and template version. Regeneration invalidates prior approval/deadline and supersedes queued old proof mail.
4. `share_design_proof` privately exposes the current proof. `respond_to_design_proof` verifies actual ownership/current revision and collects approval or one consolidated change note. Sharing sends no email and has no timeout.
5. New orders have one included revision. `record_design_edit_payment` grants one further request only after staff records an agreed, actually verified payment. Used allowance/ledger survive regeneration and channel changes; legacy orders retain their terms.
6. Final printing/package access requires accepted specification, verified amount, confirmed destination/correct active profile, actual printer settings and approved current proof. Generate the A4 order sheet through the existing guards. Actual print/NFC/QA/handoff stages require operator work.

References use `ET-MMDDYY-sequence`, Pakistan date and a sequence starting at 1001. Retries keep the same reference; gaps are allowed. Digital profile edits never rewrite an approved physical snapshot. Handles cannot change without implementing redirects for existing cards.

## Migration and capability map

Hosted state: **001–015 plus 017–027**. **016 is optional and unapplied**. Never edit/rerun applied migrations, reset production or blindly push all pending files. Confirm `supabase/project.json` and inspect linked history before proposing an exact authorized change.

| Migration | Responsibility |
|---|---|
| 001–006 | Core tables, RPC/RLS, buckets, recovery, manual payment and handles |
| 007 | Private application/specification/versioned pricing workflow |
| 008–009 | Physical fulfillment, rider-direct delivery, proof transport/reply/window guards |
| 010–011 | Protected owner edits, versioned templates/snapshots and printer packages |
| 012–014 | Card products/front-back scenes, text rotation, versioned presets/public logos |
| 015 | Private account proof, included revision and private paid-edit ledger |
| 016 — unapplied | New backend profile publication on preferred domain; no saved-card backfill |
| 017 | Checkout version 2, three payment methods, public location, extra links and authenticated feedback |
| 018 | Notification outbox, protected provider completion and unanswered-proof handling |
| 019 | Existing separate app contract; preserve definitions |
| 020–021 | Version-3 website offers, included delivery, owned-profile cards and public reviews |
| 022 | Staff-only immutable pricing catalog and revision-bound version-4 quotes |
| 023 | Confirmed customer/founder saves and canonical profile publication |
| 024 | Reference or owned receipt as payment evidence, without automatic funds verification |
| 025 | Staff direct publication/manual fulfillment, private optional checklist/audit and silent review actions |
| 026 | One free ten-link website profile per confirmed account and staff moderation |

Released capability checks include `offerPrices`, `cardEditorVersion: 4`, `designReviewVersion: 1` and checkout version 2. First ten profile links are included; the website catalog controls the additional-link rate once per profile, with a technical maximum of 100. Validate price, editor scene and link limits on both client and server. Historical schema-1 scenes/templates remain supported. Direct URLs use normalized UTF-8/NDEF capacity checks in `lib/nfc-link.ts`; actual chip/writability still requires physical testing.

Optional 016 remains unapplied. Migration 023 independently preserves guarded publication and uses the apex domain for new profiles; earlier saved `.web.app` destinations remain valid. Never substitute a global origin for an order's approved `nfcUrl`. Use `supabase/verify-domain-release.sql` only for reviewed read-only verification; browser builds do not apply migrations.

## Register a template

Add the exact ID/version/definition to `lib/data/card-templates.json`, then a **new additive migration** registering the identical object in `private.print_templates`. Keep old definitions and versioned assets for approved/open orders. A redesign gets a higher version; do not overwrite historical files or rows. Retiring a version from new use must preserve old snapshots. See [developer guide](developerguide.md).

## Isolated tests and troubleshooting

Run `npm run typecheck`, `npm run lint`, `npm run test:supabase` and `npm run test:uiux`. SQL uses isolated PGlite, not hosted data. Build browser fixtures in a separate working copy with:

```sh
NEXT_PUBLIC_DATA_BACKEND=supabase \
NEXT_PUBLIC_SUPABASE_URL=https://edgetap-migration-test.supabase.co \
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_edgetap_local_test_only \
NEXT_PUBLIC_APP_URL=https://edgetap.tech \
npm run build -- --webpack
PORT=4173 npm run serve:qa
```

Then run `QA_BASE_URL=http://127.0.0.1:4173 npm run test:uiux:browser`. Auth/Storage/email HTTP are simulated; SQL/RLS and PDFs are exercised. Never deploy this export. Rebuild with actual public configuration and run `npm run check:release`. Older browser suites may require UI expectation updates; no clean-project/absent-founder assertions against live services.

Read-only probes: `node scripts/check-live-services.mjs`, `npm run check:supabase:hosted`, and the applicable SQL verifiers. Denial for an absent object does not establish real private-byte isolation. For failed saves check versions/owned paths/capabilities; for printing check payment/specification/destination/current-proof approval. Never expose raw tokens/errors or bypass a guard. [Admin guide](adminguide.md) covers operator actions.

## Email activation

**Inactive:** migration 018 is installed, but worker, provider secrets and scheduler are not activated. `emailNotificationsEnabled=false`. Queueing/private sharing never starts the ten-hour clock.

For separately authorized activation, verify the Resend sender and monitored reply/admin destination; configure `RESEND_API_KEY`, `ORDER_EMAIL_FROM` and a strong `ORDER_NOTIFICATION_WORKER_SECRET` only as server secrets. Review/deploy `supabase/functions/order-notifications/index.ts`; it verifies caller identity/order authorization, claims jobs and uses provider idempotency keys. Only actual provider acceptance recorded by protected completion starts the current proof's deadline. Provider acceptance still does not prove inbox receipt.

Review `supabase/schedule-order-notifications.sql` after worker setup. It requires pg_cron/pg_net and a matching Vault secret named `edgetap_order_worker_secret`. Keep credentials out of SQL files/Git. Establish retries, stale-proof handling and monitored replies; test actual admin/customer inboxes and timely response/no-response cases before enabling notifications. Failed/superseded sends must not start a clock. Ordinary Supabase Auth mail needs separate confirmation/recovery testing.

The maintenance cleanup script is destructive to its reviewed scope: `--inspect` writes a private snapshot, `--apply` checks it and preserves accounts/staff/founder. It already ran for authorized test data. Never run it during routine tests or infer new deletion permission from its existence.


## Website catalogs and public reviews

Migration 020 introduced explicit two/three-card bundles and cards for an already owned active profile. Version-3 terms remain frozen. Migration 021 keeps public reviews separate from private feedback: half-star ratings, one review/account with cooldown, eight ranked reviews per cursor batch and on-demand Show more. No sample reviews are published.

Migration 022 stores public price data in restricted immutable `private.pricing_catalogs`. Anonymous clients can read only revision data through `get_pricing_catalog`; `save_pricing_catalog` requires staff, validates money/fields and rejects stale revisions. Version-4 application payloads send a catalog ID, never an authoritative client total. New submissions require the current catalog; existing order JSON includes its historical server snapshot. Disabling an offer or changing rates does not reprice submitted orders/corrections. Legacy new-order clients must refresh after the first real catalog change. Delivery inclusion and private rider costs retain their existing boundaries.

Migration 023 adds `save_profile_confirmed` and `save_founder_profile_confirmed`, preserving owner/staff/version and upload guards. Clients verify the fresh public fields before success; staff also confirms intended visibility. Public-profile refreshes and homepage social links read the actual backend profile. New guarded publications use `https://edgetap.tech/u/<handle>` immediately, while printing/proof gates remain separate. No old URL or approved snapshot is rewritten, and optional 016 is not applied.

Use `npm run test:admin-pricing`, `npm run test:website-offers`, `npm run test:website-reviews` and `npm run test:admin-pricing:browser` against the isolated fixture export. The new browser suite excludes 016, uses local SQL and simulates Auth/Storage. The guarded release transaction was also tested after the existing 019 contract; app function fingerprints are checked unchanged during publication. No live customer QA writes are required.

## Current free-profile and staff controls

`admin_publish_order_profile_now` keeps staff/row-version/handle/ownership/upload/link checks while removing mandatory payment/review/specification/print steps. It does not fabricate those facts. The existing guarded publication RPC stays available for legacy clients. `admin_manage_order` records optional checks, physical format, explicit review/payment decisions and actual manual fulfillment in restricted audit tables. The customer sees review start/completion and item type, never individual staff checks. Its silent-update scope prevents automatic accepted-email jobs; the website no longer automatically calls the order email worker on submission/staff actions. Explicit proof email remains separate and inactive until configured.

`create_free_website_profile` requires a confirmed signed-in account, a unique stable handle and at most ten safe links. It creates one owned public profile and no order, payment or email job; retries use the same request key. `private.website_free_profiles` enforces one free website profile per account. Removal changes public visibility while retaining the handle, ownership and records; the customer cannot self-restore or recreate around moderation. Staff can edit existing customer public fields through the confirmed-save path. Existing 019 app definitions remain unchanged.

Run `npm run test:free-profiles` and the isolated `npm run test:free-profiles:browser`. Auth/Storage/funds are simulated there; never run fixtures against production exports. The exact 024/025/026 release transaction checks unchanged existing customer/profile/order/payment/catalog/outbox data and app definitions before commit. Auth SMTP was not changed; see [the sender plan](AUTH_EMAIL_PLAN.md).


## 27 October profile/account controls

Migration [027](../EdgetapFlow/supabase/migrations/202610270027_profile_account_admin.sql) adds staff-only versioned account separation, permanent-profile deletion, order contact correction and application decisions, with private audit and revoked wrapper aliases. Public/customer JSON never includes staff account metadata. Installation defines controls only. The exact owner-authorized Umer correction was a separate guarded transaction with a private snapshot; it did not delete profiles or send email. App 019 definitions and optional 016 are unchanged.

Run `npm run test:profile-account-admin` for isolated SQL/security tests (including existing 019), `npm run test:profile-account-admin:browser` against the isolated fixture export on port 4173, and `node scripts/test-profile-account-admin-hosted.mjs` for read-only published checks against the reviewed production export. Do not deploy a fixture export or run cleanup RPCs as tests against real customers. See [account/admin release scope](PROFILE_ACCOUNT_ADMIN_2026-10-27.md).
