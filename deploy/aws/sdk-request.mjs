// A bounded provisioning bridge. Payloads (including SecureString values and
// NoEcho parameters) arrive only over stdin and are never written or logged.
import {CloudFormationClient,CreateStackCommand,ValidateTemplateCommand} from '@aws-sdk/client-cloudformation';
import {SSMClient,PutParameterCommand} from '@aws-sdk/client-ssm';
const commands={cloudformation:{'create-stack':CreateStackCommand,'validate-template':ValidateTemplateCommand},ssm:{'put-parameter':PutParameterCommand}};
try {
  const [service,operation,region]=process.argv.slice(2);
  const Command=commands[service]?.[operation];
  if(!Command)throw new Error('Unsupported provisioning operation.');
  let body='';for await(const chunk of process.stdin)body+=chunk;
  const client=service==='ssm'?new SSMClient({region}):new CloudFormationClient({region});
  const result=await client.send(new Command(JSON.parse(body)));
  delete result.$metadata;
  process.stdout.write(JSON.stringify(result));
}catch(error){console.error(`AWS SDK error: ${error.name}`);process.exitCode=1;}
