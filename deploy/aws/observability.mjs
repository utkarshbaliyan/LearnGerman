// Native AWS console views. This is not a dashboard exposed by the website.
export function monitoringDashboard(config, rumLogGroup) {
  const region = config.region;
  const widgets = [];
  function widget(type, title, properties, width = 12, height = 6) {
    const previous = widgets.at(-1);
    const x = previous && previous.x + previous.width + width <= 24 ? previous.x + previous.width : 0;
    const y = x ? previous.y : previous ? previous.y + previous.height : 0;
    widgets.push({ type, x, y, width, height, properties: { region, title, ...properties } });
  }
  const log = (title, group, query, view = 'table', width = 12) => widget('log', title, { query: `SOURCE '${group}' | ${query}`, view }, width);
  widget('text', '', { markdown: '# LeseLaut — production observability\nUse the time picker for history and refresh for recent activity. Traffic metrics count HTTP requests, not unique people. RUM covers consenting browser sessions and can miss blocked telemetry. Server logs exclude query strings, cookies, tokens and client IPs.' }, 24, 3);
  if (rumLogGroup) {
    log('Live browsers — active in last 5 minutes', rumLogGroup, 'filter toMillis(@timestamp) >= (now() * 1000 - 300000) and event_type = "leselaut.heartbeat" | stats count_distinct(user_details.userId) as live_browsers', 'table', 6);
    log('Recent browser visits — timestamps', rumLogGroup, 'fields @timestamp, user_details.userId as visitor, user_details.sessionId as session, metadata.pageId as page | filter event_type = "com.amazon.rum.page_view_event" | sort @timestamp desc | limit 100', 'table', 18);
  }
  widget('metric', 'Website requests (CloudFront)', { region: 'us-east-1', view: 'timeSeries', period: 300, stat: 'Sum',
    metrics: [['AWS/CloudFront', 'Requests', 'DistributionId', config.DistributionId, 'Region', 'Global']] });
  widget('metric', 'Viewer error rates (%)', { region: 'us-east-1', view: 'timeSeries', period: 300, stat: 'Average',
    metrics: [['AWS/CloudFront', '4xxErrorRate', 'DistributionId', config.DistributionId, 'Region', 'Global'], ['AWS/CloudFront', '5xxErrorRate', 'DistributionId', config.DistributionId, 'Region', 'Global']] });
  log('Origin request count and p95 latency (seconds)', '/leselaut/access', 'filter kind = "http" | stats count(*) as requests, pct(duration, 95) as p95_seconds by bin(5m)', 'timeSeries');
  log('Recent failing requests', '/leselaut/access', 'fields @timestamp, method, path, status, duration | filter status >= 400 | sort @timestamp desc | limit 50');
  widget('metric', 'Server CPU and health', { view: 'timeSeries', period: 300, stat: 'Average',
    metrics: [['AWS/EC2', 'CPUUtilization', 'InstanceId', config.InstanceId], ['AWS/EC2', 'StatusCheckFailed', 'InstanceId', config.InstanceId]] });
  widget('metric', 'Daily backup success', { view: 'timeSeries', period: 86400, stat: 'Sum',
    metrics: [['LeseLaut', 'BackupSucceeded', 'Site', 'leselaut']] });
  widget('metric', 'Application and database readiness (1 = healthy)', { view: 'timeSeries', period: 300, stat: 'Minimum',
    metrics: [['LeseLaut', 'HttpReady', 'Site', 'leselaut']] });
  log('Application failures and pending work', '/leselaut/application', 'fields @timestamp, event | filter event like /failed|unavailable|pending/ | sort @timestamp desc | limit 50');
  log('Recent origin page visits (includes bots)', '/leselaut/access', String.raw`fields @timestamp, method, path, status | filter method = "GET" and status < 400 and path not like /^\/(assets|media|audio|images|fonts|api)\// | sort @timestamp desc | limit 100`);
  if (rumLogGroup) {
    log('Recent browser sessions / visit times', rumLogGroup, 'fields @timestamp, user_details.userId as visitor, user_details.sessionId as session, metadata.pageId as page, event_type | filter event_type = "com.amazon.rum.session_start_event" or event_type = "com.amazon.rum.page_view_event" | sort @timestamp desc | limit 100', 'table', 24);
    log('Browser users and page views over time', rumLogGroup, 'filter event_type = "com.amazon.rum.page_view_event" | stats count(*) as page_views, count_distinct(user_details.userId) as browser_users by bin(5m)', 'timeSeries');
    log('Active visible browsers — heartbeats in selected interval', rumLogGroup, 'filter event_type = "leselaut.heartbeat" | stats count_distinct(user_details.userId) as active_browsers by bin(1m)', 'timeSeries');
    log('Pages visited', rumLogGroup, 'filter event_type = "com.amazon.rum.page_view_event" | stats count(*) as views by metadata.pageId | sort views desc | limit 30');
    log('Recent browser errors', rumLogGroup, 'fields @timestamp, metadata.pageId, event_details.message | filter event_type = "com.amazon.rum.js_error_event" | sort @timestamp desc | limit 50');
  }
  return { start: '-PT1H', periodOverride: 'inherit', widgets };
}

