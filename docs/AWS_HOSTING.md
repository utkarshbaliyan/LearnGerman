# AWS hosting and automatic deployment

Primary address: https://leselaut.com (also https://www.leselaut.com).
The original AWS endpoint remains https://d19k6l47v6hw3.cloudfront.net.

Cutover completed on 23 October 2026. Both this endpoint and the original Sites
address now use AWS. Every imported table value matched the frozen D1 export;
an isolated restore from the S3 backup matched the same digest. The original
signed-in browser also reported that progress was synced. Temporary export
credentials have been removed. The original D1 data remains frozen and retained.

See the [live cost audit](AWS_COST_AUDIT.md) for measured storage, the $6 AWS
billing alert and the evaluated cost reductions. All three S3 buckets abort
incomplete multipart uploads after seven days; completed media and database
backup retention are preserved.

The app runs on one Amazon Linux t4g.small instance in Mumbai, behind CloudFront
HTTPS. It retains Vinext and the existing SQLite schema and SQL. The encrypted
10 GB data volume is separate from code releases and retained if the stack is
deleted. Private S3 buckets hold checksum-verified media, release packages and
database backups. Supabase still handles authentication; its user IDs do not
change. This is a single-server deployment, not a high-availability cluster.

## GitHub workflow

`.github/workflows/ci-deploy.yml` runs on pull requests, pushes to `main`, and
manual dispatch. The path from a change to production is:

1. Commit locally, push a branch, and open a PR targeting `main`.
2. The required `check-and-deploy` job installs the lockfile with Node 22 on ARM
   Linux, checks TypeScript, builds the existing target, runs all tests, and
   builds and smoke-tests the AWS standalone server using a disposable database.
3. Merge the passing, up-to-date PR. The push to `main` repeats those checks.
4. Only after success, the separate `deploy` job downloads that run's checked
   archive. It uses GitHub OIDC to obtain temporary AWS credentials, uploads the
   archive to private S3, and invokes the fixed SSM deployment document.
5. The server locks deployment, backs up SQLite, verifies/applies migrations,
   switches code, and checks local readiness plus both public HTTPS endpoints.
6. Production is successful only when health reports the exact checked commit
   and the public page, JavaScript, account page, protected APIs, disabled browser
   monitoring, and audio byte ranges pass. GitHub independently repeats these
   public probes after SSM completes.

PR checks have no OIDC permission. The AWS role trusts this repository's `main`
branch only, can upload releases and invoke the fixed deployment document, and
cannot retrieve runtime secrets. The deployment job records production status
and a link in GitHub's Deployments view through the REST API; it deliberately
keeps branch-based OIDC identity (a job-level environment would change it).
Deployments serialize without cancelling an active rollout. Superseded commits
are skipped before deployment. Checked archives expire from GitHub after one day.

### Branch protection and visible failures

Live rules verified on 28 October 2026: PR required; `check-and-deploy` required
and branch must be up to date; admins included; force pushes and branch deletion
blocked. Stale reviews are dismissed, but **zero human approvals are required**.
The agent reviews its diff before publishing; branch protection does not promise
an independent human review. Keep the required job name when editing the workflow.

Use **Actions → Check and deploy** for separate check/deploy results, the step
summary for the commit and SSM command ID, and **Deployments → production** for
release history and production links. A failed check prevents the deploy job.
An SSM failure marks deployment failed and identifies the command to inspect;
logs never print runtime secrets. A timeout or cancelled job can leave an SSM
command running: inspect that command before retrying. A public failure detected
after SSM success is reported as a failure, with no claim that rollback occurred.

### Rollback and bootstrap updates

The root-owned `/usr/local/bin/leselaut-deploy` is installed separately from app
code. Changes to `deploy/aws/release.sh` must be reviewed and tested, uploaded to
`bootstrap/release.sh` in the artifact bucket, then installed atomically through
SSM after checking its SHA-256. Merely merging this file does not update the live
helper. Keep the old helper for recovery; do not rerun server bootstrap or replace
the instance to update it. Infrastructure changes also require a separate update.

