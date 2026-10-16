# EdgeTap

One tap. Infinite possibilities.

**Current launch authority: [docs/LAUNCH_STATUS.md](docs/LAUNCH_STATUS.md).** The owner is prioritizing a small, personally managed physical-card launch at NASTP NIIT. **App development is deferred until explicitly resumed.**

The website is a Next.js static export on Firebase Hosting at `https://edgetapflow.web.app`. Supabase handles Auth/Postgres/Storage. The 16 October release confirms migrations 001–015, 482 production browser checks and 38 read-only backend checks; [release evidence](docs/RELEASE_2026-10-16.md) records the version and scope. Historical builds and simulations do not establish actual customer email, private-file success, funds, proof receipt or complete physical fulfillment. A sample is obtained and partly tested by the owner; its front print is fading. See the launch-status findings rather than older reports for remaining work.

Owner-confirmed offers: Link Card Rs. 999; EdgeTap Profile Rs. 1,499; Website + Cards Rs. 29,999, delivery separate. The offers/editor/private-proof flow is released with migrations 012–015; see [card offers](docs/CARD_PRODUCTS.md). Existing submitted prices are preserved. JazzCash is the current manual payment method; actual funds require verification. Public profile data and private order/receipt/artwork data remain separate. Printing requires the current accepted specification, actual payment and guarded proof review. There is no automatic payment gateway or courier integration.

Keep the existing `.env.local`. If setting up another development copy, use `.env.example` and public Supabase values only; no service-role/SMTP credentials in browser variables. Supabase is the selected backend; explicit Firebase data adapters remain a legacy development option. Canonical `.web.app` has not changed.

```sh
npm ci
npm run dev -- --port 3001
```

For build/verification commands use [BUILD.md](docs/BUILD.md). Any production change or real operational test needs its corresponding owner authorization; this documentation audit does not deploy, migrate, send email, create real orders, spend money or change customer policies.

| Need | Read |
|---|---|
| Current evidence, costs and next action | [Launch status](docs/LAUNCH_STATUS.md) |
| Review proposed fixes | [Operational fixes](docs/OPERATIONAL_FIXES_FOR_REVIEW.md) |
| Frontend edits without AI | [Developer guide](docs/developerguide.md) |
| Backend/security/testing | [Backend guide](docs/backendguide.md) |
| Staff workflow | [Admin guide](docs/adminguide.md) |
| Personally managed launch | [Business guide](docs/businessguide.md) |
| All documents/history | [Guide index](docs/README.md) |

Existing pickup/payment/hosting and personalized-card terms are preserved. NIIT is the owner's launch focus; it does not automatically replace current Delta 3 pickup copy/hours. No custom-domain switch has been decided. [Historical reports](docs/archive/README.md) preserve release/migration/test evidence and superseded notes without presenting them as active blockers.
