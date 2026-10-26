# EdgeTap business guide

Updated 26 October 2026. [Launch status](LAUNCH_STATUS.md) records readiness; this guide records commercial decisions and operating context.

## Brand and offers

EdgeTap — **One tap. Infinite possibilities.** Help people share useful contact details through a physical card and an updateable digital destination. Initial focus: Pakistan, especially Lahore, with a personally managed launch at NASTP NIIT. Brand/trademark clearance remains unresolved before major investment.

| Offer | Current price | Owner-confirmed standard price | Scope |
|---|---:|---:|---|
| Free website profile | Rs. 0 | Not applicable | One per confirmed account, up to ten links, owner edits, EdgeTap branding and card-order CTA; staff can remove/restore public visibility |
| Link Card | Rs. 999 first card | Rs. 1,399 | One customer-supplied existing public URL |
| EdgeTap Profile | Rs. 1499 first card + profile | Rs. 2,200 | Editable profile; first ten links included, each extra link Rs. 50 once per profile, not per card |
| Website + four cards | Rs. 29,999 | Rs. 36,999 | Contact-only agreed website/portfolio scope; first year included, Rs. 3,000 annually from year two; cards now or within first year |

These are the initial catalog values. Staff can edit website prices/comparisons, bundles, renewal and extra-card/link rates in Settings. Submitted prices/terms remain unchanged. New version-3/4 orders include delivery, disclosed at payment; historical delivery terms remain intact. Profile links have a technical limit of 100; do not advertise unlimited links.

Cards are PVC NFC, **85.60 × 53.98 mm**; Wood is a printed style. Identical cards in one order share one design and destination. QR is optional and must encode the same destination as NFC. Keep public handles stable and existing printed URLs working. No universal phone-compatibility or instant-open promise.

Customers may choose a preset, customize both faces or upload separate front/back artwork. Final proof approval is separate from checkout. Designer/custom/bulk work requires an agreed scope/quote; the public designer fee requires a separate quote. An internal Rs. 5,000 design-fee idea was never a confirmed public offer.

## Website offers and admin pricing

The website source now shows a Rs. 2,200 crossed-out Profile Card price. For new version-3 orders, the profile and first card cost Rs. 1,499, and each additional card costs Rs. 700. Manually selecting three cards totals Rs. 2899. Clicking the separate three-card offer applies **Rs. 2499**; changing quantity clears that offer. Additional cards for an active profile owned by the signed-in account cost Rs. 700 each, without another profile or duplicate link charges. Existing submitted orders retain their pricing version. Paid extra links for new profiles remain Rs. 50 each above ten; delivery has no separate customer fee on version-3 orders.

Released migrations 020–023 implement these website rules. Initial explicit bundles: Profile two/2099 and three/2499; Link two/1599 and three/1999, with no five-card offer. The dashboard can edit these prices and availability. Manual quantities retain simple unit/additional-card arithmetic and clear a selected offer. The database binds new orders to the current catalog and preserves submitted historical quotes.

The designer's owner-supplied WhatsApp is +92 327 1360809, separate from general support and payments. The requested customer policy now asks for a clear unboxing video to support arrival-damage/defect claims, retaining applicable-law remedies and existing EdgeTap-error handling. Sample reviews have been removed; only intentionally published public reviews appear. Private feedback remains private.

## Payment, delivery and profile terms

| Method | Receiving details |
|---|---|
| JazzCash | 03044149674 |
| Easypaisa | 03044149674 |
| Meezan Bank | IBAN PK46MEZN0000300116179673 |

Recipient for all three: **Muhammad Ibraheem Anwar**. Staff verifies actual funds manually; a receipt screenshot is not payment confirmation. No automatic gateway or courier integration exists.

Current pickup copy: **NASTP Delta 3, Monday–Friday, 9 am–5 pm Pakistan time**. Contact after reaching when ready. NIIT is the launch focus, not an approved pickup-location/hours change. Book delivery manually when ready and record actual fare/message privately. New version-3/4 website orders have no separate customer delivery fee; honor historical saved terms. No invented flat fee, service radius or dispatch deadline.

Standard profile hosting/updates have no separate fee for now; hosting duration and future-change notice remain unresolved. Do not promise lifetime hosting or unlimited free updates. Owners can edit permitted public fields; handles and ownership stay fixed. Optional public city/location is separate from private delivery addresses. Portrait and logo are public when uploaded to the avatars bucket; receipts/artwork/proofs remain private.

One physical-design revision request is included for new orders, with all changes in one note. Further preference revisions need a separately agreed fee and actual transfer verification before staff grants one additional request. Regenerating a proof never resets the allowance. Existing orders retain legacy terms; digital profile edits are separate. Major redesigns need a designer.

Private account-proof sharing sends no email and requires explicit approval of the current revision, with no timeout. The optional email channel starts its ten-hour no-response window only after actual provider acceptance and still requires proper reply/inbox checks. Transport is currently inactive.

