import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync,existsSync,readFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {template} from './stack.mjs';
import {fileURLToPath} from 'node:url';
process.on('uncaughtException', error => {
  const diagnostic=String(error.stderr??'').match(/An error occurred \((\w+)\) when calling the (\w+) operation/);
  const scrubbed=String(error.stderr??'').replace(/[A-Za-z0-9+/_=-]{28,}/g,'[redacted]').slice(0,700);
  console.error(error.stderr ? `AWS provisioning failed: ${diagnostic?.slice(1).join(' / ')??'service error'}; ${scrubbed}` : error.message);
  process.exitCode=1;
});

const region='ap-south-1', stack='leselaut';
const state='.local-piper/aws-release'; mkdirSync(state,{recursive:true,mode:0o700});
function aws(args, body) {
  const executable=body ? process.execPath : 'aws';
  const command=body ? [fileURLToPath(new URL('./sdk-request.mjs',import.meta.url)),args[0],args[1],region] : [...args,'--region',region,'--output','json','--no-cli-pager'];
  return JSON.parse(execFileSync(executable,command,
    {encoding:'utf8',input:body ? JSON.stringify(body) : undefined,stdio:['pipe','pipe','pipe']}) || '{}');
}
const describe=()=>aws(['cloudformation','describe-stacks','--stack-name',stack]).Stacks[0];
let existing;
try {existing=describe();} catch(error) {
  if(!error.stderr?.includes('does not exist')) throw new Error('Cannot inspect deployment stack; details withheld.');
}
if(!existing){
  const vpc=aws(['ec2','describe-vpcs','--filters','Name=is-default,Values=true']).Vpcs[0];
  if(!vpc)throw new Error('No default VPC; refusing to create a paid NAT setup.');
  const subnet=aws(['ec2','describe-subnets','--filters',`Name=vpc-id,Values=${vpc.VpcId}`]).Subnets.find(s=>s.MapPublicIpOnLaunch);
  if(!subnet)throw new Error('No existing public subnet.');
  const image=aws(['ssm','get-parameter','--name','/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-arm64']).Parameter.Value;
  const prefix=aws(['ec2','describe-managed-prefix-lists','--filters','Name=prefix-list-name,Values=com.amazonaws.global.cloudfront.origin-facing']).PrefixLists[0].PrefixListId;
  const policies=aws(['cloudfront','list-cache-policies','--type','managed']).CachePolicyList.Items;
  const policy=name=>policies.find(x=>x.CachePolicy.CachePolicyConfig.Name===name)?.CachePolicy.Id;
  const origin=aws(['cloudfront','list-origin-request-policies','--type','managed']).OriginRequestPolicyList.Items.find(x=>x.OriginRequestPolicy.OriginRequestPolicyConfig.Name==='Managed-AllViewer')?.OriginRequestPolicy.Id;
  const providers=aws(['iam','list-open-id-connect-providers']).OpenIDConnectProviderList;
  if(providers.some(x=>x.Arn.endsWith('/token.actions.githubusercontent.com')))throw new Error('Existing GitHub OIDC provider found; template must reuse it.');
  let token;
  try {token=aws(['ssm','get-parameter','--name','/leselaut/origin-token','--with-decryption']).Parameter.Value;}
  catch(error){
    if(!error.stderr?.includes('ParameterNotFound'))throw new Error('Cannot inspect origin token.');
    token=randomBytes(32).toString('hex');
    aws(['ssm','put-parameter'],{Name:'/leselaut/origin-token',Type:'SecureString',Value:token,Description:'CloudFront origin authentication for LeseLaut'});
  }
  const values={VpcId:vpc.VpcId,SubnetId:subnet.SubnetId,AvailabilityZone:subnet.AvailabilityZone,ImageId:image,CloudFrontPrefixList:prefix,
    CacheDisabledPolicy:policy('Managed-CachingDisabled'),CacheOptimizedPolicy:policy('Managed-CachingOptimized'),OriginRequestPolicy:origin,OriginToken:token};
  if(Object.values(values).some(v=>!v))throw new Error('Missing deployment metadata.');
  aws(['cloudformation','validate-template'],{TemplateBody:JSON.stringify(template)});
  aws(['cloudformation','create-stack'],{StackName:stack,TemplateBody:JSON.stringify(template),Capabilities:['CAPABILITY_IAM'],
    Parameters:Object.entries(values).map(([ParameterKey,ParameterValue])=>({ParameterKey,ParameterValue})),Tags:[{Key:'Project',Value:'LeseLaut'}]});
  console.log('LeseLaut stack creation started.');
}
// Boot waits for these root-owned helpers. Upload them as soon as the private
// artifact bucket exists; do not wait for CloudFront's global rollout.
let artifactBucket;
for(let i=0;i<60;i++){
  try {artifactBucket=aws(['cloudformation','describe-stack-resource','--stack-name',stack,'--logical-resource-id','ArtifactBucket']).StackResourceDetail.PhysicalResourceId;}catch{}
  if(artifactBucket)break;
  await new Promise(r=>setTimeout(r,3000));
}
if(!artifactBucket)throw new Error('Artifact bucket not ready; rerun provisioning to resume.');
for(const name of ['release.sh','backup.sh']){
  execFileSync('aws',['s3','cp',`deploy/aws/${name}`,`s3://${artifactBucket}/bootstrap/${name}`,'--region',region,'--only-show-errors'],{stdio:['ignore','pipe','pipe']});
}
const current=describe();
console.log(`Stack status: ${current.StackStatus}`);
if(current.StackStatus==='CREATE_COMPLETE'||current.StackStatus==='UPDATE_COMPLETE'){
  const outputs=Object.fromEntries(current.Outputs.map(x=>[x.OutputKey,x.OutputValue]));
  const config={region,stack,...outputs,ProductionUrl:'https://leselaut.com'};
  writeFileSync(`${state}/deployment.json`,JSON.stringify(config,null,2)+'\n',{mode:0o600});
  // Deployment identifiers are public configuration, never credentials.
  writeFileSync('deploy/aws/deployment.json',JSON.stringify(config,null,2)+'\n');
  console.log(`AWS deployment configuration saved. URL: ${outputs.SiteUrl}`);
}
