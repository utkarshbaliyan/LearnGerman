import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, realpathSync, symlinkSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';

for (const failure of ['backup', 'migration', 'readiness']) {
  test(`AWS release restarts previous code after ${failure} failure without restoring learner data`, () => {
    const root = mkdtempSync(join(tmpdir(), 'leselaut-release-'));
    try {
      const app = join(root, 'app');
      const old = join(app, 'releases', 'a'.repeat(40));
      const bin = join(root, 'bin');
      const data = join(root, 'data');
      const config = join(root, 'config');
      const archiveSource = join(root, 'archive-source');
      for (const path of [old, bin, data, config, archiveSource]) mkdirSync(path, {recursive:true});
      symlinkSync(old, join(app, 'current'));
      writeFileSync(join(config, 'ready'), '');
      writeFileSync(join(config, 'config'), 'ARTIFACT_BUCKET=test\nAWS_REGION=test\n');
      writeFileSync(join(data, 'leselaut.sqlite'), 'latest learner data');
      writeFileSync(join(archiveSource, 'server.js'), '// fixture');
      writeFileSync(join(archiveSource, 'migrate.mjs'), 'process.exit(Number(process.env.MIGRATION_EXIT ?? 0));');
      const archive = join(root, 'release.tgz');
      execFileSync('tar', ['-czf', archive, '-C', archiveSource, '.']);
      const executable = (name, source) => writeFileSync(join(bin, name), `#!/bin/bash\n${source}\n`, {mode:0o755});
      executable('aws', 'if [[ "$1 $2" == "s3 cp" ]]; then cp "$RELEASE_ARCHIVE" "$4"; else echo "LESELAUT_READ_ONLY=0"; fi');
      executable('systemctl', 'echo "$*" >> "$SERVICE_LOG"');
      executable('flock', 'exit 0');
      executable('chown', 'exit 0');
      executable('backup', 'exit "${BACKUP_EXIT:-0}"');
      executable('curl', 'exit 1');
      executable('seq', 'echo 1');
      executable('sleep', 'exit 0');
      // Resolve the old release portably on both macOS and Linux.
      executable('readlink', '"$TEST_NODE" -e \'console.log(require("node:fs").realpathSync(process.argv[1]))\' "$2"');
      const script = readFileSync(new URL('../deploy/aws/release.sh', import.meta.url), 'utf8')
        .replaceAll('/etc/leselaut', config)
        .replaceAll('/opt/leselaut', app)
        .replaceAll('/var/lib/leselaut', data)
        .replaceAll('/var/lock/leselaut-deploy.lock', join(root, 'lock'))
        .replaceAll('/tmp/leselaut-release.tgz', join(root, 'download.tgz'))
        .replaceAll('/usr/local/bin/leselaut-backup', join(bin, 'backup'))
        .replaceAll('/usr/local/bin/node', process.execPath);
      const scriptPath = join(root, 'release.sh');
      writeFileSync(scriptPath, script);
      const result = spawnSync('bash', [scriptPath, 'b'.repeat(40)], {
        encoding:'utf8',
        env:{...process.env, PATH:`${bin}:${process.env.PATH}`, RELEASE_ARCHIVE:archive,
          SERVICE_LOG:join(root, 'service.log'), TEST_NODE:process.execPath,
          BACKUP_EXIT:failure === 'backup' ? '42' : '0', MIGRATION_EXIT:failure === 'migration' ? '43' : '0'},
      });
      assert.equal(result.status, failure === 'backup' ? 42 : failure === 'migration' ? 43 : 1, result.stderr);
      assert.equal(realpathSync(join(app, 'current')), realpathSync(old));
      assert.equal(readFileSync(join(data, 'leselaut.sqlite'), 'utf8'), 'latest learner data');
      const serviceCalls = readFileSync(join(root, 'service.log'), 'utf8');
      assert.ok(serviceCalls.startsWith('stop leselaut\n'));
      assert.ok(serviceCalls.endsWith('stop leselaut\nstart leselaut\n'), serviceCalls);
    } finally {
      rmSync(root, {recursive:true, force:true});
    }
  });
}
