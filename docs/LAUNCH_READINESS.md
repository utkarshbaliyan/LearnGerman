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
  actions. The owner subsequently confirmed receiving both ALARM and OK messages
  in the support inbox on 24 October; no service failure was induced.
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
  The owner received the revised confirmation and confirmed successfully.
- Fresh API sign-in verified email confirmation. Two independently signed-in
  sessions read the same saved test progress; a mismatched progress owner was
  rejected with 409. Account and export ownership matched the disposable identity.
  That signup was an API transport test using an implicit callback. The later
  owner-reported browser lifecycle pass is recorded under device verification.
- The owner saved the new `leselaut_account_deletion` key privately. Its format,
  dashboard prefix and a non-existent-user admin request were checked without
  printing the credential or reading other identities. It is now installed in
  encrypted AWS runtime; the service is healthy and the retry worker ran
  successfully with no pending rows. The later credential retirement is recorded below.
- The first recovery link opened the site instead of the reset form. The
  dashboard allowed `/auth/confirm` but omitted the recovery request's
  `?intent=recovery` variant. Both supported origins now have that explicit
  callback, verified after a dashboard reload. A fresh recovery message was
  accepted. Safari subsequently remained on the callback after saving its session.
  Opening the reset page in that same tab reached the form; the owner submitted
  a private password and the browser reported success. The old password and a
  pre-recovery refresh token were rejected. The owner selected their own password,
  so automated new-password sign-in was not performed with that password.
- Callback session checks now have a 15-second deadline with recovery/sign-in
  links on failure. The reset page uses the same deadline. Ordinary sign-in no
  longer waits for progress synchronization before navigation; the root layout
  continues handling sync. The exact cause of Safari's stalled callback has not
  been established; these changes bound the wait and provide an escape path.
- The disposable account's deletion returned 200/complete. Its still-unexpired
  token then received 401 for account, progress and export reads and for a progress
  write. Supabase admin lookup returned 404. Scoped production database checks
  found zero rows in all four learner tables and a completed deletion ledger.
  Replaying only that already-deleted identity through the scheduled worker
  completed successfully and left all four tables empty. This verifies idempotent
  retry after provider deletion, not a simulated provider outage.
