# EdgeTap pricing and deployment — 8 October 2026

Publication was explicitly authorized by the owner's “and yeah deploy it too” request, superseding the earlier task-specific no-deploy rule. Work remains on `launch-readiness`; nothing is pushed to main. The approved destinations are Firebase Hosting `edgetapflow` and Supabase `dxyxvervvlxhwwbcbttd` only.

## Pricing and design

Four equal pricing cards share a desktop row. Smaller screens retain one keyboard-accessible, horizontally scrollable row with a visible comparison hint and no page overflow. The reference's existing cream/navy/yellow brand, Fredoka/Inter fonts, outlined paper cards and pill buttons are preserved.

- Standard Digital: **Rs. 999 per card**, standard guest-first ordering and manual JazzCash.
- Business NFC: **contact-only custom quote**, expressly confirmed by the owner. No unconfirmed Rs. 2,499 package or automated services.
- Your Website + Cards: **Rs. 29,999**, four linked cards requested during the first year, first-year hosting/domain included; **Rs. 3,000 annually from year two**. Contact-only, no premium checkout or automated subscription logic.
- Custom NFC Solutions: separately scoped, contact-only custom quote.

Pricing metadata and the terms page use the new website price. Contact provides the approved WhatsApp number and public email. Confirmed pickup, direct-rider extra charges, standard PVC dimensions and final-design terms remain visible. No lifetime hosting, fake popularity badge, blanket return promise, fabricated analytics or already-built custom software claim is copied from the reference.

Frontend skill: preserve-mode; `DESIGN_VARIANCE=3`, `MOTION_INTENSITY=2`, `VISUAL_DENSITY=4`. Existing light theme and Tailwind/native CSS are retained; the owner's explicit one-row requirement overrides the skill's default mobile stacking. No new application dependency. Mobile logo gets an accessible home label, navigation fits without its unintended desktop CTA, and brand font uses one variable family rather than four static weight downloads. Home/account prefetch is deferred on the pricing navbar.

## LOCAL VERIFIED

101 ordering/guest/sign-in browser checks passed with actual isolated PostgreSQL/RLS and simulated Auth/Storage HTTP. The final real-config export passes **384 responsive/navigation/metadata/row/scroll/CTA-fit assertions** at 320/360/390/768/1440 px. Desktop and mobile screenshots inspected. Typecheck/build pass; lint has zero errors/six existing image warnings. All 131 exported HTML/JS/CSS/TXT/SVG/XML assets passed approved-destination and fixture/private-key pattern checks.

53 SQL/RLS checks, forward preservation and the tested upgrade preflight/postflight pass. No local fixture was submitted to a hosted project. Local Lighthouse after accessibility/prefetch/font fixes: accessibility/best practices/SEO **100**, performance **83**, simulated mobile LCP **4.6 s**, CLS **0**. This is a throttled local lab result, not field performance or a physical-device guarantee.

## HOSTED VERIFIED

The refreshed project identity/inspection and read-only guard passed. Reviewed dry run listed only 007–009, no seeds/custom roles. They were applied with `--skip-vault`, preserving Vault, all existing accounts/data and the Firebase project.

Hosted history now **001–009**; all **23** application tables have RLS; private schema unexposed. Ordering settings/My orders/application RPCs exist. Storage visibility, owner-prepared-artwork read policy, revoked legacy payment endpoint and restricted actual-email completion hook verified. SQL role simulation against the existing unenrolled account verifies owned reads and denies staff/payment/dispatch/private-directory access; this is distinct from a fresh Auth/JWT browser session.

**29 actual hosted API access-boundary checks** pass, including public settings, denied anonymous draft/order/payment/dispatch operations, Auth settings/JWKS and private bucket URLs. **12 fresh anonymous browser checks** on the final export pass against actual Supabase. The prior owner-entered real Auth request returned HTTP 200; no password or token was read/logged. A post-upgrade real authenticated order has not yet been submitted.

Before/after aggregate inventory: **one Auth user**; zero customers/orders/payments/profiles/reviews/staff members/Storage objects. Only operational configuration was created, no fabricated production fixtures or imported Firebase test data. Firebase billing/Auth/rules/data and DukanKhata are untouched.

## Hosting release

Final export published to the one-day preview:
https://edgetapflow--pricing-20261008-i2alya3a.web.app

**Live release succeeded:** https://edgetapflow.web.app/pricing. Firebase Hosting version `317502f5de7c600c`.

Both preview and live site passed **384** route/layout/row/scroll/metadata assertions and **12** fresh anonymous real-Supabase browser checks. A separate Lighthouse run against the deployed page scored **100 performance / 100 accessibility / 100 best practices / 100 SEO**, simulated mobile LCP **1.5 s**, CLS **0**. This is a lab result, not a field/device guarantee. The first preview anonymous run timed out on a profile heading; a focused trace returned HTTP 200/null and the correct missing state for both handles, and the full rerun and live suite passed. No weakening of rules, fallback founder content or fabricated profile was used.

Hosting includes only static assets/configuration; no Firestore/Storage rules, Functions or billing changes. Existing unrelated `.gitignore` edits and screenshot deletions are preserved.

## REMAINING BLOCKERS

Publication is separate from commercial launch readiness. **NOT READY TO LAUNCH** until the real customer/admin/physical flow is verified.

- **Technical:** register/verify and deliberately enroll the intended first administrator; publish a real example profile; verify actual customer receipt/order, staff review/payment, public profile editing and physical QR/NFC/card/fulfillment flow. No fake order/profile substitutes for these tests.
- **Business:** delivery coverage/dispatch commitment, cancellation-before-production and defect-reporting/remedy details, future standard-hosting duration/change notice.
- **Billing/infrastructure:** verified SMTP/sender and monitored reply mailbox; real final-design sender/worker. No email is faked; proof timer starts only on actual sending, and printing remains held without approval. No Blaze/billing/payment method was enabled. Privileged-key rotation remains an operator action already documented after the earlier chat disclosure; no privileged key is embedded in the export.
- **Legal/policy:** review personalized-card remedies, privacy/retention and the ten-hour email/silence-confirmation process; business directions are not a legal certification.
