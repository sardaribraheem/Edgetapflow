> **Historical snapshot archived 15 October 2026.** Source: `EdgeTap_Complete_Business_Reference.md` before this launch audit. Superseded status/commands below are evidence of their original run, not current instructions or authorization. Read [current launch status](../LAUNCH_STATUS.md). Unique original content is retained; relative links were rebased for this archive.

# EdgeTap — Complete Business & Product Reference
**Version:** 1.0 | **Prepared:** 14 October 2026

This document is a consolidated reference for EdgeTap's business model, product, technology, finances, customer psychology, sales, operations, risks, and launch decisions. It distinguishes confirmed discussions from unresolved items. It is not proof that every feature is currently implemented.

## 1. Executive summary

**EdgeTap** is a physical-to-digital experience business. Its tagline is **“One tap. Infinite possibilities.”** The first product is a professional NFC card with a QR fallback. Tapping or scanning opens a personalized EdgeTap profile at a stable URL such as `/u/username`. The card points to the EdgeTap URL—not permanently to one social network—so the profile's links and details can be updated without replacing the card, provided the service remains active.

The initial focus is local customers in Pakistan, especially Lahore. The target standard-card price is **Rs. 999 plus delivery**. Delivery is separate and its fee is not fixed. Free pickup is planned at **NASTP Lahore, Monday–Sunday, 9 AM–5 PM**. The launch should focus on a dependable card/profile experience and manual operations where appropriate. Future opportunities include menu, review, event, attendance, mini-site, and custom NFC experiences; these are expansion ideas, not necessarily launch-ready features.

## 2. Vision and positioning

**Vision:** Make it easy to turn a physical interaction into a useful digital experience.  
**Mission:** Provide professional, updateable digital destinations that open through NFC or QR.  
**Positioning:** EdgeTap is not merely a printed card with a chip. The card is the physical entry point; the dynamic digital experience is the core value.

**Brand:** EdgeTap  
**Tagline:** One tap. Infinite possibilities.  
**Personality:** modern, useful, approachable, professional, slightly playful.  
**Domain/trademark clearance:** unresolved; check before major investment or legal claims.

The main customer benefit is simple: share contact information quickly, present yourself professionally, and keep details current without reprinting the physical card.

## 3. Customer problem and solution

People exchange contact details by writing them down, typing numbers, searching social profiles, or sharing multiple separate links. Paper cards can become outdated. Businesses also want a quick route to menus, reviews, booking links, and other destinations.

EdgeTap's solution:
1. Customer orders a card.
2. The NFC tag is programmed with a canonical EdgeTap profile URL.
3. Compatible phones open the URL by tap.
4. A printed QR code provides a fallback.
5. The profile content can change without replacing the card, as long as the URL and service remain active.

Do not promise that every phone responds identically to NFC. Keep QR prominent enough to be useful. Explain that the card opens a profile; it does not need to store every social detail itself.

## 4. Core product and profile

A profile URL may look like `https://your-domain.com/u/username` (placeholder domain until production domain is confirmed).

**Required:** customer name and at least one useful contact method/link.  
**Optional:** professional title, city, profile photo. Never force a photo upload.

Suggested link choices include Email (`mailto:`), WhatsApp, Instagram, LinkedIn, Facebook, Telegram, TikTok, YouTube, website, and custom URL. Email is a simple first link; WhatsApp is convenient when the customer has a phone number. Add only links the customer actually provides. A JazzCash number may be displayed as a number/payment action, but do not invent a public profile URL.

Founder-provided links for the founder's own profile only:
- Instagram: `https://instagram.com/ibraheem.dev`
- WhatsApp: `https://wa.me/923044149674`
- JazzCash number: `03044149674`

Do not insert those into customer profiles by default.

### Profile design
- Customer identity and useful actions come first.
- Preview must reflect the customer's own data.
- Never leak demo names, owner emails, or test data into another customer's profile.
- Avoid making the customer feel they paid to advertise EdgeTap.
- A subtle **“Powered by EdgeTap”** footer is acceptable, with EdgeTap linking to the homepage.

