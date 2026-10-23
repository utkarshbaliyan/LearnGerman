#!/bin/bash
set -euo pipefail
umask 077
cat >/etc/systemd/system/leselaut-backup.service <<'UNIT'
[Unit]
Description=Consistent LeseLaut database backup
[Service]
Type=oneshot
ExecStart=/usr/local/bin/leselaut-backup
UNIT
cat >/etc/systemd/system/leselaut-backup.timer <<'UNIT'
[Unit]
Description=Daily LeseLaut database backup
[Timer]
OnCalendar=daily
RandomizedDelaySec=300
Persistent=true
[Install]
WantedBy=timers.target
UNIT
cat >/etc/logrotate.d/leselaut <<'ROTATE'
/var/log/leselaut/application.log {
  daily
  rotate 7
  compress
  delaycompress
  missingok
  notifempty
  copytruncate
}
ROTATE
systemctl daemon-reload
systemctl enable --now leselaut-backup.timer
if ! test -x /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl; then
  curl -fsS https://amazoncloudwatch-agent.s3.amazonaws.com/amazon_linux/arm64/latest/amazon-cloudwatch-agent.rpm -o /tmp/leselaut-cloudwatch-agent.rpm
  rpm -U /tmp/leselaut-cloudwatch-agent.rpm
  rm /tmp/leselaut-cloudwatch-agent.rpm
fi
cat >/opt/aws/amazon-cloudwatch-agent/etc/leselaut.json <<'JSON'
{"logs":{"logs_collected":{"files":{"collect_list":[{"file_path":"/var/log/leselaut/application.log","log_group_name":"/leselaut/application","log_stream_name":"{instance_id}"}]}}}}
JSON
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/leselaut.json
echo 'Daily backups and application log collection enabled.'
