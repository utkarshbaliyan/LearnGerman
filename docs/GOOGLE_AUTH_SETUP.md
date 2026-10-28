# Enable Google sign-in for LeseLaut

Google sign-in is enabled in Supabase and verified on the AWS website.
Reuse the configured Google/Supabase project and OAuth client below.
Never put the Google client secret in this repository, browser code or chat.

## Setup checkpoint — 23 October 2026

- Google Cloud project **LeseLaut** (`leselaut`) was created in the owner's chosen
  existing Google account. The consent configuration was saved with an external
  testing audience and only `openid`, `userinfo.email` and `userinfo.profile`.
- OAuth web client **LeseLaut Web** was created with both application origins and
  the exact Supabase callback listed below. The owner retained its credentials;
  the secret must be entered directly into Supabase, never into this repository.
- Both exact application callbacks below were visibly verified in Supabase's
  redirect allowlist. The old callback was preserved.
- Supabase's Google provider is enabled with the owner's saved credentials.
  A fresh public `/auth/v1/settings` check returned `external.google: true` and
  `external.email: true`. Skip nonce checks and Allow users without an email
  remain off. Email/password sign-in remains enabled.
- Google's Audience page was separately verified as **Testing**, with no test
  users. **Publish app** was disabled pending completion of Branding. Google
  explicitly exempts basic identity-only sign-in from the Testing user-list and
  seven-day authorization expiry restrictions; this app requests only those
  identity scopes. Do not add other Google scopes without reviewing their
  audience and verification requirements.
- On `https://d19k6l47v6hw3.cloudfront.net/account`, the Google button was visibly
  verified. Its redirect used the configured Supabase callback and the AWS
  `/auth/confirm` return URL. The owner-authorized Google consent completed and
  returned to LeseLaut, which loaded the existing account username and displayed
  **Progress is synced**. No learner records were manually merged or reset.
- The five Google callback/PKCE and backend authentication tests passed on Node
  22. The AWS account page, callback and health endpoints returned HTTP 200;
  unauthenticated account API access returned HTTP 401. These checks do not
  replace testing a real Google login and existing learner progress.

The existing-account Google login was verified; a separate newly created Google
user was not tested. Complete the app's homepage/privacy information and Google
branding review for the intended public launch. Until custom branding is
verified, Google's sign-in screen identifies the Supabase project domain.
No application rebuild or AWS deployment is needed for this provider setting.

Google's audience exception:
<https://support.google.com/cloud/answer/15549945?hl=en>.

## Configuration and verification

1. In [Google Cloud Console](https://console.cloud.google.com/), create or select
   the project that should own LeseLaut's authentication. Open Google Auth Platform.
2. Configure Branding with the app name **LeseLaut**, your support email and the
   contact information required by Google. Select the appropriate audience.
   Use only basic OpenID Connect identity scopes: `openid`, `email`, `profile`.
   These scopes qualify for Google's Testing-mode identity-only exception.
3. Create an OAuth client with application type **Web application**. Set the
   authorized JavaScript origin to:

   ```text
   https://d19k6l47v6hw3.cloudfront.net
   https://leselaut.com
   https://www.leselaut.com
   ```

   Set the authorized redirect URI to Supabase's callback, exactly:

   ```text
   https://npnzojbbwwdtujuurkmx.supabase.co/auth/v1/callback
   ```

4. In Supabase project `npnzojbbwwdtujuurkmx`, open **Authentication → Sign In /
   Providers → Google**. Enter the client ID and client secret directly there,
   enable Google and save. The Google client secret belongs in Supabase, not in
   Sites runtime variables. Do not disable nonce or other security checks.
5. In Supabase **Authentication → URL Configuration**, retain the production Site
   URL and both exact application callbacks in the redirect allowlist:

   ```text
   https://d19k6l47v6hw3.cloudfront.net/auth/confirm
   https://leselaut.com/auth/confirm
   https://www.leselaut.com/auth/confirm
   ```

   Google redirects first to Supabase; Supabase redirects to this application
   callback. These are two different redirect URIs and both must be correct.
6. Open LeseLaut's Account page in a private window. Once Google is enabled, the
   **Continue with Google** button appears automatically. Test a new account and
   the same verified email as an existing account. Confirm the existing learner
   progress remains available. Keep the original browser session signed in while
   testing so no unsynced local work is discarded.
7. For public launch and custom branding, satisfy Google's current publishing,
   authorized-domain and consent-screen requirements. Follow the console's
   requirements for the app's homepage, privacy information and verification.
   Basic identity-only login has a Testing-mode exception; extra scopes may
   require listed test users, verification and production publishing.

The application keys AWS SQLite data by the verified Supabase subject, never by a Google
email or a browser-supplied ID. Supabase controls identity linking; do not manually
merge learner records by matching email addresses. Existing email/password sign-in stays
available. If Google is disabled or its settings cannot be loaded, no broken
Google button is shown.

The custom-domain callbacks and recovery variants were added to Supabase on
26 October 2026, and its Site URL was switched to `https://leselaut.com`.
Keep the existing callbacks while users migrate. A custom application domain
does not require Supabase's optional paid custom Auth domain.

Reference: [Supabase's official Google setup guide](https://supabase.com/docs/guides/auth/social-login/auth-google).
