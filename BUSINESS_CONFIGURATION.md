# EdgeTap business configuration — 7 October 2026

**Launch on hold.** Hosted foundation remains 001–006. Local migrations 007–009 are prepared only; no deployment, hosted schema change or billing action was performed.

## Confirmed product and business facts

- EdgeTap; “One tap. Infinite possibilities.” Canonical https://edgetapflow.web.app.
- Rs. 999 per physical card; every design is **PVC with embedded NFC**, **85.60 × 53.98 mm** (quoted imperial dimensions approximately **3.375 × 2.125 inches**). Wood is a printed design name. No other physical sizes, thickness, print tolerances or certification are inferred.
- Customer-uploaded artwork is prepared **manually by staff** for this size. Preserve the private original; save the staff-prepared file separately. Browser validation checks landscape proportions within 0.5%, not print resolution, bleed, colour calibration or printer readiness.
- Every personalized card needs a final-design email. Customer replies within **10 hours after actual sending** to confirm or request changes. Revised artwork needs a new emailed proof/window. With no timely reply, staff checks the actual inbox before recording confirmation after the full window. No automatic timeout can bypass an unrecorded timely reply; replies are manually reviewed.
- **SMTP/provider/verified sender are pending.** Queuing a proof does not send email or start a deadline. Printing is held until proof approval; no working sender is claimed.
- **NASTP Delta 3**, Monday–Friday **9 am–5 pm, Pakistan time**. Once the card is ready, customer contacts **+92 304 414 9674 after reaching NASTP**. No street address, access permission or holiday arrangement is invented.
- Delivery costs **extra, paid directly to the rider**, separately from Rs. 999 per card. When the paid card is ready, EdgeTap manually books a rider/ride app. Staff enters the actual booked fare and customer message in the admin dashboard; My orders shows “rider is on the way” and the exact amount to pay. No invented fare, radius, dispatch time or automatic booking/payment verification.
- Digital-profile hosting and customer updates have **no separate fee for now**. No fixed duration or lifetime/unlimited promise.
- Intended first administrator **sardaribraheem277@gmail.com**: normal registration/verification, deliberate protected UUID membership. Email is not a runtime authorization mechanism or verified SMTP sender.
- Primary support WhatsApp +92 304 414 9674. Manual JazzCash **0304 4149674**, private proof and actual staff verification.
- Owner-directed personalized-card non-returnability after production starts, applicable-law exceptions, and assessment of damage/defects/EdgeTap production errors/wrong cards. No blanket refund or automatic remedy for customer-supplied errors. This is business direction, not verified legal advice.

## Configuration and operations

| Value/action | Location | Current state |
|---|---|---|
| Physical size/material/price | Confirmed product constants and server validation/pricing | Fixed; changing the physical offer requires reviewed code/schema changes |
| Dimension wording | Admin → Settings → Standard card dimensions | Editable text; cannot introduce another physical size |
| Pickup instructions/hours | Admin → Settings → NASTP pickup details | Confirmed Delta 3 / weekday hours / arrival contact; editable for real updates |
| Delivery coverage wording | Admin → Settings → Delivery instructions | Coverage pending; direct rider-payment disclosure included |
| Hosting/update wording | Admin → Settings → Profile hosting / update instructions | No separate fee for now; duration remains unspecified |
| Final-design scope | Admin → Settings → Final-design email policy | Default **Every personalized card**; change only with owner confirmation |
| Approved design/specification | Admin → Orders → Confirm card specification | Per-order staff approval; original request preserved |
| Final artwork/proof | Admin → Orders → Staff-prepared final artwork / Final-design email review | Private original + separate prepared file; queue/actual reply/inbox-check controls |
| Rider fare/dispatch message | Admin → Orders → Customer pays rider directly, when ready for dispatch | Null until actual booking; separate from EdgeTap total; customer pays rider |
| Card payment | Admin → Orders → Verify/reject card payment | Actual JazzCash transfer review, never screenshot automation |
| Auth SMTP | Correct Supabase project → Authentication → Email/SMTP settings | Pending provider/verified sender; credentials stay protected |
| Final-design email transport | Future private worker/operator service | Queue + restricted completion hook ready; no sender implemented or running |

Future ignored, protected `.env.notifications.local` contract: `EDGETAP_SMTP_HOST`, `EDGETAP_SMTP_PORT`, `EDGETAP_SMTP_USER`, `EDGETAP_SMTP_PASSWORD`, `EDGETAP_SMTP_FROM`, `EDGETAP_SMTP_SENDER_NAME`, `EDGETAP_TRANSACTIONAL_EMAIL_ENABLED=false`. These names do not activate email. Auth emails and order-proof emails are separate systems. Never use `NEXT_PUBLIC_*` for SMTP or privileged secrets.

Migration 009 preserves existing IDs/orders/legacy delivery quotes and staff-written instructions. New orders use the fixed size and rider-direct payment; old orders retain their agreed EdgeTap-collected delivery handling. Only untouched default instruction text is replaced. Resuming an old private draft shows the current standard-size offer; an existing order request is not silently rewritten by the migration.

## Still needed from the owner

1. Delivery locations that can actually be served and any dispatch commitment; no fare formula is needed because actual rider fare is entered after booking.
2. Cancellation-before-production handling and the practical damaged/defective-card reporting/remedy process (evidence, timing and who assesses it). Do not invent these.
3. Verified SMTP provider and sender when ready, using protected configuration, plus a reply mailbox staff can monitor.
4. Hosting duration and how any future pricing/term change will be communicated. The current no-separate-fee decision is already confirmed.

Legal review remains separate: personalized-card cancellation/remedy wording, the 10-hour silence-as-confirmation policy and proof of sending, privacy/retention and applicable customer rights. Technical tests cannot certify legal compliance or real delivery of email.

## Verification

53 SQL/RLS/workflow checks, 67 complete local browser checks and 344 responsive assertions pass. Typecheck, real-public-config static build, lint (zero errors/six existing static-image warnings), exact minor-unit RPC checks, offline migration regression and isolated forward-preservation checks pass. Auth/Storage HTTP and proof-transport acknowledgement are simulated in the workflow browser; no actual email, hosted record, payment or physical printing is verified. Earlier hosted evidence covers only 001–006 (21 API / 12 anonymous browser checks).
