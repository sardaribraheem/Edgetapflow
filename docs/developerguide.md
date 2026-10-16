# Developer guide — edit EdgeTap without AI

**Current launch authority: [LAUNCH_STATUS.md](LAUNCH_STATUS.md).** App work is deferred. This supporting guide does not independently establish mailbox delivery, real customer success or physical QA.

You need a code editor (VS Code is fine), Node.js supported by the installed Next.js, and a terminal. Open the **EdgetapFlow project folder**, not `out/`. The files in `out/` are generated and will be replaced by the next build.

## 1. Start the website locally

Keep your existing `.env.local`. In the project terminal:

```sh
npm ci
npm run dev -- --port 3001
```

Open http://localhost:3001. Save a source file to see the browser refresh. Stop the server with Ctrl+C. If 3001 is busy, stop the existing server or choose another port. Do not delete your environment file to fix a port error.

Make one change at a time. Create a Git branch first and commit working changes so you can undo them. Local edits do not automatically update the live website.

## 2. Find the right page

| Browser page/section | Main files | Purpose |
|---|---|---|
| `/` landing page | `app/page.tsx` | Section order |
| Top hero | `components/Hero.tsx` | Main headline/artwork |
| What we offer | `components/SolutionGrid.tsx`, `components/SolutionCard.tsx` | Moving feature cards |
| How it works | `components/UseCaseStory.tsx` | Scroll-controlled story |
| Navigation, FAQs, feature wording | `lib/data/content.ts` | Shared content |
| `/pricing` | `app/pricing/page.tsx` | Offers/prices (search the page imports if a file moves) |
| `/order` | `components/order/OrderSteps.tsx` | Ordering sections |
| Guest ordering/recovery | `components/order/GuestOrderWizard.tsx` | Device draft and account handoff |
| Signed-in ordering | `components/order/OrderWizard.tsx` | Private saved applications and payment |
| Custom popup | `components/order/CardEditorDialog.tsx`, `PhysicalCardControls.tsx` | Front/back editing canvas; no generated card preview elsewhere in checkout |
| Checkout review | `components/order/OrderSteps.tsx` | Digital profile preview or text-only Link Card review |
| Final design approval | `components/admin/DesignProofShare.tsx`, `components/orders/CustomerDesignProof.tsx` | Private admin proof sharing and customer response |
| Physical artwork | `lib/card-renderer.ts` | Same renderer for previews, PNG and PDF |
| Preset card designs | `lib/data/card-templates.json` | Colours, fonts, text placeholders and backgrounds |
| `/account` and `/account/orders` | `app/account/page.tsx`, `app/account/orders/page.tsx` | Sign-in, profiles and order history |
| `/admin` | `components/admin/AdminApp.tsx`, `OrdersView.tsx`, `PrintPackage.tsx` | Staff inbox and private print exports |
| `/u/…` public profiles | `components/ProfilePage.tsx`, `ProfileEditor.tsx` | Public profile and owner edits |
| Shared styling | `app/globals.css` | Colours, spacing, typography and layout rules |
| Header/footer | `components/Navbar.tsx`, `components/Footer.tsx` | Site navigation and footer |

The landing page order is the order of components inside `app/page.tsx`. Moving `<FAQ />` moves that section. Keep section IDs (`offer`, `solutions`, `how-to-order`, `faq`) intact so navigation links continue to work.

## 3. Change What we offer speed or size

Open `lib/data/motion.ts`:

```ts
export const OFFER_MOTION = {pixelsPerSecond:32,minScale:.86,maxScale:1};
```

- `pixelsPerSecond`: higher is faster. Try `36` for slightly faster or `26` for slower. Keep it positive.
- `minScale`: edge-card size. `.86` means 86% of its normal size; `.92` gives less shrinking.
- `maxScale`: centre-card size. Keep `1` unless you also allow more vertical space to prevent clipping.

The centre emphasis changes smoothly as each card moves. Hover pauses; touching/dragging or focusing gives the visitor control. Reduced-motion mode disables autoplay. Do not add pause/resume buttons or animate widths.

After changing speed, test on a phone-sized window and a desktop window. Watch a full loop for jumps. Hover to confirm it pauses. Use Tab to confirm links are reachable. Changing these values does not require a database migration.

## 4. Add or edit a What we offer feature card

