# EdgeTap

One tap. Infinite possibilities.

Next.js static website at **https://edgetap.tech**, backed by Supabase Auth, PostgreSQL and Storage. Firebase provides Hosting only. Start with [current status](docs/LAUNCH_STATUS.md) and the [guide index](docs/README.md).

The latest recorded production release is `f5c31e156838a13f` (18 October 2026). Hosted migrations are **001–015 plus 017/018**; **016 remains unapplied**. Email delivery and its scheduler remain inactive. Real customer checkout/uploads and complete paid physical fulfillment still need verification. The companion app is deferred.

```sh
npm ci
npm run dev -- --port 3001
```

Keep `.env.local` private. For another checkout, copy `.env.example` and supply public Supabase configuration. Never put service-role keys or mail credentials in browser variables.

| Task | Guide |
|---|---|
| Edit pages, artwork and interactions | [Developer guide](docs/developerguide.md) |
| Operate orders, proof review and printing | [Admin guide](docs/adminguide.md) |
| Understand data, permissions and isolated tests | [Backend guide](docs/backendguide.md) |
| Build, deploy, recover or configure domains | [Build guide](docs/BUILD.md) |
| Prices, payments, policies and costs | [Business guide](docs/businessguide.md) |
| Release versions and verification limits | [Release history](docs/RELEASE_HISTORY.md) |

Generated browser screenshots/logs, build outputs and private recovery snapshots stay out of Git. Source artwork and reproducible test scripts remain in the repository. Older plans and reports were consolidated on 18 October; tracked history remains available through Git.
