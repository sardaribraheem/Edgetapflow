# Profile capacity, trials and revised unit costs

**30 October handoff:** follow the [final catalog and operations plan](PRODUCT_CATALOG_AND_OPERATIONS_PLAN.md) for the owner's preferred editable Rs. 1,000 annual Basic anchor, fuller 100-payer profit/labor scenarios, complete hardware combinations and safe local archive design. This earlier sizing/research model remains supporting evidence; its illustrative infrastructure-only break-even is not a final profit claim or permission to implement expiry/deletion.

Updated **28 October 2026** after the owner supplied **Rs. 260 card production cost excluding delivery**, **a free first domain year through student benefits**, and **$30 for next year's domain renewal**. These are owner-reported inputs, not supplier/registrar invoices. Whether Rs. 260 includes packaging, programming labor, rejects and tax remains unverified. No live price, trial expiry, subscription, customer file deletion, email or backend migration is implemented by this planning document.

## Recommended offer to validate

Test a new **Basic digital service at Rs. 1,000/year**, with an optional **Rs. 600 first card** paid separately; Rs. 500 could be a deliberately scoped launch card price. Define delivery/packaging and setup separately. Rs. 1,600 is the resulting first-year total before any separately agreed delivery; renewal is Rs. 1,000 without another free card. A Rs. 1,000 total bundle including a card has much less room. This is a proposal for new offers only: current prices, included-delivery orders, saved quotes, purchased capacity, free-profile rights and protected existing profiles remain unchanged.

A new 14-day trial is plausible to test, but it is an acquisition experiment, not a requirement imposed by hosting costs. Its conversion rate is unknown. Start at first successful public publication after email confirmation. Preserve current free profiles; do not silently put an expiry on customers who already signed up under the present offer. New annual-service and trial rules require a later authorized implementation and a clearly announced effective date/cohort.

## Capacity: separate the limits

