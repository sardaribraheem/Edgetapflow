<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# EdgeTap engineering and launch rules

Current evidence and owner scope: [docs/LAUNCH_STATUS.md](docs/LAUNCH_STATUS.md). Physical launch at NASTP NIIT is the priority. App work, including its NFC prototype, is deferred until explicitly resumed. Documentation/audit work authorizes no production operation or customer-policy change.

## Architecture
- Next.js App Router / React / Tailwind; static export in `out/`, Firebase Hosting project `edgetapflow`.
- Supabase Auth, PostgreSQL/RLS/RPCs and Storage are the application backend. Firebase is Hosting only. There is no automatic payment gateway, final-design email worker or courier integration.
- `app/`: routes/metadata; `components/`: UI and staff/order/profile screens; `lib/`: Supabase services, validation and domain models, with explicitly selected legacy Firebase adapters; `scripts/`: production/browser/SQL verification.
- `/u/ibraheem` is the founder example. Hosting rewrites other `/u/*` requests to `/profile.html`, whose client reads the incoming pathname. Never resolve unknown handles to founder content. Verify on Hosting preview as well as the local QA server.
- NFC programming is a manual production task; QR and NFC both encode the confirmed direct link (Link Card) or `profileUrl` from `lib/site.ts` (EdgeTap Profile). Handles cannot be renamed without implementing redirects for existing cards.

## Commands
- `npm ci`, `npm run dev`.
- `npm run lint`, `npm run typecheck`.
- `npm run build` (default Turbopack); `npm run build -- --webpack` is the supported fallback when this machine prevents Turbopack worker port binding.
- Static exports cannot use `next start`: `PORT=4173 npm run serve:qa`, then `QA_BASE_URL=http://127.0.0.1:4173 npm run test:browser`.
- Firebase CLI + Java 21+: `npm run test:rules` (rule tests and actual-service integration tests against `demo-edgetap-qa`).
- `node scripts/check-live-services.mjs` performs read-only service probes, without logging configuration values.
- `node scripts/diagnose-live-profile.mjs` traces a fresh unauthenticated production browser and sanitized service errors; no submissions.

## Configuration and deployment
- `.env.local` supplies `NEXT_PUBLIC_DATA_BACKEND=supabase`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and the canonical app origin. Values are embedded at build time; rebuild after changing them. Legacy Firebase variables are needed only if Firebase is explicitly selected for development. No private credentials in NEXT_PUBLIC variables.
- Confirmed canonical origin: `https://edgetapflow.web.app`; optional `NEXT_PUBLIC_APP_URL` must be an HTTPS origin. Do not switch domains without owner approval.
- Deploy the reviewed `out/` to Firebase Hosting only with owner authorization. `npm run deploy:hosting` rebuilds and checks the export before publishing to `edgetapflow`. Do not deploy Firebase data-service rules for the Supabase workflow. See `docs/LAUNCH_STATUS.md`; archived reports preserve history and are not proof of current service state.
- Preserve the generated Next.js instruction block above.
- Do not enable billing/payment methods, change Firebase Auth/Firestore/Storage, or apply Supabase schema/data changes without corresponding owner authorization. Firestore billing is not a prerequisite for the current Supabase app. A Hosting release needs Google/Firebase CLI permission, independently of Supabase account login.
- Build guest cards on-device and require Supabase account saving before private payment submission. Preserve review/payment/printing guards. A design-proof queue entry is not sent email; the ten-hour window begins only after actual transport confirmation. Private account-proof sharing (015, applied 16 October 2026) sends no mail and never auto-times out; printing requires explicit current-revision owner approval. New orders have one included revision request; regeneration never resets it. Extra preference revisions require staff recording the separately agreed, actually verified payment. Existing orders keep their agreed legacy terms. The former instant-checkout flag is no longer used.

## Coding and security
- Preserve the existing architecture; avoid unnecessary dependencies/rewrites. Use TypeScript, shared models and existing visual styles.
- Treat Firestore data as untrusted. Validate link schemes at input and rendering; escape contact-file fields. Consumers see actionable errors, not raw SDK messages/configuration.
- Supabase RLS/RPC/Storage policies enforce the current staff/private-order/price/payment/owner boundaries; Firestore rules apply only to explicitly selected legacy development. A signed-in customer is not staff.
- Reserve profile + handle inside a transaction, re-read the order and reject collisions or stale fulfillment. Never overwrite an existing profile during order fulfillment.
- Private artwork/receipts store Storage paths and use authenticated download; avatars are public. Do not expose customer addresses or receipts in public profiles.
- Never log secrets, passwords, private customer data or signed upload links; do not commit diagnostic logs or local worktrees.
- Keep owners/handles/lifecycle fields immutable to customer edits. Do not bypass payment verification, NFC programming or QA stages.

## Commercial and launch rules
- Brand: EdgeTap; tagline: “One tap. Infinite possibilities.” Link Card: Rs. 999; EdgeTap Profile: Rs. 1,499; Website + Cards: Rs. 29,999. Optional QR; identical cards in one order share one design/destination. Migrations 001–015 are applied; the new offers/editor/private-proof frontend was released 16 October 2026. See docs/RELEASE_2026-10-16.md. Never rerun or edit an applied migration.
- Primary support: WhatsApp +92 304 414 9674. Confirmed payment: JazzCash 0304 4149674 only.
- Pakistan-focused delivery; no invented charges, dispatch promises, pickup location, refunds, lifetime hosting or unlimited/free update promises. Missing policies remain launch blockers until the owner decides.
- Owner-confirmed personalized-card policy: non-returnable/non-refundable after production starts except required law; assess damage, defects, EdgeTap printing errors or wrong supplied card. No automatic remedy for customer-provided errors. This is business-policy copy requiring legal review, not a verified legal exemption.
- Do not advertise unimplemented attendance, restaurant menu, team, analytics, enterprise or automated email features. No fake reviews/customer counts.
- Preserve user work. Use a dedicated branch; do not publish or overwrite live data during QA.
- Never claim completion without verification. Report what was tested, what was simulated and what remains unverified. Passing builds do not prove a working checkout or physical card.
