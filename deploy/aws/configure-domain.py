"""Plan/apply custom HTTPS aliases without replacing or restarting AWS resources.

Uses the deployed CloudFormation template, not unrelated local infrastructure
changes. Existing parameter values (including the origin secret) are reused.
"""
import argparse
import copy
import json
from pathlib import Path
import re
import subprocess
import tempfile
import time


def domain_template(current):
    result = copy.deepcopy(current)
    result.setdefault('Parameters', {}).update({
        'CustomDomainName': {'Type': 'String', 'Default': ''},
        'CustomCertificateArn': {'Type': 'String', 'Default': ''},
    })
    ref = lambda name: {'Ref': name}
    result.setdefault('Conditions', {})['HasCustomDomain'] = {'Fn::And': [
        {'Fn::Not': [{'Fn::Equals': [ref('CustomDomainName'), '']}]},
        {'Fn::Not': [{'Fn::Equals': [ref('CustomCertificateArn'), '']}]},
    ]}
    distribution = result['Resources']['Distribution']['Properties']['DistributionConfig']
    distribution['Aliases'] = {'Fn::If': ['HasCustomDomain', [ref('CustomDomainName'), {'Fn::Sub': 'www.${CustomDomainName}'}], ref('AWS::NoValue')]}
    distribution['ViewerCertificate'] = {'Fn::If': ['HasCustomDomain', {
        'ACMCertificateArn': ref('CustomCertificateArn'), 'SslSupportMethod': 'sni-only',
        'MinimumProtocolVersion': 'TLSv1.2_2021',
    }, {'CloudFrontDefaultCertificate': True}]}
    return result


def safe_changes(changes):
    return bool(changes) and all(change.get('ResourceChange', {}).get('LogicalResourceId') == 'Distribution'
        and change['ResourceChange'].get('Action') == 'Modify'
        and change['ResourceChange'].get('Replacement') == 'False' for change in changes)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--domain', required=True)
    parser.add_argument('--certificate', required=True)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    if not re.fullmatch(r'[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?', args.domain) or '.' not in args.domain:
        raise SystemExit('Supply an apex domain name, without a URL or path.')
    config = json.loads(Path('deploy/aws/deployment.json').read_text())
    def aws(service, operation, *extra, region=None):
        return json.loads(subprocess.check_output(['aws', service, operation, *extra,
            '--region', region or config['region'], '--output', 'json'], stderr=subprocess.PIPE, text=True) or '{}')
    account = aws('sts', 'get-caller-identity')['Account']
    if account != config['DeployRoleArn'].split(':')[4]:
        raise SystemExit('AWS account does not match the project deployment.')
    cert = aws('acm', 'describe-certificate', '--certificate-arn', args.certificate, region='us-east-1')['Certificate']
    if cert['Status'] != 'ISSUED' or not {args.domain, 'www.' + args.domain}.issubset(cert['SubjectAlternativeNames']):
        raise SystemExit('Certificate must be issued and cover both the apex and www before planning aliases.')
    stack = aws('cloudformation', 'describe-stacks', '--stack-name', config['stack'])['Stacks'][0]
    current = aws('cloudformation', 'get-template', '--stack-name', config['stack'])['TemplateBody']
    if isinstance(current, str):
        current = json.loads(current)
    parameters = [{'ParameterKey': p['ParameterKey'], 'UsePreviousValue': True} for p in stack['Parameters']
                  if p['ParameterKey'] not in {'CustomDomainName', 'CustomCertificateArn'}]
    parameters += [{'ParameterKey': 'CustomDomainName', 'ParameterValue': args.domain},
                   {'ParameterKey': 'CustomCertificateArn', 'ParameterValue': args.certificate}]
    name = 'custom-domain-' + str(int(time.time()))
    with tempfile.TemporaryDirectory(prefix='leselaut-domain-') as directory:
        path = Path(directory) / 'template.json'
        path.write_text(json.dumps(domain_template(current))); path.chmod(0o600)
        result = aws('cloudformation', 'create-change-set', '--stack-name', config['stack'],
            '--change-set-name', name, '--change-set-type', 'UPDATE', '--template-body', 'file://' + str(path),
            '--parameters', json.dumps(parameters), '--capabilities', 'CAPABILITY_IAM')
    arn = result['Id']
    for _ in range(60):
        plan = aws('cloudformation', 'describe-change-set', '--change-set-name', arn)
        if plan['Status'] in {'CREATE_COMPLETE', 'FAILED'}:
            break
        time.sleep(2)
    if plan['Status'] != 'CREATE_COMPLETE' or not safe_changes(plan.get('Changes', [])):
        raise SystemExit('Change set is not limited to an in-place distribution update; inspect it before proceeding.')
    print(json.dumps({'changeSet': arn, 'aliases': [args.domain, 'www.' + args.domain],
                      'changes': 'Distribution only; no replacements or instance restart.'}))
    if args.apply:
        aws('cloudformation', 'execute-change-set', '--change-set-name', arn)
        print('Domain alias rollout started; wait for UPDATE_COMPLETE and verify DNS/TLS and app authentication.')


if __name__ == '__main__':
    try:
        main()
    except subprocess.CalledProcessError:
        raise SystemExit('AWS operation failed; sensitive service diagnostics withheld.')
