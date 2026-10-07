# EdgeTap clean Supabase setup

The owner approved a clean production data layer. Existing Firebase Firestore records, the Auth user and four legacy images are TEST DATA and are intentionally NOT imported. Leave Firebase untouched; do not retry extraction, recover files, migrate passwords, enable Blaze or delete anything. Historical source inventory remains in `SUPABASE_MIGRATION_AUDIT.md`.

The application defaults to Supabase. The hosted foundation is now initialized in the ONLY approved project, `dxyxvervvlxhwwbcbttd` (Edgetap, region `ap-southeast-2`). Migrations 001–006, RLS/RPCs and buckets are applied; application workflow/dimension migrations 007–008 are prepared locally and unapplied; Auth callbacks/security are configured. Anonymous/API boundaries pass; real account/email/customer/staff success workflows remain pending. DukanKhata is untouched. Read [../SUPABASE_MIGRATION_REPORT.md](../SUPABASE_MIGRATION_REPORT.md) for verified evidence and remaining blockers. Do not use an unrelated project by inference.

## Local verification

```sh
npm run typecheck
npm run lint
npm run test:supabase
npm run test:migration
```

SQL/RLS tests run actual PostgreSQL in PGlite with minimal Auth/Storage schemas. Fixtures are isolated to that test process; no hosted records, Auth users or files are created. The retained offline migration regression does not extract or import Firebase data.

Browser integration uses a deliberately isolated fixture export:

```sh
NEXT_PUBLIC_SUPABASE_URL=https://edgetap-migration-test.supabase.co \
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_edgetap_local_test_only \
npm run build -- --webpack
PORT=4173 npm run serve:qa
# Separate terminal:
QA_BASE_URL=http://127.0.0.1:4173 npm run test:supabase:browser
```

Auth/Storage HTTP are simulated; RPCs run against real local SQL/RLS. A passing local suite is not proof of hosted email/JWT/byte-access/payment functionality. Never publish the fixture export. Move its generated `out/` to a protected temporary QA directory when finished, then build with actual verified public configuration before any future approved release.

## Select and inspect the destination

The existing Supabase CLI login supplies operator account access. Do not pass tokens/passwords on command lines or print `projects api-keys` unfiltered; that response can contain privileged keys. Keep credentials outside Git/browser configuration.

The public destination lock is in `supabase/project.json`. Setup/hosted-check scripts refuse any other project. The clean installer was already successfully run; DO NOT rerun `--apply` on this initialized destination. For future schema changes, inspect history and apply only reviewed additive forward migrations. The prepared inspection command is:

```sh
node scripts/setup-clean-supabase.mjs dxyxvervvlxhwwbcbttd --inspect
```

It uses `supabase projects list --output json` internally to confirm access/active status, then `supabase db query --linked --project-ref dxyxvervvlxhwwbcbttd --file supabase/inspect-target.sql`. Output is schema/grant/policy/bucket metadata and aggregate counts, not customer records or credentials. It never resumes or creates projects.

To apply the authorized clean setup after reviewing inspection:

```sh
node scripts/setup-clean-supabase.mjs dxyxvervvlxhwwbcbttd --apply
```

Exact sequence: inspect; `require-clean-target.sql`; `supabase link --project-ref <ref>`; `supabase db push --dry-run`; `supabase db push`; `verify-clean-bootstrap.sql`. The preflight refuses existing custom application tables/views/functions, a private schema or any existing Auth users/buckets/objects. It does not clear an existing project to make it empty. Existing unrelated policies/objects need review too. No reset, source import, seed, role overwrite, paid plan or Firebase command is run.

The migrations are individually transactional and deliberately fail on conflicting objects. A later-step failure may leave earlier migrations applied. Inspect migration history and recover forward; do not reset, blindly rerun the clean installer or repair history to pretend SQL succeeded. If CLI link/push requires database/operator credentials unavailable locally, provide them through a protected operator environment, not chat or `NEXT_PUBLIC_*`. The existing login supports Management API SQL inspection; it does not guarantee every CLI database command is authorized.

## Schema / Storage / RLS

The first six migrations are already hosted. Migration 007 is a locally tested forward change and awaits separately authorized database release:

1. `202610070001_core.sql`: relational customers/profiles/ordered links/handles/orders/contact+draft snapshots/payments/fulfillment/reviews, private ownership/staff/provenance, indexes/constraints and SELECT RLS.
2. `202610070002_rpc.sql`: narrow read/transactional-write RPCs, explicit execution grants, server pricing and lifecycle gates.
3. `202610070003_storage.sql`: bucket configuration and account-owned upload/read policies.
4. `202610070004_submission_recovery.sql`: exact account/request receipt lookup for interrupted submissions.
5. `202610070005_manual_payment_quote.sql`: quote required before staff confirmation; null/stale/verified-total changes rejected.
6. `202610070006_profile_handle_paths.sql`: additive constraints and availability guard reject browser-normalized dot handles so NFC/QR destinations remain valid.

