# EdgeTap

One tap. Infinite possibilities.

Next.js static website at **https://edgetap.tech**, backed by Supabase Auth, PostgreSQL and Storage. Firebase provides Hosting only. Start with [current status](../docs/LAUNCH_STATUS.md) and the [guide index](../docs/README.md).

The latest recorded production release is `a0df4c3bc6c57c7f` (30 October 2026). Hosted migrations are **001–015 plus 017–032**; **016 remains unapplied**. Order email delivery and its scheduler remain inactive. Real customer checkout/uploads and complete paid physical fulfillment still need verification. App next steps remain planning scope.

The owner moved maintained guides to workspace root `../docs/` on 27 October. The [update plan](../updateplan.md) starts with site cleanup and explicit approval before test-profile deletion. Root guides belong to the separate workspace repository and are not included in a standalone clone of this website repository. Earlier documentation remains in website Git history.

```sh
npm ci
npm run dev -- --port 3001
```

Keep `.env.local` private. For another checkout, copy `.env.example` and supply public Supabase configuration. Never put service-role keys or mail credentials in browser variables.

| Task | Guide |
|---|---|
| Edit pages, artwork and interactions | [Developer guide](../docs/developerguide.md) |
| Operate orders, proof review and printing | [Admin guide](../docs/adminguide.md) |
| Understand data, permissions and isolated tests | [Backend guide](../docs/backendguide.md) |
| Build, deploy, recover or configure domains | [Build guide](../docs/BUILD.md) |
| Prices, payments, policies and costs | [Business guide](../docs/businessguide.md) |
| Release versions and verification limits | [Release history](../docs/RELEASE_HISTORY.md) |

Generated browser screenshots/logs, build outputs and private recovery snapshots stay out of Git. Source artwork and reproducible test scripts remain in the repository. Older plans and reports were consolidated on 18 October; tracked history remains available through Git.

The [30 October catalog release](../docs/PRODUCT_CATALOG_RELEASE_2026-10-30.md) adds detailed hardware prices, catalog checkout, staff pricing/backups and core business sections. Annual/trial foundations remain disabled; existing free rights and customer records are preserved.

The [pricing logic follow-up](../docs/PRICING_LOGIC_AUDIT_2026-10-30.md) clarifies offer scope and economic limits, independently loads actual catalog prices and revalidates page HTML after releases. Current published price amounts and customer terms are preserved.