export function monitoringStack(config, instanceRole, rumLogGroup, alertsTopicArn) {
  return { AWSTemplateFormatVersion: '2010-09-09', Description: 'LeseLaut external CloudWatch dashboard and sanitized origin logs. No public website admin UI.',
    Resources: {
      AccessLogs: { Type: 'AWS::Logs::LogGroup', DeletionPolicy: 'Retain', UpdateReplacePolicy: 'Retain', Properties: { LogGroupName: '/leselaut/access', RetentionInDays: 7 } },
      AgentLogsPolicy: { Type: 'AWS::IAM::Policy', Properties: { PolicyName: 'LeseLautAccessLogCollection', Roles: [instanceRole], PolicyDocument: { Version: '2012-10-17', Statement: [{ Effect: 'Allow', Action: ['logs:CreateLogStream', 'logs:PutLogEvents', 'logs:DescribeLogStreams'], Resource: { 'Fn::GetAtt': ['AccessLogs', 'Arn'] } }] } } },
      ...(alertsTopicArn ? { AppReadyAlarm: { Type: 'AWS::CloudWatch::Alarm', Properties: { AlarmName: 'leselaut-AppReady', AlarmDescription: 'Application/database readiness is failing or probes are missing for two five-minute periods.', Namespace: 'LeseLaut', MetricName: 'HttpReady', Dimensions: [{ Name: 'Site', Value: 'leselaut' }], Statistic: 'Minimum', Period: 300, EvaluationPeriods: 2, DatapointsToAlarm: 2, Threshold: 1, ComparisonOperator: 'LessThanThreshold', TreatMissingData: 'breaching', AlarmActions: [alertsTopicArn], OKActions: [alertsTopicArn] } } } : {}),
      Dashboard: { Type: 'AWS::CloudWatch::Dashboard', Properties: { DashboardName: 'LeseLaut-Production', DashboardBody: JSON.stringify(monitoringDashboard(config, rumLogGroup)) } },
    }, Outputs: { DashboardName: { Value: 'LeseLaut-Production' }, AccessLogGroup: { Value: { Ref: 'AccessLogs' } } } };
}

export function rumStack(config) {
  const ref = name => ({ Ref: name });
  const get = (name, field) => ({ 'Fn::GetAtt': [name, field] });
  return { AWSTemplateFormatVersion: '2010-09-09', Description: 'LeseLaut browser telemetry, visible only in AWS. Ingestion-only unauthenticated role; no app authentication changes.',
    Resources: {
      Pool: { Type: 'AWS::Cognito::IdentityPool', Properties: { IdentityPoolName: 'leselaut_rum', AllowUnauthenticatedIdentities: true, AllowClassicFlow: false } },
      GuestRole: { Type: 'AWS::IAM::Role', Properties: { AssumeRolePolicyDocument: { Version: '2012-10-17', Statement: [{ Effect: 'Allow', Principal: { Federated: 'cognito-identity.amazonaws.com' }, Action: 'sts:AssumeRoleWithWebIdentity', Condition: { StringEquals: { 'cognito-identity.amazonaws.com:aud': ref('Pool') }, 'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'unauthenticated' } } }] } } },
      PoolRoles: { Type: 'AWS::Cognito::IdentityPoolRoleAttachment', Properties: { IdentityPoolId: ref('Pool'), Roles: { unauthenticated: get('GuestRole', 'Arn') } } },
      Monitor: { Type: 'AWS::RUM::AppMonitor', Properties: { Name: 'leselaut-web', DomainList: [new URL(config.SiteUrl).hostname, 'leselaut-german.professor-ut7.chatgpt.site'], CwLogEnabled: true, CustomEvents: { Status: 'ENABLED' },
        AppMonitorConfiguration: { AllowCookies: true, EnableXRay: false, SessionSampleRate: 1, IdentityPoolId: ref('Pool'), Telemetries: ['errors', 'performance', 'http'] }, Tags: [{ Key: 'Project', Value: 'LeseLaut' }] } },
      IngestionOnly: { Type: 'AWS::IAM::Policy', Properties: { PolicyName: 'LeseLautRumIngestionOnly', Roles: [ref('GuestRole')], PolicyDocument: { Version: '2012-10-17', Statement: [{ Effect: 'Allow', Action: 'rum:PutRumEvents', Resource: { 'Fn::Sub': 'arn:${AWS::Partition}:rum:${AWS::Region}:${AWS::AccountId}:appmonitor/${Monitor}' } }] } } },
    }, Outputs: { AppMonitorId: { Value: get('Monitor', 'Id') }, AppMonitorName: { Value: ref('Monitor') }, IdentityPoolId: { Value: ref('Pool') }, GuestRoleArn: { Value: get('GuestRole', 'Arn') } } };
}
