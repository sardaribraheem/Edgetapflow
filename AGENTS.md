<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# EdgeTap engineering rules

For a fresh session, read the workspace [context.md](../context.md) if present, then the maintained status/guides below and [milestone update plan](../updateplan.md). On 27 October the owner moved maintained general guides to workspace root `../docs/`; they belong to the separate workspace repository. This file is repository guidance; the context file is a handoff rather than a full chat transcript. A standalone website clone does not include the root guides; use this repository guidance and distinguish historical Git documentation from current workspace decisions. Communicate in English only. Keep material release/product/scope changes reflected in the handoff when available.

Read [launch status](../docs/LAUNCH_STATUS.md) for current service state and [guide index](../docs/README.md) for maintained guides. Physical-card launch at NASTP NIIT is the priority. Companion app work, including its NFC prototype, is deferred until explicitly resumed. Documentation alone grants no production-operation permission.

## Architecture and current release

- Next.js App Router/React/Tailwind static export to `out/`; Firebase project `edgetapflow` is Hosting only. Supabase project `dxyxvervvlxhwwbcbttd` handles Auth/PostgreSQL/RLS/RPCs/Storage. Preserve the architecture; avoid unnecessary dependencies or rewrites.
- Latest recorded live Hosting: `6f8c18e26f9a80c5`, 27 October 2026 at 00:52:10 Pakistan time, `https://edgetap.tech`. Hosted history: **001–015 plus 017–027**. **016 remains unapplied**. Never edit/rerun applied migrations or blindly push optional 016. See [release history](../docs/RELEASE_HISTORY.md).
- Checkout version 2 plus website catalog-pricing version 4 is live, with Bank as the new-order default, paid extra links, opt-in public website reviews and separate private feedback. Website migrations 020–026 preserve the previously applied app contract 019. Email worker/provider secrets/scheduler remain inactive, `emailNotificationsEnabled=false`. Queueing/private sharing sends no email and starts no timer.
- Staff can directly publish a valid owned profile on `https://edgetap.tech/u/<handle>` independently of payment, optional review and physical production. One confirmed account can self-publish one free website profile with up to ten links. Existing card URLs stay unchanged. Customer editing is only in the signed-in side menu → Edit profile (`/account/profile`), never in the public profile body. Both customer and founder dashboard saves require confirmed read-back. Founder `/u/ibraheem` is an example. Hosting rewrites other `/u/*` to `/profile.html`, whose client reads the requested path. Unknown handles must never show founder content. Profiles/private routes remain noindex and outside the sitemap; authorization is independent of indexing rules.

## Commands and configuration

- `npm ci`, `npm run dev`; `npm run typecheck`, `npm run lint`.
- `npm run build` uses Turbopack; `npm run build -- --webpack` is the fallback for restricted worker ports. Run `npm run check:release` on the actual reviewed export.
- Static export: `PORT=4173 npm run serve:qa`; do not use `next start`. Read [backend testing guidance](../docs/backendguide.md) before workflow tests. Isolated fixture exports must never be deployed. Older browser suites may have stale UI or clean-project assumptions.
- `.env.local` supplies public Supabase URL/publishable key, selected backend and preferred origin; values embed at build time. No service-role/mail/operator credentials in `NEXT_PUBLIC_*`, logs, reports or Git.
- Preferred origin is `https://edgetap.tech`; preserve both Firebase hosts, old Auth callbacks, saved NFC destinations and approved snapshots. Never bulk-rewrite printed-card URLs. Domain/Auth console steps are in [BUILD.md](../docs/BUILD.md).
- Deploy the reviewed `out/` to Firebase Hosting only with owner authorization. `npm run deploy:hosting` rebuilds/checks/publishes to `edgetapflow`. Schema/data/service changes need corresponding authorization. Do not deploy Firebase data-service rules for the Supabase flow or enable billing as a workaround.
- Preserve the generated Next.js instruction block above. Read the relevant installed Next.js docs before code changes.

## Owner-authorized workflow update, 26 October 2026

The owner's explicit instruction supersedes mandatory payment/review/specification/proof gates for the new staff controls: staff can directly publish profiles and record manual fulfillment. Keep strict staff authorization, row versions, ownership, unique stable handles, valid URLs and private files. Do not auto-mark money verified, reviews completed or proofs approved when publishing. Staff checklist checks are optional/private; start/complete review are explicit in-account updates without automatic email. Physical tags/profile-only orders do not require printed artwork. Legacy guarded RPCs remain available, while the website uses the new direct staff controls. One confirmed account may publish one free website profile with up to ten links, without payment or staff acceptance; admin can remove/restore public visibility without deleting customer records. The app source and existing 019 functions remain unchanged.

