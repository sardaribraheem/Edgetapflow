# EdgeTap product catalog, operating costs and delivery plan

**Implementation update, 30 October:** standard catalog/checkout, public prices, admin/backups, compression and core business sections are released. Annual/trial foundations are implemented but disabled pending policy choice; archives/import/retention and app alignment remain later scope. This specification retains broader planning context; use the [actual release guide](PRODUCT_CATALOG_RELEASE_2026-10-30.md) and [milestone status](../updateplan.md) for current behavior.

Planning and scoped admin implementation revision: **30 October 2026**, Pakistan time. The owner requested a detailed plan before implementation. This document specifies the work to build; it does not apply prices, enable billing, expire profiles, send email, move/delete customer records, ship cards or release the app. Follow the ordered [milestones](../updateplan.md).

## 1. Decisions and scope

- Use **Rs. 1,499/year as the latest preferred Basic digital-service planning price**, separately from hardware. The owner can change future selling prices from the dashboard. This preference is not a live catalog update or a guarantee of profit at 100 payers.
- Use **Rs. 700 as the latest proposed card add-on**. Rs. 500–600 were earlier candidates. The owner reports **Rs. 260 current card production excluding delivery**; blank-card, tag, label, printing, packaging and labor breakdowns still need actual inputs. Do not invent cheaper variant costs from that one figure.
- Plan a clearly advertised **14-day trial for a future cohort**, with suspension/recovery rather than immediate deletion. Existing free profiles, purchased link capacity and paid promises remain intact. The precise cutover is recorded before release.
- Cover digital-only, tag-only, unprinted/printed cards, direct external links, new/existing profiles, additional hardware, replacement and renewal purchases. Keep hardware ownership independent of annual software entitlement.
- Keep the small operational/account/order ledger in cloud Postgres. Add encrypted local archives for eligible historical bulky files and full snapshots; do not remove active operational information on order confirmation.
- Improve public pricing, checkout and admin navigation around one versioned catalog. Keep the app on the same account/profile/offer contracts.
- Finish ordinary Auth/upload/payment/physical acceptance before calling the product ready. The existing Android preview is a starting point, not a completed public app release.

Known release starting point: root launch status records website migration history 001–015 plus 017–027, with 016 unapplied and app 019 already applied. Recheck actual history/working trees before implementation; never rerun applied SQL. Website and outer workspace have separate Git boundaries. Preserve the owner's uncommitted app PRD edits and unrelated files.

## 2. Profit at 100 paying customers

Count **100 collected annual subscriptions**, not 100 signups, trial accounts or unpaid invoices. Hardware revenue below is separate. All figures are planning scenarios, before applicable tax; actual service/FX invoices and support demand remain unverified.

| Input | Assumption |
|---|---:|
| USD conversion for budgeting | Rs. 280/$, not a live bank quote |
| Next domain renewal, owner-reported | $30 = Rs. 8,400/year; current student first year reported free |
| One-project Supabase Pro baseline | $25/month = Rs. 84,000/year |
| Other cash operating allowance | Rs. 10,000/year, illustrative email/transfer/payment/backup allowance, not a quoted cap |
| Owner time | 20 minutes/customer/year at an illustrative Rs. 600/hour = Rs. 200/customer/year |
| 100-customer annual modeled cash cost | Rs. 102,400 |
| 100-customer annual modeled cost including time | Rs. 122,400 |

