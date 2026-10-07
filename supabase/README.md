# EdgeTap Supabase implementation

The migrations and adapters are prepared locally. Firebase is retained; there is no automatic deployment, billing activation, export or database application. Read `SUPABASE_MIGRATION_REPORT.md` and `SUPABASE_MIGRATION_AUDIT.md` before operating on customer data.

## Local verification

```sh
npm run typecheck
npm run lint
npm run test:supabase
npm run test:migration
```

`test:supabase` runs actual PostgreSQL/RLS/RPC logic in PGlite with minimal local Auth/Storage schema stubs. It does not run hosted Supabase. Docker is absent in the current workspace, so full local Supabase service testing has not been substituted with a claim of hosted verification.

The browser integration suite requires a local static export built with deliberately fake test configuration:

```sh
NEXT_PUBLIC_DATA_BACKEND=supabase \
NEXT_PUBLIC_SUPABASE_URL=https://edgetap-migration-test.supabase.co \
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_edgetap_local_test_only \
NEXT_PUBLIC_ONLINE_CHECKOUT_ENABLED=true npm run build -- --webpack
PORT=4173 npm run serve:qa
# In a separate terminal:
QA_BASE_URL=http://127.0.0.1:4173 npm run test:supabase:browser
```

These values are test fixtures. Browser Auth/Storage endpoints are intercepted, and RPCs execute against the local SQL test engine. Do not publish this export. Rebuild with existing/default configuration after testing. New SQL does not automatically fix the current live Firebase profile failure.

## Backend selection

`NEXT_PUBLIC_DATA_BACKEND` defaults to `firebase`; explicitly select `supabase` only for a reviewed build. Supabase mode requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The client rejects privileged secret/service-role keys. Static exports bake these values at build time. Operator credentials, Auth exports/hash parameters and database passwords must remain outside the repository/browser environment.

`NEXT_PUBLIC_ONLINE_CHECKOUT_ENABLED` remains false until real Auth, uploads, persisted pending orders and manual quote/payment/fulfillment checks pass. The supported method is manual JazzCash; no automatic gateway verification exists. Changing backends cannot decide delivery or profile-hosting terms.

## Destination schema and permissions

Apply the three migration files in order only to the explicitly selected empty staging destination, using an authorized operator connection. They create tables/functions/policies and Storage buckets; they intentionally fail on conflicting existing objects. Do not run a database reset, destructive diff, or blindly push into an existing project. Restrict the exposed Data API schema to `public`; never expose `private`.

- `202610070001_core.sql`: relational tables, private identity/staff/source mappings, constraints/indexes, SELECT RLS and revoked direct app writes.
- `202610070002_rpc.sql`: controlled reads and transactional writes; execution grants are explicit.
- `202610070003_storage.sql`: public avatars, private artwork/receipts/quarantine, upload/read policies. No app overwrite/delete.

Staff access comes from trusted `private.admin_members`, never `user_metadata` or guessed email domains. Ordinary staff use normal Auth sessions. Membership can be revoked immediately in the database. Verify staff mapping against the original `config/admin_uids`; the only discovered Auth account is not automatically an administrator.

Public profile lookup returns active display data/links for one handle, omitting owner/customer/payment information. Ownership is checked by an authenticated boolean RPC for the editor. Anonymous profile-table enumeration is denied. Reviews are projected through an RPC that omits internal author/customer identifiers. New order/quote/payment/publication/fulfillment writes use dedicated RPCs; customer payloads cannot set price, owner, payment state or fulfillment state.

## Preserve sources and use the official extraction tools

