import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {parseEnv} from 'node:util';
import {SSMClient, GetParameterCommand} from '@aws-sdk/client-ssm';

try{
  const config=JSON.parse(readFileSync('deploy/aws/deployment.json','utf8'));
  let previous={};
  try {
    const response=await new SSMClient({region:config.region}).send(new GetParameterCommand({Name:'/leselaut/runtime',WithDecryption:true}));
    previous=parseEnv(response.Parameter.Value);
  } catch(error) { if(error.name!=='ParameterNotFound')throw new Error('Existing runtime settings could not be read safely.'); }
  const localSettings=parseEnv(readFileSync('.env.local','utf8'));
  let input='';for await(const chunk of process.stdin)input+=chunk;
  const publicSettings=input.trim()?JSON.parse(input):{};
  const allowed=['GROQ_TRANSCRIBE_MODEL','GROQ_TUTOR_MODEL','OPENAI_TRANSCRIBE_MODEL','OPENAI_TUTOR_MODEL','GROQ_VISION_MODEL','LESELAUT_AI_DAILY_CALL_LIMIT','LESELAUT_AI_ENABLED','LESELAUT_RUM_ENABLED'];
  const values={LESELAUT_AI_DAILY_CALL_LIMIT:'200',LESELAUT_AI_ENABLED:'0',LESELAUT_RUM_ENABLED:'0',...previous,AWS_REGION:config.region,LESELAUT_SQLITE_PATH:'/var/lib/leselaut/leselaut.sqlite',LESELAUT_MEDIA_BUCKET:config.MediaBucket,
    LESELAUT_READ_ONLY:process.argv.includes('--enable-writes')?'0':'1'};
  for(const key of allowed)if(publicSettings[key]??localSettings[key])values[key]=publicSettings[key]??localSettings[key];
  if(!['0','1'].includes(values.LESELAUT_AI_ENABLED)||!['0','1'].includes(values.LESELAUT_RUM_ENABLED))throw new Error('AI and monitoring flags must be 0 or 1.');
  for(const key of ['GROQ_API_KEY','OPENAI_API_KEY']){
    if(values.LESELAUT_AI_ENABLED==='0')delete values[key];
    else{
      if(!localSettings[key])throw new Error('AI credentials are required only when AI is enabled.');
      values[key]=localSettings[key];
    }
  }
  if(localSettings.SUPABASE_SECRET_KEY)values.SUPABASE_SECRET_KEY=localSettings.SUPABASE_SECRET_KEY;
  for(const value of Object.values(values))if(typeof value!=='string'||!value||/[\r\n]/.test(value))throw new Error('Invalid runtime setting.');
  const content=Object.entries(values).map(([key,value])=>`${key}=${JSON.stringify(value)}`).join('\n')+'\n';
  execFileSync(process.execPath,[fileURLToPath(new URL('./sdk-request.mjs',import.meta.url)),'ssm','put-parameter',config.region],{
    input:JSON.stringify({Name:'/leselaut/runtime',Type:'SecureString',Overwrite:true,Value:content,Description:'LeseLaut runtime configuration; never expose values'}),stdio:['pipe','pipe','pipe']});
  console.log(`AWS runtime configured in SecureString; writes ${values.LESELAUT_READ_ONLY==='1'?'disabled for staging':'enabled'}. Secret values withheld.`);
}catch(error){console.error(error.stderr?'AWS configuration failed; sensitive diagnostics withheld.':error.message);process.exitCode=1;}
