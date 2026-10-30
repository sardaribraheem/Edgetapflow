# Detailed prices, checkout and profile foundations

Released **30 October 2026** under the owner’s explicit publication request. Hosting **`d94632fc5fe1f7e4`** at **https://edgetap.tech**; exact migrations **028–032** applied after the prior history. Optional **016 remains unapplied**; existing **019 app function definitions and all guarded existing records were preserved**. Source branch `codex/product-pricing-milestones-2026-10-30` includes feature commits `6866d0c` and `6b10d86`. Future-cohort trials and annual purchases remain **disabled**, existing free profiles/terms are preserved, and email transport remains inactive. See [full release evidence](PRODUCT_CATALOG_RELEASE_2026-10-30.md).

## Prices and customer choices

The public Pricing page now has **Every option, priced clearly**, with All / Tags / Cards / Digital filters and an annual-profile toggle. Standard hardware prices use one versioned server catalog shared with checkout and the dashboard.

| Standard item | Once per item | Digital renewal |
|---|---:|---|
| Unprogrammed NFC tag, no profile | Rs. 400 | None |
| NFC tag programmed to an existing link or owned profile | Rs. 500 | Existing profile terms |
| Unprinted, unprogrammed NFC card | Rs. 500 | None |
| Unprinted NFC card programmed to an existing link or owned profile | Rs. 600 | Existing profile terms |
| Standard printed NFC card, no programming | Rs. 600 | None |
| Standard printed and programmed NFC card | Rs. 700 | Existing profile terms |
| Annual digital profile without hardware | Rs. 1,499 | Rs. 1,499/year; purchase disabled initially |
| Optional supplied-details/link setup help | Rs. 500 once per order | None |

A new annual profile plus programmed tag totals **Rs. 1,999**, plus an unprinted programmed card **Rs. 2,099**, or plus a standard printed/programmed card **Rs. 2,199**. Annual service is charged once per profile, including when multiple matching items are ordered. No Rs. 2,200 rounded bundle is silently substituted. Raw unprogrammed stock cannot include profile/link setup assistance. Unsupported combinations fail on the server.

Standard hardware rates are **pickup prices**. Delivery checkout starts disabled; agree coverage and enable an explicit per-order delivery charge in admin before selling it. Existing customizable Link/Profile Card offers, bundles, website package and their included-delivery promises remain under their existing catalog and quote contract. Standard printed hardware uses the EdgeTap template; custom artwork and unusual/bulk work are separately scoped. A review tag/card can open the customer's approved external Google link without requiring an EdgeTap subscription.

The earlier customizable cards remain distinct from standard hardware: their public descriptions include customizing both faces/uploading artwork. Existing submitted prices are never rewritten. New hardware alone does not start or renew a subscription and does not create another profile. Existing free profiles/accounts keep their rights.

## Dashboard control and quotes

Open **Admin → Pricing → Detailed product catalog**. Edit eight rates, availability and agreed delivery. **Save product draft** leaves public prices unchanged. **Publish product prices** creates an immutable revision with staff/time history and confirmed read-back. The public chart, selected checkout, and saved order quote use that revision. Private production/packaging costs remain staff-only; unknown costs stay unknown. The reported Rs. 260 finished-card cost is a starting input, not a supplier invoice or a guarantee of profit.

Supported catalog purchases go through `/order?item=…`, into the same customer/order/payment ledger and admin inbox as existing orders. Sign-in returns only to whitelisted product/profile hints. Private contact fields are collected after sign-in. The server validates combinations, quantity, availability, owned profiles/uploads, URLs and prices. It computes line items, totals and renewal; browser prices are not accepted as authority.

Payment uses the existing Bank/JazzCash/Easypaisa transfer evidence flow. Evidence remains **pending** until staff checks the real transfer. For an agreed delivery charge, that explicit full-total verification records the hardware/service and delivery amounts separately. No gateway debit, funds verification, email or production is fabricated. Catalog orders retain the actual item/finish/programming; raw chips cannot be marked programmed or silently changed to a different paid item. Unprinted cards are labeled as unprinted.

Changed unsubmitted prices require fresh review. Exact submission retries return the same order; a session-scoped per-account/item request key recovers an already committed order after refresh. **Start another order** is a deliberate new purchase with cleared payment evidence. Customer and admin order views show the saved line items and distinguish service, payment, visibility and physical fulfillment.

## Main card-price loading

The main card price reads independently from optional profile-plan metadata. Published base prices remain visible if that metadata is unavailable; the page offers a retry/check-options path and checkout still validates the applicable terms. Catalog/terms reads have a ten-second deadline and abort signal, including when token refresh stalls. Failed primary reads show Retry; no price is replaced with an invented zero.

Shared pricing state refreshes on focus, publication events, cross-tab notification and the normal interval. When a future trial cohort is enabled, its Profile Card price is the annual rate plus standard printed hardware from the same detailed catalog. Existing account offers remain under their prior terms. Browser regression covers failed plan metadata, failed primary prices, recovery, and stale-quote review.

## Image and business-profile work

New profile portraits are resized to at most **640 px / 150 KiB**, and standalone profile logos to **320 px / 50 KiB**, using browser decoding and bounded re-encoding. Small already suitable images are retained. Actual image bytes, dimensions, corrupt input, phone EXIF orientation and transparency are checked. Logos supplied for card printing keep their original image bytes, as do private print artwork, receipts and existing cloud images. Order-linked print logos can therefore be larger than the web-only logo target.

The Android prototype still permits uploads up to 5 MiB, so the shared `avatars` bucket keeps that existing cap by default. **Data & backups → Photo storage controls** can opt into a shared 150 KiB cap after mobile and physical-print source handling are ready, with a version check and explicit readiness confirmation. The 50 KiB logo target is client-side; the optional bucket cap applies to all public image objects. This release does not claim that every legacy/native upload is compressed.

