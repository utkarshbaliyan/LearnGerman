#!/bin/bash
set -euo pipefail
umask 077
dnf install -y nginx sqlite tar xz
id leselaut >/dev/null 2>&1 || useradd --system --home-dir /var/lib/leselaut --shell /sbin/nologin leselaut
mkdir -p /opt/leselaut/releases /var/lib/leselaut /var/log/leselaut /etc/leselaut
chmod 755 /opt/leselaut /opt/leselaut/releases

# The stack attaches one dedicated, encrypted EBS volume. Resolve that exact
# device, never the root disk or an arbitrary unmounted volume.
volume_serial=$(echo '${DataVolume}' | tr -d '-')
for attempt in $(seq 1 60); do
  device=$(lsblk -ndo NAME,SERIAL | awk -v serial="$volume_serial" '$2 == serial {print "/dev/"$1}')
  test -n "$device" && break
  sleep 2
done
test -b "$device"
if ! blkid "$device"; then
  # Fail on a read error. This is a newly provisioned stack-owned volume.
  dd if="$device" of=/dev/null bs=4096 count=1 status=none
  mkfs.ext4 -q "$device"
fi
uuid=$(blkid -s UUID -o value "$device")
grep -q "$uuid" /etc/fstab || echo "UUID=$uuid /var/lib/leselaut ext4 defaults,noatime 0 2" >> /etc/fstab
mountpoint -q /var/lib/leselaut || mount /var/lib/leselaut
chown leselaut:leselaut /var/lib/leselaut /var/log/leselaut
chmod 700 /var/lib/leselaut

# Download the current Node 22 release and check the published SHA-256 before
# installing it. Builds happen in GitHub, never on this small instance.
mkdir -p /tmp/leselaut-node
cd /tmp/leselaut-node
curl -fsS https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt -o SHASUMS256.txt
archive=$(awk '$2 ~ /^node-v22\..*-linux-arm64.tar.xz$/ {print $2}' SHASUMS256.txt)
test -n "$archive"
curl -fsS "https://nodejs.org/dist/latest-v22.x/$archive" -o "$archive"
grep " $archive$" SHASUMS256.txt | sha256sum -c -
tar -xJf "$archive" --strip-components=1 -C /usr/local
rm -f "$archive"

cat >/etc/leselaut/config <<'CONFIG'
AWS_REGION=${AWS::Region}
ARTIFACT_BUCKET=${ArtifactBucket}
MEDIA_BUCKET=${MediaBucket}
BACKUP_BUCKET=${BackupBucket}
CONFIG
chmod 600 /etc/leselaut/config
origin_token=$(aws ssm get-parameter --region '${AWS::Region}' --name /leselaut/origin-token --with-decryption --query Parameter.Value --output text)
cat >/etc/nginx/conf.d/leselaut.conf <<NGINX
log_format leselaut_safe '\$request_method \$uri \$status \$request_time';
server {
  listen 80 default_server;
  server_name _;
  client_max_body_size 12m;
  access_log /var/log/nginx/leselaut-access.log leselaut_safe;
  if (\$http_x_leselaut_origin != "$origin_token") { return 403; }
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_read_timeout 180s;
    proxy_buffering off;
  }
}
NGINX
# Remove the distribution's default server block, keeping the http settings.
python3 - <<'PY'
from pathlib import Path
p=Path('/etc/nginx/nginx.conf')
s=p.read_text(); start=s.find('    server {')
if start>=0:
 depth=0; end=start
 for i in range(start,len(s)):
  if s[i]=='{': depth+=1
  elif s[i]=='}':
   depth-=1
   if depth==0: end=i+1; break
 p.write_text(s[:start]+s[end:])
PY
nginx -t
systemctl enable --now nginx

cat >/etc/systemd/system/leselaut.service <<'UNIT'
[Unit]
Description=LeseLaut
After=network-online.target
Wants=network-online.target
[Service]
User=leselaut
Group=leselaut
WorkingDirectory=/opt/leselaut/current
EnvironmentFile=/etc/leselaut/runtime.env
Environment=HOST=127.0.0.1
Environment=PORT=3000
Environment=NODE_OPTIONS=--max-old-space-size=1024
ExecStart=/usr/local/bin/node /opt/leselaut/current/server.js
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/leselaut /var/log/leselaut
UMask=0077
StandardOutput=append:/var/log/leselaut/application.log
StandardError=append:/var/log/leselaut/application.log
[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable leselaut

# Deployment helpers are versioned with the application, but installed as
# root-owned files outside the unprivileged app's writable directories.
for attempt in $(seq 1 120); do
  if aws s3 cp 's3://${ArtifactBucket}/bootstrap/release.sh' /usr/local/bin/leselaut-deploy --region '${AWS::Region}' --only-show-errors && aws s3 cp 's3://${ArtifactBucket}/bootstrap/backup.sh' /usr/local/bin/leselaut-backup --region '${AWS::Region}' --only-show-errors; then break; fi
  sleep 5
done
test -s /usr/local/bin/leselaut-deploy
test -s /usr/local/bin/leselaut-backup
chmod 700 /usr/local/bin/leselaut-deploy /usr/local/bin/leselaut-backup
echo ready >/etc/leselaut/ready