The Pro price includes one Micro project via compute credit; additional compute/projects/add-ons or traffic can cost more. [Supabase pricing, checked 30 October](https://supabase.com/pricing). Domain figures come from the owner. The Rs. 10,000 allowance could be insufficient for a paid email plan or heavy traffic; the hourly value is an opportunity-cost assumption, not a market wage claim.

| Digital renewal price | Annual revenue from 100 | Cash remaining before owner time | Remainder after modeled owner time, before tax |
|---:|---:|---:|---:|
| Rs. 1,000 | Rs. 100,000 | **−Rs. 2,400** | **−Rs. 22,400** |
| Rs. 1,499 | Rs. 149,900 | Rs. 47,500 | Rs. 27,500 |
| Rs. 1,599 | Rs. 159,900 | Rs. 57,500 | Rs. 37,500 |
| Rs. 1,999 | Rs. 199,900 | Rs. 97,500 | Rs. 77,500 |

At these assumptions, Rs. 1,524/customer/year would fund Rs. 30,000 annual profit after the modeled time allowance. Rs. 1,599 is a reasonable price to test if the goal is a modest standalone surplus at only 100 payers. The owner subsequently prefers Rs. 1,499/year with a Rs. 700 card add-on. That is the new planning anchor; retain the Rs. 1,000 row as a historical comparison. Keep prices editable and fund any provider upgrade before spending.

If providers still legitimately fit free allowances, the same 100 × Rs. 1,000 scenario leaves about **Rs. 61,600/year after the domain reserve, Rs. 10,000 other allowance and modeled time**. This is conditional on real usage/reliability/backup/email needs, not a promise that production should remain free. Do not make the business depend on hitting quotas before funding the next month.

With the Pro cash baseline above and Rs. 200/customer variable time allowance, Rs. 1,000 requires approximately **128 annual payers to break even**, or **166 for Rs. 30,000 annual surplus** if the other cash allowance stays fixed. Actual usage/support can raise those counts. At 100 payers, a mix of 50 Basic at Rs. 1,000 and 50 Business at Rs. 2,000 produces Rs. 150,000 and Rs. 27,600 modeled surplus only if Business does not increase the assumed costs. That is a scenario, not a sales forecast or an accepted tier price.

A Rs. 600 card less Rs. 260 production and Rs. 20 assumed packaging leaves **Rs. 320 once**, before delivery, failures, fees and programming labor. One hundred such initial card purchases add Rs. 32,000 contribution before those other costs. This cannot be counted as recurring renewal profit. Cards are not replaced free each year. Honor already included delivery; any new separate-delivery policy is explicit in the new quote.

### Latest owner proposal: Rs. 1,499/year and a Rs. 700 card

**100 customers does not itself require Supabase Pro.** Official Free allowances checked 30 October are 500 MB database, 1 GB stored files, 50,000 monthly active users, 5 GB uncached egress and a separate 5 GB cached egress. Usage, performance and backup/reliability needs govern the upgrade. Free projects can pause after one inactive week. The current account billing dashboard and monthly usage have not been reverified in this admin implementation. [Supabase pricing](https://supabase.com/pricing), [egress accounting](https://supabase.com/docs/guides/platform/manage-your-usage/egress).

At a proposed 200 KB compressed portrait/logo allocation, 100 profiles occupy about **20 MB of public images**. At 100 cold views per profile/month, those images transfer about **2 GB/month** before API/Auth/private downloads, repeat admin exports, bots and other traffic. This is a scenario, not a measured capacity limit; compression is still planned, and other customers/projects share applicable quotas. Firebase Hosting and email have their own allowances.

| Item at 100 paying customers | Amount |
|---|---:|
| Annual digital revenue, 100 × Rs. 1,499 | Rs. 149,900 |
| Domain reserve + other cash allowance + modeled time, free infrastructure scenario | Rs. 38,400 |
| Conditional remainder after modeled time, before tax | **Rs. 111,500/year** |
| Same remainder after adding the Rs. 84,000/year Pro baseline | **Rs. 27,500/year** |
| First-year card revenue, 100 × Rs. 700 | Rs. 70,000 |
| Card production, 100 × Rs. 260 | Rs. 26,000 |
| One-time hardware contribution before delivery, packaging, failures, fees and setup time | **Rs. 44,000** |

Rs. 1,499 + Rs. 700 is **Rs. 2,199**, not Rs. 2,200. An explicitly published Rs. 2,200 bundle is also possible: define it as its own offer/quote rather than silently changing the sum. Renewal is digital service only, without a fresh card. Neither annual billing nor these new prices are enabled by this proposal; existing prices and terms remain intact.

The owner also requested implementation of the admin alignment, visible cleanup controls and local business backups. That limited work is now implemented locally on `codex/admin-layout-backups-2026-10-30`; see [implementation and recovery guide](ADMIN_WORKSPACE_AND_BACKUPS_2026-10-30.md). The broader product matrix, annual entitlements, compression and cloud-file retention/purge remain planned.

## 3. Product combinations and pricing chart

### Catalog axes

Use explicit independent choices rather than making a separate hand-coded checkout for each combination:

| Choice | Valid options and rules |
|---|---|
| Digital service | None/external destination; existing active/legacy owned profile; new Basic annual profile; later Business annual profile; renewal only |
| Hardware | None; NFC tag/chip; NFC card |
| Finish | Unprinted; supported printed card finish; optional tag label only if stock/production supports it |
| Destination | Customer-supplied external public URL; selected owned EdgeTap profile; explicitly sold unprogrammed stock |
| Setup | Self-service; separately priced bounded assistance/design when selected |
| Quantity | Stock-supported units; same destination/design for matching units; different identities require separate line groups |
| Delivery | Pickup; included delivery; separately priced/quoted delivery under the chosen catalog revision |

Invalid combinations must be rejected server-side: print with no physical item; a QR physically printed on a card sold as unprinted; a profile subscription without its profile/creation path; a tag sold as a printed PVC card; another person's profile claimed through a public URL; unsupported stock/finish; duplicate annual charges for multiple cards on one profile.

Let **A** be a new annual plan price; **T** a programmed tag price; **C0** an unprinted programmed card price; **C1** a printed programmed card price; **S** optional agreed assistance/design; **D** the order delivery charge. Tags, blank stock and print add-ons remain owner-priced/unavailable until costs are known. The proposed Rs. 700 card example is not the default for every physical SKU; tag and unprinted variants still need separate prices.

### Chart rows to support

| Public product combination | Initial total before optional S/D | Ongoing digital charge |
|---|---|---|
| 14-day digital trial, no hardware | Rs. 0, future eligible cohort only | Published annual offer after trial if chosen |
| Digital profile only, no physical item | A | A on renewal |
| NFC tag to an external link, no EdgeTap profile | T | No EdgeTap profile fee |
| Unprinted NFC card to an external link, no profile | C0 | No EdgeTap profile fee |
| Printed NFC card to an external link, no profile | C1 | No EdgeTap profile fee |
| NFC tag + new Basic profile | T + A | A, no new tag included |
| Unprinted NFC card + new Basic profile | C0 + A | A, no new card included |
| Printed NFC card + new Basic profile | C1 + A | A, no new card included |
| NFC tag for an existing active/legacy owned profile | T | Existing profile terms remain |
| Unprinted card for an existing active/legacy owned profile | C0 | Existing profile terms remain |
| Printed card for an existing active/legacy owned profile | C1 | Existing profile terms remain |
| Renewal without replacement hardware | Current applicable renewal quote | Defined next service period |
| Renewal + replacement/additional hardware | Renewal quote + selected unit price | One digital renewal only |
| Business plan, with any supported hardware finish | Business annual price + chosen hardware | Business renewal, separately disclosed |
| Extra matching tags/cards or a mixed supported order | Sum of unit lines less only an approved bundle discount | No duplicate subscription for same profile |
| Unprogrammed blank tag/card stock, if the owner elects to sell it | Dedicated stock SKU price | None; programming/setup inclusion explicitly absent |
| Review tag/card opening the business's approved external review URL | Applicable T/C0/C1 | No EdgeTap profile fee required |
| Custom design, unsupported material or genuine bulk request | Clearly scoped quote/contact route | Stated in that quote |

A destination can be an external business page/review link without requiring an EdgeTap annual plan. Do not claim a remotely editable redirect or analytics for a direct external NFC URL unless that separate service exists. Optional physical QR must match the confirmed NFC destination; an unprinted card can have NFC programming without a printed QR.

A new-cohort trial profile is not an active annual entitlement. If hardware is sold as a 12-month EdgeTap-profile package during that trial, quote the annual service explicitly and activate it on the same profile after verified payment; do not quietly ship a card whose promised profile disappears after the trial. A current owned free/legacy profile does not become chargeable merely because its owner buys hardware. For an expired new annual profile, quote renewal once if the customer chooses to reactivate it; do not create a second profile. A new Business tier is disabled until its actual features/entitlements exist. Unpriced/unsupported rows are marked unavailable or request-quote, with checkout disabled; never invent a placeholder Rs. 0 sale or advertise an unbuilt feature as delivered.

### Pricing-page presentation

Keep the first screen simple: Digital profile, Card, Tag. Show the selected hardware finish/destination and a readable full combination chart below. Filters for Profile needed / Existing profile / External link / Printed / Unprinted / Tag avoid an unreadable matrix on mobile. Each row has an accurate checkout CTA preselecting the supported choices.

Always display **first-year total**, **annual renewal**, hardware quantity/inclusion, setup scope, delivery terms and what is not included in renewal. Use accessible row labels, keyboard controls and mobile cards/scroll treatment. Comparison prices are optional owner-entered amounts with an honest basis; do not invent discounts or copy competitor features. All displayed totals come from the same server-owned catalog as checkout.

## 4. Owner-controlled catalog and quotes

Create one dashboard area **Catalog & plans**. Organize Digital service, Hardware/finishes, Setup/design, Delivery, Bundles and Availability. Owner-authorized staff can create a draft, preview the pricing chart and checkout examples, and publish a validated revision without a code deployment. Confirm the saved revision through read-back. Record actor/time and support a new revision that restores prior future-sale prices; never rewrite old orders.

Controls include annual/new/renewal prices; each physical SKU/finish; optional programming inclusion; setup/design fee; delivery inclusion/quoted charge; supported quantity/stock availability; comparison prices; explicit bundle discounts and plan eligibility. Numeric currency is validated in integer minor units. Free/complimentary staff grants require a recorded reason, not a fabricated payment.

Keep private production costs, margin assumptions and supplier information in staff-only data. The public catalog returns selling prices and capabilities, **never the private cost/margin object**. Show estimated contribution and a warning when a draft is below its entered cost; permit a consciously recorded promotion rather than inventing profit. Unknown cost is displayed as unknown rather than zero.

Quote formula: selected digital period (once per profile) + selected hardware units/finish + explicitly selected services + delivery − approved discount + any explicitly configured applicable charges. Validate every axis, stock status, ownership and catalog revision server-side. Compute actual totals using the server; submitted browser prices are not trusted.

A submitted order stores immutable line items, SKU/finish/destination, plan/term, included services, quantities, delivery rules, totals and catalog/terms revision. Price changes apply to later quotes. A stale unsubmitted checkout refreshes its total for review; a submitted/agreed/paid order retains its accepted terms. Handle simultaneous catalog edits and delayed payment without changing the agreed order silently. Bundles must not double-charge an annual profile or apply discounts twice.

The existing `lib/pricing.ts`/022 catalog supports two product families, two/three-card offers, website-package renewal and a few extra rates. Its website renewal field is **not ordinary profile subscription billing**. Extend with additive/versioned contracts and tested legacy responses rather than changing old migration files. Keep 019 app callers compatible until mobile is updated; any later closure of a trial bypass through an old creation RPC is part of the reviewed shared entitlement release, not a client-only block.

## 5. Cloud data and encrypted local archive

Moving old bulky files can preserve free storage headroom. It does **not** remove the paid provider's base subscription. Paid Supabase storage currently includes 100 GB and excess stored bytes cost $0.0213/GB/month; deleting a few receipts on an in-quota paid project does not reduce its $25 baseline. The small order ledger is usually much cheaper than the images. [Storage billing](https://supabase.com/docs/guides/platform/manage-your-usage/storage-size).

| Data | Cloud operational copy | Local archive approach |
|---|---|---|
| Auth, ownership, profile/links, public compressed photo/logo | Keep required live data and access rules | Encrypted backup, not the only serving copy |
| Plan/trial/expiry, current capabilities, price/catalog/terms revisions | Keep server-authoritative | Include recovery snapshots |
| Order reference/owner/line items/agreed totals/status/timestamps | Retain minimal private online ledger | Full order/application snapshot may also be archived |
| Payment amount, real verification result/date, audit reference and needed history | Retain minimal private online ledger | Receipt image and detailed evidence can become archive candidates later |
| Delivery/contact needed for an open order or unresolved issue | Keep private while operationally required | Review later minimization/retention separately |
| Active artwork/proof/current print assets and receipt under review | Keep private cloud files and authenticated access | Optional additional backup; not removable just because payment is confirmed |
| Fulfilled, resolved historical receipt/artwork/replaced print exports | Cloud metadata plus explicit archived state after approved transition | Encrypted archive with independent second copy and proven restoration |

**Eligibility:** payment confirmation can trigger a non-destructive backup/export, not automatic removal. Actual completion/handoff, proof/revision needs, unresolved refunds/disputes/support and an agreed retention period determine later eligibility. A 30-day post-fulfillment wait can be a proposed default for ordinary candidates; it is not a legal retention rule, a guarantee every record is eligible or automatic deletion permission. Accounting/customer obligations require their own chosen policy.

Build archive flow in this order:

1. Staff previews exact orders, file references, sizes, retention holds and expected customer/account changes. Minimal cloud ledger stays intact.
2. A local operator tool exports a versioned encrypted package with full permitted order snapshots, byte manifest, checksums and restore metadata. Credentials never enter the browser/Git. It downloads through approved scoped operator access; it is not a privileged API key embedded in the admin page.
3. Verify all expected bytes, hashes and counts locally; decrypt a test copy and restore a representative archive into an isolated environment. Save an independently stored encrypted second copy (for example a separate external disk stored apart from the laptop). Record where the recovery key is held safely; do not publish it.
4. Record export ID, completion time, hash/count, backup acknowledgement and restore-check outcome in a private cloud archive ledger. No local path or customer document is exposed publicly. Mark **Exported / cloud retained** until the next step is authorized.
5. Only after the reviewable archive and impact report exist, obtain the required scoped authorization for any actual cloud-file removal. Recheck versions, unresolved holds and reference reachability; remove only approved objects via the Storage API, not SQL metadata deletion. Record the action and the actual bytes affected. Partial failures retain resumable state; never declare a failed download archived.
6. The customer/staff UI shows a truthful **Archived — contact support for retrieval** state, preserves online order/payment history, and avoids broken download buttons. Restore requested files to private storage with the same authorization protections and audit. The archive is not a publicly downloadable backup.

A laptop-only copy is not a sufficient recovery plan. Supabase database backups contain Storage metadata, not the actual file objects; restoring a database cannot recover deleted object bytes. Keep both database and object-backup recovery tested. [Supabase backup limitations](https://supabase.com/docs/guides/platform/backups).

No existing customer receipts/orders/files are moved, deleted or exported by this planning task. Preserve Tarsil and all unrelated records. Archiving is separate from profile deletion and the owner's test-profile confirmation rule.

## 6. Storage, trial and subscription rules

Reuse the [capacity model](PROFILE_CAPACITY_AND_TRIAL_MODEL_2026-10-28.md): target about 150 KB portrait + 50 KB logo for Basic, a capped gallery for later Business, no uploaded video initially. Resize/re-encode new public uploads with acceptable quality and format, validate output bytes server-side and retain print-resolution masters privately when needed. Compression must not silently alter old customer fields/images; any batch migration is separately reviewed. Storage/egress meter summaries must use real available data; missing telemetry is labeled unavailable.

Trial claim/start/end are server-owned. A proposed 14 days starts at first successful publication after confirmed account access. Editing, profile removal, email changes and mobile/web switching do not reset it. Normal duplicate-account protection is useful but does not guarantee one human per email; no permanent raw-email blacklist or shared-IP bans. Define minimal trial-use/retention handling for account deletion/recreation before implementation.

Show the price and trial terms before publication. Warn the owner in-account before expiry; suspend the new cohort's public trial after expiry, keep a proposed recoverable draft window and reserve the handle. Existing free customers are explicitly grandfathered. Do not send mail through the currently inactive order worker; subscription notices require a separately authorized, verified delivery flow. Public unavailable pages reveal no billing/contact details.

A real verified payment activates Basic on the same profile. Grant one service period per unique billing event; repeated retries or payment reviews cannot extend it twice. Use a defined 12-calendar-month term: start at activation for new subscriptions, and extend from max(current paid end, activation time) for ordinary renewal so early renewal does not lose days. Store exact effective dates and timezone display. Manual exceptions/comp grants are staff-only and audited. No automatic recurring debit is promised without a separate payment setup.

Server checks cover public rendering, owner creation/saves, file access where applicable and old app endpoints; a browser countdown is not enforcement. Preserve purchased capacities and existing-client unknown fields. Staff moderation/hide and plan expiry are separate states; payment must never restore a staff-hidden profile without a separate moderation action. Founder/Tarsil and historical paid rights are unchanged. Profile expiry never frees a printed handle for someone else.

## 7. Cleaner dashboard

| Area | Primary job |
|---|---|
| Overview | Actionable counts: new applications, payment review, open fulfillment, renewals due, blocked uploads/archive issues; distinguish unknown from zero |
| Orders | Search/filter/pick order, then see current status, exact product combination, agreed amount/destination and one relevant next action |
| Profiles & customers | Actual account identity, selected profiles, visibility/moderation, trial/paid/legacy state and linked orders; preserve the released account-separation controls |
| Catalog & plans | Draft/publish prices, eligibility and preview; private costs/contribution kept separate from the public catalog |
| Files & archives | Eligible/exported/verified/cloud-retained/archived states, holds and restore workflow |
| Settings | Business/contact/delivery configuration, staff-only feature flags and service readiness; advanced/developer controls default collapsed |

Use progressive disclosure for order details: Summary, Customer/profile, Payment, Fulfillment, Files/archive and Activity. Keep Reject application / Request changes easy to find with reason and confirmation. Keep payment verification explicit. Preserve optional proof/files, message, internal notes and checklist expand/collapse behavior and unsaved drafts. Avoid duplicate buttons, long always-open forms and raw technical errors in customer-facing areas.

Retain closed orders with a filter rather than deleting them to tidy lists. Group customers by actual identity, never submitted email. Per-profile lifecycle labels distinguish live/hidden, legacy/trial/paid/expired and archived files. No dashboard cleanup changes payment/production facts, cancels orders, deletes customers or sends messages on navigation. Make all new layouts usable by keyboard and on mobile, with clear loading, empty, stale and retry states.

## 8. Useful profile features and app alignment

Deliver business hours (timezone, split hours/closed days and optional exceptions), service/WhatsApp actions and an approved outbound review destination first. Keep the customer's business reviews distinct from EdgeTap's own product reviews. An external review link is not imported Google ratings or proof a review was submitted. A later hosted testimonial/review page requires real submissions, moderation, consent/disclosure, spam controls and bounded text/photo storage; price that workload before enabling it.

Reuse one profile renderer/section model for Professional, Portfolio and Local Business presets. Rich gallery, booking/enquiry inbox and analytics remain staged after buyer evidence. Never advertise unavailable capabilities as a reason to upgrade. Existing clients must preserve new sections they do not understand.

The app remains a companion for the same identity/profile/URL. First align its live catalog display, selected-profile hardware order handoff, trial/paid state and compression with the shared web contract. Browser sign-in can be separate; no bearer tokens in URLs and no duplicate profiles/orders. Keep the recipient browser public with no required EdgeTap installation. App archive states show support/restore instructions rather than local disk paths.

The owner's edited PRD requests per-link QR controls with a staff-controlled flag initially **off**, additional-profile settings and account deletion. Preserve that file. Plan the QR flag without enabling it; resolve “additional profiles per mobile” into an explicit account/plan rule before implementation rather than device fingerprinting or bypassing the one-trial rule. Account deletion needs honest data/paid-order retention behavior, not a button that falsely reports full erasure. See [app next steps](../EdgeTapApp/docs/NEXT_STEPS_PLAN.md).

Android native Auth, crop/upload/save conflicts, account switching, sign-out/background cleanup and NFC require actual device evidence. Keep QR/link usable independently of HCE results. Statistics remains unavailable until a real permitted collection/owner-aggregate API exists; no fake taps, people or contacts. Store digital-purchase rules must be checked at implementation time; initial hardware browser checkout is not automatically approval for in-app annual digital upgrades. iPhone and public distribution are later scoped releases.

## 9. Acceptance and staged release

Before enabling the new offer: isolated SQL/security/legacy compatibility checks; price matrix and invalid-combination tests; quote immutability and idempotent renewal tests; stale/failed payment and staff-comp cases; trial expiry across web/old/new app; visibility/grandfathering; file ownership, archive failure and restore cases; mobile/desktop/keyboard browser checks; actual consenting ordinary-user Auth/upload/fulfillment evidence. App native changes additionally need relevant Android build/parser tests and real-phone acceptance.

Record exact migrations/commit/export reviewed, current service history, checks, remaining limitations, rollback behavior and protected-record fingerprints. Never deploy a fixture export, blindly push optional 016 or rerun applied 019. Keep private snapshots and customer archives outside Git. A rollback must keep saved quotes, paid entitlements, existing card URLs and access rules safe even if new offers are disabled.

Release flags keep new SKUs/plans/trials disabled until their pricing, stock, terms, client compatibility and operations are ready. Use an owner-approved new cohort/pilot; measure actual paid conversion, cost per order, support minutes, renewals, storage/egress, archive restores and contribution. Do not claim the whole customer lifecycle or real mail/NFC works from a mock or compile. Finalize the next scope from measured demand and available university/operations time.
