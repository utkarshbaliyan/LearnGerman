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

In Authentication → URL Configuration, allow both `/auth/confirm` and
`/auth/confirm?intent=recovery` on each supported site origin:

- `https://d19k6l47v6hw3.cloudfront.net`
- `https://leselaut.com`
- `https://www.leselaut.com`

The recovery request includes the `intent=recovery` query parameter. Allowing
only the callback without that query can make recovery fall back to the Site
URL, consistent with the reported landing page. Both recovery entries were saved and verified after reloading the
dashboard on 24 October 2026. Keep these entries scoped to the supported sites;
do not add a wildcard across unrelated origins. On 26 October 2026, the four
custom-domain redirect entries and `https://leselaut.com` Site URL were saved
and verified in Supabase.

Use an owner-controlled disposable identity for delivery and callback tests. Check
the latest message by its subject, complete the link in the intended browser,
and verify the resulting account or password-reset screen. A transport accepting
an email is not proof of inbox delivery or a working callback.
