# EdgeTap update plan

Updated **27 October 2026**, Pakistan time. Work through the milestones in order. This file is the main execution plan; supporting research and operating guides are in [docs/](docs/README.md). The first admin/account cleanup release is complete; the broader milestone remains active.

Current scope: website cleanup and improvements, then separately authorized Android alignment. On 27 October, the requested dashboard controls and scoped Umer account separation were released. No profile/account was permanently deleted, no email was sent, prices were unchanged and app source was untouched. See [release scope](docs/PROFILE_ACCOUNT_ADMIN_2026-10-27.md).

## Milestone order

| Order | Milestone | Completion evidence | Status |
|---|---|---|---|
| 1 | Clean the existing site and review test profiles | Admin/account fixes released; public audit and owner approval before any permanent test deletion remain | In progress |
| 2 | Make signup, profile editing and card ordering dependable | Ordinary-user journey works; saves are confirmed; current prices/terms match checkout | Pending |
| 3 | Run a small customer pilot with the working offer | Real use, paid orders, fulfillment costs and buyer objections recorded privately | Pending |
| 4 | Add three useful profile presets | Professional, Portfolio and Local Business share one reliable profile system | Pending |
| 5 | Add review and business actions | Correct review/WhatsApp/service actions work on real customer-approved examples | Pending |
| 6 | Finalize paid upgrades and the free allowance | Clear paid value, server-enforced access and agreed new-user limits without losing existing rights | Pending |
| 7 | Align and verify the companion app | Current commercial terms, correct ordering handoff and actual phone acceptance | Pending |
| 8 | Add genuine measurement and expand proven offers | Real activity data, repeatable acquisition and sustainable fulfillment | Pending |

Use completion evidence to advance rather than an assumed release date. Keep one main implementation milestone active at a time. An early pilot can start as soon as the current experience is dependable; it does not depend on building every proposed feature.

## 1. Clean the existing site and review test profiles

**First work: clean up what is already there.** Review the live public profile routes and the website's existing content before adding features.

Owner clarification on 27 October: **Tarsil.pk / TarsilPK and Ibraheem are the only currently confirmed valid public profiles.** Preserve their profile records, URLs, ownership, links and customer/order/payment relationships. Keep every currently stored Tarsil.pk public link unchanged; account cleanup must not add or restore an Email link. The confirmed founder route is `/u/ibraheem`; resolve Tarsil.pk's actual stored handle rather than guessing its spelling from the business name.

The owner identifies **Umar Khan, Enfotize and Adolf** as test profiles and says other profiles in the present set are tests. These are owner-supplied names, not an inspected list of exact handles or IDs. New signups after this instruction may be real customers; never treat every future profile outside the two protected names as disposable.

- [x] Prepare a read-only inventory with exact handles/IDs, visibility, ownership and related records. Keep private account/contact/payment details out of versioned documents.
- [x] Match the owner-named test profiles to exact records and list anything ambiguous separately.
- [ ] **Before deleting any test profile, show the owner the exact candidates, related-record impact and proposed action, then ask for explicit confirmation.** This applies to the named tests too. Do not delete, hide or alter them during the documentation task.
- [ ] Agree whether a confirmed test should be hidden or permanently deleted; do not treat those actions as interchangeable. Customer accounts, orders, payments, files, reviews and other linked data need their own explicit scope.
- [ ] For a later approved cleanup, retain an appropriate private recovery record, act only on the approved exact records, and verify the protected profiles and their existing links afterward. No wildcard deletion, reseeding or old cleanup-script rerun.
- [ ] Audit public pages for stale copy, broken links, inconsistent button labels, confusing duplicate actions and unused test/demo content. Keep licensed assets and the owner-approved story/tap/QR demonstrations.
- [ ] Prepare the concrete visual/content changes; verify mobile/desktop, navigation, unknown-handle behavior and accessibility before an authorized release.

Completed first implementation: clear Hide/Restore versus permanent-delete controls, account/linked-order directory, exact-handle confirmations, safe order-contact correction, visible Reject application/Request changes, customer identity grouping and collapsible optional sections. Both hidden Umer handles and their one order were separated from Tarsil's login into staff management under the owner's explicit clarification. All six profiles and four orders remain; Tarsil's fields/links/order/payments and login are unchanged. No messages or permanent deletions occurred. Owner-named Enfotize was not matched to a current stored handle; do not guess. Permanent deletion of tests remains pending explicit approval.

**Done when:** the owner has approved the exact data action before it is taken, approved changes are verified, protected profiles remain unchanged, and the existing site has a clear usable baseline. If deletion approval is pending, continue independent read-only/UI work and keep the data step visibly pending.

Reference: [launch status](docs/LAUNCH_STATUS.md), [admin guide](docs/adminguide.md), [backend guide](docs/backendguide.md).

## 2. Make the core journey dependable

- [ ] Verify real signup confirmation, password sign-in and recovery with an agreed test recipient. Review the prepared Auth email plan separately from order emails.
- [ ] Verify profile creation, owner editing, public-photo disclosure/upload, successful-save read-back and recoverable failures.
- [ ] Confirm the same owned profile is reused when ordering hardware; browser sign-in remains separate where applicable.
- [ ] Make free profile, Link Card, existing-profile card and assisted package scope/pricing understandable and consistent with the current server catalog. Preserve submitted order quotes.
- [ ] Verify current delivery terms, payment-reference/receipt submission and manual funds verification without inventing payment or fulfillment success.
- [ ] Confirm usable print/tag quality, the correct encoded destination, matching QR where included, phone checks and actual handoff for the physical pilot.

**Done when:** a consenting ordinary user can complete the applicable flow and the resulting profile/order facts match reality. Build and mocked-test success alone are not this evidence.

