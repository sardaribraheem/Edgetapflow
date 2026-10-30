# EdgeTap workspace context

Updated **30 October 2026**, Asia/Karachi, after owner-authorized production publication of the detailed product catalog, admin/backups and supported website milestones. Hosting **`a0df4c3bc6c57c7f`**; hosted migrations **001–015 plus 017–032**, optional 016 unapplied. This is a handoff, not fresh permission to send email or modify customer data. Check Git and the active user request.

## Current scope and preferences

- Current implementation scope is the **EdgeTap website**, inside `EdgetapFlow/`. The owner explicitly requested **app planning** on 26 October and a more detailed combined plan on 30 October, recorded in [app next steps](EdgeTapApp/docs/NEXT_STEPS_PLAN.md). App source/implementation remains unchanged; do not resume implementation from historical notes alone.
- Communicate in **English only**. Use plain wording, act on authorized work, preserve previous work and avoid repeated permission questions. Ask only for genuinely missing decisions or scope.
- Preserve real customer records and privacy. The owner reported their first paying customer, Tarsil.pk, wanted a tag rather than printing. They explicitly chose **Leave the existing profile unchanged**, including every currently stored public link. No deletion or profile-link removal is authorized by this handoff.
- On 27 October the owner identified Tarsil.pk/TarsilPK and Ibraheem as the only currently valid public profiles, with Umar Khan, Enfotize and Adolf identified as tests. Verify exact stored handles/IDs and related-record impact, then **ask before deleting any test profile**, including those named. The later admin/account task inventoried the current records and separated only the two hidden Umer profiles plus their linked order under explicit owner direction. No profile was permanently deleted. This snapshot does not classify future customer signups or authorize associated account/order/payment/file deletion.
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

- Current website implementation branch: `codex/product-pricing-milestones-2026-10-30`, pushed to origin; inspect Git/remote for later changes. The previous released branch is `codex/admin-profile-order-controls-2026-10-27`, pushed to origin. Previous workflow/docs branches were pushed before implementation. A docs-only GitHub checkpoint branch `codex/workspace-docs-checkpoint-2026-10-30-products` stores the latest root-guide snapshot (27 October checkpoint retained); maintain originals in root `docs/`.
- Released feature commits: **`6866d0c` and `6b10d86`** on `codex/product-pricing-milestones-2026-10-30`; inspect Git for the final release/handoff commits and remote verification. Prior released implementation: `6ceccc0`. Inspect Git for later commits.
- Website remote: `origin` → `git@github.com:sardaribraheem/Edgetapflow.git`.
- `origin2` is `https://github.com/sardaribraheem/Edgetapflow-new.git`; do not switch publication targets merely because it exists.
- Root/app history is on `codex/android-companion-2026-10-21`. Root `docs/`, `updateplan.md` and app documentation belong to this outer repository, which still has no remote of its own. The owner-requested docs move preserves files locally; a docs-only website checkpoint branch now also backs up a snapshot to GitHub. Earlier website-doc versions remain in website Git history. No app implementation was changed.

## Website authority and current recorded release

Read [website instructions](EdgetapFlow/AGENTS.md), [launch status](docs/LAUNCH_STATUS.md) and [guide index](docs/README.md). These are maintained authorities; do not use older app notes or this summary to override newer website decisions.

The root [update plan](updateplan.md) is the ordered execution plan. The owner requested moving the website's entire general `docs/` folder to the workspace root; 17 files including the prepared email HTML moved, with links/startup pointers updated. App-specific technical docs stay in `EdgeTapApp/docs/`. Milestone 1 remains active. The subsequent admin/account release completed the first dashboard fixes and exact owner-requested Umer separation. Broader public audit and owner approval before permanent test deletion remain pending. See [account/admin release details](docs/PROFILE_ACCOUNT_ADMIN_2026-10-27.md).

- Brand **EdgeTap**, “One tap. Infinite possibilities.” Preferred origin **https://edgetap.tech**.
- Next.js App Router/React/TypeScript/Tailwind/GSAP static export to `out/`. Firebase project `edgetapflow` is **Hosting only**; Supabase project `dxyxvervvlxhwwbcbttd` handles Auth/Postgres/RLS/RPCs/Storage.
- Latest recorded Hosting **`a0df4c3bc6c57c7f`**, **30 October 2026**. Hosted migrations **001–015 plus 017–032**. **016 remains unapplied**. Do not blindly push pending migrations, rerun/edit applied files or rewrite saved NFC URLs.
- The 024/025/026 release preserved existing profiles, orders, payments, pricing/outbox data and app function definitions. Existing Firebase hosts/Auth callbacks/approved snapshots remain supported. The app source was untouched.
- Public and private profile/account routes remain noindex. Unknown `/u/*` handles never fall back to the founder. New profile URLs use `edgetap.tech/u/<handle>`.

## Website product release, 30 October

