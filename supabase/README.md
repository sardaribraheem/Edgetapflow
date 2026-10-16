# EdgeTap Supabase backend

**Current authority: [launch status](../docs/LAUNCH_STATUS.md). Updated 16 October 2026 after the authorized release.** Fresh linked history confirms **001–015 applied remotely**; 38 read-only Auth/API boundaries pass, with additional read-only SQL verification of released capabilities and private proof/edit permissions. The backend and Firebase-hosted website are released. Real ordinary-customer email/private-byte/order/payment/profile/proof/physical-handoff evidence remains incomplete. App work is deferred.

New offers/editor/private-proof review are released. **012 → 013 → 014 → 015 were explicitly approved and applied before Firebase publication.** See [release evidence](../docs/RELEASE_2026-10-16.md). Do not rerun the clean installer or any applied migration. See [card offers](../docs/CARD_PRODUCTS.md).

Use the approved destination lock in `project.json`; do not infer another project from a CLI login. Supabase is the selected Auth/Postgres/Storage backend. Firebase records/rules/billing are not a dependency of this workflow and are unchanged by this audit. The founder profile now exists; old empty-database/absent-founder assumptions are obsolete.

## Inspect safely

```sh
supabase migration list --linked
npm run check:supabase:hosted
```

These do not create accounts/orders or verify delivery/payment. Never print API-key/token responses unfiltered. Current SMTP provider configuration is unverified by the public settings probe; historical configuration records are not fresh provider evidence. Auth signup/confirmation is enabled, confirmation is required and anonymous accounts are disabled. Preserve existing callbacks and safeguards; verify real ordinary confirmation/recovery separately when authorized.

No proof sender exists in the inspected repository or deployed Supabase Functions inventory. An external worker was not established or ruled out. The queue is not sending. The restricted send-confirmation hook records real provider acceptance/message ID, starts the existing ten-hour window and does not prove inbox delivery. Manual replies and no-response decisions require actual mailbox checks. See [operational proposals](../docs/OPERATIONAL_FIXES_FOR_REVIEW.md).

## Migration history and permissions

| Migration | Purpose |
|---|---|
| 001–006 | Core relationships, RPCs/RLS, private/public buckets, submission recovery, manual payment guards and safe handles |
| 007 | Private application drafts, review/specification, version-aware amounts, customer/staff messages and guarded fulfillment |
| 008–009 | Standard PVC/dimensions, rider-direct delivery, original/prepared artwork and proof send/reply/window/printing guards |
| 010 | Owner public-field/photo edits, stable handles/owners and owned-profile listing |
| 011 | Versioned physical cards/templates, private front/back/PDF proofs, short references and final printer-package guards |
| 012 | **APPLIED 16 OCTOBER:** Link Card Rs. 999 / EdgeTap Profile Rs. 1,499, validated direct URL, schema-2 front/back editor and product-aware proof guards |
| 013 | **APPLIED 16 OCTOBER:** Optional text rotation, existing validator guards and editor capability checked before payment |
| 014 | **APPLIED 16 OCTOBER:** Versioned artwork presets and owned public brand logos |
| 015 | **APPLIED 16 OCTOBER:** Private account proof sharing/approval, one included revision on new orders and manually verified paid-edit ledger |

Old installer/setup details are preserved in [archive/SUPABASE_SETUP_README.md](../docs/archive/SUPABASE_SETUP_README.md). **Do not rerun the clean installer, zero-record assertions, reset or existing migrations on production.** Future reviewed changes use new additive migrations and need corresponding owner authorization. This audit applies none.

Published profiles are active/exact-handle reads; private ownership/staff membership stays protected. Signup alone creates neither staff permission nor a public customer profile. Staff publish accepted paid physical orders. Existing private file bytes need real owner/staff/other-user access verification; denied anonymous requests to absent objects are not that proof.

| Bucket | Visibility / upload limit |
|---|---|
| avatars | Public bytes / 5 MB |
| order-artwork | Private / 25 MB |
| payment-receipts | Private / 8 MB |
| print-packages | Private staff-produced PNG/PDF / 32 MB; owner reads current proof |
| migration-quarantine | Private operator workflow / 25 MB |

Store private paths and use authenticated downloads. No permanent public receipt links. The server fixes price/quantity, checks ownership and validates payment/review/physical stages.

## Development and verification

Use [backendguide.md](../docs/backendguide.md) for isolated SQL/browser tests and template registration; [BUILD.md](../docs/BUILD.md) for real export commands. Test fixture exports must never be published. Local Auth/Storage/proof simulations prove code behavior, not real inbox delivery, payment or physical execution.

`test:supabase:hosted-browser` currently contains stale clean-project/absent-founder assertions; do not recommend it as the current live launch check until the separately reviewed correction is made. Historical test counts and source inventories remain in [archive/](../docs/archive/README.md).

Current customer payment/fulfillment/pickup/hosting rules are in [Business configuration](../docs/BUSINESS_CONFIGURATION.md); the new NIIT launch focus changes no public policy here. No staff enrollment, SMTP change, secret rotation, schema write, Storage operation or deployment is performed by this documentation cleanup.

Artwork/logo follow-up: applied migration **014** registers four new preset versions and validates optional public logos. The completed release order was **012 → 013 → 014 → 015**, with explicit owner authorization. Older template versions are retained. See [backend guide](../docs/backendguide.md#12-artwork-presets-and-brand-logo-014-localunapplied). Builds/tests do not apply migrations.

Private account proof review (015) sends no email and requires explicit owner approval of the current revision, without a timeout. Staff manually shares the prepared private link; extra preference revisions need an agreed and manually verified payment. Existing orders retain legacy revision rules. Email queue/transport/window guards remain a distinct advanced path. The frontend requires `designReviewVersion: 1` before new-offer payment. See [backend details](../docs/backendguide.md#13-private-account-proof-and-revision-policy-015-localunapplied).
