# EdgeTap

One tap. Infinite possibilities.

Physical NFC cards with a QR fallback and an editable digital profile. The confirmed launch origin is https://edgetapflow.web.app. Cards cost Rs. 999 each; delivery is confirmed separately. Support is on WhatsApp +92 304 414 9674; the approved manual payment method is JazzCash.

This is a Next.js static export served by Firebase Hosting. Supabase Auth/Postgres/Storage is now the default data backend. The clean hosted schema/RLS/RPC/Storage foundation is configured in the confirmed Edgetap project `dxyxvervvlxhwwbcbttd` (region `ap-southeast-2`). Anonymous/API boundaries are hosted-verified; real email/account/staff/customer/payment success flows remain unverified. Existing Firebase records/users/files are disposable test data and are intentionally not imported; Firebase remains untouched. Staff manually agree the quote, verify JazzCash payment, publish the customer profile, program NFC, print QR and track fulfillment. There is no automatic payment gateway or courier integration.

Copy `.env.example` to `.env.local` and fill in the real PUBLIC Supabase URL/publishable key. Never include a secret/service-role key or database password in public variables. A missing Supabase configuration fails the build instead of silently using Firebase. The current local file is configured with the real public Supabase values and retains the legacy Firebase values. Run `npm ci`, then `npm run dev`. Explicit `NEXT_PUBLIC_DATA_BACKEND=firebase` is retained for legacy development; no Firebase billing is enabled.

The application workflow now saves private account-owned drafts, offers delivery and NASTP pickup, accepts private manual JazzCash proof, and provides staff review plus customer status/history through physical fulfillment. Card payment is verified independently of a delivery fee agreed afterward. Requested sizes remain distinct from staff-approved specifications. SMTP is not configured; staff inbox and customer account messages are the notification sources. See [ORDER_WORKFLOW_REPORT.md](ORDER_WORKFLOW_REPORT.md) for implementation, configuration and test evidence.

Migration 007 is prepared and tested locally, but the hosted database still has migrations 001–006. No frontend or database release was performed in this task. Do not release the new frontend until the additive migration and real hosted Auth/Storage/order/staff flows are authorized and verified. The former instant-checkout flag is no longer used.

Do not interpret this README or historical checklists as proof of launch readiness. Hosting/update terms, delivery details, cancellation/production approval, legal review of the personalized-card policy and live end-to-end verification remain outstanding.
