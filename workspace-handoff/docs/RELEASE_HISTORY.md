# EdgeTap release history

Consolidated 18 October 2026 from release/audit/implementation reports. [Launch status](LAUNCH_STATUS.md) is the current authority. Counts below describe checks run at release time, not a new test run or proof of complete customer fulfillment.

| Date/time (Pakistan) | Firebase Hosting version | Scope |
|---|---|---|
| 30 Oct | **`d94632fc5fe1f7e4`** | Detailed hardware catalog/checkout, resilient prices, admin/backups, business sections and inactive annual/trial foundations; exact 028–032, existing records/app contracts preserved |
| 27 Oct, 00:52:10 | **`6f8c18e26f9a80c5`** | Collapsible admin orders, application decisions, account cleanup; exact 027 and owner-requested Umer separation, no mail/deletion |
| 26 Oct, 8:32:34 am | **`cabbc34a2b3f0358`** | Free website profiles, direct staff/tag workflow, reference payments and moderation; exact 024–026 plus Hosting |
| 25 Oct, 10:50:53 am | **`39b6167934063bc3`** | Staff pricing catalog, confirmed customer/founder saves, side-menu editing and canonical pre-print publication; exact 022/023 plus Hosting |
| 18 Oct, 9:01:06 pm | **`f5c31e156838a13f`** | Latest UI/navbar/story/doodles and stable search favicon refinement; Hosting only |
| 18 Oct, 8:28:35 pm | `d9033a5eb49c54dd` | Checkout/UI/feedback/admin print release after explicit approval of 017/018 and frontend |
| 17 Oct, 9:15:27 am | `e2af92ed956b5fcd` | Preferred-origin SEO, sitemap/social metadata/noindex/legacy-route compatibility; Hosting only |
| 16 Oct, 12:50:10 pm | `ae83d57dca84c205` | Card products/editor/public logos/private proof after approved 012–015 |
| 14 Oct, 10:14 pm | `e4635533ce44dcb1` | Previous verified baseline |

## 30 October: detailed pricing and supported website milestones

Released **30 October 2026** under the owner’s explicit publication request. Hosting **`d94632fc5fe1f7e4`** at **https://edgetap.tech**; exact migrations **028–032** applied after the prior history. Optional **016 remains unapplied**; existing **019 app function definitions and all guarded existing records were preserved**. Source branch `codex/product-pricing-milestones-2026-10-30` includes feature commits `6866d0c` and `6b10d86`. Future-cohort trials and annual purchases remain **disabled**, existing free profiles/terms are preserved, and email transport remains inactive. See [full release evidence](PRODUCT_CATALOG_RELEASE_2026-10-30.md).

The database transaction preserved fingerprints for 72 existing tables and all three 019 function definitions. New customer entitlement/business-section tables start empty; no old order was assigned a new quote. The shared avatars cap remains 5 MiB; original physical-card logo bytes remain intact. New standalone portraits/logos are compressed. Verification: 144 local browser assertions; SQL/security/ZIP/encryption/image suites; TypeScript, lint with 18 existing warnings; production build and 119 static checks/154 public text assets. Hosted SQL verifier and 55 anonymous read-only checks passed, plus real mobile/public-price checks. Authentication, private-byte transport, payments and physical handoff remain separately evidenced.

## 27 October: account separation and clearer admin order controls

Hosting **`6f8c18e26f9a80c5`**, **27 October 2026 at 00:52:10 Pakistan time**. Website implementation `6ceccc0` pushed to `codex/admin-profile-order-controls-2026-10-27`. Exactly **027** applied and registered after 026, with 016 still unapplied and existing app 019 definitions preserved. See the [account/admin update](PROFILE_ACCOUNT_ADMIN_2026-10-27.md) for behavior, authorization and remaining approval boundaries.

