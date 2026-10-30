# Admin workspace and local business backups

Released **30 October 2026** under the owner’s explicit publication request. Hosting **`d94632fc5fe1f7e4`** at **https://edgetap.tech**; exact migrations **028–032** applied after the prior history. Optional **016 remains unapplied**; existing **019 app function definitions and all guarded existing records were preserved**. Source branch `codex/product-pricing-milestones-2026-10-30` includes feature commits `6866d0c` and `6b10d86`. Future-cohort trials and annual purchases remain **disabled**, existing free profiles/terms are preserved, and email transport remains inactive. See [full release evidence](PRODUCT_CATALOG_RELEASE_2026-10-30.md). The initial admin implementation was `bc575ce`; it is included in this production release. No actual customer export, deletion, email or app-source change was performed.

## Workspace layout

The owner supplied `https://lifeos-ibraheem.firebaseapp.com/` and its archived local source as a reference. The new EdgeTap workspace uses a 232 px full-height desktop sidebar, compact sticky header, aligned overview cards, mobile menu and Command/Ctrl+K section/order search. EdgeTap's cream, navy, gold, fonts and icon system remain. LifeOS source was read only; no dependencies were added.

Sections are Dashboard, Orders, Clients, Profiles, Reviews, **Pricing**, **Data & backups** and Settings. Website prices and offers now have their own Pricing section; fulfillment settings stay in Settings. Search covers workspace sections and loaded orders, while the profile directory retains its own search. Overview order metrics cover the loaded recent inbox (up to 200); they are not traffic analytics or lifetime sales totals. Backup counts use full tables rather than the inbox limit.

Profiles keep customer management first, with a collapsed **Founder profile editor**. Each directory row exposes **Export profile** and **Review deletion**. Review deletion opens the existing account/cleanup section and explains blockers even for an active profile. Hide/Restore remain reversible. Permanent deletion still requires an eligible hidden profile, exact handle and a reason; protected founder/Tarsil profiles and other existing retention blockers remain guarded. It retains the handle reservation, accounts, order/payment history and files. **No actual profile was deleted. Ask the owner before deleting any identified test.**

## Export a local copy

After the release, sign in as staff and open **Data & backups → Export all business data**, or use **Profiles → Export profile**, or the export icon on a **Clients** row. A customer export uses the actual customer identity, including staff-managed customers; it is not grouped by a coincidentally matching email.

1. Keep **Include stored files** on for file bytes as well as records. Turn it off for records and references only.
2. Encryption is on by default. Enter and confirm a passphrase of at least 12 characters; keep it separately from the backup.
3. Download the `.etbackup` file (encrypted) or `.zip` (readable). The UI reports that the browser started the download; verify the saved file yourself and keep an independent second copy.
4. Test local unlocking and inspect the archive before relying on it. A successful download does not mark records as archived or authorize removal from the cloud.

The staff-only SQL export contains an explicit allowlist of business tables: profiles/links/ownership, customers, account identities, orders/contacts/drafts/applications, payment and fulfillment records, reviews/private feedback, notes/actions/email job records, settings/catalog/template metadata and optional existing app request/payment records. Auth identities include user ID/email/timestamps only. **Passwords, session/refresh tokens, SQL schema/roles/staff grants, raw migration/quarantine archives, server secrets and external settings are excluded.** This is a business copy, not a full Supabase recovery image.

Supported file buckets are `avatars`, `order-artwork`, `payment-receipts` and `print-packages`. Full export includes their current objects, including orphan uploads. Customer scope includes referenced files and that customer's user-prefix uploads; profile scope includes referenced files. Files download through the normal authenticated Storage client, under existing policies. No browser service-role credential is used. A missing/denied file fails the complete download rather than silently claiming all bytes were saved.

Each ZIP contains `backup.json`, `manifest.json` with SHA-256 hashes, and optional `files/<bucket>/<object>` entries. Paths reject traversal, absolute paths and duplicate entries. Exported files remain online. Exports are capped at **64 MiB and 1,500 archive entries** to bound browser memory; JSON export itself is capped at 50 MiB. Use scoped exports or an operator backup for larger data. The default uncompressed ZIP preserves original file bytes. Repeated downloads consume provider egress; archiving is not free bandwidth and does not lower cloud storage by itself.

## Unlock and inspect without changing the site

**Data & backups → Unlock an encrypted backup** takes the local `.etbackup` plus its passphrase and downloads a ZIP. Decryption happens in the browser; it does not upload the file or import/overwrite records. Wrong keys or modified ciphertext fail authentication.

For recovery if the website is unavailable, download and keep the standalone offline helper from `/tools/edgetap-unlock.mjs`. It uses Node built-ins and needs no network, account or installed project dependencies. From the website checkout, the equivalent wrapper is:

```sh
node scripts/unlock-local-backup.mjs --input /private/path/backup.etbackup --output /private/path/recovered.zip
```

Enter the passphrase at its hidden terminal prompt. The output must not already exist; it is created with mode 0600. For automation, `--passphrase-file` requires a private mode-0600 file; never pass the secret directly in shell arguments. The encrypted format uses AES-256-GCM and PBKDF2-SHA256 with 250,000 iterations, random salt/nonce and an authenticated version header. There is no passphrase recovery service.

The independent test extracts files using Python's standard ZIP reader, validates CRC/SHA-256, and reproduces the exact archive through both browser and offline unlocking. This proves local byte recovery, **not a production database restore**. Full disaster recovery still needs an operator-managed SQL/Auth/configuration backup and a separately reviewed isolated restore. Never feed this JSON directly into live tables or re-enqueue old email jobs.

## Backend and release boundary

Applied `supabase/migrations/202610300028_admin_business_backups.sql` creates only `admin_backup_overview()` and `admin_export_business_data(text,uuid)`, grants authenticated execution and denies anonymous execution. Both call `private.require_staff()`, use empty search paths and are read-only. Installing the definitions must leave customer/Auth/file/mail data and existing 019 app functions unchanged. No new bucket policy is required.

Release completed with exact 028–032 and the guarded production export. Hosted grants/anonymous denials and existing-record/app preservation checks passed. Future releases must recheck current history and apply only exact authorized new definitions; never rerun these files or blindly include 016. A signed-in real export/private download remains a separately evidenced operator check.

## Verification

- TypeScript and production/isolated-fixture webpack builds pass. Lint: zero errors, 18 pre-existing warnings. Production release guard: 119 static checks and 154 scanned text assets, including the offline helper.
- Isolated SQL: ten new export/authorization/scope/preservation groups, 17 existing profile/account groups and the legacy Supabase suite.
- Seven archive/encryption/offline recovery groups, including independent ZIP validation, wrong-key/tamper failure and safe offline output.
- Browser: 22 new workspace/export/recovery checks, 26 existing pricing/profile checks, 26 account/deletion checks and 28 free-profile/staff-flow checks (102 browser assertions in total). Auth/Storage are simulated; business RPCs run in isolated Postgres-compatible fixtures.
- These initial automated results used isolated fixtures. Subsequent owner-authorized production publication and read-only verification passed; no live private export, actual customer mutation or mail was used for testing. See current [launch status](LAUNCH_STATUS.md).
