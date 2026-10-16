> **Historical snapshot archived 15 October 2026.** Source: `EdgetapFlow/docs/latest.md` before this launch audit. Superseded status/commands below are evidence of their original run, not current instructions or authorization. Read [current launch status](../LAUNCH_STATUS.md). Unique original content is retained; relative links were rebased for this archive.

We are about to finalize the complete EdgeTap customer-to-fulfillment workflow.

IMPORTANT SAFETY / ENVIRONMENT RULES  
\=====================================

1\. Do NOT disable, bypass, or weaken macOS security.  
2\. Do NOT bypass Gatekeeper, XProtect, quarantine, malware warnings, code-signing checks, or any other OS security feature.  
3\. Do NOT install random binaries, shell scripts, browser extensions, unsigned executables, or unknown tools.  
4\. Do NOT run curl/wget commands that pipe directly into bash/sh.  
5\. Do NOT download or execute anything from an unknown URL.  
6\. Do NOT modify system security settings.  
7\. Do NOT install new dependencies unless they are genuinely required.  
8\. Before installing ANY dependency, explain:  
\- why it is required  
\- what package it is  
\- where it comes from  
\- whether an existing dependency can accomplish the same task  
9\. Prefer the packages already present in package.json and the existing project architecture.  
10\. Do not make destructive filesystem changes.  
11\. Do not delete existing project files/configuration unless absolutely necessary and explicitly explained.  
12\. Never expose Firebase credentials, API keys, service-account credentials, private customer data, or environment secrets.  
13\. Do not invent test results. Only report tests that were actually run successfully.

PROJECT RULE  
\============

Before changing anything, inspect the existing EdgeTap project.

Do NOT redesign the existing visual identity.

Do NOT rewrite working sections unnecessarily.

Do NOT create a second Firebase configuration.

Do NOT create a second profile system.

Do NOT create static HTML/pages for individual customers.

Reuse the existing architecture wherever possible.

The existing project uses:

\- Next.js App Router  
\- React  
\- TypeScript  
\- Tailwind  
\- Firebase  
\- Firestore  
\- Firebase Authentication  
\- Firebase Storage where already configured  
\- Existing dynamic profile route:  
/u/\[username\]  
\==================================================

PHASE 1 — INSPECT BEFORE CODING  
\==================================================

First inspect the project and report:

1\. Existing customer/order functionality  
2\. Existing profile functionality  
3\. Existing /u/\[username\] implementation  
4\. Existing Firebase configuration  
5\. Existing Firestore utilities  
6\. Existing authentication  
7\. Existing Storage implementation  
8\. Existing admin page/dashboard  
9\. Existing components that can be reused  
10\. Existing package.json dependencies

Then provide a concise implementation plan.

DO NOT start by replacing existing architecture.  
\==================================================

1\. CUSTOMER PURCHASE FLOW  
\==================================================

The customer clicks the Rs. 999 Professional EdgeTap Card package.

The customer should NOT immediately see a giant form.

Create a polished, interactive, multi-step onboarding experience.

The mental model should be:

Choose your card  
→ Build your profile  
→ Add links  
→ Preview  
→ Delivery  
→ Payment  
→ Done

The customer should feel like they are creating their digital identity rather than filling out a database form.  
\==================================================

STEP 1 — CHOOSE CARD DESIGN  
\==================================================

Show available EdgeTap card templates visually.

Initial options:

\- Classic  
\- Bold  
\- Executive  
\- Custom

Each template should have a visual preview.

The customer selects one.

If they choose Custom:

\- allow them to upload their own card design  
\- store the uploaded design securely  
\- associate it with the order

Keep the architecture extensible so more templates can be added later.

Do not invent unnecessary design templates if the project already has a template system.  
\==================================================

STEP 2 — BUILD YOUR PROFILE  
\==================================================

Title:

"Let's build your EdgeTap"

Supporting text:

"This is the information people will see when they tap your card."

Keep this extremely simple.

Required:

\- Profile picture  
\- Name  
\- Short bio

The profile picture should have a prominent upload UI.

Allow image preview.

Do not ask for unnecessary personal information at this stage.

Do NOT require:

\- phone number  
\- email  
\- address  
\- company  
\- occupation  
\- social accounts

