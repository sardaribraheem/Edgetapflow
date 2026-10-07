> **Owner dimensions confirmed — 7 October 2026:** Standard card dimensions are 85.60 × 53.98 mm (imperial quotation 3.375″ × 2.125″, shown approximately). Local migration 008 and the configurable customer/admin size UI are prepared; neither 007 nor 008 is hosted. Variant applicability, materials and remaining business answers are pending. See [BUSINESS_CONFIGURATION.md](BUSINESS_CONFIGURATION.md). Earlier “dimensions undecided” statements below are historical. Launch remains on hold.

# EdgeTap application workflow — 7 October 2026

**Implemented and verified locally; NOT READY TO LAUNCH.** Work stays on `launch-readiness`. No deployment/push, hosted migration 007, billing change, fake production record, Firebase extraction/deletion or DukanKhata operation was performed. Existing user changes to `.gitignore` and deleted root screenshots are preserved and excluded from this implementation commit.

## 1. What was removed, retained or previously absent

History inspection covered the launch cleanup and Supabase commits through `a5c332f`.

- NASTP pickup was removed in launch cleanup `fa2372a`, before Supabase migration. The Supabase order RPC then supported delivery only. It is restored as an explicit fulfillment branch without unconfirmed address/hours or a blanket free-pickup claim.
- Manual JazzCash, receipt upload, five card designs and staff order/receipt viewing survived as code. Online submission was paused by the old instant-checkout flag. These are now integrated into an account-owned application workflow, not removed for being manual.
- Simple, Lux, Wood, Inverted and Upload your card design are retained. No inspected physical-size field existed to restore; requested/approved size handling is new. The previously unconfirmed designer service is not invented as a priced offer.
- Cloud drafts, customer order tracking, application acceptance/rejection/change requests and actual business-email sending were not complete implementations. Drafts/tracking/review/in-app notifications are newly implemented. Earlier email promises were not a working sender.

## 2–3. Restored and newly implemented

Restored NASTP pickup alongside delivery and preserved private manual JazzCash proof/artwork. Added progressive cloud draft saves/recovery, customer status/history, corrections to the same order, separate review/payment/production states, staff messages/internal notes, requested versus approved card specification, separately agreed delivery fees/payment, and disabled event-email outbox architecture.

Staff messages/internal notes survive inbox polling/refresh while unfinished. Receipt verification requires the exact order version reviewed; stale decisions fail. Navigation and submission are serialized. An interrupted submission reconciles the original owned application/order without another order or payment.

## 4. Database changes — LOCAL ONLY

`supabase/migrations/202610070007_application_workflow.sql` is an atomic forward migration, preserving existing records/IDs. It adds five tables:

| Table | Purpose / boundary |
|---|---|
| `public.order_applications` | RLS-protected account-owned draft payload, step, version, state and linked order; customer/staff SELECT, no client direct writes |
| `private.application_events` | Customer-visible status/messages, actor and timestamp, exposed only through narrow authorized RPC responses |
| `private.order_notes` | Internal staff-only notes, excluded from customer responses |
| `private.notification_outbox` | Event-linked email delivery architecture; all transport disabled, no sender running |
| `private.order_settings` | One operational configuration row: instructions/size option labels, versioned staff updates |

Orders gain application review state, requested card size, approved size/design, customer notes, separate delivery payment state/reference/verified amount. Payments gain verified card amount. Monetary storage remains integer minor units; initial delivery fee/complete total are nullable for delivery. Pickup has no delivery fee and card-only total. This does not create a new pickup-service pricing policy.

RPCs support draft save/submit/recovery, owner order reads, versioned review/specification/delivery actions, notes/messages and settings. Existing handle/ownership/publication transactions and buckets remain. The legacy id-only `confirm_payment(text)` endpoint loses client execution; `verify_application_payment(text,bigint)` prevents approval using stale proof. No direct-client state/price/owner mutation is introduced.

The hosted project remains on **001–006**. Do not deploy the new frontend against that schema. Before any separately approved database release: inspect ONLY `dxyxvervvlxhwwbcbttd`, check current data/history, review `db push --dry-run` for ONLY 007, then apply and verify forward. Never reset, rerun the original clean installer on an initialized database, delete data or repair history to pretend SQL succeeded.

## 5. Admin workflow and first administrator

**Intended account: sardaribraheem277@gmail.com.** Read-only inspection found no matching account; no signup/invite/forced confirmation or membership write occurred. You will register and verify normally. Then an authorized operator uses `node scripts/enroll-edgetap-admin.mjs --inspect` and deliberately `--apply`. The helper locks the exact EdgeTap project, requires exactly one verified real account, is idempotent, and refuses revoked membership. Email selects the owner-approved bootstrap UUID; runtime authorization uses active protected `private.admin_members` UUID membership, never an email comparison or user metadata.

