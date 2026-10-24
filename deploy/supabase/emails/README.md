# Authentication email templates

| File | Supabase template | Subject |
| --- | --- | --- |
| `confirmation.html` | Confirm sign up | Confirm your LeseLaut account |
| `recovery.html` | Reset password | Reset your LeseLaut password |

These templates include an explicit button and the complete confirmation address
as a fallback. Keep every `{{ .ConfirmationURL }}` placeholder intact; Supabase
generates the user-specific link. Never commit a rendered confirmation email,
token or live link.

Apply each file through Supabase Authentication → Emails → its template → Source,
set the subject above, inspect Preview, and save. Application deployment does not
update Supabase configuration. Both templates were applied manually on 24 October
2026; previews showed both actions and fallback links. Real inbox confirmation and
password-reset completion remain separate checks.

Use an owner-controlled disposable identity for delivery and callback tests. Check
the latest message by its subject, complete the link in the intended browser,
and verify the resulting account or password-reset screen. A transport accepting
an email is not proof of inbox delivery or a working callback.
