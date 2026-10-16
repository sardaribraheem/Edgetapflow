# Backend guide

**Current launch authority: [LAUNCH_STATUS.md](LAUNCH_STATUS.md).** App work is deferred. This supporting guide does not independently establish mailbox delivery, real customer success or physical QA.

EdgeTap is a static Next.js website. **Supabase handles accounts, database and uploads. Firebase handles Hosting only.** There is no payment gateway or courier integration. No proof sender was found in the inspected repository or deployed Supabase Functions; external transport status is unverified. Do not change Firebase data-service rules for this workflow.

## 1. Files and configuration

| Area | Location |
|---|---|
| Supabase connection | `lib/supabase.ts`, `lib/backend.ts` |
| Account/sign-in helpers | `lib/auth.ts` |
| Ordering payloads and RPC calls | `lib/application.ts` |
| Profile/order data access | `lib/data-service.ts` |
| Public profile URL | `lib/site.ts` |
| Device-only draft | `lib/guest-draft.ts` (IndexedDB, not production database) |
| Private/public uploads | `lib/upload-service.ts` |
| Physical settings/snapshots | `lib/physical-card.ts` |
| Schema changes | `supabase/migrations/` |
| SQL verification | `scripts/test-*.mjs`, `supabase/verify-ordering-upgrade.sql` |

`.env.local` contains PUBLIC Supabase URL/publishable key, backend selection and canonical origin. Keep it private and uncommitted. Public variables are embedded in builds; rebuild after changing them. Service-role keys, operator tokens, database passwords and SMTP credentials belong only in private operator/worker environments. Never put them in `NEXT_PUBLIC_*`.

## 2. Data and permissions

| Data | Main tables | Who may access |
|---|---|---|
| Published profile/name/bio/links | `public.profiles`, `profile_links` | Active profiles are public; owners edit permitted fields through RPC |
| Profile ownership/handle reservation | `private.profile_owners`, `public.handle_reservations` | Controlled by transactional staff publication |
| Customer/order | `public.customers`, `orders`, `order_contacts` | Customer's own data and verified staff |
| Saved application | `public.order_applications` | Owner; staff review through protected operations |
| Digital profile draft | `order_profile_drafts`, `order_draft_links` | Private until staff publishes |
| Payments/physical stages | `public.payments`, `fulfillment_events` | Staff-controlled updates; owner sees their status |
| Staff membership | `private.admin_members` | Verified enrollment; signing up does not make someone staff |
| Notes/email jobs | `private.order_notes`, `design_proof_emails` | Private staff/worker operations |
| Template versions | `private.print_templates` | Registered by an authorized migration |
| Physical card/proof revision | `orders.physical_card`, `print_revision`, `print_snapshot` | Customer intent via draft submission; corrected source images and final proof are staff-controlled |

RLS is the database permission system. Security-definer RPCs check identity/staff/ownership explicitly and use an empty search path. Do not add a broad public policy or use a service-role key in the browser to make an error disappear.

Storage: `avatars` is public; `payment-receipts`, `order-artwork` and `print-packages` are private. Staff upload print PNG/PDF artifacts under their UID. Customers can read only files referenced by their current proof. Store paths, not permanent signed download URLs.

## 3. Order and proof flow

1. Device draft → signed-in private application → submitted order. Server verifies input and fixes price/quantity. A receipt screenshot does not mark payment paid.
2. Staff checks actual JazzCash transfer, confirms requested specification and accepts the application.
3. Staff confirms the direct destination (Link Card), or publishes the active profile and claims its immutable handle in a transaction (EdgeTap Profile). QR/NFC use that exact confirmed URL.
4. Print package renders both faces, stores private PNG/PDF files and calls `prepare_print_proof`. A revision snapshot freezes template, wording, QR, quantity, settings and artifact paths. It clears previous approval/deadline and supersedes queued old emails.
5. With reviewed migration 015, staff uses `share_design_proof`; the actual owner responds through `respond_to_design_proof`. No mail is sent or clock started; explicit current-proof approval is required. Staff manually shares the private account link. The advanced email path remains: `queue_design_proof_email` only queues; worker-only `private.design_proof_email_sent` requires actual transport confirmation before the ten-hour clock. Existing timely-reply/no-response guards remain.
6. `get_print_package` and the printing transition require verified amount, accepted specification, confirmed direct destination or active correct profile, confirmed RGB settings and approved current proof. Front/back/QR changes require another proof/review. Later digital profile edits do not change the snapshot.
7. Actual printing → NFC programming → physical QA → pickup/rider handoff. Record a stage only after the operator does it.

