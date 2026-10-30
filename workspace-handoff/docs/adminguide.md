# EdgeTap admin guide

Updated 27 October 2026. Use [launch status](LAUNCH_STATUS.md) for the current release and limitations. Supabase migrations **001–015 plus 017–027** are applied; **016 remains unapplied**. The website is live; email transport/scheduler remain inactive.

The current order screen puts **Application decision** first, with **Reject application** and **Request changes**, a required reason and confirmation. These update the customer account without email; rejection does not refund or delete a profile. Closed applications cannot resume publication/production. **Profile & NFC destination** follows the collapsed customer details. **Publish profile** is available immediately for an order with valid profile details and an owned customer account. It does not require review, payment verification, specifications, print proofs or email and does not mark those facts completed. The confirmed live URL uses `edgetap.tech`. For an already owned profile, use **Use existing profile now**.

Open **Delivery & fulfillment**, then choose **Item type → NFC tag / chip only** for a chip, or **Digital profile only** when nothing physical is required. The agreed price is unchanged. Tag/digital modes hide print-proof tools. **Update fulfillment** records the work you actually completed; the eight optional checklist checks at the bottom never block it. Checkbox steps stay private. **Start review** and **Mark review complete** update the customer account only, without automatic email or required notes.

Payment has its own explicit **Mark payment verified** action after checking actual funds; a customer can supply a reference instead of a receipt. Printing/proof files, customer messages and internal notes are separate optional sections. Staff can edit customer public profile details or hide/restore visibility under **Profiles → Customer profiles**, without the customer password. Removing public visibility keeps the reserved handle and order/account records. Tarsil.pk was left unchanged as the owner requested.

The older full proof procedure below is optional when a printed-card proof is actually wanted. It is not a prerequisite for direct publication or manual fulfillment.

1. Sign in at `/admin`, open **Orders** and select the application. Review customer details, requested links/specification, private receipt and separate front/back artwork.
2. Verify the **actual transfer** to the selected JazzCash, Easypaisa or Meezan account against the server subtotal. All recipients are Muhammad Ibraheem Anwar; details are in the [business guide](businessguide.md). A screenshot alone is insufficient. Confirm the specification, then **Accept application**.
3. For **Link Card**, open the supplied URL and **Confirm card link**. For **EdgeTap Profile**, **Publish profile**, check the immutable handle and every link. The confirmed live URL uses `https://edgetap.tech/u/<handle>` and can open immediately, before printing. The customer opens the side menu while signed in, chooses **Edit profile**, then **Save & publish** for permitted public fields. Public profile pages contain no editing button.
4. Open **Print package**. Prepare both faces, printed name/heading, optional motto/logo and QR. Use **Replace prepared artwork** when necessary. Confirm actual printer settings, inspect both faces, then **Save front & back proof**. Only the saved proof is final; checkout previews are not approval.
5. Use **Make proof available to customer**, then **Copy review message** or **Open customer WhatsApp** and send the link yourself. Sharing sends no message/email and starts no timer. The customer signs into their order account to review both faces/PDF and approve or submit all changes in one note. Printing waits for explicit approval of the current revision.
6. One revision request is included on new orders. Save and share a new proof after revising; the used allowance stays used. For another preference edit, agree a fee and verify the transfer, then **Record a further edit payment**, enter the private verification note and acknowledge the actual payment. This grants one additional request without changing the original subtotal. No fixed extra fee is advertised. Existing orders keep their terms; major redesigns need a designer.
7. After approval of the **current revision**, use **Generate print order PDF** for the one-page A4 printer sheet containing the order name/reference and front/back images. The separate print package provides the two-face card PDF and HD PNGs. Respect the payment/specification/destination/current-proof guards; the sheet does not substitute for the print-resolution files.
8. Print, program NFC with the exact confirmed destination, and physically inspect spelling, finish, NFC and QR on each card. A changed design needs a new proof/approval. Record production stages only after doing the work.
9. Arrange the existing pickup or book the rider and record actual fare/message. Mark complete only after handoff. Correct the sample's fading front before approving print quality.

