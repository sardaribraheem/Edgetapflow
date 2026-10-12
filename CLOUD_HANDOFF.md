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
- 29 read-only hosted Supabase checks passed.

Local test orders covered delivery and NASTP pickup, receipt submission, review/corrections, payment guards, profile publication and physical fulfillment stages. They did not send funds, upload production customer files or validate physical cards.

## Work still pending

Firebase Hosting publication requires a Firebase/Google login; this cloud session has none. Its live site was checked and still serves the previous UI.

Final-design email sending requires a private mail worker/provider and a monitored reply mailbox. The queue and printing guard are implemented; a queued email does not start the ten-hour review window. Application email delivery, real private-file access, a real customer order/payment and NFC/QR checks remain separate operational validation.

Rotate any operator token previously shared in chat. Routine development and customer/admin sign-in require no operator token.
