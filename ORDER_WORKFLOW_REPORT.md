> **8 October hosted upgrade:** The owner’s explicit deployment request authorized migrations 007–009; all are now hosted. The verified 23 application tables have RLS, private schema remains unexposed, and 29 anonymous/public API boundary checks pass. Existing account preserved; no production fixtures/orders/profiles/files created. Current pricing and Hosting release are recorded in PRICING_DEPLOYMENT_REPORT.md. Older unapplied-state notes below are historical.

> **Hosted ordering diagnosis — 8 October 2026:** The owner-entered real sign-in returned HTTP 200, then checkout failed because hosted ordering settings/draft RPCs are missing. Fresh read-only inventory: one Auth account; zero customer/order/payment/profile/staff/file records; all 17 application tables have RLS and the private schema is unexposed. The actual CLI dry run lists only 007–009, with no seeds/roles. The tested read-only upgrade guard and [ORDERING_UPGRADE_PLAN.md](ORDERING_UPGRADE_PLAN.md) are prepared; database approval is pending under the current AGENTS.md no-deploy instruction. No website/database release was performed.

> **8 October sign-in follow-up:** Session-aware account UI, internal callback navigation, preserved cross-tab order/draft state, pre-payment recovery and explicit missing-service errors are implemented locally. The owner-supplied Supabase account is confirmed, but production still uses Firebase Auth and hosted 007–009 remain absent. See [SIGNIN_ORDERING_REPORT.md](SIGNIN_ORDERING_REPORT.md).

> **Guest/pricing update:** New card builders start without an account and save on this device until authenticated account saving immediately before payment. Cloud-owned drafts/corrections keep authenticated recovery. Main card CTAs lead to Pricing, with Rs. 999 standard, Rs. 18,999 website/four-card package (first year included; Rs. 3,000 annually from year two), and contact-only custom NFC solutions. Public contact email is owner-approved. See [GUEST_ORDERING_REPORT.md](GUEST_ORDERING_REPORT.md). Earlier account-first statements describe the previous UI, superseded for new builders. No hosted release.

# EdgeTap application workflow — 7 October 2026

**Implemented and verified locally; NOT READY TO LAUNCH.** Work stays on `launch-readiness`. No deployment/push, hosted migrations 007–009, billing change, fake production record, Firebase extraction/deletion or DukanKhata operation was performed. Existing user changes to `.gitignore` and deleted root screenshots are preserved and excluded from this implementation commit.

## 1. What was removed, retained or previously absent

History inspection covered the launch cleanup and Supabase commits through `a5c332f`.

- NASTP pickup was removed in launch cleanup `fa2372a`, before Supabase migration. The Supabase order RPC then supported delivery only. It is restored as an explicit fulfillment branch with confirmed Delta 3 / Monday–Friday 9 am–5 pm arrival contact details.
- Manual JazzCash, receipt upload, five card designs and staff order/receipt viewing survived as code. Online submission was paused by the old instant-checkout flag. These are now integrated into an account-owned application workflow, not removed for being manual.
- Simple, Lux, Wood, Inverted and Upload your card design are retained. No inspected physical-size field existed to restore; requested/approved size handling is new. The previously unconfirmed designer service is not invented as a priced offer.
- Cloud drafts, customer order tracking, application acceptance/rejection/change requests and actual business-email sending were not complete implementations. Drafts/tracking/review/in-app notifications are newly implemented. Earlier email promises were not a working sender.

## 2–3. Restored and newly implemented

Restored NASTP pickup alongside delivery and preserved private manual JazzCash proof/artwork. Added progressive cloud draft saves/recovery, customer status/history, corrections to the same order, separate review/payment/production states, staff messages/internal notes, requested versus approved card specification, direct rider fares/messages for new orders, and disabled event-email outbox architecture.

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

Orders gain application review state, requested card size, approved size/design, customer notes, separate delivery payment state/reference/verified amount. Payments gain verified card amount. Monetary storage remains integer minor units; migration 007 originally used pending delivery fee/total; migration 009 supersedes this for new rider-direct orders with card-only EdgeTap total and a separate nullable rider fare. Pickup has no delivery fee and card-only total. This does not create a new pickup-service pricing policy.

