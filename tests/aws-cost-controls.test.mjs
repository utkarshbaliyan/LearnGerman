import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {template} from '../deploy/aws/stack.mjs';

test('AWS cleanup preserves completed media, versioning and database backup retention', () => {
  for (const name of ['ArtifactBucket', 'MediaBucket', 'BackupBucket']) {
    const properties = template.Resources[name].Properties;
    assert.equal(properties.VersioningConfiguration.Status, 'Enabled');
    assert.equal(properties.LifecycleConfiguration.Rules.find(r => r.Id === 'AbortIncompleteUploads')
      .AbortIncompleteMultipartUpload.DaysAfterInitiation, 7);
  }
  const media = template.Resources.MediaBucket.Properties.LifecycleConfiguration.Rules;
  assert.ok(media.every(r => !r.ExpirationInDays && !r.ExpirationDate && !r.NoncurrentVersionExpiration));
  const backups = template.Resources.BackupBucket.Properties.LifecycleConfiguration.Rules.find(r => r.Id === 'BackupRetention');
  assert.equal(backups.ExpirationInDays, 30);
  assert.equal(backups.NoncurrentVersionExpiration.NoncurrentDays, 7);
});

test('native storage cleanup preserves existing rules and refuses conflicting cleanup', () => {
  const result = spawnSync('python3', ['-c', `
import copy, importlib.util
spec=importlib.util.spec_from_file_location('cost_controls','deploy/aws/apply-cost-controls.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
original={'Rules':[{'ID':'BackupRetention','Status':'Enabled','Expiration':{'Days':30},'NoncurrentVersionExpiration':{'NoncurrentDays':7}}],'TransitionDefaultMinimumObjectSize':'all_storage_classes_128K'}
before=copy.deepcopy(original)
after=m.storage_cleanup_lifecycle(original)
assert original==before
assert after['Rules'][:-1]==before['Rules']
assert after['TransitionDefaultMinimumObjectSize']==before['TransitionDefaultMinimumObjectSize']
assert m.storage_cleanup_lifecycle(after)==after
conflict=copy.deepcopy(after);conflict['Rules'][-1]['AbortIncompleteMultipartUpload']['DaysAfterInitiation']=1
try:m.storage_cleanup_lifecycle(conflict)
except ValueError:pass
else:raise AssertionError('Conflicting lifecycle rule was overwritten')
assert m.storage_cleanup_lifecycle({})['Rules']==[m.RULE]
`], {encoding:'utf8'});
  assert.equal(result.status, 0, result.stderr);
});