New order references are server-generated `ET-MMDDYY-sequence`, using the Pakistan date and a PostgreSQL sequence starting at 1001. Retries retain the same order/reference; numbers are never recycled and may have gaps. Existing references/internal IDs remain unchanged.

## 4. Register a new template/version

First add the exact definition to `lib/data/card-templates.json` (see [developer guide](developerguide.md)). Create a **new** timestamped SQL file in `supabase/migrations/`; never edit an already-applied migration.

```sql
begin;
insert into private.print_templates(id,version,definition)
values ('your-design',1,$json${...the exact JSON object...}$json$::jsonb);
commit;
```

That object must contain the same ID/version, colours, slots, font and background paths as the frontend definition. Replace the example JSON with the complete real object. A redesign inserts a higher version while keeping the old row and versioned asset filenames. Do not update/delete a definition used by approved orders. Run local SQL tests and rebuild before applying/releasing it.

Once its open orders are resolved, to retire a version from new proof preparation, an authorized migration can set its `active=false`; existing approved snapshots still describe the original files. Do not remove old JSON definitions while open orders need them.

## 5. Test without changing live customers

```sh
npm run typecheck
npm run lint
npm run test:supabase
```

SQL suites use an isolated PGlite PostgreSQL database. They do not touch hosted data. Browser suites require a deliberately isolated export:

```sh
NEXT_PUBLIC_DATA_BACKEND=supabase \
NEXT_PUBLIC_SUPABASE_URL=https://edgetap-migration-test.supabase.co \
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_edgetap_local_test_only \
NEXT_PUBLIC_APP_URL=https://edgetapflow.web.app \
npm run build -- --webpack
PORT=4173 npm run serve:qa
```

In a second terminal:

```sh
QA_BASE_URL=http://127.0.0.1:4173 npm run test:design-review:browser
QA_BASE_URL=http://127.0.0.1:4173 npm run test:card-products:browser
QA_BASE_URL=http://127.0.0.1:4173 node scripts/test-physical-card-browser.mjs
QA_BASE_URL=http://127.0.0.1:4173 node scripts/test-order-workflow-browser.mjs
QA_BASE_URL=http://127.0.0.1:4173 npm run test:ux
```

Auth/Storage HTTP and email transport are simulated in these tests; SQL/RLS is real local PostgreSQL. They do not verify actual email delivery, money or physical cards. **Never deploy the fixture export.** Rebuild with the real `.env.local` and run `npm run check:release` afterward; it rejects fixture/privileged values.

## 6. Apply changes and troubleshoot

Owner authorization is needed for corresponding production schema/data changes. After local tests and a reviewed migration, use the linked Supabase project and inspect `supabase db push --dry-run --skip-vault` before `supabase db push --skip-vault`. Confirm the project; never reset the live database. Re-run hosted read-only probes afterward. Keep database work separate from Firebase Hosting publication.

| Symptom | Check |
|---|---|
| Signed-in admin looks like a customer | Email verification and active staff membership; do not invent a shared admin password |
| New template cannot submit | Matching registered ID/version and exact physical settings |
| Draft cannot submit | Current draft version, owned files, valid links/contact fields and receipt |
| Printing disabled | Current shared/approved proof, verified amount, printer confirmation and confirmed destination; real transport guards apply when using email review |
| Download denied | Sign-in/staff status, current artifact path and Storage policies |
| QR points to wrong profile | Final handle and canonical `profileUrl`; regenerate/reapprove artwork |
| Unknown handle shows missing profile | Verify publication; never fall back to founder data |