unless the existing product architecture genuinely requires one of these.

The goal is to establish trust and avoid overwhelming the customer.  
\==================================================

STEP 3 — ADD LINKS  
\==================================================

Title:

"What do you want people to find?"

Provide:

"+ Add a link"

Offer common presets:

\- WhatsApp  
\- Instagram  
\- LinkedIn  
\- Website  
\- Portfolio  
\- Email  
\- Phone

The customer can add multiple links.

Links should NOT be mandatory.

The customer should also be able to skip this step.

Include:

"You can change these anytime later."

This is an important EdgeTap value proposition.

The physical card does not need to change when the customer's digital information changes.  
\==================================================

STEP 4 — PROFILE PREVIEW  
\==================================================

Create a live preview using the actual EdgeTap ProfilePage component/design where practical.

Show:

\- Profile picture  
\- Name  
\- Bio  
\- Links  
\- Selected visual style/template

Buttons:

"Edit"

and

"Looks good / Continue"

The customer should be able to see what they are getting before placing the order.

Do not create a separate fake preview that can drift from the real public profile design.

Prefer reusing the actual profile components.  
\==================================================

STEP 5 — DELIVERY INFORMATION  
\==================================================

Now collect physical fulfillment information.

Required:

\- Full name  
\- Phone number  
\- Address  
\- City

Postal/ZIP code only if necessary.

Do not collect unnecessary information.

The delivery address must remain private.

It must NEVER appear on:

/u/\[username\]

or any other public profile.  
\==================================================

STEP 6 — PAYMENT  
\==================================================

Provide:

1\. Online Payment  
2\. Cash on Delivery

Online payment should be visually preferred.

COD should include a clear note that the order may require confirmation before production.

IMPORTANT:

Do not pretend that an online payment provider is already integrated if it isn't.

Keep payment state separate from order state.

Possible payment states:

\- pending  
\- paid  
\- failed  
\- cod\_pending\_confirmation  
\- refunded  
\- cancelled

Only implement payment-provider functionality that actually exists in the current project.

If no provider is configured yet, create the correct data model/UI state without pretending that payment processing works.  
\==================================================

STEP 7 — ORDER CONFIRMATION  
\==================================================

After the order is successfully submitted:

Show:

\- Order number  
\- Customer name  
\- Selected card design  
\- Profile summary  
\- Delivery summary  
\- Payment status  
\- Order status

Show a progress tracker:

Order received  
→ Design preparation  
→ Card production  
→ NFC programming  
→ Shipped  
→ Delivered

Only display statuses that are actually supported by the backend.  
\==================================================

2\. FIRESTORE DATA MODEL  
\==================================================

Keep the data model clean.

Separate:

orders  
profiles  
customers/users  
reviews

An order should contain information such as:

\- order ID  
\- customer/user ID when available  
\- selected card template  
\- custom design reference  
\- profile information submitted during order  
\- delivery information  
\- payment status  
\- fulfillment status  
\- timestamps

A profile should contain:

\- stable internal profile ID  
\- username  
\- owner UID  
\- profile image reference/URL  
\- name  
\- bio  
\- links  
\- createdAt  
\- updatedAt  
\- active status

IMPORTANT:

Do NOT internally identify the profile only by username.

Use a stable profile ID.

The username is a public handle and may eventually change.  
\==================================================

3\. DYNAMIC PROFILE SYSTEM  
\==================================================

The public profile remains:

/u/\[username\]

Do NOT generate static files such as:

ahmad.html  
sara.html  
bilal.html

Instead:

/u/\[username\]

should resolve the username to the appropriate profile data.

Conceptually:

/u/ahmad  
↓  
Firestore  
↓  
Ahmad's profile  
↓  
Existing ProfilePage

and:

/u/sara  
↓  
Firestore  
↓  
Sara's profile  
↓  
Existing ProfilePage

Reuse the existing dynamic profile architecture.  
\==================================================

4\. ADMIN DASHBOARD  
\==================================================

Improve/create:

/admin

Admin authentication must be secure.

Do NOT use:

\- hardcoded passwords  
\- development backdoors  
\- arbitrary credential fallbacks  
\- client-side-only authorization

Use the existing secure authentication architecture.