The [official Firestore guide](https://supabase.com/docs/guides/platform/migrating-to-supabase/firestore-data) supplies `firestore2json` and hooks. Use a reviewed, pinned checkout of its linked `supabase-community/firebase-to-supabase` repository in a protected operator workspace outside this Git repository. Use extraction only; do not run its generic table creator/importer against the application schema. Preserve `firestore_id` and original data. Keep a separate lossless/raw backup where the exporter converts Firestore types; original timestamps/references/bytes and unknown fields must remain recoverable. Inventory subcollections and unknown collections explicitly; this app normalizer stops on unrecognized collections rather than silently dropping them. Export both database IDs separately. The current `(default)` access is HTTP 403, so extraction must not be reported complete or replaced with the empty named `default` export.

Review of the linked [Firestore exporter source](https://github.com/supabase-community/firebase-to-supabase/blob/main/firestore/firestore2json.js) found caught read errors and a default-limit stopping condition that can make an incomplete extraction look finished. Pin/review the tool, make read failures fatal and independently compare exported counts. Also reject source fields that collide with exporter ID fields; the true document path must be preserved. Do not treat an empty file or successful exit as evidence that billing-blocked data is empty.

[Auth migration](https://supabase.com/docs/guides/platform/migrating-to-supabase/firebase-auth) and [Storage migration](https://supabase.com/docs/guides/platform/migrating-to-supabase/firebase-storage) are separate operations. Review the official importer against the current Auth schema before use. Preserve Firebase UIDs, disabled/verification/provider state and export metadata; map to actual destination Auth UUIDs. Do not import hash material into exposed tables, invent passwords, mark unverified emails verified, automatically send recovery mail, or assume imported Firebase hashes work with Supabase password login. Review the required middleware/reset strategy first. Do not create service-account keys merely because an upstream example uses a key file; use already approved operator credentials where supported.

The reviewed [Auth importer source](https://github.com/supabase-community/firebase-to-supabase/blob/main/auth/import_users.js) generates new UUIDs, leaves passwords empty, embeds the exported user in client-visible metadata and logs full SQL on errors. **Do not run it unchanged on production identities.** Hash/salt/source-export material belongs only in private operator storage. Use the official extractor where suitable, then a reviewed sanitized import with verified mapping and recovery/provider/disabled-state handling. `scripts/migration/prepare-auth.mjs` creates an offline sanitized account plan (no passwords or raw source metadata), without creating accounts or sending email:

```sh
node scripts/migration/prepare-auth.mjs /protected/operator/users.json /protected/operator/auth-plan.json
```

Storage must be downloaded to protected local files and uploaded to the intended visibility buckets, with no source deletion/upsert. Preserve source object path/generation/MIME/metadata and hashes. Download the destination object again to verify identical bytes. Reconcile legacy download-token references privately; no token URL should be printed into logs or used for new receipts/artwork. The four inaccessible `avatarInbox` objects require association review and private quarantine first. Public avatar bytes are public even when their profile is hidden; this deliberately preserves current new-avatar behavior.

## Offline import preparation

Protected input directory:

- `source-manifest.json`: `{ "project": "edgetapflow", "database": "(default)", "complete": true, "capturedAt": "<actual snapshot time>", "authMapFile": "auth-map.json", "storageBucket": "edgetapflow.firebasestorage.app", "supabaseUrl": "<selected URL>", "collections": [{ "collection": "profiles", "file": "profiles.json", "expectedCount": <verified count> }, ...] }`. Include all six app collections (`profiles`, `orders`, `handles`, `profilesById`, `reviews`, `config`), including verified empty collections. Unknown counts are blockers, not zero. Do not put credentials in this manifest.
- Each collection JSON is an array of source objects with exact original `firestore_id`. Original/typed backup is retained separately if extraction transforms types. Timestamp support includes epoch milliseconds, date strings and seconds/nanoseconds objects; raw original JSON is archived unchanged.
- `auth-map.json`: array of `{ "firebaseUid": "<source UID>", "supabaseUid": "<actual destination UUID>", "verified": true }`. Derive from verified imported users; do not generate guessed mappings.
- Optional `assetMapFile` names a verified JSON map with `sourceBucket`, `sourcePath`, `sourceGeneration`, `targetBucket`, `targetPath`, `bytes`, `sha256`, `mimeType`, `visibility` (`public`, `private`, `quarantine`), optional verified `firebaseUid`, and `verified: true`. Include every source object; original/destination download paths are used for offline byte verification. Visibility/association review is separate from matching checksums.

```sh
node scripts/migration/verify-assets.mjs /protected/operator/assets.json /protected/operator/verified-assets.json
node scripts/migration/prepare.mjs /protected/operator/export /protected/operator/prepared.sql
```

Both scripts are offline and refuse output overwrite. Sensitive artifacts must be outside the repository, with directory mode 0700 and files 0600. Inspect the prepared transaction privately; test on the staging copy before an authorized import using `psql --set ON_ERROR_STOP=on --file <protected SQL>`. That operator command is deliberately not executed here. Existing Auth users and verified Storage objects must already exist; foreign keys and object assertions prevent a missing-target import. The SQL refuses populated destinations and does not drop/delete tables or Firebase data. The precreated empty founder reservation is the sole controlled reservation association update.

Money converts rupees to integer paisa; unknown delivery fees/totals stay null. Legacy plans/templates/pickup/payment methods/states remain historical facts. Original order/review IDs and valid stable profile UUIDs remain unchanged; non-UUID/missing profile IDs use a deterministic mapped UUID with provenance. Order contact/draft snapshots remain distinct from editable live profiles. Disagreeing mappings, identity gaps, duplicate order numbers and unresolved file visibility stop preparation. Historical missing profile timestamps remain null; they are not fabricated as migration-time customer activity. Missing reservation records receive no invented historical timestamp.

## Finish and cut over

1. Obtain restored source read access or a verified existing backup; reconcile unknown counts and all four objects.
2. Select the destination and review capacity/region/Auth recovery. Configure approved operator access without browser secrets.
3. Apply additive schema to the empty staging target; migrate verified Auth identities and bytes independently.
4. Prepare/validate the relational import; reconcile counts, original IDs, ownership, file hashes, monetary totals, histories and provenance.
5. Test actual hosted anonymous access/private denials, email confirmation/recovery, owner edits/logout, staff permissions, real authenticated pending submission/manual verification and QR/NFC URLs.
6. Resolve delivery/hosting decisions and personalized-card/privacy review. Keep online checkout paused until the actual supported process works.
7. Reconcile a final consistent snapshot/delta and rollback/write-freeze plan. Obtain separate production deployment approval; retain Firebase and `https://edgetapflow.web.app`.

No production migration, notification, write freeze, deployment or Firebase decommissioning is implied by the local tests.
