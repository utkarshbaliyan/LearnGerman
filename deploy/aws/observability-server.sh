#!/bin/bash
set -euo pipefail
umask 077
mkdir -p /var/log/leselaut-http
chmod 750 /var/log/leselaut-http
# The origin secret in this file is never printed or replaced.
python3 - <<'PY'
from pathlib import Path
import re
p=Path('/etc/nginx/conf.d/leselaut.conf')
s=p.read_text()
line='log_format leselaut_safe escape=json \'{"kind":"http","time":"$time_iso8601","method":"$request_method","path":"$uri","status":$status,"duration":$request_time,"bytes":$body_bytes_sent}\';'
if len(re.findall(r'^log_format leselaut_safe .*?;$',s,re.M))!=1:
    raise SystemExit('Unexpected nginx log configuration; no changes made.')
Path('/etc/leselaut/nginx-before-observability.conf').write_text(s)
s=re.sub(r'^log_format leselaut_safe .*?;$',lambda _:line,s,flags=re.M)
s=s.replace('access_log /var/log/nginx/leselaut-access.log leselaut_safe;', 'access_log /var/log/leselaut-http/access.log leselaut_safe;')
p.write_text(s)
PY
if ! nginx -t; then
  cp /etc/leselaut/nginx-before-observability.conf /etc/nginx/conf.d/leselaut.conf
  exit 1
fi
systemctl reload nginx
python3 - <<'PY'
from pathlib import Path
import json
p=Path('/opt/aws/amazon-cloudwatch-agent/etc/leselaut.json')
config=json.loads(p.read_text())
items=config.setdefault('logs',{}).setdefault('logs_collected',{}).setdefault('files',{}).setdefault('collect_list',[])
entry={'file_path':'/var/log/leselaut-http/access.log','log_group_name':'/leselaut/access','log_stream_name':'{instance_id}'}
items[:]=[item for item in items if item.get('log_group_name')!='/leselaut/access']+[entry]
p.write_text(json.dumps(config))
PY
cat >/etc/logrotate.d/leselaut-access <<'ROTATE'
/var/log/leselaut-http/access.log {
  daily
  maxsize 20M
  rotate 7
  compress
  delaycompress
  missingok
  notifempty
  copytruncate
}
ROTATE
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/leselaut.json
cat >/usr/local/bin/leselaut-observability-ready <<'PROBE'
#!/bin/bash
set -euo pipefail
value=0
if curl --max-time 7 -fsS http://127.0.0.1:3000/api/health -o /dev/null 2>/dev/null; then value=1; fi
AWS_MAX_ATTEMPTS=2 aws cloudwatch put-metric-data --namespace LeseLaut --region "${AWS_REGION:-ap-south-1}" --cli-connect-timeout 5 --cli-read-timeout 10 --metric-data "MetricName=HttpReady,Dimensions=[{Name=Site,Value=leselaut}],Unit=Count,Value=$value"
PROBE
chmod 700 /usr/local/bin/leselaut-observability-ready
cat >/etc/systemd/system/leselaut-observability-ready.service <<'UNIT'
[Unit]
Description=LeseLaut application and database readiness metric
[Service]
Type=oneshot
EnvironmentFile=/etc/leselaut/config
TimeoutStartSec=40
ExecStart=/usr/local/bin/leselaut-observability-ready
UNIT
cat >/etc/systemd/system/leselaut-observability-ready.timer <<'UNIT'
[Unit]
Description=Probe LeseLaut readiness every five minutes
[Timer]
OnBootSec=30s
OnUnitActiveSec=5min
AccuracySec=10s
[Install]
WantedBy=timers.target
UNIT
systemctl daemon-reload
systemctl enable --now leselaut-observability-ready.timer
systemctl start leselaut-observability-ready.service
echo 'Sanitized access-log collection configured.'
