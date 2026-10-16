# EdgeTap — authoritative launch status

**Audit: 14–15 October 2026, Pakistan time; documentation reconciled 15 October.** Current priority: a small, personally managed physical-card launch at **NASTP NIIT**. **App development, including the NFC prototype, is deferred until the owner explicitly resumes it.**

**Website release verified 16 October 2026:** Firebase version `ae83d57dca84c205` is live and Supabase migrations **001–015 are applied**. Offers/editor/private account-proof review are released. **Commercial production readiness is not yet established:** real ordinary-customer email/private-file/payment/proof/physical-handoff evidence is incomplete, optional email-proof transport is unverified, and the sample has a front-print fading defect.

This document is the current status authority. Supporting guides explain procedures; [archived reports](archive/README.md) preserve earlier evidence. A historical build, simulation, queue entry or release note is not fresh end-to-end verification.

## Current production release — 16 October

Live: **https://edgetapflow.web.app**, version **`ae83d57dca84c205`**, released **16 October 2026 at 12:50 pm Pakistan time**. The owner approved Firebase publication, then explicitly approved the four required Supabase updates. Fresh linked history matches **001–015**. Public settings now have `offerPrices = {direct_link: 999, profile: 1499}`, `cardEditorVersion: 4` and `designReviewVersion: 1`.

The exact tested preview was promoted to live. Production passed **444 responsive browser assertions**, **38 Hosting/public-profile checks** and **38 read-only backend API checks**. Read-only SQL verified workflow/private-ledger/RPC grants and migration history; before/after aggregate fingerprints confirm existing orders, profiles, customers, payments and drafts are unchanged. There were no seeds, customer-data cleanup, real new orders/payments, mail/messages or physical stage changes. Firebase Auth/Firestore/Storage configuration was not deployed.

[Release evidence](RELEASE_2026-10-16.md) records the artifact/migration hashes, private recovery-reference limitations, previous Hosting version and scope. The earlier preflight is archived; there are no pending migrations through 015. Do not rerun them. App work remains deferred. Actual customer email, private existing-byte isolation, funds and physical pilot evidence remain separate from these release checks.

## Current source update — 16 October: checkout, private proof and hero

**Released 16 October. Migrations 012–015 are applied and the matching frontend is live.** Hosted 001–015 is the verified baseline. The source behavior and earlier local validation below describe this release; they do not establish a real commercial fulfillment. App work remains deferred.

Physical-card previews have been removed from checkout, including presets and uploaded designs. The explicit Customize popup keeps its front/back editing canvases. EdgeTap Profile checkout still previews the digital profile; Link Card uses a text review. Final proof generation now uses the chosen printed heading rather than the private delivery name.

Staff saves the final front/back proof after acceptance/payment/destination checks, then makes it available privately and manually shares the prepared review link. The actual owner signs in to approve or request changes in one note. One request is included for new orders; extra preference revisions require a separately agreed, manually verified payment, recorded privately by staff. Regeneration cannot reset the allowance. Old orders retain their agreed rules, and EdgeTap errors/defects retain the existing defect process. Major redesigns go to a graphic designer; its URL is still awaited.

Account sharing **sends no email/message and starts no timer**; printing requires explicit approval of the current shared proof. The advanced email channel keeps its actual-transport/reply/window safeguards and remains unverified operationally. `designReviewVersion: 1` gates new-offer account transfer/payment on the updated backend. Safe sign-in returns to the exact private order. The authorized release updated schema/functions and Hosting only; it created no order, payment, mailbox message or physical stage.

Hero doodles now disappear one at a time as the desktop window narrows, with none below 900 px and no separate mobile strip. Main content stays in place.