Owners/staff can open **Business details & profile style** in the profile editor/directory. It supports Professional, Portfolio and Local Business styles without replacing existing content; seven-day hours with timezone/closed days/two split periods; up to six services with real public/WhatsApp links; and the business's Google review/Maps destination. Overnight periods are split across adjacent days. Public pages show the supplied details. Google clicks do not prove a review was submitted; no imported ratings, fake testimonials, booking delivery, enquiry backend or traffic analytics are advertised.

Business sections have their own versioned storage, so old web/app saves preserve them. The new records, product revisions, private costs, trial claims and renewal history are included in scoped/full staff business exports. See [backup coverage and local recovery](ADMIN_WORKSPACE_AND_BACKUPS_2026-10-30.md); these remain business/file copies, not complete SQL/Auth disaster recovery.

## Trial and annual foundation — off initially

The owner has not yet selected between a future 14-day trial cohort and keeping free signup with an optional annual plan. **Future-cohort trials and annual checkout start disabled.** Existing free profiles remain free. The public annual rate is clearly marked coming soon; it cannot be purchased while unavailable.

The implemented controls can enable a new-account cohort after a purchasable annual price is published. Existing accounts/profiles retain previous rights. A new cohort must explicitly accept one 14-day trial at first publication; the claim/dates are server-owned. Edits, handles, retries, email changes and older app creation paths cannot reset/bypass it. Expiry blocks public reads and keeps the owner draft/handle. No automatic deletion or mail is involved.

Verified annual payment activates/extends the **same profile ID and URL** for one calendar year, once per unique order. Early renewal keeps remaining paid/trial time. Hardware quantity does not multiply the annual charge. Payment never restores staff-hidden visibility. A legacy profile that deliberately purchases annual service retains its underlying legacy rights after that added period ends. Expired owners can edit and confirm a private draft without falsely claiming it was republished. Existing 019 public app function definitions are preserved; app UI/compression/real-device alignment remains separate scope.

## Milestones still requiring work or evidence

- **1:** real consenting signup/recovery inbox, hosted existing-byte owner/staff/isolation and actual NFC/print/handoff evidence. Automated browser/Auth/Storage fixtures do not establish those facts. No test/customer profile is deleted without exact owner approval.
- **2:** actual monthly egress/provider invoices, packaging/delivery/time costs, app compression before enforcing the smaller shared cap, archive hold/retention ledger and a separately reviewed full restore/import/removal workflow. No file purge is enabled.
- **3–4:** the standard supported catalog/quotes/public chart/admin paths are implemented. Mixed-SKU carts, automatic inventory counts, new discount schemes and richer below-cost promotion audit are future extensions rather than claimed current capabilities.
- **5:** choose and deliberately activate the future trial/annual policy; verify a consenting real paid journey before claiming commercial billing success.
- **6:** owners supply actual hours/services/review destinations. Gallery, hosted business testimonials, forms/bookings and imported ratings remain later dependencies.
- **7:** companion source/native testing is not resumed by this website task. Preserve the owner's PRD and existing source.
- **8–9:** record actual consenting sales, costs/support minutes, retention and real usage before expanding the offer. No affiliate arrangement, equipment purchase, outreach or fabricated analytics is introduced.

## Release and evidence

Applied exact migrations **028–032**, with **016 excluded** and existing 019 preserved. The successful transaction fingerprinted 72 readable existing tables, using write-blocking locks for application tables and permitted read locks for provider-owned Auth/Storage tables. Supabase internal tables inaccessible to the operator role were excluded; Auth users and Storage objects/buckets were mandatory guards. An initial unsupported internal-table lock failed before any changes, and the corrected transaction was rehearsed before application. The operator transaction checks the exact prior history, locks/fingerprints existing public/private/Auth/Storage records, installs only the reviewed definitions/catalog defaults, and aborts if existing records, app function bodies, email settings or default disabled annual/trial state change. Existing orders gain only nullable new quote columns. No customer data is seeded, exported or deleted.

`python3 scripts/prepare-product-release.py --inventory-log <private-read-only-inventory-log> --output <private-sql-path>` only prepares SQL. `node scripts/test-product-release-rehearsal.mjs <private-sql-path>` rehearses that exact transaction and hosted verifier in synthetic local data. Production publication requires owner authorization; that authorization was explicitly supplied for this update. Never blindly push optional 016 or deploy a fixture export.

Local verification covers TypeScript, lint (zero errors, 18 existing warnings), production/fixture builds, release/static guards, existing SQL/account/price/profile suites, the new catalog/lifecycle/business/security tests, independent ZIP/encryption/offline recovery, browser checkout/recovery and actual browser image conversion. Auth, Storage transport, payments and phones are simulated unless explicitly recorded as hosted/physical evidence.

Production evidence: all 55 hosted read-only pricing/RPC/anonymous-denial/absent-object checks passed; the hosted SQL grants/history verifier passed. Live desktop/mobile checks show legacy prices 999/1499/29999 and detailed 400/500/600/700 rates, the disabled annual offer, combined 2199 preview, sign-in before catalog checkout and unknown-profile fallback. No browser console errors were observed. Local verification passed 144 browser assertions, SQL/security/backup suites, TypeScript, lint and production/static release guards. No real signup, email, private customer export or physical payment/fulfillment test was performed.

Publication identity: website HEAD `e7e432f`, pushed to `codex/product-pricing-milestones-2026-10-30`; deployed HTML for `/`, `/pricing`, `/order` and `/admin` plus all 16 pricing JS/CSS assets exactly match the reviewed production export. Root-guide checkpoint branch: `codex/workspace-docs-checkpoint-2026-10-30-products`.
