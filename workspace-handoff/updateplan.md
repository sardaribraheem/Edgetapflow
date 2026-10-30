# EdgeTap implementation milestones

Updated **30 October 2026**, Pakistan time. This is the ordered execution plan. The [product, pricing and operations specification](docs/PRODUCT_CATALOG_AND_OPERATIONS_PLAN.md) contains the detailed combination chart, profit calculations, cloud/archive design and acceptance rules. App-specific work is maintained in [app next steps](EdgeTapApp/docs/NEXT_STEPS_PLAN.md).

**Current scope: implement and publish the owner-requested website catalog, detailed prices, dashboard controls and remaining supported website foundations, then commit/push.** The owner explicitly approved publication after the main card-price fix. See [implementation and release evidence](docs/PRODUCT_CATALOG_RELEASE_2026-10-30.md). Default detailed rates: raw/programmed tag Rs. 400/500; unprinted card Rs. 500/600; standard printed card Rs. 600/700; setup Rs. 500. Annual service is Rs. 1,499 in the prepared catalog, but annual sales/trials stay disabled pending the owner's policy choice. Existing free profiles and customer terms remain unchanged.

## Starting point and protections

The 27 October admin/account release is complete: collapsible optional order sections, application decisions, contact corrections, identity-based Clients grouping and protected account/profile cleanup. The explicitly requested Umer separation is complete; no profiles were permanently deleted. The broader public cleanup/audit remains open. See [release evidence](docs/PROFILE_ACCOUNT_ADMIN_2026-10-27.md) and [current service authority](docs/LAUNCH_STATUS.md). Counts recorded during earlier work are historical snapshots, not a current deletion list.

Preserve Tarsil.pk, founder Ibraheem, every customer's currently stored public fields/links, handles, accounts, paid rights and order/payment history. The owner identified Umar Khan, Enfotize and Adolf as tests, but **ask before deleting any exact test profile**, including named ones. New signups are not automatically tests. No account/order/file cleanup follows from a profile label or this plan.

Maintain general docs at root `docs/`. Website source/Git lives in the separate `EdgetapFlow/` repository. App source and app technical docs live in `EdgeTapApp/`; preserve the owner's edited PRD and unrelated `revenue.nd`/untracked work. Do not rerun applied 019, edit applied migrations or blindly include optional 016. Recheck current history before any later implementation/release.

## Milestone order

| Order | Milestone | Status | Evidence needed to finish |
|---|---|---|---|
| 1 | Finish existing-site cleanup and customer baseline | Partly complete | Public/mobile audit, ordinary core-flow evidence, protected records preserved |
| 2 | Control costs: images, recovery and archive prototype | Compression and business backup controls implemented | Measured uploads/usage, verified non-destructive archive/restore, clear cost baseline |
| 3 | Build the configurable catalog and quote contract | Standard catalog/quote implementation complete | All supported combinations priced server-side, private costs isolated, old quotes intact |
| 4 | Clean the dashboard and publish a consistent pricing/checkout UI | Released; hosted checks passed | Owner price control/read-back, chart matches checkout, mobile/keyboard checks |
| 5 | Add annual entitlements and future-cohort trial/renewal | Implemented and tested; activation held | Server-enforced lifecycle, same-profile upgrades, legacy/app compatibility |
| 6 | Add useful business sections and a small set of presets | Core sections implemented | Actual hours/review/service workflows, preserved fields/URLs, bounded storage |
| 7 | Align and verify the Android companion | Planned | Current catalog/lifecycle, correct profile order handoff, genuine phone evidence |
| 8 | Validate, release a controlled pilot and check profit | Planned | Reviewed release, actual consenting customer results and contribution/retention data |
| 9 | Expand only the measured offer | Later | Repeat demand, funded operating budget, real analytics before app statistics |

Work on one main milestone at a time. New catalog rows, paid features and trials stay disabled until their dependencies are ready. Milestone 4 can preview annual offers, but cannot sell an unimplemented subscription before Milestone 5. Existing working offers can support an earlier scoped pilot; app completion and every business feature are not prerequisites for a sale.

## 1. Finish existing-site cleanup and customer baseline