The owner explicitly requested fixing main-card price loading, publishing, then committing/pushing. [Released behavior and evidence](docs/PRODUCT_CATALOG_RELEASE_2026-10-30.md): resilient independent prices with deadline/retry; detailed standard hardware rates Rs. 400–700; server-authoritative catalog checkout and staff draft/published prices; admin layout/encrypted scoped backups; standalone web image compression with original print-logo preservation; business hours/services/review links. Annual Rs. 1,499 and future 14-day cohort contracts are implemented but **both sales and trials stay off pending owner choice**. Existing free profiles, links, orders, Auth/Storage and 019 app definitions are unchanged; 72 existing table fingerprints passed. No emails, customer exports, profile deletions, real payment or app-source changes occurred. The [milestone plan](updateplan.md) distinguishes implemented features from actual inbox/private-byte/physical evidence, retention/archive work and native alignment. Historical planning statements below describe their earlier dates and are superseded by this release where applicable.

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

## Admin/account correction, 27 October

The owner clarified that Tarsil owns the existing login and Umer is separate, with no email/confirmation/message. Both hidden handles `umer-khan` and `umerkhan`, plus the one linked Umer order, were separated into staff-managed customer records without new Auth users. The copied former-login email was cleared only from the moved order contact; Umer's phone remains with Umer. All six profiles and four orders remain. Tarsil's existing login, current public fields/links, order/contact and payments were preserved; no missing public Email link was added/restored. Other profiles were untouched. A private ignored backup and 21-table/Auth/app-function preservation guards passed, followed by read-only access verification. No profile was permanently deleted and no application was rejected during the correction.

New controls distinguish Hide/Restore from guarded permanent deletion, expose linked account/order identity and staff-managed records, allow scoped contact correction, show application rejection/request-changes at the top and collapse optional order sections. Clients groups by customer identity rather than email. See the [maintained release guide](docs/PROFILE_ACCOUNT_ADMIN_2026-10-27.md) for security/deletion blockers, tests and limitations. Ask before actual deletion of any test. Separation does not revoke existing shared-device login sessions; sign out on shared phones.

## Customer growth research, 26 October

The owner requested competitor research and a customer-acquisition/feature plan, considering four or five free links. Later browser access succeeded for `profile.itseweb.com`: Profile Way has 40 checked template previews, displayed monthly/yearly software offers and a doctor profile with contact/QR/appointment/enquiry sections. The [customer growth plan](docs/CUSTOMER_GROWTH_PLAN.md) records sources, prices/evidence limits, mobile UX observations, three proposed profile families (Professional/Portfolio/Local Business), review hardware, separate hardware/software/setup offers and a staged website update/pilot. Private editor, booking delivery, hardware inclusion, sales and reported owned printers/rider were not verified. No forms were submitted.

The owner reports meeting Usama on **27 October** and discussing a possible referral/affiliate arrangement rather than a development job. On 28 October the owner explicitly says **no final decision has been made** and wants to preserve EdgeTap's independence while considering limited available time. Private proposal amounts and messages remain in the conversation rather than versioned guides. The [meeting and offer brief](docs/USAMA_MEETING_2026-10-27.md) is the historical pre-meeting preparation: its salary/equity/royalty examples are not actual offers. No employment, equity, exclusivity, referral quota, free-card supply or change to EdgeTap's product/app scope is recorded as accepted. The [app next-steps plan](EdgeTapApp/docs/NEXT_STEPS_PLAN.md) records stale app delivery/price/order handoff and capability assumptions, source-preserving compatibility work, real-device acceptance and later template/analytics dependencies. App docs now distinguish historical 019 evidence from newer shared website state.

Recommendations remain proposals: retain ten free links through the pilot, consider five only for future profiles after clarifying paid value, preserve existing/purchased allowances, and use supplier printing/delivery per order until measured demand/costs justify ownership. The live offer/catalog and customer profiles are unchanged. No growth-offer/app implementation, equipment purchase, private ITSE access or outreach occurred. The later admin/account changes are recorded separately above. Earlier research documentation is on `codex/customer-growth-plan-2026-10-26`; app/workspace documentation belongs to the separate outer repository. Check actual Git status for unpublished work.

## Hosting cost research, 28 October

The owner requested a provider-cost check and advice on first-year/annual profile pricing after outside feedback. The [hosting cost review](docs/HOSTING_COST_AND_PRICING_REVIEW_2026-10-28.md) records official provider rates, a Firebase published quota-period discrepancy, aggregate-only live sizes, one public cold-load measurement, a clearly assumed FX/annual budget, server operating tradeoffs and a proposed new assisted annual offer. It recommends measuring/optimizing the current architecture before a migration. **No new price, renewal/subscription policy, provider plan, billing setting, data cleanup, email or app implementation is accepted or changed.** Preserve current catalog/free rights and existing customer terms. Provider invoices, monthly egress and actual domain renewal remain unverified; recheck current prices before spending.

