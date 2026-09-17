# Data operations

## Current implementation

Supabase owns authentication. Sites D1 binding `DB` owns application data in
`users`, `user_progress`, `tutor_sessions`, and `tutor_quotas`.
The Sites database overview confirmed these four tables on 2026-09-17.

Signed-in learners can download a versioned JSON export from Account. The
`GET /api/account/export` endpoint verifies the Supabase JWT and reads only its
subject's records in one D1 batch. It neither creates a profile nor modifies
data. Responses are private/no-store. The export preserves JSON data columns as
strings, timestamps, session versions, and quota history, including legacy
progress. Derived tutor memory and Active Learning completion can be recomputed
from exported attempts; they are not separate stored tables.

This is a personal server-data export, **not a full database backup**. Unsynced
browser recovery data, original photos/audio and Supabase authentication records
are excluded. No import endpoint exists. Keep downloaded exports private.
The current export loads one learner's records in memory; revisit streaming or
paged snapshot exports before individual histories become large.

## Owner-only inspection and diagnostics

Use the Sites Settings database viewer or the authenticated Sites database
overview/table-row tools. Inspect the overview first and use exact returned
table names. Never expose an arbitrary SQL endpoint or allow client-provided
email/metadata to grant admin access. Inspect counts/schema first; only retrieve
learner text when necessary to investigate a specific issue.

Use Sites worker logs for failures. Export failures emit only
`{"event":"account_export_failed"}`; never log bearer tokens, SQL error
payloads, photos, transcripts, or writing. This event is a diagnostic, not an
alerting system. Central alerts and AI latency/cost metrics remain unimplemented.

## Backup and recovery plan — still requires operational setup

Before a destructive migration, obtain an owner-authorized full D1 export or
provider recovery checkpoint through the hosting operator. The bounded table-row
viewer and Git history are not backups. Confirm that the operator can restore
this Sites-managed database; do not assume local Wrangler credentials control it.

Store backups encrypted with restricted access, independently of production.
Choose and document a backup schedule, retention period, recovery-point target
and recovery-time target with the operator. Record schema/migration revision,
export timestamp, row counts and checksums. Protect Supabase auth separately;
D1 restoration cannot restore deleted identities.

Run recovery drills in an isolated staging database: restore schema and data,
compare row counts/checksums, verify account ownership, draft/feedback recovery,
quota values and progress derived from attempts. Record actual recovery time.
Do not mark backups operational until this drill succeeds. Never test restoration
by overwriting the live database.

## Deletion and retention gaps

There is currently no complete account deletion workflow or scheduled retention
purge. Do not promise either in the UI. Full deletion must coordinate Supabase
Auth, all four D1 tables, in-flight tutor/progress writes, and browser recovery
caches. `tutor_sessions` and `tutor_quotas` have no cascading foreign key to
`users`; deleting only a profile leaves those records behind. Practice deletion
must not reset the daily AI quota. A tombstone/retry design is needed to prevent
an interrupted or concurrent deletion from recreating records.

Define separate retention rules for drafts, attempts, transcripts, derived
memory, quotas, backups, and external AI-provider processing before introducing
purges. Audit provider retention independently; absence from D1 is not proof of
deletion by an external provider.

The previously disclosed Supabase secret's rotation status is unverified. The
project's public client key is not a secret. An authorized Supabase operator must
verify/revoke the disclosed secret and update any legitimate server consumers;
never paste the replacement into chat or commit it. This release does not rotate
Supabase keys or require a Supabase admin key.
