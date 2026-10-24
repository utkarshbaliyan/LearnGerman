# Reading beta verification — 24 October 2026

Scope: stories, books, vocabulary, grammar, accounts and progress sync at
`https://d19k6l47v6hw3.cloudfront.net`. Active Learning and outbound AI remain off.
Teacher review and beta invitations remain explicitly deferred by the owner.

## Production capacity

Ten new disposable identities used real Supabase password sessions and the
production JWT checks, application server and SQLite database. Reserved invalid
email addresses were provisioned through the admin API; no email was sent and no
existing learner account was a fixture. This was an HTTP check, not ten rendered
browsers or a sustained capacity benchmark.

The check alternated authenticated account/progress reads, progress saves and
public story-page rendering, with a 400 ms pause between each client's requests.
Readiness was checked between stages; final reads verified every successful
save and that progress belonged only to its test identity.

| Concurrent clients | Requests in stage | Median | 95th percentile | Maximum |
| --- | --- | --- | --- | --- |
| 1 | 12 | 258 ms | 633 ms | 633 ms |
| 5 | 60 | 325 ms | 755 ms | 783 ms |
| 10 | 120 | 264 ms | 1,206 ms | 1,229 ms |

Including setup reads, readiness and final persistence checks: **215 requests,
zero HTTP failures, zero retried conflicts, no observed ownership leakage or
lost successful saves**. No AI endpoint was called. This supports a small reading
beta; it does not establish maximum capacity or performance at larger scale.

All ten test identities were then deleted through the application. All ten old
tokens were rejected by progress reads and all ten Supabase admin lookups returned
404. The private token fixture and provisioning helper were removed. Aggregate
reports contain no test emails, user IDs, tokens or learner data:

- [Capacity report](verification/capacity-2026-10-24.json)
- [Cleanup report](verification/capacity-cleanup-2026-10-24.json)

`scripts/check-capacity.mjs` reproduces the bounded HTTP check with an explicitly
disposable private fixture. Never supply existing learner sessions. Provisioning
and cleanup are operator tasks; the script itself does not create or delete users.

## Fault handling and cleanup

Fault-injection tests cover offline requests, HTTP 503, stalled session lookup,
stalled network requests, reconnect/merge, and deletion racing with an in-flight
sync. They verify that local edits survive failures and merge with remote progress
on retry. Session lookup and normal authenticated HTTP requests now have deadlines;
callers with a longer explicit signal retain that deadline. Sync status provides
an explicit retry action.

Account changes invalidate in-flight synchronization and queued saves. Tests also
delay a response until after sign-out or a second account's completed sync and
verify that the old reply cannot restore the signed-out account or overwrite the
new owner's cache.

Deletion now removes both legacy tutor drafts and current translation drafts.
Sign-out and account switching clear the previous owner's drafts too. Tests check
that another owner's draft and the theme setting remain, while late sync replies
cannot restore deleted account progress. Other browsers/devices still require
sign-out or site-data cleanup as explained in the deletion UI; remote erasure of
offline browser storage is not claimed.

## Owner device checks

The owner confirmed fresh Google signup/sign-in in a private window. Earlier
iPhone Safari checks passed full story playback, two-way progress sync and the
fresh email signup/confirmation/recovery/new-password/deletion flow. The earlier
microphone/photo checks passed before Active Learning was paused.

These checks do not cover every browser/device. German teacher review and a
learning-outcome pilot are deferred, so the product remains a beta with no
validated fluency or assessment claims. A custom domain is optional for using
the existing HTTPS site; sender-domain authentication can follow domain setup.
