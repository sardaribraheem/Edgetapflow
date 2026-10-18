# EdgeTap release history

Consolidated 18 October 2026 from release/audit/implementation reports. [Launch status](LAUNCH_STATUS.md) is the current authority. Counts below describe checks run at release time, not a new test run or proof of complete customer fulfillment.

| Date/time (Pakistan) | Firebase Hosting version | Scope |
|---|---|---|
| 18 Oct, 9:01:06 pm | **`f5c31e156838a13f`** | Latest UI/navbar/story/doodles and stable search favicon refinement; Hosting only |
| 18 Oct, 8:28:35 pm | `d9033a5eb49c54dd` | Checkout/UI/feedback/admin print release after explicit approval of 017/018 and frontend |
| 17 Oct, 9:15:27 am | `e2af92ed956b5fcd` | Preferred-origin SEO, sitemap/social metadata/noindex/legacy-route compatibility; Hosting only |
| 16 Oct, 12:50:10 pm | `ae83d57dca84c205` | Card products/editor/public logos/private proof after approved 012–015 |
| 14 Oct, 10:14 pm | `e4635533ce44dcb1` | Previous verified baseline |

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
