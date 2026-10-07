import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync, lstatSync, readFileSync, readdirSync, rmSync} from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const emittedRoots = ['dist/.openai/drizzle', 'dist/_appgen_meta/drizzle'];

function checkParents(root, relative) {
  let current = root;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    if (!existsSync(current)) continue;
    const stat = lstatSync(current);
    assert.ok(stat.isDirectory() && !stat.isSymbolicLink(), `Unexpected generated migration path: ${relative}`);
  }
}

function fingerprint(directory, prefix = '') {
  if (!existsSync(directory)) return {};
  const files = {};
  for (const name of readdirSync(directory).sort()) {
    const filename = path.join(directory, name);
    const relative = `${prefix}${name}`;
    const stat = lstatSync(filename);
    assert.ok(!stat.isSymbolicLink(), `Migration symlink: ${relative}`);
    if (stat.isDirectory()) Object.assign(files, fingerprint(filename, `${relative}/`));
    else {
      assert.ok(stat.isFile(), `Unexpected migration file: ${relative}`);
      files[relative] = createHash('sha256').update(readFileSync(filename)).digest('hex');
    }
  }
  return files;
}

// Delete only generated migration copies. Committed migrations and runtime DBs
// remain outside these paths, including the learner's local .wrangler state.
export function prepareDeploymentMigrations(root) {
  root = path.resolve(root);
  for (const relative of emittedRoots) {
    checkParents(root, relative);
    rmSync(path.join(root, relative), {recursive: true, force: true});
  }
}

export function verifyDeploymentMigrations(root) {
  root = path.resolve(root);
  const source = fingerprint(path.join(root, 'drizzle'));
  for (const relative of emittedRoots) {
    checkParents(root, relative);
    if (relative.includes('_appgen_meta') && !existsSync(path.join(root, relative))) continue;
    assert.deepEqual(fingerprint(path.join(root, relative)), source,
      `Generated deployment migrations differ from source in ${relative}. Rebuild before packaging.`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const root = process.env.SITES_PROJECT_ROOT || process.cwd();
  if (process.argv.includes('--prepare')) prepareDeploymentMigrations(root);
  else {
    verifyDeploymentMigrations(root);
    console.log('Deployment migrations match committed source.');
  }
}