A failed backup, migration, startup, local readiness or server-side public probe
restarts the previous code and reports whether database readiness recovered.
Rollback **never restores an older learner database**. Migrations must remain
additive and backward compatible. Isolated tests inject backup, migration,
readiness and public-check failures, assert the previous release returns, and
assert the learner database is unchanged. Production is never deliberately broken
for this drill. To undo a bad application change, revert it in a new PR, pass the
checks, and merge; the new main commit follows this same pipeline. Restoring data
from backup is a separate destructive recovery operation requiring owner approval.

A restart causes a brief service interruption on this single server. Old generated
releases are pruned only after a healthy rollout; current and previous code are
protected. Unsaved local edits are never uploaded automatically.

## Secrets and data

Runtime configuration is an SSM SecureString at `/leselaut/runtime`. The EC2 role
reads it into a root-only systemd environment file. Media storage is read-only to
the application. Administration uses SSM, with no SSH ingress. The origin accepts
CloudFront traffic with a separate origin token.

The temporary `/api/internal/migration` export is disabled unless its token hash
and expiry are explicitly configured. It exposes a consistent snapshot of four
fixed tables, never arbitrary SQL or runtime credentials. Freeze the old site's
API before the final export, verify all imported values and counts, remove the
export configuration, and enable AWS writes only after authentication works.
Never overwrite a populated live database with a staging snapshot.

The new domain must be allowed in Supabase URL Configuration. Users sign in again
on the new origin. Cloud progress transfers with the unchanged Supabase subject;
browser-only state is scoped to its original domain. The old address therefore
remains as a compatibility proxy to AWS rather than forcing a redirect. Set
`LESELAUT_AWS_ORIGIN` only after final data import; proxy failures return 503 and
never silently write to the retired D1 database. Both origins then use the same
authoritative AWS backend.

## Monitoring and recovery

- EC2 console: CPU, status checks and network usage. CloudWatch CPU, instance
  health and missing-backup alarms now publish to an SNS topic with a confirmed
  operator email subscription. A labelled alarm simulation successfully executed
  its SNS action; owner inbox receipt is a separate check. See the current
  [activation record](LAUNCH_READINESS.md).
- CloudWatch Logs: `/leselaut/application`, retained for seven days.

For free visitor visits and page views, see [Cloudflare Web Analytics](CLOUDFLARE_ANALYTICS.md).
Paid AWS browser RUM remains disabled. For infrastructure health and the
production dashboard, see [AWS observability](AWS_OBSERVABILITY.md).
- Systems Manager: deployment command status and service administration.
- Billing console: credits, current spend and free-tier usage. A budget alert
  does not cap expenditure.
- Daily SQLite `.backup` snapshots go to the private backup bucket and expire
  after 30 days. Deployment also makes a backup before applying migrations.
  Validate `PRAGMA integrity_check`, table counts and application ownership on an
  isolated restored database before attempting production recovery.
- Account-deletion retries run every five minutes after their server-only
  Supabase credential is installed. The timer is installed, but missing
  credentials deliberately skip work; an active timer is not deletion proof.

The application and backend concurrency tests do not establish a production user
capacity guarantee. Scale requires production measurements; another server
cannot share this local SQLite file. Plan a managed database migration before
adding application replicas.

## Costs

The account predates the new-customer credit program. AWS currently offers all
customers 750 aggregate t4g.small hours/month through **31 December 2026**; other
t4g.small instances in the account consume the same allowance. Standard CPU
credits avoid surplus-credit charges but sustained CPU load can throttle.

EBS, public IPv4, S3 operations/storage, CloudFront usage outside applicable
allowances, logging, AI providers and tax can still cost money. After the trial,
instance hours are also charged. This deployment has no NAT gateway, load
balancer or RDS instance. Recheck AWS pricing and actual billing before launch.

Primary references:

- https://aws.amazon.com/ec2/faqs/
- https://aws.amazon.com/free/free-tier-faqs/
- https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws
- https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Install-CloudWatch-Agent.html

### Homepage response headers

Keep both `/` and `/:path*` rules in `next.config.ts`: the locked Vinext matcher
skips the empty path segment for the catch-all rule. The explicit root rule
applies the same existing security policy to the homepage as to other pages.
The AWS standalone smoke test checks the public-page headers. Public deployment
verification rejects a homepage missing CSP framing protection, `X-Frame-Options`
or `X-Content-Type-Options`, so this gap cannot silently return after deployment.