RPCs support draft save/submit/recovery, owner order reads, versioned review/specification/delivery actions, notes/messages and settings. Existing handle/ownership/publication transactions and buckets remain. The legacy id-only `confirm_payment(text)` endpoint loses client execution; `verify_application_payment(text,bigint)` prevents approval using stale proof. No direct-client state/price/owner mutation is introduced.

Local additive migrations **008–009** add confirmed dimensions and the product/fulfillment/proof changes below. The hosted project remains on **001–006**. Do not deploy the new frontend against that schema. Before any separately approved database release: inspect ONLY `dxyxvervvlxhwwbcbttd`, check current data/history, review `db push --dry-run` for ONLY unapplied 007–009, then apply and verify forward. Never reset, rerun the original clean installer on an initialized database, delete data or repair history to pretend SQL succeeded.

## 5. Admin workflow and first administrator

**Intended account: sardaribraheem277@gmail.com.** Read-only inspection found no matching account; no signup/invite/forced confirmation or membership write occurred. You will register and verify normally. Then an authorized operator uses `node scripts/enroll-edgetap-admin.mjs --inspect` and deliberately `--apply`. The helper locks the exact EdgeTap project, requires exactly one verified real account, is idempotent, and refuses revoked membership. Email selects the owner-approved bootstrap UUID; runtime authorization uses active protected `private.admin_members` UUID membership, never an email comparison or user metadata.

Admin → Orders shows newest submissions, filters, customer/contact/profile/handle/card/size/fulfillment/proof/reference/amount/notes/time/status details. Open a record to review the actual JazzCash transfer, verify/reject card payment, approve specification, accept/reject/cancel/request changes, publish the profile, add customer-visible messages or separate private notes, then record physical production/NFC/QA and delivery/pickup actions. Rejection/cancellation does not imply a refund. Closed or already-published applications cannot silently be reopened through review controls.

## 6. Customer workflow

Sign up/verify/sign in → choose card/confirmed standard size → enter profile/handle/links → preview → delivery or NASTP pickup → manual JazzCash proof/reference → submit.

Drafts auto-save after changes, on explicit Save and before step navigation. A failed save is shown honestly; the browser warns against leaving unsaved work. Recover an owned draft from My orders on a new session/device. The URL contains a draft ID, not application PII; no sensitive browser-local draft store is used. Availability depends on successful server saving/network access. Conflicting sessions must reload rather than overwrite each other.

My orders shows drafts, decisions, customer messages, card/payment/fulfillment details and actual timestamped history. A changes request reopens the saved application and updates the SAME order. Verified payments cannot be casually replaced or repriced through customer corrections. Other customers' orders/proofs and internal staff notes remain inaccessible.

## 7. Manual JazzCash

Approved number **0304 4149674**, Rs. **999 per card**, one to twenty cards linked to the same profile. Confirm the recipient/card amount with EdgeTap before transferring. Upload private JPEG/PNG/WebP proof (8 MB limit), provide reference and submit. Screenshot upload leaves payment pending. Staff check the actual transfer against the card subtotal and explicitly verify or reject it. No gateway, payment API, fake automation or transfer is performed by the app.

## 8. NASTP pickup

`nastp_pickup` is explicit; address/city/postcode are stripped. Collection: **NASTP Delta 3, Monday–Friday, 9 am–5 pm (Pakistan time)**. Once ready, My orders shows the arrival contact +92 304 414 9674 and an order-specific WhatsApp link. Actual staff actions: ready for pickup → picked up → completed. No additional access/street/holiday instructions are invented.

## 9. Delivery, final-design proof and lifecycle

New orders: Rs. 999/card is the EdgeTap total; delivery fare is **extra and paid directly to the rider**. Ordering/payment/final review explicitly disclose this. Staff manually books the rider when ready for dispatch, enters the actual fare/message and confirms real booking. `dispatch_rider` atomically records dispatch + fare + customer-visible “rider is on the way/pay Rs. XYZ directly” event. No fake automatic rider booking or rider-payment confirmation. Existing orders keep their prior agreed EdgeTap-collected delivery model; no historic price/settlement is rewritten.

