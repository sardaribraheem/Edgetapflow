> **Historical snapshot archived 15 October 2026.** Source: `finalplanoflaunchandapp.md` before this launch audit. Superseded status/commands below are evidence of their original run, not current instructions or authorization. Read [current launch status](../LAUNCH_STATUS.md). Unique original content is retained; relative links were rebased for this archive.

# EdgeTap — Final Launch and Companion App Plan

**Prepared:** 14 October 2026, Pakistan time. **Status:** plan for owner review; app implementation is awaiting explicit approval.

This combines the [complete business reference](EdgeTap_Complete_Business_Reference_before_launch_audit.md), the owner's direct answers, the additional “Understand, Plan, Confirm Before Building” brief, inspection of `EdgetapFlow`, and official platform documentation. Creating this requested document authorizes documentation only. It does not authorize app scaffolding, dependency installation, migrations, service changes, purchases or deployment.

## 1. Agreed direction

- EdgeTap: **“One tap. Infinite possibilities.”** The editable digital profile is the core product; the physical card and app provide ways to share it.
- Preserve the existing website and canonical profile URLs. Create a separate mobile app with familiar EdgeTap branding and a native interface.
- **Android first, iPhone later.** Recipients must be able to open the existing web profile without installing EdgeTap or signing in.
- The app is for **everyone**: new users can register and create a digital profile without buying a physical card; existing customers use their existing account and profiles. Physical cards can be requested later through the app.
- Users can switch profiles, choose a default, edit public details, preview and share. Additional-profile pricing and limits remain undecided.
- Phone-to-phone NFC is the defining feature to investigate. QR, link sharing and a styled contact PDF are the fallback methods.
- The owner's specific definition of Connections is a tap followed by an actual profile opening. This means recorded opening activity; it does not establish the visitor's identity or a unique person count. It can be deferred if it delays the core app.
- Business launch starts small, managed personally. Printer/NFC suppliers are still being compared.

## 2. What exists today

### Inspected architecture

| Area | Current implementation and evidence |
|---|---|
| Website | Next.js 16.3.8, React 19.2.8, TypeScript, Tailwind and GSAP; static export in `out/`; Firebase Hosting configuration serves the export |
| Backend | Supabase Auth, Postgres/RLS/RPCs and Storage. `lib/backend.ts` and sanitized configuration inspection select Supabase. Firebase data adapters remain explicitly selected legacy code |
| Authentication | Email/password signup, sign-in, sign-out and password recovery in `lib/auth.ts`; signup without a session correctly waits for confirmation |
| Public profiles | `/u/<handle>` loads an active profile through `get_public_profile`; Hosting rewrites customer handles to the static profile shell; missing handles do not resolve to the founder |
| Ownership/editing | `get_my_profiles`, `can_edit_profile`, `update_profile`; owner edits cover name, title, bio, location, photo and up to ten links. Handles/owners/publication are protected; supplied versions guard stale saves |
| Multiple profiles | Ownership tables permit several profiles for a customer, and the listing RPC returns an array. A customer-facing standalone profile-creation flow, profile quota and default-profile preference are absent |
| Publication | Customer profiles currently come from accepted, paid, staff-published orders. There is a separate staff founder operation; no inspected customer RPC creates a standalone digital profile |
| Ordering | Guest/device drafts, account saving, physical/digital previews, preset or uploaded faces, printed wording, QR positioning/opt-out, delivery/pickup, private JazzCash receipt, review and guarded fulfillment |
| Existing-profile card orders | `ApplicationPayload` carries a `profileDraft`, rather than a selectable existing profile ID. The existing publication transaction creates a new profile. Ordering another card for an existing profile needs a new guarded association path |
| Files | Public avatars; private artwork, receipts and print packages with authenticated access. Browser `File`/`Blob` adapters need mobile equivalents |
| Contact export | Styled PDF with photo and clickable links. `lib/contact-pdf.ts` uses DOM/canvas/fonts; its browser rendering cannot be imported unchanged into native screens |
| Print export | Admin front/back proof, printer brief, two-page physical-size RGB PDF and HD PNGs. Canvas rendering and final-print preparation remain in the website/admin workflow |
| Proof email | Queue, reply review and protected transport-confirmation hook exist. A working sender/worker and real delivery are not established; queueing does not start the ten-hour review window |
| App/analytics | No mobile project, phone-to-phone NFC implementation, opening counter or recent-activity service was found |

