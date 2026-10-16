# Physical cards and printer handoff — agreed plan

**Current launch authority: [LAUNCH_STATUS.md](LAUNCH_STATUS.md).** App work is deferred. This supporting guide does not independently establish mailbox delivery, real customer success or physical QA.

Agreed plan, 14 October 2026. The owner subsequently authorized implementation. See developerguide.md/backendguide.md and the latest cloud handoff for actual verification/release state.

## Decisions agreed with the owner

- Preset designs have a fixed layout: printed name and optional title/motto are editable.
- Initially reuse the digital profile's name and title; allow separate printed wording in the physical preview. Bio, photo and contact links remain digital unless a future template explicitly supports them. Delivery addresses remain private.
- Uploaded artwork may mark a QR placeholder. The customer selects the face and taps the spot; admin checks its placement.
- Without a marked spot, place QR in the centre of the back. The customer may explicitly choose no QR; NFC remains part of the card.
- Printer requirements are not yet confirmed. Bleed, resolution, safe area, colour/output requirements and front/back orientation must be configurable and confirmed with the printer.
- Short reference proposal: `ET-101426-1001`, then `...-1002` (MMDDYY + running sequence, Pakistan date). Treat this as the order reference; quantity is separate because one order's cards share a profile. Assumption: sequence runs across days, does not reset daily, and starts at 1001 for the new format. Existing references stay unchanged.

## Customer experience

Keep the current ordering flow, with progressive disclosure rather than another long form:

1. **Card:** select a preset or upload artwork; choose quantity. Uploads have separate Front and Back slots, with two required inputs for new uploads (legacy standard-back orders remain supported). Never silently discard a face or crop artwork to fit.
2. **Profile:** enter name, optional title/bio/photo and links once. Feed name/title into the preset preview by default. Contact/delivery details retain their current private/public separation.
3. **Preview:** offer two clearly labelled tabs, **Card** and **Profile**. Card has Front/Back controls and a small pencil action opening just printed name and optional title/motto for presets. Desktop can show both faces; mobile shows one face at a time. Updating printed text does not overwrite the digital profile. Returning to profile edits updates defaults only until printed wording is explicitly overridden.
4. **All new card designs, including uploads:** show one checked **Include QR code** control. When enabled, offer **Marked spot** or **Centre of back**. Marked spot opens the selected face for a tap/position adjustment with a visible QR outline. Admin checks position and size. Turning QR off hides positioning controls and clearly records an NFC-only physical card. Preserve uploaded text/artwork rather than replacing it with profile data.
5. Continue delivery, account saving and payment normally. Supporting explanations belong in info popovers; errors and decisions remain visible.

Blank optional motto renders no text, rather than silently reusing EdgeTap's tagline. Keep long-name fitting bounded; warn before text becomes too small or is clipped. No full layout editor, extra colour picker or repeated customer-name form in this release.

## Accurate templates and rendering

The existing four PNG previews contain fixed EdgeTap text. They cannot serve as editable templates just by overlaying another name.

Designer handoff for each future template:

- Separate front/back source artwork at the confirmed card proportions; background artwork without baked-in variable text.
- Named editable slots for `printed_name`, `printed_title` and `profile_qr`, with positions, bounds, alignment, colour and fonts.
- Printer-approved trim/bleed/safe-area information and front/back orientation. Current trim is **85.60 × 53.98 mm**; bleed is additional and currently unconfirmed.
- Versioned template definition and assets. New designer assets can be registered without changing the ordering form. A simple admin template-registration interface can follow the first working templates.

Use one shared composition model for preview, PDF and PNG, so the printer receives the same approved layout. Render artwork directly rather than capturing a screenshot of the webpage. Maintain sharp QR edges and source-resolution checks; enlarging a small upload does not restore its detail. Export font/asset failures must be actionable rather than silently using a different layout.

## QR destination and review

