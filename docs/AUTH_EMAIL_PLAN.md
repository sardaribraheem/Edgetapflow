# EdgeTap authentication email plan

Prepared 26 October 2026. A read-only public Auth settings check confirmed that signup is enabled, email sign-in is enabled and automatic email confirmation is disabled. The website uses email/password sign-in, not passwordless OTP sign-in.

Signup confirmation is normally required once for a new email/password account. Normal later sign-in uses the password; it does not send a fresh confirmation or OTP every time. Password recovery and a changed email address are separate flows. The private account email is independent of an optional public Email profile link.

## Branded sender setup

1. Choose a transactional SMTP provider. Resend is compatible with the existing planned order-email stack, but any supported production SMTP service can be used. No provider account, billing tier or secret is assumed to exist.
2. Verify an owner-controlled sending domain in that provider using its exact DNS records. Use a proposed sender such as `EdgeTap <no-reply@edgetap.tech>` only after domain verification. Establish a real monitored support/reply address; do not invent a working inbox.
3. In Supabase → Authentication → Email → SMTP settings, enter the provider host, TLS port, username/password, verified sender address and **EdgeTap** sender name. Keep credentials server-side and out of Git, NEXT_PUBLIC variables and browser code. Changing templates alone changes the message design; changing the SMTP sender is what supplies the branded From address.
4. In Email Templates, install the reviewed [confirmation](email-templates/confirm-signup.html) and [recovery](email-templates/reset-password.html) HTML and subjects. They deliberately retain `{{ .ConfirmationURL }}` so Supabase validates the real token and the existing static-site callback continues to work. Do not replace it with a home-page URL or expose tokens in diagnostics.
5. Keep preferred Site URL `https://edgetap.tech`. Review `/account` and `/account/recovery` redirect allowlists on the preferred and retained Firebase hosts, following [BUILD.md](BUILD.md). Preserve current legacy callbacks and do not silently broaden redirects to arbitrary external URLs.
6. Keep signup confirmation enabled. Review provider/Auth sending limits and bot protection for the public free-profile entry. Do not disable confirmation just to avoid configuring a production sender.
7. With a consenting test recipient, verify actual confirmation delivery, EdgeTap sender/subject, spam placement, one-use/expiry behavior, correct preferred-host callback, successful password sign-in without another OTP, recovery on `/account/recovery`, and return to free-profile creation. Test error handling and resend limits without bulk emailing.
8. Record the actual provider/domain/configuration and inbox/callback evidence before calling this live. Keep the original configuration available for rollback. Do not put SMTP credentials into these docs.

## Separation from order emails

Authentication emails (signup/recovery) are sent by Supabase Auth via its SMTP configuration. Order/proof messages use the separate optional notification worker and outbox. Configuring Auth SMTP does not deploy that worker or activate order emails. Staff checklist actions and direct publication must not automatically send customer email. Proof email should send only through an explicit staff action after the separate provider setup is verified.

## Sources

- [Supabase password-based authentication](https://supabase.com/docs/guides/auth/passwords)
- [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates)

The built-in sender is intended for testing, with restrictions and best-effort delivery; custom SMTP is the production path. No actual SMTP settings, DNS records, templates or test emails were changed/sent while preparing this plan.
