# EdgeTap business guide

Updated 18 October 2026. [Launch status](LAUNCH_STATUS.md) records readiness; this guide records commercial decisions and operating context.

## Brand and offers

EdgeTap — **One tap. Infinite possibilities.** Help people share useful contact details through a physical card and an updateable digital destination. Initial focus: Pakistan, especially Lahore, with a personally managed launch at NASTP NIIT. Brand/trademark clearance remains unresolved before major investment.

| Offer | Current price | Owner-confirmed standard price | Scope |
|---|---:|---:|---|
| Link Card | Rs. 999/card | Rs. 1,399 | One customer-supplied existing public URL |
| EdgeTap Profile | Rs. 1,499/card | Rs. 1,899 | Editable profile; first ten links included, each extra link Rs. 50 once per profile, not per card |
| Website + four cards | Rs. 29,999 | Rs. 36,999 | Contact-only agreed website/portfolio scope; first year included, Rs. 3,000 annually from year two; cards now or within first year |

The owner explicitly confirmed the standard prices for crossed-out comparisons. Existing submitted prices/terms remain unchanged. Delivery is extra and paid directly to the rider. Profile links have a technical limit of 100; do not advertise unlimited links.

Cards are PVC NFC, **85.60 × 53.98 mm**; Wood is a printed style. Identical cards in one order share one design and destination. QR is optional and must encode the same destination as NFC. Keep public handles stable and existing printed URLs working. No universal phone-compatibility or instant-open promise.

Customers may choose a preset, customize both faces or upload separate front/back artwork. Final proof approval is separate from checkout. Designer/custom/bulk work requires an agreed scope/quote; the designer URL and public designer fee remain unset. An internal Rs. 5,000 design-fee idea was never a confirmed public offer.

## Owner-approved website update, 23 October 2026 (local, pending release)

The website source now shows a Rs. 2,200 crossed-out Profile Card price. For new version-3 orders, the profile and first card cost Rs. 1,499, and each additional card costs Rs. 700. Manually selecting three cards totals Rs. 2899. Clicking the separate three-card offer applies **Rs. 2,299**; changing quantity clears that offer. Additional cards for an active profile owned by the signed-in account cost Rs. 700 each, without another profile or duplicate link charges. Existing submitted orders retain their pricing version. Paid extra links for new profiles remain Rs. 50 each above ten; delivery has no separate customer fee on version-3 orders.

These rules require the reviewed additive migration `202610230020_website_offers.sql` and matching frontend release. They have not been applied to the hosted backend by this task. Do not change a price label without the matching server capability. The owner's earlier spoken Rs. 2,700 bundle figure was explicitly corrected to Rs. 2,299.

The designer's owner-supplied WhatsApp is +92 327 1360809, separate from general support and payments. The requested customer policy now asks for a clear unboxing video to support arrival-damage/defect claims, retaining applicable-law remedies and existing EdgeTap-error handling. Sample review cards are labelled as samples; private feedback remains private.

## Payment, delivery and profile terms

| Method | Receiving details |
|---|---|
| JazzCash | 03044149674 |
| Easypaisa | 03044149674 |
| Meezan Bank | IBAN PK46MEZN0000300116179673 |

Recipient for all three: **Muhammad Ibraheem Anwar**. Staff verifies actual funds manually; a receipt screenshot is not payment confirmation. No automatic gateway or courier integration exists.

Current pickup copy: **NASTP Delta 3, Monday–Friday, 9 am–5 pm Pakistan time**. Contact after reaching when ready. NIIT is the launch focus, not an approved pickup-location/hours change. Book delivery manually when ready, record actual fare/message and have the customer pay the rider directly. No invented flat fee, service radius or dispatch deadline.

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

Latest website revision: Profile bundles 3/2299 and 5/3499; Link bundles 3/1999 and 5/2799. Extra matching cards cost 700 for either product. Bank is the new default display/payment method. Delivery inclusion is stored per order, shown at payment, and rider costs stay staff-only; legacy order terms remain intact. Eleven social design templates are registered additively by pending 020. Their flat vector artwork is rebuilt from the owner’s screenshot references without stock QR codes or contact details. Only marketing QR codes change to the preferred website root.


Final owner-approved release correction: Profile Card explicit bundles are two for 2099 and three for 2499; Link Card bundles are two for 1599 and three for 1999, with single Link Card confirmed at 999. There are no five-card offers. Extra matching cards remain 700 under manual quantity selection. Migration 021 adds a separate public website review table and narrowly granted publish/list RPCs. Existing private feedback stays private; anonymous listing is limited to eight entries per keyset page, sorted rating/newest/id descending. Already-public legacy reviews remain visible. One public review per signed-in account can be updated after a one-minute cooldown. The UI explicitly discloses public name/rating/text and offers half-star ratings.