7. `202610070007_application_workflow.sql` (**LOCAL ONLY**): private progressive drafts, separate application review and requested/approved card specification, independently verified card/delivery amounts, staff/customer notes/history, disabled notification outbox, NASTP pickup lifecycle, version-aware payment verification, staff-controlled instructions. Adds five RLS tables and order/payment columns; preserves existing rows and IDs. Legacy id-only payment RPC execution is revoked so stale receipt review cannot bypass the new version check.

8. `202610070008_confirmed_card_dimensions.sql` (**LOCAL ONLY**): owner-confirmed standard dimension text and labelled size option; preserves custom settings/existing orders, extends staff configuration RPCs, retains all RLS/grants. See [../BUSINESS_CONFIGURATION.md](../BUSINESS_CONFIGURATION.md).

There is no production seed. The `ibraheem` reservation is configuration only, with no profile/customer attached. With migration 007, a customer record is created when the real user first saves a private draft; paid orders are published by staff. Signup itself does not create fabricated orders/profiles. `private` remains outside the exposed Data API schemas, with no app usage grants.

Public profile access is exact-handle/active-only through `get_public_profile`; anonymous table enumeration/private orders are denied. Owner display/link edits use an authenticated bounded RPC. Staff authorization comes only from active rows in protected `private.admin_members`, not user metadata/email domains. Payment, quote, publication and fulfillment are separate staff RPCs; customer payloads cannot choose price/owner/payment status.

Buckets contain no placeholder files:

| Bucket | Visibility | Limit | Access |
|---|---|---|---|
| avatars | Public bytes | 5 MB | Owner upload; owner/staff metadata |
| order-artwork | Private | 25 MB | Owner upload/read; staff read |
| payment-receipts | Private | 8 MB | Owner upload/read; staff read |
| migration-quarantine | Private | 25 MB | Operator upload; staff read; empty in clean setup |

JPEG/PNG/WebP only, UUID account paths, no app update/delete/upsert. Receipts/artwork use authenticated downloads; do not create permanent public bearer links. Avatar bytes are public even when a profile is draft/hidden. Test actual hosted byte authorization separately from SQL metadata policies.

## Auth/dashboard configuration

`supabase/config.toml` describes LOCAL development. It exposes `public`, enables email signup/confirmation, requires eight-character passwords, disables anonymous sign-in and automatic seeds, and allowlists explicit callback paths. Do not blindly push local development settings to a production project.

Production Auth is configured with the reviewed minimal `supabase/config.production.toml` and actual CLI declared-property diff. Only three settings changed: site URL, two redirects and password minimum. Email signup/confirmation remain enabled and anonymous sign-in remains disabled. Ten undeclared remote settings were preserved. No custom SMTP was configured. For future changes, copy that minimal file into a protected operator workdir, review `supabase config diff --project-ref dxyxvervvlxhwwbcbttd`, then push only an approved exact diff. Never push the full local development config blindly.

Required production Auth settings:

- Site URL `https://edgetapflow.web.app`.
- Redirect allowlist `https://edgetapflow.web.app/account` and `https://edgetapflow.web.app/account/recovery`.
- Email provider/signup enabled; email confirmation enabled; minimum password eight; anonymous sign-in disabled.
- Verified custom SMTP/sender and suitable rate limits. [Default Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp) is restricted to project-team addresses; it is not an operational commercial email service. No sender/provider is assumed or purchased here.
- Confirmation/recovery templates using the generated confirmation URL, with real approved mailbox/callback verification. The SPA handles Supabase URL sessions; no server callback route is required for this client-only Auth integration. See [redirect configuration](https://supabase.com/docs/guides/auth/redirect-urls).

No Firebase user/password/session transfers. New production users register and confirm normally. The account page offers independent signup; signup itself creates no order/profile or staff membership. A signup response without a session cannot upload or submit. Recovery requires a PASSWORD_RECOVERY session event and signs out after successful password update.

A real staff member must register and confirm first. An authorized operator must verify their exact Auth UUID, then deliberately insert `private.admin_members(user_id,active,provenance)` for that user. No automatic administrator exists. Use truthful provenance identifying owner authorization. Never select the old test account, auto-promote the first signup or rely on `raw_user_meta_data`.

## Public configuration / ordering

Provide locally:

```dotenv
NEXT_PUBLIC_DATA_BACKEND=supabase
NEXT_PUBLIC_SUPABASE_URL=https://dxyxvervvlxhwwbcbttd.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<public key only>
NEXT_PUBLIC_APP_URL=https://edgetapflow.web.app
```

The static export embeds these public values. Never use a secret/service-role key or database password. Missing configuration stops the build. Explicit `NEXT_PUBLIC_DATA_BACKEND=firebase` remains available for legacy development; there is no implicit fallback.

Manual JazzCash is the sole approved payment method: 0304 4149674. Confirm the recipient, card subtotal and hosting terms before transfer. The initial card payment excludes delivery. Staff review private proof, verify the actual card transfer, confirm the card specification and accept the application. Delivery fee and its payment are agreed/verified afterward, separately. Dispatch is blocked until the agreed delivery fee is settled (or explicitly zero). Pickup has no delivery fee. No payment gateway or automatic verification exists.

The legacy instant-checkout flag is no longer read by this application wizard. The new frontend requires migration 007 and must not be released against the currently hosted 001–006 schema. Saved drafts live in RLS-protected Postgres; only a draft ID appears in the URL, with no application PII in browser draft storage. Save errors warn against leaving; version checks prevent conflicting overwrite. Lost submission responses reconcile the same owned draft/order and cannot duplicate payment/orders.

### First staff account

The intended first administrator is **sardaribraheem277@gmail.com**. The user will register/verify normally; no fabricated Auth user, invite or forced confirmation is created. The account was not yet registered at read-only inspection. After normal verification, an authorized operator can use:

```sh
node scripts/enroll-edgetap-admin.mjs --inspect
# Deliberate membership write only after reviewing the verified real account:
node scripts/enroll-edgetap-admin.mjs --apply
```

The helper refuses another project, missing/unverified/multiple accounts and revoked membership. Email identifies the owner-approved bootstrap account; runtime authorization checks protected UUID membership only. It is not called by signup or the website. No membership was applied in this task.

### Business configuration and email

After migration 007 and staff enrollment, use **Admin → Settings → Order & fulfillment instructions** for NASTP instructions/times, delivery coverage/dispatch wording, hosting/update wording and size option labels. Customers may request a custom size; every order retains requested specification independently of staff approval. Admin order details separately confirm the approved size/design and an actually agreed delivery fee. Card price Rs. 999 and the approved JazzCash number are returned by SQL configuration; changing these requires a reviewed pricing/payment change.

SMTP is not configured. The staff inbox and customer account history refresh every 20 seconds/on focus; customer-visible decisions are separate from internal notes. Each application event creates a **disabled** notification-outbox record. No email sender/worker is currently running and no email delivery is claimed.

Configure future Auth SMTP in the approved project's **Authentication → Email/SMTP settings**, with verified host, port, username, password, sender address/name. Do not put these in public environment variables or chat. If a future private worker/local config uses an ignored, mode-0600 `.env.notifications.local`, the proposed names are `EDGETAP_SMTP_HOST`, `EDGETAP_SMTP_PORT`, `EDGETAP_SMTP_USER`, `EDGETAP_SMTP_PASSWORD`, `EDGETAP_SMTP_FROM`, `EDGETAP_SMTP_SENDER_NAME` and `EDGETAP_TRANSACTIONAL_EMAIL_ENABLED=false`. **These names are a future worker configuration contract, not an implemented sender**. Verified SMTP alone does not send application events; a separately approved private, idempotent worker must claim outbox records and record real delivery results. Auth SMTP and business-event email are distinct.

## Hosted verification and future release

```sh
npm run check:supabase:hosted
```

This command is read-only with the public key. It now passes 21 checks for exact-profile/review RPC availability, anonymous table/staff/mutation denials, private schema exclusion, malformed JWT rejection, Auth settings/JWKS and absent-object public URL failures. It creates no user/profile/order/file and cannot prove access to an existing private file is denied. Missing config fails before requests. A verified real owner/profile or separately identified development destination is needed for real profile/signup/order/storage/manual-payment/QR tests; do not seed fictitious production data to claim readiness.

Hosted PostgreSQL negative permission probes can be rerun without fixtures:

```sh
supabase db query --linked --project-ref dxyxvervvlxhwwbcbttd --file supabase/test-hosted-boundaries.sql
```

These probes simulate SQL roles (not real Auth sessions), expect every mutation to be denied and roll back. `update_profile` takes a row lock, so the transaction permits locks; no records are inserted. Post-check with `verify-clean-bootstrap.sql` while the production database is intentionally empty. After real accounts/records exist, that clean assertion should fail rather than deleting anything.

A fresh real-hosted browser suite is available:

```sh
npm run build -- --webpack
PORT=4173 npm run serve:qa
# Separate terminal; real hosted requests, no interception or data creation:
QA_BASE_URL=http://127.0.0.1:4173 npm run test:supabase:hosted-browser
```

Twelve anonymous checks pass against the actual EdgeTap backend and real-config local export. Empty profiles correctly render missing; successful public profile/account/order/payment/Storage flows are not inferred. Production callbacks currently point to the old deployed Firebase client; full new confirmation/recovery UX needs separately approved release/preview or a reviewed testing callback arrangement. No email was sent or fictitious user created. Rotate the secret key shared in chat; it is not used by the app or saved locally.

Keep Firebase Hosting/NFC URLs. Do not deploy/push until separately approved. Verify schema, Auth emails/sessions, Storage bytes, private denials, real payment handling and all customer acceptance checks first. Resolve delivery/hosting policies and legal/privacy review. Rebuild with real public configuration and test Hosting rewrites/headers on an approved preview before release.

Firebase SDK helpers/package/rules/emulator/source-inventory tooling may eventually be removed after successful cutover and an explicit rollback decision. Firebase Hosting/domain/CLI are still needed while `.web.app` serves EdgeTap. Nothing is deleted or disabled now; old Firebase test data is not a dependency of the clean Supabase setup.
