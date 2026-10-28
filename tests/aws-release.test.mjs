import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, realpathSync, symlinkSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';

for (const failure of ['backup', 'migration', 'readiness', 'public', 'none']) {
  test(failure === 'none' ? 'AWS release succeeds without restoring learner data' : `AWS release restarts previous code after ${failure} failure without restoring learner data`, () => {
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
      writeFileSync(join(archiveSource, 'verify-public.mjs'), 'process.exit(Number(process.env.PUBLIC_EXIT ?? 0));');
      const archive = join(root, 'release.tgz');
      execFileSync('tar', ['-czf', archive, '-C', archiveSource, '.']);
      const executable = (name, source) => writeFileSync(join(bin, name), `#!/bin/bash\n${source}\n`, {mode:0o755});
      executable('aws', 'if [[ "$1 $2" == "s3 cp" ]]; then cp "$RELEASE_ARCHIVE" "$4"; else echo "LESELAUT_READ_ONLY=0"; fi');
      executable('systemctl', 'echo "$*" >> "$SERVICE_LOG"');
      executable('flock', 'exit 0');
      executable('chown', 'exit 0');
      executable('backup', 'exit "${BACKUP_EXIT:-0}"');
      executable('curl', 'if [[ "${READINESS_EXIT:-0}" == 1 ]]; then exit 1; fi; echo \'{"status":"ok","release":"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"}\'');
      executable('find', 'exit 0');
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
          BACKUP_EXIT:failure === 'backup' ? '42' : '0', MIGRATION_EXIT:failure === 'migration' ? '43' : '0',
          PUBLIC_EXIT:failure === 'public' ? '44' : '0', READINESS_EXIT:failure === 'readiness' ? '1' : '0'},
      });
      assert.equal(result.status, {backup:42,migration:43,readiness:1,public:44,none:0}[failure], result.stderr);
      assert.equal(realpathSync(join(app, 'current')), realpathSync(failure === 'none' ? join(app,'releases','b'.repeat(40)) : old));
      assert.equal(readFileSync(join(data, 'leselaut.sqlite'), 'utf8'), 'latest learner data');
      const serviceCalls = readFileSync(join(root, 'service.log'), 'utf8');
      assert.ok(serviceCalls.startsWith('stop leselaut\n'));
      assert.ok(serviceCalls.endsWith(failure === 'none' ? 'start leselaut\n' : 'stop leselaut\nstart leselaut\n'), serviceCalls);
      if(failure === 'none') {
        const rerun=spawnSync('bash',[scriptPath,'b'.repeat(40)],{encoding:'utf8',env:{...process.env,PATH:`${bin}:${process.env.PATH}`,TEST_NODE:process.execPath}});
        assert.equal(rerun.status,0,rerun.stderr);
        assert.equal(readFileSync(join(root,'service.log'),'utf8'),serviceCalls,'Rerun must not restart or extract over active code');
      }
      if(failure === 'public')assert.match(result.stderr,/previous code restored and database readiness passed/);
      if(failure === 'readiness')assert.match(result.stderr,/rollback readiness NOT confirmed/);
    } finally {
      rmSync(root, {recursive:true, force:true});
    }
  });
}