The current official Supabase Free allowance is **1 GB of files**, **500 MB database**, **50,000 monthly active Auth users**, and independent **5 GB uncached / 5 GB cached monthly egress**. Pro starts at **$25/month for one Micro project**, with 100 GB files, 8 GB database disk, 100,000 active Auth users and independent 250 GB egress quotas. Those are different meters, not a promised total-profile capacity. Anonymous public visitors are not automatically authenticated users. [Plan rates](https://supabase.com/pricing), [egress definitions and quotas](https://supabase.com/docs/guides/platform/manage-your-usage/egress).

The earlier 28 October read-only check measured approximately 14.49 MB database and 20.50 MB stored files. These are aggregate SQL/object-size measurements, not verified invoice/egress dashboard totals. Counts are historical measurements rather than a cleanup list; this planning performs no customer mutations.

For model arithmetic use decimal 1 GB = 1,000 MB, 1 MB = 1,000 KB. Provider units, file averages, metadata and dashboard billing can differ. Reserve **250 MB of the file allowance** for existing non-public files, receipt/artwork/print exports and headroom, leaving a **750 MB total public-image budget**. This does not mean all 750 MB is unused today. Proposed size targets must be achieved and enforced; the present upload helper validates but does not resize/re-encode.

| Public image budget per profile | Stored profiles fitting 750 MB |
|---|---:|
| One 150 KB portrait | 5,000 |
| 150 KB portrait + 50 KB logo | 3,750 |
| Portrait/logo + four 200 KB gallery images = 1 MB total | 750 |

These are **file-storage-only totals**, including trial, expired-but-retained and paid profiles. They assume no retained originals, replacement versions or other public images beyond the stated budget. An expired profile that is merely unpublished still occupies storage. A source photo and its compressed variant both count if both are uploaded. Browser cache reduces some downloads, not stored byte size.

Private card files can dominate instead:

| Retained private bytes per order, illustrative | Orders fitting the 250 MB reserve before other reserve uses |
|---|---:|
| 1 MB | 250 |
| 5 MB | 50 |
| 10 MB | 25 |

These are scenarios, not measured average order sizes. Print-resolution PNG/PDFs must preserve required output quality and private access. Compress public portraits/logos separately; review unnecessary originals/revisions and retention only under a separately agreed policy. Do not purge paid-order evidence, existing files or backups to make this model fit.

Database text is separate from photos, which live in object storage. At a deliberately assumed **20 KB per account/profile plus links/index allowance**, 10,000 such records would be around 200 MB before orders, Auth/application events, reviews, fixed overhead and logs. This is a sizing illustration, not a measured per-account footprint or proof that the free compute can serve 10,000 active customers. Business hours and ordinary text links are relatively small; large review histories, analytics and images change the model. Measure actual growth as these features are added.

## Traffic may require payment before image storage fills

Assume each cold page view downloads the full **200 KB photo/logo budget**. The 5 GB uncached Supabase allowance supports about **25,000 such image loads/month before other uncached API/Auth/download bytes**. The independent cached allowance cannot simply be pooled with uncached capacity; cache-hit behavior must be measured.

| Cold profile views per profile per month | Profiles represented by 25,000 image loads |
|---|---:|
| 20 | 1,250 |
| 100 | 250 |
| 500 | 50 |

This is **one bandwidth meter only**, not safe end-to-end user capacity. Cache reuse can reduce traffic, while additional photos/API queries/private downloads and bots can increase it. A large installed base of rarely opened profiles differs from a small set of heavily viewed business pages.

The current public customer route was measured once in a fresh mobile browser with caching disabled: **391,015 response bytes from Firebase and 30,849 from Supabase**, with protocol overhead and a short settling window. The earlier founder route was about 847,403/1,732 bytes. Different assets make these different; neither is an average or capacity benchmark. The 200 KB allowance above is a future maximum-size scenario, not a claim that every current image is that large.

At 391,015 Firebase bytes/load, a 10 GB monthly allowance corresponds to roughly 25,574 cold loads before other website traffic. Firebase's [Hosting guide](https://firebase.google.com/docs/hosting/usage-quotas-pricing) currently describes 10 GB/month, while its [pricing table](https://firebase.google.com/pricing) lists 360 MB/day. Check the actual project's period/limits; traffic spikes matter under daily allowances. At the pricing table's daily allowance, the same single-page sample is roughly 920 cold loads/day before other traffic. Pay-as-you-go Hosting transfer excess is currently $0.15/GB. This allowance mismatch and lack of real monthly telemetry prevent an exact free-profile promise.

**Practical planning statement:** a few thousand compact profiles may fit file storage, while a few hundred profiles receiving around 100 cold visits/month can already need bandwidth attention. Pay earlier if reliability/backups or an email provider require it. Do not tell customers 50,000 complete profiles are free merely because Auth includes 50,000 active users.

## Revised cash budget

Use **Rs. 280/USD as a planning assumption**, not a current verified card exchange rate.

| Item | Annual amount at that assumption |
|---|---:|
| Current domain year | Rs. 0 under the owner's student benefit |
| Next domain renewal reserve: $30 | Rs. 8,400 (Rs. 700/month reserve) |
| One-project Supabase Pro baseline: $25 × 12 | Rs. 84,000 |
| Pro baseline + next domain renewal | Rs. 92,400 |
| Illustrative managed infrastructure budget with some contingency | Rs. 110,000 |

If backend/Hosting/email remain within genuinely free service allowances, the Pro baseline is not an automatic current expense. Conversely, the Rs. 110,000 scenario is not a hard ceiling: paid mail, traffic/compute, tax, FX/card fees, backup requirements and other services may exceed its headroom. The exact current provider plan, monthly egress, production SMTP and invoices remain unverified. Reserve for the domain now even though its first year was free. Hardware, delivery, support time, marketing and profit are excluded from the infrastructure budget.

| Collected annual paying customers | Rs. 110,000 infrastructure allocation per payer |
|---|---:|
| 50 | Rs. 2,200/year |
| 100 | Rs. 1,100/year |
| 200 | Rs. 550/year |
| 500 | Rs. 220/year |

At Rs. 1,000 digital renewal, **110 collected renewals cover only that infrastructure scenario**, with no wages, tax, acquisition or profit. With 200 such renewals, Rs. 200,000 less Rs. 110,000 leaves Rs. 90,000/year before those other expenses. Free/trial/retained accounts create costs without revenue; total signups are not paying customer-years. Founder cash may fund a smaller paid infrastructure stage while sales grow; next year's uncollected renewals are not available cash today.

## Card bundle arithmetic

Using the owner's production input without adding the earlier sample's Rs. 150 printing charge again:

| New proposed first-year purchase | Revenue | Card production | Remainder before packaging/delivery/labor/platform/fees |
|---|---:|---:|---:|
| Rs. 1,000 total including one card | 1,000 | 260 | 740 |
| Rs. 1,000 digital + Rs. 500 card | 1,500 | 260 | 1,240 |
| Rs. 1,000 digital + Rs. 600 card | 1,600 | 260 | 1,340 |

A standalone Rs. 500 card leaves Rs. 240 and Rs. 600 leaves Rs. 340 before those other costs. The earlier envelope estimate is another Rs. 10–20 if not already in production cost. If delivery were Rs. 200, a Rs. 500 card would leave just Rs. 20 after Rs. 260 production and Rs. 20 packaging, before programming time, failures and fees. The Rs. 200 delivery is only an illustration; actual fares are unknown. Current included-delivery promises still apply to existing orders; a separately priced delivery policy is a future offer decision.

Against Rs. 110,000 infrastructure alone, the three first-year scenarios require at least 149 / 89 / 83 new card buyers respectively, **ignoring all other costs**. Renewal at Rs. 1,000 needs 110 renewers regardless of the previous year's card contribution. Card cost occurs on initial fulfillment or an explicitly purchased replacement, not automatically every renewal.

## Trial and upgrade behavior to design

Recommended future flow, subject to owner approval before implementation:

1. One confirmed account claims one 14-day trial when its first profile is successfully published. Store the trial claim/dates server-side; edits, email changes, repeat requests and profile removal must not reset it. The current one-free-profile-per-confirmed-account RPC is a useful foundation but has no trial expiration today.
2. Make price, trial end and what happens next visible before signup/publication. Use owner-dashboard warnings before expiration. Do not send warning/customer emails during planning or assume the inactive order worker is a production subscription-mail system.
3. On expiry, **unpublish/suspend public access**, show the owner an Upgrade action and retain the draft for a proposed 30-day recovery window. A public visitor sees a neutral unavailable page without account/billing details. Honest wording: “Your trial has ended. Upgrade to republish this profile.” Do not claim data is deleted if it is retained.
4. Keep the account so the owner can sign in and upgrade. Retain minimal disclosed trial-use state to prevent ordinary resets. Review deletion/re-registration and retention design separately. One email/account is not proof of one person; new addresses/aliases can bypass naive email-only abuse rules. Do not create a permanent email blacklist, destructive account deletion or shared-university-IP bans as a substitute.
5. After staff verifies the real annual payment, activate the paid entitlement for the defined 12-month period on the **same profile ID/handle/content**, confirm read-back, and fulfill any separately bought card. Do not create a duplicate profile, treat a receipt as verified funds, reset ownership or rewrite printed NFC URLs. No recurring charge is automatic without a separately built/authorized payment arrangement.
6. Define renewal notice, grace, upgrade/downgrade and cancellation behavior. Keep paid hardware ownership separate from annual software rights. At software expiry, keep handles reserved and URLs resolvable to a safe status page rather than giving them to someone else. Decide post-grace file retention/purge separately; no deletion is authorized by this proposal.
7. Grandfather existing free profiles and agreed paid terms unless a later customer-approved transition is chosen. Founder/Tarsil and all current customers are untouched. Trial availability must be enforced on public RPC/file routes, not just hidden behind a browser countdown; preserve staff moderation and app compatibility.

For standard existing confirmed email signups, Supabase returns a privacy-preserving duplicate result or an already-registered error depending on configuration rather than creating a fresh confirmed account. That still does not provide a lifetime one-trial-per-human guarantee. [Signup behavior](https://supabase.com/docs/reference/javascript/auth-signup), [Auth identities](https://supabase.com/docs/guides/auth/users).

## Feature sequence and quotas

Business hours and an outbound Google review link/action are good small candidates. Store hours as validated text/structured fields with timezone and exceptions; use the business-approved review destination. An outbound review click is not proof of a submitted review. This is distinct from EdgeTap's own product-review system.

Customer-hosted text testimonials/reviews require real submissions, disclosure, moderation, spam limits and a database budget; later photo reviews cost file storage. Automatically importing Google ratings/reviews is a separate integration, not included in a simple review link. Do not invent reviews, metrics or bookings to justify subscription value.

Keep portrait/logo budgets tight for the proposed Basic tier; add a clearly capped gallery for a later Business tier, for example four 200 KB photos. Define staff-assisted setup/edits separately from self-service software. Limit video to external links initially. Compression should resize/re-encode new public uploads, strip unwanted metadata, preserve necessary transparency/quality and enforce output sizes on the server. Updating old customer assets, deleting originals or changing existing profiles requires separate scope; print masters retain appropriate resolution/privacy.

Next implementation order: approve the new-cohort offer/trial/expiry terms; implement and verify public-image compression; measure actual plan/egress/file growth and email readiness; add annual entitlements/upgrades with preserved URLs; then business hours/review action and a capped gallery if buyer demand supports it. This document grants no release/data/email authorization. See [hosting research](HOSTING_COST_AND_PRICING_REVIEW_2026-10-28.md), [business guide](businessguide.md) and [milestone plan](../updateplan.md).
