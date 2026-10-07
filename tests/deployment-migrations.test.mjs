import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {prepareDeploymentMigrations, verifyDeploymentMigrations} from '../scripts/verify-deployment-migrations.mjs';

function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'leselaut-migrations-'));
  t.after(() => rmSync(root, {recursive: true, force: true}));
  for (const directory of ['drizzle', 'dist/.openai/drizzle']) {
    mkdirSync(path.join(root, directory), {recursive: true});
    writeFileSync(path.join(root, directory, '0000.sql'), 'CREATE TABLE user_progress (id TEXT);');
  }
  return root;
}

test('deployment accepts byte-identical original migrations', t => {
  assert.doesNotThrow(() => verifyDeploymentMigrations(fixture(t)));
});

test('deployment rejects a duplicated migration filename before it can run', t => {
  const root = fixture(t);
  writeFileSync(path.join(root, 'dist/.openai/drizzle/0000 2.sql'), 'CREATE TABLE user_progress (id TEXT);');
  assert.throws(() => verifyDeploymentMigrations(root), /differ from source/);
});

test('deployment rejects altered SQL under an original migration name', t => {
  const root = fixture(t);
  writeFileSync(path.join(root, 'dist/.openai/drizzle/0000.sql'), 'DROP TABLE user_progress;');
  assert.throws(() => verifyDeploymentMigrations(root), /differ from source/);
});

test('build preparation preserves source migrations and learner runtime files', t => {
  const root = fixture(t);
  const state = path.join(root, '.wrangler/state/learner.sqlite');
  mkdirSync(path.dirname(state), {recursive: true});
  writeFileSync(state, 'saved learner records');
  prepareDeploymentMigrations(root);
  assert.equal(readFileSync(state, 'utf8'), 'saved learner records');
  assert.equal(readFileSync(path.join(root, 'drizzle/0000.sql'), 'utf8'), 'CREATE TABLE user_progress (id TEXT);');
  assert.throws(() => verifyDeploymentMigrations(root), /differ from source/);
});
