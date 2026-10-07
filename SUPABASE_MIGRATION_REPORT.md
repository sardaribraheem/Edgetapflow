# Supabase migration implementation — 7 October 2026

**Status: local implementation prepared and tested; production migration/cutover blocked. EdgeTap is NOT READY TO LAUNCH.** Work remains on `launch-readiness`. No Firebase data, users, rules, objects or Hosting release were changed. No Supabase project/database was contacted. No billing was enabled. `.env.local` remains unchanged; Firebase remains the default backend and online checkout remains paused.

## Implemented

- Additive migrations for relational customer/profile/order/payment/review data, private identity/ownership/staff/provenance mappings, indexes and constraints. Every Firestore source document can be archived with its ID, checksum and original fields. Valid stable UUIDs remain unchanged; other profile IDs get deterministic mapped UUIDs with source provenance. Order/review text IDs are preserved.
- Narrow RPCs for exact public profile lookup, bounded owner editing, staff reads, idempotent customer submission, staff payment verification, profile publication and sequential fulfillment. Price, account ownership and new-order status are server-controlled. Delivery fee/total stay null until a staff quote. The stored server order number appears in confirmation.
- Explicit backend selection and application adapters. Supabase mode does not initialize Firebase or use Firebase Auth/data/upload APIs. Firebase helpers/rules/config remain available for the existing installation. Switching the build flag is a future cutover action, not an automatic migration.
- Supabase Auth integration for password sign-in/signup/signout, verified staff membership checks, confirmation-required signup handling, and a static password recovery route. An email-confirmation result without a session cannot submit an order. Imported Firebase passwords are a separate unresolved migration task.
- Public `avatars`, private `order-artwork`/`payment-receipts`, and private `migration-quarantine` buckets with raster MIME/size limits. New paths belong to the authenticated account; overwrite/delete are denied to app sessions. Private downloads use the session, not permanent bearer URLs.
- Offline migration preparation and asset byte-verification scripts. They never connect to a database or source service. They require complete source counts, verified identity/asset associations, preserve historical product/payment values, retain unknown source fields, reject inconsistencies, write protected artifacts outside the repository and refuse overwrite. SQL imports use one transaction and refuse populated destinations.

Implementation entry points: `lib/backend.ts`, `lib/auth.ts`, `lib/data-service.ts`, `lib/upload-service.ts`, `lib/supabase.ts`, `supabase/migrations/`, `scripts/migration/`. Operating instructions are in `supabase/README.md`.

## Evidence and limits

| Check | Result |
|---|---|
| TypeScript | Passed |
| Production static export with existing Firebase selection | Passed |
| Supabase-selected local static export | Passed with isolated fixture URL/key; never published |
| Supabase browser integration | 15 checks passed: public/missing profiles, owner editing, customer/staff gates, persisted pending order/server number, staff download/manual confirmation/publication, QR, anonymous private denial and session-bound recovery; real local SQL/RLS with simulated Auth/Storage HTTP |
| Lint | Zero errors; five existing image warnings |
| Existing responsive browser suite | 364 assertions passed at 320/360/390/768/1440 px; checkout stayed paused |
| SQL/RLS transactions | 20 local PostgreSQL/RLS checks passed, including immediate staff revocation |
| Public configuration preflight | Passed: privileged keys, missing values, unsafe/credential-bearing origins rejected before bundling |
| Offline import preservation | Passed: original order/review/stable profile IDs, relationships, historical plan/template/delivery/payment values, timestamps, currency, history, raw extra fields, trusted staff mapping, incomplete/unknown inventory and overwrite rejection |
| Hosted Supabase Auth/PostgREST/Storage | **Not verified:** no selected destination URL/public key or privileged migration connection available |
| Live source copy | **Not performed:** `(default)` Firestore and all four object byte reads remain HTTP 403 |

SQL testing uses PGlite (PostgreSQL) with minimal Auth/Storage schema stubs because Docker is unavailable. Browser integration tests use these real local SQL/RLS functions with simulated Auth/Storage HTTP; they do not prove hosted signup, SMTP, token enforcement, Storage size limits/CORS or a real JazzCash transfer. Existing public-profile HTTP 403 is still present in production; local migration code cannot repair an unpublished production backend.

## TECHNICAL BLOCKERS

1. Preserve and reconcile a complete `(default)` Firestore export before importing. Counts remain unknown, not zero. Keep the separate named `default` database inventory separate; it is empty and must not be substituted for inaccessible customer records.
2. Migrate the existing Auth user with an explicit Firebase UID → Supabase UUID mapping. Verify email confirmation/disabled/provider state and staff allowlist. Do not promote the one discovered user by assumption. Existing Firebase sessions do not transfer.
3. Choose and test account password continuity: the official Auth importer alone does not guarantee Firebase password login. A reviewed SCRYPT verification bridge requires a server component; a verified recovery/reset approach requires an operational email flow. Neither has been activated or sent to customers.
4. Copy/verify all four legacy objects and reconcile profile references/ownership/visibility. All currently live under `avatarInbox`; keep ambiguous objects private in quarantine. Do not publish them because their prefix sounds public.
5. Verify hosted anonymous profile access, owner editing/logout, staff denials, private byte denial, Auth callback allowlist/SMTP and actual authenticated pending-order submission. Test retry/concurrency and private downloads against hosted services. A request key survives component retries; a refreshed tab needs explicit order-recovery/reconciliation before resubmission.
6. Agree a complete quote before payment, then perform an operator/customer walkthrough of manual JazzCash verification and physical fulfillment. Online submission remains paused. No automatic payment gateway is implemented or implied.
7. Plan consistent snapshot/final delta/write freeze and rollback for orders, profiles, accounts and files before deployment. No production freeze or cutover has occurred.

## BUSINESS DECISIONS

- Delivery coverage, fee and dispatch estimate.
- Digital profile hosting duration and update terms.
- Cancellation before production, print-detail approval and defect-claim handling procedure.

## BILLING/INFRASTRUCTURE BLOCKERS

- Select/configure the destination Supabase project, region and available plan capacity; no paid tier/add-on has been selected. Supply public build configuration locally and an operator-only migration connection outside the repository. A public key cannot apply DDL or import protected Auth/provenance data.
- Existing Firebase `(default)` is outside this project's assigned free Firestore quota; its reads remain billing-gated. Storage bytes also remain inaccessible on Spark. Provide recovered access or an existing backup without this agent enabling billing or deleting services.
- Configure verified Auth URLs and email delivery. Do not assume the default email service is suitable for commercial recovery/signup or sends to all customers.
- Keep Firebase Hosting and `https://edgetapflow.web.app` initially; Supabase database migration does not replace that domain or static Hosting.

## LEGAL/POLICY REVIEW

- Personalized-card cancellation/remedy wording requires review for applicable legal requirements. No blanket refund promise or verified legal-compliance claim has been added.
- Review privacy disclosures for the actual Supabase destination/region, processors, retention and account migration/recovery procedure before cutover. Hosting/update terms and delivery commitments still need the owner's business decisions.

No production readiness claim is made. Source and destination access are necessary to finish the migration; local implementation alone is not a completed customer-data migration.