Dashboard should show useful operational metrics:

\- Orders awaiting action  
\- Total clients  
\- Active profiles  
\- Reviews  
\- Orders in production  
\- Cards ready for NFC  
\- Orders ready to ship  
\- Recently completed orders

Keep it clean and operational.

Sidebar/navigation:

Dashboard  
Orders  
Clients  
Profiles  
Reviews  
Settings

Do not overbuild sections that aren't needed yet.  
\==================================================

5\. ADMIN ORDERS  
\==================================================

Admin should be able to open an order.

Show:

CUSTOMER

\- name  
\- email if available  
\- phone

PROFILE

\- profile picture  
\- name  
\- bio  
\- links

CARD

\- selected template  
\- quantity  
\- custom design if applicable

DELIVERY

\- private delivery information

PAYMENT

\- payment method  
\- payment status

FULFILLMENT

\- current status  
\- timestamps  
\==================================================

6\. CREATE CLIENT PROFILE  
\==================================================

Inside an order, provide a prominent action:

"Create Client Profile"

When clicked:

1\. Validate required profile information.  
2\. Check username availability.  
3\. Create a stable internal profile ID.  
4\. Create the profile.  
5\. Associate the profile with the order.  
6\. Associate the profile with the owner/customer when available.  
7\. Populate:  
\- profile image  
\- name  
\- bio  
\- links  
8\. Generate the public route:

/u/\[username\]

Do NOT create a static webpage.

Use the existing dynamic profile system.  
\==================================================

7\. USERNAME  
\==================================================

When creating a profile:

\- generate a sensible username suggestion from the customer's name  
\- check whether it is available  
\- allow admin to edit the username before creation if necessary  
\- prevent collisions

Example:

Ahmad Khan

Suggested:

/u/ahmad

If unavailable:

/u/ahmadkhan

or another sensible available handle.

Do not silently overwrite an existing user's profile.  
\==================================================

8\. NFC DESTINATION  
\==================================================

After profile creation, show a production panel.

Example:

DIGITAL DESTINATION

https:///u/ahmad

Provide:

"Generate NFC URL"

The NFC destination must point to the EdgeTap profile.

It must NOT directly point to:

\- Instagram  
\- WhatsApp  
\- LinkedIn  
\- another social platform

This is important because the customer needs to be able to change their links later.

The physical NFC card should continue pointing to the EdgeTap profile.  
\==================================================

9\. QR CODE  
\==================================================

Provide:

"Generate QR"

The QR code must point to exactly the same public EdgeTap profile URL.

Example:

https:///u/ahmad

The QR should not point directly to a social platform.

Provide an admin preview of the QR.

If an existing QR package is already installed, reuse it.

Do NOT install a new QR dependency unless genuinely necessary.

If a new dependency is required, explain it BEFORE installing it.  
\==================================================

10\. PRODUCTION ORDER  
\==================================================

Create a production summary for the admin.

Example:

EDGETAP PRODUCTION ORDER

Order \#XXXX

Customer:  
Ahmad Khan

Card:  
Classic

Quantity:  
1

Profile:  
https://domain/u/ahmad

NFC destination:  
https://domain/u/ahmad

QR:  
\[QR CODE\]

Design:  
\[Template or custom design\]

Do not automatically contact the printer yet.

The system should simply make it easy for the admin to copy/export/send the production information.

Future automation can send this to email/WhatsApp/printer workflows.  
\==================================================

11\. FULFILLMENT STATUS  
\==================================================

Use a clear fulfillment state machine.

Suggested statuses:

new  
payment\_pending  
paid  
cod\_pending\_confirmation  
profile\_created  
production\_ready  
printing  
ready\_for\_nfc  
nfc\_programmed  
qa\_passed  
ready\_to\_ship  
shipped  
delivered  
cancelled

Record timestamps when important transitions occur.

Admin should be able to update fulfillment status from the order page.

Do not allow obviously invalid transitions if practical.  
\==================================================

12\. CUSTOMER PROFILE EDITING  
\==================================================

The core EdgeTap promise:

"The physical card doesn't need to change when your digital information changes."

Customers should eventually be able to update:

\- profile picture  
\- name  
\- bio  
\- links