### Verification limits

The latest recorded website release is Hosting version `625185c493bec4f8` at `https://edgetapflow.web.app`. Its build/export guard, 449 Hosting-preview responsive/navigation checks, 33 read-only hosted boundaries and live public card/profile/routing checks passed in this conversation. Migrations through 011 were applied in that earlier authorized release. See [release evidence](CLOUD_HANDOFF.md).

Local account/order/private-storage/proof-email workflows used simulations. Actual PDF/PNG output and QR decoding were tested. A real ordinary-customer signup/upload/payment/proof/printed-card/NFC journey remains unverified. Inspection for this plan read source, schema and documentation and checked configuration presence without exposing values; it did not rerun production transactions or physical tests. The repository has existing uncommitted work that must be preserved.

### Business-reference differences to resolve

| Business reference | Current project/recorded decision | Treatment |
|---|---|---|
| Backend migration described as discussed | Supabase selected; migrations and website release recorded | Keep the historical account, but use inspected architecture for the app |
| Domain unresolved | `https://edgetapflow.web.app` is the canonical origin | Preserve it; brand/trademark clearance is still separate |
| Multiple payment methods | Standard checkout supports JazzCash only | Do not enable other methods without owner confirmation |
| Pickup Monday–Sunday | Current copy says NASTP Delta 3, Monday–Friday, 9 am–5 pm | Owner must confirm the intended hours before any copy change |
| Admin email described as non-public | `lib/site.ts` also uses it as the approved public contact | Owner must decide whether to use a separate public address |
| Dimensions/material still to choose | Current offer uses PVC NFC, 85.60 × 53.98 mm | Supplier must validate the product and print requirements; changing the offer needs a deliberate review |

Historical supplier quotes, listing prices and designer fees are context, not current offers or confirmed costs. Founder/demo links must never populate another customer's profile.

## 3. Business launch plan

### Launch gates

1. **Compare suppliers and approve a sample.** Request comparable quotes for a sample and small batches. Confirm blank/NFC model, print/packaging costs, minimum quantity, actual turnaround, defect handling, bleed, safe area and front/back orientation. Existing exports are RGB; confirm acceptance or an agreed verified conversion if the printer needs CMYK/PDF-X. Inspect print and scan/tap the sample on representative phones.
2. **Establish real email.** Verify ordinary-customer registration/confirmation and password recovery. Establish the private proof sender, delivery confirmation and monitored reply mailbox. Auth emails and order proofs are separate. Do not bypass proof guards or treat a queued job as sent.
3. **Confirm customer terms.** Resolve pickup hours, delivery coverage, cancellation before production, damage/defect handling, hosting/update wording and data retention. Review the existing personalized-card and ten-hour review policy appropriately; this plan does not establish a legal exemption.
4. **Prove one consenting real order.** With separate owner authorization, verify account access, private uploads/downloads, actual funds, accepted specification, correct profile, received/replied proof, printing, NFC/QR QA and handoff. Record actual evidence and costs.
5. **Begin a few personally managed orders.** Intake stays within demonstrated capacity. Use the founder card and real demonstrations, record feedback and defects, and expand only when the process and margin are reliable.

Website publication is complete; the gates above establish commercial production readiness. Supplier work and first-customer fulfillment should progress while the app is planned. App development must not become a prerequisite for selling the existing physical product.

### Initial offer and money

- Standard card: **Rs. 999 per card**, one profile shared by the cards in an order. Separate people/profiles need separate orders for now.
- JazzCash only in the current standard checkout; manually verify actual funds. A receipt never proves payment.
- Delivery is extra, with the customer paying the actually booked rider directly. No invented fare, coverage or dispatch promise.
- Standard profile hosting/updates have no separate fee for now; no lifetime/unlimited promise. App or extra-profile monetization is still undecided.
- Graphic-designer consultation and custom/bulk work need a scope and quote. Keep the existing website/portfolio offer contact-only, with its already agreed terms; do not add it to native checkout without separate planning.