Use `node scripts/check-live-services.mjs` and `npm run check:supabase:hosted` for read-only checks. Report sanitized actionable errors; never log tokens, receipts, addresses or signed upload links. See [adminguide.md](adminguide.md) for compact operator steps.

Do not recommend `test:supabase:hosted-browser` as a current live check: it assumes an absent founder/clean project. Its correction is [prepared separately for review](OPERATIONAL_FIXES_FOR_REVIEW.md). Fresh migrations 001–011 and the 33 read-only boundaries are recorded in launch status.

## 10. Card products and migration 012 (applied 16 October)

[Card offers guide](CARD_PRODUCTS.md) describes the released implementation. Hosted baseline is 001–015; [release evidence](RELEASE_2026-10-16.md) records the owner-approved migration and Hosting steps. Builds/tests do not apply hosted migrations. Never rerun or edit an applied migration.

`ApplicationPayload.product` is `direct_link` or `profile`; `directLink` is accepted only for Link Card. New requests without a label use the Profile price (Rs. 1,499), so omitting metadata cannot buy a profile at Rs. 999. Existing submitted `standard` orders keep their original Rs. 999 price when corrected; product changes are blocked. Unsubmitted drafts review current pricing.

Schema 2 adds a validated front/back editor scene (12 text layers/face, four font choices, colour/gradient values and normalized positions), QR opt-out/placement on presets and separate required front/back uploaded artwork. Schema 1 and its snapshots stay supported. New template `custom` is registered without changing old template definitions. Artwork remains private.

Link Card uses `confirm_link_destination`: staff-only, version checked, accepted application, confirmed spec and matching verified payment. It sets the exact validated URL; no public profile is created. The existing internal `profile_created` state represents destination readiness and is labelled **Card destination ready** in the UI. Profile orders still publish a real active canonical profile. Shared `destination_ready`, proof snapshots and print readiness cover both types without bypassing email/reply/payment/printing/NFC/QA guards.

