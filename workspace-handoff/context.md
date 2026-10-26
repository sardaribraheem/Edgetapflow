# EdgeTap workspace context

Updated **27 October 2026**, Asia/Karachi, after the owner-requested documentation move and milestone plan. This is a persistent project handoff, not a full conversation transcript or fresh permission to deploy, send email or modify customer data. Check actual Git status and the current user request before work.

## Current scope and preferences

- Current implementation scope is the **EdgeTap website**, inside `EdgetapFlow/`. On 26 October the owner also explicitly requested **app planning**, recorded in [app next steps](EdgeTapApp/docs/NEXT_STEPS_PLAN.md). App source/implementation remains unchanged; do not resume implementation from historical notes alone.
- Communicate in **English only**. Use plain wording, act on authorized work, preserve previous work and avoid repeated permission questions. Ask only for genuinely missing decisions or scope.
- Preserve real customer records and privacy. The owner reported their first paying customer, Tarsil.pk, wanted a tag rather than printing. They explicitly chose **Leave the existing profile unchanged**, including its public Email link. No deletion or profile-link removal is authorized by this handoff.
- On 27 October the owner identified Tarsil.pk/TarsilPK and Ibraheem as the only currently valid public profiles, with Umar Khan, Enfotize and Adolf identified as tests. Verify exact stored handles/IDs and related-record impact, then **ask before deleting any test profile**, including those named. No live inventory, hiding or deletion was performed for the planning/docs task. This snapshot does not classify future customer signups or authorize associated account/order/payment/file deletion.
- Keep credentials, private receipts, delivery details, personal diagnostics and customer backups out of Git. Public avatar visibility must be disclosed. Never infer real funds, email receipt, physical printing, tag programming or handoff from a mock or status click.

## Workspace and Git boundaries

Root: `/Users/arslananwar/Developer/Active/edgetapStuff`.

| Path | Purpose |
|---|---|
| `EdgetapFlow/` | Website, checkout, public profiles and admin tools; its own Git repository |
| `EdgeTapApp/` | Separate companion app source, currently outside this website task |
| `docs/` | Maintained general website/business/research guides, moved from `EdgetapFlow/docs/` at owner request |
| `updateplan.md` | Ordered implementation milestones; existing-site cleanup first, with owner approval before test-profile deletion |
| `context.md` | This workspace orientation and conversation handoff |
| `AGENTS.md` | Startup pointer for agents launched at the workspace root |
| `README.md` | Workspace entry point |

There are **two Git repositories**. The outer repository has no remote and ignores `EdgetapFlow/`. Do website commits/pushes inside `EdgetapFlow/`. Preserve the unrelated untracked `revenue.nd`; it was present before this handoff update.

- Current website documentation branch: `codex/customer-growth-plan-2026-10-26`; the preceding released feature branch was `codex/free-profiles-admin-flexibility-2026-10-26`.
- Latest feature commit: **`cb15afe`**, pushed to `origin`; later documentation-only commits may follow. Inspect Git for the current HEAD.
- Website remote: `origin` → `git@github.com:sardaribraheem/Edgetapflow.git`.
- `origin2` is `https://github.com/sardaribraheem/Edgetapflow-new.git`; do not switch publication targets merely because it exists.
- Root/app history is on `codex/android-companion-2026-10-21`. Root `docs/`, `updateplan.md` and app documentation belong to this outer repository, which still has no remote. The owner-requested cross-repository docs move preserves files locally but is not a new remote backup. Earlier website-doc versions remain in website Git history. No app implementation was changed.

## Website authority and current recorded release

Read [website instructions](EdgetapFlow/AGENTS.md), [launch status](docs/LAUNCH_STATUS.md) and [guide index](docs/README.md). These are maintained authorities; do not use older app notes or this summary to override newer website decisions.

The root [update plan](updateplan.md) is the ordered execution plan. The owner requested moving the website's entire general `docs/` folder to the workspace root; 17 files including the prepared email HTML moved, with links/startup pointers updated. App-specific technical docs stay in `EdgeTapApp/docs/`. Milestone 1 is site cleanup with an exact read-only profile inventory and owner confirmation before deletion; implementation/data milestones remain pending. No code, hosted services or customer records changed during the move.

- Brand **EdgeTap**, “One tap. Infinite possibilities.” Preferred origin **https://edgetap.tech**.
- Next.js App Router/React/TypeScript/Tailwind/GSAP static export to `out/`. Firebase project `edgetapflow` is **Hosting only**; Supabase project `dxyxvervvlxhwwbcbttd` handles Auth/Postgres/RLS/RPCs/Storage.
- Latest recorded Hosting **`cabbc34a2b3f0358`**, **26 October 2026, 8:32:34 am Pakistan time**. Hosted migrations **001–015 plus 017–026**. **016 remains unapplied**. Do not blindly push pending migrations, rerun/edit applied files or rewrite saved NFC URLs.
- The 024/025/026 release preserved existing profiles, orders, payments, pricing/outbox data and app function definitions. Existing Firebase hosts/Auth callbacks/approved snapshots remain supported. The app source was untouched.
- Public and private profile/account routes remain noindex. Unknown `/u/*` handles never fall back to the founder. New profile URLs use `edgetap.tech/u/<handle>`.