The owner's clarification kept Tarsil's login and separated both hidden Umer profiles plus the one Umer order into staff management. All six profiles/four orders remain; no new Auth account, permanent deletion, rejection, email or contact message. A private ignored snapshot preceded the atomic transaction. Guards compared 21 relevant tables, Auth and app-function hashes, protecting Tarsil's exact current fields/links/account/order/contact, all payments/prices/files and unrelated records. Copied login email was cleared only from the moved Umer contact; pending Umer mail jobs were superseded without sending. Read-only hosted owner-access verification confirmed Tarsil's own profile/order remained accessible and Umer's records were no longer accessible from that login. Email remains disabled.

Verification: production/fixture builds; TypeScript; lint zero errors/18 existing warnings; full legacy SQL suite; 16 free-profile, 17 pricing and 17 new account/admin SQL groups; 28 existing and 26 new isolated browser assertions. The reviewed 249-file export passed 119 static/SEO checks and 153 public-text asset guards. Hosted migration/RLS/RPC verifier passed. All 30 read-only hosted checks passed: reviewed homepage/admin bytes on both hosts, noindex, capability flags, disabled mail, protected/hidden/unknown routes, anonymous RPC denial, guest admin access, mobile fit and zero browser errors/email-worker calls; local Auth/Storage/funds remained simulated and no physical/inbox/private-upload success is inferred.

Migration 027 SHA-256: `155aeb0f84e40a718a95d6843f149a740ef7262247ca3178ed992834f58d68b2`. Private recovery SQL and customer identity/contact values remain out of Git. Test-profile permanent deletion still requires owner approval; other profiles were untouched.

## 26 October: free profiles, payment alternatives and flexible staff fulfillment

Hosting **`cabbc34a2b3f0358`**, **26 October 2026 at 8:32:34 am Pakistan time**, publishes the reviewed website export on `https://edgetap.tech`. Exactly migrations **024/025/026** were applied and registered atomically after existing 019–023; optional 016 remains unapplied. The transaction verified unchanged existing customer/order/profile/payment/catalog/outbox data and app function definitions. No live customer QA writes, signups, funds, messages, emails or moderation actions were performed. Tarsil.pk's existing profile was explicitly left unchanged.

New card drafts have no forced public Email link. Payment evidence is a reference/transaction ID or an owned private receipt; old receipt-based references retain compatibility. Neither verifies funds automatically. Staff can directly publish to `edgetap.tech/u/<handle>` without review/payment/specification/proof steps, with no fabricated status changes. Item type supports printed card, tag/chip only and digital-only fulfillment without repricing an agreed order. Eight private checklist steps are optional; explicit review start/completion appears in-account but does not queue/send customer email. Manual fulfillment is independent of optional print tools. Customer profiles can be edited or removed/restored from public view by staff without their passwords or deleting records.

One confirmed account can self-publish one free website profile with up to ten links, no payment/order/staff approval, branded shared pages and a card-order CTA. Owner card ordering reuses the owned profile and current catalog rate. Unrelated visitors cannot gain ownership via the URL hint. The creator/account/profile routes remain noindex. Auth email confirmation stays enabled; branded confirmation/recovery templates and an SMTP/DNS/provider plan were prepared without changing the live sender or activating order email.

Validation: production/isolated builds and TypeScript; lint zero errors (18 existing warnings); existing Supabase regressions, 17 pricing/profile SQL scenarios and 16 new payment/free/staff/privacy scenarios; redirect/payment-evidence unit checks; exact guarded release transaction with 019; 97 existing website browser checks, 26 pricing/profile-save checks and 28 focused free-profile/tag/admin checks. Workflow Auth/Storage/money were simulated. Release guard: 119 SEO/static assertions and 153 text assets; 249 exported files. The hosted read-only verifier and 24 anonymous HTTP/browser checks passed, including exact reviewed artifact bytes, both hosts, free-profile entry, owner intent, branding and the unchanged existing customer public profile. Real new-user inbox delivery, hosted signed-in private-byte access and physical tag handoff are not inferred from those checks.

