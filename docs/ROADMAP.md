# Deferred research and expansion

Condensed 18 October 2026 from the old business reference and launch/app plan. Physical-card launch is the current priority. **Companion app work, including its NFC prototype, is deferred until the owner explicitly resumes it.** This file authorizes no implementation, purchase, schema change or publication. Recheck dated platform research before resuming.

## Companion app direction

Android first, iPhone later: a native companion using the same Supabase identity/profiles/orders, with create/edit/profile switching, default profile, QR/link/contact-PDF sharing and physical-card ordering. Recipients open a normal web profile without the app. Keep the website/admin pipeline; do not turn the site into a WebView or force a monorepo rewrite. Proposed future sibling folder: `EdgeTapApp`, not currently created.

React Native with Expo development builds and a small Kotlin module was the research direction, not a finalized SDK choice. Share portable types, URL validation and templates; use native session, file, upload/download, PDF and OS-share adapters. Use verified account callbacks, persistent sessions, version-aware saves, safe sign-out cache clearing and explicit default-profile ownership. Avoid duplicate profiles when ordering a physical card for an existing owned profile.

Proposed screens: Home, Share, Profile/account and optional Activity, plus auth/recovery, profile manager/editor, card request and My orders. Keep public profile details separate from private order information. PDF is the intended default contact export; downloading it never proves a contact was saved in the address book.

## NFC feasibility gate

Proposed Android HCE/NDEF URL emulation is a hypothesis requiring real phones, not an implemented feature or universal compatibility promise. Prototype against representative Android senders and Android/iPhone recipients without EdgeTap installed. Record models/OS, antenna position, lock/unlock, cases, NFC disabled/missing HCE, lifecycle/background/sign-out, repeated transfers and switching between two profiles. Never leak a previously selected profile or misrepresent payment/wallet behavior.

QR should be visible immediately, with copy/share URL and PDF fallback. An NFC session/transfer does not prove the web page opened; OS notifications/unlocking may be required. Android Beam is not the implementation path. iPhone URL reading and iPhone sender card emulation are different capabilities; eligibility/entitlements/markets need reassessment. Review [Android HCE](https://developer.android.com/develop/connectivity/nfc/hce), [Apple background reading](https://developer.apple.com/documentation/corenfc/adding-support-for-background-tag-reading) and [Apple NFC/SE](https://developer.apple.com/support/nfc-se-platform/) before work. If feasibility is inadequate, the owner decides whether to wait or release QR-first.

## Additive backend proposals

Standalone digital-profile creation would need its own authorized transaction for identity, customer row, handle reservation, quota and ownership. Do not remove physical-order payment guards to enable it. Define profile caps/publication moderation/default preference and version-aware cross-client saves. Existing-profile physical ordering needs an ownership-checked binding and frozen print snapshot; changing the selected app profile cannot reprogram old cards.

Native auth redirects, private file adapters, deletion/retention and printed-link consequences need explicit design. Preserve old accounts, handles, callbacks, orders and snapshots. Keep service-role/mail credentials server-side. Review current store privacy/deletion and payment policies before distribution or digital monetization; manual physical-card payments do not automatically define permitted digital billing. No new subscription or price is approved.

## Optional activity

The proposed metric is **recorded opens**, with QR/link methods distinguished when actually attributable. An opaque expiring share-session token could be validated/deduplicated only after the correct public profile renders. A session receipt cannot prove a unique person or physical tap; fixed NFC/QR URLs cannot reliably distinguish those sources. Do not count button taps or failed loads as confirmed openings.

Keep events bounded, rate-limited and private to the appropriate owner/staff; no fingerprinting, precise location or contact harvesting. Tracking failure must not block sharing. Any voluntary recipient contact exchange is a separate opt-in feature. Omit Activity if it delays dependable sharing.

## Sequence and parked decisions

1. Finish the real paid physical pilot and supplier/terms checks in [launch status](LAUNCH_STATUS.md).
2. When resumed, prove app-free NFC reception on real devices before committing to supported-device claims.
3. Agree self-service publication/moderation, profile limits, deletion/retention and existing-profile order contracts; test additive migrations in isolation.
4. Build native auth, profile management, QR/link/PDF and error recovery; integrate only proven NFC behavior.
5. Add guarded physical ordering and optional recorded opens, then privacy/deletion/support and real-device internal release checks.
6. Seek owner publication approval; assess iPhone separately without claiming NFC parity.

Future business opportunities include menus, Google review cards, events, attendance, teams, mini-sites and custom NFC work. Validate demand, costs and operating capacity before offering them. No invented analytics, enterprise features or automatic mail promises belong in present marketing.