Admin → Orders shows newest submissions, filters, customer/contact/profile/handle/card/size/fulfillment/proof/reference/amount/notes/time/status details. Open a record to review the actual JazzCash transfer, verify/reject card payment, approve specification, accept/reject/cancel/request changes, publish the profile, add customer-visible messages or separate private notes, then record physical production/NFC/QA and delivery/pickup actions. Rejection/cancellation does not imply a refund. Closed or already-published applications cannot silently be reopened through review controls.

## 6. Customer workflow

Sign up/verify/sign in → choose card/requested size → enter profile/handle/links → preview → delivery or NASTP pickup → manual JazzCash proof/reference → submit.

Drafts auto-save after changes, on explicit Save and before step navigation. A failed save is shown honestly; the browser warns against leaving unsaved work. Recover an owned draft from My orders on a new session/device. The URL contains a draft ID, not application PII; no sensitive browser-local draft store is used. Availability depends on successful server saving/network access. Conflicting sessions must reload rather than overwrite each other.

My orders shows drafts, decisions, customer messages, card/payment/fulfillment details and actual timestamped history. A changes request reopens the saved application and updates the SAME order. Verified payments cannot be casually replaced or repriced through customer corrections. Other customers' orders/proofs and internal staff notes remain inaccessible.

## 7. Manual JazzCash

Approved number **0304 4149674**, Rs. **999 per card**, one to twenty cards linked to the same profile. Confirm the recipient/card amount/hosting terms with EdgeTap before transferring. Upload private JPEG/PNG/WebP proof (8 MB limit), provide reference and submit. Screenshot upload leaves payment pending. Staff check the actual transfer against the card subtotal and explicitly verify or reject it. No gateway, payment API, fake automation or transfer is performed by the app.

## 8. NASTP pickup

`nastp_pickup` is stored explicitly. Address/city/postcode are not requested and are stripped from its saved/submitted payload. Unconfirmed pickup point, instructions and hours remain pending/configurable. The accepted order progresses through physical preparation → ready for NASTP pickup → picked up → completed, only when staff records actual steps. Customer next-action copy asks them to confirm collection arrangements with EdgeTap.

## 9. Delivery and lifecycle

`delivery` collects delivery address/city. Card payment and acceptance can happen while delivery fee/total are pending. Staff later records an actually agreed fee and separately verifies its transfer/reference where positive. Dispatch is blocked until delivery fee is agreed and settled (or explicitly zero); amounts are never invented.

Application review: submitted → under review → accepted, or changes required → same-order resubmission; rejected/cancelled close review.

Payment review is independent: pending → manually verified, or rejected → corrected proof → pending.

After acceptance: publish profile → awaiting production → printing → awaiting NFC → NFC programmed → QA passed → ready for dispatch / ready for NASTP pickup → dispatched → delivered / picked up → completed. Skipped or wrong-branch transitions fail. Buttons record operator actions; they do not print/program cards, ship parcels or verify transfers automatically.

## 10. Notifications and configurable values

Staff inbox/badges and customer status/messages refresh every 20 seconds and on focus. These are functional in-app notifications, not push/email. Application events create disabled outbox entries. SMTP and an actual business-email worker are intentionally absent; no successful email delivery is claimed.

| Value | Where to configure | Current decision |
|---|---|---|
| Size option labels | Admin → Settings → Card size options | No invented dimensions; custom requested size retained |
| Approved production size/design | Admin → Orders → Confirm card specification | Must be reviewed per order; original request stays intact |
| NASTP instructions/hours | Admin → Settings → NASTP pickup details | Pending real details; generic confirmation wording |
| Delivery coverage/dispatch wording | Admin → Settings → Delivery instructions | Pending |
| Actual separate delivery fee | Admin → order details → Save agreed delivery fee | Null until actually agreed; not charged with initial card payment |
| Hosting/update wording | Admin → Settings → Profile hosting / update instructions | Duration/terms pending |
| Approved JazzCash/card price | SQL `get_order_settings`, server pricing | Confirmed 0304 4149674 / Rs. 999; changes require reviewed business/pricing update |
| Auth SMTP | Correct project's Authentication → Email/SMTP settings | No provider/sender/credentials configured |
| Future business-event email | Private worker deployment/configuration | Outbox ready; transport disabled, worker not implemented |