Reviewed export manifest SHA-256: `a9f902e75bc6f2b0a2692860277e9f066cc7fe54f19189d04e6be3a8eb604318`. Migration hashes: 024 `89fc62c64c1ef4ecb0cdb4fc5d5eb7c5507acc5d59bf6fa9f62d6a7c6223dfa2`; 025 `fb92a0330a8c9158e49b218b2e74c092c253c511e5f80743db220bfa1f443840`; 026 `e1d79b810ddfd6b656b309719ee1ef5e2a31f890d73d3ed049725538d90f56df`.

## 25 October: admin pricing and confirmed profiles

Hosting **`39b6167934063bc3`**, **25 October 2026 at 10:50:53 am Pakistan time**, serves the reviewed production export on `https://edgetap.tech`; both Firebase hosts remain supported. Exactly website migrations **022/023** were applied and registered in one guarded transaction after existing 019–021. Optional 016 stays unapplied. Aggregate fingerprints confirmed unchanged existing customer/order/application/profile data and app function definitions; no test customers, orders, payments, uploads or reviews were written to the live backend.

Admin → Settings now edits current/crossed-out prices for both card products and the website package, website renewal, two/three-card offers and availability, additional cards and additional profile links. Initial catalog values retain the existing prices. Immutable revisions bind new checkout quotes to the server; submitted orders and corrections keep agreed historical terms. Old clients must refresh after a genuine pricing change. Public pricing refreshes on focus/at intervals and after same-browser tab notifications.

Customer editing is only through the signed-in side menu → Edit profile (`/account/profile`), with only owned profiles selectable. Public profile pages have no edit button. Unsaved fields survive token refresh. Both customer and founder dashboard saves require matching fresh stored/public fields before success. Homepage social links now read the saved founder profile instead of fixed demo URLs.

New guarded profile publication confirms `https://edgetap.tech/u/<handle>` immediately after actual payment verification, accepted review and confirmed card specification. Printing, proof approval and physical fulfillment continue separately with existing guards. Saved historical destinations and approved snapshots are unchanged.

Validation: production/isolated builds, TypeScript and lint (zero errors; 18 existing warnings); existing isolated Supabase regressions; 17 focused SQL scenarios; 13 legacy offer/ownership and seven review checks; 97 existing browser regressions and 26 new admin/menu/save/publication browser checks. The exact release transaction also passed locally with 019 and 016 excluded. Release guard: 117 SEO/static and 145 text assets; 241 exported files. After publication, the read-only hosted verifier and 20 public HTTP/browser checks passed, including exact reviewed page bytes, both hosts, dynamic prices, menu/guest editor protection, actual saved LinkedIn and unknown handles. Auth/Storage/funds in workflow tests were simulated; no real customer fulfillment, inbox delivery or physical quality is inferred. Email remains disabled.

SHA-256: reviewed export filename/content manifest `83bd5a1b75f3a0a64c8c3b819ebce8667789439d62ffdf948eedf4a16b6fabb7`; migration 022 `9a8aede0b8889c20472be4572701e58753a073fa22ea1071b107c5de5d6956d9`; migration 023 `e93fd97dbf5e335ae409eec1a0fefb4180941a3b42f9f3a68ff6490a93e661a9`.

## 23 October follow-up: custom profile contact on the first order screen

Hosting version **`3e2361e7ecb8e32a`**, released **10:26:44 am Pakistan time**. The Profile Card selection screen now shows a prominent “Want a custom digital profile page?” callout immediately below Choose your card, linking to the owner’s support WhatsApp +92 304 414 9674. The later profile-details contact remains available. Build/type checking and 117 SEO/static plus 139 text asset/configuration checks passed; contact visibility without scrolling was checked at 320×680, 390×844 and 1440×1000. No database migrations or app changes. The owner explicitly authorised the source branch push in this follow-up.

## 23 October: website pricing, checkout and public reviews

