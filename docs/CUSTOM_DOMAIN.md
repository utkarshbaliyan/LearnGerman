# LeseLaut custom domain

The primary address is `https://leselaut.com`, registered through
Cloudflare, with `www.leselaut.com` also supported. Buying a domain does not
move hosting. Keep the existing AWS application, database and backups while
the separate Cloudflare hosting candidate is developed and tested.

## Activation checkpoint — 26 October 2026

- Registration is active through 26 October 2027. Cloudflare hosts DNS on its
  free plan; the website still runs on AWS.
- The ACM certificate in `us-east-1` is issued for both hostnames. Both
  validation CNAMEs remain in DNS for renewal.
- CloudFront distribution `E2SHVXUOX353EM` has both aliases and the certificate;
  its stack update and global deployment completed. The original CloudFront
  address remains available.
- DNS-only CNAME records for the apex and `www` point to
  `d19k6l47v6hw3.cloudfront.net`. Public resolvers return CloudFront addresses.
  HTTPS health, homepage, account and story pages returned HTTP 200 with normal
  certificate validation on both hostnames.
- Supabase's primary Site URL is `https://leselaut.com`; exact confirmation and
  recovery redirects for both hostnames are in its allowlist. Existing redirects
  remain available.
- The owner signed in successfully with Google on iPhone Safari at the new
  domain and played the A1-09 story audio through to the end. The audio endpoint
  also returned HTTP 206 for a byte-range request. A recently registered domain
  can temporarily fail on a resolver that cached the earlier absence of DNS
  records.

## Activation order

1. The owner completes registration, accurate registrant information, payment
   and agreement acceptance in Cloudflare. Review the live checkout price;
   domain ownership and renewal are separate from monthly hosting costs.
2. Request a DNS-validated ACM certificate in **us-east-1** covering the apex
   and `www`. Add both ACM validation CNAMEs to Cloudflare as **DNS only**.
   Keep them for automatic certificate renewal.
3. After ACM reports **ISSUED**, run the domain updater below. It modifies only
   the existing distribution, keeping all previous parameter values, including
   the origin secret. It refuses replacements and unrelated resource changes.
4. Wait for the stack update and distribution deployment to complete. Add DNS
   CNAME records `@` and `www` to `d19k6l47v6hw3.cloudfront.net`, DNS only.
   Cloudflare flattens the apex record; do not add conflicting A/AAAA records.
5. Add explicit HTTPS callback/recovery URLs for both custom hostnames to
   Supabase's allowed redirects. Retain existing production/compatibility
   addresses. Set the primary Site URL to the apex after it is serving HTTPS.
6. Verify HTTPS, pages, byte-range audio playback on iPhone, Google login,
   email recovery, progress sync and account deletion on the custom domain.
   Existing browser storage on the CloudFront hostname does not automatically
   move to the new hostname; signed-in account progress should sync normally.

```sh
python3 deploy/aws/configure-domain.py --domain leselaut.com --certificate ISSUED_CERTIFICATE_ARN
python3 deploy/aws/configure-domain.py --domain leselaut.com --certificate ISSUED_CERTIFICATE_ARN --apply
```

The first command creates and validates a reviewable change set but does not
execute it. The second applies a newly validated change set. Both require an
issued certificate and the existing deployment's AWS account. The updater uses
the deployed template to avoid applying unrelated local infrastructure edits.
The normal source template also supports `CustomDomainName` and
`CustomCertificateArn`, preserving the default CloudFront URL when unset.

Domain activation does not enable AI or paid visitor analytics. Retain the
existing USD15 alert budget and all backups/health alarms. A later Cloudflare
hosting cutover can reuse this domain after the candidate passes testing.
