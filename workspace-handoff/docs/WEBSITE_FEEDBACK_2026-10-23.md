# EdgeTap Flow website feedback and requested changes

Recorded: **23 October 2026, Pakistan time**.

## Execution update: 23 October 2026

The owner-approved website release is live at **https://edgetap.tech**. Firebase Hosting version **`3e2361e7ecb8e32a`**, released **23 October 2026 at 10:26:44 am Pakistan time**. Exact migrations **020 and 021** were applied transactionally with history registration. Saved order, profile, application and app-function fingerprints matched before and after; existing 019 remains applied and optional 016 remains unapplied. The app source was untouched. The final release requirements below supersede earlier design/test notes.

## Final release request — supersedes earlier offer and sample-review notes

The owner reviewed localhost and authorised Hosting publication. Remove every placeholder review. Publish only reviews intentionally submitted through the public review form, plus any already-public legacy reviews; never publish old private feedback. Show at most eight review cards per batch, highest rating first (5, then 4.5, then lower ratings), with Show more fetching the next batch only on demand. Keep a Write your review invitation and a way back to the top reviews. Support public author names and half-star ratings. Explain public visibility before submission and retain guest review drafts through sign-in.

Final offers: **Profile Card Rs. 1499 for one; explicit 2-card offer Rs. 2099; explicit 3-card offer Rs. 2499. Link Card Rs. 999 for one (confirmed correction of “99”); explicit 2-card offer Rs. 1599; explicit 3-card offer Rs. 1999. No five-card offers.** Manual quantity changes still clear the offer and use the Rs. 700 extra-card rule. Make former/current prices the same size, former price on the right, with small Rs. text. Add “Contact admin for a custom digital profile template” with the owner's existing support WhatsApp +92 304 414 9674 on pricing and Profile Card setup.

The release includes the exact reviewed website migrations 020 (offers/delivery/templates) and 021 (opt-in public review publishing/pagination). Preserve hosted 019, all historical pricing/delivery terms, profiles, destinations and app functions; leave optional 016 unapplied. Only Firebase Hosting is published. Release validation and identifiers are recorded above and below.

## Latest owner revision — authoritative brief

- **Profile Card:** first card/profile Rs. 1499; each matching extra card Rs. 700. Explicit offers: **3 for Rs. 2299**, **5 for Rs. 3499**.
- **Link Card:** first card Rs. 999; each matching extra card Rs. 700. Explicit offers: **3 for Rs. 1999**, **5 for Rs. 2799**.
- Offers apply only when claimed using their button. Manual quantities use first-card price plus Rs. 700 per extra: three Profile Cards Rs. 2899; three Link Cards Rs. 2399. Quantity changes remove the selected offer. Existing owned-profile cards cost Rs. 700 each; they do not buy the new-profile bundles. Extra-link charges remain unchanged.
- **Delivery:** no separate customer delivery fee on new orders. Avoid delivery-price wording throughout marketing and earlier checkout steps. State **Delivery included** at payment. Store a zero customer delivery fee; actual rider costs remain private staff information. Historical submitted orders keep their agreed delivery and pricing terms.
- **Payment:** label the method **Bank**, keep the existing receiving IBAN and recipient, and select Bank by default for new checkout.
- **Card selection:** Black photography (`simple`, version 2) gets a tilted **Most used** tag at its container edge. Remove Popular from Customize your card. Pricing’s middle plan retains Popular.
- **Delivery form:** add an editable private recipient name for Profile Cards too. It must survive saving/recovery independently of the public display name.
- **Link Card designs:** use the owner’s 11 references in `assets/linkcard/`: four WhatsApp, three Instagram, three LinkedIn and one TikTok. Choosing WhatsApp first leads to matching WhatsApp designs next, alongside Customize your card, Upload a design and the graphic-designer WhatsApp link. Use the same filtering for the other supplied social families. Persist the selected design and recover the family from the saved destination.
- The supplied screenshots are perspective mockups with stock names/contacts/QRs. Rebuild clean flat selectable/printable designs from these references so stock contact details never reach customer print files. The gallery displays the supplied mockups, with stock QR areas covered by the real homepage demo QR. Keep originals as source references. Staff shares a personalized proof before printing.
- **Price formatting:** no grouping commas anywhere prices are displayed: 1499, 29999, etc.
- **Pricing UI:** keep the central Profile Card larger and golden; set the Rs. 29999 website package farther back on desktop. Show struck-through **2200 immediately beside 1499**, matching the supplied discount reference, rather than a separate Standard-price line.
- **Later price-row refinement:** all three plans show the current price first, followed immediately on its right by the crossed-out old price. Use smaller “Rs.” text next to the current amount.
- **Plan explanations:** Link Card opens an already existing portfolio, WhatsApp or any chosen link when tapped on someone’s phone. Profile Card opens an EdgeTap profile containing all the owner’s links. Include a linked **example profile** pointing to `/u/ibraheem`. Use clear, corrected English.
- **Website demo QR codes:** encode `https://edgetap.tech`, including marketing card backs, camera demos and decorative QR illustrations. Actual ordered-card QR codes must still match their confirmed NFC/customer destination; never rewrite existing printed destinations.
- Refresh the local website preview after validation. Do not touch `EdgeTapApp/`.