The link budget uses the normalized percent-encoded URL, UTF-8 byte count, uncompressed URI identifier/record, short-or-long NDEF header, short-or-long TLV length and terminator, within NTAG215’s factory 496-byte NDEF area. NTAG215 has 504 user bytes, not 540 URL bytes. See [NXP §8.5.4/Table 4](https://www.nxp.com/docs/en/data-sheet/NTAG213_215_216.pdf). Actual stock chip/capacity/read/write still needs inspection. NFC programming remains manual.

`get_order_settings.offerPrices` gates the new customer payment flow. If the hosted backend is still 011, account transfer/payment for the new offers stops before receipt collection. General mail transport remains unchanged/unverified. No deployed worker was introduced.

## 11. Text transforms and editor capability (013, applied 16 October)

Migration 013 adds optional numeric text `rotation` in −180…180 degrees through a strict validator wrapper, preserving 012’s ownership, shape, template, QR and private-file checks. Missing angles remain zero; malformed/missing scenes are still rejected. Previous validator/settings aliases remain inaccessible to clients. No existing scene/order is rewritten.

The settings RPC advertises `cardEditorVersion: 3`. The new frontend requires it for scenes with a custom editor before account transfer/payment, so a backend at 011 or 012 cannot collect payment for unsupported transforms. That increment needs 012 then 013; the current frontend requires reviewed 012 → 013 → 014 → 015. Read-only verification accepts the supported historical baselines through 015 and checks corresponding capabilities when present.

Text extents rotate with the layer for print-safe checks. Shared coordinate mapping accounts for bleed and rotated backs; the live preview preserves the complete bleed aspect ratio. Actual exports contain the scene, with no selection handles. Reopened direct-link payloads preserve the private contact name separately from the printed heading. Final proof generation uses the printed heading. The change introduces no mail worker, payment automation or new production verification.

<a id="12-artwork-presets-and-brand-logo-014-localunapplied"></a>

## 12. Artwork presets and brand logo (014, applied 16 October)

Prepared migration `202610160014_card_artwork_and_branding.sql` appends version-2 definitions for `simple`, `lux`, `wood`, `inverted`; version 1 remains unchanged for historical orders/proofs. It adds `profiles.logo`, validates `physical.logoUrl` against an owned object in the existing public avatars bucket, and includes the logo in public profile JSON. A Link Card logo does not create a digital profile. No new bucket or identity system is introduced.

Publication reuses existing staff/acceptance/payment/handle guards, then copies the validated order logo. Owner edits preserve stable handles and optimistic versions; invalid logo updates roll back. Wrapper aliases are revoked from clients. Adding/removing a public profile logo after publication does not rewrite an approved physical card or proof.

Settings advertise `cardEditorVersion: 4`. New preset versions and optional-logo checkout require this before account transfer/payment; custom text transforms still require at least 3. **012, 013, 014 and 015 were applied with explicit owner approval before the matching frontend release.** Local test commands do not apply hosted migrations. Hosted 001–015 is the verified baseline.

`npm run test:card-gallery` covers owned/unowned/missing logo paths, publication guards, anonymous field privacy, immutable handles, rollback and wrapper grants. `test:card-gallery:browser` covers responsive gallery/modal behavior, device recovery, authenticated logo transfer and owner editing. Auth/Storage transport is simulated; real email/payment/private-byte and physical QA evidence remains outstanding in [launch status](LAUNCH_STATUS.md).

<a id="13-private-account-proof-and-revision-policy-015-localunapplied"></a>

## 13. Private account proof and revision policy (015, applied 16 October)

`202610160015_customer_design_review.sql` was applied with owner approval after **012 → 013 → 014**, and the matching frontend is released. Existing orders are assigned `legacy`; only newly created orders default to `one_included`. No old commercial terms are rewritten.

- `share_design_proof(id, version)` is staff-only and requires the accepted, paid order, specification, confirmed destination and current saved proof. It supersedes queued email jobs and records the shared revision, without recording sent email/deadline.
- `respond_to_design_proof(id, revision, action, note, version)` checks actual ownership, version, current shared proof and all payment/destination/specification guards. A revision note must be nonempty and uses the included request once. Approval alone does not advance physical production.
- `record_design_edit_payment(id, amount_minor, note, version)` requires staff, an already-used included request, an actual manually verified agreed payment and private verification note. It grants one further request; it neither collects money nor changes the card subtotal. The ledger `private.design_edit_payments` is inaccessible to customers. The note is not exposed in customer JSON.
- Regenerating the proof clears sharing/approval but preserves the used allowance and paid ledger. Stale/double replies are rejected. Existing email reply guards consume the same revision allowance transactionally, so switching channels cannot obtain another free edit.
- Private account review has **no automatic timeout**. Existing real-email review retains its restricted transport confirmation, ten-hour window and inbox/reply checks. No worker/sender is introduced.

`get_order_settings.designReviewVersion: 1` is required before new-product account transfer/payment. Keep this separate from `cardEditorVersion: 4`. `verify-ordering-upgrade.sql` checks the corresponding migration/capability when present; it does not apply anything. The completed release order was **012 → 013 → 014 → 015**, then promotion of the reviewed Firebase preview. Hosted 001–015 is the verified baseline. `supabase/verify-card-release.sql` checks the released capabilities and private edit/RPC boundaries read-only; do not rerun the applied migrations.

`npm run test:design-review` exercises SQL ownership, revision quota, stale/concurrent requests, paid-credit privacy, legacy migration behavior and channel/printing guards. `test:design-review:browser` tests both checkout modes, custom-popup-only canvases, real PDF/PNG rendering, private account review, sign-in return, included/paid revisions and progressive hero breakpoints. Auth, Storage and funds are fixtures; real private bytes, ordinary Auth email and actual production/handoff need separate evidence.
