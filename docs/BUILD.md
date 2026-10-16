# Build and Hosting

**Current launch evidence: [LAUNCH_STATUS.md](LAUNCH_STATUS.md).** Migrations **001–011 were confirmed on the linked hosted project in the 14–15 October audit** and Firebase Hosting is live. The former claim that 007–009 were unapplied and the frontend unreleased is superseded. Email delivery, real customer/private-file/paid fulfillment and fading-print correction remain separate verification work. App work is deferred.

## Card offers update — 15 October 2026

The owner confirmed **Link Card Rs. 999**, **EdgeTap Profile Rs. 1,499**, and **Website + four cards Rs. 29,999**, delivery separate. This update is implemented in local source and tested with isolated fixtures. **Migrations 012–015 are prepared, not applied; these features are not deployed.** Hosted migrations 001–011 and the previously released website remain the last verified production baseline. Review/apply 012, 013, 014, then 015 under separate authorization before releasing the matching frontend. The new checkout checks offer/editor capabilities and `designReviewVersion: 1` before account transfer/payment. Migration 015 supplies private account proof sharing and the one-included-revision policy; old orders keep their agreed rules. Account proof approval needs no email timer. Real Auth email remains separate verification work. Existing submitted Rs. 999 orders keep their agreed price. [Implementation and operation details](CARD_PRODUCTS.md).

Next.js uses `output: "export"`; builds write `out/`. Keep the existing `.env.local` with public Supabase configuration and the canonical `https://edgetapflow.web.app`. Public values are embedded at build time; rebuild after changing them. Never put operator/service-role/SMTP credentials or passwords in `NEXT_PUBLIC_*`. Supabase handles Auth/Postgres/Storage; Firebase handles Hosting. Explicit Firebase data adapters remain a legacy development option.

From the project directory:

```sh
npm ci
npm run dev -- --port 3001
```

Verification for a future reviewed change:

```sh
npm run typecheck
npm run lint
npm run build -- --webpack
npm run check:release
```

Webpack is the supported fallback on this machine when Turbopack cannot bind worker ports. Fonts may require network access. The release guard rejects fixture exports and privileged credential patterns. Static exports cannot use `next start`; use `PORT=4173 npm run serve:qa`, then `QA_BASE_URL=http://127.0.0.1:4173 npm run test:browser` for the corresponding prepared export. Read [backendguide.md](backendguide.md) before isolated workflow tests. Browser Auth/Storage/proof simulations do not prove real email, funds, private bytes or physical cards.

Read-only hosted checks: `supabase migration list --linked` and `npm run check:supabase:hosted`. Confirm the intended project first. Do not treat old empty-database assertions or `test:supabase:hosted-browser` as current live checks: that browser script still assumes the founder is absent; its correction is [prepared for review](OPERATIONAL_FIXES_FOR_REVIEW.md).

Hosting clean URLs and `/u/** → /profile.html` preserve exact active-handle lookup; unknown handles never show founder content. Canonical `.web.app` remains decided; no custom-domain change is approved.

Future deployments, migrations and service changes need corresponding owner authorization. This documentation audit authorizes none. Historical build/migration/release results are in [archive/](archive/README.md), including [the earlier setup report](archive/SUPABASE_MIGRATION_REPORT.md). Never rerun the clean installer against the initialized production database or publish a fixture export.
