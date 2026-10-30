# Pricing logic review, 30 October 2026

The owner requested a fresh logical/economic check, fixes for contradictions, then publication and Git commit/push. This follow-up changes website behavior and explanations; it does not reprice agreed orders, change the live catalog values, enable annual/trial policies, delete customer records or change app source. Release identity and final verification are recorded in [launch status](LAUNCH_STATUS.md) and [release history](RELEASE_HISTORY.md).

## Price structure and actual value

| Option | Current launch price | Reasoning and limit |
|---|---:|---|
| Raw / programmed tag | Rs. 400 / 500 | Programming adds Rs. 100. Actual tag procurement, packaging and time still need recording. |
| Raw / programmed unprinted card | Rs. 500 / 600 | Programming adds Rs. 100; no printed artwork or QR is included. |
| Standard printed raw / programmed card | Rs. 600 / 700 | Standard printing adds Rs. 100 to the unprinted option. Unprogrammed means no saved NFC destination or destination QR. |
| Optional preparation/setup assistance | Rs. 500 once per order | Extra help preparing supplied details or a destination; never a mandatory second programming fee. |
| Customizable Link Card | Rs. 999 | Front/back design choices or supplied artwork, programmed existing destination, optional QR and delivery where coverage is confirmed. Distinct from standard-design pickup hardware. |
| Customizable Profile Card | Rs. 1,499 | Customizable card plus help setting up the profile, with agreed delivery. The same basic profile can be created free by the customer; no exclusive paid profile features are claimed. |
| Matching extra cards / bundles | Rs. 700; existing published bundle rates | Matching design/destination, not another profile charge. Two/three-card offers are deliberate quantity discounts and remain separate from standard hardware quantities. |
| Planned annual digital service | Rs. 1,499/year | Not on sale. Keep marked as a preview while the owner decides cohort, paid value, support and launch terms. Current free profiles do not acquire a renewal bill. |
| Website + four cards | Rs. 29,999, contact-only scope | Renewals require an actual domain/provider/support quote. The editable Rs. 3,000 renewal reference is an estimate, not an offer that covers every domain. Preserve existing agreed customer renewal terms. |

A customer can create the current free profile and buy a Rs. 700 standard programmed card for pickup. That lower-cost route is now explicit. Paying Rs. 1,499 buys the customizable/assisted package, rather than access to a profile that the website otherwise gives away. Hardware by itself does not create or renew a subscription.

The additive hardware prices and current bundle totals are coherent for a launch. They are not a guarantee of profit: the owner-reported Rs. 260 production cost gives Rs. 440 contribution on a Rs. 700 printed programmed card, or Rs. 340 on the Rs. 600 printed unprogrammed card, before packaging, fees, rejects, tax, support and time. Customizable card contribution must also cover included delivery. Raw card/tag costs are unknown; do not derive them from the finished-card cost. Record actual costs before increasing volume or advertising broad delivery coverage.

Rs. 1,499 annual revenue from 100 paying customers is Rs. 149,900. At the explicitly assumed Rs. 280/USD, owner-reported USD 30 domain renewal, Rs. 10,000 other cash costs and Rs. 200/customer annual time value, the remainder is Rs. 111,500/year on free infrastructure, or Rs. 27,500 with a USD 25/month Pro plan, before tax and unmodeled costs. These are scenarios, not invoices; 100 free signups generate no annual revenue. Supabase's [official pricing](https://supabase.com/pricing), checked 30 October, still lists Pro from USD 25/month and free quotas separately. User count alone does not establish a need for Pro or a profitable traffic level.

## Market context

Primary seller pages checked on 30 October: [Tapify](https://tapify.pk/card/) advertises a customized NFC card at Rs. 999; [NFCbusinessCARD.pk](https://nfcbusinesscard.pk/product/nfc-pvc-plastic-digital-business-card/) advertises its printed PVC profile card at Rs. 2,499, two years of profile updates and a separate Rs. 149 delivery charge. Those are their public marketing claims, not verified checkout totals, quality, sales or fulfillment. Different inclusions mean they are useful bounds, not an exact price match. EdgeTap's Rs. 999/1,499 customizable offers are plausible launch prices within this observed range; the Rs. 700 standard card is a deliberately simpler pickup offer.

Do not use the ambiguous dollar-formatted tag listing found during research as a Pakistani supplier quote. Actual delivered supplier invoices and support time remain the deciding inputs.

## Corrections made

- Checkout waits for a complete, locally valid destination and quantity before requesting a quote; quote reads have a deadline and retry guidance.
- Default HTML/unhashed responses revalidate (`max-age=0, must-revalidate`); hashed framework/card-preview assets retain immutable caching. An already-open browser was observed reusing prior-release HTML, so a previously cached copy may need one hard refresh to acquire the new policy.
- Hardware catalog reads now resolve independently of profile-plan metadata. A profile-policy outage cannot replace an admin-published price with a recommended/default rate.
- If the actual hardware catalog fails, the chart shows a retry state and no payable fallback prices. Existing independently loaded customizable prices remain available.
- Pricing, FAQ, terms and privacy describe both checkout paths, receipt-or-reference evidence, standard/custom design scope, included versus separately agreed delivery, and public business fields consistently.
- Programming is included in programmed prices; optional assistance is charged once. Printed unprogrammed checkout correctly says printing is included and no saved link/destination QR/profile is included.
- Annual service is clearly a planned, unavailable offer alongside the current free profile. New annual/trial flags remain off.
- Website renewal is explicitly an estimate with final domain/hosting scope agreed before starting. The admin warns that Rs. 3,000 cannot cover every domain. The editable reference and all old customer agreements are preserved.

## Verification limits

The quote matrix covers six hardware variants at quantities 1, 2, 3 and 20, including once-per-order assistance. Browser regressions cover current published price preservation during a policy outage, catalog outage without invented prices, successful retry, and printed/unprogrammed scope. Existing immutable checkout, annual lifecycle, old-client preservation, business sections and admin pricing tests remain relevant. Real transfer settlement, provider invoices/egress, ordinary confirmation/recovery inboxes and physical print/NFC/handoff still need actual evidence. These claims are not established by fixtures or anonymous HTTP checks.

Fresh verification: 50 product/checkout/business/lifecycle browser assertions, 26 admin pricing/checkout assertions, 15 product SQL groups (including the expanded quantity/assistance matrix), 9 lifecycle groups, 6 business-section groups, 9 image checks and bounded-read tests passed. Lint has zero errors and 18 pre-existing warnings. Production/fixture builds and 119 static checks/154 public text-asset checks passed. All 55 live read-only backend probes passed. Website implementation commit: `7853fc0`; Hosting-header follow-up commit: `6ab18ad`. Final Hosting: `a0df4c3bc6c57c7f`. Six hosted HTML pages match the reviewed production export and revalidate; hashed scripts retain immutable caching. A fresh mobile browser and an existing-browser reload show current copy/prices and working sign-in gating. No browser page errors were observed.
