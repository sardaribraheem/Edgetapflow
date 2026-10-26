# Customer growth and paid product proposal

Researched 26 October 2026. Requested scope: investigate Let's Connect Card and ITSE's profile service, then propose how EdgeTap can acquire customers and grow beyond a link profile. **This is a proposal for discussion, not an approved change to limits, prices, customer profiles or the live website.** The current ten-link free offer remains the authority in [launch status](LAUNCH_STATUS.md) and the [business guide](businessguide.md).

**Execution order, 27 October:** use the root [update plan](../updateplan.md), starting with existing-site cleanup and explicit owner confirmation before deleting any test profile. The research and proposed feature sequence below support those milestones; they do not override that cleanup boundary.

## Recommendation

Keep the free profile useful enough that people actually share it. Keep the current ten-link offer during the first customer pilot. Five links remains a reasonable future starting limit to consider with a clearer paid offer; four leaves less room for useful contact channels. The stronger paid offer is a way to get enquiries, show services and ask for reviews, with physical cards/tags making those actions convenient in person. Profession-specific profile content and dependable fulfillment now take priority over experimenting with the free quota.

Start with two audiences: NIIT professionals/freelancers for profile cards, and nearby salons or other appointment/service businesses for review hardware. These are hypotheses to test through conversations and small paid pilots. EdgeTap's advantage to test is personal setup, WhatsApp support, local payments and a working physical demonstration. A broad feature list alone is easy to imitate.

## Competitor findings

These observations describe public marketing and visible pages, not independently tested functionality, sales or customer outcomes. Pricing and products were also inspected in a browser; no signup, purchase or private dashboard test was performed.

