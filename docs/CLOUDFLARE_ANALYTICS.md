# Free visitor analytics

Open [Cloudflare Web Analytics](https://dash.cloudflare.com/?to=/:account/web-analytics),
select **leselaut.com**, and choose the reporting period. The **Visits** and
**Page views** tabs show traffic, popular public paths, referrals, countries,
browsers and devices. Reports can take a few minutes to appear.

## What the numbers mean

- A visit starts from an external website or a direct page load. Page views
  include public-page navigation within the site. Neither number is a count of
  deduplicated people, signed-in accounts, or currently active users.
- Guests and signed-in visitors can both be measured after opting in. Declines,
  Do Not Track, Global Privacy Control and blockers create coverage gaps.
- Collection begins after this release and consent. There is no historical
  visitor reconstruction. Operator/test visits are included; the dashboard's
  bot filter is not a guarantee that every automated request is excluded.
- This service does not support custom events. It cannot report which person
  learned words, completed a story or maintained a streak. Saved-account counts
  and learner progress are separate data, not visitor counts.

## Installation and privacy

Hosting stays on AWS; DNS and proxy settings are unchanged. Cloudflare's site
setting must remain **Enable with JS Snippet installation**. Automatic injection
would bypass the application's opt-in gate and can create duplicate collection.
The public, ingestion-only beacon ID is in
`deploy/cloudflare/analytics-public.json`; it is not a Cloudflare API credential.
No new package, AWS service, paid plan or paid browser monitoring is activated.

The existing preferences UI gates the official Cloudflare beacon on approved
production hostnames and public paths only. Its new provider-specific consent
key never reuses an AWS opt-in; an existing opt-out remains effective. The
180-day choice does not change Supabase sessions, theme or learning storage.

Cloudflare's SDK has no supported unload API. `analytics-boundary.js` loads in
the document head before application code and prevents private pages from
sharing a document with an active beacon: public/private transitions use normal
document navigation. It covers links, push/replace state, back/forward and the
Navigation API, including the older SDK History API fallback. Public-to-public
navigation remains automatic SPA measurement. Collection fails closed if the
guard did not load. A narrowly derived CSP blocks analytics before private
navigation or opt-out reload, preserving existing application connections.

The site uses `Referrer-Policy: strict-origin` so same-origin account/auth paths
cannot leak through the next public document's referrer. Cloudflare strips page
and referrer query strings/fragments; its performance measurements can include
element selectors and largest-image URLs. No account identifiers, answers,
session replay or custom learner events are configured. Reports can be accessed
for six months and may be sampled. Cloudflare necessarily processes connection
information; this is not a claim that no IP address is processed.

## Verify, stop or roll back

1. On a fresh browser, public pages offer analytics but do not load the beacon
   before **Allow analytics**. Existing AWS declines remain declined. Privacy
   signals take precedence over consent.
2. After allowing, check successful requests to
   `https://cloudflareinsights.com/cdn-cgi/rum`, public SPA page views and the
   dashboard. Account/auth/AI pages must not load a beacon or transmit events.
3. **Privacy → Analytics preferences → Decline analytics** blocks new telemetry
   and reloads, retaining login and learning progress. Cross-tab declines do the
   same in already-open tabs.
4. Production checks still require `/api/telemetry/config` to report AWS RUM
   disabled, alongside database readiness, auth boundaries and audio seeking.
5. To stop site-wide ingestion, select **Disable** in Cloudflare's Manage site.
   To stop newly loaded clients in code, set the public configuration's
   `enabled` to false, pass CI and deploy. Already-open documents can continue
   until refreshed; use the provider setting for an ingestion stop.
6. Reverting this release uses the existing checked AWS release rollback; it
   does not migrate or replace learner data. Keep Cloudflare manual installation
   and AWS RUM disabled. A Cloudflare outage must never block the learning UI.

Official references: [setup](https://developers.cloudflare.com/web-analytics/get-started/),
[visit definition](https://developers.cloudflare.com/web-analytics/data-metrics/high-level-metrics/),
[SPA tracking](https://developers.cloudflare.com/web-analytics/get-started/web-analytics-spa/),
[collection](https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/),
[limitations and retention](https://developers.cloudflare.com/web-analytics/faq/).
