# Build, Hosting and recovery

Updated 18 October 2026. Current state and limitations: [LAUNCH_STATUS.md](LAUNCH_STATUS.md). Release versions: [RELEASE_HISTORY.md](RELEASE_HISTORY.md).

## Local development and export

Next.js App Router uses `output: "export"`; generated files go to `out/`. Keep `.env.local` private; use `.env.example` for another checkout. Supabase is the backend, Firebase is Hosting only. Public values are embedded at build time. Never put server credentials in browser variables.

```sh
npm ci
npm run dev -- --port 3001
```

For a reviewed source change:

```sh
npm run typecheck
npm run lint
npm run build -- --webpack
npm run check:release
```

Default `npm run build` uses Turbopack; webpack is the supported fallback when worker ports are restricted. Fonts can need network access. Static exports use `PORT=4173 npm run serve:qa`, not `next start`. Release checks reject fixture exports, privileged credential patterns, wrong backend/canonicals/sitemap and missing private/profile noindex. Read [backend guide](backendguide.md) before workflow tests.

`node scripts/test-story-refinements-browser.mjs` and `npm run test:story:browser` take `QA_BASE_URL` for the served export. `node scripts/test-uiux-hosted-release.mjs` is read-only but compares deployed bytes with the **matching reviewed out/** in its working directory. `node scripts/test-favicon-hosted.mjs` checks public icon HTTP/formats/robots; it does not trigger a Google crawl. Do not use `test:supabase:hosted-browser` as the current launch check: its clean-project/absent-founder assumptions are stale. Some older browser workflows also expect superseded labels.

## Production publication

Production project: **Firebase Hosting `edgetapflow`**. Supabase project: **`dxyxvervvlxhwwbcbttd`**. Deploy the reviewed export only with owner authorization. `npm run deploy:hosting` rebuilds, checks, then deploys Hosting with Firebase CLI; no Firebase data-service rules should be deployed for the Supabase workflow. Confirm the built configuration before publication and verify public routing/metadata/assets afterward.

Hosted schema is **001–015 plus 017–023**, with **016 unapplied**. Never blindly run `supabase db push`: it could include optional 016. Review exact migrations and linked history and obtain scope-specific authorization before any schema/data operation. Git push itself does not publish Hosting or apply migrations.

Hosting clean URLs and `/u/** → /profile.html` preserve incoming-handle lookup. Unknown handles render Profile not found without founder fallback, but the static rewrite returns HTTP 200; they remain noindex. No customer profile is included in the five-page sitemap. Preserve both Firebase aliases and saved NFC URLs/approved snapshots.

## Git backup and recovery

Commit reviewed source, tests, migrations, licensed assets and current guides to the app repository on a dedicated branch. Push the branch to the configured GitHub `origin`; do not force-push or merge unrelated work. Git backs up committed source, **not** Supabase records, Storage bytes, local credentials or ignored files.

```sh
git log --oneline -10
git show <commit>:docs/developerguide.md
git restore --source=<commit> -- path/to/file
```

Inspect a version before restoring and preserve current edits. Deleted old plans/reports remain in earlier commits. The 18 October consolidation also saved uncommitted documentation to a private local archive under `/private/tmp`; temporary archives are not a durable backup service.

Generated `.playwright-mcp/`, `test-results/`, `.firebase/`, debug logs, `.next/`, `out/` and dependencies stay ignored. Screenshot/log outputs may be deleted after review; scripts regenerate them. Keep real source/card/logo assets. `.private-backups/` holds private schema recovery references and the authorized test-cleanup snapshot; never commit it. These references are **not a complete database/Storage backup**. Managed-backup/PITR availability must be checked separately; older evidence listed no snapshots and PITR disabled.

Use Firebase's retained release history for an owner-authorized Hosting rollback, selecting the recorded version. Hosting rollback does not reverse applied migrations. Database correction requires a new reviewed migration or a separately assessed recovery operation; never reset/reseed production or rerun a clean installer.

## Pending domain/Auth settings

The apex works and new frontend links use `https://edgetap.tech`. These separate console changes were **not performed** during the releases or documentation cleanup:

1. Supabase → Authentication → URL Configuration: review Site URL `https://edgetap.tech`; retain/add the six exact callbacks below, plus required localhost entries. Preserve outstanding legacy links and avoid broad production wildcards.

   ```text
   https://edgetap.tech/account
   https://edgetap.tech/account/recovery
   https://edgetapflow.web.app/account
   https://edgetapflow.web.app/account/recovery
   https://edgetapflow.firebaseapp.com/account
   https://edgetapflow.firebaseapp.com/account/recovery
   ```

2. Inspect signup/reset templates privately for hard-coded old origins; keep normal `{{ .ConfirmationURL }}` token links intact. Do not invent `/auth/confirm` or bulk-push TOML/SMTP changes. Verify real confirmation/recovery receipt and callbacks separately. Sessions/device drafts are scoped to each origin.
3. Firebase Hosting → Add custom domain `www.edgetap.tech` → redirect to `edgetap.tech`. Use the exact DNS records Firebase displays, preserve the apex/verification records, wait for TLS readiness, then test HTTP/HTTPS paths and queries without loops. Do not add a catch-all redirect that affects the canonical host.
4. Optional migration 016 changes only new backend publication destinations, with no saved-card backfill. It needs separate review/authorization and read-only verification afterward. The released frontend works without it.

References retained from the reviewed domain work: [Supabase redirects](https://supabase.com/docs/guides/auth/redirect-urls), [Firebase custom domains](https://firebase.google.com/docs/hosting/custom-domain).

## Search and icon handoff

Stable public logo icons are at `/favicon-96.png`, `/favicon-512.png` and `/favicon.ico`; the ICO contains 16/32/48/96/256px frames. `scripts/build-brand-icons.mjs` rebuilds them from the supplied gold/navy ET logo. Keep URLs stable and crawlable. Robots must allow Google to read noindex instructions; privacy is enforced through Auth/RLS, not robots.

In the owner's verified Search Console property, submit `https://edgetap.tech/sitemap.xml`, inspect the homepage/pricing and request indexing. Do not submit private/customer profiles. No request was submitted from the available signed-out browser. Google's recrawl, selected canonical and search-result icon display remain outside the site's control; HTTP checks cannot establish a real Google crawl. [Google favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search).
