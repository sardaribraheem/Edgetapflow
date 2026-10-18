# EdgeTap backend guide

Updated 18 October 2026. [Launch status](LAUNCH_STATUS.md) records verified service state. Supabase handles Auth, PostgreSQL/RLS/RPCs and Storage; Firebase provides Hosting only. No automatic payment gateway or courier integration exists.

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

Hosted state: **001–015 plus 017/018**. **016 is optional and unapplied**. Never edit/rerun applied migrations, reset production or blindly push all pending files. Confirm `supabase/project.json` and inspect linked history before proposing an exact authorized change.

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

Released capability checks include `offerPrices`, `cardEditorVersion: 4`, `designReviewVersion: 1` and checkout version 2. First ten profile links are included; extra links cost Rs. 50 each once per profile, with a technical maximum of 100. Validate price, editor scene and link limits on both client and server. Historical schema-1 scenes/templates remain supported. Direct URLs use normalized UTF-8/NDEF capacity checks in `lib/nfc-link.ts`; actual chip/writability still requires physical testing.

Prepared 016 preserves the guarded publication transaction and accepts exact apex/Firebase hosts. Without it, backend publication stores working `.web.app` destinations while frontend share links use `edgetap.tech`. Never substitute a global origin for an order's approved `nfcUrl`. Use `supabase/verify-domain-release.sql` only for reviewed read-only verification; browser builds do not apply migrations.

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
