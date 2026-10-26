import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { monitoringDashboard, monitoringStack, rumStack } from '../deploy/aws/observability.mjs';

const config = { region: 'ap-south-1', InstanceId: 'test-instance', DistributionId: 'test-distribution', SiteUrl: 'https://d19k6l47v6hw3.cloudfront.net' };
test('monitoring permissions allow ingestion to one monitor and the dedicated log group, with no telemetry read access', () => {
  const stack = monitoringStack(config, 'project-role');
  assert.equal(stack.Resources.AccessLogs.Properties.RetentionInDays, 7);
  const policy = stack.Resources.AgentLogsPolicy.Properties;
  assert.deepEqual(policy.Roles, ['project-role']);
  assert.deepEqual(policy.PolicyDocument.Statement[0].Resource, { 'Fn::GetAtt': ['AccessLogs', 'Arn'] });
  const rum = rumStack(config), statement = rum.Resources.IngestionOnly.Properties.PolicyDocument.Statement[0];
  assert.equal(statement.Action, 'rum:PutRumEvents');
  assert.match(statement.Resource['Fn::Sub'], /appmonitor\/\$\{Monitor\}$/);
  assert.equal(rum.Resources.Monitor.Properties.AppMonitorConfiguration.EnableXRay, false);
  assert.equal(rum.Resources.Pool.Properties.AllowClassicFlow, false);
  const trust = rum.Resources.GuestRole.Properties.AssumeRolePolicyDocument.Statement[0];
  assert.deepEqual(trust.Condition.StringEquals['cognito-identity.amazonaws.com:aud'], { Ref: 'Pool' });
  const dashboard = monitoringDashboard(config, '/test-rum').widgets;
  assert.ok(dashboard.some(w => w.properties.title?.includes('last 5 minutes')));
  assert.ok(dashboard.some(w => w.properties.title?.includes('not unique people')) || dashboard.some(w => w.properties.markdown?.includes('not unique people')));
  assert.ok(dashboard.filter(w => w.type === 'log').every(w => /limit \d+|stats /.test(w.properties.query)));
});

async function modules(run) {
  const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, server: { middlewareMode: true, ws: false, watch: null } });
  try { await run(await vite.ssrLoadModule('/app/lib/rum-privacy.ts'), await vite.ssrLoadModule('/app/lib/rum-options.ts')); }
  finally { await vite.close(); }
}
test('optional RUM stays off without consent, for privacy signals, and on private or malformed routes', async () => modules(async p => {
  const now = Date.now();
  assert.equal(p.readRumConsent({ getItem: () => null }, now), null);
  assert.equal(p.readRumConsent({ getItem: () => '{broken' }, now), null);
  assert.equal(p.readRumConsent({ getItem: () => { throw new Error('storage blocked'); } }, now), null);
  for (const choice of ['allow', 'decline']) {
    assert.equal(p.readRumConsent({ getItem: () => JSON.stringify({ choice, at: now }) }, now), choice);
    assert.equal(p.readRumConsent({ getItem: () => JSON.stringify({ choice, at: now - 181 * 86400_000 }) }, now), null);
  }
  for (const choice of [null, 'decline']) assert.equal(p.shouldMonitor(true, choice, false, '/stories'), false);
  assert.equal(p.shouldMonitor(false, 'allow', false, '/stories'), false);
  assert.equal(p.shouldMonitor(true, 'allow', true, '/stories'), false);
  assert.equal(p.privacyRestricted({ doNotTrack: '1' }), true);
  assert.equal(p.privacyRestricted({ globalPrivacyControl: true }), true);
  for (const path of ['/account', '/auth/confirm', '/auth/reset-password', '/api/progress', '/active-learning', '/stories?token=private', '/stories/#private', '/admin']) assert.equal(p.shouldMonitor(true, 'allow', false, path), false, path);
  for (const path of ['/', '/stories', '/stories/reading-a1-09-v1', '/books/b1/a-book/1', '/grammar/cheat-sheets', '/vocabulary']) assert.equal(p.shouldMonitor(true, 'allow', false, path), true, path);
}));

test('RUM excludes replay, auth traffic, resource URLs and sensitive referrers; opt-out preserves app storage', async () => modules(async (p, options) => {
  const settings = options.rumOptions(config.SiteUrl);
  assert.equal(settings.recordResourceUrl, false); assert.equal(settings.enableXRay, false);
  assert.equal(settings.pageIdFormat, 'PATH'); assert.equal(settings.disableAutoPageView, true);
  assert.equal(settings.sessionEventLimit, 100);
  assert.equal(settings.telemetries.some(t => (Array.isArray(t) ? t[0] : t) === 'replay'), false);
  const http = settings.telemetries.find(t => t[0] === 'http')[1];
  assert.equal(http.recordAllRequests, false);
  assert.equal(http.urlsToInclude.some(r => r.test(config.SiteUrl + '/api/progress')), true);
  for (const url of [config.SiteUrl + '/api/progress?code=private', config.SiteUrl + '/api/account', 'https://npnzojbbwwdtujuurkmx.supabase.co/auth/v1/token', 'https://attacker.example/api/progress']) assert.equal(http.urlsToInclude.some(r => r.test(url)), false, url);
  const details = { pageId: '/stories', referrer: config.SiteUrl + '/auth/confirm?code=private', referrerDomain: 'private', version: '1' };
  options.stripRumReferrer('page_view', details);
  assert.deepEqual(details, { pageId: '/stories', version: '1' });
  const failure = { message: 'Failed https://example.test/api/progress?token=private#fragment', request: { url: config.SiteUrl + '/api/progress?secret=private' } };
  options.stripRumReferrer('error', failure);
  assert.equal(JSON.stringify(failure).includes('private'), false);
  assert.equal(failure.request.url, config.SiteUrl + '/api/progress');
  const values = new Map([['sb-session', 'auth'], ['leselaut:theme', 'dark'], ['leselaut:story-progress:v1', 'history']]);
  const id = '118b2039-e9ef-487d-a2e5-9ecd052d77c7';
  values.set('cwr_c_' + id, 'rum-credential'); values.set('cwr_i_' + id, 'rum-identity');
  const cookies = [];
  p.clearRumStorage({ removeItem: key => values.delete(key) }, name => cookies.push(name), id);
  assert.deepEqual([...values], [['sb-session', 'auth'], ['leselaut:theme', 'dark'], ['leselaut:story-progress:v1', 'history']]);
  assert.deepEqual(cookies, ['cwr_s_' + id, 'cwr_u_' + id]);
}));

test('public telemetry configuration is disabled by default and never exposes server credentials', async () => {
  const original = process.env.LESELAUT_RUM_ENABLED;
  const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, server: { middlewareMode: true, ws: false, watch: null } });
  try {
    const { GET } = await vite.ssrLoadModule('/app/api/telemetry/config/route.ts');
    delete process.env.LESELAUT_RUM_ENABLED;
    const response = await GET(); const value = await response.json();
    assert.equal(value.enabled, false); assert.match(response.headers.get('cache-control'), /no-store/);
    assert.deepEqual(Object.keys(value).sort(), ['appMonitorId', 'enabled', 'identityPoolId', 'region']);
    process.env.LESELAUT_RUM_ENABLED = '1'; assert.equal((await (await GET()).json()).enabled, true);
    process.env.LESELAUT_RUM_ENABLED = '0'; assert.equal((await (await GET()).json()).enabled, false);
  } finally { if (original === undefined) delete process.env.LESELAUT_RUM_ENABLED; else process.env.LESELAUT_RUM_ENABLED = original; await vite.close(); }
});
