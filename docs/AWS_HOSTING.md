# AWS hosting and automatic deployment

AWS endpoint: https://d19k6l47v6hw3.cloudfront.net

The app runs on one Amazon Linux t4g.small instance in Mumbai, behind CloudFront
HTTPS. It retains Vinext and the existing SQLite schema and SQL. The encrypted
10 GB data volume is separate from code releases and retained if the stack is
deleted. Private S3 buckets hold checksum-verified media, release packages and
database backups. Supabase still handles authentication; its user IDs do not
change. This is a single-server deployment, not a high-availability cluster.

## GitHub workflow

`.github/workflows/ci-deploy.yml` runs on pull requests and pushes to `main`:

1. Install the lockfile with Node 22 on an ARM Linux runner.
2. Run TypeScript, the existing Cloudflare build and all tests.
3. Build and smoke-test the standalone AWS server with a disposable database.
4. On `main` only, assume a narrowly scoped AWS role using GitHub OIDC.
5. Upload the exact commit's release and run the fixed SSM deployment document.
6. Check database readiness locally and through the public HTTPS endpoint.

GitHub holds no permanent AWS access keys or AI credentials. Failed checks do not
deploy. Deployments serialize, take a consistent database backup, apply only new
unchanged migrations and restart the service. A readiness failure restores the
previous code, never an older learner database. A restart causes a brief service
interruption. Infrastructure and bootstrap changes require a reviewed manual
update; the workflow deploys application releases.

The pipeline begins after a developer **commits and pushes**. It does not commit
or upload unsaved local edits automatically.

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
browser-only state is scoped to its original domain and needs separate handling
before redirecting the old site.

## Monitoring and recovery

- EC2 console: CPU, status checks and network usage. CloudWatch alarms flag
  sustained CPU pressure or an instance status failure; email delivery is not
  configured automatically.
- CloudWatch Logs: `/leselaut/application`, retained for seven days.
- Systems Manager: deployment command status and service administration.
- Billing console: credits, current spend and free-tier usage. A budget alert
  does not cap expenditure.
- Daily SQLite `.backup` snapshots go to the private backup bucket and expire
  after 30 days. Deployment also makes a backup before applying migrations.
  Validate `PRAGMA integrity_check`, table counts and application ownership on an
  isolated restored database before attempting production recovery.

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
