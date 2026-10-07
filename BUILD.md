# Build and hosting

EdgeTap uses Next.js `output: "export"`; `npm run build` writes `out/`. Google fonts are fetched during build and hosted with the export. This machine may need the supported `npm run build -- --webpack` fallback because Turbopack worker port binding is restricted.

Firebase Hosting serves existing exported HTML and assets, with `/u/**` rewriting to `/profile.html` only when no explicit file exists. The generic shell reads the requested handle from the browser pathname. There is no catch-all homepage rewrite: missing pages use the exported 404. Customer profiles load client-side from Firestore; they do not have personalized server-rendered social metadata.

`NEXT_PUBLIC_*` values are public web configuration embedded during build. Firebase access rules, not API-key secrecy, protect private data. Never put service-account keys into client variables. The canonical production origin is `https://edgetapflow.web.app`.

Use [AGENTS.md](AGENTS.md) for commands and [LAUNCH_REPORT.md](LAUNCH_REPORT.md) for measured results and the deferred release procedure. Billing inactivity and the `(default)` database billing gate were verified on 7 October 2026. `NEXT_PUBLIC_FIRESTORE_DATABASE_ID` preserves `(default)` unless explicitly set; the free-tier named `default` needs reviewed rules/data. `firebase.spark.json` prepares only that Firestore target. `.env.local` and deployed services remain unchanged.

`NEXT_PUBLIC_ONLINE_CHECKOUT_ENABLED` defaults to false. Keep it paused until a real order can be persisted using verified infrastructure; current receipt uploads require Blaze-only Storage. The production export offers an honest WhatsApp handoff. No deploy, push, billing activation or paid service provisioning is authorized by these build instructions.
