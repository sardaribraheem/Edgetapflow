<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# EdgeTap engineering rules

Read [docs/LAUNCH_STATUS.md](docs/LAUNCH_STATUS.md) for current service state and [docs/README.md](docs/README.md) for maintained guides. Physical-card launch at NASTP NIIT is the priority. Companion app work, including its NFC prototype, is deferred until explicitly resumed. Documentation alone grants no production-operation permission.

## Architecture and current release

- Next.js App Router/React/Tailwind static export to `out/`; Firebase project `edgetapflow` is Hosting only. Supabase project `dxyxvervvlxhwwbcbttd` handles Auth/PostgreSQL/RLS/RPCs/Storage. Preserve the architecture; avoid unnecessary dependencies or rewrites.
- Latest recorded live Hosting: `f5c31e156838a13f`, 18 October 2026 at 9:01:06 pm Pakistan time, `https://edgetap.tech`. Hosted history: **001–015 plus 017/018**. **016 remains unapplied**. Never edit/rerun applied migrations or blindly push optional 016. See [release history](docs/RELEASE_HISTORY.md).
- Checkout version 2 has three manual payment methods, paid extra links and private authenticated feedback. Email worker/provider secrets/scheduler remain inactive, `emailNotificationsEnabled=false`. Queueing/private sharing sends no email and starts no timer.
- Founder `/u/ibraheem` is an example. Hosting rewrites other `/u/*` to `/profile.html`, whose client reads the requested path. Unknown handles must never show founder content. Profiles/private routes remain noindex and outside the sitemap; authorization is independent of indexing rules.

## Commands and configuration

- `npm ci`, `npm run dev`; `npm run typecheck`, `npm run lint`.
- `npm run build` uses Turbopack; `npm run build -- --webpack` is the fallback for restricted worker ports. Run `npm run check:release` on the actual reviewed export.
- Static export: `PORT=4173 npm run serve:qa`; do not use `next start`. Read [backend testing guidance](docs/backendguide.md) before workflow tests. Isolated fixture exports must never be deployed. Older browser suites may have stale UI or clean-project assumptions.
- `.env.local` supplies public Supabase URL/publishable key, selected backend and preferred origin; values embed at build time. No service-role/mail/operator credentials in `NEXT_PUBLIC_*`, logs, reports or Git.
- Preferred origin is `https://edgetap.tech`; preserve both Firebase hosts, old Auth callbacks, saved NFC destinations and approved snapshots. Never bulk-rewrite printed-card URLs. Domain/Auth console steps are in [BUILD.md](docs/BUILD.md).
- Deploy the reviewed `out/` to Firebase Hosting only with owner authorization. `npm run deploy:hosting` rebuilds/checks/publishes to `edgetapflow`. Schema/data/service changes need corresponding authorization. Do not deploy Firebase data-service rules for the Supabase flow or enable billing as a workaround.
- Preserve the generated Next.js instruction block above. Read the relevant installed Next.js docs before code changes.

## Data and production safeguards

- Use TypeScript/shared models/styles. Validate untrusted data/link schemes at input and rendering; escape contact-file fields and show sanitized actionable errors.
- RLS/RPC/Storage enforce staff/owner/private-order/price/payment boundaries. Signup does not confer staff rights. Never bypass a guard or use browser service-role credentials.
- Reserve profile/handle in a transaction, re-read versions and reject collisions/stale fulfillment. Never overwrite another profile. Keep handle/owner/lifecycle immutable to customer edits.
- Private artwork/receipts/proofs use Storage paths and authenticated downloads; avatars/logos are public with disclosure. Do not expose addresses, receipts, private notes or signed upload links.
- Printing requires actual verified funds, accepted specification, confirmed destination, printer settings and current-proof approval. NFC programming and physical QA/handoff are manual actual stages, not inferred from clicks or simulations.
- Private account proof sharing requires explicit current-revision approval and has no timeout. Optional email starts its ten-hour window only after actual provider acceptance; no-response handling requires real reply/inbox checks. Never fake a send/provider ID.
- New orders include one consolidated revision request; regeneration/channel changes never reset it. Further preference edits require an agreed, actually verified payment recorded privately. Preserve legacy order terms. Digital profile edits do not rewrite approved physical snapshots.
- Preserve user work and use a dedicated branch. No live data writes during QA without scoped authorization. Keep diagnostics/generated screenshots/builds/private backups ignored. Never commit customer data or credentials.

## Commercial rules and evidence

- Brand EdgeTap; tagline “One tap. Infinite possibilities.” Current prices: Link Rs. 999, Profile Rs. 1,499, Website + four cards Rs. 29,999. Owner-confirmed standards: Rs. 1,399 / 1,899 / 36,999 for crossed-out comparisons. First ten profile links included; Rs. 50 per extra link once per profile, not per card. Technical limit 100.
- JazzCash/Easypaisa 03044149674; Meezan IBAN PK46MEZN0000300116179673. Recipient: Muhammad Ibraheem Anwar. Verify actual transfer manually. Support WhatsApp +92 304 414 9674.
- Identical cards in one order share one design/destination; QR optional, same confirmed URL as NFC. PVC 85.60 × 53.98 mm. Preserve standard pickup Delta 3 Mon–Fri 9–5 PKT; NIIT launch focus is not a pickup-policy change. Delivery is separate, rider-direct actual fare.
- Do not invent dispatch/coverage/refund/hosting/update promises, fees, testimonials, analytics or unimplemented app/team/attendance/menu features. Personalized-card policy and remaining legal/retention/hosting questions are in [businessguide.md](docs/businessguide.md).
- Never claim actual customer success from a build, mock, queue or anonymous denial. Distinguish what was tested, simulated and still unverified: hosted signed-in uploads, real email, funds and full physical fulfillment remain separate work.
