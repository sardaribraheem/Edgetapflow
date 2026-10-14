# Continue EdgeTap on your laptop

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
