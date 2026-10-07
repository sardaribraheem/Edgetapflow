# EdgeTap clean Supabase setup

The owner approved a clean production data layer. Existing Firebase Firestore records, the Auth user and four legacy images are TEST DATA and are intentionally NOT imported. Leave Firebase untouched; do not retry extraction, recover files, migrate passwords, enable Blaze or delete anything. Historical source inventory remains in `SUPABASE_MIGRATION_AUDIT.md`.

The application defaults to Supabase. Hosted setup is incomplete: the current CLI login exposes only the inactive unlinked DukanKhata project, not a confirmed EdgeTap destination. Read [../SUPABASE_MIGRATION_REPORT.md](../SUPABASE_MIGRATION_REPORT.md) for verified evidence and remaining blockers. Do not use an unrelated project by inference.

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
NEXT_PUBLIC_ONLINE_CHECKOUT_ENABLED=true npm run build -- --webpack
PORT=4173 npm run serve:qa
# Separate terminal:
QA_BASE_URL=http://127.0.0.1:4173 npm run test:supabase:browser
```

Auth/Storage HTTP are simulated; RPCs run against real local SQL/RLS. A passing local suite is not proof of hosted email/JWT/byte-access/payment functionality. Never publish the fixture export. Move its generated `out/` to a protected temporary QA directory when finished, then build with actual verified public configuration before any future approved release.

## Select and inspect the destination

The existing Supabase CLI login supplies operator account access. Do not pass tokens/passwords on command lines or print `projects api-keys` unfiltered; that response can contain privileged keys. Keep credentials outside Git/browser configuration.

First confirm the exact active EdgeTap project reference. The prepared inspection command is:

```sh
node scripts/setup-clean-supabase.mjs <confirmed-project-ref> --inspect
```

It uses `supabase projects list --output json` internally to confirm access/active status, then `supabase db query --project-ref <ref> --file supabase/inspect-target.sql`. Output is schema/grant/policy/bucket metadata and aggregate counts, not customer records or credentials. It never resumes or creates projects.

To apply the authorized clean setup after reviewing inspection:

```sh
node scripts/setup-clean-supabase.mjs <confirmed-project-ref> --apply
```

Exact sequence: inspect; `require-clean-target.sql`; `supabase link --project-ref <ref>`; `supabase db push --dry-run`; `supabase db push`; `verify-clean-bootstrap.sql`. The preflight refuses existing custom application tables/views/functions, a private schema or any existing Auth users/buckets/objects. It does not clear an existing project to make it empty. Existing unrelated policies/objects need review too. No reset, source import, seed, role overwrite, paid plan or Firebase command is run.

The migrations are individually transactional and deliberately fail on conflicting objects. A later-step failure may leave earlier migrations applied. Inspect migration history and recover forward; do not reset, blindly rerun the clean installer or repair history to pretend SQL succeeded. If CLI link/push requires database/operator credentials unavailable locally, provide them through a protected operator environment, not chat or `NEXT_PUBLIC_*`. The existing login supports Management API SQL inspection; it does not guarantee every CLI database command is authorized.

## Schema / Storage / RLS

Apply the five existing migrations in order:

1. `202610070001_core.sql`: relational customers/profiles/ordered links/handles/orders/contact+draft snapshots/payments/fulfillment/reviews, private ownership/staff/provenance, indexes/constraints and SELECT RLS.
2. `202610070002_rpc.sql`: narrow read/transactional-write RPCs, explicit execution grants, server pricing and lifecycle gates.
3. `202610070003_storage.sql`: bucket configuration and account-owned upload/read policies.
4. `202610070004_submission_recovery.sql`: exact account/request receipt lookup for interrupted submissions.
5. `202610070005_manual_payment_quote.sql`: quote required before staff confirmation; null/stale/verified-total changes rejected.

There is no production seed. The `ibraheem` reservation is configuration only, with no profile/customer attached. New customers are created when a real authenticated user submits an order; paid orders are published by staff. Signup itself does not create fabricated orders/profiles. `private` remains outside the exposed Data API schemas, with no app usage grants.

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

Production Auth must use:

- Site URL `https://edgetapflow.web.app`.
- Redirect allowlist `https://edgetapflow.web.app/account` and `https://edgetapflow.web.app/account/recovery`.
- Email provider/signup enabled; email confirmation enabled; minimum password eight; anonymous sign-in disabled.
- Verified custom SMTP/sender and suitable rate limits. [Default Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp) is restricted to project-team addresses; it is not an operational commercial email service. No sender/provider is assumed or purchased here.
- Confirmation/recovery templates using the generated confirmation URL, with real approved mailbox/callback verification. The SPA handles Supabase URL sessions; no server callback route is required for this client-only Auth integration. See [redirect configuration](https://supabase.com/docs/guides/auth/redirect-urls).

No Firebase user/password/session transfers. New production users register and confirm normally. A signup response without a session cannot upload or submit. Recovery requires a PASSWORD_RECOVERY session event and signs out after successful password update.

A real staff member must register and confirm first. An authorized operator must verify their exact Auth UUID, then deliberately insert `private.admin_members(user_id,active,provenance)` for that user. No automatic administrator exists. Use truthful provenance identifying owner authorization. Never select the old test account, auto-promote the first signup or rely on `raw_user_meta_data`.

## Public configuration / ordering

Provide locally:

```dotenv
NEXT_PUBLIC_DATA_BACKEND=supabase
NEXT_PUBLIC_SUPABASE_URL=<real HTTPS project URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<public key only>
NEXT_PUBLIC_APP_URL=https://edgetapflow.web.app
NEXT_PUBLIC_ONLINE_CHECKOUT_ENABLED=false
```

The static export embeds these public values. Never use a secret/service-role key or database password. Missing configuration stops the build. Explicit `NEXT_PUBLIC_DATA_BACKEND=firebase` remains available for legacy development; there is no implicit fallback.

Manual JazzCash is the sole approved payment method. Before paying, agree delivery availability/fee/dispatch, digital-hosting terms and full cost on WhatsApp. Staff enter the agreed delivery fee, review the actual transfer against the complete total, confirm payment, publish the profile, then perform physical printing/NFC/QR/QA/shipping steps. No automatic gateway exists.

Lost-response order retry uses the original request UUID and fingerprint. This tab stores only account/request IDs. Refresh checks the account-bound receipt; an ambiguous result blocks another submission until recheck/support resolves it. Closing the tab or switching devices requires operator/customer reconciliation. The owner must approve real hosted ordering/payment checks before enabling the checkout flag.

## Hosted verification and future release

```sh
npm run check:supabase:hosted
```

This command is read-only with the public key. It verifies RPC availability, absent-profile null, anonymous table/staff denials and absent-object public URL failures. It creates no user/profile/order/file and cannot prove access to an existing private file is denied. Missing config fails before requests. A verified real owner/profile or separately identified development destination is needed for real profile/signup/order/storage/manual-payment/QR tests; do not seed fictitious production data to claim readiness.

Keep Firebase Hosting/NFC URLs. Do not deploy/push until separately approved. Verify schema, Auth emails/sessions, Storage bytes, private denials, real payment handling and all customer acceptance checks first. Resolve delivery/hosting policies and legal/privacy review. Rebuild with real public configuration and test Hosting rewrites/headers on an approved preview before release.

Firebase SDK helpers/package/rules/emulator/source-inventory tooling may eventually be removed after successful cutover and an explicit rollback decision. Firebase Hosting/domain/CLI are still needed while `.web.app` serves EdgeTap. Nothing is deleted or disabled now; old Firebase test data is not a dependency of the clean Supabase setup.