- A placeholder is an empty placement marker, not a working QR. Do not guess its location from a bitmap or assume the customer's tick verifies a code.
- Before a handle is confirmed/published, the card preview displays a placement placeholder labelled **QR finalised after review**. Never encode a tentative, unreserved handle in a production file.
- After publication, generate the QR from the canonical `profileUrl` shared with NFC. Check the final code resolves to that exact active customer profile, or the customer’s agreed direct URL for Link Card; never another customer’s handle.
- Keep a four-module clear margin around the QR, with high contrast and enough physical area. Source: [DENSO WAVE](https://www.qrcode.com/en/howto/code.html/index.html).
- If uploaded artwork already contains a functioning QR, flag it for admin review: check its target and explicitly replace/retain/remove it. Clearing Include QR cannot remove pixels already baked into an image; corrected artwork is needed when a customer wants such a QR removed.
- Test the exported QR and a real printed sample. Digital decoding alone does not prove physical readability.

## Admin print package

Add a compact **Print package** action to the order panel. Its sheet offers **Copy message**, **Download PDF**, **Front PNG** and **Back PNG**. A download-both convenience can follow if needed. Generating or copying never automatically sends a message to the printer.

Suggested message shape:

```text
EdgeTap print job: ET-101426-1001
Quantity: 2 identical cards
Material: PVC with NFC
Trim: 85.60 × 53.98 mm
Print: front and back, per attached approved files
Front wording: Talha / AI Engineer
QR: included, back centre
Artwork revision: 3
Files: ET-101426-1001-r3.pdf, ...-front.png, ...-back.png
```

Include confirmed print settings when available. Exclude delivery address, private phone/email, receipts, payment details, digital bio and unrelated links. Order reference identifies the batch; it need not appear on the physical card unless the design intentionally includes it.

- **PDF:** front and back as separate pages, correct physical size and agreed printer settings. Keep the message outside the artwork pages.
- **HD PNG:** a separate lossless image for each face, dimensions derived from physical size plus agreed bleed and resolution. Make chosen resolution explicit. PNG is a raster/RGB deliverable; do not describe it as a CMYK production file.
- Any CMYK/PDF-X requirement must be satisfied by a verified export/conversion path agreed with the printer. Browser RGB output must not be presented as calibrated or certified print-ready output.
- Store final artifacts privately and offer authenticated downloads. A portable downloaded package contains the files, not expiring private links that the printer cannot use.

Allow a clearly marked draft/proof export while review is in progress; this is necessary to send the proof. Enable the final production package only after verified payment, accepted specification, active profile/final handle, both final faces, QR placement/opt-out review, printer settings and the existing customer design-proof approval requirements. It must not bypass the current actual-email confirmation or ten-hour review rules.

Freeze a versioned print snapshot when generating the package: template version, printed wording, original/prepared front and back, QR setting/location/target, quantity, print settings and approval. All downloads/message refer to the same revision. Artwork/wording/QR changes invalidate approval and old packages; re-read the order and check its version before saving. Later digital profile edits do not change an already approved or printed physical card.

## Data and numbering

Extend shared TypeScript models, guest storage, account drafts, order validation/RPCs and staff UI consistently. Store physical-card settings separately from `profileDraft`; add versioned front/back artwork and print snapshots rather than overloading the current single `preparedArtworkUrl`. Carry the correct revision through design-proof email jobs, confirmations and the final package so an old proof cannot approve new artwork. Preserve legacy single-image orders until explicitly reviewed; never reinterpret them silently.

Issue short references on the server once at order submission, using a database sequence and a unique constraint. Keep internal IDs/handles unchanged. Retried submissions return the same order/reference; simultaneous customers cannot receive the same number. Do not generate a sequence using client-side order counts or recycle deleted/cancelled order numbers. New numbers can have gaps and can grow past four digits.

The server must validate template versions, text limits, private upload ownership, QR enums/face/bounds and final-snapshot state. Staff authorization, row access, payment/proof guards and immutable owners/handles remain enforced in the backend.

## What we offer motion

Keep the existing cream/navy/yellow brand and auto-loop, without pause/resume buttons. The original baseline moved at 24 px/s with equal-sized cards. The implemented setting is **32 px/s** with graded centre emphasis; the earlier build/preview evidence is historical and current launch evidence is linked above.

Use a smooth position-based scale curve: largest at the visible centre (about 1.0), gradually smaller toward the edges (about 0.86). Scale an inner card so track widths/loop measurements stay constant; reserve space to prevent clipping. Continue constant translation, update transforms outside React state, and wrap identical copies seamlessly. Do not animate widths or reset abruptly when resizing.

Pause on hover; touch/drag or keyboard focus lets the visitor take control. Avoid clipping tappable content; honour reduced motion with a static/manual presentation. Confirm readable text and stable page layout at mobile widths. Faster playback alone is not a smoothness fix.

## Original implementation order and acceptance checks

1. Shared physical-card/template model and one sample preset with the renderer. Confirm designer and printer contracts before final export assumptions are locked.
2. Physical/digital preview tabs, minimal text overrides, front/back uploads and QR placement/opt-out; preserve device draft recovery and account saving.
3. Server numbering, private artwork/snapshot revisions and review integration; test concurrency, retries, stale edits and authorization on an isolated database.
4. Print-package sheet, copyable brief and PDF/PNG exports; update admin guide.
5. Carousel refinement and browser measurements; then reviewed Hosting preview before any release.

Acceptance checks: preset name/motto replacement; long and supported non-Latin text; blank motto; uploaded front/back with marked/default/no QR; existing-QR mismatch; correct final canonical link; missing/corrupt/low-resolution assets; physical dimensions and agreed print settings; front/back orientation; private authenticated downloads; stale approval/package invalidation; digital edits after printing; concurrent/retried numbering; existing-order compatibility; responsive/keyboard/reduced-motion behaviour; a printer-approved physical sample and actual QR/NFC scan.

Actual printing, printer messages and physical stage updates remain operator tasks. A plan or passing digital checks does not prove physical production.

## Card offers update — 15 October 2026

The owner confirmed **Link Card Rs. 999**, **EdgeTap Profile Rs. 1,499**, and **Website + four cards Rs. 29,999**, delivery separate. This update is implemented in local source and tested with isolated fixtures. **Migration 012 is prepared, not applied; this feature is not deployed.** Hosted migrations 001–011 and the previously released website remain the last verified production baseline. Review/apply 012 under separate authorization before releasing the matching frontend. The new checkout checks `offerPrices` before taking payment. Existing submitted Rs. 999 orders keep their agreed price. [Implementation and operation details](CARD_PRODUCTS.md).

Schema-2 custom cards additionally support a free-layout front/back scene with text layers, fonts, sizes, colours and gradients. The prior fixed-preset wording describes schema-1 historical designs; use [CARD_PRODUCTS.md](CARD_PRODUCTS.md) for current changes.
