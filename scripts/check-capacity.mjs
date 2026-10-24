// Bounded launch check against explicitly disposable, independently authenticated
// fixtures. No AI, exports, existing learner records or raw credentials in output.
import { readFile, writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { setTimeout as delay } from 'node:timers/promises';

const [fixturePath, reportPath] = process.argv.slice(2);
if (!fixturePath || !reportPath) throw new Error('Usage: node scripts/check-capacity.mjs PRIVATE_FIXTURE_JSON REPORT_JSON');
const state = JSON.parse(await readFile(fixturePath, 'utf8'));
const origin = new URL(state.origin);
if (state.purpose !== 'leselaut-disposable-capacity-check' || state.users?.length !== 10 ||
    !/^[a-z0-9-]{8,64}$/.test(state.runId) || origin.origin !== state.origin ||
    !['https://d19k6l47v6hw3.cloudfront.net', 'http://127.0.0.1:3000'].includes(origin.origin)) throw new Error('Invalid disposable test fixture.');
for (const user of state.users) {
  const claims = JSON.parse(Buffer.from(user.accessToken.split('.')[1], 'base64url'));
  if (claims.sub !== user.id || claims.email !== user.email || user.email !== `${state.runId}-${state.users.indexOf(user)}@example.invalid`) throw new Error('Fixture identity mismatch.');
}
const report = { kind: 'bounded authenticated production HTTP check; no browser rendering or AI calls',
  origin: state.origin, startedAt: new Date().toISOString(), fixtureAccounts: 10, stages: [], passed: false };
const expected = new Map(state.users.map(user => [user.id, new Set()]));
const latencies = [];
const stopped = new AbortController();
let requests = 0, conflicts = 0, failures = 0;
async function request(path, user, init = {}) {
  const started = performance.now();
  const response = await fetch(new URL(path, origin), { ...init, redirect: 'error',
    headers: { ...(user ? { authorization: `Bearer ${user.accessToken}` } : {}), ...init.headers }, signal: AbortSignal.any([AbortSignal.timeout(10_000), stopped.signal]) });
  const body = await response.text();
  requests++; latencies.push(performance.now() - started);
  if (!/private, no-store/.test(response.headers.get('cache-control') ?? '') && path.startsWith('/api/') && path !== '/api/health') throw new Error('Authenticated response caching is unsafe.');
  if (response.status === 409) { conflicts++; return { response, data: null }; }
  if (!response.ok) { failures++; throw new Error(`Request returned ${response.status}.`); }
  return { response, data: path.startsWith('/api/') ? JSON.parse(body) : null };
}
function ownProgress(data, user) {
  if (data.userId !== user.id) throw new Error('Progress ownership mismatch.');
  const stories = data.progress?.stories ?? {};
  const ids = Array.isArray(stories) ? stories : Object.keys(stories.entries ?? {});
  if (ids.some(id => !id.startsWith(`${state.runId}:${state.users.indexOf(user)}:`))) throw new Error('Unexpected progress in disposable fixture.');
  return ids;
}
try {
  for (const user of state.users) {
    const { data } = await request('/api/account', user);
    if (data.account?.email !== user.email || typeof data.account?.username !== 'string') throw new Error('Account ownership mismatch.');
  }
  for (const concurrency of [1, 5, 10]) {
    const start = performance.now(), before = latencies.length;
    const workers = await Promise.allSettled(state.users.slice(0, concurrency).map(async (user, index) => {
      try {
      for (let step = 0; step < 12; step++) {
        if (step % 4 === 0) {
          const marker = `${state.runId}:${index}:${concurrency}-${step}`;
          expected.get(user.id).add(marker);
          for (let retry = 0; ; retry++) {
            const { response, data } = await request('/api/progress', user, { method: 'PUT',
              headers: { 'content-type': 'application/json', 'x-progress-owner': user.id }, body: JSON.stringify({ scope: 'stories', data: [marker] }) });
            if (response.status !== 409) { if (data.userId !== user.id) throw new Error('Save ownership mismatch.'); break; }
            if (retry >= 3) throw new Error('Progress conflicts did not recover.');
            await delay(100 * (retry + 1));
          }
        } else if (step % 4 === 1) ownProgress((await request('/api/progress', user)).data, user);
        else if (step % 4 === 2) await request('/stories/reading-a1-09-v1');
        else await request('/api/account', user);
        await delay(400);
      }
      } catch (error) { stopped.abort(); throw error; }
    }));
    const failed = workers.find(result => result.status === 'rejected');
    if (failed) throw failed.reason;
    const samples = latencies.slice(before).sort((a, b) => a - b);
    const stage = { concurrency, requests: samples.length, durationMs: Math.round(performance.now() - start),
      p50Ms: Math.round(samples[Math.floor(samples.length * .5)]), p95Ms: Math.round(samples[Math.floor(samples.length * .95)]), maxMs: Math.round(samples.at(-1)) };
    report.stages.push(stage); console.log(JSON.stringify(stage));
    if (stage.p95Ms > 3000 || failures) throw new Error('Stop threshold reached; do not increase concurrency.');
    if ((await request('/api/health')).data.status !== 'ok') throw new Error('Readiness failed.');
  }
  for (const user of state.users) {
    const ids = ownProgress((await request('/api/progress', user)).data, user);
    if ([...expected.get(user.id)].some(id => !ids.includes(id))) throw new Error('A successful save was lost.');
  }
  report.passed = true;
} catch (error) {
  // Do not print response bodies, tokens, emails or fixture IDs.
  report.error = error instanceof Error && /^(Request returned \d+\.|Stop threshold|Readiness failed|Account ownership|Progress ownership|Save ownership|Unexpected progress|A successful save|Progress conflicts|Authenticated response)/.test(error.message) ? error.message : 'Request failed or timed out.';
} finally {
  Object.assign(report, { finishedAt: new Date().toISOString(), requests, conflictsRetried: conflicts, httpFailures: failures });
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ passed: report.passed, requests, conflictsRetried: conflicts, httpFailures: failures }));
  if (!report.passed) process.exitCode = 1;
}