| Finding | Evidence | Lesson for EdgeTap |
|---|---|---|
| They present a journey from sharing to contact capture, bookings, CRM and follow-up. AI features carry availability/testing/development labels, although the same assistant is also called coming soon elsewhere. | [Homepage](https://letsconnectcard.com/) | Sell a useful next action after the tap. Mark availability consistently. |
| Their pricing page lists a free profile; PVC, wood and metal cards at $30/$70/$130; and $79/$129 one-off digital packs. | [Pricing](https://letsconnectcard.com/pricing) | Separate the hardware purchase from optional software upgrades. |
| Their products page also offers $9/$29 monthly digital plans, despite the pricing page's no-subscription message. | [Products](https://letsconnectcard.com/products) | State the exact amount, billing period and included features consistently across pricing and checkout. Treat their prices as advertised, not a verified checkout quote. |
| They offer review cards, stands, stickers and plaques, with a direct review destination or an optional editable redirect. | [Review hardware guide](https://letsconnectcard.com/products/review-cards) | The same NFC concept can serve different locations and business needs. Validate each format before stocking it. |
| Their digital-card product describes galleries, services/products, documents, contact capture, bookings and exports. | [Digital business card](https://letsconnectcard.com/product/digital-business-cards) | Profiles can help a visitor choose and contact a business, beyond presenting social links. |

Their distinctive positioning is the combined hardware, profile and business workflow. This research does not establish that those features are exclusive to them or work as advertised. Do not reuse their customer counts, performance claims, compatibility promises or lifetime commitments as EdgeTap evidence.

## ITSE investigation, updated after successful browser access

The owner met Usama at an event and reports that he has his own printers and a rider. Equipment ownership, actual order volume, costs and profitability remain owner-reported or unverified. A meeting is planned for 27 October; the [meeting and offer brief](USAMA_MEETING_2026-10-27.md) covers business questions and a possible development role. No job or equity offer has actually been made in this conversation.

Earlier requests timed out, but subsequent browser access on 26 October succeeded. The [profile homepage](https://profile.itseweb.com/) identifies the service as **Profile Way**, promotes digital vCards and WhatsApp stores, and displays monthly prices of Rs. 200 Standard, Rs. 500 Business and Rs. 800 Enterprise. Selecting Yearly displayed Rs. 2,000 Standards, Rs. 5,000 Businesses and Rs. 8,000 Enterprise / Agency, with profile-quantity choices. These are displayed default offers, not verified checkout totals or hardware-inclusive quotes. Some cards say one vCard template; ask whether this means one selected design or restricted access. Do not infer paid traction from homepage counters.

The [template gallery](https://profile.itseweb.com/vcard-templates) contains **40 numbered preview images and 40 template headings**, including Lawyer, Doctor, Developer and Photographer. An initial body-text count double-counted a Dynamic label; 40 is the checked preview count. This verifies a broad gallery, not 40 independently tested workflows or access to every template on every plan. Source-code ownership, platform vendor, modification rights, licensing and upgradeability remain unknown.

The [doctor profile](https://profile.itseweb.com/dr-sannan-qayyum) was inspected at desktop and 390px mobile widths. Its newsletter overlay was dismissed and its appointment date picker opened successfully. No appointment, enquiry, newsletter subscription, download or other submission was made; no delivery, booking or contact-import result is established.

Observed experience and proposed improvements:

| Observation | Practical improvement to test |
|---|---|
| A newsletter modal opens over the initial profile view. | Make the main contact/appointment action immediately accessible; place newsletter signup later or make it optional. |
| The image banner's text is visibly cropped on mobile; the same person is pictured repeatedly. | Put essential name/role/contact details in responsive text and use a simpler image hierarchy. |
| A large QR section precedes appointment entry, requiring more scrolling. | Prioritize the visitor's likely task, with QR as a secondary share action. |
| Decorative medical graphics and strong shadows surround functional sections. | Reduce visual competition and give forms clear spacing and contrast. This is design judgment, not measured conversion evidence. |
| Contact, appointment selection and enquiry fields are visible; the calendar opens. | Test the complete workflow with the operator's permission before promising real booking or enquiry delivery. |

The mobile page did not show horizontal overflow at the inspected width. Do not call the whole site broken or infer security defects from styling or console messages. Structured directions/hours, a direct WhatsApp action and a clear appointment/contact hierarchy are opportunities to discuss; some clinic information appears in the banner image. Avoid copying this doctor's personal/contact content into EdgeTap examples. Screenshots remain ignored research artifacts, outside maintained source documents.

The [main domain](https://itseweb.com/) was readable. It advertises managed five-page business websites at Rs. 5,000/year on a subdomain or Rs. 8,000/year with a domain, with hosting/management and WhatsApp product enquiries. This is a separate observed website offer; its relationship to the requested profile service and to Usama was not established. Do not present those prices as ITSE profile/card prices. The useful hypothesis is that some buyers may pay for having their presence set up and maintained for them.

For a later comparison, inspect more profession demos and the owner-authorized editor. Compare actual fields, primary actions, editing/switching, price/renewal/hosting terms, physical-card inclusion, proof/reprint process and support/delivery scope. No signup, private dashboard, source repository, payment or customer data was accessed.

## Profession profiles: proposed product direction

The idea worth testing from the owner's ITSE report is that buyers can immediately recognize their own work in a profile. A useful profession preset suggests relevant content, asks better setup questions and highlights the right visitor action. A purely visual theme changes appearance. EdgeTap can support both through one profile system.

Start with three families rather than building 30 separate experiences:

| Initial family | First reachable buyers | Suggested content | Main visitor action |
|---|---|---|---|
| Professional | NIIT founders, consultants and other professionals | Role, expertise, company, contact choices, public office details if relevant | Save contact or request a consultation |
| Portfolio | Freelancers, designers, photographers and developers | Selected work, services, short project descriptions and permitted testimonials | Ask about a project on WhatsApp |
| Local business | Nearby salons and other service businesses | Services, optional prices, hours, directions, photos and review destination | Enquire/book through an existing link or leave a review |

Lawyer-specific content could fit the Professional family: practice areas, languages, public office details and a general consultation request. Property-agent content can become a later preset with listings and property enquiries if buyers justify it. These are EdgeTap proposals, not inspected ITSE capabilities. Profession alone should not force a template; an owner should be able to choose their actual purpose.

Use one editable profile record and shared sections for identity, links, services, gallery, directions, reviews and enquiries. Presets suggest section order, labels, style and a primary action. Keep the public handle/NFC destination stable. Switching presets must preserve existing content and access allowances, including content a new preset does not currently display. Any future custom-domain offer needs separate support and lifecycle planning.

An early setup flow could ask what the owner does and what visitors should do next, then recommend a preset with sample content clearly marked as an example. Free users should get an attractive basic result. Paid users could buy richer sections, selected styles or assisted setup. Do not make a profession name itself a paid entitlement or promise improved search ranking from selecting a template. Existing customer profiles remain untouched.

The next useful paid comparison is three separate purchases: hardware, richer digital features and human setup/design. Clearly state which are bundled and which are optional, including edit limits and hosting/renewal terms. An owner who wants a physical card should not need every business tool, and someone who wants a business profile should be able to purchase it without hardware.

## Printing and delivery strategy

Usama's equipment and rider, as reported by the owner, are a reference for a possible operating model. They do not establish what is economical for EdgeTap's current volume. Start with an approved print supplier, a backup option and delivery paid per order. Personally inspect early orders and record the actual work and handoff.

Before choosing a supplier, collect comparable quotes and samples for the same card/print scope. Confirm colors, durability, bleed/file requirements, two-sided alignment, minimum quantities, turnaround, reprints and defect responsibility. Check every pilot card/tag's destination, NFC behavior and matching QR where included. Record delayed orders and support time as well as material cost.

Evaluate equipment only after sustained profitable demand. A simple break-even estimate is additional monthly fixed ownership cost divided by savings per acceptable card compared with outsourcing, provided the savings are positive. Include consumables, rejects, maintenance, operator time and realistic usable capacity. The decision should also consider cash needed upfront, backup production and whether quality improves. Equipment ownership alone does not demonstrate a lower total cost.

Evaluate a dedicated rider against actual delivery density and the full cost of staffing, fuel, idle time and failed attempts. Keep existing delivery-included customer terms in the margin calculation. Do not create a new delivery fee, area or dispatch promise through this planning document.

If the owner continues speaking with Usama, useful learning questions are which professions actually purchase, what customers ask for most, how much setup/support each order takes, how often printing fails, when owning equipment became worthwhile, and what he would simplify if starting again. These are suggested questions for the owner; no outreach or partnership has been initiated.

## Free and paid boundaries

| Offer | Proposed scope | Commercial role |
|---|---|---|
| Free profile | One profile; five ordinary links for new profiles if adopted; name/photo/bio; editable content; existing PDF download; easy sharing; small EdgeTap attribution | Useful entry point and a source of referrals |
| Card or tag | Physical sharing device opening the owner's existing profile or agreed direct destination; setup and actual phone/QR checks | First purchase, available without buying every software feature |
| Business profile upgrade | Ten included links, selected appearance controls, services/gallery, enquiry inbox and measured activity, as delivered | Paid value for businesses that need more than basic sharing; digital-only purchase should be possible |
| Review setup | Correct Google review destination, programmed card/tag or proven counter format, matching QR where included, and setup help | Clear local business use case; quote hardware and service scope before sale |

All new features in this table are proposed. Basic sharing/QR convenience and native contact import still need their own implementation review. Current Save Contact creates a PDF; it does not import a phone contact. Native contact import should be a basic product improvement, with real phone verification, rather than a paid hurdle.

If five links is adopted, count every ordinary owner-added action destination equally, including email, WhatsApp, website, booking or review links. Name/photo/bio and built-in share/download controls do not consume link slots. Owners choose their links; there is no mandatory public Email entry. Structured paid sections have separately stated limits so the quota remains understandable.

Show `Free plan · 3 of 5 links` in the owner's editor. At capacity, explain the upgrade without discarding drafts. Keep the public profile professional with modest attribution. Additional links alone may produce little willingness to pay; five vs ten is a hypothesis, not a conversion guarantee.

Existing free profiles should retain their ten-link allowance. Preserve purchased capacity, paid order terms, stable URLs and all existing links. Tarsil.pk's profile, including its Email link, stays unchanged. A later rollout needs an additive entitlement model enforced by the server, not a builder-only limit change or edits to applied migrations. Model hardware ownership and software access separately; the free-profile origin flag is not sufficient to determine paid access. Card purchases must explicitly state whether any software upgrade is included.

### Reconcile the current price paths before advertising a new tier

Current documented defaults are Rs. 999 for a Link Card, Rs. 1,499 for a profile/card package and Rs. 700 for cards bound to an existing owned profile. A free-profile owner already qualifies for that existing-profile path. These are catalog defaults; the live admin catalog may differ. No hosted price was changed or verified by this research.

Do not advertise Rs. 1,499 as the unavoidable upgrade from free, or silently turn an existing-profile card order into a business-software purchase. Define any difference as an explicit service/software bundle. Compare the Link Card's scope with the existing-profile card path so customers understand what each price buys. Keep the current ten-link paid allowance and Rs. 50/default charge above ten intact until a replacement is explicitly chosen. Avoid overlapping link charges and business tiers that bill twice for the same capacity.

For the first pilot, use agreed hardware/setup quotes with clear included work. Decide a digital upgrade price after customers identify valuable features and support/storage costs are known. Defer a subscription until there is repeated ongoing value to fund. A one-time payment does not justify an undefined lifetime-hosting promise.

## Build priorities

| Order | Smallest useful version | Why it matters |
|---|---|---|
| 1 | A prominent Google review action; a direct review card/tag offer with matching QR where included | Easy to demonstrate to a local business; a direct-destination pilot may use the existing Link Card concept without building a review platform |
| 2 | Services with a few photos, descriptions, optional prices and a WhatsApp enquiry action | Gives visitors a reason to choose the business and contact it |
| 3 | Optional enquiry form: name, chosen contact method, message; private owner inbox; simple follow-up status | Helps owners receive and manage requests without building a full CRM |
| 4 | Recorded profile opens, outbound action clicks and submitted enquiries, with clear definitions | Helps owners assess use and helps EdgeTap diagnose the purchase funnel |
| 5 | A few useful appearance choices and a booking-link action | Adds relevant customization and scheduling access without a native booking engine |

An ordinary Google review URL can already be used as a profile link. A dedicated review button improves its presentation, but a hyperlink alone is a weak premium feature. Charge for useful setup, physical hardware, business presentation and proven management tools.

Keep three concepts separate: reviews of EdgeTap on its website, outbound reviews of a customer's business on Google, and any later testimonials displayed on that business's profile. The existing EdgeTap review system does not supply customer-business reviews. A review-button click is not proof that a Google review was submitted. Displaying Google ratings/reviews automatically is a separate integration proposal.

Google supplies review links/QR codes, and reviewers need a signed-in Google account. The review flow should open the genuine destination, allow any rating, and avoid rewards or filtering unhappy customers away from Google. Sources: [Google review-link instructions](https://support.google.com/business/answer/16816815?hl=en-11) and [Google Maps contribution policy](https://support.google.com/contributionpolicy/answer/7400114?hl=en).

Enquiry collection needs voluntary submission, a clear destination/purpose, owner-only access, spam controls and a retention/deletion decision. Receiving an enquiry is separate from marketing consent. Current automatic order emails are inactive; do not promise enquiry email alerts before delivery is proven. Direct WhatsApp is the simpler initial action.

Analytics must use actual permitted events. Fixed card URLs do not identify every physical tap or distinguish QR from NFC. Anonymous opens do not identify people; PDF downloads do not establish contact saves. Tracking failure should never block profile access. Do not add tracking just to fill a dashboard.

Defer AI assistants, full CRM, built-in scheduling, card scanning, native-app expansion, social feeds and team administration. Revisit when paying customers repeatedly need them.

## First 30 days: learn, sell and fulfill

The figures below are planning targets, not forecasts or current traction. The owner handles outreach; this plan sends no messages or advertising.

1. **Week 1 — remove friction and choose the offer.** Verify a real new-user confirmation/login/profile-publication journey; fix failed delivery before driving traffic. Correct the fading print sample and prove programming/QR/handoff on actual hardware. Speak to ten NIIT professionals/freelancers and ten nearby service-business owners. Show the current profile and the direct review flow. Ask which action they want customers to take and what they would pay for setup/hardware. Establish which features already work before demonstrating them as available.
2. **Week 2 — test three profile concepts.** Prepare Professional, Portfolio and Local Business examples, clearly separating any mockup from working functionality. Use contact/portfolio sharing for the NIIT audience and a review action/WhatsApp enquiry for the service-business audience. Record short real-phone clips of working behavior, with permission for any real business details. Use one clear free-profile CTA and one hardware purchase CTA. New use-case pages should demonstrate a specific outcome; broad SEO content can wait.
3. **Week 3 — run a small paid pilot.** Aim for ten voluntarily published profiles and three to five paid hardware/setup orders, subject to usable stock and fulfillment capacity. Use existing channels and in-person introductions. Ask fulfilled customers for an honest review and one introduction, with permission to show their result. Referral rewards, if later adopted, must be separate from review requests.
4. **Week 4 — inspect objections and usage.** Ask what led to each purchase, whether the profile was shared again, and why others stopped. Review actual support/defect/delivery costs. Choose the first business feature from repeated buyer needs. Keep five vs ten links as a later measured decision if signup activation is still unproven. Avoid splitting a tiny audience into an inconclusive A/B test.

Run two entry paths through the pilot. Someone exploring the product can create a free profile, share it and later order hardware or a digital upgrade. A business with an immediate review/contact need can see a relevant demo and buy agreed setup/hardware directly. Do not make a paid assisted customer complete unnecessary self-service setup before receiving help. Record the path and profession/family in the private pilot tally so free signups are not mistaken for hardware purchase intent.

During days 31–60, focus on the family with the strongest paid demand, repeat use and contribution. Build the most repeated missing section, publish an honest permitted example and make fulfillment dependable. During days 61–90, consider a fourth preset or a small professional association/event channel only if the first offer repeats. These are conditional planning stages, not deadlines or commitments to release features. Expand when several independent buyers in a segment need the same missing behavior and show willingness to pay; requests for more colors alone are weaker evidence.

Potential website message for later review: **Create your free business profile. Share your contacts, help customers enquire, and add a card or tag when you need it.** List review/enquiry tools as available only when delivered. Profiles remain noindex; any later search acquisition should use suitable public marketing pages and preserve existing profile indexing/privacy decisions.

## Measure the funnel and decide what to change

Track counts by source and cohort: interested visits or demos → confirmed accounts → published profiles → a voluntary report of first sharing → card-order starts → actual paid orders → fulfilled orders. Website traffic tracking is not assumed to exist; a private, minimal manual tally can start the pilot. Keep customer identifiers out of versioned documents.

Useful measures are confirmation completion, publication after confirmation, seven-day self-reported sharing, paid orders per published-profile cohort and conversion by demo/channel. For later software, measure actual enquiries and repeat use rather than feature-page views. Do not equate clicking Share with another person receiving or opening a profile.

If confirmations fail, fix onboarding. If profiles are published but rarely shared, improve usefulness/sharing. If people share but decline hardware, investigate the use case and price. If businesses buy review hardware, repeat that narrow offer before building a broad software suite. Requests for a sixth link are useful evidence but do not prove willingness to purchase.

For each physical order calculate collected revenue minus usable hardware, printing, packaging, included delivery, payment fees, reprints, setup/support time and acquisition cost. The earlier Rs. 500 sample cost leaves only Rs. 200 at a Rs. 700 card price before other costs; use this as a planning warning, not a current unit-cost claim. The ordered cheaper stock is still unverified. Set any advertising budget from measured contribution and fulfillment capacity; begin with direct demonstrations and referrals.

## Next implementation decision

Recommended first scope after discussion: validate the three profile families with reachable buyers, use the review action/card/tag as the simplest local-business pilot, and prioritize services plus WhatsApp enquiries. Keep the current ten-link free offer through the pilot; a future five-link rule should apply to new profiles only and ship with clear paid benefits. Use outsourced production and delivery while measuring their results. No implementation, deployment, price change, equipment purchase, outreach or customer-data edit is authorized by this document itself.

## Website update sequence

The owner requested an update plan on 26 October, not immediate implementation. Read the [app planning counterpart](../EdgeTapApp/docs/NEXT_STEPS_PLAN.md) before shared-contract work.

| Stage | Reviewable scope | Acceptance before continuing |
|---|---|---|
| 1 — dependable entry and offer | Prove signup/confirmation/recovery, profile save/read-back and hardware handoff; explain free profile, existing-profile card and assisted package prices consistently | Ordinary-user evidence, working shared URL, actual fulfillment/cost record and no change to saved customer terms |
| 2 — focused public profile | Put identity and the owner's primary contact action first; make QR/share secondary; retain modest attribution and public accessibility | Mobile/desktop/keyboard checks, optional fields handled, stable NFC URLs, no new popups blocking contact |
| 3 — one profile system, three presets | Professional/Portfolio/Local Business; shared identity, links, services/gallery and primary-action settings | Preview and save match the recipient page; switching preserves content; older clients cannot erase new sections |
| 4 — review and business actions | Google review destination, directions, externally hosted booking link or WhatsApp enquiry; then a private enquiry inbox if demand warrants it | Valid destinations and real owner tests; private submissions isolated; review clicks never reported as submitted reviews |
| 5 — paid capabilities and measurement | Explicit hardware/software/setup bundles, server-owned access allowances and genuine event collection/owner aggregates | Capacity/ownership/staff moderation preserved, purchased rights honored, data purposes and retention chosen, payment verification remains truthful |

For profession presets, start with the sections needed by initial paying buyers. Do not create 40 hardcoded public-page implementations or a complete scheduler/CRM to match a marketing list. One good professional profile and one useful business workflow can be validated before all three presets are finished.

Preserve Tarsil.pk's current profile including Email, every existing handle/encoded URL, purchased link allowances, paid snapshots and current public indexing rules. Native contact import is a separate improvement from the existing PDF download. Every production implementation/release retains its usual review and authorization boundary. Work for Usama would use a separate repository/contract and must not become a dependency for EdgeTap's public profile operation.