## Account access, contact correction and permanent deletion

Open **Customer & order details** to see the actual login account separately from the submitted order contact. Correct name/phone/email with a reason; this changes the order contact only. **Clients** groups by actual customer identity, including staff-managed records with no login.

Under **Profiles → Customer profiles → Account access & cleanup**, inspect the login and linked orders. **Hide profile** is reversible; **Permanently delete profile** is a distinct operation for eligible hidden profiles and cannot be restored. The latter keeps the handle reserved and retains accounts/files/order/payment history. Open/paid/production orders, reviews, purchased allowances and protected founder/Tarsil profiles block deletion. Ask the owner before deleting any test profile.

**Separate from login account** moves a hidden profile and its linked orders to staff management without a new login. Type the exact handle and give a reason. It clears a copied former-login email only from the moved order contact, preserves public links, and sends no notification. Tarsil's login was retained while the two hidden Umer profiles and Umer order were separated at the owner's request. No profile was permanently deleted. See the [27 October account/admin update](PROFILE_ACCOUNT_ADMIN_2026-10-27.md).

**Optional print proof & files**, **Optional customer message**, **Internal notes**, delivery/customer details and checklist start collapsed with explicit Expand/Collapse controls. Drafts survive closing a section. Sending a customer message remains a separate deliberate action.

## Website prices and offers

In the currently recorded live release, open **Settings → Website prices and offers**. The pending 30 October workspace update moves this to **Pricing → Website prices and offers**. Edit current and crossed-out prices for Link Card, EdgeTap Profile Card and the website package. Leave the comparison blank to hide it. Set two/three-card offer prices and availability, additional matching-card price, extra profile-link price after ten, and website renewal. Save waits for a confirmed server read; another staff change requires reloading before saving.

The public pricing page and new checkouts use the same immutable catalog revision. Visible tabs refresh on focus and within 30 seconds; the saving browser also notifies its other tabs. Existing submitted orders, corrections and approved snapshots keep their agreed prices. A new checkout whose price changed must review the current total; if already paid, contact staff before proceeding. Manual quantity changes clear an explicit bundle.

**Profiles** edits the founder example. Saving confirms the actual stored fields and public visibility before reporting success; failed/unconfirmed edits stay in the form. The homepage reads the saved social links. Do not replace a customer's profile through this founder editor.

## Optional email review

The proof-email action can queue a job, but delivery is inactive until sender/provider secrets, worker and scheduler are configured and verified. Do not tell a customer an email was sent from a queue entry. Only protected real provider acceptance starts the **ten-hour** window. A no-response decision also requires the actual current-proof/reply/inbox checks; it does not mean a physical card was automatically printed. See [backend activation steps](backendguide.md#email-activation).

Ordinary signup/confirmation/recovery mail is separate from order notifications and still needs actual inbox verification. Real hosted customer uploads/private-byte access, payment/proof approval and complete physical handoff require the consenting pilot.

## Profiles and test maintenance

Admin → Profiles lists customer/free profiles with confirmed edit and hide/restore controls, plus the founder `/u/ibraheem` editor. Preserve accounts, staff, handles, approved snapshots and shared assets. The owner-authorized test order/application cleanup has already run; do not repeat it as routine maintenance. Never remove real customer records or use the cleanup script without reviewing its scope and obtaining authorization for that data operation. Private backups remain ignored; never upload them to GitHub or share them with the printer.


## Pending workspace and backup controls

The [30 October implementation](ADMIN_WORKSPACE_AND_BACKUPS_2026-10-30.md) adds a LifeOS-style sidebar/header, dedicated Pricing and Data & backups, scoped encrypted business/file downloads, local/offline unlock and directly visible profile deletion guidance. It is locally tested but not deployed; migration 028 is pending. No existing profile has been deleted or file exported from production. These business exports exclude Auth credentials and SQL schema and do not restore live data. Follow the guide for exact coverage, limits and recovery.