Owner policy: personalized cards are non-returnable/non-refundable after production starts except applicable-law requirements; assess damage, defects, EdgeTap printing errors or the wrong supplied card. Customer-provided errors do not imply an automatic remedy. This is business direction needing appropriate review, not a verified legal exemption. Clarify pre-production cancellation, reporting/remedy process, coverage, privacy/retention and hosting notices before expanding.

Support: **WhatsApp +92 304 414 9674**. Public email is the approved `SUPPORT_EMAIL` in `lib/site.ts`; changing it needs owner confirmation. Staff authorization uses protected UUID membership, never an email address alone.

## Expenses, stock and contribution

| Item | Amount | Classification |
|---|---:|---|
| Obtained sample blank | Rs. 350 | Owner-reported actual expense |
| Sample/current printing | Rs. 150/card | Reported actual sample expense/current rate; quality not approved by price |
| Obtained sample total | Rs. 500 | In hand; fading front needs correction |
| Temu: 18 advertised NTAG215 cards | Rs. 2,300 total | Ordered; arrival/specification/usability unverified |
| Temu order-price unit cost | Rs. 127.78 | Before extra charges and rejects |
| Small envelope | Rs. 10–20/card | Estimate, not a recorded purchase |

Sample-cost remainder before packaging/other costs: **Rs. 499 Link Card / Rs. 999 Profile**. With estimated envelopes: Rs. 479–489 / Rs. 979–989. These are not net profit.

If all Temu cards arrive usable, blank + print + estimated envelope is Rs. 287.78–297.78, leaving Rs. 701.22–711.22 on a Link Card before other costs. Use `(actual batch price + extra charges) / usable cards` after intake. Track rejects/reprints, payment costs, support/programming/QA time, marketing/software and applicable taxes. Rider fare remains separate.

## Launch and repeatable operations

Follow the [admin guide](adminguide.md): review → actual funds → accept specification → confirm URL or publish correct profile → save/share current proof → owner approval → printer package → print → NFC programming → spelling/finish/NFC/QR QA → pickup/rider → confirmed handoff. Advance status only after actual work. Printer briefs contain print details, not receipts or delivery addresses. RGB exports are not certified CMYK/PDF-X.

Begin with a few orders within observed capacity. Demonstrate the real tap/QR outcome; test channels such as local professionals, students, events and referrals before spending. Ask which contact links customers use, what stops them ordering and whether the actual experience meets expectations. Request permission for honest reviews/photos; invent no testimonials, customer counts, urgency or success metrics.

Compare supplier samples for actual chip/writability, print consistency, file/bleed/orientation requirements, turnaround and defect handling. Approve the fading sample correction first. Reconcile unfinished paid orders daily; review contribution, defects and support weekly. Record enquiries, paid conversion, actual fulfillment time, repeat/referral orders and failures using real evidence. Expand only when fulfillment and contribution are reliable.

Future menus, review cards, attendance, teams, analytics and companion-app ideas are in [ROADMAP.md](ROADMAP.md). They are not launch-ready offers. No stock purchase, policy change or service activation is implied by this guide.


Final owner-approved release correction: Profile Card explicit bundles are two for 2099 and three for 2499; Link Card bundles are two for 1599 and three for 1999, with single Link Card confirmed at 999. There are no five-card offers. Extra matching cards remain 700 under manual quantity selection. Migration 021 adds a separate public website review table and narrowly granted publish/list RPCs. Existing private feedback stays private; anonymous listing is limited to eight entries per keyset page, sorted rating/newest/id descending. Already-public legacy reviews remain visible. One public review per signed-in account can be updated after a one-minute cooldown. The UI explicitly discloses public name/rating/text and offers half-star ratings.

## First buyer and flexible service, 26 October

The owner reports the first paying customer, Tarsil.pk, wanted a chip/tag linked to an EdgeTap profile rather than a printed card. The existing profile/order/payment were explicitly left unchanged. Actual tag programming, phone checks and handoff remain separate evidence. No separate public tag price was invented by this release; agree that hardware scope and amount with the customer. Staff item-type changes preserve the saved invoice.

Free website profiles are now the entry point to the product: one confirmed account, one profile, up to ten chosen links, no payment or staff acceptance. Public Email links are optional; the private sign-in email remains separate. A profile owner can order cards using the existing saved profile and the catalog's additional-card rate, without re-entering details or buying another profile. Branding and card-order CTAs remain on shared profiles.

Card checkout accepts a payment reference or a private receipt. Staff still decides when actual funds are verified. Direct profile publication and optional staff checks do not automatically verify payment or send customer email. The [branded Auth email plan](AUTH_EMAIL_PLAN.md) is prepared; no sender/DNS/SMTP change or test mail was made.