Open `lib/data/content.ts` and find `solutions`. Each `{ … }` entry is one feature card. Copy one entry, give it a new unique `index`, then edit `tag`, `title`, `description` and `bullets`. Keep commas between entries.

```ts
{ index: "04", tag: "Your feature", title: "Your short heading",
  description: "Describe a feature EdgeTap actually provides.",
  bullets: ["Short point", "Another point"],
  icon: "businessCard", tone: "yellow" },
```

Supported tones are `yellow`, `coral`, `sky`, `mint`, `ink`. Existing doodle names include `businessCard`, `globe`, `review`, `attendance`, `menu`; only advertise services actually implemented/approved. The component makes its own loop copies—add the real entry once. Feature cards are marketing content; they are different from physical card templates.

## 5. Change or add a physical card design

Open `lib/data/card-templates.json`. It is JSON: use double quotes, commas between entries, and no trailing commas or comments. Each design has:

| Key | Meaning |
|---|---|
| `id` | Stable identifier, such as `simple`; do not rename an existing ID |
| `name`, `tagline`, `description` | Customer-facing labels |
| `version` | Artwork version; keep old versions for existing orders |
| `background`, `ink`, `accent` | Hex colours |
| `font` | Main name font; currently Georgia or Arial |
| `nameSlot`, `titleSlot` | Where editable name/title are drawn |
| `texture` | `plain` or the built-in `wood` pattern |
| `frontBackground`, `backBackground` | Optional first-party image paths |

Slot `x`/`y` run from 0 to 1 (`.5` is the centre); `width` is a fraction of card width; `size` is measured in mm. Keep text inside the printer safe area. Schema-2 designs allow QR opt-out and position selection. Old schema-1 snapshots keep their original layout.

Ask your designer for separate front/back backgrounds **without baked-in variable name/motto/QR**. Place them in `public/card-backgrounds/`, for example `lux-v2-front.png`, and reference `/card-backgrounds/lux-v2-front.png`. Never overwrite an approved asset filename: use a new version/name so existing proofs stay stable. Make sure new PNG assets are tracked by Git; screenshots are ignored, but card backgrounds must be committed.

For a new design, copy an entry, change its unique `id` and visible `name`, and set `version: 1`. For a redesign, **append** a new entry with the same ID and a higher version; retain the earlier entry. Add its ID to the explicit customer-gallery list in `lib/data/order.ts`. This list chooses the latest version of each listed design; old definitions remain available for old orders.

**Also register the exact definition in a new Supabase migration** before customers can submit it. The server intentionally rejects unknown versions. Follow the template example in [backendguide.md](backendguide.md). A colour/layout change is an artwork version change, not just a frontend label edit.

Customer presets have fixed layouts. The gallery uses the owner’s original screenshots; version-2 print layouts replace sample wording at runtime using fixed slots. Replace screenshot-based backgrounds with your designer’s clean, versioned originals when ready, especially the low-resolution honeycomb source. Do not put customer contact details or delivery addresses in the background files.

## 6. Change printed wording or QR settings

Customers select a preset, then enter a required **name or main heading** on the next page. Motto, photo, bio, handle and logo are optional as applicable. Link Card also has a Details page, separate from its private delivery recipient name. Preset layouts are fixed. Customize opens `CardEditorDialog.tsx`; the modal buffers changes until Save design, and Cancel/Escape discards them. Desktop shows both faces side by side; phones stack them. Admin can still adjust printed wording during review.

For new uploads, customers supply separate Front and Back artwork and choose Add a QR code on the back. Legacy standard-back orders stay supported. Inside the custom popup, Marked spot allows a tap or arrow-key positioning. Presets/uploads use back centre; placement changes can be requested in the order note and reviewed in the admin final proof. Profile-card QR is a placeholder until staff publishes the confirmed profile. The Link Card final proof uses its validated URL; staff confirms that URL before production. Admin checks existing QR images—turning QR off cannot erase pixels already in an upload.

Default export settings live in `lib/physical-card.ts` under `DEFAULT_PRINT_SETTINGS`. Admin can adjust them per proof in Print package → Printer settings. RGB is the supported output; do not relabel it CMYK. Setting `confirmed` true requires an actual printer agreement. Changing printer settings requires another saved/reviewed proof.

## 7. Text, colours, icons and links

