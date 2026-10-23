# EdgeTap launch status

Updated 23 October 2026, Pakistan time. This is the current status authority; procedures live in the other [guides](README.md). The priority is a personally managed physical-card launch at NASTP NIIT. This website release leaves companion app source and its existing database functions unchanged.

## Recorded production state

- Preferred origin: **https://edgetap.tech**. Latest Hosting version: **`3e2361e7ecb8e32a`**, released 23 October at **10:26:44 am Pakistan time**. Both Firebase aliases remain available for existing cards and Auth links.
- Supabase project: `dxyxvervvlxhwwbcbttd`; Firebase Hosting project: `edgetapflow`. Supabase handles Auth, database and Storage; Firebase handles Hosting only.
- Hosted migrations: **001–015 plus 017–021**. Optional domain migration **016 is unapplied** and is not required by the released frontend. Never rerun applied migrations or blindly push all pending files.
- Checkout version 2 plus website offer-pricing version 3 is released. Profile Card: 1499 for one, explicit two-card bundle 2099 or three-card bundle 2499. Link Card: 999 for one, explicit two-card bundle 1599 or three-card bundle 1999. Manual extra matching cards cost 700. New website orders include delivery, stated at payment; legacy order terms remain intact. Bank is the new-order default.
- Public reviews are intentionally published through the signed-in review form, with explicit public-name/rating/text disclosure, half-star ratings, eight-review batches ordered by rating/newest and on-demand Show more. Sample reviews were removed. Existing private feedback stays private. Hosted 019 and all saved order/profile/application fingerprints and app function definitions were preserved by the 020/021 release transaction. See [release history](RELEASE_HISTORY.md).
- Order/proof email worker, sender/provider secrets and scheduler are **inactive**; `emailNotificationsEnabled=false`. Queueing or private sharing sends no mail and starts no clock. The optional ten-hour window starts only after real provider acceptance.
- Founder `/u/ibraheem` is active. Unknown handles show Profile not found, never founder content. Customer profiles and private routes remain noindex; no customer profiles are in the sitemap.
- Authorized test-data cleanup removed four orders and four applications, kept all three accounts/customer containers and staff, and deactivated the test profile. Only the founder was active afterward. A private ignored recovery snapshot was retained.

## Remaining work

| Work | Evidence still needed |
|---|---|
| Ordinary signup and recovery | Real non-staff confirmation/recovery received, correct callback and successful sign-in. Current SMTP provider configuration is unverified. |
| Hosted uploads and private access | Actual owner/staff upload and download of existing bytes, with another customer and anonymous access denied. Local fixtures and absent-object denials do not prove this. |
| Consenting paid pilot | Save/recover a real order, verify actual funds, accept specification, publish the correct profile, edit as its owner, approve the current proof, then print/program/QA/handoff. |
| Email activation | Verified Resend sender, server secrets, protected worker deployment, scheduler and real admin/customer inbox tests. Keep sending disabled until reviewed setup is complete. |
| Physical print quality | Correct/reprint the sample's fading front, confirm printer file requirements and inspect the actual result. |
| Stock intake | Inspect the 18 ordered advertised NTAG215 cards after arrival: actual type, writability, rejects, usable count and extra charges. |
| Domain/Auth settings | Review Site URL and six callbacks, www DNS/TLS/redirect and optional migration 016 separately; exact steps are in [BUILD.md](BUILD.md). |
| Google search icon | Stable crawlable icons are published. Search Console required Google sign-in, so no indexing request was submitted; actual search-result refresh remains unverified. |
| Customer terms | Confirm delivery coverage, pre-production cancellation, defect/remedy/reporting, retention and hosting-duration/change-notice terms. NIIT launch focus does not replace existing Delta 3 pickup copy. |
| Legacy test maintenance | `test-hosted-supabase-browser.mjs` still assumes a clean project/absent founder; older workflow browser suites also contain outdated UI expectations. Use the current release checks described in [BUILD.md](BUILD.md). |

## Physical evidence and costs

The owner has a sample costing **Rs. 350 blank + Rs. 150 printing = Rs. 500**. It deliberately opens the homepage; another card programmed for the owner's page reportedly worked. Some phones used NFC, others QR; exact models are unknown. The fading front is a confirmed issue. This is limited owner-reported evidence, not universal compatibility or a completed paid customer order.

The 18-card Temu order costs Rs. 2,300 (Rs. 127.78/card before extra charges); delivery/specification/usability are unverified. Envelope Rs. 10–20 is an estimate. The full ledger and contribution scenarios are in [businessguide.md](businessguide.md).

Builds, local SQL/browser simulations, anonymous service probes and a Hosting release establish only their tested scope. They do not establish actual mail receipt, funds, existing private-byte isolation, physical quality or customer handoff. Future production operations need authorization for their scope; this status document itself grants none.