Reference: [Auth email plan](docs/AUTH_EMAIL_PLAN.md), [business guide](docs/businessguide.md), [build guide](docs/BUILD.md).

## 3. Run a small customer pilot

- [ ] Speak with reachable NIIT professionals/freelancers and nearby service businesses; test which next action they want visitors to take.
- [ ] Demonstrate working contact/portfolio sharing and an agreed review/WhatsApp use case, marking any proposed feature clearly.
- [ ] Use ten voluntarily published profiles and three to five paid hardware/setup orders as initial learning targets, subject to stock and capacity. These are targets, not promised results.
- [ ] Privately record acquisition source, genuine payment/fulfillment, actual print/delivery/reprint/setup costs, repeat sharing and objections.
- [ ] Ask fulfilled customers for honest feedback and introductions; request permission for any public example.

**Done when:** real buyer evidence identifies the first useful preset/section and the full contribution per order is understood. Keep personal sales outreach with the owner unless separately assigned.

Reference: [customer growth research](docs/CUSTOMER_GROWTH_PLAN.md).

## 4. Add three profile presets through one system

- [ ] Professional: expertise/services/contact choices and a clear contact or consultation action.
- [ ] Portfolio: selected work, project descriptions and a project enquiry action.
- [ ] Local Business: services, optional prices, public hours/directions and a relevant enquiry/review action.
- [ ] Reuse profile identity, shared sections, editor, preview and access rules. Use the customer's purpose to suggest a preset.
- [ ] Keep name/role and the main action readable near the top. Make QR/share secondary and avoid popups interrupting contact.
- [ ] Preserve content when switching presets, stable profile URLs, purchased allowances, staff moderation and older-client compatibility.

**Done when:** the initial buyer-selected preset works end to end, then the remaining presets can be added without separate profile implementations. No need to match a competitor's 40-preview count before selling.

Reference: [profile direction and website sequence](docs/CUSTOMER_GROWTH_PLAN.md).

## 5. Add review and business actions

- [ ] Add an optional Google review destination/action and a clearly scoped review-card/tag offer using proven hardware.
- [ ] Add the service/portfolio sections buyers need and direct WhatsApp enquiries.
- [ ] Keep ordinary review/booking URLs usable as links. Charge for useful features, setup and hardware rather than a bare hyperlink.
- [ ] Keep reviews about EdgeTap separate from outbound reviews about a customer's business. A review click does not prove a submitted review.
- [ ] Add a private enquiry inbox only when demand justifies collection, owner-only access, spam controls and a retention decision. Use existing booking links before considering a full scheduler.

**Done when:** destinations and owner workflows have been checked, no real form submissions were fabricated during QA, and the advertised capability is actually available.

## 6. Finalize paid upgrades and the free allowance

- [ ] Separate hardware, richer digital features and assisted setup in the offer; state which are bundled.
- [ ] Keep the current ten-link free allowance until a specific change is chosen. Five links for future profiles is a proposal, not an implemented decision.
- [ ] Preserve existing free allowances, purchased capacity and historical quotes. Never truncate or remove existing links to create upgrade pressure.
- [ ] If a new limit is approved, define migration/cohort rules and enforce them on the server across web and app. Show the owner's plan/capacity clearly without making the public profile unattractive.
- [ ] Set paid features, limits, price, renewal/hosting terms and support scope using pilot evidence and actual operating costs.

**Done when:** the owner has chosen the offer and limit rules, customers can understand them, and access/payment/legacy behavior is verified before release.

## 7. Align and verify the companion app

- [ ] Update stale delivery copy, fixed pricing assumptions and the older staff-assisted existing-profile card route against the current website contracts.
- [ ] Verify selected-profile ordering without auth tokens in URLs or duplicate profile creation.
- [ ] Test actual Android sign-in, editing/photo lifecycle, conflict recovery, QR/link sharing and sign-out/background cleanup.
- [ ] Prove NFC on documented real-device pairs before making support claims; keep QR/link usable.
- [ ] Keep rich public sections on the shared website first; make later native editing preserve unknown fields and existing content.
- [ ] Review current dependencies, signing, privacy/deletion and distribution requirements before any public app release. iPhone and full native checkout remain later decisions.

**Done when:** current terms and identity/order association are correct, real-device results support the chosen release scope, and remaining limits are honestly disclosed.

Reference: [app next steps](EdgeTapApp/docs/NEXT_STEPS_PLAN.md).

## 8. Measure real activity and expand what works

- [ ] Add permitted public-profile events and protected owner aggregates before showing app analytics.
- [ ] Distinguish recorded opens, outbound clicks, submitted enquiries, unavailable data and measured zero. Do not claim exact people, physical taps, contact saves or submitted Google reviews from weaker signals.
- [ ] Repeat the best-performing audience/offer and publish permitted real examples. Judge acquisition against contribution and fulfillment capacity.
- [ ] Consider more profession presets, team tools, a scheduler/CRM, printers, a dedicated rider or iPhone only when repeated demand, costs and operational capacity justify them.

**Done when:** genuine measurement informs the next change and the offer can be fulfilled reliably at a sustainable cost.

## Meeting and capacity

The [Usama meeting brief for 27 October](docs/USAMA_MEETING_2026-10-27.md) runs alongside this product plan. No development role or ownership agreement has been accepted. If a paid role is agreed, cap hours and protect independent EdgeTap work in writing, then adjust milestone capacity. Keep private negotiations and company/customer documents out of project notes.

## How to record progress

For each milestone, record the completed work, validation evidence, open decisions and next action. Mark a production change complete only after its agreed checks and actual release evidence. Update [context.md](context.md) and [launch status](docs/LAUNCH_STATUS.md) when material decisions or releases change; link topic guides rather than duplicating chat transcripts.
