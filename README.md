# EdgeTap

One tap. Infinite possibilities.

Physical NFC cards with a QR fallback and an editable digital profile. The confirmed launch origin is https://edgetapflow.web.app. Cards cost Rs. 999 each; delivery is confirmed separately. Support is on WhatsApp +92 304 414 9674; the approved manual payment method is JazzCash.

This is a Next.js static export hosted on Firebase. Authentication, profile/order storage and uploads use Firebase browser SDKs. Staff manually verify payment, create the customer profile, program NFC, print QR and track fulfillment. There is no payment gateway, automated email, courier integration, attendance service or team dashboard.

Copy `.env.example` to `.env.local` and fill in the public Firebase web configuration. Run `npm ci`, then `npm run dev`. See [AGENTS.md](AGENTS.md) for architecture and verified development/QA commands, [LAUNCH_AUDIT.md](LAUNCH_AUDIT.md) for the audit and [LAUNCH_REPORT.md](LAUNCH_REPORT.md) for results and release steps.

Billing is currently inactive. The app's `(default)` Firestore database is billing-gated; the existing free-tier database is named `default` and needs safe rules/data preparation before selection. Cloud Storage requires Blaze. Online checkout defaults to paused (`NEXT_PUBLIC_ONLINE_CHECKOUT_ENABLED=false`), with WhatsApp handoff; the original checkout services remain intact. See the report before changing database or checkout settings.

Do not interpret this README or historical checklists as proof of launch readiness. Hosting/update terms, delivery details, cancellation/production approval, legal review of the personalized-card policy and live end-to-end verification remain outstanding.
