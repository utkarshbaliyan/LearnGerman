import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const ref = name => ({Ref:name});
const sub = value => ({'Fn::Sub':value});
const get = (name,attr) => ({'Fn::GetAtt':[name,attr]});
const bucket = (extra = {}) => ({Type:'AWS::S3::Bucket',DeletionPolicy:'Retain',UpdateReplacePolicy:'Retain',Properties:{
  PublicAccessBlockConfiguration:{BlockPublicAcls:true,BlockPublicPolicy:true,IgnorePublicAcls:true,RestrictPublicBuckets:true},
  BucketEncryption:{ServerSideEncryptionConfiguration:[{ServerSideEncryptionByDefault:{SSEAlgorithm:'AES256'}}]},
  VersioningConfiguration:{Status:'Enabled'},...extra,
  LifecycleConfiguration:{Rules:[...(extra.LifecycleConfiguration?.Rules??[]),
    {Id:'AbortIncompleteUploads',Status:'Enabled',AbortIncompleteMultipartUpload:{DaysAfterInitiation:7}}]}}});

export const template = {
  AWSTemplateFormatVersion:'2010-09-09',
  Description:'LeseLaut: one SQLite host, private media/backups, CloudFront and GitHub OIDC deployment.',
  Parameters:{
    VpcId:{Type:'AWS::EC2::VPC::Id'},SubnetId:{Type:'AWS::EC2::Subnet::Id'},AvailabilityZone:{Type:String.name},
    ImageId:{Type:'AWS::EC2::Image::Id'},CloudFrontPrefixList:{Type:String.name},
    CacheDisabledPolicy:{Type:String.name},CacheOptimizedPolicy:{Type:String.name},OriginRequestPolicy:{Type:String.name},
    OriginToken:{Type:String.name,NoEcho:true,MinLength:64,MaxLength:64,AllowedPattern:'[a-f0-9]{64}'},
    AlertEmail:{Type:String.name,Default:'',Description:'Optional operator inbox; SNS requires the owner to confirm its subscription.'},
    CustomDomainName:{Type:String.name,Default:'',Description:'Optional owned apex domain; configure with its issued us-east-1 ACM certificate.'},
    CustomCertificateArn:{Type:String.name,Default:'',Description:'Issued ACM certificate in us-east-1 covering the apex domain and www.'},
  },
  Conditions:{HasAlertEmail:{'Fn::Not':[{'Fn::Equals':[ref('AlertEmail'),'']}] },
    HasCustomDomain:{'Fn::And':[{'Fn::Not':[{'Fn::Equals':[ref('CustomDomainName'),'']}]},{'Fn::Not':[{'Fn::Equals':[ref('CustomCertificateArn'),'']}]}]}},
  Resources:{
    ArtifactBucket:bucket({LifecycleConfiguration:{Rules:[{Id:'OldVersions',Status:'Enabled',NoncurrentVersionExpiration:{NoncurrentDays:14}}]}}),
    MediaBucket:bucket(),
    BackupBucket:bucket({LifecycleConfiguration:{Rules:[{Id:'BackupRetention',Status:'Enabled',ExpirationInDays:30,NoncurrentVersionExpiration:{NoncurrentDays:7}}]}}),
    GitHubOidc:{Type:'AWS::IAM::OIDCProvider',Properties:{Url:'https://token.actions.githubusercontent.com',ClientIdList:['sts.amazonaws.com']}},
    InstanceRole:{Type:'AWS::IAM::Role',Properties:{AssumeRolePolicyDocument:{Version:'2012-10-17',Statement:[{Effect:'Allow',Principal:{Service:'ec2.amazonaws.com'},Action:'sts:AssumeRole'}]},
      ManagedPolicyArns:['arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore'],
      Policies:[{PolicyName:'LeseLautRuntime',PolicyDocument:{Version:'2012-10-17',Statement:[
        {Effect:'Allow',Action:['s3:GetObject'],Resource:[sub('${ArtifactBucket.Arn}/*'),sub('${MediaBucket.Arn}/*')]},
        {Effect:'Allow',Action:['s3:ListBucket'],Resource:[get('MediaBucket','Arn')]},
        {Effect:'Allow',Action:['s3:PutObject'],Resource:[sub('${BackupBucket.Arn}/database/*')]},
        {Effect:'Allow',Action:['ssm:GetParameter'],Resource:[sub('arn:${AWS::Partition}:ssm:${AWS::Region}:${AWS::AccountId}:parameter/leselaut/runtime'),sub('arn:${AWS::Partition}:ssm:${AWS::Region}:${AWS::AccountId}:parameter/leselaut/origin-token')]},
        {Effect:'Allow',Action:['cloudwatch:PutMetricData'],Resource:'*',Condition:{StringEquals:{'cloudwatch:namespace':'LeseLaut'}}},
        {Effect:'Allow',Action:['logs:CreateLogStream','logs:PutLogEvents','logs:DescribeLogStreams'],Resource:[sub('${ApplicationLogs.Arn}')]}]}}]}},
    InstanceProfile:{Type:'AWS::IAM::InstanceProfile',Properties:{Roles:[ref('InstanceRole')]}},
    OriginSecurityGroup:{Type:'AWS::EC2::SecurityGroup',Properties:{GroupDescription:'CloudFront origin HTTP only; administration through SSM',VpcId:ref('VpcId'),
      SecurityGroupIngress:[{IpProtocol:'tcp',FromPort:80,ToPort:80,SourcePrefixListId:ref('CloudFrontPrefixList')}]}},
    DataVolume:{Type:'AWS::EC2::Volume',DeletionPolicy:'Retain',UpdateReplacePolicy:'Retain',Properties:{AvailabilityZone:ref('AvailabilityZone'),Encrypted:true,Size:10,VolumeType:'gp3',Tags:[{Key:'Project',Value:'LeseLaut'},{Key:'Name',Value:'LeseLaut learner data'}]}},
    Instance:{Type:'AWS::EC2::Instance',DeletionPolicy:'Retain',UpdateReplacePolicy:'Retain',Properties:{
      ImageId:ref('ImageId'),InstanceType:'t4g.small',AvailabilityZone:ref('AvailabilityZone'),SubnetId:ref('SubnetId'),
      IamInstanceProfile:ref('InstanceProfile'),SecurityGroupIds:[ref('OriginSecurityGroup')],
      MetadataOptions:{HttpTokens:'required',HttpPutResponseHopLimit:1},CreditSpecification:{CPUCredits:'standard'},
      BlockDeviceMappings:[{DeviceName:'/dev/xvda',Ebs:{Encrypted:true,VolumeSize:8,VolumeType:'gp3',DeleteOnTermination:true}}],
      Volumes:[{Device:'/dev/sdf',VolumeId:ref('DataVolume')}],
      Tags:[{Key:'Project',Value:'LeseLaut'},{Key:'Name',Value:'LeseLaut web'}],
      UserData:{'Fn::Base64':sub(readFileSync(new URL('./server-install.sh',import.meta.url),'utf8'))},
    }},
    ApplicationLogs:{Type:'AWS::Logs::LogGroup',Properties:{LogGroupName:'/leselaut/application',RetentionInDays:7}},
    Distribution:{Type:'AWS::CloudFront::Distribution',Properties:{DistributionConfig:{Enabled:true,HttpVersion:'http2and3',IPV6Enabled:true,PriceClass:'PriceClass_100',Comment:'LeseLaut',
      Origins:[{Id:'web',DomainName:get('Instance','PublicDnsName'),CustomOriginConfig:{HTTPPort:80,OriginProtocolPolicy:'http-only',OriginReadTimeout:60},
        OriginCustomHeaders:[{HeaderName:'X-LeseLaut-Origin',HeaderValue:ref('OriginToken')}]}],
      DefaultCacheBehavior:{TargetOriginId:'web',ViewerProtocolPolicy:'redirect-to-https',AllowedMethods:['GET','HEAD','OPTIONS','PUT','PATCH','POST','DELETE'],
        CachedMethods:['GET','HEAD'],Compress:true,CachePolicyId:ref('CacheDisabledPolicy'),OriginRequestPolicyId:ref('OriginRequestPolicy')},
      CacheBehaviors:['/assets/*','/audio/*','/images/*','/fonts/*','/media/*'].map(PathPattern=>({PathPattern,TargetOriginId:'web',ViewerProtocolPolicy:'redirect-to-https',AllowedMethods:['GET','HEAD','OPTIONS'],
        CachedMethods:['GET','HEAD'],Compress:true,CachePolicyId:ref('CacheOptimizedPolicy')})),
      Aliases:{'Fn::If':['HasCustomDomain',[ref('CustomDomainName'),sub('www.${CustomDomainName}')],ref('AWS::NoValue')]},
      ViewerCertificate:{'Fn::If':['HasCustomDomain',{AcmCertificateArn:ref('CustomCertificateArn'),SslSupportMethod:'sni-only',MinimumProtocolVersion:'TLSv1.2_2021'},{CloudFrontDefaultCertificate:true}]},
    }}},
    DeployDocument:{Type:'AWS::SSM::Document',Properties:{DocumentType:'Command',Content:{schemaVersion:'2.2',description:'Deploy a checked LeseLaut release',parameters:{Release:{type:'String',allowedPattern:'^[a-f0-9]{40}$'}},
      mainSteps:[{action:'aws:runShellScript',name:'deploy',inputs:{timeoutSeconds:'600',runCommand:['/usr/local/bin/leselaut-deploy "{{Release}}"']}}]}}},
    DeployRole:{Type:'AWS::IAM::Role',Properties:{AssumeRolePolicyDocument:{Version:'2012-10-17',Statement:[{Effect:'Allow',Principal:{Federated:ref('GitHubOidc')},Action:'sts:AssumeRoleWithWebIdentity',Condition:{StringEquals:{
      'token.actions.githubusercontent.com:aud':'sts.amazonaws.com',
      'token.actions.githubusercontent.com:sub':['repo:utkarshbaliyan/LearnGerman:ref:refs/heads/main','repo:utkarshbaliyan@142747260/LearnGerman@1352170415:ref:refs/heads/main'],
    }}}]},Policies:[{PolicyName:'LeseLautDeploy',PolicyDocument:{Version:'2012-10-17',Statement:[
      {Effect:'Allow',Action:['s3:PutObject','s3:GetObject'],Resource:[sub('${ArtifactBucket.Arn}/releases/*')]},
      {Effect:'Allow',Action:['ssm:SendCommand'],Resource:[sub('arn:${AWS::Partition}:ssm:${AWS::Region}:${AWS::AccountId}:document/${DeployDocument}'),sub('arn:${AWS::Partition}:ec2:${AWS::Region}:${AWS::AccountId}:instance/${Instance}')]},
      {Effect:'Allow',Action:['ssm:GetCommandInvocation'],Resource:'*'},
    ]}}]}},
    AlertsTopic:{Type:'AWS::SNS::Topic',Properties:{DisplayName:'LeseLaut operations'}},
    AlertSubscription:{Type:'AWS::SNS::Subscription',Condition:'HasAlertEmail',Properties:{Protocol:'email',Endpoint:ref('AlertEmail'),TopicArn:ref('AlertsTopic')}},
    BackupAlarm:{Type:'AWS::CloudWatch::Alarm',Properties:{AlarmDescription:'No successful LeseLaut backup reported for a day',Namespace:'LeseLaut',MetricName:'BackupSucceeded',Dimensions:[{Name:'Site',Value:'leselaut'}],Statistic:'Sum',Period:86400,EvaluationPeriods:1,Threshold:1,ComparisonOperator:'LessThanThreshold',TreatMissingData:'breaching',AlarmActions:[ref('AlertsTopic')]}},
    CpuAlarm:{Type:'AWS::CloudWatch::Alarm',Properties:{AlarmDescription:'Sustained LeseLaut CPU pressure',Namespace:'AWS/EC2',MetricName:'CPUUtilization',Dimensions:[{Name:'InstanceId',Value:ref('Instance')}],Statistic:'Average',Period:300,EvaluationPeriods:3,Threshold:80,ComparisonOperator:'GreaterThanThreshold',TreatMissingData:'notBreaching',AlarmActions:[ref('AlertsTopic')],OKActions:[ref('AlertsTopic')]}},
    HealthAlarm:{Type:'AWS::CloudWatch::Alarm',Properties:{AlarmDescription:'LeseLaut instance status failure',Namespace:'AWS/EC2',MetricName:'StatusCheckFailed',Dimensions:[{Name:'InstanceId',Value:ref('Instance')}],Statistic:'Maximum',Period:300,EvaluationPeriods:2,Threshold:1,ComparisonOperator:'GreaterThanOrEqualToThreshold',TreatMissingData:'missing',AlarmActions:[ref('AlertsTopic')],OKActions:[ref('AlertsTopic')]}},
  },
  Outputs:{InstanceId:{Value:ref('Instance')},DataVolumeId:{Value:ref('DataVolume')},MediaBucket:{Value:ref('MediaBucket')},ArtifactBucket:{Value:ref('ArtifactBucket')},BackupBucket:{Value:ref('BackupBucket')},
    DeployRoleArn:{Value:get('DeployRole','Arn')},DeployDocument:{Value:ref('DeployDocument')},DistributionId:{Value:ref('Distribution')},SiteUrl:{Value:sub('https://${Distribution.DomainName}')}},
};

if(process.argv[1]===fileURLToPath(import.meta.url)) console.log(JSON.stringify(template));
