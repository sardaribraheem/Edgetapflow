# EdgeTap

One tap. Infinite possibilities.

Physical NFC cards with a QR fallback and an editable digital profile. The confirmed launch origin is https://edgetapflow.web.app. Cards cost Rs. 999 each; delivery is confirmed separately. Support is on WhatsApp +92 304 414 9674; the approved manual payment method is JazzCash.

This is a Next.js static export served by Firebase Hosting. Supabase Auth/Postgres/Storage is now the default data backend. The clean hosted schema/RLS/RPC/Storage foundation is configured in the confirmed Edgetap project `dxyxvervvlxhwwbcbttd` (region `ap-southeast-2`). Anonymous/API boundaries are hosted-verified; real email/account/staff/customer/payment success flows remain unverified. Existing Firebase records/users/files are disposable test data and are intentionally not imported; Firebase remains untouched. Staff manually agree the quote, verify JazzCash payment, publish the customer profile, program NFC, print QR and track fulfillment. There is no automatic payment gateway or courier integration.

Copy `.env.example` to `.env.local` and fill in the real PUBLIC Supabase URL/publishable key. Never include a secret/service-role key or database password in public variables. A missing Supabase configuration fails the build instead of silently using Firebase. The current local file is configured with the real public Supabase values and retains the legacy Firebase values. Run `npm ci`, then `npm run dev`. Explicit `NEXT_PUBLIC_DATA_BACKEND=firebase` is retained for legacy development; no Firebase billing is enabled.

Standalone signup is available on the account page, with email confirmation and no automatic profile/order/staff creation. Actual email delivery still needs a verified SMTP setup. Online checkout stays paused (`NEXT_PUBLIC_ONLINE_CHECKOUT_ENABLED=false`) until hosted Auth, uploads, orders, quotes and manual payment handling pass. The site offers an honest WhatsApp ordering handoff. See [supabase/README.md](supabase/README.md) for the guarded clean setup and [SUPABASE_MIGRATION_REPORT.md](SUPABASE_MIGRATION_REPORT.md) for LOCAL VERIFIED versus HOSTED VERIFIED. The only authorized destination is `dxyxvervvlxhwwbcbttd`; DukanKhata remains untouched. No website deployment is implied.

Do not interpret this README or historical checklists as proof of launch readiness. Hosting/update terms, delivery details, cancellation/production approval, legal review of the personalized-card policy and live end-to-end verification remain outstanding.