## Current product decisions

- Admin → Settings controls current/crossed-out prices, offers/availability, renewal, additional-card and additional-link rates. The immutable server catalog controls new quotes; submitted orders/corrections keep their agreed revision. Use the current catalog, not old spoken prices.
- Initial catalog: Link Card 999 (comparison 1399), Profile Card 1499 (comparison 2200), Website + four cards 29999 (comparison 36999). Initial explicit bundles: Profile 2/2099 and 3/2499; Link 2/1599 and 3/1999. No five-card offers. Matching extra cards initially 700; ten links included and extra paid links initially 50 once/profile. These are defaults, not a claim that admin has never changed the catalog.
- **One free website profile per confirmed account**, up to **ten links**, no payment/order/staff acceptance. This limit was explicitly confirmed by the owner. Profiles carry EdgeTap branding and a card-order CTA. Owner card ordering reuses the saved owned profile and catalog rate; another visitor cannot gain ownership through a URL hint.
- A public Email link is optional and independent of private account email. New drafts do not preselect Email. The profile builder formats WhatsApp as `https://wa.me/…`, Email as `mailto:…` and missing website schemes as `https://…`. WhatsApp needs the country code; do not claim local `03…` numbers are automatically converted to `92…`.
- Payment accepts a transfer reference **or** an owned private receipt. Evidence does not automatically verify funds. Upload failure can be handled by a reference instead. Bank is the default display label; new website orders have no separate customer delivery fee, disclosed at payment. Historical terms remain saved per order.
- Staff can publish an order profile directly without mandatory payment/review/specification/proof/email steps. Publication never fabricates those other facts. Printed card, NFC tag/chip only and digital-only modes are supported; changing mode does not reprice the agreed order.
- Eight staff checklist steps are optional/private: name, links, photo/bio, hardware, payment, profile/destination, production and handoff. Explicit review start/completion appears in the customer account without automatic email. Staff can record actual manual fulfillment independently of optional print tools.
- Admin can edit customer public fields without the customer password and remove/restore public visibility. Ownership, handles, orders and accounts remain intact. Customers cannot bypass moderation by creating a second free website profile.
- Public profile bodies never show Edit profile. Customers use the signed-in side menu → Edit profile; signed-out visitors see Sign in / Login. Both customer and founder saves require fresh matching read-back before success. Homepage links use the saved founder profile.
- Reviews are real only: half-stars, eight per ranked batch and Show more. Private feedback remains private. Preserve the existing gold pricing comparison, supplied assets, original four-slide story, tap/QR demo and accessibility behavior.

## Customer growth research, 26 October

The owner requested competitor research and a customer-acquisition/feature plan, considering four or five free links. Later browser access succeeded for `profile.itseweb.com`: Profile Way has 40 checked template previews, displayed monthly/yearly software offers and a doctor profile with contact/QR/appointment/enquiry sections. The [customer growth plan](docs/CUSTOMER_GROWTH_PLAN.md) records sources, prices/evidence limits, mobile UX observations, three proposed profile families (Professional/Portfolio/Local Business), review hardware, separate hardware/software/setup offers and a staged website update/pilot. Private editor, booking delivery, hardware inclusion, sales and reported owned printers/rider were not verified. No forms were submitted.

The owner has a meeting with Usama on **27 October** and suspects a development role may be discussed; there is **no actual job/equity offer yet**. The [meeting and offer brief](docs/USAMA_MEETING_2026-10-27.md) includes priority questions, a paid scoped trial, evening-hours/offer comparisons, equity/revenue/licence explanations and protecting independent EdgeTap work. It records scenarios rather than an accepted commitment; actual private company/customer documents should stay outside project notes. The [app next-steps plan](EdgeTapApp/docs/NEXT_STEPS_PLAN.md) records stale app delivery/price/order handoff and capability assumptions, source-preserving compatibility work, real-device acceptance and later template/analytics dependencies. App docs now distinguish historical 019 evidence from newer shared website state.

Recommendations remain proposals: retain ten free links through the pilot, consider five only for future profiles after clarifying paid value, preserve existing/purchased allowances, and use supplier printing/delivery per order until measured demand/costs justify ownership. The live offer/catalog and customer profiles are unchanged. No implementation, deployment/data changes, equipment purchase, private ITSE access or outreach occurred. Website documentation is on `codex/customer-growth-plan-2026-10-26`; app/workspace documentation belongs to the separate outer repository. Check actual Git status for unpublished work.

## Email and remaining work

Signup confirmation is enabled; ordinary subsequent login uses a password. A read-only Auth settings check confirmed email sign-in enabled, signup enabled and auto-confirm disabled. SMTP provider/delivery is not established by that public endpoint.

