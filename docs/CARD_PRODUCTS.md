# Link Card, EdgeTap Profile and two-sided card editing

**Updated 16 October 2026. Local implementation, not released.** [LAUNCH_STATUS.md](LAUNCH_STATUS.md) remains the status authority. Hosted baseline: migrations 001–011 and previously released site. New migrations **012 (products/editor), 013 (rotation), 014 (artwork/logo) and 015 (private proof review/revision allowance)** are prepared and tested locally, not applied. App work stays deferred.

## Owner-confirmed offers

| Offer | Price | Destination / ordering |
|---|---:|---|
| Link Card | Rs. 999/card | One existing public link; no digital profile setup |
| EdgeTap Profile | Rs. 1,499/card | Editable EdgeTap profile, up to ten contact links |
| Website + Cards | Rs. 29,999/package | Existing contact-only custom website/portfolio + four cards; first-year domain/hosting, then Rs. 3,000/year |

Delivery separate. Identical cards in one order share design/destination. Existing submitted prices are retained. Website scope is still agreed directly; it has no automated checkout.

## Customer flow

Link Card: choose Instagram / LinkedIn / GitHub / portfolio / WhatsApp / custom link, paste URL, then choose/design the physical card, review its link and details as text, enter private fulfillment details, save to an account, provide private JazzCash proof, submit.

EdgeTap Profile: choose/design physical card, enter public profile and links, preview the digital profile only, fulfillment, account saving and manual JazzCash submission.

For either card, the first design option is **Customize your card**. Edit Front/Back separately: select and hold text to drag it, use the corner handle to resize, the rotation handle to turn it, and the trash button to delete it. Font, size, bold and precise Position and rotation controls remain available. Solid/gradient colours use a saturation/brightness palette, hue slider, exact HEX/RGB and swatches. The two editable canvases stay visible inside the Customize popup only. Preset/upload choices show no generated physical-card preview; staff prepares the final proof after acceptance. Name/title layers follow provided information until edited. Starter preset layouts remain available. **Upload your card design** displays two separate file inputs; both are required for new uploads. Originals remain private.

QR starts enabled on the back. Customers can omit it on any new design. Inside the custom editing popup, they can drag the QR or tap/keyboard-position a marked spot on either face. Presets/uploads use back centre; other placement can be requested in the order note and checked in the final admin proof. **Centre QR** restores the back-centre position without changing its destination. A QR already baked into an uploaded image cannot be erased with the toggle; supply clean artwork and staff checks all visible codes. The admin’s Link Card proof QR uses the supplied validated destination; profile QR is finalized after publication.

## NFC capacity and production

