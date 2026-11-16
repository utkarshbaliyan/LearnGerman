import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { createServer } from 'vite';

const headers = JSON.parse(readFileSync('deploy/security-headers.json', 'utf8'));
const boundaryCode = readFileSync('public/analytics-boundary.js', 'utf8');
const pattern = /^(?:\/|\/(?:stories|books|grammar|vocabulary)(?:\/[a-zA-Z0-9_-]+)*|\/(?:privacy|support))$/;
const stopPolicy = headers['Content-Security-Policy'].split(';').find(s => s.trim().startsWith('connect-src ')).replace(' https://cloudflareinsights.com/cdn-cgi/rum', '').trim();
function events() {
  const listeners = new Map();
  return {
    addEventListener(type, fn, options) {
      const list = listeners.get(type) ?? [];
      list.push({ fn, capture: options === true || options?.capture === true }); listeners.set(type, list);
    },
    dispatchEvent(event) {
      event.preventDefault ??= () => { event.defaultPrevented = true; };
      event.stopImmediatePropagation ??= () => { event.stopped = true; };
      for (const { fn } of [...(listeners.get(event.type) ?? [])].sort((a, b) => Number(b.capture) - Number(a.capture))) {
        fn(event); if (event.stopped) break;
      }
    },
  };
}
function browser(path = '/', hostname = 'leselaut.com') {
  const actions = [], nodes = [], script = { dataset: { analyticsHosts: 'leselaut.com,www.leselaut.com', analyticsPublicPattern: pattern.source, analyticsStopPolicy: stopPolicy } };
  const location = { href: `https://${hostname}${path}`, hostname, origin: `https://${hostname}`, pathname: path,
    assign: href => actions.push(['assign', href]), replace: href => actions.push(['replace', href]), reload: () => actions.push(['reload']) };
  const history = { pushState(...args) { actions.push(['pushState', ...args]); location.pathname = new URL(args[2], location.href).pathname; }, replaceState(...args) { actions.push(['replaceState', ...args]); } };
  const document = { ...events(), currentScript: script, createElement: type => ({ type }), head: { appendChild(node) { nodes.push(node); actions.push(['policy', node.content]); } } };
  const window = { ...events(), navigation: events() };
  runInNewContext(boundaryCode, { document, window, location, history, URL, WeakSet, RegExp,
    localStorage: { setItem() { throw Error('Boundary must not touch learner storage'); }, clear() { throw Error('No storage clearing'); } } });
  return { actions, nodes, script, location, history, document, window };
}

test('public navigation preserves history state; private links use a document boundary before the router', () => {
  const b = browser(), state = { retained: 'learner-state' };
  b.history.pushState(state, '', '/stories?filter=a1');
  assert.equal(b.actions[0][0], 'pushState'); assert.equal(b.actions[0][1], state);
  const link = { href: 'https://leselaut.com/account', target: '', hasAttribute: () => false };
  let routerRan = false;
  b.document.addEventListener('click', () => { routerRan = true; });
  b.document.dispatchEvent({ type: 'click', button: 0, target: { closest: () => link } });
  assert.equal(routerRan, false);
  assert.deepEqual(b.actions.at(-1), ['assign', link.href]);
  assert.equal(b.actions.at(-2)[0], 'policy');
  assert.equal(b.script.dataset.analyticsNavigating, '1');
  assert.equal(b.nodes[0].httpEquiv, 'Content-Security-Policy');
  assert.ok(stopPolicy.includes('https://npnzojbbwwdtujuurkmx.supabase.co'));
  assert.ok(!stopPolicy.includes('cloudflareinsights.com'));
});

test('the old-browser SDK history fallback cannot serialize a private destination first', () => {
  for (const method of ['pushState', 'replaceState']) {
    const b = browser(), sdkPaths = [], original = b.history[method];
    b.history[method] = function (...args) { sdkPaths.push(args[2]); return original.apply(this, args); };
    b.document.dispatchEvent({ type: 'leselaut:analytics-loaded' });
    b.document.dispatchEvent({ type: 'leselaut:analytics-loaded' });
    b.history[method]({}, '', '/auth/confirm?code=private-code#private-fragment');
    assert.deepEqual(sdkPaths, []);
    assert.equal(b.actions.at(-1)[0], method === 'replaceState' ? 'replace' : 'assign');
    assert.equal(b.nodes.length, 1);
  }
});

test('Navigation API and back/forward block collection before SDK listeners see private paths', () => {
  const b = browser(); let sdkRan = false;
  b.window.navigation.addEventListener('navigate', () => { sdkRan = true; });
  const event = { type: 'navigate', cancelable: true, destination: { url: 'https://leselaut.com/active-learning', sameDocument: true } };
  b.window.navigation.dispatchEvent(event);
  assert.equal(event.defaultPrevented, true); assert.equal(sdkRan, false);
  assert.equal(b.actions[0][0], 'policy'); assert.equal(b.actions[1][0], 'replace');
  const back = browser();
  back.window.addEventListener('popstate', () => { throw Error('SDK must not see private history'); });
  back.location.pathname = '/account';
  back.window.dispatchEvent({ type: 'popstate' });
  assert.deepEqual(back.actions.map(a => a[0]), ['policy', 'reload']);
});