## Data and production safeguards

- Owner clarification, 27 October: Tarsil.pk/TarsilPK and Ibraheem are the currently confirmed valid profiles. Umar Khan, Enfotize and Adolf are owner-identified tests. Verify exact stored handles/IDs, related records and action scope, then ask the owner before deleting any test profile. Preserve Tarsil.pk's actual current public fields and links; do not add/restore Email during account cleanup. The owner later authorized separating the two hidden Umer profiles and their linked order from Tarsil's login, with no messages. That exact correction is complete under 027; all profiles/orders remain. See the maintained account/admin release guide. This is not permission for bulk deletion, account/order/file deletion or treating later new customers as tests.
- Use TypeScript/shared models/styles. Validate untrusted data/link schemes at input and rendering; escape contact-file fields and show sanitized actionable errors.
- RLS/RPC/Storage enforce staff/owner/private-order/price/payment boundaries. Signup does not confer staff rights. Never bypass a guard or use browser service-role credentials.
- Reserve profile/handle in a transaction, re-read versions and reject collisions/stale fulfillment. Never overwrite another profile. Keep handle/owner/lifecycle immutable to customer edits.
- Private artwork/receipts/proofs use Storage paths and authenticated downloads; avatars/logos are public with disclosure. Do not expose addresses, receipts, private notes or signed upload links.
- Legacy proof/PDF endpoints retain their file/payment/destination checks. The new staff controls support direct publication and manual fulfillment without requiring that optional proof workflow. Record actual payment and physical work explicitly; publishing does not mark either complete.
- Private account proof sharing requires explicit current-revision approval and has no timeout. Optional email starts its ten-hour window only after actual provider acceptance; no-response handling requires real reply/inbox checks. Never fake a send/provider ID.
- New orders include one consolidated revision request; regeneration/channel changes never reset it. Further preference edits require an agreed, actually verified payment recorded privately. Preserve legacy order terms. Digital profile edits do not rewrite approved physical snapshots.
- Preserve user work and use a dedicated branch. No live data writes during QA without scoped authorization. Keep diagnostics/generated screenshots/builds/private backups ignored. Never commit customer data or credentials.

## Commercial rules and evidence

- Free website profile: Rs. 0, one per confirmed account, ten links, EdgeTap branding/card CTA and staff edit/remove/restore controls. A public Email link is optional. Payment checkout accepts a claimed transfer reference or an owned private receipt; neither verifies funds automatically.
- Brand EdgeTap; tagline “One tap. Infinite possibilities.” Default catalog prices: Link Rs. 999, Profile Rs. 1499, Website + four cards Rs. 29999. Admin → Settings controls current/crossed-out prices, bundle prices/availability, renewal and additional-card/link rates; use the public catalog for current website prices. Submitted orders retain immutable quoted revisions. Owner-confirmed crossed-out comparisons: Rs. 1399 / 2200 / 36999 for crossed-out comparisons. First ten profile links included; Rs. 50 per extra link once per profile, not per card. Technical limit 100.
- JazzCash/Easypaisa 03044149674; Meezan IBAN PK46MEZN0000300116179673. Recipient: Muhammad Ibraheem Anwar. Verify actual transfer manually. Support WhatsApp +92 304 414 9674.
- Identical cards in one order share one design/destination; QR optional, same confirmed URL as NFC. PVC 85.60 × 53.98 mm. Preserve standard pickup Delta 3 Mon–Fri 9–5 PKT; NIIT launch focus is not a pickup-policy change. New version-3/4 website orders include delivery, disclosed at payment; preserve historical delivery terms. Explicit Profile bundles: two/2099 and three/2499. Link bundles: two/1599 and three/1999. No five-card offers. Manual additional matching cards cost 700; quantity edits clear the bundle.
- Do not invent dispatch/coverage/refund/hosting/update promises, fees, testimonials, analytics or unimplemented app/team/attendance/menu features. Personalized-card policy and remaining legal/retention/hosting questions are in [businessguide.md](../docs/businessguide.md).
- Never claim actual customer success from a build, mock, queue or anonymous denial. Distinguish what was tested, simulated and still unverified: hosted signed-in uploads, real email, funds and full physical fulfillment remain separate work.
