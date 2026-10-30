# Hosting costs and profile pricing review

**30 October handoff:** follow the [final catalog and operations plan](PRODUCT_CATALOG_AND_OPERATIONS_PLAN.md) for the owner's preferred editable Rs. 1,000 annual Basic anchor, fuller 100-payer profit/labor scenarios, complete hardware combinations and safe local archive design. This earlier sizing/research model remains supporting evidence; its illustrative infrastructure-only break-even is not a final profit claim or permission to implement expiry/deletion.

Researched **28 October 2026**, Pakistan time. This is a cost model and proposed commercial direction, not an accepted price change, provider quote, invoice, customer notice or authorization to enable billing/migrate data. Existing free-profile rights, paid orders and customer terms remain unchanged. No customer email, service setting, source code or live price was changed.

## Updated owner inputs

Later on 28 October the owner reports current production at **Rs. 260/card excluding delivery**, free first-year domain registration through student benefits and **$30 next-year renewal**. These supersede the historical sample cost and generic registrar illustration for forward budgeting. The [capacity/trial model](PROFILE_CAPACITY_AND_TRIAL_MODEL_2026-10-28.md) uses these inputs, compressed-image/traffic budgets and the proposed Rs. 1,000 annual digital service with a separately priced Rs. 500–600 card. The owner leans toward a new 14-day trial; no expiry, deletion, new pricing or subscription lifecycle is implemented or finally approved. Existing customers remain protected.

## Recommendation

Keep the current Supabase/PostgreSQL plus Firebase static Hosting architecture while measuring costs and improving upload/page efficiency. Budget for paid infrastructure rather than promising indefinite hosting funded only by a one-time card sale. A self-managed server can reduce the cash bill, but requires operating skills/time; evaluate total cost rather than the headline promotional rate.

The earlier comparison favored **Rs. 2,499 first year / Rs. 2,000 renewal** for an assisted offer with substantial support. With the later Rs. 260 production input, a lean self-service **Rs. 1,000/year plus a separately priced card** is another plausible pilot to validate; its sustainability depends on payer count, traffic and labor. See the updated model rather than treating either proposal as an accepted price. Test the chosen offer with actual buyers before changing the catalog. Define the first-year card/setup scope and the annual management/support allowance. A separate affordable hardware/self-service path and the existing basic free profile can remain. Paid customers must fund the free cohort too. A higher price does not establish demand or guarantee profitability at a small customer count.

## What EdgeTap actually uses

Firebase serves the shared static website/assets; Supabase supplies PostgreSQL, Auth and file storage. It is not paying for two parallel customer databases or two parallel Auth systems. The selected backend is Supabase; Firebase imports retained for the explicit legacy backend do not establish current Firebase data-service use. All `/u/<handle>` profiles share the application and domain; another customer does not require another Supabase project, separate website deployment or purchased domain.