### Multiple cards
For the MVP, all cards in one order point to **one profile**. Three cards in an order, for example, can all open `/u/username`. Do not support multiple profiles within one order yet. A customer can start a separate flow later to create another profile.

### Card options
1. Simple
2. Lux
3. Wood
4. Inverted
5. Upload your card design
6. Need a custom design? / Consult a graphic designer

Previously identified design assets:
- `assets/simple.png`
- `assets/lux.png`
- `assets/wood.png`
- `assets/inverted.png`

Uploading a design is for customers who already have artwork. Graphic-designer consultation is a premium/manual service, not an automated marketplace. The founder's sister is a professional graphic designer; Rs. 5,000 was discussed as her fee, but the final customer-facing price and scope are unresolved. Card dimensions/material/print specifications must remain configurable until verified with the supplier.

## 5. Customer order flow

**Landing → Choose Card → Profile → Links → Preview → Delivery → Payment → Confirmation**

After card selection, the progress indicator may say something like “Your EdgeTap card · 40% complete,” provided the percentage reflects real progress rather than misleading the customer.

### Profile and links
Name is required; title, city, and photo are optional. Require at least one useful link/contact method. Preserve form entries when the customer navigates back or encounters a validation error.

### Preview
Show the customer's actual details. No demo information or unnecessary EdgeTap advertising.

### Pickup or delivery
- **Free Pickup:** NASTP Lahore, Monday–Sunday, 9 AM–5 PM.
- **Delivery:** name, phone, and full address required; city may be collected too.
- **Pickup:** only name and phone required; do not demand an address.
- Delivery will initially be arranged manually; inDrive was considered as an initial option.
- Delivery coverage, fee, and dispatch estimate are unresolved. Quote separately based on location. Do not invent a flat fee or promise unconfirmed timing.

### Payment
Planned manual options:
- Raast / bank transfer
- Easypaisa
- JazzCash

Customer selects a method, sees the corresponding instructions, uploads a receipt/screenshot, and enters a transaction/reference ID if available. Submitting a screenshot does **not** confirm payment. An authorized admin checks actual funds before marking the order paid.

Payment details previously supplied for setup—**verify these before publishing**:
- Raast: `PK08JCMA1811923044149674`
- JazzCash / Easypaisa: `03044149674`
- Meezan Bank IBAN: `PK46MEZN0000300116179673`

These are operationally sensitive details. Confirm they are still correct and intended for public display. Prefer protected configuration where possible.

The server/database must calculate totals from trusted pricing. Never trust a total sent only by the browser. Delivery can remain separate/pending until calculated; never add a made-up fee.

### Confirmation
The customer should see that the order was received and is **pending payment verification**, not that payment succeeded.

## 6. Business model and pricing

### Known initial target
- Standard physical card + profile: **Rs. 999 plus delivery**.
- Delivery: separate, not finalized.
- Premium/custom/bulk orders: quote based on scope and costs.
- Rs. 5,000 designer fee was discussed internally; final offer/price is unresolved.

### Revenue streams
**Initial:** standard card sales, premium/custom design, bulk orders.  
**Potential later:** mini-sites, restaurant menu experiences, Google review cards, event/contact experiences, office attendance systems, and custom NFC solutions. Recurring hosting/update fees may be possible later, but only with clear terms and validated demand.

The customer buys a useful product, not an abstract technology platform. Lead with faster contact sharing, professional presentation, and updateability.

### Hosting/update terms — unresolved
Define how long a profile is hosted, whether edits are included, what happens if service is discontinued, whether premium customization costs extra, how data can be recovered/exported, and how customers are notified of changes. Do not promise lifetime hosting or free updates forever without a sustainable plan.

## 7. Unit economics and financial discipline

A Lahore supplier previously quoted:
- One card: Rs. 350
- 20 cards: Rs. 250 per card
- Printing: Rs. 150 per card

These are historical quotes, not guaranteed current prices. Confirm before buying.

