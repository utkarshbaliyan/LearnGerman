# Enable Google sign-in for LeseLaut

Application code is ready, but Google is currently disabled in Supabase.
Create and configure the OAuth client in the owner's Google/Supabase accounts.
Never put the Google client secret in this repository, browser code or chat.

1. In [Google Cloud Console](https://console.cloud.google.com/), create or select
   the project that should own LeseLaut's authentication. Open Google Auth Platform.
2. Configure Branding with the app name **LeseLaut**, your support email and the
   contact information required by Google. Select the appropriate audience; an
   external app in Testing initially permits its configured test users only.
   Use only basic OpenID Connect identity scopes: `openid`, `email`, `profile`.
3. Create an OAuth client with application type **Web application**. Set the
   authorized JavaScript origin to:

   ```text
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
   URL and add this exact application callback to the redirect allowlist:

   ```text
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

The application keys D1 data by the verified Supabase subject, never by a Google
email or a browser-supplied ID. Supabase controls identity linking; do not manually
merge D1 records by matching email addresses. Existing email/password sign-in stays
available. If Google is disabled or its settings cannot be loaded, no broken
Google button is shown.

Reference: [Supabase's official Google setup guide](https://supabase.com/docs/guides/auth/social-login/auth-google).