The owner later supplies **Rs. 260/card production excluding delivery**, a free student first domain year and **$30 next-year domain renewal**. The [capacity/trial model](docs/PROFILE_CAPACITY_AND_TRIAL_MODEL_2026-10-28.md) supersedes the historical sample/generic domain inputs for future budgeting and distinguishes stored profiles from traffic capacity. The owner is considering a new 14-day trial and Rs. 1,000 annual digital service with a Rs. 500–600 card; interpretation/bundling, delivery, support, retention and final terms remain proposals. Recommend suspension with recoverable drafts instead of immediate destructive expiry, same-profile paid upgrades and grandfathering existing free profiles. **No expiry, permanent email blacklist, customer deletion, price change, subscription, compression or new business-hours/review feature has been implemented by this research.**

## Final pre-implementation plan, 30 October

The owner requested a detailed final plan **before starting implementation**, prefers **Rs. 1,000/year Basic digital service**, and wants a complete supported product-combination chart on Pricing, dashboard-controlled future prices and a cleaner admin. The [ordered milestone plan](updateplan.md) now links the [catalog/operations specification](docs/PRODUCT_CATALOG_AND_OPERATIONS_PLAN.md): digital-only, tags, printed/unprinted cards, external links versus new/existing owned profiles, renewals and additional/replacement hardware, with invalid combinations blocked. Unknown SKU costs/prices stay owner-set or unavailable. Current live catalog/orders/delivery promises are unchanged.

The owner proposed local storage for receipts/order information after confirmation. The plan retains the small private operational/order/payment ledger online and designs **encrypted export of eligible historical bulky files**, with checksums, an independent second copy and tested restore before any separately authorized cloud-file removal. Confirmation alone is not a safe purge trigger: unfinished fulfillment/proofs and unresolved matters still need online access. Provider database backups do not contain Storage object bytes. No existing file was exported, moved or deleted by planning.

The 100-payer model now includes labor and explicitly shows that Rs. 1,000/year is not a guaranteed profit on paid Pro infrastructure. Under stated Rs. 280/$, $30 domain, $25/month Pro, Rs. 10,000 other cash allowance and Rs. 200/customer annual time value, 100 payers at Rs. 1,000 give **−Rs. 22,400/year** before tax; Rs. 1,499 gives Rs. 27,500 and Rs. 1,599 gives Rs. 37,500. These are scenarios, not invoices/market valuations; hardware margin is separate and one-time. Keep Basic as the editable planning anchor, then consciously choose pilot funding, payer growth, paid value mix or a higher future standard price.

The updated [app plan](EdgeTapApp/docs/NEXT_STEPS_PLAN.md) covers current catalog/trial/paid compatibility, selected-profile hardware purchase, compression, archived-file states, the owner-added per-link QR flag initially off, and real-device gates. Original owner-edited PRD and all app source/APK are unchanged. Additional-profile/device-limit, account deletion and store digital-purchase rules remain explicitly bounded decisions. **No coding, deployment, new billing/expiry, email or live data changes are authorized/performed by this final planning task.** Start implementation only when the owner assigns it, following the active milestone and current project instructions.

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


## Released admin/catalog implementation, 30 October

The LifeOS-inspired admin layout, dedicated Pricing/Data & backups, scoped encrypted business/file copies and visible deletion blockers are live as part of Hosting `d94632fc5fe1f7e4`. Website source is pushed on `codex/product-pricing-milestones-2026-10-30` at `e7e432f` (feature commits `6866d0c` and `6b10d86`). Exact migrations 028–032 are applied; 016 stays unapplied. See [release evidence](docs/PRODUCT_CATALOG_RELEASE_2026-10-30.md) and [backup coverage/recovery](docs/ADMIN_WORKSPACE_AND_BACKUPS_2026-10-30.md).

Business exports exclude Auth credentials, schema/roles and server settings and are not full disaster recovery. No production customer export/deletion, cloud-file purge or email occurred. New annual service remains unavailable and trials disabled. The broader archive/retention/import work, real customer/inbox/physical evidence and native compatibility remain open in [the milestone plan](updateplan.md). LifeOS was read only; the app source and owner PRD remain untouched.

## Pricing consistency follow-up, 30 October

The owner requested another logical price/offer review, fixes and publication/push. [Pricing audit](docs/PRICING_LOGIC_AUDIT_2026-10-30.md) records actual launch-price reasoning and limits. Website commits `7853fc0` and `6ab18ad` clarify standard pickup versus customizable delivery/setup, optional once-per-order assistance, planned annual pricing and domain-specific renewal quotes. Hardware pricing reads are independent of profile policy; no invented fallback rates appear during an outage. Checkout waits for a valid destination, and quotes have timeouts. Hosting `a0df4c3bc6c57c7f` publishes those changes plus HTML revalidation while retaining immutable hashed assets. Existing-browser reload and fresh mobile/public checks passed; six live HTML pages match the reviewed export. Fresh verification: 76 browser assertions, quote/lifecycle/business/image SQL checks, build/lint/release guards and 55 read-only backend probes. This follow-up is Hosting-only: no database/catalog amount/customer/app/email changes. Existing cached pages may need one refresh. Source and guide checkpoint are pushed to their existing branches.