- [x] Record the owner's protected-profile/test-cleanup boundary and maintained docs structure.
- [x] Release the first admin/account fixes and exact owner-authorized Umer separation; preserve Tarsil and all profile/order records.
- [x] Refresh Git/service state and aggregate-only inventory: prior migrations through 027, 8 profiles, 4 orders, 7 accounts, approximately 14.53 MB database / 20.50 MB files before this release. No customer records returned or changed by inventory.
- [x] Audit implemented public/account/order/admin flows with automated mobile/desktop checks and hosted read-only follow-up; actual inbox/private-byte/physical evidence remains separate. Covered: stale copy, duplicate buttons, broken links, optional Email, unknown handles, save/read-back and recoverable failures.
- [ ] Verify ordinary confirmed-account creation/sign-in/edit/order using an explicitly scoped consenting test journey; real mail/uploads are separate from mocks.
- [ ] Check real card/tag destination, QR where printed, print quality and handoff. Do not mark payment/printing/NFC complete without doing it.
- [ ] If actual test deletion is desired, present exact handles/related records and ask; independent UI work continues while that data decision remains pending.

**Exit:** the owner can demonstrate the current real core journey without confusing account/profile or order facts. Existing valid profiles and NFC URLs remain unchanged. Reference: [admin guide](docs/adminguide.md).

## 2. Control costs and prove recovery

- [ ] Verify actual provider plan, monthly egress/reset periods, per-bucket growth, production SMTP readiness and domain-renewal input. Record unavailable figures honestly.
- [ ] Confirm production, packaging, delivery, payment fees and time by SKU. Use owner-reported Rs. 260 finished-card cost and $30 next-domain renewal as inputs pending invoices; do not infer tag/blank costs.
- [x] Resize/re-encode **new standalone website portraits/logos** to 150 KiB/640 px and 50 KiB/320 px targets; preserve existing ownership protections. Add staff control for an optional 150 KiB shared bucket cap; retain legacy 5 MiB by default until mobile compression is ready. Keep private print masters and original order-logo bytes intact; print-linked public logos can exceed the standalone web target. Mobile/print compatibility is required before tightening the shared bucket cap.
- [x] Preserve old customer images; Check corrupt images, orientation, transparency, oversized output, interrupted uploads and replacement failures.
- [x] Implement non-destructive encrypted **business** exports with optional files, SHA-256 manifest, per-profile/customer scope and isolated decrypt/offline recovery checks. This does not provide a full SQL/Auth restore.
- [ ] Add historical archive eligibility/hold tracking, independent second-copy confirmation and a separately reviewed restore/import workflow; no cloud-file purge is enabled.
- [ ] Keep cloud Auth/ownership/profile/subscription and minimal order/payment/audit records. Keep files required for open production/revisions/support online.
- [ ] Define retention/customer-download behavior before removing cloud blobs. **No automatic deletion on order confirmation.** Build export/recovery first; any actual removal is separately scoped after concrete backup evidence.

**Exit:** compression is measured, archive restoration succeeds and actual usage/costs are visible. Local archiving is not mistaken for a way to eliminate a managed provider's fixed fee. Reference: [operations and archive design](docs/PRODUCT_CATALOG_AND_OPERATIONS_PLAN.md#5-cloud-data-and-encrypted-local-archive), [capacity model](docs/PROFILE_CAPACITY_AND_TRIAL_MODEL_2026-10-28.md).

## 3. Configurable catalog and quote contract

