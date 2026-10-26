# EdgeTap workspace

New AI session: read [context.md](context.md) first for the current website handoff and recorded app history. [AGENTS.md](AGENTS.md) provides the startup pointers.

Start with the [milestone update plan](updateplan.md): existing-site cleanup comes first, with owner confirmation before deleting test profiles. Maintained website/business/research guides now live in root [docs/](docs/README.md).

The website and its GitHub repository are in [EdgetapFlow](EdgetapFlow/README.md). The companion app source is in [EdgeTapApp](EdgeTapApp/README.md); app-specific technical docs stay with the app. Website improvements and app planning are recorded; app implementation needs its own assigned scope and isolation rules.

- [Current status](docs/LAUNCH_STATUS.md)
- [Developer guide](docs/developerguide.md)
- [Admin guide](docs/adminguide.md)
- [All current guides](docs/README.md)

On 27 October 2026, the owner requested moving the website's `docs/` folder to this workspace root. These guides, the milestone plan and the Android app now belong to the outer workspace repository, which currently has no remote. The separate website repository backs up its committed source; a docs-only checkpoint is also backed up on the website origin branch `codex/workspace-docs-checkpoint-2026-10-27` under `workspace-handoff/`. Maintain the originals here; the checkpoint is a snapshot, not another maintained copy. Earlier website-document versions remain in that repository's Git history. Private customer snapshots and credentials remain excluded.
