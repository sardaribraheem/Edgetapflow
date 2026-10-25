# Admin pricing and profile workflow update

Requested 25 October 2026, Pakistan time. Website only; leave companion app source untouched. Preserve the existing uncommitted `info.md` and its guide-index entry.

## Implementation plan and decisions

1. Add a staff-only pricing panel under Settings for current/crossed-out Link Card, Profile Card and website package prices, website renewal, two/three-card offer prices and enabled switches, additional matching cards and additional profile links. The first ten links remain included. Validate prices in the database, handle concurrent staff changes and confirm the saved record before claiming success.
2. Store immutable pricing revisions. New website checkouts use revision-bound version-4 prices; submitted orders and corrections retain their original catalog and legacy terms. Require a refreshed current quote for new submissions after prices change. Existing legacy checkout requests are retained at the initial unchanged catalog; after a genuine pricing change, old clients must refresh instead of silently buying at obsolete prices.
3. Read public pricing dynamically, refresh visible clients on focus/regular intervals and notify other tabs after a staff save. Use the same revision for checkout calculations, offers, extra links and saved order summaries. Do not put hard-coded commercial amounts in generic FAQ/terms/SEO copy that would contradict dashboard edits.
4. Remove all editing controls from the public profile body. Signed-out navigation shows Sign in / Login; signed-in navigation shows My account and Edit profile in the side drawer. The editor lives at `/account/profile`, loads only the account's owned profiles, supports choosing between them and keeps drafts/errors visible until changes are confirmed publicly.
5. Add a confirmed-write profile RPC using the existing owner/staff/version/upload guards. Verify the public read-back matches the requested fields and a newer version before showing success. Revalidate public views and homepage social links after updates and on focus; homepage LinkedIn must no longer come from fixed example data.
6. Preserve payment, acceptance, specification, collision and ownership publication guards. Publish new profiles to `https://edgetap.tech/u/<handle>` using a new additive migration, without applying optional 016 or rewriting existing card destinations. Show the confirmed live link immediately; physical printing/proof approval remains a separate guarded process.

## Evidence found

A read-only public-profile check confirmed the saved LinkedIn URL differs from the fixed homepage example link. The current editor already awaited its write, but did not compare its read-back to the requested fields. The public component also kept a local initial-profile copy that could hide later refreshed props.

The existing staff workflow can already publish before printing after verified payment, accepted review and confirmed card details. The new UI makes that sequence explicit and returns a canonical confirmed URL.

## Validation requirements

- Staff-only financial edits; anonymous/ordinary-account denial; input validation; stale-version conflicts; no tampered client totals; disabled offers rejected.
- New quote arithmetic and extra-link fees match the server. Historical quotes/order snapshots do not change after staff edits. Old submitted corrections retain their own terms.
- Actual owner/public profile fields match after save; stale reads cannot trigger a success label. Signed-out/other-account editing is unavailable.
- Side drawer is the customer editor entry point. No public profile-body Edit profile button exists. Owner menu opens the correct owned profile even when viewing someone else's public page.
- New guarded publications resolve publicly on edgetap.tech before printing. Existing handles/NFC URLs/approved snapshots remain intact.
- Check narrow mobile and desktop layouts, release configuration and isolated browser/SQL workflows before publication.

## Release and evidence

Released website migrations 022/023 and Hosting `39b6167934063bc3` on 25 October 2026 at 10:50:53 am Pakistan time. Optional 016 remains unapplied. The exact transaction verified unchanged existing data and app function fingerprints; no live test customers, orders, payments or profiles were written.

Validation: 17 focused SQL scenarios; existing Supabase regressions; 13 historical offer/ownership checks; seven review privacy/pagination checks; 97 existing browser regressions; 26 focused dashboard/editor/publication browser checks; production and isolated builds, lint and the release guard (117 SEO/static and 145 text assets). The live read-only verifier and 20 public HTTP/browser checks passed. Auth/Storage/payment tests were local simulations. Profile saves were also checked through the founder dashboard, including visibility and stale-version guards. This release does not establish actual hosted private-byte access, money, email or physical fulfillment.
