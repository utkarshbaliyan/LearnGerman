import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('AWS standalone server registers audio content types so Safari plays book and story audio', () => {
  const file = join(mkdtempSync(join(tmpdir(), 'leselaut-server-')), 'server.js');
  writeFileSync(file, '#!/usr/bin/env node\nimport { join } from "node:path";\nimport { startProdServer } from "vinext/server/prod-server";\nstartProdServer({});\n');
  execFileSync(process.execPath, ['scripts/patch-aws-server.mjs', file]);
  execFileSync(process.execPath, ['scripts/patch-aws-server.mjs', file]);
  const patched = readFileSync(file, 'utf8');
  assert.equal(patched.match(/leselaut: media content types/g)?.length, 1);
  assert.match(patched, /"\.webm": "audio\/webm"/);
  assert.match(patched, /"\.m4a": "audio\/mp4"/);
  assert.match(patched, /"\.pdf": "application\/pdf"/);
  assert.ok(patched.indexOf('Object.assign(CONTENT_TYPES') < patched.indexOf('startProdServer({'));
  const vinextTable = readFileSync('node_modules/vinext/dist/server/static-file-cache.js', 'utf8');
  assert.match(vinextTable, /const CONTENT_TYPES = \{/);
  assert.match(vinextTable, /export \{[^}]*CONTENT_TYPES/);
  assert.match(readFileSync('scripts/build-aws.sh', 'utf8'), /node scripts\/patch-aws-server\.mjs dist\/standalone\/server\.js/);
});
