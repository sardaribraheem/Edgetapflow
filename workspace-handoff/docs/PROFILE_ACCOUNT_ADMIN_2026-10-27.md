# Profile account cleanup and order controls — 27 October 2026

Released on https://edgetap.tech at **00:52:10 Pakistan time**, Hosting **`6f8c18e26f9a80c5`**. Website implementation commit `6ceccc0` is pushed on `codex/admin-profile-order-controls-2026-10-27`; later handoff/check commits may follow. Exactly migration **027** was applied after 026. Migration 016 remains unapplied. App source and existing 019 function definitions are unchanged.

## Owner decision and scoped correction

The owner clarified that Tarsil owns the existing login and Umer is separate, with **no email, confirmation or message** to be sent. Both hidden Umer handles (`umer-khan`, `umerkhan`) and the one linked Umer order were separated from that login into staff-managed records without a new Auth account. The copied business-login email was cleared only from Umer's moved order contact; Umer's phone stays with his own order. The two profiles remain hidden and all six profiles/four orders are retained. No application was rejected and no profile was permanently deleted during the correction.

A private ignored recovery snapshot was saved before the transaction. Guards compared 21 relevant tables and Auth/app-function fingerprints, preserving protected profiles, every public link, Tarsil's account/order/contact, payments, quoted prices, files and unrelated records. Unsent Umer-order jobs were superseded without sending or creating messages. Email delivery remains disabled. A fresh read-only owner-access check confirmed Tarsil retains its profile/order and no longer sees either Umer profile or Umer's order. No customer login, signup, confirmation/recovery request or contact message was used for QA. Private account/contact details and recovery SQL are not in Git.

The prior instruction to preserve Tarsil's public profile means preserving its actual current fields and links. The inspected current profile has no Email link; none was added, removed or restored by this work. The original account's existing browser sessions are not revoked by separation; the owner should sign out of that account on shared phones.

## Dashboard behavior

- **Orders → Application decision** appears first, with **Reject application** and **Request changes**, a required customer-visible reason and a confirmation dialog. Decisions update the account without email. Rejection keeps profile, payment and order history; it does not issue a refund. Closed applications cannot silently resume production/publication; fulfilled applications cannot be rejected through this control.
- **Customer & order details** distinguishes login account from submitted contact. Staff can correct the order name, phone or email with a recorded reason. This never changes the Auth login or public profile.
- **Delivery & fulfillment**, **Optional print proof & files**, **Optional customer message**, **Internal notes** and **Staff checklist (optional)** have visible Expand/Collapse controls. They start collapsed and retain edits when closed. Payment and the saved profile destination remain easy to find. Tag/digital-only orders still hide print tools.
- **Clients** groups orders by actual customer identity rather than contact email; staff-managed customers remain visible even without email.
- **Profiles → Customer profiles → Account access & cleanup** shows login identity separately from public links, linked orders and deletion blockers. Search includes the login email; visibility filters distinguish live/hidden.
- **Hide profile** / **Restore profile** clearly describe reversible visibility. For a hidden non-protected profile, **Separate from login account** retains the records under staff management. Both separation and permanent deletion require the exact handle, a reason, current row version and confirmed read-back.
- **Permanently delete profile** actually removes eligible profile fields/links and prevents dashboard restoration. The handle remains reserved so an old NFC card cannot lead to someone else's profile. Accounts, uploaded files and order/payment history are retained. Protected founder/Tarsil profiles, active profiles, open/paid/production orders, real reviews and purchased link allowances block this action.

The owner's earlier instruction still requires asking before any actual test-profile deletion. Building the control did not authorize using it. Adolf, Molana and all other profiles were untouched; the owner-named Enfotize was not matched to a current handle and must not be guessed.

## Verification and limits

Production and isolated builds passed; TypeScript passed; lint has zero errors and 18 existing warnings. Full existing isolated Supabase regressions passed, alongside 16 free-profile, 17 pricing and 17 new account/admin SQL test groups (new tests include the installed 019 contract). Existing 28 browser checks and 26 new account/order browser assertions passed on isolated SQL with simulated Auth/Storage. Release guard passed 119 SEO/static assertions and 153 public text assets; Hosting exported 249 files.

The guarded release and hosted read-only RLS/RPC/migration verifier passed. All 30 read-only hosted checks passed, including published page bytes on both hosts, capability flags, anonymous denials, actual public/hidden/unknown profile routes, guest admin access, mobile fit and zero browser errors/email-worker calls. These checks do not prove actual customer inbox delivery, hosted signed-in private-file uploads, real funds, printing or handoff. No email worker/provider/scheduler or Auth settings were activated.

## Follow-up

Milestone 1 remains active: any actual permanent test-profile deletion needs the exact candidates/impact and owner approval. Complete the remaining public-copy/navigation audit and real pilot evidence before marking all cleanup/core-journey work done. See [update plan](../updateplan.md), [admin guide](adminguide.md) and [launch status](LAUNCH_STATUS.md).