**Contribution per card = Rs. 999 − blank/NFC − printing − packaging − payment costs − expected defect/reprint costs.** Deduct monthly operating costs, marketing, applicable taxes and time before calling the remainder profit. Historical Rs. 350 blank + Rs. 150 printing would leave Rs. 499 before other costs; those quotes need refreshing.

Track inquiries, real paid orders, cards/quantity, revenue, costs, proof revisions, production/QA time, defects, handoffs and support. Do not count compliments, profile views or unpaid leads as sales.

### Standard operating sequence

`Review → verify actual payment → accept specification → publish or bind the correct profile → save proof → confirm real sending/review → printer package → print → program NFC → physical QR/NFC/spelling QA → pickup/rider → confirm handoff`

Use [admin guide](../adminguide.md) for buttons and [business guide](../businessguide.md) for supplier/cost worksheets. Printer messages, rider bookings and stage updates remain manual and truthful.

## 4. Recommended app architecture

**Recommendation, awaiting approval: React Native + TypeScript, using Expo development builds and a local Kotlin NFC module.** This fits the existing React/TypeScript team/code and leaves an iPhone path. Kotlin provides Android-specific NFC handling. Expo development builds permit custom native code; Expo Go cannot host our custom NFC service. This is the recommended approach, not an installed or proven implementation. [Expo native-code documentation](https://docs.expo.dev/workflow/customizing/)

Flutter is viable but would introduce a second application language and require a similar native NFC investigation. A Kotlin-only app gives direct Android control but leaves more separate UI work for iPhone. The inspected stack favors React Native; no framework alone guarantees tap compatibility.

| Layer | Proposed responsibility |
|---|---|
| Native screens | Navigation, profile editor/preview, sharing, native card ordering and order status |
| Portable domain code | Profile/link types, safe URLs, physical-card model, template JSON, price/validation contracts and canonical profile URL logic; separate these from browser APIs before sharing |
| Mobile adapters | Supabase client/session storage, auth callbacks, file uploads/downloads, PDF, gallery/file picking and native OS sharing |
| Android NFC module | Capability/adapter checks, active sharing session, compatible URL-card emulation and lifecycle handling |
| Existing Supabase | Same identities, profiles, owners, orders, files and protected RPCs; additive changes described below |
| Existing website | Public receiver profiles and admin production; narrowly scoped shared-data/activity additions where approved |

Suggested future folder: `edgetapStuff/EdgeTapApp`, beside `EdgetapFlow`. It has not been created. Share only small portable modules when practical; preserve the website build and avoid an unnecessary repository/monorepo rewrite.

### Authentication and synchronization

- Sign in to the **same Supabase project** with the same account. Mobile and browser maintain separate sessions for that identity.
- Implement persistent native session storage, foreground token refresh and signup/recovery callbacks. Keep existing web callbacks working; allowlist the app's own redirects when approved. [Supabase React Native Auth](https://supabase.com/docs/guides/auth/quickstarts/react-native), [mobile auth callbacks](https://supabase.com/docs/guides/auth/native-mobile-deep-linking)
- Fetch owned profiles after sign-in, refresh after saves and when returning to the app. Keep Postgres as the source of truth; always send profile versions and show a reload/merge choice for stale edits.
- A default-profile preference must be owned and validated against the user's profiles. If only one profile exists, select it; otherwise ask the user which to make default.
- Cache public profile/QR data for sharing continuity; stage unsaved edits locally. Saving/publishing and recipient web loading require connectivity. Failed analytics must not block ordinary sharing.
- Clear private caches on sign-out/account change. Native uploads need byte/file adapters rather than browser inputs. [Supabase upload examples](https://supabase.com/docs/reference/javascript/storage-from-upload)
- Bundle only public configuration; never include service-role keys, SMTP credentials, staff tokens or private customer data in reports/logs.

## 5. User journeys

| User | Journey |
|---|---|
| New digital user | Install → sign up/confirm as required → create digital profile → review public fields → Save & publish under the agreed publication policy → share by supported NFC/QR/link/PDF → request a physical card whenever wanted |
| Existing customer | Sign in → owned published profiles appear → select default → edit/save or share → request another physical card for an owned profile → follow existing order status |
| Recipient without app | Receive compatible NFC link or scan QR → open the active web profile → use links or download the contact PDF; no installation/login requirement |
| Physical-card buyer | Select an owned profile or create one → choose design/quantity → customize printed wording or upload faces → preview physical card and selected digital profile → choose pickup/delivery → private receipt → submit → staff review and manual production |

Physical ordering must not silently create a duplicate profile or overwrite a selected profile. Later digital edits update the destination's content, not approved printed wording. Switching the app's selected/default profile does not reprogram an existing card or redirect its QR.

## 6. Screens and UX

Proposed bottom navigation: **Home · Share · Activity · Profile**. This is a recommendation for review. If opening tracking is deferred, omit Activity initially rather than display invented numbers.

| Screen | Key responsibilities |
|---|---|
| Sign-in/signup/recovery | Familiar email/password; confirmation and recovery states; no marketing landing page |
| Home | Selected identity and compact profile preview, profile switcher, default marker, prominent Share action, edit pencil; new-user Create profile action |
| Profile manager | List owned profiles, select default, create another under agreed limits; keep profile IDs/handles distinct from display names |
| Create/edit profile | Reuse current public fields and link choices, optional photo/title/bio/location, generic avatar; preview before Save & publish; retain edits on errors |
| Share | Selected name/photo, real NFC availability/session state, prominent QR, Share link/Copy link/Share PDF; large QR mode; quick fallback without extra setup |
| Activity | Recorded successful app-sharing openings by profile and method/time, with an honest definition; optional phase |
| Profile/account tab | Manage profiles, account/support/privacy settings, physical-card requests, My orders and account-deletion request |
| Card request | Existing-profile selection, presets/uploads, printed name/motto, front/back/QR controls, physical and digital previews, fulfillment and private payment submission |
| My orders/detail | Actual accepted/changes/payment/proof/production/pickup/rider states and customer messages; no fake delivery or email confirmations |

Retain cream, navy/ink and restrained accents, with existing brand assets and licensed fonts/icons adapted for native use. Favor whitespace, short labels and accessible icons. Supporting explanations belong behind info controls; required decisions, errors and real status stay visible. Keep profile editing separate from sharing and order editing. PDFs show only intentionally public profile fields, photo and clickable links, never receipts or delivery addresses.

PDF is the agreed default. An optional native-contact/vCard path can be evaluated later; a PDF download is not proof that a contact was added to a phone's address book. Do not replace the current website's PDF behavior automatically.

## 7. NFC feasibility and fallback

### Android sender: prototype before committing

Android exposes HCE with `HostApduService` and an HCE capability flag. Proposed experiment: implement a compatible NDEF URL card using a native service so a recipient's normal NFC reader can open the selected public profile. **This is an engineering hypothesis requiring device proof**, not a generic feature of NFC libraries. It must work without a recipient EdgeTap app. Use a non-payment category; availability, unlock/screen state and foreground behavior vary. [Android HCE](https://developer.android.com/develop/connectivity/nfc/hce)

Declare NFC access, check adapter/HCE support and enabled state, and keep NFC optional so non-NFC phones can still use the app. Test while the sender is unlocked on Share; stop exposing the selected URL when sharing ends. Never claim background sharing without evidence. [Android NFC basics](https://developer.android.com/develop/connectivity/nfc/nfc)

Do not base this on Android Beam, which was deprecated. [Android Beam status](https://developer.android.com/about/versions/10/behavior-changes-all#android-beam)

### Recipients and later iPhone sender

| Pair | Planning assessment |
|---|---|
| Supported Android sender → Android recipient | Candidate; prototype must prove normal OS URL handling with EdgeTap uninstalled on recipient |
| Supported Android sender → iPhone recipient | Candidate; iPhones supporting background NDEF URL reading can open web links, but the emulated-card interaction still needs real-device proof |
| Android without NFC/HCE | QR/link/PDF sharing remains available |
| iPhone sender → another phone | No launch promise. Apple's card-emulation paths require eligibility/entitlements and approved uses/markets; the NFC & SE list currently does not include Pakistan |

Supporting documentation: [Apple background reading](https://developer.apple.com/documentation/corenfc/adding-support-for-background-tag-reading?language=objc), [Apple HCE](https://developer.apple.com/documentation/corenfc/cardsession), [Apple NFC & SE eligibility](https://developer.apple.com/support/nfc-se-platform/). Reading a URL tag on iPhone and acting as a URL tag from iPhone are different capabilities.

Receiving may require tapping an OS notification and unlocking. Android URL-dispatch behavior has changed across OS versions; test the actual supported releases. Do not promise that touching phones instantly opens a browser. [Android URL dispatch](https://developer.android.com/develop/connectivity/nfc/nfc)

### Practical sharing behavior

1. Choose profile and open Share; show QR immediately.
2. Enable the genuine NFC session on compatible sender devices with a short antenna-position hint.
3. If unavailable, disabled, timed out or unreliable, use the already visible QR; also offer copy/share URL and PDF.
4. Sending NFC data does not prove the browser loaded. Only show a confirmed opening when an actual opening signal exists; otherwise report just the transfer/session state.

### Prototype acceptance

- Test real Android senders from representative manufacturers and Android/iPhone recipients without EdgeTap installed. Record exact models, OS versions, NFC state and antenna placement; no simulator-only sign-off.
- Repeat transfers, switch between two profiles and confirm the correct destination each time; never leak the previously selected profile.
- Cover NFC disabled, missing HCE, lock/unlock, app backgrounding/sign-out, cases, reader errors and offline recipient behavior. Check that payment/wallet behavior is not misrepresented or changed.
- Confirm QR with ordinary phone cameras and share the actual PDF through native share UI.
- Record successes/failures and instructions. If NFC is insufficiently reliable, return to the owner to decide between a QR-first release or holding the app; do not silently redefine the defining feature.

## 8. Connections and recent activity

**Primary proposal: count recorded successful app-NFC sharing sessions that lead to a profile opening.** Show QR/link activity separately. This follows the owner's direct clarification; an identified contacts network is optional future scope.

An approved tracking implementation would issue an opaque, short-lived share token bound to the owner, active profile and method. The shared HTTPS URL retains `/u/handle`, with that non-authentication marker. After the web page successfully renders the matching active profile, it submits an opening receipt. The backend validates the token and expiry and deduplicates retries. The app can show the count and a recent list containing profile, time and method.

One receipt per session avoids duplicate inflation but can undercount if a session is reused for several recipients; session renewal needs to be designed and tested. Forwarded links and client reports cannot prove a physical tap or distinct human. Label the measure **recorded opens**, with an info explanation, rather than claim an exact count of unique people. Share-button taps, failed loads and NFC exchanges without a loaded page do not count as confirmed opens.

The fixed physical-card NFC/QR URLs currently point to the same destination, so plain visits cannot reliably distinguish those sources. Do not claim this optional app metric also measures every physical-card tap.

Use bounded event fields and retention, no visitor identity, precise location, contact harvesting or device fingerprinting. Only the owner/staff may read appropriate activity; event submission must have token validation, rate/size limits and replay handling. Failure to record an event leaves sharing functional. These are proposed controls, not implemented analytics.

If identifying people becomes desirable, add a separate, explicit recipient action to voluntarily share details back. A Save Contact/PDF click is only a recorded action, not proof of saving in an address book. Keep this outside the first scope unless requested. If tracking becomes disproportionate, defer Activity and retain the core sharing app.

## 9. Backend impact and safeguards

| Reuse | Add/change after approval |
|---|---|
| Supabase Auth and existing accounts | Native redirects/session adapter; verify ordinary signup/recovery delivery |
| Customers, profiles, owners, links, handle reservations | Transactional customer-owned digital-profile creation independent of physical payment; ensure customer row, reserve handle, enforce verified identity/limits and assign ownership |
| Published profile listing/edit RPCs | Default-profile preference; any draft/listing extension explicitly scoped, since current listing/editing operates on active profiles |
| Profile versions and safe links | Version-aware native saves; server validation remains authoritative |
| Orders/applications and payment/storage RPCs | Optional existing-profile selection with server ownership checks; immutable profile-data snapshot for the physical order |
| Profile publication transaction | Separate accepted/paid order-to-existing-profile binding that validates ownership, active handle and stale versions; preserve the old new-profile order path |
| Private artwork/receipt/print buckets | Native byte upload/download adapters with current paths, limits and JWT access; no public receipt URLs |
| Public profile renderer | Optional share-opening receipt after successful render |
| Existing admin workflow | Distinguish digital-created profiles from physical orders; retain acceptance, actual payment, specification, proof and production guards |
| No current activity service | Optional private share-session/event storage, bounded receipt endpoint and owner activity RPC |
| No inspected deletion flow | Account-deletion request and protected operator/service handling; define retention and what happens to printed links |

New digital-profile publication must be a distinct authorized action. Never remove paid-order guards to make digital signup work. Likewise, a digital profile existing does not establish that a physical card has been paid, approved, printed or checked.

Make additive migrations, test them in an isolated environment, and separately authorize applying them to the shared production backend. Old accounts, handles, legacy orders and printing snapshots must remain intact. Do not rename published handles or reuse deleted handles without an approved redirect/retention design.

### App distribution and monetization

Because users can create accounts, Google Play requires deletion initiation in the app and an external web resource. The later iPhone release needs an in-app deletion path too. Account deletion must be designed around existing restrictive foreign keys and legitimately retained order records; neither silent cascade deletion nor mere deactivation is a sufficient plan. [Google User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en), [Apple review guidelines](https://developer.apple.com/app-store/review/guidelines/)

Review privacy/Data safety disclosures, retention, public-profile reporting/moderation and support before store release. Public self-service creation changes abuse exposure. Use narrowly scoped owner tools and a workable review/reporting process. This is release work, not an invented social-network feature.

Physical-card purchases and paid extra digital profiles are different product categories under store payment policies. Reuse manual physical-card payment safeguards, but evaluate the actual bundle and store/region rules before introducing digital subscriptions or upgrades. Do not assume JazzCash checkout is permitted for every in-app digital purchase. No new pricing or billing is authorized. [Google payment policy](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en), [Google policy explanation](https://support.google.com/googleplay/android-developer/answer/10281818?hl=en), [Apple payments guidance](https://developer.apple.com/app-store/review/guidelines/#business)

## 10. Implementation phases and acceptance

Every phase below is future work. Approval of this document must explicitly identify the scope to start. Production backend changes and store/Hosting publication still need their corresponding authorization.

| Phase | Deliverable | Acceptance before proceeding |
|---|---|---|
| A — Business launch | Supplier sample, real email/proof process, clear terms and a small fulfilled pilot | Actual funds/private-file/customer proof/physical NFC/QR/handoff evidence and recorded costs; no fake production stages |
| B — NFC feasibility | Small Android native prototype against real recipient phones using an existing public/demo profile | Repeatable app-free receipt and correct URL; documented unsupported cases/fallback; owner reviews evidence before the full app commitment |
| C — Data design | Standalone digital creation, defaults and existing-profile card-order contracts/migrations in isolation | Ownership/collision/concurrency/quota/version/security tests and legacy regression checks; no applied production migration without authorization |
| D — Native core | Auth, new/existing user journeys, profile switch/create/edit/preview, QR/link/PDF | Same-account ownership works; saves appear on web/app after refresh; correct profile shared; errors preserve work; ordinary recovery tested |
| E — Supported NFC | Integrate proven native service and truthful session/fallback states | Real-device matrix, lifecycle/wallet/disabled cases, wrong-profile regression and no recipient install requirement |
| F — Native physical orders | Design/uploads/preview/fulfillment/private payment/submit/order status for owned profiles | Reuses existing backend rules; no duplicate profile; no premature payment/production; order retry and existing print pipeline pass |
| G — Optional activity | Recorded opens and recent activity | Real page-load receipt, failure/replay/dedup/source tests, private reads; omit if it delays core reliability |
| H — Android pilot/release | Signed internal test build, customer trials, privacy/deletion/support and release checklist | Ordinary new and existing customer journeys on real devices; accessibility/file/security checks; owner approves publishing |
| I — iPhone | Adapt native core and reassess sender NFC separately | iPhone auth/QR/link/PDF/order/deletion tests; no unproven NFC parity claims; separate owner release approval |

Use gate-based milestones rather than invented completion dates. Local SQL/browser fixtures remain useful for regressions, but successful real Auth, existing private files, delivered email and physical devices require separate evidence. Website typecheck/lint/build, profile rewrites, owner isolation and old checkout must keep passing when shared contracts or backend behavior change. Keep fixtures off production and preserve existing uncommitted work on a dedicated implementation branch.

## 11. Expected files and systems to change later

Paths are relative to `edgetapStuff`. This table identifies work; none of these proposed app files have been created.

| Path/system | Expected purpose |
|---|---|
| `EdgeTapApp/package.json`, app configuration and native config plugin | Approved framework/dependencies, app identity/navigation, permissions and callbacks; exact SDK chosen at implementation time |
| `EdgeTapApp/src/screens/` | Auth, Home, Share, Profile manager/editor, card request, My orders and optional Activity |
| `EdgeTapApp/src/services/` | Mobile Supabase, profile/order APIs, session/file adapters, PDF and share-session API |
| `EdgeTapApp/modules/edgetap-nfc/` | Kotlin HCE service/module and Android service resources; native capabilities kept outside browser code |
| `EdgeTapApp/src/theme/`, assets and tests | Native brand tokens/fonts/icons, accessible components and device/integration checks |
| Small portable domain package, location to approve | Selected types/validators/template definitions and canonical URL contracts; no forced website restructuring |
| `EdgetapFlow/supabase/migrations/` | New additive profile/default/order-binding/deletion and optional activity migrations; do not rewrite already applied migrations |
| `EdgetapFlow/lib/data-service.ts`, `lib/application.ts` | Approved RPC contracts, existing-profile card payloads and consistent ownership/validation |
| `EdgetapFlow/components/order/`, account/admin screens | Existing-profile selection and relevant shared-data changes; preserve marketing pages |
| `EdgetapFlow/components/ProfileRoute.tsx` / `ProfilePage.tsx` | Optional verified-render opening receipt; existing public view/PDF remains functional |
| `EdgetapFlow/app/` and Hosting assets | Narrow external account-deletion/auth-link resource if needed; no landing-page migration |
| `EdgetapFlow/scripts/`, docs and Supabase Auth settings | New meaningful regressions/operating instructions and approved native redirect entries |
| Store/developer accounts and real email transport | Owner-controlled future setup, permissions, costs and release evidence; no account purchase or service change now |

## 12. Open decisions and approval

Important decisions before the relevant implementation phase:

1. **Digital publication:** after verified signup and valid public details, should a new profile publish immediately, or require staff approval? Recommended proposal: self-service publication with reporting/abuse controls, while physical orders retain staff review.
2. **NFC test access:** which Android sender models and Android/iPhone recipient devices can the owner provide? Approve a feasibility prototype before committing to supported-device claims. If it fails, decide whether to release QR-first or wait.
3. **Usage limits:** agree the initial digital entitlement and practical profile cap before implementing creation. Additional-profile pricing can remain deferred, as requested; do not advertise unlimited/free-forever access.
4. **Business consistency:** confirm pickup days, approved payment methods and public contact email; separately finalize supplier costs, fulfillment coverage and cancellation/defect/retention terms.
5. **Optional Activity:** include the small recorded-opens feature after core sharing, or omit it from the first release? The owner has already authorized deferring it if disproportionate.

Risks to track: phone-model NFC differences, SMTP/proof delivery, standalone-profile abuse, duplicate profiles on card orders, stale cross-client edits, private-file exposure, future digital billing rules, deletion/printed-link consequences, supplier quality/margin and scope growth. Each belongs to a stated test or owner decision above; none is resolved just by producing this plan.

**Requested approval:** approve or revise this plan, then explicitly name the first phase to start. Suggested starting point for app work is **Phase B, NFC feasibility only**. Creating this Markdown does not start that prototype or the full app.