The [branded authentication email plan](docs/AUTH_EMAIL_PLAN.md) and confirmation/recovery HTML templates are prepared. **No Auth SMTP, DNS, sender or template settings were changed.** Order/proof worker/provider secrets/scheduler remain inactive, `emailNotificationsEnabled=false`. Auth SMTP is separate from order notifications. No automatic customer email on checklist/direct-publication actions.

Actual new-user confirmation/recovery inbox delivery, hosted signed-in private-byte access, physical tag programming/QA/handoff, print quality/stock intake and remaining business/domain terms still require their own evidence. The owner's first-sale report is commercial evidence, not proof that the tag was programmed or delivered.

## Verification and commands

The 26 October release recorded production/fixture builds, TypeScript, lint (zero errors, 18 existing warnings), legacy SQL regressions, 17 pricing/profile and 16 new SQL scenarios, 97 website/26 pricing and 28 new browser checks. Release guard: 119 SEO/static assertions, 153 text assets, 249 exported files. Exact release transaction and hosted read-only verifier passed; 24 anonymous live HTTP/browser checks passed. Local Auth/Storage/funds were simulated. Details and fingerprints are in [release history](docs/RELEASE_HISTORY.md).

Website commands: `npm run typecheck`, `npm run lint`, `npm run build -- --webpack`, `npm run check:release`, `npm run test:supabase`, `npm run test:free-profiles`. Read the installed Next.js guides required by AGENTS.md before changing framework code. Static preview uses `npm run serve:qa`, not `next start`. Never deploy the isolated fixture export. On this machine `/usr/local/bin` supplied the working Node binary; use `PATH=/usr/local/bin:$PATH` if the Homebrew Node path fails.

## Terminal continuity, Context7 and memory

Checked locally on 26 October: Codex CLI `0.162.1`; Context7 is enabled in the CLI config and live resolve/query calls succeeded in this conversation. Context7 supplies current library documentation, not conversation memory. Terminal connection health can differ from this interface.

CLI memory flags `memories`, `memories.generate_memories` and `memories.use_memories` are enabled, but no generated memory directory/summary was found during this check. This proves configuration, not successful memory generation or transfer of this chat. Native memory does not replace these project files.

A new terminal session is not guaranteed to inherit this chat transcript. `codex resume` opens a picker for saved local sessions; resume this conversation only if it is actually available there. `codex resume --last` selects the most recent saved session, which might be different work. No chat/session contents were inspected or exported for this check.

For a new website session, start inside `EdgetapFlow/` and tell the agent to read `AGENTS.md`, `../context.md` and the current launch status. Startup AGENTS pointers route to the handoff. Keep this file current when material decisions/releases/scope change; use the topic guides for details and actual Git/files as evidence.

## Historical companion app handoff (recorded 21 October)

The following app-only brief is retained from the previous handoff. It is historical context, **not an instruction to resume app work** or a fresh app audit. Only read/modify the app when the user explicitly assigns app work, then consult its own AGENTS/README/PRD/backend/verification docs.


Read the complete PRD before implementing; this summary is not a substitute.

- Resolve paths as `WEB_DIR=EdgetapFlow`, `APP_DIR=EdgeTapApp`. During app implementation, **website source/dependencies/configuration/migrations/assets are read-only**. All new app code, evidence maps, tests and proposed backend changes belong in the app directory.
- Android first; implemented with Expo SDK 58 / React Native / TypeScript and a local Kotlin HCE module. The [21 October Android preview and verification](EdgeTapApp/docs/VERIFICATION.md) records the APK, 59 mocked browser checks and four native parser tests; a source tree or compile is not real-phone interoperability evidence.
- Two entry actions: existing user signs into the same backend identity/profiles; new user starts a digital profile without purchasing a card. Name required, bio/photo optional, photo crop, many links, version-aware saves and existing-profile selection.
- Home: actual selected profile, Edit, prominent Order a card CTA, NFC sharing, large QR popup and share/copy URL. Additional-profile creation, full native checkout and iPhone are later scope. Existing multiple profiles must remain selectable.
- Do not manufacture paid orders to enable digital profiles, duplicate an owned profile during checkout, or silently truncate links. The separately approved 019 supplies first-profile creation and staff-recorded link upgrades; it is already applied and must not be rerun. Existing-profile card binding and genuine analytics remain separate dependencies.
- Phone-to-phone NFC needs real-device feasibility evidence and honest unsupported/error states. Recipients need no EdgeTap app/account; QR/link fallback remains available. An NFC transfer is not proof the public page opened.
- Statistics require real data. Distinguish recorded opens, estimated browser connections, measured zero and unavailable tracking. No fake charts/visitors, IP-based unique-person counts or hidden website instrumentation. The app alone cannot observe anonymous recipient web renders without a permitted collection/read contract.


## Backups and scope

The website source is backed up on its GitHub branch. The outer repository/context/app history has no remote, so its local commits are not a GitHub or live database backup. Generated diagnostics, `.next/`, `out/`, credentials and private snapshots stay ignored. Prior test-data cleanup is historical and must not be repeated without a new scoped request. Current user instructions override any older handoff statements.