A Daraz listing previously showed 100 NTAG215 PVC cards at Rs. 14,999 plus shipping. Imported listings appeared cheaper at higher quantities, but shipping, duties, taxes, quality, minimum order quantities, and delivery risk must be included. Listing prices are not verified landed costs.

### Illustrative one-card economics
| Item | Amount |
|---|---:|
| Selling price | Rs. 999 |
| Blank NFC card (historical one-off quote) | Rs. 350 |
| Printing (historical quote) | Rs. 150 |
| Remainder before all other costs | **Rs. 499** |

Rs. 499 is **not net profit**. It excludes packaging, delivery subsidy, payment friction/fees, programming/testing time, design labor, replacements, customer support, marketing, failed orders, software, and the founder's time.

An earlier target for future bulk physical cost was:
- NFC card: Rs. 100–150
- Printing: Rs. 50–100
- Packaging: Rs. 30–60
- Combined target: Rs. 180–310

Those figures are targets to validate, not confirmed current costs.

Track every order's card, printing, sleeve, envelope, sticker, tape, programming/QA time, design labor, delivery collected vs paid, payment costs, replacement/defect costs, refunds, marketing, domain/software, and labor.

**Gross contribution = order revenue − direct costs attributable to the order.** Do not count delivery money as profit unless it exceeds actual delivery costs. Keep records, compare supplier quotes at 1/10/20/50/100 units, avoid large inventory before demand, and reserve cash for defects and replacements.

## 8. NFC, QR, card design, and packaging

NTAG213/215/216 were discussed as possible URL-based NFC tags. A simple URL usually needs little memory; NTAG213 may be enough, while NTAG215 has more memory but is not automatically necessary. Verify that the card is NFC/NDEF writable, rewritable, not locked, reliable, and compatible with representative phones.

The NFC URL and QR must resolve to the same canonical profile URL. Test QR contrast and scanning, ensure the URL is correct and secure, and never print a localhost/preview URL.

### Physical design direction
Preferred personal card:
- cream/off-white textured or matte card;
- name prominent;
- title such as “Software Developer · Founder, EdgeTap”;
- subtle brand mark;
- QR on the back;
- short “TAP OR SCAN” prompt;
- no cluttered social icons.

Suggested back copy:

> TAP OR SCAN  
> [QR]  
> Your digital experience, one tap away.

The card should feel like a premium professional identity object, not an NFC-tech advertisement.

### Packaging
Cost-conscious initial concept: card → glassine/frosted sleeve → branded envelope → normal courier bag. A plain envelope plus branded sticker may be more economical than custom boxes at low volumes.

### Per-card QA
1. Confirm order, customer, design, quantity.
2. Inspect print, edges, finish, and defects.
3. Program canonical profile URL.
4. Test NFC on a compatible phone.
5. Scan QR with a phone camera.
6. Check profile and links.
7. Record QA.
8. Package and confirm handover details.

## 9. Website and technical architecture

The website uses Next.js App Router, React, TypeScript, Tailwind CSS, and GSAP/ScrollTrigger. Typography discussed: Fredoka display and Inter body. Marketing sections include Hero, SolutionGrid, UseCaseStory, CustomCTA, Testimonials, FAQ, FinalCTA, and Footer. Public profiles use `/u/[username]`.

Use a dynamic profile resolver rather than hardcoding a separate static page for every customer. NFC and QR must share the same stable URL.

### Admin areas discussed
- Dashboard
- Orders
- Clients
- Profiles
- Reviews
- Settings

Admin order detail should show customer/contact details, card design/quantity, uploaded artwork, profile data, payment receipt/reference, fulfillment method, and current status.

After payment verification, admin should be able to generate/publish the profile, inspect/copy the canonical URL, generate/view QR, and create a production package.

Example printer message:

```text
EdgeTap Production
Order: ET-YYYY-0001
Customer: [Customer name]
Card: [Selected design]
Quantity: [Quantity]
Profile: [Canonical profile URL]
NFC URL: [Same canonical URL]
QR: [Generated QR]
Card design: [Selected/uploaded design]
Special requests: [Confirmed details]
```

Do not automate printer messaging until the manual process is reliable.

