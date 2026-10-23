# Enable Google sign-in for LeseLaut

Application code is ready, but Google is currently disabled in Supabase.
Create and configure the OAuth client in the owner's Google/Supabase accounts.
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
- The owner reported saving the Google provider, but subsequent public
  `/auth/v1/settings` checks still returned `external.google: false`. Do not
  describe Google sign-in as enabled until a fresh check returns `true` and a
  real login succeeds. The Supabase dashboard also stalled while its status page
  reported an ongoing Management API incident; that may affect configuration
  saves, but it does not establish the cause of this project's disabled flag.
- Google's Audience page was separately verified as **Testing**, with no test
  users. **Publish app** was disabled pending completion of Branding. Creating
  the client does not make sign-in available to the public.
- The five Google callback/PKCE and backend authentication tests passed on Node
  22. The AWS account page, callback and health endpoints returned HTTP 200;
  unauthenticated account API access returned HTTP 401. These checks do not
  replace testing a real Google login and existing learner progress.

Resume by inspecting the existing Google provider configuration, confirming its
credentials and enabled flag, and checking the OAuth audience before testing.
Reuse the existing project/client instead of creating duplicates. If the app is
still in Testing, configure the intended test users or complete Google's
production publishing requirements before offering it to everyone.

Service status: <https://status.supabase.com/>.

## Configuration and verification

1. In [Google Cloud Console](https://console.cloud.google.com/), create or select
   the project that should own LeseLaut's authentication. Open Google Auth Platform.
2. Configure Branding with the app name **LeseLaut**, your support email and the
   contact information required by Google. Select the appropriate audience; an
   external app in Testing initially permits its configured test users only.
   Use only basic OpenID Connect identity scopes: `openid`, `email`, `profile`.
3. Create an OAuth client with application type **Web application**. Set the
   authorized JavaScript origin to:

   ```text
   https://d19k6l47v6hw3.cloudfront.net
   https://leselaut-german.professor-ut7.chatgpt.site
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
   https://leselaut-german.professor-ut7.chatgpt.site/auth/confirm
   ```

   Google redirects first to Supabase; Supabase redirects to this application
   callback. These are two different redirect URIs and both must be correct.
6. Open LeseLaut's Account page in a private window. Once Google is enabled, the
   **Continue with Google** button appears automatically. Test a new account and
   the same verified email as an existing account. Confirm the existing learner
   progress remains available. Keep the original browser session signed in while
   testing so no unsynced local work is discarded.
7. Before offering Google sign-in to everyone, satisfy Google's current publishing,
   authorized-domain and consent-screen requirements and publish the OAuth app
   to its intended audience. Enabling the Supabase switch does not remove a
   Google Testing-mode restriction. Follow the console's current requirements
   for your app's homepage, privacy information and any required verification.

The application keys AWS SQLite data by the verified Supabase subject, never by a Google
email or a browser-supplied ID. Supabase controls identity linking; do not manually
merge learner records by matching email addresses. Existing email/password sign-in stays
available. If Google is disabled or its settings cannot be loaded, no broken
Google button is shown.

After choosing the custom domain, add its HTTPS origin and `/auth/confirm`
callback to the same settings before switching the public URL. Keep the existing
callbacks while users migrate. A custom application domain does not require
Supabase's optional paid custom Auth domain.

Reference: [Supabase's official Google setup guide](https://supabase.com/docs/guides/auth/social-login/auth-google).
