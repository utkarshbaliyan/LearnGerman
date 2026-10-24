# Public launch remains on hold

Updated 24 October 2026. The existing CloudFront URL is sufficient for a small
invited beta. A purchased domain is optional until branding and email setup need
it. This checklist separates implemented code from production verification.

## Production activation, 23 October 2026

- [PR #1](https://github.com/utkarshbaliyan/LearnGerman/pull/1) merged as
  `ccad67649dfa8798606091dab158f79af7734156`.
  [The main deployment](https://github.com/utkarshbaliyan/LearnGerman/actions/runs/39992298238)
  completed successfully, including the full test suite and AWS smoke checks.
- All nine read-only launch checks passed on both the CloudFront URL and the
  original Sites compatibility address. These checks do not establish that
  authenticated recovery or deletion works end to end.
- The encrypted production runtime was updated with the newly created OpenAI
  key, `LESELAUT_AI_DAILY_CALL_LIMIT=200`, and `LESELAUT_AI_ENABLED=1`. Existing
  provider selection and enabled learner writes were preserved.
- Maintenance units are installed. The application, daily backup timer and
  five-minute deletion retry timer are active. A new consistent backup reached
  private S3 at 17:10 UTC and emitted `BackupSucceeded=1`.
- The reviewed CloudFormation change set added SNS and the missing-backup alarm,
  wired CPU/instance alarms to SNS, and granted namespace-limited backup metric
  publishing. The deployed EC2 definition was preserved exactly: no server
  replacement or UserData update. All three alarms subsequently reported OK.
- The operator confirmed the SNS subscription for `leselaut.team@gmail.com`.
  A clearly labelled simulated alarm and its recovery successfully executed SNS
  actions. Actual inbox receipt still needs owner confirmation; no service
  failure was induced.
- The owner selected AWS SES. Its support sender is verified, Mumbai production
  access was granted, feedback forwarding remains enabled, and account-level
  suppression covers bounces and complaints. A dedicated SMTP identity can send
  only from the selected sender; policy simulation denied another sender and
  unrelated AWS administration. SMTP credentials are stored only in encrypted
  SSM `/leselaut/ses-smtp`, outside application runtime and Git.
- SES SMTP accepted one setup message for an owner-selected disposable test
  inbox. This was a transport check, not account signup or proof of inbox delivery.
  Supabase SMTP configuration was completed on 24 October as recorded below.

### Email setup and verification, 24 October 2026

- [PR #2](https://github.com/utkarshbaliyan/LearnGerman/pull/2) merged as
  `04bdb46642c7c6326b4282f26234de58c02e26af`; its
  [main deployment](https://github.com/utkarshbaliyan/LearnGerman/actions/runs/40066537989)
  passed. The nine read-only live checks passed again during setup.
- The operator entered SES credentials and saved custom SMTP. A dashboard reload
  confirmed it remained enabled with the intended host and sender. The public
  Auth settings still require email confirmation. The temporary private SMTP
  handoff file was removed after setup; its encrypted AWS source remains.
- Supabase accepted a real signup for the explicitly disposable test inbox. The
  owner received its confirmation message but reported no usable visible link.
  The existing template contained a standard confirmation anchor; the exact
  inbox-rendering cause has not been established.
- Confirmation and recovery templates now have distinct LeseLaut subjects, a
  prominent action, and a complete confirmation address as fallback. Both were
  saved in Supabase and inspected in Preview. Their maintainable sources and
  manual application procedure are in [deploy/supabase/emails](../deploy/supabase/emails/README.md).
  A fresh confirmation was accepted for sending; completion is still unverified.
- An API sign-in check returned `email_not_confirmed`. No successful fresh-account
  sign-in, independent-session progress sync, recovery or deletion is claimed.
  The signup was an API transport test using an implicit callback; the current
  browser PKCE flow still needs its own end-to-end verification.
- A new `leselaut_account_deletion` key exists in the dashboard, but a presence-only
  file check still found no `SUPABASE_SECRET_KEY` in ignored `.env.local`. It has
  not been installed in production. Existing-key revocation remains unverified.

The disposable authentication identity and its private operator test state must
be cleaned up after the workflow. No existing learner account is a test target.

The owner explicitly deferred teacher review and beta invitations. Neither is
marked complete. No domain was purchased. Full signup/recovery/deletion testing
and real-phone/two-device checks remain outstanding.

### Prepared owner handoff

The production project now lists the key `leselaut_account_deletion`. The owner
must save its value privately as `SUPABASE_SECRET_KEY` in ignored `.env.local`; do not put
it in a chat, screenshot, PR or source file. Identify the previously exposed key
and its consumers separately before revocation. Creating a replacement does not
revoke either an old secret or legacy `service_role` key.

For [Supabase SMTP configuration](https://supabase.com/dashboard/project/npnzojbbwwdtujuurkmx/auth/smtp),
the saved public settings are sender `leselaut.team@gmail.com`, name
`LeseLaut`, host `email-smtp.ap-south-1.amazonaws.com`, and port `587` with STARTTLS.
The dedicated SMTP username/password are in encrypted SSM `/leselaut/ses-smtp`;
the operator completed their private transfer into Supabase, preserving email
confirmation. They are not the AWS account credentials or the Supabase API key.

After setup, propagate the deletion key with the existing runtime configurator,
refresh the root-only service environment without printing it, and verify an
explicitly disposable identity through signup, recovery, independent-session
progress sync, deletion, stale-token rejection and retry behavior. Keep actual
test email addresses and tokens out of this public repository. No existing
learner account is authorized for deletion testing.

## Implemented and deployed

- Password-recovery request, PKCE callback routing, password confirmation and
  global session sign-out after a successful password change.
- Authenticated account deletion requires an exact email, the word DELETE and a
  password/OAuth/OTP authentication in the last ten minutes. Token refresh does
  not qualify. Ownership always comes from the signed Supabase subject.
- A transaction records deletion and purges all four learner tables. Triggers
  prevent late writes from recreating deleted accounts; normal API access rejects
  their still-unexpired JWTs. Provider failure returns pending, not false success.
  A scheduled worker retries pending Supabase identity deletions every five minutes
  once the server secret and maintenance service are configured.
- Current-browser progress and account-scoped recovery drafts are cleared after
  deletion. A browser deletion marker prevents an in-flight progress sync from
  restoring a deleted account’s cached history. Other devices need local cleanup.
- Shared daily allowance: **200 provider attempts per UTC day**, across Groq and
  OpenAI, including retry attempts, OCR and transcription. Reservations are atomic
  and persistent. `LESELAUT_AI_ENABLED=0` pauses outbound AI. Invalid limits or a
  broken quota database fail closed. This is a call limit, not a monetary cap.
- Privacy, retention and beta limitations are explained in `/privacy` and
  `/support`, with `leselaut.team@gmail.com` as the contact.
- Infrastructure includes an optional SNS operator subscription, alarm actions
  and a missing-backup alarm. They were activated separately from the application
  deployment as recorded above.
- Read-only launch smoke script: `node scripts/check-launch.mjs https://ORIGIN`.

## Production work still required

1. **Supabase secret rotation:** the earlier operations note records a disclosed
   secret with unverified revocation. Determine exactly which key was exposed,
   check its consumers and revoke it safely. A new OpenAI key does not fix a
   Supabase exposure. Do not paste either secret into chat or GitHub.
2. **Deletion credential:** put a new server-only `SUPABASE_SECRET_KEY` into the
   encrypted AWS runtime. The public browser key cannot delete identities. Do not
   enable deletion using an old exposed secret. The route returns 503 and offers
   support when the secret is absent; no data is partially removed in that case.
3. **Email delivery:** AWS SES custom SMTP is now saved and enabled. Verify the
   updated confirmation message in the test inbox, then complete confirmation,
   the current browser PKCE flow and recovery. Preserve email-confirmation
   protections. A Gmail sender is an interim setup; a domain
   controlled by the operator is needed for sender-domain authentication under
   that domain and should be evaluated before public release.
4. **Operations verification:** backup and alarm infrastructure is active, but
   inbox receipt and a real pending-deletion retry still need verification.
   The deletion timer cannot contact Supabase until its server credential is
   installed; an active timer alone is not a successful deletion test.
5. **Fresh accounts and devices:** test a fresh Google account, email account,
   recovery, sync between two devices, microphone/photo consent and failures on
   common phones. Test deletion only with an explicitly disposable test identity.
   An existing-account Google login and an isolated AWS backup restore were
   already documented; those do not cover these new flows.
6. **Capacity and cost:** measure realistic authenticated production traffic and
   AI latency/429/503 rates. The server is a single SQLite host. Configure provider
   billing controls and review actual cost per activity; 200 calls can have
   different costs. Budget notifications alone do not stop expenditure.
7. **Learning review:** have a German teacher review the initial path, recordings
   and false corrections, then run the learner pilot in `reception/REVIEW.md` and
   `TUTOR-PILOT.md`. Keep validation/fluency claims out until supported.

The new OpenAI key was created with the owner-selected **30-day** expiration and
saved in ignored `.env.local`, then propagated privately to encrypted AWS runtime.
Expiry monitoring remains operator work. Never commit the key.

## Deployment and recovery order

Deploy migration `0005_launch_readiness.sql` before the new server accepts traffic;
the existing AWS release process applies migrations before service restart.
Deploy the checked application release, configure runtime privately and install
maintenance units. Keep launch on hold until the production checks above pass.

Before restoring an older database, preserve the newest deletion ledger and
reapply each pending/completed deletion to the restored copy. Keep the service
read-only until identities, learner ownership and deletion barriers are verified.
Do not restore erased learning history just because it exists in a backup. If the
latest deletion ledger cannot be recovered, treat restoration as blocked pending
operator review. Never test a restore by overwriting live learner data.

## Validation recorded for this change

- Node 22.16.0: **210 tests passed**, zero failures or skips.
- Sites production build and AWS standalone production build passed; the AWS
  smoke test checked database readiness, eleven pages and protected APIs.
- TypeScript and ESLint on changed TypeScript sources passed. AWS accepted the
  CloudFormation template in a read-only validation; no stack update was applied.
- Browser inspection covered the recovery form and privacy page; the latter had
  no horizontal overflow at a 390 px viewport. No recovery email was sent.
- Validation used a Git-derived temporary copy with materialized public assets
  and the matching dependency installation. The Documents checkout’s public-file
  copy stalls affected the previous commit as well. Changed source files were
  compared by SHA-256. No live learner records or paid AI calls were used.

## References

- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
- https://supabase.com/docs/reference/javascript/auth-admin-deleteuser
- https://supabase.com/docs/guides/auth/managing-user-data
- [AWS deployment, backups and recovery](AWS_HOSTING.md)