### Suggested lifecycle
`NEW → PAYMENT_PENDING → PAID → PROFILE_READY → PRODUCTION_READY → WITH_PRINTER → CARD_RECEIVED → NFC_PROGRAMMED → QA_PASSED → READY_FOR_PICKUP/READY_FOR_DELIVERY → SHIPPED/DELIVERED → COMPLETED`

Also support `CANCELLED` and clear exception paths. Implementation names may differ, but transitions must be validated server-side. Never mark an order paid merely because a screenshot was uploaded.

Generate human-readable IDs such as `ET-2026-0001` safely on the server/database side.

### Admin email and notifications
Admin address previously supplied: `sardaribraheem277@gmail.com`. This is an administrative account, not a public support address.

Order notification should include order number, customer/contact, card/quantity, payment method/status, profile username/URL, pickup/delivery, and a link to the admin order. Customer notifications must reflect real status. If SMTP/email is not configured, do not pretend a message was sent.

## 10. Backend and migration context

EdgeTap originally used Firebase Auth, Firestore, and Storage. Work had included order/profile CRUD, username availability, admin dashboard, security rules, avatar uploads, QR generation, and status guards.

A launch audit found the browser targeting Firestore `(default)`, which returned a billing-required error. A separate `default` database did not contain the founder profile and denied reads. Firebase Storage also required Blaze for the desired upload workflow. This made the existing production path a blocker.

The discussed direction is to move the **whole backend** to:
- Supabase Auth;
- Supabase Postgres;
- Supabase Storage for avatars, payment receipts, and design uploads;
- Row Level Security (RLS);
- explicit admin authorization.

Hosted Supabase project reference previously given: `dxyxvervvlxhwwbcbttd`. Setup was reported to include tables, RLS, RPCs, and buckets, but that does **not** prove the frontend migration or complete production flow is finished.

Previous status notes said the frontend still served Firebase and real order/payment/upload/profile/NFC/QR flows were not all verified end to end. Reinspect the current repository and deployment; do not rely on historical status as proof.

The official Supabase Firestore migration guide describes tools that extract collections into Postgres tables with basic columns and JSON. This may help extract data, but blindly flattening every collection is not necessarily suitable for EdgeTap's relationships. Auth, Storage, and Firestore data are separate migration tasks.

Migration safety:
- inspect current code and configuration first;
- preserve existing data unless explicitly approved otherwise;
- never expose or commit service-account keys, DB passwords, or Supabase secrets;
- migrate only data that is needed and authorized;
- test public profile access, ownership, admin authorization, private uploads, and status transitions;
- test anonymous and authenticated access separately;
- do not call the app production-ready just because it builds.

Previous notes said Firebase records/images were disposable test data and the clean Supabase production project should not be populated with invented orders. Do not fabricate a Talha order or any other customer record.

## 11. Security, privacy, and trust

- Customers can edit only what they own or are authorized to edit.
- Admin operations must be checked server-side and by database/storage policy, not merely hidden in UI.
- Public profile fields should be intentionally public; orders and receipts should not be public by default.
- Validate file type/size and protect uploads.
- Never expose service-role keys or private credentials in browser code.
- Do not trust browser-supplied price, role, paid status, or order ID.
- Prevent username collisions and unsafe usernames.
- Validate links and redirects.
- Keep secrets and unnecessary personal data out of logs.
- Use HTTPS, secure password recovery, and appropriate email verification.
- Rotate credentials that may have been exposed or committed.

Collect only data needed for the transaction. Pickup customers should not be asked for an address. Explain what is collected and who can access it.

### Policies to review
Privacy policy, terms, hosting/update terms, refund/cancellation, custom design approval, defect/replacement, consent to publish profile data, receipt/address retention, and applicable Pakistani consumer/business/tax/data requirements. Do not make legal guarantees without appropriate review.

## 12. Customer psychology and behavioral design

These are design hypotheses to test, not guarantees about all customers.

### Sell the outcome, not the chip
Customers usually care about fast sharing, professional presentation, and convenient access to links more than NFC specifications. Explain the result; use the technology as proof.

