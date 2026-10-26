# EdgeTap — website, product and business overview

Prepared **24 October 2026, Pakistan time**, from the EdgeTap website repository and its project guides.

This document describes the website and the business it supports. It covers the commercial offering, customer experience, brand, operations, technology and current limits. Companion mobile application development is outside its scope.

The current website code, [launch status](../docs/LAUNCH_STATUS.md), latest [release records](../docs/RELEASE_HISTORY.md) and final owner decisions in the [website feedback brief](../docs/WEBSITE_FEEDBACK_2026-10-23.md) take precedence over earlier notes. Some older guide sections retain superseded prices, delivery charges and proposed offers; those are historical context, not the current offer.

## 1. What EdgeTap is

**EdgeTap is a Pakistan-focused business selling personalized physical NFC cards connected to useful online destinations.** A card can open an existing portfolio, WhatsApp link or website, or an editable digital profile hosted by EdgeTap.

The brand promise is **“One tap. Infinite possibilities.”** The practical promise is simpler: help someone share their contact details and online presence without asking the recipient to type a number, search for a username or install software.

The website connects three parts of that business:

1. **Discovery and explanation:** visitors learn what the card does, see demonstrations and compare products.
2. **Sales and customer service:** customers choose a design, prepare their details, pay, submit an order and follow its progress.
3. **Delivery of the service:** recipients view public profiles, owners maintain their information, and authorized staff manage the physical order through proof approval, printing and handoff.

This makes the project a combination of a branded storefront, a digital-profile service and an order-management system. Its operating model depends on both software and human work: staff still verify transfers, prepare proofs, coordinate printing, program cards and check the finished product.