Local verification: **29** new SQL/security/legacy-policy checks and the existing Supabase regression suite passed. The full new checkout/proof/hero suite passed **66** assertions; a final proof-flow rerun passed **35**, including clearing old fee/transfer acknowledgements. Existing suites passed **79** workflow, **51** product/export/decoded-QR, **37** updated physical/export, **84** gallery/modal/logo, **13** guest recovery and **154** UX/motion checks. TypeScript and lint passed (zero errors, nine dynamic-image warnings); the isolated webpack export passed. Screenshot inspection covered checkout/mobile approval and successive hero widths. After source application, the real-configuration webpack build and Hosting release guard passed (131 public text assets). The restarted real localhost server also passed 27 anonymous UI checks with external service requests blocked. Those local checks preceded the authorized deployment/migration recorded above. Auth/Storage/payment workflow checks use isolated fixtures, not proof of ordinary-customer inbox delivery, real funds/private-file isolation or physical production. Operator steps: [admin guide](adminguide.md); implementation: [backend guide](backendguide.md#13-private-account-proof-and-revision-policy-015-localunapplied).

## Card offers update — 15 October 2026

The owner confirmed **Link Card Rs. 999**, **EdgeTap Profile Rs. 1,499**, and **Website + four cards Rs. 29,999**, delivery separate. This update is released: **migrations 012–015 are applied and the matching Firebase frontend is live**. Hosted 001–015 is the verified production baseline; do not rerun the applied migrations. The new checkout checks `offerPrices` before taking payment. Existing submitted Rs. 999 orders keep their agreed price. [Implementation and operation details](CARD_PRODUCTS.md).

## Pre-release editor validation — 16 October 2026 (history)

Direct text dragging, resize/rotation/delete handles, an HSV/HEX/RGB palette and a **Centre QR** reset are implemented for the website. Print output preserves rotation without exporting editing controls. The Link Card PNG QR was decoded to the exact customer-supplied URL; staff uses that same confirmed URL for manual NFC programming.

Fixed during that check: stale cached names overwriting edited Link Card contact names; sticky navigation covering canvas controls; invalid nested help-dialog markup; bleed/back-orientation coordinate mapping. Custom-card account transfer/payment now requires the backend transform capability, preventing payment collection against unsupported backend versions.

Verified locally: **57** interaction/touch/compatibility checks, **51** product/order/PDF/PNG/QR checks, **45** existing print/export checks, **10** geometry/colour/name/SQL checks, the full Supabase regression suite, TypeScript and lint (zero errors; six existing image warnings). Auth/Storage and proof transport are fixtures. These tests do not establish real email, funds, actual chip compatibility or physical print quality.

**At that check migration 013 was prepared and unapplied, alongside 012.** At that check 014 was the latest prepared migration; the later authorized release applied 012 → 013 → 014 → 015 and published the frontend. Hosted 001–015 is now verified; app work stays deferred. No deployment, hosted migration, real order, payment or email occurred.

## Pre-release gallery, popup and logo validation — 16 October (history)

The owner retained all four uploaded presets: **seven choices** including Customize, Upload and the textual designer contact. Customize opens a front/back modal (desktop beside each other; mobile stacked); preset layouts stay fixed and collect the required name/main heading on the next page. Motto and logo are optional. Logo and portrait remain separate; logos appear on the admin physical proof and digital profile, persist through device/account recovery and publish only through the existing guarded profile transaction. Private recipient name remains separate from printed heading for Link Card.

Hero/How It Works use the owner’s card asset. Only the five real hero links are magnetic, with touch/reduced-motion fallbacks. The old floating card placeholder is removed. Designer URL remains owner-supplied and unset. Sample names baked into gallery screenshots are replaced in runtime print layouts; the honeycomb source is low resolution, so printer-quality originals and final proof review remain necessary.

Local verification: **85** gallery/modal/logo/hero-link checks, **57** touch/drag/rotation/colour/QR checks, **51** product/export/decoded-QR checks, **13** guest recovery/account checks, **79** fulfillment checks and **154** UX/motion checks passed. The full SQL regression suite includes **11** new logo/privacy/guard checks. Isolated export and TypeScript passed; lint reports zero errors with existing and new dynamic-image warnings. Screenshot review covered phone/desktop gallery, modal and hero. Fixtures simulate Auth/Storage and mail; these results do not verify production inbox delivery, funds, private file bytes or physical quality.

**At that gallery check migration 014 was prepared, unapplied.** The later release applied 012–015; hosted 001–015 is now verified. Artwork/logo checkout checks backend capability 4. No deployment, actual email/payment/order or hosted migration was performed.

## Findings and smallest remaining actions

| Issue | Current status | Evidence | Smallest remaining action |
|---|---|---|---|
| Migrations 007–009 supposedly unapplied | **Resolved: 001–011 matched at audit; the approved 16 October release now confirms 001–015 applied.** | Fresh `supabase migration list --linked`; [superseded build claim](archive/BUILD_before_launch_audit.md) | No migration needed to resolve that old claim; active documentation corrected |
| Website publication/backend | **Resolved. Site is live, using Supabase; Firebase is Hosting only.** | Fresh Hosting channel metadata: live version `e4635533ce44dcb1`; anonymous browser checks listed below | No deployment needed for this audit; retain current `.web.app` origin |
| Ordinary signup/confirmation/recovery | **Implemented/configured; real customer completion unverified.** | Fresh Auth settings enable signup/email, require confirmation, disable anonymous accounts; source guards and historical simulated tests; live recovery route works | Separately authorized non-staff signup, received confirmation, callback/sign-in, then received recovery link and new-password sign-in |
| Auth SMTP | **Current provider/configuration unverified; historical setup said custom SMTP pending.** | Public Auth settings do not establish SMTP configuration; no fresh protected dashboard/provider evidence or ordinary inbox-delivery evidence | Inspect existing configuration privately, then verify actual inbox delivery; configuration alone is insufficient |
| Order-proof sender | **Queue/hook exist; no sender found in repository and deployed Supabase Functions list is empty. External worker status unknown.** | Fresh source/Functions inspection; general order notifications disabled in fresh settings | For the released manual account-proof route (015), verify a real customer response during the consenting pilot. For optional email, establish actual transport separately |
| Proof send/reply/window | **Guards implemented; real send, recipient receipt and reply handling unverified.** | Migration 009 queue, restricted transport-ID hook, current-version reply and ten-hour/no-response checks; admin manually checks inbox | For email, record actual provider acceptance, receipt and replies. The released account channel instead requires explicit authenticated approval and has no timeout; verify it with a consenting real customer after release |
| Real order/payment/customer profile | **Source/local simulation coverage exists; ordinary-customer real success remains unverified. Founder public rendering works.** | Earlier workflow/SQL evidence; fresh founder and missing-handle checks | One separately authorized consenting order: persist/recover, inspect actual funds, accept specification, publish correct profile, edit as its actual owner and check unrelated-user denial |
| Existing private-file access | **Policies/adapters exist; anonymous boundaries pass. Real existing-byte isolation unverified.** | Fresh 33 read-only checks test RPC denials and absent public objects, not real customer JWT/file bytes | Verify actual owner/staff upload/download plus denial to another customer and anonymous requester |
| Physical sample | **Obtained. Owner reports NFC success on some phones and QR fallback; front colour fading is a confirmed observed defect.** | Owner answers during this audit; exact device models unspecified | Correct/reprint the fading front and approve the result; check intended destination and both methods on each customer card |
| Ordered Temu stock | **18 advertised NTAG215 cards ordered; delivery, actual specification and usability unverified.** | Owner-reported order total Rs. 2,300 | After arrival inspect quantity/type, read/write and test usable stock; add actual extra charges to cost |
| Printing/NFC/QR/customer handoff | **Partly evidenced by owner sample use, not a completed commercial order.** | Owner sample report; earlier digital export/QR-decoding checks; no observed actual full paid fulfillment/handoff | Complete the authorized pilot through current approved proof/package, print/NFC/QR/spelling QA and recorded handoff |
| Operating terms | **Current rules preserved; remaining decisions are unresolved.** | Existing commercial settings and new owner launch focus | Confirm delivery coverage, pre-production cancellation, defect/remedy and retention process separately; resolve any NIIT-versus-current-pickup copy change explicitly |

The absence of an app, a custom domain or Firebase billing is **not a launch blocker**. Migrations 012–015 and their matching frontend are released; they are no longer pending launch work. Do not reopen resolved Supabase cutover, founder publication or Hosting publication issues.

## Fresh evidence versus history

Fresh read-only checks in this audit:

- `supabase migration list --linked`: all eleven local/remote entries match.
- `node scripts/check-hosted-supabase.mjs`: **33 checks passed**. This includes signup/confirmation settings, anonymous denials and absent-object boundaries. It creates no accounts/orders/files and cannot establish real mailbox delivery or existing-file access.
- Supabase Functions inventory: **no deployed Edge Functions**. No repository proof worker was found. This does not rule out external infrastructure.
- `firebase hosting:channel:list --project edgetapflow --json`: live finalized version **`e4635533ce44dcb1`**, released **14 October 2026, 10:14 pm Pakistan time**; clean URLs, private-route noindex and `/u/** → /profile.html` rewrite present.
- Fresh anonymous production browser: `/`, `/account`, `/account/recovery`, `/order`, `/u/ibraheem` and a missing handle returned HTTP 200 with expected states, correct Supabase destination, zero page errors and no horizontal overflow. The missing handle did not show founder content. No signup/reset/order submission occurred.

Earlier records report release `625185c493bec4f8`, successful builds, 449 responsive checks, SQL/browser workflows and actual digital PDF/PNG/QR decoding. Those remain [historical release evidence](archive/CLOUD_HANDOFF.md). The fresh live version is different; this audit does not assert that the current deployment is byte-for-byte identical to an older export or matches every uncommitted source change.

The independent inspection was performed by Codex, not Claude. This audit changed documentation only: no deployment, migration, purchase, service/customer-policy change, email/message sending or real order creation.

## Physical-test record

The owner obtained a sample at **Rs. 350 blank + Rs. 150 printing = Rs. 500**. Its NFC was deliberately programmed for the landing page. The owner also reports another card programmed for their own page worked. Some phones used NFC; others reached the site using QR. Models were not known and will not be guessed. The front print is fading slightly; cause and durability are not established.

This establishes possession and limited owner-reported use, not universal compatibility, chip authenticity, customer fulfillment or approval of the current website-generated print package. The homepage target was intentional, not an application-routing failure. For sale cards, verify the agreed direct URL (Link Card) or customer `/u/<handle>` destination (EdgeTap Profile) and matching NFC/QR during actual per-card QA.

## Costs and stock ledger

| Item | Amount | Classification |
|---|---:|---|
| Obtained sample blank | Rs. 350 | Confirmed owner-reported sample expense |
| Sample printing | Rs. 150 | Confirmed owner-reported sample expense |
| Sample total | **Rs. 500** | Obtained physical sample; print defect still open |
| Current printing rate | Rs. 150/card | Owner-confirmed current rate; not a supplier-quality approval |
| Temu order | Rs. 2,300 / 18 advertised NTAG215 cards | Ordered stock; receipt/delivery/specification/usability not audited |
| Temu unit order price | **Rs. 127.78** | Rounded `2,300 ÷ 18`, before any additional charges; not verified usable landed cost |
| Small envelope | Rs. 10–20/card | Estimate under consideration; not recorded as a purchased expense |
| Confirmed new offers | **Link Card Rs. 999; EdgeTap Profile Rs. 1,499** | Owner confirmed 15 October; released 16 October; delivery separate |

Link Card sample remainder: `999 − 350 − 150 = Rs. 499`, before packaging and other costs. With the envelope estimate: **Rs. 479–489** before remaining costs. Neither figure is net profit.

Conditional Temu scenario: blank Rs. 127.78 + printing Rs. 150 + estimated envelope Rs. 10–20 = **Rs. 287.78–297.78**, leaving **Rs. 701.22–711.22** before extra charges, rejects/reprints, payment costs, support/time, marketing, software and applicable taxes. It depends on delivery and usable stock. Actual blank cost should be `(order cost + actual extra charges) ÷ usable cards`, rather than assuming all eighteen are usable.

## Policy and next-step boundary

The owner prioritizes NASTP NIIT for the small launch. Current customer pickup copy remains **NASTP Delta 3, Monday–Friday, 9 am–5 pm**; this audit does not replace that location/hours policy. JazzCash remains the current payment method, delivery is extra paid directly to the booked rider, and no custom-domain change is decided. Existing personalized-card/proof-review and free-for-now hosting terms are preserved; missing terms are not invented.

Prepare operational work for review using [Operational fixes for review](OPERATIONAL_FIXES_FOR_REVIEW.md). Start with actual Auth email evidence, a real customer response through the released private account-proof path and fading-print correction, then a separately authorized real pilot. Email proof transport is optional when using that account path; it is not claimed implemented. No software fix or production action is approved merely by listing it here.

Use [Build guide](BUILD.md), [Business guide](businessguide.md), [Admin guide](adminguide.md), [Backend guide](backendguide.md), [Business configuration](BUSINESS_CONFIGURATION.md), [complete business reference](../../EdgeTap_Complete_Business_Reference.md) and [deferred app/launch plan](../../finalplanoflaunchandapp.md) as supporting documents.

EdgeTap Profile sample remainder at the newly approved Rs. 1,499 is Rs. 999 before packaging and other costs, or Rs. 979–989 with the estimated envelope. Conditional Temu contribution at that price is Rs. 1,201.22–1,211.22 before additional charges, rejects, labour and other costs; usable stock remains unverified.

**Local validation completed 15 October:** production build and Hosting release guard passed with real public configuration; TypeScript passed; lint has zero errors and six existing image warnings. Browser suites passed 49 new product/editor checks, 13 guest checks, 45 print/export checks, 79 fulfillment checks and 444 responsive checks (630 assertions total). The full local Supabase regression suite, 12 product/security/legacy-price checks and 24 NFC capacity checks passed. Browser Auth/Storage and proof transport were simulated; digital PNG/PDF rendering and QR decoding were exercised. These results do not establish real email, actual funds, real private byte isolation, physical printing or NFC compatibility. No deployment or hosted migration occurred.

**Final build, 16 October:** the real public-configuration webpack build and Hosting release guard passed after source application. No deployment or hosted migration was performed.