Every design is standard-size PVC/NFC; Wood is a printed design. Staff prepares personalized artwork manually, retaining the private original and separately uploading the finished file. Browser proportion validation does not certify printer resolution/bleed/colour.

Every personalized card needs an emailed final proof. Migration 009 defaults to `all_personalized`. Staff queues the current file; this creates a private job, **not a sent email**. No SMTP sender exists. Restricted `private.design_proof_email_sent(uuid,text)` is a future trusted transport completion hook, not executable by website users/staff. Only actual sending starts the server-timed 10-hour window. Staff records an actual timely email reply to confirm or request changes; revised files invalidate the previous review/jobs and need a new send/window. After ten hours, staff must manually check the inbox before recording no-response confirmation. Printing is database-gated until approval. No auto-timer fakes email or assumes no reply.

Application: submitted → under review → accepted, or changes required → same-order resubmission; rejection/cancellation closes review. Card transfer review remains independent. After acceptance: publish profile → awaiting production → **email-proof approval before printing** → printing → awaiting NFC → NFC programmed → QA passed → ready for dispatch/pickup → rider dispatched/delivered or picked up → completed. Transitions require actual operator actions; no card printing/programming or financial operation is automated.

Migration 009 additionally adds `private.design_proof_emails` (RLS, no app-role grants), prepared-artwork owner access through a caller-owned boolean helper without exposing base orders, and version-aware staff artwork/proof/rider RPCs. Original uploads/receipt paths/IDs/relationships are retained. No production records are seeded.

## 10. Notifications and configurable values

Staff inbox/badges and customer status/messages refresh every 20 seconds and on focus. These are functional in-app notifications, not push/email. Application events create disabled outbox entries. SMTP and an actual business-email worker are intentionally absent; no successful email delivery is claimed.

| Value | Where to configure | Current decision |
|---|---|---|
| Fixed physical size/material | Server validation / product constants | All designs PVC/NFC, 85.60 × 53.98 mm; no arbitrary physical size input |
| Dimension text / approved design | Admin → Settings / Admin → Orders | Fixed-size wording; per-order specification confirmation |
| NASTP instructions/hours | Admin → Settings | Delta 3, Mon–Fri 9 am–5 pm; contact after arrival once ready |
| Delivery coverage/dispatch wording | Admin → Settings | Coverage/estimate pending; direct rider-payment disclosure |
| Actual rider fare/message | Admin → order when ready for dispatch | Null until booked; extra, paid directly to rider |
| Hosting/update wording | Admin → Settings | No separate fee for now; no fixed duration promise |
| Final-design email scope | Admin → Settings | Every personalized card (owner confirmed) |
| Artwork / proof / reply | Admin → Orders | Manual preparation; real-email ten-hour review; printing gated |
| JazzCash/card price | Server pricing and settings RPC | 0304 4149674 / Rs. 999 |
| Auth SMTP | Supabase Auth email settings | Pending verified provider/sender |
| Order-proof email worker | Future protected service | Queue/completion hook only; no sender implemented |