Supabase is already real PostgreSQL. SQL is the language used to work with that database. The actual alternative is who operates Postgres and the Auth/API/storage/backups around it. Supabase's database portability does not make the complete application's authentication, RPC/security and file-permission migration automatic. [Supabase database overview](https://supabase.com/docs/guides/database/overview).

## Current read-only measurements

On 28 October, an aggregate-only SQL query returned approximately **14.49 MB total Postgres database size**, **1.60 MB public/private application-table footprint**, **20.50 MB stored objects**, **37 stored objects**, **8 profiles** and **7 Auth accounts**. Counts include whatever current legitimate/test records exist; they are not a cleanup list or permission to delete anything. No identities, paths, customer documents or account credentials were retrieved for this report.

An isolated browser made one cold mobile visit to the founder page with browser cache disabled: about **847,403 bytes from the website host** and **1,732 response bytes from Supabase**. This particular page uses assets served by the website; an uploaded customer avatar changes that mix. This is one page-load measurement with protocol overhead and a short settling window, not provider-billed traffic, a representative customer average or a stress/capacity test.

Provider billing dashboards, organization-wide egress, actual current invoices, registrar renewal invoice and paid/free plan selections were not verified. SQL sizes are not identical to every provider billing metric. These measurements suggest no immediate database/file-capacity shortage; they do not prove that network quotas or costs are low.

## Current public provider rates

| Item | Published allowance or price | Business implication |
|---|---|---|
| Supabase Free | 500 MB database, 1 GB files, 50,000 monthly active Auth users | Profile count alone does not determine cost; anonymous page visitors are not automatically signed-in Auth users |
| Supabase Pro | Starts at $25/month; one Micro project fits included compute credit | A shared platform base cost, not $25 for each profile |
| Supabase file storage on Pro | 100 GB included; extra storage $0.0213/GB/month | Uploads and retained print files matter; this is separate from database size |
| Supabase egress | Free: separate 5 GB uncached and 5 GB cached quotas; Pro: separate 250 GB quotas, then $0.09/$0.03 per GB | Cached and uncached quota are not interchangeable; downloads/avatars can dominate |
| Firebase Hosting | 10 GB stored site content free; paid excess storage $0.026/GB; paid transfer over allowance $0.15/GB | Static assets have a usage-based bill; old releases also count toward stored Hosting content |

Sources: [Supabase pricing](https://supabase.com/pricing), [storage billing](https://supabase.com/docs/guides/platform/manage-your-usage/storage-size), [egress billing](https://supabase.com/docs/guides/platform/manage-your-usage/egress), and [Firebase Hosting usage guide](https://firebase.google.com/docs/hosting/usage-quotas-pricing).

**Firebase documentation discrepancy:** the current [pricing table](https://firebase.google.com/pricing) lists 360 MB/day free Hosting transfer, while the Hosting usage guide lists 10 GB/month and monthly resets. These are similar monthly quantities under steady traffic but differ for bursts. Confirm the allowance/reset period shown for the actual project before depending on either. The example below uses the Hosting guide's monthly allowance; it is not a billing guarantee.

At the measured founder-page size, 50,000 entirely cold visits would transfer about 42.37 GB from Firebase. Under a 10 GB monthly allowance, excess transfer is about **$4.86/month**. Real usage includes other pages, customer assets, bots, repeated/browser-cached visits and traffic timing. This illustration shows that crossing an allowance need not mean an enormous bill; actual volume still needs monitoring.

## Free plans have service limits too

Supabase Free can pause after a week of inactivity and does not provide the paid plan's daily retained backups. Free-plan quota excess can lead to restrictions rather than automatic paid overage. Pro's spend cap covers selected usage but not opted-in compute/add-ons. [Supabase plan and pause terms](https://supabase.com/pricing), [cost controls](https://supabase.com/docs/guides/platform/cost-control), [billing FAQ](https://supabase.com/docs/guides/platform/billing-faq).

Firebase's no-billing Hosting tier can restrict deployment or serving after quota exhaustion; enabling paid usage changes the risk from interruption to metered charges. Ordinary budget alerts do not cap classic Hosting spending; newer Firebase spend caps apply only to the explicitly listed services, not every Firebase product. [Hosting quota behavior](https://firebase.google.com/docs/hosting/usage-quotas-pricing), [budget controls and supported caps](https://firebase.google.com/docs/projects/billing/budget-alerts).

Production confirmation/recovery email needs a suitable SMTP provider. Supabase's default service is restricted, currently two emails/hour, with recipient restrictions and no delivery SLA. Auth MAU allowance does not supply unlimited production email. Existing actual SMTP provider/delivery remains unverified; this research sends no email and changes no Auth settings. [Supabase SMTP requirements](https://supabase.com/docs/guides/auth/auth-smtp).

## Domain and server comparisons

Use the **renewal** price of `edgetap.tech`, not just its first-year promotion. The owner now reports **$30 next-year renewal** and a free student first year. Earlier research found an external standard `.tech` renewal example of $50.98 at Porkbun; that generic example is superseded for EdgeTap budgeting by the owner's stated $30. The actual registrar invoice is still not independently verified; no transfer is recommended. The same main domain serves all current profile handles; customer-owned domains would be separate quoted services. [Porkbun .tech pricing](https://porkbun.com/tld/tech).

Hostinger currently advertises KVM 1 at **$6.49/month equivalent**, **$155.76 paid upfront for 24 months**, renewing at **$11.99/month for the same term**. That is cheaper in server rent than Supabase Pro; it does not establish that the smallest VPS can run this full workload at the same reliability. Hostinger says VPS plans are self-managed; web/cloud shared hosting has different management and runtime characteristics. A Singapore location describes where a server runs, not its operating cost, capacity, backups or application security. The other business's actual plan, private bills and workload were not verified. [Hostinger VPS plans](https://www.hostinger.com/vps-hosting), [managed versus self-managed](https://www.hostinger.com/support/8311982-what-is-managed-hosting-in-hostinger/).

A fair server comparison includes migration, updates, security patches, database administration, Auth/password reset, upload isolation, backups and restore drills, monitoring, outages, email, and the owner's time. Supabase can be self-hosted, but official guidance assigns operations and backups/security to the operator. [Supabase self-hosting](https://supabase.com/docs/guides/self-hosting). The current university workload makes extra operations responsibility a meaningful cost.

## Annual cost model

Use **Rs. 280/USD solely as a rounded planning assumption**, not a verified current bank/card conversion. Provider taxes, card FX/fees and actual exchange rates can change the result.

- Supabase one-project Pro baseline: $25 × 12 × 280 = **Rs. 84,000/year**, before additional usage/add-ons.
- Owner-reported next `.tech` renewal: $30 × 280 = **Rs. 8,400/year**; current student first year reported free.
- Combined illustrative Pro + next-domain base: **Rs. 92,400/year**, before Firebase transfer/storage, email and contingency. Domain renewal remains payable even when managed services fit free plans.
- **Rs. 120,000/year** is a scenario budget for modest managed infrastructure, not a forecast, hard ceiling or business-wide operating budget. At heavier traffic or paid email/compute, replace it with the measured larger amount. Hardware, delivery, support wages, marketing, tax and profit are excluded.

| Annual paying customers | Rs. 120,000 platform budget divided by those payers |
|---:|---:|
| 25 | Rs. 4,800 each/year |
| 50 | Rs. 2,400 each/year |
| 100 | Rs. 1,200 each/year |
| 200 | Rs. 600 each/year |

These are **paying and collected** customer-years, not total profiles, free accounts, unpaid invoices or guaranteed renewals. Other users still create costs. At Rs. 1,000 renewal, 120 annual payers cover only this infrastructure scenario; at Rs. 1,499 it takes 81; at Rs. 1,999 it takes 61; at Rs. 2,000 it takes 60. Each threshold leaves essentially no room for support, acquisition, refunds, tax or profit. A smaller pilot may need a founder-funded operating reserve; future renewals are unavailable cash until actually collected.

## First-year unit economics and offer proposal

The business guide records a historical Rs. 500 sample, superseded for forward production modeling by the owner’s **Rs. 260/card excluding delivery** input. With a separate Rs. 20 estimated envelope, Rs. 1,499 leaves **Rs. 1,219**, while Rs. 2,499 leaves **Rs. 2,219**, before delivery, setup/support, reprints, payment fees, infrastructure, marketing and tax. These are not net profits. The cheaper stock's landed usable cost and tag-only economics are not yet verified. New website delivery is included in the price, so deduct actual rider cost rather than treating delivery as free to EdgeTap. See [business guide](businessguide.md).

Earlier proposed assisted business offer to compare with the later lean digital/card model: **Rs. 2,499 including agreed first card/tag, bounded setup and first 12 months of a defined managed service; Rs. 2,000 annually from year two.** Renewals do not include a replacement card. Define how many assisted changes are included, response expectations and out-of-scope custom design. Quote special hardware/custom domains separately. Use a distinct, clearly scoped self-service/hardware option for customers who do not want annual assistance. Do not invent analytics, bookings or other unbuilt features to justify a fee.

Rs. 1,499 first year / Rs. 1,000 renewal could be a tightly scoped pilot option if actual costs and volume support it, but it has less room for fulfillment/support and is not a sound unlimited/lifetime-service promise. Even the higher proposed price needs validation and funding at a small payer count. Annual pricing should communicate the service customers receive, rather than claiming that each profile needs an expensive separate server.

Current website catalog renewal is attached to the separate website package. A subscription lifecycle for ordinary profiles (start/end dates, reminders, collection, notices, entitlement transitions and preserved hardware destinations) is not implemented by editing that price field. Build and approve those rules separately if an annual profile service is adopted. Existing free/public profiles and sold terms must not silently acquire a new charge or stop working.

## Next actions in order

1. Read actual Supabase organization usage/invoice, Firebase plan/traffic/reset period and registrar renewal quote; verify production SMTP with the separate authorized setup process. Do not enable billing/add-ons merely to finish this research.
2. Resize/compress public avatars and logos before upload (for example a measured 150–250 KB target with acceptable quality); retain appropriate print-resolution originals privately. Check public payloads, repeated fetching/caching and unused shipped assets. Do not reduce print export quality to solve avatar costs.
3. Review safe upload quotas, orphaned replacements and retention for receipts/artwork/print files. Propose any cleanup scope first; no customer files are deleted in this research.
4. Put actual usable hardware, printing, included delivery, bounded labor and infrastructure reserve into the price calculation. Test the new assisted annual offer with three to five prospects before changing the live catalog.
5. If accepted, implement clear service duration/renewal/support terms, appropriate reminders and voluntary migration rules for existing customers; keep saved card URLs stable. Establish backup/restore and cost monitoring before growing the paid service. Compare a server migration later against actual invoices and available operating time.

This review changes no provider plan, billing, data, price, customer email or app source. It is linked from the [milestone plan](../updateplan.md), [business guide](businessguide.md) and [guide index](README.md).