**Latest validation:** production and isolated fixture builds passed; TypeScript passed; lint has zero errors (20 existing warnings). All 13 isolated SQL pricing/ownership/delivery scenarios and 92 browser checks passed. Marketing QR decoding confirmed `https://edgetap.tech`. Release checks passed: 117 SEO/static checks and 140 public text asset/credential guards. The supplied mockups were inspected in the mobile gallery. Auth, uploads, notifications and money movement in workflow tests were simulated; this describes the earlier preview. The final hosted release is recorded at the top. Local preview: `http://localhost:3001/pricing`.

The earlier sections below retain the original spoken brief and prior implementation record for context. Where prices, delivery or styling conflict, this latest revision takes precedence.

## Scope and status

This is the complete English implementation brief from the owner's spoken Hindi/Urdu feedback and attached pricing reference. “Estep Flow,” “H-tab” and similar transcribed names refer to the **EdgeTap Flow website** and **EdgeTap Profile Card** in this repository. Use the existing EdgeTap brand unless the owner separately requests a rename.

**Website only. Do not change the companion app in `EdgeTapApp/`.** Communicate with the owner in English only; no Hindi, Urdu or Roman Urdu.

This document records requirements, suggested customer wording, source-review findings and implementation progress. See the execution update above and validation notes below for current local status; publication is separate. The source review below is local; the friend's mobile failures and signed-in production behavior have not been reproduced.

## 1. Pricing: three offers, with the Profile Card as the main offer

Use the supplied screenshot as visual inspiration, rather than an exact copy. Borrow its three-card comparison, crossed-out original price, prominent dark/gold middle offer and small position indicators. Do not copy its HR features, dollar currency, subscriptions or free-trial wording.

Keep these three main offers in order:

| Position | Offer | Requested price and treatment | What it means |
|---|---|---|---|
| First | Link Card | Rs. 999, interpreting the spoken “9.99”/“999” | A physical card that opens one existing destination. |
| Middle | EdgeTap Profile Card | Cross out **Rs. 2,200** and prominently show **Rs. 1,499**, interpreting “14.99” | The primary offer: a physical card with an EdgeTap profile. |
| Third | Website + Cards | Show the existing substantially higher website-package price clearly | A more expensive custom website option that gives the middle offer a clear value comparison. No new website-package price was specified. |

The commercial goal is to draw attention to the Profile Card. Visitors should understand that the Link Card is the entry offer, the website package is a larger purchase, and the Profile Card is the attractive middle choice. Show real prices and actual inclusions clearly.

Specific requirements:

- Put **Popular** on the middle offer where the reference says **Save 27%**. Do not use that savings label.
- Keep the main offer gold/golden and make it slightly larger or raised outward relative to the side offers. Give it enough space so it is not clipped.
- Use **Get your EdgeTap card** for the main CTA: this is the existing-brand equivalent of the spoken “Get your H-tab card.” Replace generic trial/start wording.
- Do not add monthly/annual selectors, recurring billing labels or free-trial copy to the three card offers. These are purchase offers. Preserve separately applicable website-package renewal terms rather than silently changing them.
- Use **green ticks** for included features, including email support and simple onboarding if those features are actually included. Do not reproduce the crossed-out rows from the screenshot. Do not promise unavailable support or email functionality just to fill a comparison row.
- Use relevant EdgeTap features, not the screenshot's recruitment/HR/team-management text.

