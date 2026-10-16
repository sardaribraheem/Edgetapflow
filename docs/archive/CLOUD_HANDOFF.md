> **Historical snapshot archived 15 October 2026.** Source: `EdgetapFlow/docs/CLOUD_HANDOFF.md` before this launch audit. Superseded status/commands below are evidence of their original run, not current instructions or authorization. Read [current launch status](../LAUNCH_STATUS.md). Unique original content is retained; relative links were rebased for this archive.

# Continue EdgeTap on your laptop

**Latest release — 14 October 2026:** the physical-card UI is live on `https://edgetapflow.web.app`, Hosting version `625185c493bec4f8`. Current source is in the local `feat/physical-card-printing` branch and has not been pushed in this release. Read the final section for verification and remaining business work. The earlier cloud/branch instructions below are historical.

The cloud changes live on `fix/admin-access`. They restore the Tailwind color variables, improve the landing page and mobile navigation, add ordering instructions and keyboard access, and make admin actions wait for refreshed order data.

Fetch the branch from the existing repository on your laptop. Preserve any uncommitted local work before switching branches.

```sh
git fetch origin
git switch --track origin/fix/admin-access
npm ci
npm run dev
```

If that local branch already exists, use `git switch fix/admin-access` instead. Keep your existing `.env.local`; only create it from `.env.example` if it does not exist. The app needs `NEXT_PUBLIC_DATA_BACKEND=supabase`, the approved Supabase URL and publishable key, and `NEXT_PUBLIC_APP_URL=https://edgetapflow.web.app`. Passwords and operator keys do not belong in these public variables.

Firebase serves the website. Supabase handles application authentication, database and files. Firebase CLI authentication is a separate Google permission needed to publish website files.

## Publish when Hosting access is available

```sh
npx --yes firebase-tools@15.33.0 login
npm run deploy:hosting
```

The deployment command rebuilds, checks the resulting export, and publishes Hosting to `edgetapflow`. The check refuses a test-backend export, missing account routes or privileged credentials. It performs no database migration or account change.

After deployment, verify the new ordering section on the homepage, `/account`, `/admin`, and the `/u/<handle>` profile rewrite. The owner signs into the admin page using their own email and password. The owner account was verified and its active staff membership was checked in Supabase; no password is stored in the repository.

## Verified in the cloud

- Production export and TypeScript passed for all 17 static pages.
- Lint passed with six existing image warnings.
- 53 SQL/RLS cases passed against local PostgreSQL.
- 101 ordering, admin, guest-draft and sign-in browser checks passed with local SQL/RLS and simulated Auth/Storage HTTP.
- 449 responsive/navigation assertions passed from 320px to 1440px.
- 41 dedicated profile browser checks passed: independent handles, contact links/vCard, owner editing, unrelated-user access, missing/hidden profiles, retry and owner publication through the admin editor.
- 29 read-only hosted Supabase checks passed.

Local test orders covered delivery and NASTP pickup, receipt submission, review/corrections, payment guards, profile publication and physical fulfillment stages. They did not send funds, upload production customer files or validate physical cards.

## Work still pending

Firebase Hosting publication requires a Firebase/Google login; this cloud session has none. Its live site was checked and still serves the previous UI.

Final-design email sending requires a private mail worker/provider and a monitored reply mailbox. The queue and printing guard are implemented; a queued email does not start the ten-hour review window. Application email delivery, real private-file access, a real customer order/payment and NFC/QR checks remain separate operational validation.

Rotate any operator token previously shared in chat. Routine development and customer/admin sign-in require no operator token.

## Public profile links

`/u/<handle>` displays an active profile published in Supabase. A draft or submitted card application does not create a public profile. Staff publish customer profiles from an approved, paid order under Orders → Publish profile. The owner profile is managed through Admin → Profiles.

On 2026-10-13, the owner explicitly requested restoring the original `/u/ibraheem` example. Inspection confirmed the verified active staff account, the reserved handle and no existing founder profile. A guarded transaction called the existing staff publication RPC with `lib/data/profile.ts` content, refusing to overwrite any existing profile. The founder is now active with its original six links and photo. A fresh anonymous browser on Firebase Hosting verified the profile, photo, links and safe missing-handle screen. This was the requested real owner restoration; local QA created no hosted customer records. The accompanying ordering/admin/motion changes remain local until separately published.

2026-10-14 update: migration `202610140010_profile_editing.sql` is applied. Owners explicitly open Edit profile, stage changes locally, then Save & publish; handles/ownership/publication remain protected and stale saves fail. Account pages list the signed-in user's active profiles. Save Contact now creates a styled PDF with the photo and real clickable link annotations; the PDF library loads on demand. Streamline attribution remains only on the main landing page.

The owner declared the three ordering clients to be test data and authorized deletion after checking `ET-20261013-720A90DA`. That order was already accepted, paid and published at `/u/usama`; its public page and deployed owner-edit RPC were verified, with the latter using a rolled-back SQL-claims test rather than an actual customer JWT login. No physical production stages were advanced. A protected, Git-ignored backup includes only these test orders/clients and their four referenced files. The exact-ID/version cleanup was rehearsed on an isolated restore before execution. Hosted counts now show zero orders, drafts and test customer profiles; the founder, six links, Auth accounts and staff memberships were preserved. The four referenced test files were removed after their bytes were backed up.

