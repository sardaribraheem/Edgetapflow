# Build and hosting

EdgeTap uses Next.js `output: "export"`; `npm run build` writes `out/`. Google fonts are fetched during build and hosted with the export. This machine may need `npm run build -- --webpack` because Turbopack worker port binding is restricted.

Supabase is the default Auth/Postgres/Storage backend. Set the real public `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` locally before building. Missing/privileged configuration fails before bundling. `NEXT_PUBLIC_*` values are baked into static assets; never put operator credentials, service-role/secret keys or database passwords there. RLS/RPC/Storage policies protect customer data. `NEXT_PUBLIC_DATA_BACKEND=firebase` retains an explicit legacy development option.

Firebase Hosting still serves the export and canonical `https://edgetapflow.web.app` domain. `/u/**` rewrites to `/profile.html` when no explicit file exists. The shell reads the requested handle and fetches the exact active profile from the selected backend. Missing pages use the exported 404. Dynamic customer profiles do not have individualized server-rendered social metadata.

The order wizard now uses account-owned cloud drafts and a manual-review application workflow. The legacy instant-checkout flag is unused. Migration 007 is prepared locally and has NOT been applied to hosted Supabase. Do not release this frontend before the new migration and real hosted flows are approved and verified. Delivery fees remain separate from the initial card payment.

Firebase test data/users/files are intentionally not imported and remain untouched. No source recovery is required. See [SUPABASE_MIGRATION_REPORT.md](SUPABASE_MIGRATION_REPORT.md) for actual local versus hosted results and [supabase/README.md](supabase/README.md) for clean setup. The confirmed destination is `dxyxvervvlxhwwbcbttd`; `.env.local` now has its public configuration. The production export build (`npm run build -- --webpack`, with font-download network access) passes and final `out/` uses the real project/key, with no fixture/privileged key. Isolated fixture exports are still for local tests only and must never be published. Hosted schema/RLS/API boundaries are verified; real email/account/staff/order/payment success flows and new-frontend release remain outstanding.

No deployment, push, billing activation or paid provisioning is authorized by these build instructions. Applying an approved clean schema is separate from releasing the website.
