# AWS observability

**Current visitor analytics:** [free Cloudflare Web Analytics](CLOUDFLARE_ANALYTICS.md).
`LESELAUT_RUM_ENABLED=0` remains the production requirement, enforced by deployment
health checks. The existing AWS RUM resources and browser widgets below are
inactive; empty widgets do not mean the site has no visitors. Do not activate
paid AWS RUM without the owner's approval. Cloudflare is preferred if both
providers are configured, so the browser never runs both integrations.

Monitoring lives in the AWS account, outside LeseLaut. Access uses AWS IAM;
there is no website admin dashboard or special permission for an email address.

- [Production dashboard](https://ap-south-1.console.aws.amazon.com/cloudwatch/home?region=ap-south-1#dashboards:name=LeseLaut-Production)
- [Browser monitoring](https://ap-south-1.console.aws.amazon.com/cloudwatch/home?region=ap-south-1#rum:appMonitor=leselaut-web)
- [CloudWatch Logs](https://ap-south-1.console.aws.amazon.com/cloudwatch/home?region=ap-south-1#logsV2:log-groups)

## Legacy AWS browser views (inactive) and current infrastructure views

| Question | AWS view | Meaning |
| --- | --- | --- |
| Who is active now? | Dashboard: Live browsers | Distinct random browser IDs with a visible-page heartbeat in the last five minutes. Refresh the dashboard; ingestion can lag. |
| When did someone visit? | Recent browser visits / sessions | Timestamp, random browser ID, session ID and public page path. Adjust the time picker. |
| What pages are used? | Pages visited / users and page views | Consenting browsers only. A browser ID is not a person or an account. |
| Is the website healthy? | Requests, viewer errors, origin latency, CPU, readiness | CloudFront metrics include cached requests; origin logs do not. Requests include bots and assets. |
| Are there failures? | Browser errors, failing requests, application logs | Sanitized diagnostic records; no replay or request bodies. |
| Are alerts working? | CloudWatch Alarms | Existing CPU, instance and backup alarms, plus application/database readiness. The readiness probe runs every five minutes; two failing/missing periods alert the existing SNS topic. |

Analytics begin when deployed and consented to; old visitor history cannot be
reconstructed. Account, auth and Active Learning pages are excluded. Declining,
blocked telemetry and browser privacy signals create gaps. No email address,
account ID or learning answer is attached to browser analytics.

## Cost and retention

The target is close to ₹0 additional monthly cost, not a guaranteed zero bill.
Mumbai's published RUM rate was verified through AWS Pricing on 26 October 2026:
USD 0.00001 per event, or USD 1 per 100,000 events, before taxes/conversion.
This account's remaining RUM trial allowance could not be confirmed. Do not
assume a free trial applies. See [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/).

There is one native dashboard, standard EC2/CloudFront metrics, one readiness
metric/alarm, no X-Ray, no session replay and no resource-timing collection.
Browser events are capped at 100 per session; visible pages emit one heartbeat
per minute. RUM session sampling is 100% so the live-browser count remains
useful at beta traffic levels. These limits are not a monthly spending cap.
The existing AWS budget sends alerts only. Queries scan selected time ranges;
leave dashboard auto-refresh off when not using it.

Operational logs and the additional RUM CloudWatch copy are retained for seven
days. Native RUM events remain available for 30 days. The browser analytics
cookie lasts up to 30 days; the allow/decline choice lasts up to 180 days.
AWS log ingestion, queries, custom metrics and alarms can cost money if their
respective account allowances are exceeded.

## Reproduce or update

Run from the repository with Node 22 and the configured AWS CLI account:

```sh
node deploy/aws/apply-observability.mjs
node deploy/aws/apply-observability.mjs --apply
```

The first command validates and renders templates without applying changes.
The second manages the separate `leselaut-rum` and `leselaut-observability`
CloudFormation stacks, saves public SDK identifiers, limits RUM log-copy
retention, and installs the origin collector and readiness timer through SSM.
It checks the account against the existing deployment. It does not change AI,
Supabase authentication, runtime credentials or the existing EC2 stack.
The default maintenance script preserves the access collector on later runs.

The browser integration also requires `LESELAUT_RUM_ENABLED=1` in the encrypted
runtime parameter and an application deployment/restart. Its public config
endpoint exposes only enabled status, region, monitor ID and identity-pool ID.
The Cognito guest role can only submit events to this one monitor; it cannot
read monitoring records. Application authentication remains in Supabase.

To stop new browser clients, set that runtime flag to `0`, restart/deploy, and
refresh open pages. Existing loaded clients can continue until closed. For an
ingestion-wide emergency stop, remove `LeseLautRumIngestionOnly` from the RUM
stack's guest role, allowing for IAM propagation; reapplying the stack restores
it. This does not affect app accounts. Website visitors can stop their own
telemetry immediately through **Analytics preferences → Decline**.

## Privacy boundaries

Consent gates loading the SDK. Do Not Track and Global Privacy Control override
consent. Page IDs are allowed public paths without queries/fragments. SDK
automatic page views are disabled; a metadata hook removes referrers and strips
URL queries/fragments before manually recorded page events are serialized.
Selected failed same-origin progress/material requests can be measured, but
authentication endpoints, request bodies and authorization headers are excluded.
Disabling analytics clears only the RUM cookies and cached telemetry identity,
preserving Supabase authentication and learning progress.

Origin JSON logs contain timestamp, method, normalized path, response status,
duration and response size, excluding client IP, query string, cookies, auth
headers and bodies. The AWS RUM service necessarily receives network connection
information; this is not a claim that AWS never processes an IP address.

Details: [RUM privacy](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-RUM-privacy.html),
[AWS web client](https://github.com/aws-observability/aws-rum-web).