Owner-approved release: Firebase Hosting **`4b2698d68c3086f1`**, **23 October 2026 at 10:02:55 am Pakistan time**, `https://edgetap.tech` (Firebase aliases retained). Hosting only; no Firebase data-service deployment. Exact Supabase migrations **020/021** were applied atomically and registered after existing 019. Optional 016 remains unapplied. The transaction verified unchanged saved order/profile/application fingerprints and app function definitions; no customer rows were seeded or rewritten.

Final offers: Profile Card 1499; explicit bundles two/2099 and three/2499. Link Card 999; explicit bundles two/1599 and three/1999. No five-card offers. Manual extra matching cards cost 700; quantity edits clear the selected offer. New website orders include delivery, disclosed at payment, while historical submitted terms remain intact. Bank is the default for new checkout. Delivery recipients can enter a name independently of their public profile. Signed-in owners can order cards for their existing profile without duplicate publication.

The golden featured plan uses equal-sized current/struck-through prices with the former price on the right and small Rs. text. Black photography has a tilted Most used tag. Supplied social Link Card mockups are selectable by destination family, with separate clean printable templates. Designer and custom digital profile admin links use their owner-supplied WhatsApp numbers. Marketing QR images encode the website root; ordered-card QR/NFC destinations remain matched and historical URLs are preserved. The tap demo, continuous draggable offer strip, upload validation, visible owner edit action, customer order stages/messages and admin profile preview are included.

Public reviews replace every sample. A clearly disclosed signed-in public form accepts a chosen name, text and half-star rating; one review per account can be updated after a one-minute cooldown. Anonymous listing serves at most eight ranked reviews per keyset batch, with Show more and Back to top reviews. Existing private feedback remains private; already-public legacy reviews remain available.

Validation: production/fixture builds, TypeScript, lint (zero errors; 20 existing warnings), existing isolated Supabase regressions, 13 pricing/delivery/ownership scenarios, seven review privacy/pagination scenarios and 97 integrated browser checks passed. The exact release transaction passed locally after 019. Release guard: 117 SEO/static and 139 text asset/configuration checks. Live read-only SQL and anonymous API checks passed; hosted browser checks confirmed the final offers and public form. Homepage/pricing/order/terms/profile bytes matched the reviewed export; both hosts and the QR asset matched. Auth/Storage/payment workflow tests were local simulations; no live test reviews, customer orders, uploads, actual funds or emails were submitted. Email remains inactive and physical fulfillment remains manual.

## 18 October: checkout and refinements

Applied exactly 017/018 with their history records in one guarded transaction; optional 016 stayed unapplied. Founder/profile fields, accounts, customer containers, staff and order/application counts were preserved. After the earlier authorized test cleanup there were three accounts, three customer containers, zero orders/applications and only `ibraheem` active; release verification created no new accounts/orders/uploads/messages and left zero queued email jobs.

Published checkout version 2, JazzCash/Easypaisa/Meezan recipient details, Rs. 50 once/profile for each link after ten, public location and private authenticated feedback. Front/back upload previews, cropper, draft recovery, social normalization, Information panels, thank-you deep links and collapsed order details are included. Failed cloud artwork replacement retains the previous file. Staff can generate a guarded A4 printer order sheet with both approved faces.

Marketing retains the original four-slide horizontal story with mousewheel inertia. Card contact reveals the founder; QR scanning reveals the same profile; founder/Umar phones touch at top corners with contact/save boxes. Supplied artwork is shared across marketing/chooser previews, small previews warm from the homepage, annotations were measured with Playwright MCP at narrow/desktop sizes, and ordering doodles remain visible without intercepting input. Stars are compact/default five. Prices show confirmed crossed-out standards. Navbar uses the supplied ET logo; explicit stable 96/512px favicon metadata replaces the conflicting auto-generated first 16px icon link.