- [PR #3](https://github.com/utkarshbaliyan/LearnGerman/pull/3) merged as
  `9379ec20066a02ec254dfce9f1f3ad448934515f`. The
  [main deployment](https://github.com/utkarshbaliyan/LearnGerman/actions/runs/40070065992)
  passed all build/test/deployment steps. A local browser test with deliberately
  stalled authentication displayed the timeout and recovery links. Live callback
  error handling displayed its navigation options, and all nine read-only launch
  checks passed on both supported site origins.

### Credential retirement, 24 October 2026

- The owner deleted the older secret API key named `default`. A dashboard reload
  verified it was absent while the publishable key and `leselaut_account_deletion`
  remained. The owner then disabled legacy JWT-based API keys. After reloading,
  the legacy-key page offered **Re-enable JWT-based API keys**, confirming the
  disabled state.
- The retained publishable key still returned 200 for Auth settings, with email
  confirmation required. The replacement server secret returned 404 for a random,
  non-existent admin user, confirming credential acceptance without reading any
  learner identity. No key values were printed or committed.
- These checks establish retirement of the older API-key paths. The exact value
  of the historical exposure was not recovered. JWT signing keys were not rotated.

### Owner device verification, 24 October 2026

- Story audio initially failed or stopped early on the owner's iPhone in Safari.
  [PR #5](https://github.com/utkarshbaliyan/LearnGerman/pull/5) deployed AAC versions
  of all 654 existing A1–B2 recordings and removed per-word passage re-renders.
  All 213 tests and both builds passed; the
  [production deployment](https://github.com/utkarshbaliyan/LearnGerman/actions/runs/40072719317)
  succeeded. Live probes, seeking and tail ranges passed across all four levels.
  The owner confirmed that the affected story plays fully and smoothly in Safari
  on their physical iPhone. The exact original decoder failure remains unconfirmed.
- The owner confirmed the requested progress-sync test: a story completed on
  iPhone appeared on the laptop after refresh, and the reverse direction worked.
- In Active Learning, the owner confirmed the microphone test: recording a German
  translation, stopping/transcribing it, playing the recording and seeing the
  recognized text worked on the iPhone.
- The owner confirmed the photo flow: upload a handwritten translation, review
  and confirm its recognized text, then receive translation feedback.
- The owner confirmed receipt of both the earlier AWS/CloudWatch ALARM and OK
  test emails. This verifies the inbox delivery leg separately from the recorded
  successful SNS actions.
- The owner confirmed the requested fresh disposable-account flow in iPhone
  Safari: signup, email confirmation, recovery through a new email link,
  password update, sign-in with the new password and account deletion.
- The owner subsequently confirmed a fresh Google signup/sign-in in a private
  window. Production capacity and fault-handling evidence is recorded in
  [reading beta verification](RELEASE_VERIFICATION.md).

These are owner-reported functional passes, not an instrumented audit of content
quality, denied permissions, network failures or every phone/browser combination.

The disposable authentication identity was deleted. Private operator test files
are removed after verification. No existing learner account is a test target.

The owner explicitly deferred teacher review and beta invitations. Neither is
marked complete. No domain was purchased. Fresh Google signup and a bounded
production capacity check have now passed. The latest release also checks local
draft cleanup and network-failure recovery; see the evidence and limits in
[reading beta verification](RELEASE_VERIFICATION.md). Broader device coverage,
larger-scale capacity and AI billing setup remain outside the verified reading
beta scope.

### Active Learning paused, 24 October 2026

After the functional checks, the owner requested keeping Active Learning off.
The encrypted production runtime and ignored local settings now set
`LESELAUT_AI_ENABLED=0`; the application restarted successfully. The shared
provider gate rejects outbound AI requests before reserving usage or contacting
Groq/OpenAI. Existing learner records are retained. The UI hides the navigation
and home card, and direct or embedded workspaces show a paused message. Reading
sessions can still finish as reading practice. To resume, explicitly restore the
UI feature flag and runtime AI gate after reviewing costs.

Groq is the selected provider while its configured key is present; the OpenAI
key is a configured alternative, not an automatic failover. Groq billing could
not be inspected without signing in. The owner deferred that setup when pausing
Active Learning. The requested INR 600/month AI budget remains unconfigured.

### Private runtime configuration

The production runtime now uses the key `leselaut_account_deletion` as
`SUPABASE_SECRET_KEY`. Its local copy remains in ignored `.env.local`; do not put
it in a chat, screenshot, PR or source file. The older secret was deleted and
legacy `anon`/`service_role` API-key access disabled separately; creating a
replacement by itself would not revoke them. Known application consumers use the
retained keys. Do not re-enable retired credentials to work around a stale client.

For [Supabase SMTP configuration](https://supabase.com/dashboard/project/npnzojbbwwdtujuurkmx/auth/smtp),
the saved public settings are sender `leselaut.team@gmail.com`, name
`LeseLaut`, host `email-smtp.ap-south-1.amazonaws.com`, and port `587` with STARTTLS.
The dedicated SMTP username/password are in encrypted SSM `/leselaut/ses-smtp`;
the operator completed their private transfer into Supabase, preserving email
confirmation. They are not the AWS account credentials or the Supabase API key.

The runtime configurator propagated the key, the root-only service environment
was refreshed, and the application and retry timer are active. Recovery, deletion,
stale-token rejection, deleted-identity retry and independent-session API progress
sync passed with the explicitly disposable identity. Owner-reported phone and
two-device and fresh email-account lifecycle passes are recorded above; failure
cases and broader device coverage still need verification. Keep actual
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

## Reading beta scope and deferred work

1. **Deletion cleanup verification:** disposable-account API deletion, stale-token
   rejection and deleted-identity worker retry passed. The owner also confirmed
   disposable-account deletion in iPhone Safari. Fault-injection tests now verify
   both draft formats and in-flight sync cleanup. Other devices need sign-out or
   manual site-data cleanup; provider-outage behavior is covered by automated tests.
2. **Email delivery:** AWS SES custom SMTP is now saved and enabled. The
   updated confirmation message reached the inbox and confirmation passed.
   An earlier recovery needed manual navigation past a stalled callback; after the
   fixes, the owner confirmed a fresh browser signup and recovery flow through a
   new email link, including new-password sign-in. Preserve email-confirmation
   protections. A Gmail sender is an interim setup; a domain
   controlled by the operator is needed for sender-domain authentication under
   that domain and should be evaluated before public release.
3. **Fresh accounts and devices:** fresh Google signup passed in the owner's
   private-window test. Fresh email signup,
   recovery, new-password sign-in and deletion passed in the owner's iPhone Safari
   test. Story audio, two-device progress sync, microphone/transcription and
   photo/feedback also passed on the owner's iPhone.
   Network-failure/reconnect and stalled-request tests now pass. Microphone and
   camera permission-denial checks are deferred with Active Learning; broader
   device coverage remains limited. Test deletion only with a disposable identity.
   An existing-account Google login and an isolated AWS backup restore were
   already documented; those do not cover these new flows.
4. **Capacity and cost:** a real authenticated production check passed at 1, 5
   and 10 concurrent disposable accounts: 215 requests, no HTTP errors and a
   ten-client p95 of 1,206 ms. This is a bounded reading-beta check on the single
   SQLite host, not a maximum-capacity guarantee. AI latency and billing checks
   are deferred while AI is disabled. Before re-enabling, configure provider
   billing controls and review actual cost per activity; 200 calls can have
   different costs. Budget notifications alone do not stop expenditure.
   The owner selected **INR 600 per month for AI** on 24 October 2026. This is a
   requested budget, not a verified configured limit. The existing AWS USD 6
   account budget is separate and sends notifications only. OpenAI now documents
   an optional [enforced project spend limit](https://developers.openai.com/api/docs/guides/spend-limits);
   verify it in the project that owns the runtime key, allowing for currency,
   taxes and delayed enforcement before claiming the INR budget is protected.
5. **Learning review:** have a German teacher review the initial path, recordings
   and false corrections, then run the learner pilot in `reception/REVIEW.md` and
   `TUTOR-PILOT.md`. Keep validation/fluency claims out until supported.

The new OpenAI key was created with the owner-selected **30-day** expiration and
saved in ignored `.env.local`, then propagated privately to encrypted AWS runtime.
Expiry monitoring remains operator work. Never commit the key.

## Deployment and recovery order

Deploy migration `0005_launch_readiness.sql` before the new server accepts traffic;
the existing AWS release process applies migrations before service restart.
Deploy the checked application release, configure runtime privately and install
maintenance units. Keep Active Learning off until its deferred cost and review
work is resumed. Use the current verification evidence for a small reading beta;
do not infer readiness for an unmeasured large-scale launch.

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