- Landing wording: `lib/data/content.ts`. Keep headings short; longer explanations go into info popovers.
- Shared colours: search `:root` in `app/globals.css`. Change an existing colour token rather than adding unrelated colours to one section.
- Icon component: `components/ui/Icon.tsx`; existing licensed assets: `public/icons/streamline/`. Keep attribution on the landing page and preserve the license file.
- Profile URL/WhatsApp: `lib/site.ts`. Do not change the canonical domain or handles casually: printed NFC/QR cards depend on them.
- Prices, payment details or order stages need matching backend changes; see the backend guide. Editing visible text alone does not change the server price.

## 8. Verify before publishing

```sh
npm run typecheck
npm run lint
npm run build -- --webpack
npm run check:release
```

Check `/`, `/order`, `/account`, `/admin` and an actual public profile. Try a long name, blank title, upload with/without QR, narrow phone width and keyboard controls. A passing build does not prove payments, email, printing or NFC.

For full isolated browser tests, follow [backendguide.md](backendguide.md); never submit test orders into production. Hosting uses the generated `out/` folder, so `next start` is inappropriate. Deployment requires owner authorization and Firebase CLI login; run `npm run deploy:hosting` only for the reviewed export. Never upload `.env.local` or private cleanup backups.

If something breaks, read the terminal error and undo your last small edit. Typical causes: missing comma/quote in JSON, a renamed template ID, unregistered backend template version, or missing asset file. Do not delete the database or force dependency upgrades to fix a visual change.

## 9. New card offers and customizer

See [CARD_PRODUCTS.md](CARD_PRODUCTS.md) for current release state. `/pricing` has three main offers; the centre emphasis/hover and responsive stacking are in the final pricing block of `app/globals.css`. Enquiry rows sit underneath. Keep pricing and legal/landing wording consistent.

- `lib/data/order.ts`: `CARD_PRICES` and product types. Prices also need a **new server migration**, not just a text edit. Never edit an applied migration to change a price.
- `components/order/DirectLinkStep.tsx`: the six destination choices and URL field. `lib/nfc-link.ts` validates the normalized public URL and conservative NTAG215 budget. Adding a label/placeholder does not create a new product.
- `components/order/CardCustomizer.tsx`: colour pickers, gradients, text layers, fonts, sizes and horizontal/vertical sliders. Choose Front/Back, select a layer, edit it or Add text. Default layer names follow the profile/contact name until edited.
- `lib/physical-card.ts`: scene schema, fonts, defaults and limits. `lib/card-renderer.ts` draws preview and exports. Change both shared validation and server scene validation when adding a capability/font. Retain old versions.
- `components/order/PhysicalCardControls.tsx`: shared live preview and QR controls. `PhysicalCardPreview.tsx` supports tap/arrow-key QR positioning.
- `components/order/OrderSteps.tsx`: two artwork inputs, preset gallery and checkout review. `GuestOrderWizard.tsx` keeps both original Files and transfers them to distinct private paths.

Run `npm run test:card-products` for local domain/SQL validation; use the backend guide’s isolated fixture export for `npm run test:card-products:browser`. Neither command verifies a real chip or payment.

## 10. Drag, resize, rotate and colour controls

On **Customize your card**, select a text object on the card. Hold/drag to move it; drag ↔ to resize or ↻ to rotate; use the trash button to delete. **Add text** creates another layer. Front/back layers are separate. Open **Position and rotation** for exact sliders; arrows move selected text, +/− resize, [/] rotate and Delete removes. **Straighten text** sets its angle to zero. **Centre QR** puts the enabled QR back in the centre of the back. Neither action changes the URL.

Click a colour swatch to open the palette. Drag within the saturation/brightness area, move Hue, enter HEX/RGB or choose a suggested colour. Escape/Done closes it. Gradients still use two colour stops and an angle.

| File | Responsibility |
|---|---|
| `components/order/PhysicalCardPreview.tsx` | Selection, pointer capture, drag/resize/rotate handles and keyboard controls |
| `components/order/CardCustomizer.tsx` | Text/colour settings and precise placement controls |
| `components/order/ColourPicker.tsx` | Accessible colour dialog and HSV/RGB/HEX inputs |
| `lib/card-editor.ts` | Shared coordinate mapping, rotation and safe-area geometry |
| `lib/colour.ts` | Colour conversions |
| `lib/card-renderer.ts` | Draws actual text rotation for preview and exports |
| `lib/application.ts` | Private contact mapping and backend capability guard |
| `supabase/migrations/202610160013_card_text_rotation.sql` | Prepared server validation and editor capability; not applied |

