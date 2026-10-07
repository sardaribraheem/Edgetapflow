<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# EdgeTap engineering and launch rules

## Architecture
- Next.js App Router / React / Tailwind; static export in `out/`, Firebase Hosting project `edgetapflow`.
- Browser Firebase Auth, Firestore and Storage; no backend/API, payment gateway, mail worker or courier integration.
- `app/`: routes/metadata; `components/`: UI and staff/order/profile screens; `lib/`: Firebase, validation, domain models; `scripts/`: production/browser/rules verification.
- `/u/ibraheem` is the founder example. Hosting rewrites other `/u/*` requests to `/profile.html`, whose client reads the incoming pathname. Never resolve unknown handles to founder content. Verify on Hosting preview as well as the local QA server.
- NFC programming is a manual production task; QR and NFC both encode `profileUrl` from `lib/site.ts`. Handles cannot be renamed without implementing redirects for existing cards.

## Commands
- `npm ci`, `npm run dev`.
- `npm run lint`, `npm run typecheck`.
- `npm run build` (default Turbopack); `npm run build -- --webpack` is the supported fallback when this machine prevents Turbopack worker port binding.
- Static exports cannot use `next start`: `PORT=4173 npm run serve:qa`, then `QA_BASE_URL=http://127.0.0.1:4173 npm run test:browser`.
- Firebase CLI + Java 21+: `npm run test:rules` (rule tests and actual-service integration tests against `demo-edgetap-qa`).
- `node scripts/check-live-services.mjs` performs read-only service probes, without logging configuration values.
- `node scripts/diagnose-live-profile.mjs` traces a fresh unauthenticated production browser and sanitized service errors; no submissions.

## Configuration and deployment
- `.env.local` supplies all six `NEXT_PUBLIC_FIREBASE_*` web-config variables shown in `.env.example`. No private credentials in NEXT_PUBLIC variables. Values are embedded at build time; rebuild after changing them.
- Confirmed canonical origin: `https://edgetapflow.web.app`; optional `NEXT_PUBLIC_APP_URL` must be an HTTPS origin. Do not switch domains without owner approval.
- Deploy only `out/` and reviewed Firebase rules/indexes. Follow `LAUNCH_REPORT.md` release steps; never treat docs as proof of deployed service state.
- Preserve the generated Next.js instruction block above.
- Billing is inactive (verified 7 October 2026). Do not enable billing/payment methods, deploy or push under the current task. `(default)` has no free tier and is billing-gated; the distinct database `default` has free tier but deny-all deployed rules. `NEXT_PUBLIC_FIRESTORE_DATABASE_ID` selects a database explicitly; no automatic migration. `firebase.spark.json` is a prepared Firestore-only config, not a deployed fix.
- Cloud Storage requires Blaze. `NEXT_PUBLIC_ONLINE_CHECKOUT_ENABLED` defaults to false: preserve the full wizard/services, but use honest WhatsApp handoff and no payment collection/submission until verified infrastructure works. Do not infer healthy service from the old production founder fallback or an HTTP 200 WebChannel transport.

## Coding and security
- Preserve the existing architecture; avoid unnecessary dependencies/rewrites. Use TypeScript, shared models and existing visual styles.
- Treat Firestore data as untrusted. Validate link schemes at input and rendering; escape contact-file fields. Consumers see actionable errors, not raw SDK messages/configuration.
- Firestore rules enforce staff authorization, private order access, quantity/pricing, pending payments, bounded links and owner field restrictions. A signed-in customer is not staff.
- Reserve profile + handle inside a transaction, re-read the order and reject collisions or stale fulfillment. Never overwrite an existing profile during order fulfillment.
- Private artwork/receipts store Storage paths and use authenticated download; avatars are public. Do not expose customer addresses or receipts in public profiles.
- Never log secrets, passwords, private customer data or signed upload links; do not commit diagnostic logs or local worktrees.
- Keep owners/handles/lifecycle fields immutable to customer edits. Do not bypass payment verification, NFC programming or QA stages.

## Commercial and launch rules
- Brand: EdgeTap; tagline: “One tap. Infinite possibilities.” Card: Rs. 999 each; QR fallback; one profile shared by cards in one order.
- Primary support: WhatsApp +92 304 414 9674. Confirmed payment: JazzCash 0304 4149674 only.
- Pakistan-focused delivery; no invented charges, dispatch promises, pickup location, refunds, lifetime hosting or unlimited/free update promises. Missing policies remain launch blockers until the owner decides.
- Owner-confirmed personalized-card policy: non-returnable/non-refundable after production starts except required law; assess damage, defects, EdgeTap printing errors or wrong supplied card. No automatic remedy for customer-provided errors. This is business-policy copy requiring legal review, not a verified legal exemption.
- Do not advertise unimplemented attendance, restaurant menu, team, analytics, enterprise or automated email features. No fake reviews/customer counts.
- Preserve user work. Use a dedicated branch; do not publish or overwrite live data during QA.
- Never claim completion without verification. Report what was tested, what was simulated and what remains unverified. Passing builds do not prove a working checkout or physical card.
