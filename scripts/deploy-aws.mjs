import {readFileSync,appendFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {verifyWithRetry} from './verify-public.mjs';

const config=JSON.parse(readFileSync('deploy/aws/deployment.json','utf8'));
const release=process.env.GITHUB_SHA??execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(!/^[a-f0-9]{40}$/.test(release))throw new Error('A full Git commit SHA is required.');
const archive=process.env.LESELAUT_RELEASE_ARCHIVE;
if(!archive)throw new Error('LESELAUT_RELEASE_ARCHIVE must identify the already checked release archive.');
const summary=message=>{
  console.log(message);
  if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,`${message}\n\n`);
};
const repository=process.env.GITHUB_REPOSITORY;
const logUrl=repository?`${process.env.GITHUB_SERVER_URL??'https://github.com'}/${repository}/actions/runs/${process.env.GITHUB_RUN_ID}`:undefined;
async function github(path,body) {
  const response=await fetch(`${process.env.GITHUB_API_URL??'https://api.github.com'}/repos/${repository}/${path}`,{
    method:body?'POST':'GET',signal:AbortSignal.timeout(20000),
    headers:{Authorization:`Bearer ${process.env.GH_TOKEN}`,Accept:'application/vnd.github+json','Content-Type':'application/json'},
    ...(body?{body:JSON.stringify(body)}:{}),
  });
  if(!response.ok)throw new Error(`GitHub deployment API returned ${response.status}.`);
  return response.json();
}
const aws=args=>execFileSync('aws',[...args,'--region',config.region,'--no-cli-pager','--cli-connect-timeout','10','--cli-read-timeout','30'],
  {encoding:'utf8',timeout:60000,stdio:['ignore','pipe','pipe']});
let deployment,command;
async function status(state,description) {
  if(deployment)await github(`deployments/${deployment.id}/statuses`,{
    state,description,log_url:logUrl,environment_url:config.ProductionUrl,auto_inactive:true,
  });
}
try {
  if(repository&&process.env.GH_TOKEN) {
    const main=await github('git/ref/heads/main');
    if(main.object.sha!==release) {
      summary(`Skipped superseded commit ${release}; main is now ${main.object.sha}. No deployment started.`);
      process.exit(0);
    }
    // The required check completed in needs: check-and-deploy. Keep branch OIDC
    // identity; an environment-bound job would change the AWS subject claim.
    deployment=await github('deployments',{ref:release,environment:'production',auto_merge:false,
      required_contexts:['check-and-deploy'],production_environment:true,description:'Checked AWS release'});
    await status('in_progress','Deploying checked commit through AWS SSM');
  }
  aws(['s3','cp',archive,`s3://${config.ArtifactBucket}/releases/${release}.tgz`,'--only-show-errors']);
  const result=JSON.parse(aws(['ssm','send-command','--document-name',config.DeployDocument,'--instance-ids',config.InstanceId,
    '--parameters',JSON.stringify({Release:[release]}),'--output','json']));
  command=result.Command.CommandId;
  summary(`Deploying commit \`${release}\`. SSM command: \`${command}\`. [Production](${config.ProductionUrl}) · [Workflow logs](${logUrl})`);
  const deadline=Date.now()+15*60*1000;
  let complete=false;
  while(Date.now()<deadline) {
    await new Promise(resolve=>setTimeout(resolve,5000));
    let invocation;
    try {invocation=JSON.parse(aws(['ssm','get-command-invocation','--command-id',command,'--instance-id',config.InstanceId,'--output','json']));}
    catch(error) {
      if(String(error.stderr).includes('InvocationDoesNotExist'))continue;
      throw new Error('Unable to read SSM deployment status. Inspect the recorded command ID.');
    }
    if(invocation.Status==='Success'){complete=true;break;}
    if(['Failed','Cancelled','TimedOut','Cancelling'].includes(invocation.Status))
      throw new Error(`SSM deployment ${invocation.Status}; server attempted code rollback. Inspect command ${command} for rollback readiness.`);
  }
  if(!complete)throw new Error(`Deployment timed out; outcome unknown. Inspect SSM command ${command} before retrying.`);
  // The server performs these inside its rollback trap; this independent probe
  // catches a later failure and records it honestly rather than claiming rollback.
  for(const base of [config.ProductionUrl,config.SiteUrl])await verifyWithRetry(base,release);
  await status('success','Exact commit healthy on production and CloudFront');
  summary(`Production verified: \`${release}\` — database readiness, pages, JavaScript, sign-in boundary, audio ranges and monitoring off. Learner data retained.`);
}catch(error) {
  const message=error.stderr?'AWS command failed; inspect the SSM command and AWS permissions.':error.message;
  summary(`**Deployment failed:** ${message}${command?` SSM command: \`${command}\`.`:''} Public failures after SSM success require investigation; no database restore is performed.`);
  try{await status('failure',command?`Deployment or verification failed; inspect SSM ${command}`:'Deployment setup failed; see workflow logs');}
  catch{console.error('Could not update GitHub deployment status; workflow result remains authoritative.');}
  console.error(`::error::${message}`);
  process.exitCode=1;
}