### Demonstration beats explanation
Show the physical card, tap it on a compatible phone, open the profile, point to useful links, then explain updateability. Keep QR ready as a fallback. A real demo can reduce uncertainty more effectively than a long technical speech.

### Reduce friction
Collect only necessary information. Keep title, city, and photo optional. Do not request an address for pickup. Use familiar payment methods, clear instructions, and resilient form state. Avoid unnecessary account creation while still protecting ownership and recovery.

### Visible progress
A progress indicator can make checkout feel manageable, but percentages must be honest.

### Choice architecture
Four clear standard styles provide choice without overload. Uploading existing artwork and hiring a designer are different needs. Clearly label the premium/manual design path and don't imply it is instant or included.

### Professional identity and ownership
A well-designed card can help someone feel prepared and professional. Use clean hierarchy and restraint. Make the customer's profile feel like their own product, not an EdgeTap advertisement.

### Trust at checkout
Show the real product price, explain delivery is separate, give correct payment instructions, explain manual verification, provide an order ID, and state what happens next. Never use fake testimonials, false scarcity, hidden fees, or fake payment confirmations.

### Ethical persuasion
Psychology should help a customer understand and decide—not trick them. Prefer real demonstrations, real feedback, transparent prices, and honest limitations.

## 13. Brand and website direction

The early visual direction was inspired by editorial, playful websites: cream/paper backgrounds, deep navy/ink, coral/yellow/light-blue accents, Fredoka headings, Inter body, rounded components, and hand-drawn doodles.

The bootcamp instructor felt the doodles distracted from professionalism. The agreed direction was to reduce their prominence rather than remove all personality: roughly 80% premium/minimal and 20% playful as a working heuristic, only a few strong doodles in major sections, more whitespace, less unnecessary motion, and clearer offer/CTA.

The founder reports that the website is now done. Avoid endless redesign. Change it only to fix real usability, trust, accessibility, security, or conversion problems. Focus on real checkout tests, first customers, and fulfillment.

The homepage should quickly answer: what EdgeTap is, what the customer gets, how tap/scan works, price, how to order, and how to contact the business.

## 14. Sales and customer acquisition

Initial target segments to test: local professionals, students, founders, freelancers, consultants, salespeople, and small businesses that benefit from contact sharing. Start with reachable people and learn from real conversations.

A bootcamp instructor (“Miss”) previously said she might be the first customer. This is a lead, not a sale; count revenue only when a real order/payment occurs.

### Demonstration pitch
“I noticed you were using pen and paper to share your contact details. Instead of writing everything down, you can just tap this card against their phone.”

Then demonstrate the tap, show the profile, explain that it can be updated without replacing the card while service remains active, show QR fallback, state Rs. 999 plus delivery, and invite them to try it. Keep it conversational and avoid over-explaining technology.

### Channels to test
- direct conversations at university, bootcamp, professional events, and local businesses;
- founder's card as a live demo;
- referrals;
- short videos of tap-to-profile;
- outreach to professionals;
- restaurant/business use cases only when those products are actually ready.

### Ask prospective customers
- How do you share contact details today?
- What is frustrating about it?
- Would you carry/use this card?
- Which style feels right?
- Which links matter?
- Is Rs. 999 acceptable for the card/profile?
- What would make you hesitate?
- Would you recommend it?

Compliments are weaker evidence than purchases, repeat use, referrals, and requests to buy for colleagues.

Track people approached, demos, interested leads, quotes, orders started, paid orders, fulfilled orders, feedback, referrals, defects, and time spent.

## 15. Operations and fulfillment

Manual-first is acceptable if every step is recorded and customers receive honest updates.

1. Receive order and generate unique order ID.
2. Admin reviews details and payment evidence.
3. Verify actual funds; then mark paid.
4. Generate/publish profile and test links.
5. Generate QR and copy canonical NFC URL.
6. Create production package and confirm design/quantity.
7. Send to printer.
8. Receive and inspect card.
9. Program NFC.
10. Test NFC and QR.
11. Mark ready for pickup/delivery.
12. Notify customer truthfully.
13. Complete handover/delivery.
14. Mark complete and record costs.
15. Ask for honest feedback.

