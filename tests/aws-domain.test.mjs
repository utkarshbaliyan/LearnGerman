import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { template } from '../deploy/aws/stack.mjs';

test('optional custom domains preserve the default CloudFront certificate and require modern TLS when configured', () => {
  assert.equal(template.Parameters.CustomDomainName.Default, '');
  assert.equal(template.Parameters.CustomCertificateArn.Default, '');
  const config = template.Resources.Distribution.Properties.DistributionConfig;
  assert.deepEqual(config.ViewerCertificate['Fn::If'][2], { CloudFrontDefaultCertificate: true });
  assert.equal(config.ViewerCertificate['Fn::If'][1].MinimumProtocolVersion, 'TLSv1.2_2021');
  assert.equal(config.ViewerCertificate['Fn::If'][1].SslSupportMethod, 'sni-only');
  // CloudFormation uses AcmCertificateArn; the CloudFront API uses ACMCertificateArn.
  assert.deepEqual(Object.keys(config.ViewerCertificate['Fn::If'][1]).sort(), ['AcmCertificateArn', 'MinimumProtocolVersion', 'SslSupportMethod']);
  assert.deepEqual(config.Aliases['Fn::If'][2], { Ref: 'AWS::NoValue' });
});

test('domain updater preserves deployed infrastructure and refuses replacement, deletion and unrelated changes', () => {
  const result = spawnSync('python3', ['-c', `
import copy, importlib.util
spec=importlib.util.spec_from_file_location('domain','deploy/aws/configure-domain.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
current={'Parameters':{'OriginToken':{'NoEcho':True}},'Resources':{'Distribution':{'Properties':{'DistributionConfig':{'Origins':[{'Id':'original'}],'ViewerCertificate':{'CloudFrontDefaultCertificate':True}}}},'Instance':{'Type':'AWS::EC2::Instance'},'DataVolume':{'DeletionPolicy':'Retain'}}}
before=copy.deepcopy(current);after=m.domain_template(current)
assert current==before
assert after['Resources']['Instance']==before['Resources']['Instance']
assert after['Resources']['DataVolume']==before['Resources']['DataVolume']
assert after['Resources']['Distribution']['Properties']['DistributionConfig']['Origins']==before['Resources']['Distribution']['Properties']['DistributionConfig']['Origins']
assert after['Parameters']['OriginToken']==before['Parameters']['OriginToken']
assert set(after['Resources']['Distribution']['Properties']['DistributionConfig']['ViewerCertificate']['Fn::If'][1])=={'AcmCertificateArn','MinimumProtocolVersion','SslSupportMethod'}
change={'ResourceChange':{'LogicalResourceId':'Distribution','Action':'Modify','Replacement':'False'}}
assert m.safe_changes([change])
assert not m.safe_changes([])
for key,value in [('LogicalResourceId','Instance'),('Action','Remove'),('Replacement','True'),('Replacement','Conditional')]:
 other=copy.deepcopy(change);other['ResourceChange'][key]=value
 assert not m.safe_changes([other])
 assert not m.safe_changes([change,other])
`], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});