- [x] Model supported hardware/service/finish/destination/quantity/setup/delivery choices independently. Create or select an owned profile before annual/profile hardware checkout.
- [x] Cover standard supported rows in the [product combination chart](docs/PRODUCT_CATALOG_AND_OPERATIONS_PLAN.md#3-product-combinations-and-pricing-chart), including hardware without a profile, existing-profile hardware and renewal without hardware.
- [x] Build detailed draft/publish/read-back rates, availability, annual prices and revision history. Existing customizable-offer comparisons/bundles remain supported in their separate immutable legacy catalog; mixed-SKU carts/inventory and new promotion schemes remain later scope.
- [x] Keep private SKU costs/contribution inputs separate from publicly readable selling prices. An unknown cost is not zero.
- [x] Produce server-calculated immutable quotes/line items. Reject invalid combinations, client price tampering, stale revisions, another customer's profile and unsupported stock.
- [x] Charge annual service once per profile/period, regardless of matching hardware quantity. Additional/replacement hardware does not create a duplicate subscription/profile.
- [x] Preserve agreed legacy order prices, delivery terms, allowances and existing app 019 behavior through tested compatible/versioned contracts. Keep unready/unpriced products disabled.

**Exit:** isolated quote/security tests exercise every supported row and invalid option, and old orders/clients still work. No price change rewrites a saved quote. Reference: [catalog contract](docs/PRODUCT_CATALOG_AND_OPERATIONS_PLAN.md#4-owner-controlled-catalog-and-quotes).

## 4. Dashboard cleanup and public pricing/checkout

- [x] Build the **Pricing / Detailed product catalog** so the owner changes prices/availability later without deployment. Preview the exact chart and example totals before publishing; show confirmed save/current revision.
- [x] Build the LifeOS-inspired sidebar, compact header, aligned overview, mobile drawer and command search while preserving EdgeTap colours. Separate Dashboard, Orders, Clients, Profiles, Reviews, Pricing, Data & backups and Settings. Keep existing identity/security safeguards.
- [x] Release the reviewed admin/catalog/profile update and exact migrations 028–032 under the owner’s explicit authorization. Hosting `d94632fc5fe1f7e4`; 55 hosted checks and existing-record/app guards passed. Keep annual/trial activation off.
- [x] Add the standard hardware/programming/profile catalog and server-authoritative checkout; future tiers are unavailable.
- [ ] Add reviewed historical-archive hold/export/removal states after retention and recovery decisions.
- [x] Put actionable status/product/amount/destination first in orders. Group secondary details, keep Reject/Request changes and payment actions visible, and retain collapsible print/message/notes/checklist drafts.
- [x] Retain list filters/search, add trial/annual/legacy/expired states and price-loading timeouts/retry, keep keyboard/mobile support. Archive states remain a separate next step. Closed records remain searchable rather than deleted for tidiness.
- [x] Build a readable pricing chart and filters for digital-only/tag/card, printed/unprinted, with/without a new profile and existing owners. Show first-year total, renewal, quantity, assistance and delivery explicitly.
- [x] Connect each available supported row to matching checkout selections; prove the UI and server quote agree. Disabled or quote-only products cannot accidentally be purchased for zero.
- [x] Preview new annual products without enabling public purchase until entitlement/renewal readiness in Milestone 5.

**Exit:** the owner can edit a future price once and see it consistently in the pricing page, checkout and supported app handoff; mobile/desktop and accessibility checks pass. No giant always-open admin forms or duplicate confusing actions. Reference: [dashboard design](docs/PRODUCT_CATALOG_AND_OPERATIONS_PLAN.md#7-cleaner-dashboard).

Follow-up pricing review: [economic and consistency audit](docs/PRICING_LOGIC_AUDIT_2026-10-30.md) records the standard versus customizable scope, free-profile route, once-per-order assistance, renewal quote limits and independent catalog error handling. Publication/check results are maintained in launch status. No catalog amount or agreed customer term is changed by that review.

## 5. Annual service, trials and renewal

- [ ] Record the exact launch cohort/effective date and Basic price/support/delivery terms. Preserve current free profiles and existing purchased rights.
- [x] Implement (disabled for rollout): Claim one server-owned 14-day trial at first confirmed publication; do not reset it via edits, removed profiles, email changes or web/app switching.
- [x] Implement (disabled for rollout): Display trial/annual terms before creation. On expiry, suspend the future cohort's public trial with a recoverable draft/status page; keep account/handle. Define retention separately; do not automatically destroy data.
- [x] Implement (disabled for rollout): Activate after real verified payment on the same profile ID/URL. Idempotent billing events grant one defined 12-month period; early renewal preserves remaining paid time.
- [x] Implement (disabled for rollout): Separate staff moderation, paid entitlement, purchased link allowance and hardware ownership. A payment cannot silently restore a staff-hidden profile; a hardware order cannot silently change a legacy free entitlement.
- [x] Test shared SQL contracts, old-client section preservation, app 019 definition hashes and website lifecycle/recovery.
- [ ] Verify new native client UI/upload compatibility on real Android before enabling the new cohort for mobile users. No browser-only enforcement or old-RPC bypass for new cohorts.
- [x] Implement (disabled for rollout): Use in-account notices first. Activate customer email or recurring debit only under its own authorized, verified setup; this plan sends nothing.

**Exit:** trial, paid, early/late renewal, retry, unpaid/rejected, staff-comp, legacy and account-isolation cases pass across clients. Saved physical destinations remain safe. Reference: [lifecycle rules](docs/PRODUCT_CATALOG_AND_OPERATIONS_PLAN.md#6-storage-trial-and-subscription-rules).

## 6. Useful business profiles

- [x] Add timezone-aware hours, closed/split days, services/WhatsApp actions and a validated outbound Google review link; existing real profiles remain untouched until owners supply details.
- [x] Keep EdgeTap product reviews, business review destinations and hosted testimonials distinct. Build real review submission/moderation/spam controls before advertising hosted reviews.
- [x] Reuse one profile/section model for Professional, Portfolio and Local Business presets. Preserve content on theme switches and unknown fields on old-client saves.
- [ ] Add only a capped gallery when the paid offer/usage supports it; no unlimited uploaded video. Keep enquiry forms, bookings and imported ratings as separate scoped dependencies.

**Exit:** the advertised action works on real approved examples; feature availability, storage and annual value match what checkout sells. Reference: [feature sequence](docs/PRODUCT_CATALOG_AND_OPERATIONS_PLAN.md#8-useful-profile-features-and-app-alignment).

## 7. Android companion alignment and evidence

- [ ] Follow the app's own instructions and [maintained app plan](EdgeTapApp/docs/NEXT_STEPS_PLAN.md); preserve the original owner-edited PRD.
- [ ] Use the same account/profile/URL and current catalog, selected-profile hardware order, plan/trial dates and supported upload output. Never pass tokens in purchase URLs.
- [ ] Make unavailable/archived/order states truthful; retain QR/link fallback and preserve new web fields.
- [ ] Plan the owner-requested per-link QR feature flag initially off. Additional-profile/device-limit and account-deletion semantics need explicit shared policy; do not silently increase trial/profile quotas.
- [ ] Test native Auth, crop/upload, save conflicts, selection, sign-out and background cleanup on actual Android devices.
- [ ] Prove NFC on documented sender/recipient pairs before claiming it works. Statistics stays unavailable without a genuine API; check current digital-purchase/distribution rules before public release.

**Exit:** current commercial rules work, no duplicate profile/charge appears, and real device results bound release claims. A browser compile is not real NFC/mail/upload evidence.

## 8. Controlled pilot, release and contribution check

- [ ] Run appropriate SQL/security/legacy, browser, release-guard and app/native checks; retain private before-state recovery evidence and rollback plan.
- [ ] Prepare concrete release contents and disabled/enabled offer flags; obtain any required release/data/file-removal authorization only after results are reviewable.
- [ ] Release a small consenting new cohort, verify live read-only behavior and separately scoped real Auth/upload/fulfillment results. Never deploy a fixture export.
- [ ] Start with three to five paid fulfillments; record actual production, delivery, support minutes, acquisition, fees and usable card counts privately.
- [ ] Review 25/50/100 **paying** customers against invoices and contribution, not signup count. At 100 payers, the proposed Rs. 1,499/year still needs measured costs; no annual price is a profit guarantee on paid infrastructure; compare the financial table and adjust future prices/tiers or budget consciously.
- [ ] Attempt actual archive/restore before any approved cloud purge; verify customer/staff archived-file messaging and protection of unresolved orders.
- [ ] Update context/launch/release evidence with what actually happened and what remains unverified.

**Exit:** the paid promise is deliverable, annual revenue funds the chosen operating model or an explicit capped launch subsidy, and customer records/old cards remain safe.

## 9. Measured expansion

Add real permitted opens/clicks/enquiries and protected owner aggregates before app statistics. Do not claim exact people, physical tap counts, contact saves or submitted Google reviews from weaker events. Expand the preset/gallery/team/booking/iPhone offer only after repeated buyer demand, budget and operating capacity justify it. Printers/riders remain supplier/economic decisions rather than prerequisites for a usable product.

## Implementation handoff

On the next implementation task, refresh root context, repository instructions, current Git/service state and the active milestone. Start with remaining Milestone 1 and the non-destructive cost/recovery work. Do not treat “final plan” as evidence that any new feature already exists. Record changes, checks, unresolved inputs and next concrete step per milestone. Use the topic specification instead of duplicating full conversation transcripts. University/EdgeTap operating capacity sets the pace; no outside affiliate arrangement is accepted by this plan.