If email is configured, notify the customer about order received, payment status, design approval, production, and pickup/delivery readiness. If not configured, don't claim emails were sent; use a suitable manual channel with customer consent.

### Unresolved cancellation/defect policy
Define cancellation before/after design approval, whether printing waits for approval, treatment of custom work once production starts, misprint/defective NFC replacement, defect reporting period, replacement delivery, and incorrect customer-supplied information. Avoid a blanket no-refund claim without considering applicable consumer requirements.

## 16. Metrics

**Sales:** leads, demo-to-order conversion, paid orders/week, average order value, cards/order, repeat orders, referrals.  
**Finance:** revenue collected, direct costs, delivery collected vs paid, gross contribution, refunds/replacements, monthly software/domain costs, operating cash.  
**Operations:** time to payment verification, time to profile ready, time to card ready, on-time handover, print defects, NFC/QR failure rate, support issues/order.  
**Product:** profile load success, broken links, edit success, upload failures, checkout abandonment, mobile usability, customer understanding.

Do not optimize vanity metrics while actual orders, delivery, and satisfaction remain unproven.

## 17. Main risks

| Risk | Mitigation |
|---|---|
| Backend not fully migrated/tested | Test the real customer/admin journey before launch |
| Unexpected billing/dependency | Verify plan, quotas, costs, and cost controls |
| NFC behaves differently across phones | Maintain QR fallback and test representative devices |
| Wrong URL programmed | Use one canonical URL and per-card QA |
| Fake/mismatched payment proof | Verify actual funds before PAID |
| Private receipt leaks | Private storage and strict policies |
| Weak margins | Track true unit economics and obtain fresh quotes |
| Supplier inconsistency | Start with small batches and inspect every card |
| Delivery surprise | Confirm fee and timing before dispatch |
| Feature creep | Keep MVP narrow and manual where reasonable |
| Unclear hosting promises | Publish sustainable hosting/update terms |
| Custom order disputes | Confirm design and terms before production |
| False trust signals | Use real testimonials and truthful statuses |
| Brand/domain conflict | Check before significant investment |

## 18. Launch-readiness checklist

### Customer journey
- [ ] Landing page clearly explains offer, price, and next action.
- [ ] All six card options work.
- [ ] Required and optional profile fields behave correctly.
- [ ] At least one link is required.
- [ ] Preview uses actual customer data; no demo leakage.
- [ ] Multiple cards share one profile.
- [ ] Pickup needs name/phone only.
- [ ] Delivery needs name/phone/address.
- [ ] Delivery fee is separate and not invented.
- [ ] Payment instructions are verified.
- [ ] Receipt uploads are private.
- [ ] Confirmation says pending verification.
- [ ] Ordinary validation errors preserve form state.

### Admin/backend
- [ ] Admin sign-in works; non-admins are blocked server-side.
- [ ] Orders and unique IDs work.
- [ ] Payment evidence is private and viewable by authorized staff.
- [ ] Admin can confirm/reject payment with a reason.
- [ ] Status transitions are enforced server-side.
- [ ] Profile publication and username collision handling work.
- [ ] QR and canonical URL work.
- [ ] Production package is accurate.
- [ ] Storage policies tested.
- [ ] SMTP tested if email is advertised.
- [ ] Error messages are honest.

### Physical product and business
- [ ] Supplier, dimensions, material, quantity, and design approved.
- [ ] Print sample inspected.
- [ ] NFC and QR tested.
- [ ] Profile and links tested on a phone.
- [ ] Packaging and handover recorded.
- [ ] Hosting/update terms written.
- [ ] Delivery process and charges explained.
- [ ] Cancellation/design approval/defect policies written.
- [ ] Privacy/terms reviewed.
- [ ] Domain/brand clearance checked.
- [ ] Actual unit costs recorded.

## 19. Roadmap

