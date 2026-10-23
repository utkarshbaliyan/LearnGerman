# AWS cost audit — 23 October 2026

The project remains on AWS, account `941377117901`, region `ap-south-1`.
This audit used live resource inventories and the AWS pricing catalog. The
application release, media quality, AI models and learner database were unchanged.

## Measured resources and approximate baseline

| Resource | Measured configuration | Low-traffic monthly estimate, USD |
| --- | --- | --- |
| EC2 | One running `t4g.small`; standard CPU credits | $0 while the shared trial allowance applies; about $8.18 afterward at the current Mumbai rate |
| Public IPv4 | One auto-assigned address | $3.65 for 730 hours |
| EBS | 8 GB root + 10 GB learner data; encrypted gp3; baseline IOPS/throughput | $1.64 |
| S3 | 345 MB media, 2.28 GB release/bootstrap artifacts, less than 1 MB of current backups | About $0.07 storage initially, plus requests, versions and growth |
| CloudFront / monitoring | Public asset caching; dynamic APIs uncached; basic EC2 monitoring; seven-day application logs | Assumes low traffic within applicable shared free allowances |

The initial fixed/storage baseline is therefore approximately **$5.4/month
before tax**, with variable usage additional. The compute trial currently ends
on **31 December 2026**, after which roughly $8.18/month is added at current
prices. These are estimates, not a spending cap or a production-load forecast.
AI provider charges, domain purchase, email service, and any paid Supabase or
Sites subscription are separate. CloudFront and trial allowances can be shared
with other resources in the account.

The first Cost Explorer query returned zero estimated charges for the launch
day. Billing data can lag; this does not mean the deployment is free. No unused
LeseLaut-tagged volumes or duplicate running project instances were found in
Mumbai. Other projects were not modified or deleted.

## Applied controls

- Created **LeseLaut AWS monthly guardrail**, an account-wide $6 monthly cost
  budget, with an actual-spend notification above $6 to the existing alert
  recipient explicitly approved by the owner. The pre-existing $1 account budget
  was retained. Notification delivery is controlled by AWS; an alert does not
  stop spending or include external AI-provider bills.
- Enabled cleanup of incomplete multipart uploads after seven days in the
  artifact, media and backup buckets. This prevents failed uploads accumulating
  storage charges. It does not expire completed media or release archives, and
  preserves existing versioning and 30-day database backup retention. There were
  no demonstrated abandoned-upload charges to remove, so immediate savings from
  this control are not claimed.
- Mirrored the cleanup in the source stack template and added a repeatable,
  plan-before-apply operator helper. It rejects unexpected concurrent lifecycle
  changes and preserves existing rules. Recovery and retention guard tests pass.

## Evaluated and left unchanged

The public IPv4 address is the largest initial recurring charge. AWS supports
IPv6 CloudFront origins and dynamic public IPv4 removal, so an additive IPv6
path was prepared while retaining IPv4. Actual server-side DNS/TLS tests showed
that this Supabase project's API hostname has no IPv6 AAAA record. The backend
needs that endpoint for authentication/provider settings and public JWT signing
keys. Removing IPv4 would therefore risk broken authentication.

The unused IPv6 preparation was removed. CloudFront retained its original
IPv4 origin, and the public IPv4 address was never removed. No external proxy,
static signing-key workaround, paid NAT gateway or additional endpoint service
was added to bypass this dependency.

The instance remains on `t4g.small`: downsizing now could lose the trial and
reduce memory. Standard CPU credits already avoid surplus-credit charges.
Existing immutable media caching, small gp3 volumes, backup retention and
seven-day diagnostic logs were retained. Savings Plans or long commitments are
premature while compute is covered by the trial and demand is unvalidated.

## Before the public launch

Email/password authentication already exists. Google OAuth still needs its
owner-created client configured in Supabase; follow [the Google setup guide](GOOGLE_AUTH_SETUP.md).
Then choose the domain, configure its HTTPS/DNS and callback allowlists, and
verify sign-in, progress synchronization and password-reset/email delivery on
the final origin. The existing users and Supabase subject IDs must be preserved.

Keep the distinction between infrastructure spending and AI spending: the
20-requests-per-user-per-UTC-day quota is not an application-wide monetary cap.
A separate aggregate AI allowance and paid-tier policy need agreement before a
large unrestricted launch. Review learner privacy, retention and account deletion
before accepting public registrations; the hosting migration did not complete
those product requirements.

## References and operations

- [AWS hosting and recovery](AWS_HOSTING.md)
- [Operator cleanup helper](../deploy/aws/apply-cost-controls.py): use `plan`, inspect the saved plan, then `apply`; requires botocore or AWS CLI v2's Python environment.
- [EC2 trial](https://repost.aws/articles/ARi_gf6vo6TuqNtMQdiYPKyA/announcing-amazon-ec2-t4g-free-trial-extension)
- [Public IPv4 pricing](https://aws.amazon.com/vpc/pricing/)
- [EBS pricing](https://aws.amazon.com/ebs/pricing/)
- [S3 abandoned-upload cleanup](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpu-abort-incomplete-mpu-lifecycle-config.html)
- [AWS Budgets limitations](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html)