[Supabase's default Auth email service](https://supabase.com/docs/guides/auth/auth-smtp) is limited to project-team addresses and is not intended for commercial production. A verified custom SMTP provider/sender is needed for ordinary customer confirmation/recovery. Configure credentials in the protected service dashboard, never chat, Git or `NEXT_PUBLIC_*`.

Optional future ignored mode-0600 `.env.notifications.local` contract: `EDGETAP_SMTP_HOST`, `EDGETAP_SMTP_PORT`, `EDGETAP_SMTP_USER`, `EDGETAP_SMTP_PASSWORD`, `EDGETAP_SMTP_FROM`, `EDGETAP_SMTP_SENDER_NAME`, `EDGETAP_TRANSACTIONAL_EMAIL_ENABLED=false`. These names do not activate a sender now. A future private worker must claim events idempotently, target only authorized recipients and record real delivery failures/success. Auth emails and order-event emails are separate systems.

## 11. Verification

### LOCAL VERIFIED

- Typecheck, production static export and lint (no errors; six static-image warnings).
- 24 baseline SQL/RLS plus 23 application/administration checks: cloud drafts, spoofing/bounds/version guards, owner isolation, private receipt metadata, manual payments before delivery quote, stale verification denial, acceptance/publication/handle ownership, corrections/rejections, both fulfillment branches, disabled email, configuration authorization, revoked staff, verified-only admin enrollment.
- 57 complete browser checks: delivery at 320px and pickup at 390px; staff desktop at 1440px. Real local PostgreSQL/RLS with simulated Auth/Storage HTTP. Includes new-session draft recovery, invalid links, private proof bytes, lost submission response without duplicates, corrections/payment rejection, approval/publication/QR, all physical stages, separate delivery settlement, pickup completion, customer/private boundaries and two-tab account-switch draft isolation, signup and recovery guards and owner profile editing. Fixture guard refuses a real-backend export and unexpected Supabase origins. No hosted records are created.
- Broader public-route responsive/metadata/error checks and offline migration regression; see current final counts in launch report.

### HOSTED VERIFIED

Only prior hosted foundation **001–006** and real public-config anonymous/API boundaries. Read-only owner inspection confirmed no intended admin account yet. Real-hosted tests create no user/order/file and prove no successful authenticated business workflow. Hosted 007/new application flows remain unverified. Empty profiles correctly show missing, not a fabricated example.

## 12. Remaining blockers

### TECHNICAL BLOCKERS

Apply/verify 007 only after database-release authorization; enroll the registered verified real admin; then run real hosted customer draft/receipt/correction/payment/specification/publication/private-boundary workflows. Test actual NFC/QR on physical cards/iPhone/Android and the actual production Hosting routes/callbacks. Frontend is unreleased by instruction. Inbox currently loads the newest 200 orders and drafts the latest 100; add pagination before that volume needs older retrieval.

### BUSINESS DECISIONS

Physical sizes/variants; NASTP collection instructions/hours; delivery coverage, fee agreement and dispatch estimate; hosting/update duration/terms; cancellation, customer print-approval and defect-handling details. These do not remove or block implementing the workflows.

### BILLING / INFRASTRUCTURE BLOCKERS

Verified SMTP/sender for customer signup/recovery, appropriate hosted quotas/operations, and the separate future order-event sender if email is desired. No Firebase Blaze dependency is introduced for Supabase ordering. No billing/payment method was enabled. Rotate the privileged Supabase key previously shared in chat; it was not used/saved or embedded.

### LEGAL / POLICY REVIEW

Personalized-card policy follows the owner's business direction and preserves applicable-law exceptions without claiming verified legal compliance. Actual cancellation/approval/defect handling, privacy/data retention/public avatars and commercial terms need appropriate review. There is no blanket 30-day refund or automatic remedy for customer-supplied errors.

## 13. Exact implementation files

- `.env.example`
- `BUILD.md`
- `LAUNCH_AUDIT.md`
- `LAUNCH_REPORT.md`
- `ORDER_WORKFLOW_REPORT.md`
- `README.md`
- `SUPABASE_MIGRATION_REPORT.md`
- `app/account/orders/page.tsx`
- `app/account/page.tsx`
- `app/admin/page.tsx`
- `app/privacy/page.tsx`
- `app/terms/page.tsx`
- `components/Footer.tsx`
- `components/admin/AdminApp.tsx`
- `components/admin/OrderSettings.tsx`
- `components/admin/OrdersView.tsx`
- `components/admin/PublishProfileModal.tsx`
- `components/order/OrderSteps.tsx`
- `components/order/OrderWizard.tsx`
- `components/orders/OrderSummary.tsx`
- `lib/application.ts`
- `lib/data-service.ts`
- `lib/data/content.ts`
- `lib/data/order.ts`
- `lib/site.ts`
- `lib/upload-service.ts`
- `package.json`
- `scripts/enroll-edgetap-admin.mjs`
- `scripts/supabase-browser-fixture.mjs`
- `scripts/test-applications.mjs`
- `scripts/test-hosted-supabase-browser.mjs`
- `scripts/test-order-workflow-browser.mjs`
- `scripts/test-site.mjs`
- `scripts/test-supabase-browser.mjs`
- `scripts/test-supabase-config.mjs`
- `scripts/test-supabase.mjs`
- `supabase/README.md`
- `supabase/enroll-owner-account.sql`
- `supabase/inspect-owner-account.sql`
- `supabase/migrations/202610070007_application_workflow.sql`
- `supabase/verify-clean-bootstrap.sql`

## 14. Commit

The local implementation commit is reported in the completion message; use `git log -1 --format=%H` on `launch-readiness`. Nothing is pushed.
