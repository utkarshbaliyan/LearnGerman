import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { monitoringStack, rumStack } from './observability.mjs';

// Without --apply this only renders reviewable templates. No credentials enter
// a template, generated public configuration, command argument or log message.
const apply = process.argv.includes('--apply');
const config = JSON.parse(readFileSync('deploy/aws/deployment.json', 'utf8'));
const aws = (service, operation, args = []) => execFileSync('aws', [service, operation, ...args, '--region', config.region, '--output', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const json = (...args) => JSON.parse(aws(...args));
const account = json('sts', 'get-caller-identity').Account;
if (account !== config.DeployRoleArn.split(':')[4]) throw new Error('AWS account does not match the existing deployment.');
const resource = id => json('cloudformation', 'describe-stack-resource', ['--stack-name', config.stack, '--logical-resource-id', id]).StackResourceDetail.PhysicalResourceId;
const role = resource('InstanceRole'), topic = resource('AlertsTopic');
const directory = mkdtempSync(join(tmpdir(), 'leselaut-observability-'));
function render(name, template) { const path = join(directory, name + '.json'); writeFileSync(path, JSON.stringify(template)); return path; }
function ensureStack(name, template) {
  const file = render(name, template);
  json('cloudformation', 'validate-template', ['--template-body', 'file://' + file]);
  if (!apply) return;
  let exists = true;
  try { json('cloudformation', 'describe-stacks', ['--stack-name', name]); }
  catch (error) { if (!String(error.stderr).includes('does not exist')) throw new Error('Could not inspect the existing monitoring stack.'); exists = false; }
  try {
    json('cloudformation', exists ? 'update-stack' : 'create-stack', ['--stack-name', name, '--template-body', 'file://' + file, '--capabilities', 'CAPABILITY_IAM']);
  } catch (error) { if (String(error.stderr).includes('No updates are to be performed')) return; throw new Error('Monitoring stack update failed; inspect its CloudFormation events.'); }
  aws('cloudformation', 'wait', [exists ? 'stack-update-complete' : 'stack-create-complete', '--stack-name', name]);
}
ensureStack('leselaut-rum', rumStack(config));
let publicConfig = JSON.parse(readFileSync('deploy/aws/observability-public.json', 'utf8'));
if (apply) {
  const outputs = Object.fromEntries(json('cloudformation', 'describe-stacks', ['--stack-name', 'leselaut-rum']).Stacks[0].Outputs.map(item => [item.OutputKey, item.OutputValue]));
  const monitor = json('rum', 'get-app-monitor', ['--name', outputs.AppMonitorName]).AppMonitor;
  publicConfig = { region: config.region, appMonitorId: outputs.AppMonitorId, appMonitorName: outputs.AppMonitorName, identityPoolId: outputs.IdentityPoolId, rumLogGroup: monitor.DataStorage.CwLog.CwLogGroup };
  writeFileSync('deploy/aws/observability-public.json', JSON.stringify(publicConfig, null, 2) + '\n');
  aws('logs', 'put-retention-policy', ['--log-group-name', publicConfig.rumLogGroup, '--retention-in-days', '7']);
}
ensureStack('leselaut-observability', monitoringStack(config, role, publicConfig.rumLogGroup, topic));
if (apply) {
  const parameters = render('collector-parameters', { commands: [readFileSync('deploy/aws/observability-server.sh', 'utf8')] });
  const command = json('ssm', 'send-command', ['--document-name', 'AWS-RunShellScript', '--instance-ids', config.InstanceId, '--parameters', 'file://' + parameters]).Command.CommandId;
  aws('ssm', 'wait', ['command-executed', '--command-id', command, '--instance-id', config.InstanceId]);
  const status = json('ssm', 'get-command-invocation', ['--command-id', command, '--instance-id', config.InstanceId]);
  if (status.Status !== 'Success') throw new Error('Monitoring collector setup failed; inspect the SSM command.');
}
console.log(apply ? 'AWS observability configured. Public SDK IDs saved; enable the RUM runtime flag only with the consent-gated client.' : `Validated monitoring templates in ${directory}; no changes applied.`);