| Item | Project identity |
|---|---|
| Public brand | EdgeTap |
| Website project folder | `EdgetapFlow` |
| Main website | [edgetap.tech](https://edgetap.tech) |
| Tagline | One tap. Infinite possibilities. |
| Primary product | A personalized NFC card, with an optional QR code |
| Main featured offer | EdgeTap Profile Card |
| Initial market | Pakistan, especially Lahore; a personally managed launch at NASTP NIIT |
| Purchase currency | Pakistani rupees, displayed as Rs. |
| Example digital profile | [edgetap.tech/u/ibraheem](https://edgetap.tech/u/ibraheem) |
| Current operating stage | Released website supporting an early, operator-managed physical-card launch |

The repository establishes the brand and operating direction. It does not establish company incorporation, trademark clearance, market share or a proven volume of customer sales.

## 2. The customer problem and product value

When people meet, exchanging details often involves several separate actions: typing a phone number, finding the right social account, sending a portfolio URL and remembering which person the information belongs to. A paper business card can also become outdated when contact details change.

EdgeTap brings that interaction down to a reusable physical card and a destination on the web.

For a Link Card customer, the value is convenient access to a destination they already own. For a Profile Card customer, the value includes a single page containing their identity, contact options and online links. They can update that digital information while continuing to use the same profile URL on their physical card.

The experience is intended to work like this:

1. The owner presents the card to a compatible phone.
2. The phone reads its NFC URL and may show a notification to open it.
3. The recipient opens the destination in a normal browser.
4. If NFC is unavailable, the recipient can scan the optional QR code with a phone camera.

NFC reader position, device settings and phone compatibility affect the interaction. Internet access is needed to load the destination. The product should not be described as opening instantly on every phone.

The QR and NFC on an ordered card must use the same confirmed destination. Marketing demonstration QR codes intentionally point to the EdgeTap homepage; they are separate from customer card destinations.

## 3. The product range

### Link Card

The Link Card is for someone who already has the online destination they want to share. Examples include an existing portfolio, WhatsApp conversation link, social profile or website.

It includes a physical NFC card connected to one supplied public URL, with an optional QR code to that same URL. It does not include the creation of an EdgeTap-hosted digital profile.

The customer chooses the destination type first, then a physical design, printed details and quantity. The supplied social design gallery includes WhatsApp, Instagram, LinkedIn and TikTok families. Customers can also customize a card or upload artwork.

Changes to the content at an existing external URL depend on the service that hosts it. The current Link Card offer should not be presented as a self-service EdgeTap redirect-management product for changing an already-programmed destination.

### EdgeTap Profile Card

This is the main offer emphasized on the pricing page. It combines a physical card with an EdgeTap public digital profile.

The profile can contain a name, title, biography, optional location, photo, logo and contact or social links. Visitors can open the links or use **Save Contact**, which currently downloads a contact PDF.

Owners can sign in and edit permitted public profile information. Their profile handle and ownership remain stable. Editing a biography or a link does not change an already approved physical print design.

The first ten profile links are included. Additional links cost Rs. 50 each once per new profile, rather than once per physical card. There is a technical maximum of 100 links, and profile editing respects the purchased link allowance.

Standard profile hosting and owner updates currently have no separate fee. This is not a documented lifetime-hosting promise or a subscription with a guaranteed fixed duration.

### Website + four cards

The higher-value package is a custom website or portfolio with four linked NFC cards.

Its advertised scope includes:

- A website or portfolio agreed around the customer's work.
- Four linked NFC cards, requested now or within the first year.
- First-year hosting and domain services.
- Hosting and domain services at Rs. 3000 per year from year two.

This package starts with a conversation. The standard card checkout does not automatically purchase or generate a custom website. Scope, domain, delivery arrangements and other project details must be agreed directly.

### Custom and larger requests

The website also collects enquiries about larger card quantities, business requirements, custom NFC ideas and custom digital profile templates.

Custom profile work is explicitly a contact-based service. A visible callout appears on the first Profile Card selection screen, with another contact on the profile-details step. Physical artwork assistance uses a separate graphic-designer WhatsApp contact.

There is no fixed public custom-template or designer-service fee confirmed in the current offering. These requests require a separate discussion and quote.

## 4. Current prices and offer rules

The following reflects the final released website pricing, rather than the earlier figures retained in parts of the documentation.

### Main pricing-page offers

| Offer | Current price | Crossed-out comparison price |
|---|---:|---:|
| Link Card | Rs. 999 | Rs. 1399 |
| EdgeTap Profile Card | Rs. 1499 | Rs. 2200 |
| Website + four cards | Rs. 29999 | Rs. 36999 |

The former amount appears to the right of the current amount, at the same font size. The Rs. label is smaller, and prices use no thousands-separator commas.

### Explicit card bundles

| Product | One card | Two-card offer | Three-card offer |
|---|---:|---:|---:|
| Link Card | Rs. 999 | Rs. 1599 | Rs. 1999 |
| EdgeTap Profile Card | Rs. 1499 | Rs. 2099 | Rs. 2499 |

There is no five-card bundle in the current checkout.

Bundle prices apply when the customer selects the corresponding offer button. Increasing or decreasing quantity manually clears the selected offer and returns to normal pricing:

**First-card price + Rs. 700 for each additional matching card.**

For example, manually selecting three Profile Cards produces Rs. 2899, while claiming the three-card offer produces Rs. 2499. Three manually selected Link Cards total Rs. 2399, while their explicit bundle costs Rs. 1999.

Cards in one order share the same design and destination. These are matching-card quantities, not a package of independent profiles for different people.

An owner ordering cards for an existing active EdgeTap profile pays Rs. 700 per card. That route reuses the owned profile instead of charging for and publishing a duplicate. New-profile bundles are separate from this existing-profile route.

Extra-link charges can still apply to a new Profile Card order. The bundle does not remove the paid allowance for links beyond the first ten.

### Delivery and recurring charges

New version-3 website card orders include delivery in the customer total. There is no separate customer delivery payment for those orders. The interface confirms **Delivery included** at payment, rather than advertising it throughout earlier steps. Staff can record actual rider costs privately.

Historical submitted orders retain their agreed prices and delivery terms. The latest offer should not be used to rewrite old orders.

The main physical-card offers are purchase prices, without monthly/annual billing selectors. The website package's year-two hosting/domain renewal is a separate commercial term.

Source of the calculation: [order pricing](lib/data/order.ts), [checkout rules](lib/checkout.ts), [pricing page](app/pricing/page.tsx) and the applied [website offers migration](supabase/migrations/202610230020_website_offers.sql).

## 5. Audience and market position

The documented initial focus is Pakistan, especially Lahore and the NASTP NIIT launch environment. The business is intended to begin with a manageable number of orders and direct support.

The products naturally suit professionals, freelancers, students, creators and small-business owners who regularly share contact details or a portfolio. These are product-fit audiences; the repository does not establish verified demand or sales within each group.

The three main offers accommodate different starting points:

- **Already have a destination:** buy a Link Card.
- **Need a central contact page:** buy an EdgeTap Profile Card.
- **Need a fuller online presence:** discuss the website package.

The website positions the Profile Card as the primary value choice. It sits in the middle, carries the Popular label and has a larger golden presentation. The lower-priced Link Card provides an entry option, while the website package serves customers with a larger requirement and budget.

The business's intended distinction is the combination of physical design, an easy sharing interaction, an editable profile and local assistance. This is positioning, not a measured claim of superiority over a named competitor.

## 6. The website as a brand and sales experience

### Visual identity

The visual language is friendly and expressive: warm cream backgrounds, deep navy text, golden accents, rounded cards, hand-drawn decorations and physical card imagery.

Fredoka is used for display typography and Inter for general text. Coral, sky blue and mint support the main cream/navy/gold palette. The ET monogram, packaged favicon assets and card artwork connect the storefront to the physical product.

Streamline interface icons are used with the repository's CC BY 4.0 attribution and license record. Existing decorative illustrations and social symbols form part of the established visual system.

### Landing-page structure

The homepage moves through a clear sales sequence:

1. **Hero:** the tagline, physical card imagery and calls to order or see how it works.
2. **What We Offer:** moving cards explaining NFC sharing, contact details and QR fallback.
3. **How It Works:** four story panels covering tapping, scanning, connecting and the main takeaway.
4. **Design/contact section:** an invitation to discuss the card or a larger order, followed by public reviews.
5. **FAQs and final call to action:** practical questions, a route to pricing and support.
6. **Footer:** pricing, example profile, sign-in, orders, WhatsApp and policy links.

The tap demonstration explicitly asks visitors to pick up the card and drag it to the phone. Hover and movement cues make the action easier to discover, and a button offers an alternative. These are explanatory website simulations, not actual card programming or proof that a physical NFC transfer occurred.

The moving offer strip continues on mouse hover and supports dragging with momentum. Motion is reduced for users who request reduced motion; keyboard and touch access remain important parts of the interface.

### Pricing and mobile presentation

Desktop shows the three offers together. The Profile Card is larger and golden, and the website package is slightly recessed. On mobile, pricing scrolls horizontally, starts with the featured middle offer and includes position controls and a swipe hint.

The design aims to make the main choice understandable without introducing subscription terminology or technical specifications into the purchase decision.

### Main routes

| Route | Role in the business |
|---|---|
| `/` | Product explanation, demonstrations, reviews, questions and conversion |
| `/pricing` | Compare offers and start a card order or enquiry |
| `/order?product=profile` | Configure and order a Profile Card |
| `/order?product=direct_link` | Configure and order a Link Card |
| `/order/thank-you` | Submission confirmation and a route to the actual order |
| `/account` | Customer sign-in and account access |
| `/account/orders` | Saved applications, corrections, proofs and order progress |
| `/account/recovery` | Account recovery |
| `/u/<handle>` | Public digital profile opened by a shared link, NFC or QR |
| `/admin` | Restricted staff operations |
| `/terms`, `/privacy`, `/cookies` | Customer terms and data/browser-storage explanations |

## 7. The buying journey

The checkout delays the account requirement until the customer has prepared their card. Someone can explore designs and enter details as a guest, then sign in or create an account before payment.

For a new Profile Card, the general journey is:

1. Choose a card design and quantity, optionally claiming a bundle.
2. Enter the public name or heading and optional profile details, photo and logo.
3. Add contact and social links.
4. Preview the digital profile.
5. Choose delivery or pickup and enter private recipient details.
6. Save the application to an account.
7. Choose a payment method, transfer the amount and upload a private receipt.
8. Review and submit the application.
9. Follow staff review, any requested corrections and fulfillment in My orders.

A Link Card starts by choosing and entering the existing destination, then moves to its matching design gallery and printed details. It does not ask the customer to build an EdgeTap profile.

The private delivery recipient name is editable independently of the public profile name. Someone can therefore receive an order under a delivery name that differs from the name printed or shown publicly.

Guest work is stored in the browser, with a seven-day recovery window checked on return. Browser settings, storage limits or clearing site data can remove it sooner. After successful authenticated saving, the private account draft can be recovered through the account service.

Submitting an application is not the same as payment verification, order acceptance or production. That distinction is visible in the customer status flow.

## 8. Digital profiles as the ongoing service

The public profile is the part of the product that remains useful after the physical card is delivered.

Its supported information includes the person's display name, professional title, biography, optional public location, photo/logo and links such as email, phone, WhatsApp, social accounts, portfolio or website.

A recipient can browse the profile without signing in. The Save Contact action creates a downloadable PDF containing profile information and clickable contact links. It should not be described as automatically importing a person into the phone's address book.

Signed-in customers open the side menu and choose Edit profile to edit a profile they own. Public profile pages never show an edit button. Anonymous visitors see Sign in / Login in the menu. Saves are confirmed against fresh persisted public fields before success is shown; backend ownership checks remain the authority.

The profile URL is important product infrastructure. Existing handles, ownership and historical NFC destinations are preserved so delivered cards keep working. Unknown handles must show a missing-profile state rather than another person's example profile.

Digital profile updates and physical design changes are separate services. Updating an online phone number does not reprint a card, change its printed name or reset an approved production snapshot.

## 9. Physical design and customization

The physical product is a standard PVC card with embedded NFC, measuring 85.60 × 53.98 mm. A wood-themed design is printed artwork, not a wooden material option.

Customers can choose a preset, use the front/back custom editor or upload separate artwork for both faces. The editor supports text, colors, positioning and related layout controls, with an optional QR and logo where supported.

The general gallery includes Customize your card, Black photography, Blue studio, Botanical, Honeycomb and Upload a design. Black photography carries a tilted **Most used** tag on its container.

The Link Card social gallery uses eleven owner-supplied references:

| Destination family | Reference designs |
|---|---:|
| WhatsApp | 4 |
| Instagram | 3 |
| LinkedIn | 3 |
| TikTok | 1 |

The supplied gallery images are perspective mockups. They are not used wholesale as printable card faces. Separate flat templates avoid carrying stock names or contact details into a customer's print files. Stock QR areas in gallery references are covered by the real website demonstration QR.

Staff prepares and shares the actual personalized proof before printing. A checkout preview or reference mockup is not final production approval.

### Upload boundaries

| Upload | Supported customer image formats | Limit |
|---|---|---:|
| Front artwork | JPEG, PNG, WebP | 25 MB |
| Back artwork | JPEG, PNG, WebP | 25 MB |
| Profile photo or logo | JPEG, PNG, WebP | 5 MB |
| Payment receipt | JPEG, PNG, WebP | 8 MB |

HEIC is not an accepted artwork/photo format in the current shared upload validation; customers should export it to a supported format. File type, size, decoding, resolution and the browser's storage capabilities are different concerns. A successful file selection alone does not establish print quality.

## 10. Staff operations and physical fulfillment

The admin area supports the work needed to turn a submitted application into a usable delivered card.

Staff can inspect the submitted profile name, biography, links, photo and logo, as well as private contact details, payment proof and artwork. They can accept an application or send a customer-visible correction request. Internal staff notes remain separate from those messages.

The operating sequence is:

1. Review the submitted details and requested specification.
2. Check the actual transfer against the selected method and server-calculated amount.
3. Accept the order and confirm its card specification.
4. Confirm the Link Card destination, publish the correct new profile, or attach the already-owned profile.
5. Prepare and save the current front/back proof with its wording, destination and print settings.
6. Share the proof privately for customer review.
7. Receive approval of the current revision, or revise it from the customer's consolidated change request.
8. Produce the guarded print files and printer brief.
9. Print, program NFC and physically check spelling, finish, NFC and QR.
10. Arrange pickup or delivery, then record the actual handoff.

Customers see four understandable stages: **Payment verification, Order review, Design approval and Your card.** The staff system has more detailed production and handoff states behind those summaries.

Print output includes front/back PNG files, a two-face card PDF and a separate A4 printer order sheet. A saved proof freezes the relevant design and destination for that order. The A4 brief does not replace the high-resolution print artwork.

The exporter produces RGB files. Printer-specific color conversion and physical quality approval remain operational responsibilities; the project does not establish certified CMYK or PDF/X output.

## 11. Payment, delivery and customer policy

### Payments

The website offers **Bank, JazzCash and Easypaisa**, with Bank selected by default for new checkout. The documented receiving name is Muhammad Ibraheem Anwar. Canonical receiving details are maintained in [checkout configuration](lib/checkout.ts).

Payment is manual. There is no integrated automatic payment gateway. A receipt upload records evidence for staff review; only actual transfer verification establishes payment.

### Delivery and pickup

New website card orders include delivery in their total, while historical orders keep their saved terms. Staff books the rider and records real dispatch information; the system is not an automatic courier integration.

The documented pickup arrangement is **NASTP Delta 3, Monday–Friday, 9 am–5 pm Pakistan time**. Customers contact support after arriving once their card is ready. NASTP NIIT is the launch focus, not a replacement for the stated pickup arrangement.

Delivery availability needs confirmation. No universal service radius or guaranteed dispatch time is established in the current material.

### Proofs, revisions and returns

New orders include one physical-design revision request, with all requested changes provided together. Further preference changes need an agreed fee and actual payment verification. No fixed additional-revision price is advertised.

Private account-shared proofs wait for explicit approval of the current revision. Sharing a proof does not send an email or start a timeout. An optional email review process exists, but its sending service is currently inactive; a timer cannot be inferred from a queued message.

The published personalized-card policy generally makes cards non-returnable/non-refundable after production starts, while retaining applicable-law remedies and handling for defects, damage on arrival, or EdgeTap printing/supply errors. Customers are asked to record a continuous unboxing video as evidence. Pre-production cancellation arrangements need confirmation for the particular order.

These are summaries of the project's stated policy. The [published terms source](app/terms/page.tsx) contains the fuller wording; unresolved commercial and policy questions remain in the launch records.

## 12. Reviews and trust

The homepage now uses intentionally published public reviews instead of placeholder testimonials.

The review form tells the customer that their chosen name, rating and text will be public. It supports half-star ratings and requires sign-in to publish. A guest's unfinished review can be retained through the sign-in flow.

The slider shows at most eight review entries in a batch. Higher ratings appear first, so 5-star entries precede 4.5-star entries and lower ratings. Within the ranking, newer entries appear first. **Show more** fetches the next batch rather than loading every review into the initial slider, and visitors can return to the top reviews.

Each signed-in account has one public website review that can be updated after a one-minute cooldown. Already-public legacy reviews remain available. Historical private feedback is not automatically converted into a public testimonial.

Review counts, customer endorsements and conversion claims should come from real records. The animated demonstrations and example profiles are product explanations, not evidence of customer sales or verified reviews.

## 13. The business model

EdgeTap's current model combines physical-product sales with digital setup and ongoing profile availability.

| Revenue source | Commercial role |
|---|---|
| Single Link Cards | Entry purchase for customers with an existing destination |
| Profile Cards | Main offer combining a physical item with profile setup and an editable online presence |
| Explicit two/three-card bundles | Larger matching-card orders at a selected package price |
| Cards for existing profiles | Repeat physical purchases without duplicating the digital profile |
| Paid extra profile links | An allowance charge beyond the first ten links |
| Website + four-card projects | Higher-value, consultative website work |
| Website hosting/domain renewals | The documented Rs. 3000 annual renewal from year two |
| Agreed custom work or further physical revisions | Additional service work where scope and payment are confirmed separately |

The project does not currently depend on subscriptions for ordinary Profile Cards, advertising revenue or monetizing recipients' contact data.

The website's commercial journey is to explain the product, let a person start building with low friction, convert that preparation into a paid order, and support the relationship after delivery. A stable, useful profile can support repeat card orders and referrals, but the repository does not establish an actual retention rate or lifetime customer value.

The operating model remains service-heavy. Profile setup, customer messages, payment checks, design preparation and quality control consume time. Order volume therefore needs to be considered alongside staff capacity and actual contribution per order.

## 14. Costs and unit economics

The business guide contains an owner-reported cost record, not a complete audited cost model:

| Cost item | Recorded amount | Evidence/status |
|---|---:|---|
| Sample blank NFC card | Rs. 350 | Owner-reported sample expense |
| Sample printing | Rs. 150 | Owner-reported expense/current printing reference |
| Sample blank + printing | Rs. 500 | Sample obtained; fading on its front still needs correction |
| Order of 18 advertised NTAG215 cards | Rs. 2300 total | Ordered; receipt, specification and usable quantity not established by the recorded evidence |
| Nominal unit price of that batch | About Rs. 127.78 | Assumes all 18 are usable; excludes additional charges |
| Small envelope | Rs. 10–20 per card | Estimate |

The following illustrates the current offer prices against the historical Rs. 500 sample blank-and-print cost per card:

| Offer | Sale price | Assumed blank + printing | Remainder before all other costs |
|---|---:|---:|---:|
| One Link Card | Rs. 999 | Rs. 500 | Rs. 499 |
| Two Link Cards, offer | Rs. 1599 | Rs. 1000 | Rs. 599 |
| Three Link Cards, offer | Rs. 1999 | Rs. 1500 | Rs. 499 |
| One Profile Card | Rs. 1499 | Rs. 500 | Rs. 999 |
| Two Profile Cards, offer | Rs. 2099 | Rs. 1000 | Rs. 1099 |
| Three Profile Cards, offer | Rs. 2499 | Rs. 1500 | Rs. 999 |

These remainders are **not net profit** and are not proof of the cost of future stock. They exclude packaging, delivery absorbed by EdgeTap on new orders, payment costs, rejected cards, reprints, design/profile work, programming, QA, support, marketing, software and applicable taxes.

If the lower-cost batch arrives with every card usable, the documented printing rate and envelope estimate would imply roughly Rs. 287.78–297.78 per card before those other costs. Actual cost needs to use the real landed batch amount divided by the usable quantity.

Delivery is particularly important to the updated model: older calculations assuming the customer pays the rider separately do not describe new included-delivery orders. No reliable net-margin figure can be derived without actual rider costs and operating effort.

## 15. Technology and data responsibilities

The website uses a static frontend with a managed backend:

| Layer | Current role |
|---|---|
| Next.js App Router, React and TypeScript | Website pages, public profiles and browser interfaces |
| Tailwind CSS and shared styles | Responsive layouts and the visual system |
| GSAP | Storytelling, scrolling and motion interactions |
| Firebase Hosting | Serving the exported website and public assets |
| Supabase Auth | Customer and staff identity |
| Supabase PostgreSQL, RLS and RPCs | Ownership, prices, applications, orders, reviews and guarded staff actions |
| Supabase Storage | Public profile images and protected customer/production files |
| Browser IndexedDB/session storage | Guest draft recovery and temporary form persistence |
| PDF and QR libraries | Contact PDFs, print exports and codes for confirmed destinations |

Firebase is Hosting only in the selected production architecture. Historical Firebase data-service code or dependencies are not evidence that the current website uses Firestore for orders.

The static export does not make this merely an informational landing page. Authenticated browser interfaces use the protected backend for the commercial workflow. Server-side rules remain responsible for prices and permissions; hiding a button in the browser is not access control.

### Public and private information

Public information includes activated profile details, avatar/logo files and intentionally published reviews. Uploaded profile images have public URLs even before profile publication, which the upload flow discloses.

Private information includes account-owned applications, delivery addresses, receipts, original artwork, proofs and internal staff notes. Customers see the order information and messages relevant to them; internal notes are not public profile content.

The website currently declares no advertising trackers or tap analytics. Authentication and drafts still require browser storage. External websites opened through profile links have their own policies.

Marketing and policy pages are the intended indexable pages. Public profiles and private/account routes are excluded from the sitemap and carry noindex behavior. Noindex limits search discovery; it does not make a publicly shared profile private or replace authentication for protected data.

## 16. Current release and operating limits

The latest recorded website release is **26 October 2026 at 8:32:34 am Pakistan time**, Firebase Hosting version **`cabbc34a2b3f0358`**. It includes admin-managed current/comparison prices, offers and additional-card/link fees, confirmed profile saves and signed-in side-menu editing. Staff can publish an order profile directly on `edgetap.tech/u/<handle>` without mandatory review/payment/printing steps. Confirmed users can self-publish one free website profile with up to ten links.

The recorded backend history is migrations 001–015 plus 017–026. Optional migration 016 remains unapplied. The website releases preserved existing order, profile and application records and other existing backend contracts. The initial catalog retains the prices in this overview; dashboard changes control the public pricing page and new checkouts, while submitted orders keep their agreed revision.

Release records report production builds, static/release checks, isolated SQL tests, integrated browser tests and read-only live checks. They distinguish local simulated Auth/Storage/payment workflows from actual customer activity. Those recorded checks are not new tests performed while writing this overview.

The website is released, but several business and operational capabilities still need real-world evidence or further work:

- Complete a consenting paid order through funds verification, current-proof approval, printing, programming, QA and handoff.
- Verify real customer confirmation/recovery email delivery and account recovery.
- Verify hosted signed-in uploads and private file access with actual existing file bytes and the correct account boundaries.
- Correct and approve the fading sample print, and confirm supplier output requirements.
- Inspect ordered stock for real chip type, writability, usable quantity, rejects and landed cost.
- Confirm delivery coverage and realistic fulfillment capacity.
- Finalize unresolved cancellation, reporting/remedy, retention and hosting-change terms.

Order/proof notification email transport and its scheduler are inactive. A queued email is not a sent email. Payments, courier booking and physical production remain manual. There is no implemented tap/open analytics product established by the website.

## 17. Business direction and expansion boundaries

The documented near-term priority is a reliable small physical-card launch: demonstrate the real result, handle a manageable number of customers, correct print issues and understand the actual cost of fulfillment.

The guides suggest observing real enquiries, payment conversion, order completion time, defects, support effort, repeat purchases and referrals. These are useful operating measures, not existing performance statistics or proof that analytics tracking has been implemented.

Expansion ideas include larger business orders, additional mini-sites, menus, review cards, events, attendance and team use cases. They are future opportunities requiring demand validation, pricing, operating capacity and implementation. An unused component, illustration or roadmap note should not be treated as a released product.

The present description of EdgeTap should remain centered on the products it actually offers: a physical card opening an existing link, a physical card with an editable EdgeTap profile, and directly arranged custom website/card work.

## 18. Contacts and project references

| Contact purpose | Public contact |
|---|---|
| General support, orders and custom digital profile templates | [WhatsApp +92 304 414 9674](https://wa.me/923044149674) |
| Graphic-design assistance | [WhatsApp +92 327 1360809](https://wa.me/923271360809) |
| Support email | sardaribraheem277@gmail.com |
| Product demonstration | [Example profile](https://edgetap.tech/u/ibraheem) |

### Reading map

| Question | Primary repository reference |
|---|---|
| What is recorded as live, and what remains unverified? | [Launch status](../docs/LAUNCH_STATUS.md) |
| What was released and checked? | [Release history](../docs/RELEASE_HISTORY.md) |
| What did the owner request and later correct? | [Website feedback brief](../docs/WEBSITE_FEEDBACK_2026-10-23.md) |
| How are commercial decisions and costs recorded? | [Business guide](../docs/businessguide.md) |
| How does staff fulfill orders? | [Admin guide](../docs/adminguide.md) |
| How are website pages and artwork maintained? | [Developer guide](../docs/developerguide.md) |
| How are data and permissions organized? | [Backend guide](../docs/backendguide.md) |
| How is the website built and published? | [Build guide](../docs/BUILD.md) |
| Which expansion ideas are only proposals? | [Roadmap](../docs/ROADMAP.md), website/business portions |
| What are the current public offer descriptions? | [Pricing page](app/pricing/page.tsx) and [shared content](lib/data/content.ts) |
| What enforces card prices? | [Order pricing](lib/data/order.ts) and [migration 020](supabase/migrations/202610230020_website_offers.sql) |
| What enforces public review publishing and pagination? | [Migration 021](supabase/migrations/202610230021_website_reviews.sql) |
| What does a public profile actually display/export? | [Profile page](components/ProfilePage.tsx) and [contact PDF](lib/contact-pdf.ts) |
| Where are support and payment details maintained? | [Site contacts](lib/site.ts) and [checkout configuration](lib/checkout.ts) |
| What policy wording is published? | [Terms](app/terms/page.tsx), [privacy](app/privacy/page.tsx) and [browser storage](app/cookies/page.tsx) |

When updating this overview, reconcile the current source with the newest recorded owner decision and release. Preserve the difference between a released feature, a proposed service, a historical cost and a verified business outcome.


## Free profiles and flexible fulfillment, 26 October 2026

The website also offers one free profile per confirmed account with up to ten chosen links. No order, payment or admin acceptance is required to publish it. A public Email link is optional and independent of private account email. The profile carries EdgeTap branding and a card-order CTA; its owner can reuse that profile when ordering cards at the catalog's existing-profile rate.

Staff can directly publish an order profile and choose printed-card, NFC-tag-only or digital-only fulfillment. Payment verification, optional review, print files and email remain separate decisions. Eight optional staff checks stay private; explicit review start/completion appears in My orders without automatic email. Staff can edit customer public details and remove/restore public visibility without deleting ownership or order records. Payment checkout accepts a reference or private receipt; neither automatically verifies funds.

The owner reports the first paying customer requested an NFC tag rather than printing. That customer's existing profile/order/payment were kept unchanged. Actual programming/QA/handoff remain manual. Branded signup/recovery email templates and an SMTP setup plan are prepared, with actual sender configuration unchanged.
