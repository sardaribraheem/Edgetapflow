# Free website profiles and flexible staff fulfillment

Owner request: 26 October 2026, Pakistan time. Website only. The owner reports their first paying customer, Tarsil.pk, requested an NFC tag rather than a printed card. This is owner-reported commercial evidence; actual tag programming/handoff has not been verified here. Do not delete or seed customer data during testing.

## Decisions

- A public Email link is optional. New card drafts start without a preselected Email link. Account email remains private and required for account sign-in; it is never automatically copied to public links.
- A customer can submit a payment reference/transaction ID **or** an owned private receipt. Supplied references are validated; supplied files still need correct ownership. Neither input automatically verifies money. Failed receipt uploads/previews must not force another upload when a reference is present.
- Verified staff can publish an order profile immediately without review, payment verification, a card specification, proof files or an email. Publication does not manufacture any of those facts. The handle is still transactional, unique, owned by the original customer and on `https://edgetap.tech/u/<handle>`. Earlier saved NFC destinations and approved print snapshots remain unchanged.
- Admin can choose Printed NFC card, NFC tag / chip only, or Digital profile only. This changes workflow, not an agreed price. No new public tag price is invented. Tag and digital-only modes do not show printing/proof tools.
- Staff can update fulfillment directly. Existing optional proof/PDF tools retain their technical validations; they are not required to publish or record manual production.
- The bottom staff checklist has eight independent private checks: name, links, photo/bio, hardware details, payment, live profile/destination, production readiness and handoff. Checking boxes neither blocks actions nor sends messages/email. Explicit Start review/Mark review complete update only in-account customer status. Automatic email invocation/queueing is suppressed for these staff operations. Customer messages and proof emails remain explicit optional actions.
- The owner confirmed **one free profile/account, up to 10 links**. A confirmed signed-in account can publish it directly with no order, payment or admin acceptance. Name/photo/title/bio/public location and chosen links are editable. Handles remain stable; payment/account/delivery fields are not public profile fields.
- Every public profile retains EdgeTap branding and a card-order CTA. An owner clicking that CTA reuses their existing profile and current catalog card price; someone else cannot select that profile through a URL. Pricing gets a separate Rs. 0 free-profile option, preserving the existing golden paid-plan comparison.
- Admin can edit customer public details without the customer password, and remove/restore profiles from public view. This retains ownership, reservations and customer/order records and prevents someone else taking the old handle. No actual customer profile is removed by this release.

## Existing-site audit

Preserve the Next static export, Supabase backend, Firebase Hosting, Fredoka/Inter type, cream/navy/gold palette, rounded paper controls, existing URLs, noindex/private routes and responsive paid pricing carousel. Apply the frontend design skill only to the marketing/pricing surface; admin and forms remain native project components. Redesign mode: preserve, design variance 7, existing marketing motion 6 (new free-profile panel has no animation), visual density 4. The order detail view retires the long flat sequence of mandatory-looking operations: publication and item type become primary, optional files/messages/notes collapse, and the checklist moves to the bottom.

## Migrations and validation

Released additive website migrations 024 (payment alternatives), 025 (direct staff controls/audit/private checks), and 026 (free profiles/moderation). Do not apply optional 016 or alter the existing app contract 019. Preserve current pricing revisions, order balances, customer profiles, ownership and print snapshots. Use isolated SQL/browser fixtures with fake customer identities; no real funds, emails, order submissions or moderation writes during QA.

The owner explicitly chose to leave Tarsil.pk’s existing public Email link and profile unchanged.

The separate [branded authentication email plan](AUTH_EMAIL_PLAN.md) includes ready-to-use templates. SMTP/DNS/sender activation is separate from the website release and must not be claimed as complete without actual inbox/callback verification.

## Release evidence

Released at 26 October 2026 at 8:32:34 am Pakistan time, Firebase Hosting `cabbc34a2b3f0358`. The exact 024/025/026 transaction preserved existing records, prices/outbox and app definitions. The owner explicitly chose to leave Tarsil.pk unchanged; no customer data was edited during QA/release. Optional 016 remains unapplied, order email stays disabled and Auth SMTP is unchanged.

Production/fixture builds, TypeScript and lint (zero errors), legacy SQL regressions, 17 pricing/profile and 16 new SQL scenarios, exact release-transaction validation, 97 website/26 pricing browser regressions and 28 new free-profile/staff browser checks passed. The live read-only verifier and 24 public HTTP/browser checks passed. Release guard: 119 SEO/static checks and 153 text assets. Local workflow Auth/Storage/funds were simulated; actual mail delivery/private-byte access/physical handoff remain separate work.