Suggested simple Link Card explanation:

> Already have a profile, WhatsApp number or portfolio? Your card opens that link with a tap.

Make clear that this offer connects to something the customer already has; it does not create a new EdgeTap profile. A WhatsApp destination should be a valid WhatsApp link for the supplied number. Explain the middle offer equally plainly:

> Get your card and an EdgeTap profile with your photo, details and links.

**Current source:** [pricing page](../EdgetapFlow/app/pricing/page.tsx) shows Rs. 999, Rs. 1,499 and Rs. 29,999. Its crossed-out prices are Rs. 1,399, Rs. 1,899 and Rs. 36,999. The requested Profile Card comparison price of **Rs. 2,200** replaces the currently documented Rs. 1,899 for this future change; the other comparison prices were not changed by this feedback. Use PKR/Rs., not the dollar signs in the reference. The interpretation of spoken decimal prices is recorded explicitly rather than treated as new USD pricing.

## 2. Pricing on mobile: horizontal browsing, starting in the middle

The owner reports that mobile currently stacks Link Card, Profile Card, Website, then the banners/enquiry sections vertically. Change the three main offers to a **horizontal, swipeable row** on mobile.

- On the initial page load, center the **middle Profile Card offer**, so the main deal is what the visitor sees first.
- Keep the Link Card to its left and the website package to its right.
- Give an obvious signal that more offers are available sideways: visible edges of neighboring cards, a short “Swipe to compare” hint and/or suitable horizontal navigation controls.
- Add three small lines/dots like the reference, showing which offer is currently selected. The middle indicator should be active initially; indicators must update as the visitor scrolls.
- Make the featured card slightly bigger/raised and gold, including on mobile.
- Support touch swipes and usable desktop/keyboard navigation. Keep the horizontal overflow inside the offer row rather than widening the entire page.
- Keep the extra business/custom enquiry banners secondary to the three main offers. No replacement banner content or additional offer was specified.

Acceptance: a new mobile visitor lands on the Profile Card, can discover both neighboring offers without guessing, and can scroll between them while the position indicator follows.

## 3. Simple English throughout the website

Review customer-facing English across the whole website. The owner found some wording too complicated, and a friend testing the site did not understand the tap demonstration.

- Use short, familiar words and direct instructions.
- Explain what the user should do and what happens next.
- Make each offer's differences understandable without technical knowledge.
- Review headings, CTAs, instructions, help text, upload errors, ordering stages and review prompts.
- Keep implementation terms out of the normal customer journey where they do not help the customer make a choice.

## 4. Landing-page card-and-phone demonstration

Seeing a card beside a phone is not enough: the visitor must understand that the displayed card can be picked up and moved to the phone.

- Add clear nearby instructions, such as **“Drag the card to the phone to open the profile.”**
- Let the card move/wiggle gently to draw attention and suggest interactivity.
- On pointer hover, lift/enlarge the card slightly so it feels available to grab. Use an appropriate grab/grabbing cursor.
- When the visitor picks up the card, have the phone give a small shake or similar invitation to bring the card closer.
- When the dragged card touches the phone target, reveal/open the example profile and make the successful connection clear.
- Provide an equally clear touch interaction and retain a button/keyboard alternative. Respect reduced-motion preferences when applying the motion.

Preserve the existing demonstration/story functionality; the requested change is to make the interaction self-explanatory. Relevant source: [UseCaseStory](../EdgetapFlow/components/UseCaseStory.tsx).

## 5. Feedback: show reviews, then invite a new one

The feedback section should display previous feedback, rather than only presenting a submission form.

- Use a **horizontal, scrollable review carousel**.
- Show existing publishable reviews there.
- For the initial design/test version, include the four requested sample names below, with a mix including **4.5-star** and **5-star** reviews.
- Put a final card/compact option at the end: **“Write your review”**, making it obvious that visitors can also leave feedback.
- Keep the review form reachable from that final item.

Requested samples and draft copy:

| Name | Rating for the mockup | Sample feedback |
|---|---|---|
| Umar Khan | 5 stars | “I got an EdgeTap card and it works well. People I shared it with liked it too.” |
| Subhan Ali | 4.5 stars | Suggested placeholder: “A simple way to share my details.” |
| Ali Sulehri | 5 stars | Suggested placeholder: “My links are easy to share with one tap.” |
| Roman Fayyaz | 5 stars | Suggested placeholder: “Easy to use and handy when meeting people.” |

The owner supplied the names and Umar's approximate sentiment, and asked for test reviews. The other wording and rating assignments above are proposed mockup content, not verified customer statements. Label these as **sample/test reviews** in previews; do not present them as real customer endorsements. Exact spelling, final wording and per-person ratings can be supplied later.

Existing feedback is recorded as private in the current website guides. The public carousel must use reviews intended for publication; do not automatically expose private submissions, account details or other private feedback data. Check support for half-star display and storage before implementing 4.5-star reviews.

## 6. “What We Offer” moving strip

The owner describes a horizontal looping strip near/above “What We Offer.” Confirm the intended strip visually when implementing; the existing [SolutionGrid](../EdgetapFlow/components/SolutionGrid.tsx) is the matching moving-card component found in source.

- Keep the loop moving when the mouse hovers over it. Remove the current hover-to-pause behavior.
- Increase its automatic speed modestly so it feels faster than it does now.
- Allow the visitor to grab/hold and drag it sideways.
- A faster/flicking drag should move the whole row further, with a natural sense of momentum, rather than leaving it static.
- Continue the looping/autoplay experience after the drag ends. Keep click targets usable and respect reduced-motion and keyboard needs.

**Current source:** [motion settings](../EdgetapFlow/lib/data/motion.ts) use `pixelsPerSecond: 32`. `SolutionGrid.tsx` pauses on mouse hover, and pointer/focus interaction can stop its automatic movement. These behaviors need review together; changing the speed alone will not satisfy the request. No exact replacement speed was specified.

## 7. Image upload issue: current formats and limits

The owner tested ordering on a friend's mobile. Some images opened/uploaded and others did not. Investigate format, size, image decoding, browser behavior and local draft saving separately.

The current website source accepts these types:

| Upload | Accepted formats | Maximum size per file |
|---|---|---|
| Card front artwork | JPEG/JPG, PNG, WebP | 25 MB |
| Card back artwork | JPEG/JPG, PNG, WebP | 25 MB |
| Profile photo/PFP | JPEG/JPG, PNG, WebP | 5 MB |
| Logo | JPEG/JPG, PNG, WebP | 5 MB |
| Payment receipt | JPEG/JPG, PNG, WebP | 8 MB |

The implementation uses `MB × 1024 × 1024` bytes and rejects empty files and files above the limit. It checks the file's MIME type, not just the filename. HEIC/HEIF, GIF, SVG and PDF are not accepted by these customer image inputs. There is no HEIC conversion in the reviewed upload flow. Renaming an unsupported file does not convert it.

Sources: [upload service](../EdgetapFlow/lib/upload-service.ts), [order inputs](../EdgetapFlow/components/order/OrderSteps.tsx), [guest ordering](../EdgetapFlow/components/order/GuestOrderWizard.tsx) and [profile editor](../EdgetapFlow/components/ProfileEditor.tsx). These are source-level limits, not confirmation that every supported image succeeds on the hosted site or that live bucket configuration was rechecked.

Implementation/investigation notes:

- Show accepted formats and the applicable size limit beside each upload input in plain English.
- Report whether a failure is an unsupported format, oversized image, unreadable image, storage problem or upload failure where that can be established.
- Test representative phone images, especially HEIC/HEIF and large camera photos. Unsupported formats are a possible explanation, not an established cause of the reported incident.
- Check both front and back artwork, profile-photo cropping and logo uploads. Do not lose selected files or claim success when saving/uploading failed.

## 8. Draft storage warning: log now, decide the fix later

The friend saw a warning that device storage was blocked/full and the draft could not be saved. The owner is not certain whether phone storage was full or browser storage was restricted.

**Explicit direction: keep this issue under consideration; discuss/decide the fix later.** Do not silently treat this as a request to remove draft recovery or hide save failures.

Current findings:

- [Guest draft storage](../EdgetapFlow/lib/guest-draft.ts) uses browser **IndexedDB** and includes the message “Could not save on this device. Storage may be full or blocked.”
- This is a browser-storage failure message, not a diagnosis that the phone's overall storage is full.
- [GuestOrderWizard](../EdgetapFlow/components/order/GuestOrderWizard.tsx) already falls back to page-memory progress if initial device-draft recovery fails, with a warning that leaving loses the work.
- A later save failure follows a different path: it reports the error and can prevent progression until saving succeeds. Reproduce both initial-open and later-write failures when a fix is assigned.
- Potential future work includes clearer recovery guidance and reviewing fallback behavior. No final storage solution was selected in this feedback.

## 9. Graphic designer: small WhatsApp text link

On the card-order/design-upload step, show a small, clear text link, such as **“Need a design? Contact our graphic designer.”**

- Designer number supplied by the owner: **0327 1360809**.
- WhatsApp destination: **https://wa.me/923271360809**.
- Clicking opens a WhatsApp chat with the designer.
- Keep the link compact and secondary to ordering/uploading.
- This is the designer's number; do not replace the site's payment or general support number with it.

Current source: [site constants](../EdgetapFlow/lib/site.ts) has `DESIGNER_URL = null`; the order step already imports this setting. Connect and check the actual rendered link when implementing.

## 10. Extra cards: pay for the profile once

For the main Profile Card offer, the first card/profile purchase is Rs. 1,499. When the customer adds another card for that same profile, do not charge the full Rs. 1,499 again.

- Show an **“Add another card”** offer beside/below quantity selection.
- Intended reading of the spoken “5.99”: **Rs. 599 per additional card**.
- The second and subsequent cards should be additional physical cards tied to the existing profile, without creating or charging for another profile.
- Make the first-card price, added-card price, quantity and total clear before payment.
- Apply correct totals throughout checkout, saved orders, payment instructions and admin review, with server-side pricing matching the UI.
- Consider both adding quantity during the initial order and ordering another card after a profile already exists. Preserve the existing profile identity and destination.

Current [subtotal calculation](../EdgetapFlow/lib/data/order.ts) multiplies the full product price by quantity, so this requires actual pricing logic changes, not just a label. Backend price enforcement must be updated with the frontend; do not edit applied migrations. Existing extra-link charges are separate and were not waived by this request.

The phrase transcribed as **“4 rupees only, 5.99”** was initially unclear. The owner subsequently confirmed **Rs. 599** per extra card in the execution clarification above. It does not mean a Rs. 4 card.

## 11. Three-card offer under quantity selection

For the main offer's customization/quantity step, put this offer below the quantity control:

> Get 3 cards for Rs. 2,299.

**Owner correction:** Rs. 2,700 was said accidentally. The Rs. 2,299 price is only applied after the customer clicks the offer. Manually selecting three cards keeps the regular Rs. 2,697 total.

Make it clear that the cards use the same profile. The way to select/redeem the bundle should be obvious, and all checkout/admin totals must match the chosen pricing rule.

**Implemented rule:** changing quantity removes the selected bundle and returns to regular pricing. A fourth manually selected card therefore totals Rs. 3,296. Existing submitted orders keep their original pricing version. The additional-card price has been confirmed as Rs. 599.

## 12. Public profile: make Save Contact look downloadable

- Replace the right-pointing arrow on **Save Contact** with a **download arrow/icon**.
- Make it visually clear that pressing the button downloads/saves the contact information to the visitor's phone.
- Leave normal navigation arrows on unrelated contact links where appropriate.

Current source: [ProfilePage](../EdgetapFlow/components/ProfilePage.tsx) generates a **contact PDF** but shows a right arrow on this button. An icon change should accurately represent that existing download. The owner did not explicitly request changing the file format to a phone-address-book/vCard import; do not claim that a PDF automatically creates a phone contact.

## 13. Return/defect policy wording

Rewrite the customer policy in clear, professional English to reflect the owner's requested policy:

- Personalized cards generally cannot be returned.
- The requested exception is a card that **arrived defective or damaged**, rather than damage caused by the customer.
- Require an **unboxing/opening video** as evidence showing that the defect/damage was present on arrival and that the customer did not break the card.
- Explain the evidence requirement before purchase and in the relevant policy text, rather than introducing it only after a problem.

Working copy for review:

> Personalized cards cannot be returned unless they arrive defective or damaged. Please record a clear video while opening your package so we can check that the issue was present when it arrived.

This is a record of the requested policy, not a legal assessment or a published policy change. The owner did not specify a reporting deadline, claim channel, refund-versus-replacement remedy or return-shipping charges. Do not invent those details. Keep the current applicable terms intact until the revised wording and missing operational details are settled. Relevant sources: [terms page](../EdgetapFlow/app/terms/page.tsx) and [business guide](businessguide.md).

## 14. After ordering: visible review and approval stages

After submitting an order, the customer must be able to see what is happening, including:

- **Verification pending** while the order/payment is being checked.
- Whether the **request/order has been approved** or needs changes.
- Whether the **design is awaiting approval or approved**.
- Subsequent card/fulfillment progress, so final completion is distinguishable from request acceptance.

Use a clear progress/status view with easy English. Map these labels to the actual stored workflow. Do not mark payment verified, artwork approved or a physical card finished merely because the order was submitted.

Admin messages must also appear to the customer. For example, if staff says the uploaded photo is wrong and needs replacement:

- Display that customer-facing message prominently on the relevant order.
- Make the required action clear.
- Provide a route to edit/replace the requested material and resubmit as the workflow permits.
- Keep customer-facing requests separate from private internal admin notes.
- Preserve approved physical-design revisions; do not silently change an approved print snapshot through a profile edit.

Review the existing [My orders page](../EdgetapFlow/app/account/orders/page.tsx), application review and design-proof workflow before adding new stages; reuse real states instead of creating a second conflicting status system.

## 15. Fixed dimensions: simplify customer UI

The physical card dimensions are fixed. The owner does not want unnecessary dimensions/specifications explanations in the normal ordering flow.

- Remove or reduce customer-facing specification clutter and any implication that the customer must choose the standard dimensions.
- Keep the size fixed in the order data and preserve the actual print specifications for staff/manufacturing.
- This is a presentation request, not a request to change the card dimensions or remove production validation.

Current source: `OrderSteps.tsx` exposes a “Card specifications” help panel, and the pricing page also lists dimensions. Review both locations.

## 16. Admin profile review: show what the customer uploaded

While reviewing an order/profile, staff should see the customer's actual submitted:

- Name.
- Biography/about text.
- Profile picture/PFP.
- Other relevant uploaded content, including the logo and card artwork where supplied.
- Profile details/links needed to understand what will be published.

The owner wants to check that no inappropriate or incorrect material has been uploaded. Show the submitted draft, not an unrelated sample or only the eventual published profile. Keep private artwork and other order attachments inside the authorized review interface. Check previews, missing-image/error states and the request-changes action.

## 17. First black card template: Popular tag

On the first card-design selection page, add a small **Popular** tag to the **first black card design** so visitors notice the intended main template.

Keep it distinct from the selected-state checkmark and avoid covering important artwork. Confirm the design visually; identify it by its stable template ID rather than assuming every black design is the intended one. This template-gallery tag is separate from the main pricing offer's Popular badge.

## 18. Public profile: remove guest edit sign-in and restore owner editing

The owner specifically reports that a profile opened by tapping a card shows a bottom **“Sign in to edit”** button. Remove that prompt from the public profile.

Required visibility rules:

| Viewer | Public profile editing UI |
|---|---|
| Signed out, including a card-tap visitor | No “Sign in to edit” button and no Edit profile button. |
| Signed in to the account that owns this profile | A clearly visible, working **Edit profile** button. |
| Signed in to another account | No ability or invitation to edit someone else's profile. |
| Embedded order preview | No public-profile edit/account controls. |

The owner says Edit profile is currently missing even when signed in. Review and fix this as well as removing the guest link. Make the owner action discoverable rather than relying on a control that is easy to miss at the bottom. Authentication alone is not ownership; preserve the server's ownership and update guards.

Local source review:

- [ProfilePage](../EdgetapFlow/components/ProfilePage.tsx) already subscribes to authentication and asks `canEditProfile(initialProfile)` for permission.
- The existing **Edit profile** button is only in the bottom footer. When permission is false, the same footer shows **Sign in to edit** for a guest or **My account** for a signed-in viewer.
- [data-service](../EdgetapFlow/lib/data-service.ts) requires a `profileId` and calls the backend `can_edit_profile` RPC for the Supabase flow.
- A permission-check failure is caught and silently treated as no access. That can leave a signed-in owner without an edit action. Check the actual permission result and error behavior rather than showing Edit profile to every signed-in viewer.
- The [core permission RPC](../EdgetapFlow/supabase/migrations/202610070001_core.sql) checks the profile-ownership relationship. Existing staff update permissions are a separate backend capability; do not loosen public-owner UI rules to work around a missing ownership result.
- The source alone does not establish why the owner's hosted session is missing the button. Reproduce with the correct signed-in account and actual profile, check session recovery and ownership, and verify on mobile and desktop.

Acceptance: a guest arriving from a tap sees the public profile without an edit sign-in prompt; the real owner can find Edit profile, open the editor, save permitted changes and see them reflected; another account cannot edit it; signing out removes owner controls.

## 19. Outstanding decisions and implementation checks

No clarification is needed to preserve these requirements in this file. Before implementing dependent behavior, resolve:

1. Which genuine private feedback, if any, may be published. The carousel reads only the existing public review endpoint; the four test entries are explicitly labelled samples.
2. Any additional return/defect policy operating details. The requested unboxing-video wording is implemented without inventing deadlines or fixed remedies.
3. The draft-storage fix, explicitly deferred by the owner.

Implementation verification should cover responsive pricing and initial middle-card positioning; indicators, swipes and keyboard access; motion and drag behavior; upload formats/limits and storage errors; matching server/UI totals; customer-visible statuses/messages; full admin draft previews; download-button behavior; and guest/owner/other-account profile controls. Use isolated test data for simulated workflows. Do not change the app or publish test reviews as real endorsements.

**Documentation capture status:** the original brief was created first; website implementation was subsequently authorised. See execution and validation updates for current status.


## 20. Local implementation and validation result

Implemented on branch `codex/website-feedback-2026-10-23`:

- Pricing: gold/dark, raised Profile Card, Popular badge, Rs. 2,200 comparison, simpler explanations, green included-feature ticks and the requested CTA. Mobile opens on the middle offer with horizontal swipe navigation and position buttons.
- Card ordering: the first black template is marked Popular; the compact designer WhatsApp link uses the supplied number; fixed-size explanation clutter is reduced.
- Version-3 pricing: Rs. 599 extra cards, explicit Rs. 2,299 three-card offer, regular Rs. 2,697 manual three-card total, clear payment/summary labels and guarded server totals. Quantity edits remove the offer. Legacy submitted prices remain intact. Recovering an unsubmitted draft in the updated frontend uses the new pricing; legacy API clients retain their original behavior.
- Existing-profile ordering: signed-in owners can choose an active profile and order physical cards at Rs. 599 each. Checkout skips duplicate profile setup; staff confirms the existing destination rather than publishing another profile. Empty contact-link lists remain supported for existing profiles.
- Public profiles: no guest edit sign-in prompt; a prominent owner-only Edit profile action; retry guidance for permission-check errors; a download arrow on Save Contact. Existing PDF behavior is retained.
- Landing interactions: explicit drag instructions, card lift/wiggle, phone invitation motion, working card-to-phone contact, and faster offer-strip autoplay that continues on hover and resumes with momentum after dragging. Reduced-motion and keyboard alternatives remain.
- Feedback: a horizontal carousel reads the existing public reviews endpoint, shows the four clearly labelled samples including a half-star rating, and ends with a Write your review card. The form retains drafts through sign-in. Private feedback is not published automatically.
- Orders/admin: four meaningful review/approval/card stages, prominent customer-facing correction messages and edit links, and visible submitted PFP, biography, logo and links in staff review. Internal staff notes remain private.
- Policy/copy: unboxing-video evidence wording in the terms, FAQ and pre-purchase guidance; simpler wording in the main customer journeys. No new reporting deadline, fixed refund remedy or fee was invented.

Verification:

| Check | Result |
|---|---|
| TypeScript | Passed |
| ESLint | Passed with 0 errors; 20 warnings, mainly existing/dynamic image guidance |
| Normal website static production build | Passed |
| Release guard | Passed; 117 SEO/static checks and public asset/credential/fixture checks |
| Existing SQL/RLS workflow suite (`test:supabase`) | Passed |
| Existing checkout/notification/cleanup fixture suite (`test:uiux`) | Passed |
| New offer-pricing suite | 10 scenarios passed, including legacy prices, explicit bundle selection, ownership and guarded repeat-card confirmation |
| New upload helper suite | 9 format/signature/size checks passed, including real JPEG/PNG/WebP files with missing MIME |
| Isolated browser workflow | 62 checks passed across 320, 390, 768 and 1440px, including a complete bundle checkout, crop/logo upload, customer messages, admin previews, owner/other-account editing the actual drag-to-phone interaction, and short-phone control clearance at 320×680, 390×680 and 390×844 |
| App isolation | Outer workspace Git status stayed clean; no app files changed |

Design review preserved the existing cream/ink/yellow brand, Fredoka/Inter type, real card artwork, route structure and four-scene story. This was a focused evolution, with design variance 6, motion intensity 5 and visual density 4. Existing page themes and icon assets were retained.

The browser workflow uses a separately built fixture export, local PostgreSQL and simulated Auth/Storage/notification HTTP. It does not establish real hosted sign-in/upload success, real payment, email receipt or physical card delivery. The reported storage-blocked incident remains deferred as requested; no storage-limit workaround was silently added.

**Release status:** source and normal export are ready for review. Migration `202610230020_website_offers.sql` is prepared and tested locally, **not applied to the hosted backend**. Apply only the reviewed migration against the actual current history, preserving hosted 019 and leaving optional 016 alone unless separately authorised; do not blindly push all migrations. Deploy the reviewed frontend with the matching pricing capability. Neither deployment nor live data changes were performed in this implementation task.


## Final hosted validation

The reviewed production and isolated fixture builds passed, as did TypeScript, lint (zero errors; 20 existing warnings), all existing Supabase regressions, 13 offer/ownership/delivery scenarios, seven review privacy/ranking/pagination scenarios and 97 integrated browser checks. The exact migration transaction was also exercised locally after the existing 019 contract. Release guards passed 117 SEO/static checks and 139 public text asset/configuration checks. The live read-only verifier passed after migration. Anonymous live HTTP confirmed all four bundle prices, delivery inclusion and the empty real-review feed. Live browser checks confirmed equal former/current price sizes, the admin contact, both checkout bundles for each product, no five-card offers, the public review form and matching QR image. Reviewed homepage/pricing/order/terms/profile bytes matched production, including the Firebase alias. No fake reviews, customer test orders, uploads, emails or payments were created in production.


## Follow-up: contact on the first order screen

The owner could not find the custom profile contact on `/order?product=profile` because it appeared only on the later profile-details step. Add a visible custom digital profile page callout immediately below Choose your card on the first Profile Card screen, linking to support WhatsApp +92 304 414 9674 with the custom-template message. Keep the existing details-step contact. The owner also explicitly authorised pushing the source branch to the configured repository.

The first-screen contact follow-up was published as Hosting version `3e2361e7ecb8e32a` on 23 October 2026 at 10:26:44 am Pakistan time. Build/type checking and release guards passed; the contact was verified above the fold at 320×680, 390×844 and 1440×1000. This follow-up changes no backend contracts.


## Follow-up: 25 October admin and profile controls

The owner requested dashboard control of current/crossed-out prices, offers and additional-card/link charges; verified profile saves; sign-in versus owner-edit options in the side menu only; and immediate publication on edgetap.tech before physical printing. Implemented and released in website migrations 022/023 and Hosting `39b6167934063bc3`. See [the admin-controls update](ADMIN_CONTROLS_2026-10-25.md) for decisions and evidence. The app source is untouched.


## Follow-up: first-customer feedback, 26 October

Implemented optional public Email links, payment reference-or-receipt, direct staff profile publication, printed-card/tag/digital-only modes, an optional eight-step private checklist, staff customer-profile editing/moderation and one free ten-link website profile per confirmed account. See [the detailed update](FREE_PROFILES_AND_STAFF_FLOW_2026-10-26.md). The owner chose to leave Tarsil.pk's existing profile unchanged. Branded signup/recovery templates and the [SMTP plan](AUTH_EMAIL_PLAN.md) are prepared; email configuration is unchanged.
