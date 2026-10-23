import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const config=JSON.parse(readFileSync('deploy/aws/deployment.json','utf8'));
const release=process.env.GITHUB_SHA??execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(!/^[a-f0-9]{40}$/.test(release))throw new Error('A full Git commit SHA is required.');
const archive=`/tmp/leselaut-${release}.tgz`;
execFileSync('tar',['-czf',archive,'-C','dist/standalone','.']);
execFileSync('aws',['s3','cp',archive,`s3://${config.ArtifactBucket}/releases/${release}.tgz`,'--region',config.region,'--only-show-errors'],{stdio:'inherit'});
const result=JSON.parse(execFileSync('aws',['ssm','send-command','--document-name',config.DeployDocument,'--instance-ids',config.InstanceId,
  '--parameters',JSON.stringify({Release:[release]}),'--region',config.region,'--output','json','--no-cli-pager'],{encoding:'utf8'}));
const command=result.Command.CommandId;
for(let i=0;i<180;i++){
  await new Promise(r=>setTimeout(r,5000));
  let status;
  try{status=JSON.parse(execFileSync('aws',['ssm','get-command-invocation','--command-id',command,'--instance-id',config.InstanceId,'--region',config.region,'--output','json','--no-cli-pager'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));}catch{continue;}
  if(status.Status==='Success'){
    const response=await fetch(`${config.SiteUrl}/api/health`,{signal:AbortSignal.timeout(30000)});
    if(!response.ok)throw new Error('Deployment command passed but public health check failed.');
    console.log(`Deployed ${release}: ${config.SiteUrl}`);process.exit(0);
  }
  if(['Failed','Cancelled','TimedOut','Cancelling'].includes(status.Status))throw new Error(`Deployment ${status.Status}; inspect the SSM command in AWS.`);
}
throw new Error('AWS deployment did not finish within fifteen minutes.');
