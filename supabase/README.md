# EdgeTap Supabase backend

Supabase provides Auth, PostgreSQL/RLS/RPCs and Storage; Firebase provides Hosting only. Confirm the project lock in `project.json` before any operation.

**Recorded hosted history: 001–015 plus 017/018. Optional 016 remains unapplied.** Never rerun the clean installer, reset production or blindly push pending migrations. Checkout version 2 is released; email worker/provider/scheduler remain inactive. A queued job is not sent email. See [launch status](../docs/LAUNCH_STATUS.md).

Use the [backend guide](../docs/backendguide.md) for the migration map, access boundaries, templates, isolated SQL/browser tests and mail activation. Use [BUILD.md](../docs/BUILD.md) for release/recovery and pending Auth/domain settings, and the [admin guide](../docs/adminguide.md) for actual order work.

Read-only inspection: `supabase migration list --linked`, `npm run check:supabase:hosted`, and the applicable reviewed SQL verifiers. These do not verify real inbox delivery, existing private-byte isolation, funds or physical fulfillment. `test:supabase:hosted-browser` still has stale clean-project/absent-founder assumptions.

Keep privileged credentials, private snapshots and signed file links out of Git/logs. Production schema/data changes, worker/service activation and actual customer tests need authorization for their scope. Local tests do not authorize production operations.