[Supabase's default Auth email service](https://supabase.com/docs/guides/auth/auth-smtp) is limited to project-team addresses and is not intended for commercial production. A verified custom SMTP provider/sender is needed for ordinary customer confirmation/recovery. Configure credentials in the protected service dashboard, never chat, Git or `NEXT_PUBLIC_*`.

Optional future ignored mode-0600 `.env.notifications.local` contract: `EDGETAP_SMTP_HOST`, `EDGETAP_SMTP_PORT`, `EDGETAP_SMTP_USER`, `EDGETAP_SMTP_PASSWORD`, `EDGETAP_SMTP_FROM`, `EDGETAP_SMTP_SENDER_NAME`, `EDGETAP_TRANSACTIONAL_EMAIL_ENABLED=false`. These names do not activate a sender now. A future private worker must claim events idempotently, target only authorized recipients and record real delivery failures/success. Auth emails and order-event emails are separate systems.

## 11. Verification

### LOCAL VERIFIED

- Typecheck, production static export and lint (no errors; seven static-image warnings).
- 24 baseline SQL/RLS plus 29 application/administration checks: cloud drafts, spoofing/bounds/version guards, owner isolation, private receipt metadata, manual card payments and separate rider fares, stale verification denial, acceptance/publication/handle ownership, corrections/rejections, both fulfillment branches, disabled email, configuration authorization, revoked staff, verified-only admin enrollment.
- 75 complete workflow browser checks, plus 13 guest/pricing checks (IndexedDB originals, refresh/navigation, blocked storage, stale tabs, confirmation, failed-save retry, no early cloud writes): delivery at 320px and pickup at 390px; staff desktop at 1440px. Real local PostgreSQL/RLS with simulated Auth/Storage HTTP. Includes new-session draft recovery, invalid links, private proof bytes, lost submission response without duplicates, corrections/payment rejection, approval/publication/QR, all physical stages, rider fare/dispatch and proof-email gating, pickup completion, customer/private boundaries and two-tab account-switch draft isolation, signup and recovery guards and owner profile editing. Fixture guard refuses a real-backend export and unexpected Supabase origins. No hosted records are created.
- 344 public-route responsive/metadata/error assertions and offline migration regression pass. An isolated 008→009 forward check preserves every prior order field, ID, custom specification, agreed delivery quote/total, settlement and operator-written pickup/hosting instructions; no proof email is seeded. Monetary RPC boundary checks accept normal decimal rupees (including Rs. 1.10) as exact minor units.

### HOSTED VERIFIED

Only prior hosted foundation **001–006** and real public-config anonymous/API boundaries. Read-only owner inspection confirmed no intended admin account yet. Real-hosted tests create no user/order/file and prove no successful authenticated business workflow. Hosted 007–009/new application flows remain unverified. Empty profiles correctly show missing, not a fabricated example.

## 12. Remaining blockers

### TECHNICAL BLOCKERS

Apply/verify 007–009 only after database-release authorization; enroll the registered verified real admin; then run real hosted customer draft/receipt/correction/payment/specification/publication/private-boundary workflows. Test actual NFC/QR on physical cards/iPhone/Android and the actual production Hosting routes/callbacks. Frontend is unreleased by instruction. Inbox currently loads the newest 200 orders and drafts the latest 100; add pagination before that volume needs older retrieval.

### BUSINESS DECISIONS

Delivery coverage/dispatch commitment; hosting duration/future term-change handling; cancellation and defect-reporting/remedy procedure. Card sizes/material, pickup details, rider-direct charges, current free hosting and every-personalized-card proof policy are confirmed. These do not remove or block implementing the workflows.

### BILLING / INFRASTRUCTURE BLOCKERS

Verified SMTP/sender for customer signup/recovery, appropriate hosted quotas/operations, and the required real final-design email worker/transport and monitored reply inbox. Printing remains blocked until real sending/review works. No Firebase Blaze dependency is introduced for Supabase ordering. No billing/payment method was enabled. Rotate the privileged Supabase key previously shared in chat; it was not used/saved or embedded.

### LEGAL / POLICY REVIEW

Personalized-card policy follows the owner's business direction and preserves applicable-law exceptions without claiming verified legal compliance. Actual cancellation/defect handling, the 10-hour silence-as-confirmation policy and evidence of email sending/delivery, privacy/data retention/public avatars and commercial terms need appropriate review. SMTP acceptance alone does not establish recipient delivery; the future transport must handle failures/bounces and real mailbox tests. There is no blanket 30-day refund or automatic remedy for customer-supplied errors.

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
- `lib/card-artwork.ts`
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
- `scripts/test-business-migration.mjs`
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
- `supabase/migrations/202610070008_confirmed_card_dimensions.sql`
- `supabase/migrations/202610070009_confirmed_pvc_rider_fulfillment.sql`
- `supabase/verify-clean-bootstrap.sql`

## 14. Commit

The local implementation commit is reported in the completion message; use `git log -1 --format=%H` on `launch-readiness`. Nothing is pushed.