Release verification: 449 responsive checks, 154 UX checks, 81 order workflow + 13 guest + 13 sign-in + 45 profile browser checks, 60 SQL/RLS checks, 29 hosted read-only probes, TypeScript/build and export guards passed. Auth/Storage in the local browser workflows were simulated. Lighthouse mobile: accessibility 100, performance 76, LCP 6.6 s, CLS 0; initial loading still needs optimization. Hosting preview verified founder rendering, missing cleaned handles, the actual two-page PDF/11 clickable annotations, 0→40% card-selection progress and landing-only attribution. See `adminguide.md`; design-proof transport is still not configured, so actual email confirmation/review is required before printing.

After preview verification, the owner-requested UI release was deployed to Firebase Hosting only on 2026-10-14: version `e6d4a7a9c45e50bd`, canonical origin `https://edgetapflow.web.app`. No Firebase Auth, Firestore or Firebase Storage rules were deployed. The supported webpack export fallback was used. Source changes remain in the dedicated local branch; protected cleanup backups are excluded from Git and Hosting.

Profile fixes also prevent telephone links opening blank tabs, show My account to signed-in non-owners, provide retry after transient loading failures, and label the owner editor inputs correctly.

## Physical-card implementation — 14 October 2026

The owner approved the physical-card/printing plan and implementation. Source is on `feat/physical-card-printing`. Migration `202610140011_physical_card_printing.sql` is applied after local SQL/browser verification and a single-migration dry run; it adds versioned physical settings, a private PNG/PDF bucket, guarded two-face proof/package RPCs and server-side short references. Existing accounts, founder/profile data and legacy orders are preserved. No production customer, payment, proof, printing or fulfillment records were created or advanced during QA.

Customers now preview their physical card and digital profile independently; printed name/title can differ from digital details. Uploaded front/back artwork supports default-centred, marked or omitted QR; staff can supply corrected backgrounds without replacing customer originals. QR uses the final canonical profile only. The admin package freezes both faces, printer settings and revision, and produces a copyable brief, two-page physical-size PDF and separate PNGs with actual density metadata. Real proof review remains mandatory; queued email is never treated as sent. Defaults are editable starter layouts pending designer assets and printer agreement.

Guides/reports moved to `docs/`; `developerguide.md` explains common frontend edits and `backendguide.md` explains permissions/migrations. Root README and agent instructions remain entry points. The owner authorized publication after verification, and this physical-card release is now published to Firebase Hosting. Local Auth/Storage/email transport tests are simulated; actual PNG/PDF output and QR decoding are verified. Actual printing, NFC and mail delivery remain unverified.

Verification for this implementation: 74 core/application/profile/physical SQL checks (including 14 physical-card checks), 79 full order workflow browser checks, 13 guest + 13 sign-in checks, 45 card/PNG/PDF/QR checks, 154 UX checks and 449 responsive assertions passed. TypeScript, lint (zero errors/six existing image warnings), webpack build and the 130-asset real export guard passed. Hosted probes: 33 read-only checks, including new print RPC/bucket anonymous boundaries. No real customer JWT success flow, mail delivery, funds or printed card is claimed. The physical presets are starter artwork; final designer assets and actual printer requirements remain owner/vendor work.

### Hosting publication and business plan

The release was rebuilt with `npm run build -- --webpack` and checked with `npm run check:release`. The exact export was deployed to the temporary [physical-card preview](https://edgetapflow--physical-card-release-check-rvnqnaqp.web.app), which expires after one day. All **449 responsive/navigation assertions** passed there at 320, 360, 390, 768 and 1440 pixels; the deterministic backend-failure cases in that suite use intercepted requests. Separate fresh browsers used the actual public backend to verify the founder, its PDF download and a valid missing handle. Physical/digital previews, a printed-name override, zero mobile overflow and the absence of pause/resume buttons passed. Normal-motion inspection measured about 32 px/s, graded card scales from 0.86 to about 1.0 and hover pause. The 33 read-only hosted boundary probes passed again.

Only after these checks, `firebase deploy --only hosting --project edgetapflow --non-interactive --json` published version **`625185c493bec4f8`**. Live canonical-origin checks then passed for the physical preview/override, unchanged digital name, founder/contact PDF, missing-handle isolation, account/admin HTTP 200 and noindex, mobile overflow and landing load; no page errors were observed. No Firebase Auth, Firestore or Storage rules were deployed. No live test applications, orders, payments or production stages were written. Hosted admin/customer success flows still need real operator/customer validation; simulated local tests do not establish that evidence.

The owner chose **a small launch managed personally** and is **still comparing printer/NFC suppliers**. [Business guide](../businessguide.md) records the supplier comparison, cost worksheet, pilot proposal and daily order process. Website publication does not remove the operational hold: finalize designer/printer files, approve a physical QR/NFC sample, establish real proof sending/reply handling, verify customer account email and confirm outstanding commercial terms before paid production orders.