Validation: TypeScript, lint, webpack production build and release guard passed. Final guard: **117 SEO/static checks**, **138 public text assets**; Firebase published 201 files. Local focused story refinements **57**, story/contact/inertia/cache **38**, ordering/feedback/upload/crop/printing **78**, checkout SQL **14**, and proof-review SQL **29** checks passed, plus existing isolated SQL regressions and worker/idempotency/cleanup tests. Ordering Auth/Storage/email HTTP were mocked; PostgreSQL/RLS and generated PDFs were exercised.

After publication: **57 focused live browser**, **33 read-only live release**, **33 public favicon HTTP/format/robots** checks passed. Public settings, matching artifact bytes, two hosts, founder/missing handles, actual public backend reads and responsive scenes were checked. Browser/Googlebot user-agent probes do not trigger a Google crawl. Search Console required sign-in; no indexing request was submitted and actual search-icon refresh remains unverified.

The email outbox/functions exist, but worker/provider secrets/scheduler remain inactive. No real email delivery, hosted signed-in checkout/upload, actual money, physical printing/NFC programming or handoff is established by these checks.

## 17 October: SEO and domain compatibility

Published canonicals/social metadata and the five canonical sitemap URLs, public robots access, private/profile noindex and legacy host compatibility. Production passed **313 HTTP/header/SEO/redirect/asset assertions across 66 URLs**, plus eight anonymous hydrated pages. Preview passed 117 responsive browser and 87 HTTP checks. A 001–015-only database passed 14 publication/proof/security checks, showing 016 is not a frontend dependency. No DNS/Auth settings, customer records, saved destinations, schema or mail were changed. Pending console steps are in [BUILD.md](BUILD.md).

## 16 October: card products and private proof

Approved migrations 012→013→014→015 were applied before publication. Existing customer/order/profile/payment/draft fingerprints matched; no seeds or real test orders were added. Settings advertised editor version 4 and design review version 1. Production passed **444 responsive browser assertions**, **38 Hosting/public-profile checks** and **38 read-only backend API checks**, with read-only SQL guards/permissions verified. Auth/Storage/payment workflow fixtures and physical limitations remained distinct.

## Artifact and migration fingerprints

| Artifact | SHA-256 |
|---|---|
| 18 Oct latest reviewed export archive | `541ddac74fec04fe785f9bc7aadd2c8d421c421435e8070c8af7f3579a1b9fb2` |
| 18 Oct initial reviewed export archive | `7f2ec91dc717a227ab3802df044ae0ae0bd1e50d26727bec331377630f68136e` |
| 17 Oct sorted export filename/content manifest | `f1b73c5b91e48444db8ff5c0ff4459469e03075b4288375cd0cf61e5e0e5b2e3` |
| 16 Oct sorted export filename/content manifest | `6d603a6ac020e8d1fe18710c36da4b7301225a3f9ca40c9e487eb9868a3e0f5f` |
| Migration 012 | `3c8274ba7cdce6d3959fe6f83448508dce9fe62f352e499a263e7d20c21f2349` |
| Migration 013 | `61aa15f33fe322775581453af0d9e8c84bed339e89c8232e219221ae21bdd6e2` |
| Migration 014 | `2e4fb19ad2354144bed5fcf7369e89cecc3c9b5171cfba567ea974dbaba35b36` |
| Migration 015 | `bf743453c95d5258eb231e713b08ea41ee2b104c74d90653ea1971690785d610` |
| Migration 017 | `1d5d9fcb3475a03ad885928e4078b1cc75a7c7280a8e753cbc9dd7899efb3bbc` |
| Migration 018 | `ea55dbe9fc8afecf1a062f7eb3829f524bccdd8586885d125da454da82b5061d` |

Generated screenshots, raw logs and duplicate audit JSON were removed during workspace cleanup; test scripts and this evidence summary remain. Older tracked reports can be recovered from Git. Private local schema/data recovery references are ignored and are not complete database/Storage backups. Hosting rollback and schema recovery are separate operations; see [BUILD.md](BUILD.md).