test('returning from private pages starts a clean document; opt-out blocks before reload; other hosts are unaffected', () => {
  const b = browser('/account');
  b.history.replaceState({}, '', '/stories');
  assert.deepEqual(b.actions.map(a => a[0]), ['policy', 'replace']);
  const stop = browser(); stop.document.dispatchEvent({ type: 'leselaut:analytics-stop' });
  assert.deepEqual(stop.actions.map(a => a[0]), ['policy', 'reload']);
  const readonly = browser(); readonly.document.dispatchEvent({ type: 'leselaut:analytics-stop', detail: { reload: false } });
  assert.deepEqual(readonly.actions.map(a => a[0]), ['policy']);
  const staging = browser('/', 'staging.example');
  staging.history.pushState({}, '', '/account');
  assert.equal(staging.actions[0][0], 'pushState');
  assert.equal(staging.script.dataset.analyticsReady, undefined);
});

test('Cloudflare requires fresh provider consent, preserves old declines, and loads one guarded official script', async () => {
  const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, server: { middlewareMode: true, ws: false, watch: null } });
  try {
    const cf = await vite.ssrLoadModule('/app/lib/cloudflare-analytics.ts');
    const p = await vite.ssrLoadModule('/app/lib/rum-privacy.ts');
    const now = Date.now(), values = new Map(), storage = { getItem: key => values.get(key) ?? null };
    const full = { setItem() { throw Error('Quota exceeded'); }, removeItem: key => values.delete(key) };
    values.set(cf.CLOUDFLARE_CONSENT_KEY, JSON.stringify({ choice: 'allow', at: now }));
    assert.equal(p.saveAnalyticsConsent(full, cf.CLOUDFLARE_CONSENT_KEY, 'decline'), true);
    assert.equal(cf.readCloudflareConsent(storage, now), null);
    assert.equal(p.saveAnalyticsConsent({ setItem() { throw Error(); }, removeItem() { throw Error(); } }, cf.CLOUDFLARE_CONSENT_KEY, 'decline'), false);
    values.set(p.RUM_CONSENT_KEY, JSON.stringify({ choice: 'allow', at: now }));
    assert.equal(cf.readCloudflareConsent(storage, now), null);
    values.set(p.RUM_CONSENT_KEY, JSON.stringify({ choice: 'decline', at: now }));
    assert.equal(cf.readCloudflareConsent(storage, now), 'decline');
    values.set(cf.CLOUDFLARE_CONSENT_KEY, JSON.stringify({ choice: 'allow', at: now }));
    assert.equal(cf.readCloudflareConsent(storage, now), 'allow');
    assert.equal(cf.readCloudflareConsent(storage, now + 181 * 86400_000), null);
    assert.equal(cf.cloudflareAvailable('leselaut.com'), true);
    for (const host of ['localhost', 'staging.leselaut.com', 'leselaut.com.evil.example']) assert.equal(cf.cloudflareAvailable(host), false);
    const elements = new Map(), dispatched = [];
    const doc = { getElementById: id => elements.get(id), dispatchEvent: event => dispatched.push(event.type),
      createElement: () => ({ dataset: {}, remove() { elements.delete(this.id); } }),
      head: { appendChild(node) { elements.set(node.id, node); } } };
    cf.loadCloudflare(doc); assert.equal(elements.size, 0);
    const guard = { dataset: { analyticsReady: '1', analyticsNavigating: '1' } };
    elements.set('leselaut-analytics-boundary', guard);
    cf.loadCloudflare(doc); assert.equal(elements.size, 1);
    delete guard.dataset.analyticsNavigating;
    doc.referrer = 'https://leselaut.com/auth/confirm?code=private-code'; doc.location = { origin: 'https://leselaut.com' };
    cf.loadCloudflare(doc); assert.equal(elements.size, 1);
    doc.referrer = '';
    cf.loadCloudflare(doc); cf.loadCloudflare(doc);
    assert.equal(elements.size, 2);
    const beacon = elements.get(cf.CLOUDFLARE_SCRIPT_ID);
    assert.equal(beacon.src, 'https://static.cloudflareinsights.com/beacon.min.js');
    assert.equal(beacon.referrerPolicy, 'strict-origin');
    assert.equal(JSON.parse(beacon.dataset.cfBeacon).spa, true);
    beacon.onload(); cf.stopCloudflare(doc);
    assert.deepEqual(dispatched, ['leselaut:analytics-loaded', 'leselaut:analytics-stop']);
    beacon.onerror(); assert.equal(elements.size, 1);
    cf.loadCloudflare(doc); assert.equal(elements.size, 2);
    assert.equal(headers['Referrer-Policy'], 'strict-origin');
  } finally { await vite.close(); }
});