**Phase 1 — Validate:** verify backend, test one physical card end to end, get the first paying customer, fulfill manually, track costs, collect honest feedback.

**Phase 2 — Repeatability:** confirm suppliers, standardize artwork, create NFC/QR QA, improve truthful customer notifications, measure margins and defects, fix recurring manual errors.

**Phase 3 — Digital service:** secure profile editing, account recovery, link management, analytics if customers need it, custom branding, and clear hosting/update plans.

**Phase 4 — Expansion:** validate menu taps, review cards, mini-sites, event/contact experiences, attendance, and custom workflows one at a time. Each needs a defined customer, problem, price, fulfillment process, and evidence of demand.

## 20. Founder operating principles

The founder's stated priority is to launch and acquire the first customer rather than endlessly polish the website. Use systems: checklists, clear steps, cost tracking, truthful updates, and repeatable fulfillment.

1. Sell before overbuilding.
2. Keep the first offer simple: card + dynamic profile + QR fallback.
3. Demonstrate the experience.
4. Track every rupee; revenue is not profit.
5. Protect trust; no fake confirmations, hidden fees, or demo-data leaks.
6. Automate repeated errors, not every human task.
7. A feature is not done until tested in the real flow.
8. Prefer reversible changes and preserve data.
9. Sales and reliability come before decorative improvements.
10. Learn from purchases, repeat use, referrals, and fulfillment—not compliments alone.

## 21. Known facts and unresolved decisions

### Previously decided / known
- Brand EdgeTap; tagline “One tap. Infinite possibilities.”
- NFC card + QR fallback + dynamic profile.
- Target standard price Rs. 999 plus delivery.
- Card options: Simple, Lux, Wood, Inverted, upload design, consult designer.
- Name and one useful link required; title, city, photo optional.
- Multiple cards in one order share one profile.
- Free pickup at NASTP Lahore, Monday–Sunday, 9 AM–5 PM.
- Delivery charged separately and arranged manually initially.
- Manual Raast/bank transfer, Easypaisa, and JazzCash verification.
- Receipt upload is not payment confirmation.
- Subtle Powered by EdgeTap footer is acceptable.
- Admin order review and physical fulfillment should be tracked.
- Founder reports website is done.
- Discussed backend direction: Supabase Auth, Postgres, Storage, RLS.

### Unresolved / verify
- Whether the current repository/deployment completed the Supabase migration.
- Whether live order creation, uploads, profile publication, QR, NFC, and admin journey pass end-to-end.
- Final domain and trademark clearance.
- Current supplier prices, card sizes, material, print finish, batch quality.
- Actual packaging and delivery costs.
- Delivery coverage, fee process, and dispatch estimates.
- Hosting duration and profile-update terms.
- Cancellation, design approval, refund, defect, and replacement policies.
- Verified SMTP provider/sender.
- Payment details before public display.
- Privacy policy, terms, and relevant legal/tax obligations.
- Premium/custom/bulk pricing.
- Actual customer demand and contribution margin.

## 22. Canonical short description

**EdgeTap creates NFC-enabled physical cards that open personalized, updateable digital profiles through a tap, with a QR code as a fallback. Customers can share contact details and professional links through one simple destination instead of relying on paper cards or separate links. The initial offer is a professional NFC card and digital profile for Rs. 999 plus delivery, with custom designs and broader business use cases planned as the service grows. EdgeTap's long-term vision is to make physical-to-digital interactions simple for professionals, creators, and businesses.**

## 23. Instructions for future AI assistants/developers

Treat this as business context, not proof that every feature is implemented. Before modifying code:
1. Inspect the current repository, branch, deployment, and backend configuration.
2. Separate implemented, partially implemented, and planned features.
3. Preserve customer data and security controls.
4. Never fabricate customer records, testimonials, payment confirmations, or sent emails.
5. Do not deploy, spend money, enable billing, delete services, or run destructive migrations without explicit authorization.
6. Test real customer and admin journeys.
7. Report what was verified and what remains unverified.

If this document conflicts with the current code or production behavior, report the conflict rather than silently assuming either is correct.