without replacing their physical card.

The NFC and QR continue pointing to the EdgeTap profile.

The profile content changes behind the same destination.

Make sure the architecture supports this.  
\==================================================

13\. SECURITY / PRIVACY  
\==================================================

Public users can read only intentionally public profile information.

Public users must NOT be able to write profile data.

Only the profile owner can edit their profile.

Admin can manage orders/profiles according to secure authorization.

Private order information must never leak to:

/u/\[username\]

Private information includes:

\- delivery address  
\- payment information  
\- internal order notes  
\- internal customer information

Review Firestore security rules and existing authentication before modifying them.

Do not weaken existing security rules just to make development easier.  
\==================================================

14\. FUTURE AUTOMATION  
\==================================================

Do NOT build the AI agent yet.

However, structure the system so automation can later handle:

\- missing information requests  
\- order confirmation messages  
\- design approval messages  
\- printer production messages  
\- shipping booking  
\- tracking notifications  
\- review requests  
\- customer support

Future workflow:

Customer  
↓  
EdgeTap website  
↓  
Order  
↓  
Firebase  
↓  
Admin / Agent  
↓  
Printer  
↓  
Physical card  
↓  
NFC programming  
↓  
QA  
↓  
Courier  
↓  
Customer  
↓  
Review

For now:

KEEP THE HUMAN OPERATOR IN CONTROL.  
\==================================================

15\. UX PRINCIPLES  
\==================================================

The customer flow should feel:

\- premium  
\- simple  
\- trustworthy  
\- interactive  
\- fast  
\- mobile-friendly

Avoid:

\- giant forms  
\- unnecessary fields  
\- excessive technical terminology  
\- asking for too much personal data  
\- overwhelming dashboards  
\- unnecessary animations  
\- generic AI-looking UI

The onboarding should feel like:

"Let's make your EdgeTap."

not:

"Complete this 30-field registration form."  
\==================================================

16\. IMPLEMENTATION SAFETY  
\==================================================

Before modifying files:

\- inspect the existing implementation  
\- preserve working functionality  
\- use existing dependencies  
\- avoid unnecessary package installation

Never run commands that:

\- disable security  
\- bypass malware protection  
\- remove quarantine attributes  
\- modify Gatekeeper  
\- modify SIP  
\- disable XProtect  
\- install unsigned binaries  
\- pipe remote scripts directly into shells

If macOS reports a downloaded dependency/tool as malware or suspicious:

STOP.

Do NOT tell me to bypass the warning.

Instead:

1\. identify exactly what triggered the warning  
2\. determine whether that tool is actually necessary  
3\. prefer an existing trusted dependency or standard npm package  
4\. report the issue to me before proceeding if there is uncertainty  
\==================================================

17\. TESTING  
\==================================================

After implementation, run only safe project-local checks.

Test:

1\. TypeScript  
2\. Lint  
3\. Production build  
4\. Customer onboarding  
5\. Card template selection  
6\. Profile picture upload  
7\. Name/bio  
8\. Link creation  
9\. Preview  
10\. Order creation  
11\. Admin authentication  
12\. Admin dashboard  
13\. Admin order view  
14\. Create Client Profile  
15\. Username availability  
16\. /u/\[username\]  
17\. NFC destination generation  
18\. QR generation  
19\. Fulfillment status updates  
20\. Privacy of delivery/payment information  
21\. Responsive layout

If Playwright is already installed and configured, use it.

If it is NOT installed, do not blindly install it just for this task. Report that it is missing first.

Likewise, do not install arbitrary QA tools without explaining them.  
\==================================================

18\. FINAL REPORT  
\==================================================

When finished, report:

\#\#\# Implemented  
List what actually changed.

\#\#\# Existing / Reused  
List existing components/systems reused.

\#\#\# Not Implemented  
List anything that requires external setup or a payment provider.

\#\#\# Firebase Requirements  
Clearly state what Firebase resources must exist.

\#\#\# Dependencies  
List any dependencies added, and why.

\#\#\# Tests  
List only tests actually run and their results.

\#\#\# Next Steps  
Give me the smallest practical next steps to get EdgeTap ready for the first real customer.

Do not claim the system is production-ready if it has not actually been tested end-to-end.