We budget the normalized/encoded URL plus an uncompressed URI NDEF record, TLV and terminator within **496 bytes**. NXP lists **504 user bytes** and a factory **496-byte NDEF area** for NTAG215; 540 advertised bytes is not link capacity. [NXP datasheet §8.5.4, Table 4](https://www.nxp.com/docs/en/data-sheet/NTAG213_215_216.pdf). This is a conservative writer-independent payload check, not a chip-authenticity or compatibility test.

Staff must check the target page before **Confirm card link** or profile publication. Payment, accepted specification, current proof approval and confirmed printer settings remain required. Private account sharing waits for explicit customer approval; the advanced real-email channel retains its actual-transport/reply guards. Printing/NFC/QA/handoff stay manual. NFC and enabled QR use the exact same target. Changing an external URL later requires reprogramming/reprinting unless its owner controls a redirect; editing the content at the same URL does not.

The custom editing canvas, admin proof and PDF/PNG share the canvas renderer. Export supports 300/600 dpi RGB, separate faces and two physical-size PDF pages. Final files belong to the reviewed revision. Fonts use four explicit system families; check the saved proof on the actual printer’s workflow. This is not CMYK/PDF-X certification.

## Validation and release

Local validation includes the existing SQL/security suite, 12 product/security/legacy-price checks, 24 URL/NDEF checks and browser tests of both offers, responsive pricing/editor, private front/back account transfer, admin link confirmation and real digital PDF/PNG generation/QR decode. Auth/Storage transport and email are simulated. No real customer/order/payment/mail/physical production was performed.

Before release: review/apply 012 → 013 → 014 → 015 under corresponding authorization, confirm hosted offer settings and private boundaries, rebuild with real public configuration and pass the release guard, then separately authorize the Hosting release. Do not deploy the fixture export. Remaining real email, private-file, print defect and physical pilot evidence stays listed in launch status.

Code map and everyday edits: [Developer guide](developerguide.md). RPC/security details and fixture commands: [Backend guide](backendguide.md). Operator buttons: [Admin guide](adminguide.md).

**Local validation completed 15 October:** production build and Hosting release guard passed with real public configuration; TypeScript passed; lint has zero errors and six existing image warnings. Browser suites passed 49 new product/editor checks, 13 guest checks, 45 print/export checks, 79 fulfillment checks and 444 responsive checks (630 assertions total). The full local Supabase regression suite, 12 product/security/legacy-price checks and 24 NFC capacity checks passed. Browser Auth/Storage and proof transport were simulated; digital PNG/PDF rendering and QR decoding were exercised. These results do not establish real email, actual funds, real private byte isolation, physical printing or NFC compatibility. No deployment or hosted migration occurred.

## Editor logic follow-up, 16 October

Text rotation is optional, defaults to zero for old scenes, and is validated/stored with both faces. Canvas and PDF/PNG share rotation and print-safe bounds; editor handles are never baked into the files. Pointer movement is limited to one update per animation frame, supports mouse/touch and respects bleed/back orientation. Colour controls support keyboard editing and focus returns when the dialog closes.

`get_order_settings.cardEditorVersion >= 3` is required before custom-card account transfer/payment. Missing backend support leaves the device draft intact and hides payment. This capability is distinct from physical schema 2 and is supplied only by migration 013. Presets without an editor retain their existing offer guard. Reopened Link Card orders now preserve the edited private contact name instead of replacing it with stale cached display-name data.

## Editor follow-up — 16 October 2026 (local, unreleased)

Direct text dragging, resize/rotation/delete handles, an HSV/HEX/RGB palette and a **Centre QR** reset are implemented for the website. Print output preserves rotation without exporting editing controls. The Link Card PNG QR was decoded to the exact customer-supplied URL; staff uses that same confirmed URL for manual NFC programming.

Fixed during this check: stale cached names overwriting edited Link Card contact names; sticky navigation covering canvas controls; invalid nested help-dialog markup; bleed/back-orientation coordinate mapping. Custom-card account transfer/payment now requires the backend transform capability, preventing payment collection against unsupported backend versions.

Verified locally: **57** interaction/touch/compatibility checks, **51** product/order/PDF/PNG/QR checks, **45** existing print/export checks, **10** geometry/colour/name/SQL checks, the full Supabase regression suite, TypeScript and lint (zero errors; six existing image warnings). Auth/Storage and proof transport are fixtures. These tests do not establish real email, funds, actual chip compatibility or physical print quality.

**At that editor check migration 013 was prepared and unapplied, alongside 012.** The current reviewed release sequence is 012 → 013 → 014 → 015 before a separately authorized frontend release. Hosted 001–011 remains the last verified production baseline; app work stays deferred. No deployment, hosted migration, real order, payment or email occurred.


**Final build, 16 October:** the real public-configuration webpack build and Hosting release guard passed after source application. No deployment or hosted migration was performed.

### Gallery/editor clarification, 16 October (local only)

Customers have seven choices: Customize with a popup, four owner-artwork presets, separate front/back upload, and a textual designer contact (URL awaited). Presets collect a required name/main heading and optional motto/logo on the next page; layouts stay fixed. Link Card now includes this Details step without creating a digital profile. Printed heading and private recipient name remain separate.

The logo is separate from the avatar, public after authenticated upload, and appears on the card plus an EdgeTap Profile on guarded publication. Migration 014 and capability 4 support the new artwork versions/logo; 012–015 remain unapplied. Screenshot artwork is not a verified printer original; obtain better source artwork for low-resolution designs and check every final proof.

## Latest checkout/proof update — 16 October (local/unreleased)

Checkout has no generated physical-card previews, including presets/uploads. The explicit Customize popup keeps both editable canvases; profile checkout keeps its digital preview. Link Card review shows the URL, chosen printed heading, design, quantity and QR setting. Staff final proofs use the printed heading rather than the private recipient name.

Migration 015 adds private account sharing, customer approval and one included revision request on new orders. All edits go in one note; saving/re-sharing another proof does not replenish the allowance. A separately agreed, manually verified edit payment grants one further request. Existing orders retain legacy terms. Extra preference edits and major redesigns are separate; existing defect rules remain. Account sharing sends no email and never times out. The advanced email path keeps actual transport and window guards.

The payment guard requires `designReviewVersion >= 1` for the new offers. Review/apply **012 → 013 → 014 → 015** before the matching separately authorized frontend release. All four are prepared, unapplied. See [admin steps](adminguide.md).