`npm run test:card-editor` checks local geometry, colours, name recovery and SQL. Use the backend guide’s isolated fixture setup for `npm run test:card-editor:browser`. Runtime buttons/selection outlines belong only to the preview; do not add them to the print renderer.

## 13. Card gallery, logos and hero links (16 October)

- Gallery order: Customize (`maincard.png`), Black photography, Blue studio, Botanical, Honeycomb, Upload a design, then a textual designer contact. The explicit selection list is `CARD_TEMPLATES` in `lib/data/order.ts`.
- Original preview files are in `public/card-designs/`; owner sources remain in `assets/edgetapcard/`. Their PNG exceptions in `.gitignore` must stay. Do not replace historical print backgrounds.
- The designer URL is `DESIGNER_URL` in `lib/site.ts`. It is intentionally `null` until the owner supplies the real URL; the contact button is disabled meanwhile.
- `components/order/CardEditorDialog.tsx` owns modal state/focus/scroll. `PhysicalCardControls.tsx` draws both sides and `CardCustomizer.tsx` edits the selected face. Keep nested colour/help Escape events from closing the parent editor.
- The optional logo is separate from the portrait. The device draft keeps the file locally, then account saving uploads to the existing **public avatars bucket**; the UI discloses this. `physical.logoUrl` is reused by print rendering and copied to the public profile only on guarded publication. Admin proofs show the additive logo; staff checks placement.
- `components/EdgeTapCard.tsx` displays the actual `maincard.png`, shared by Hero and How It Works. The selected-card summary is text-only; gallery thumbnails remain.
- Five hero chips in `components/Hero.tsx` link to the existing founder Instagram, WhatsApp, LinkedIn, portfolio and `/u/ibraheem`. Only those anchors receive mouse attraction; touch and reduced-motion preferences disable it. Change destinations in `lib/data/profile.ts`, not in multiple components.
- To verify locally: `npm run test:card-gallery` (SQL), and `QA_BASE_URL=http://127.0.0.1:4173 npm run test:card-gallery:browser` against the isolated fixture export from the backend guide.

## 14. Hero doodles disappearing as the window shrinks

`components/Hero.tsx` contains the five clickable chips and their destinations; `app/globals.css` has the final **Hero doodles** media rules. The field stays in its desktop position and hides progressively. There is no mobile doodle strip.

| Window width | Visible link doodles |
|---|---:|
| 1400 px and up | 5 |
| 1200–1399 | 4 |
| 1100–1199 | 3 |
| 1000–1099 | 2 |
| 900–999 | 1 |
| Below 900 | 0 |

To change when a chip disappears, edit its `max-width` rule and matching `[data-hero-link="…"]` label. Decorative SVGs thin out at the same breakpoints; the whole field is hidden below 768 px. Keep the main headline, real card artwork and order button visible. Test by slowly narrowing the browser, then widening it again; chips should disappear without stacking below the hero or causing horizontal overflow.

## 15. Checkout and final proof

Physical previews now live only in the explicit custom editor and staff final-proof tools. Keep preset/upload checkout text-only; do not reintroduce the old Card/Profile tabs in `PreviewStep`. `SelectedCard.tsx` is a text summary. Digital-profile preview remains for profile orders.

`DesignProofShare.tsx` creates a private review link/message. `CustomerDesignProof.tsx` shows the shared files and collects approval or all changes in one note. `PrivateFile.tsx` uses authenticated downloads. `lib/site.ts` allows a validated order ID through sign-in, without allowing arbitrary redirects. Client buttons are convenience only; migration 015 enforces owner/staff identity, current revision/version, payment and revision allowance on the server.

Never reset `includedDesignEditUsed` when saving another proof. Additional preference edits need a manually verified, agreed payment recorded by staff; do not set a fee by changing display text. Existing orders keep legacy terms. See [backend guide](backendguide.md#13-private-account-proof-and-revision-policy-015-localunapplied) and [admin guide](adminguide.md).

Checks: `npm run test:design-review` is local SQL. For `npm run test:design-review:browser`, use the isolated fixture export described in the backend guide, never a production-configured export. It covers checkout, actual rendered private proofs, sign-in return, included/paid requests, approval and responsive hero hiding.
