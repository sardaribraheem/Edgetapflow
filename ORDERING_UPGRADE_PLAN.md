# Hosted ordering repair — 8 October 2026

## Cause and scope

Real Supabase sign-in returned HTTP 200. Checkout then needs `get_order_settings()` and the private draft workflow, but at diagnosis the approved EdgeTap project had only migrations 001–006. `get_order_settings()`, `get_my_orders()` and `public.order_applications` were absent. This is an unapplied database workflow, not a Firebase billing dependency. The production frontend at diagnosis still used Firebase. The subsequent approved release now uses Supabase and includes the sign-in fixes.

The real CLI dry run completed and listed exactly:

- `202610070007_application_workflow.sql`: owned drafts, customer/staff read and review RPCs, manual JazzCash review, settings, private notes/events and disabled notification outbox.
- `202610070008_confirmed_card_dimensions.sql`: confirmed dimension configuration.
- `202610070009_confirmed_pvc_rider_fulfillment.sql`: fixed PVC size, private prepared artwork, direct rider fare/status and proof-email/printing gates.

No seeds or custom roles are included. These forward migrations preserve existing IDs and original order fields; one operational settings row is created. They do not send email, authorize staff, create customer accounts/orders/profiles, enable billing, or modify Firebase/DukanKhata. Each migration is transactional; a later failure may leave earlier migrations applied. Inspect and recover forward rather than reset or blindly repair history.

Fresh aggregate hosted inspection: **one Auth user**, zero customers/orders/payments/profiles/reviews/staff members/Storage objects; 17 application tables all RLS-enabled; four existing buckets (`avatars` public, `order-artwork`/`payment-receipts`/`migration-quarantine` private); private schema unexposed. No existing user record is returned. The initial general inspector hit a transient CLI temporary-role connection error; the subsequent focused read-only query and migration dry run succeeded. No password or new privileged key was requested.

The prepared `require-ordering-upgrade.sql` guard also passed against the actual hosted project, with no data changed. The destination is ready for the reviewed database upgrade, and was subsequently upgraded under the owner’s explicit deployment instruction.

## Preflight and approved execution

The current AGENTS.md contains an earlier no-deploy instruction. The owner subsequently said “and yeah deploy it too”, authorizing this required ordering upgrade and website release. Migrations 007–009 were applied with `--skip-vault`; no seeds or role overwrites. The following records the reviewed execution procedure. Its foundation guard intentionally rejects the now-upgraded history; never rerun the original clean installer.

1. Confirm `supabase/project.json` and `supabase/.temp/project-ref` both identify **dxyxvervvlxhwwbcbttd**, and existing CLI login reports **Edgetap / ACTIVE_HEALTHY**.
2. Run the existing installer in **inspect mode only**. Do not rerun its clean-target apply routine on a populated project.
3. Run `supabase/inspect-ordering-upgrade.sql` with `supabase db query --linked --project-ref dxyxvervvlxhwwbcbttd --file ... --output json`. Review migration history, aggregate counts, application-table RLS, four buckets and private-schema exposure. Keep CLI diagnostics local and do not publish customer records.
4. Run `supabase/require-ordering-upgrade.sql` against the same explicit project. It requires exactly foundation history 001–006 and no conflicting workflow objects. Existing accounts/data are allowed. If the target changed or is partially upgraded, stop and inspect; do not delete data to pass this guard.
5. Run `supabase db push --linked --project-ref dxyxvervvlxhwwbcbttd --dry-run --skip-vault`; require exactly the three reviewed migrations, no seed/role/history repair. The initial dry run already confirmed this migration list. Use `--skip-vault` on the final dry run and apply to leave Vault configuration untouched.
6. **Executed after the owner’s approval:** run `supabase db push --linked --project-ref dxyxvervvlxhwwbcbttd --skip-vault`. No `--include-all`, `--include-seed`, `--include-roles`, reset or forced history repair.
7. Verify history 001–009, all application/private tables have RLS, private schema remains unexposed, RPC grants and staff checks are intact, legacy id-only payment RPC is revoked, private receipt/artwork access remains denied anonymously, and approved public settings load via the hosted API. Confirm existing record counts/IDs were preserved; account for concurrent legitimate customer changes.
8. Walk the real customer's authenticated flow with their help. An actual order/payment proof requires their real details and transfer; do not fabricate production fixtures or claim manual payment was verified automatically. Test owned drafts, retries, private receipt access and staff review using real authorized accounts.

Local evidence: 53 SQL/RLS checks, original migration-preservation test and new preflight-guard test pass. Browser evidence: 101 local workflow/guest/sign-in checks, simulated Auth/Storage around actual local SQL; 344 responsive assertions. Build/typecheck pass; lint has seven existing image warnings. Twelve anonymous hosted browser checks pass. None of these substitute for a real submitted order or physical production test.

## Still separate

Verified SMTP/reply mailbox and real proof sender are pending; printing must stay held until actual design email/approval rules are satisfied. Staff enrollment requires the intended real verified administrator and deliberate UUID membership. Production Hosting release, public founder profile, real QR/NFC/card checks and final business/legal decisions remain separate launch work. The owner separately authorized website publication with the pricing redesign. No push to main is authorized. Website verification is recorded in PRICING_DEPLOYMENT_REPORT.md.
