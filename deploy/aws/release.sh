#!/bin/bash
set -euo pipefail
umask 077
release_id=$1
[[ "$release_id" =~ ^[a-f0-9]{40}$ ]] || exit 64
source /etc/leselaut/config
exec 9>/var/lock/leselaut-deploy.lock
flock -w 300 9 || exit 75
test -f /etc/leselaut/ready
release_dir=/opt/leselaut/releases/$release_id
mkdir -p "$release_dir"
aws s3 cp "s3://$ARTIFACT_BUCKET/releases/$release_id.tgz" /tmp/leselaut-release.tgz --region "$AWS_REGION" --only-show-errors
if tar -tzf /tmp/leselaut-release.tgz | grep -Eq '(^/|(^|/)\.\.(/|$))'; then exit 65; fi
tar -xzf /tmp/leselaut-release.tgz --no-same-owner -C "$release_dir"
chmod 755 /opt/leselaut /opt/leselaut/releases "$release_dir"
rm /tmp/leselaut-release.tgz
test -f "$release_dir/server.js"

# Runtime secrets stay in SSM SecureString and a root-only environment file.
# They are never build inputs, tarball contents or GitHub secrets.
aws ssm get-parameter --name /leselaut/runtime --with-decryption --region "$AWS_REGION" --query Parameter.Value --output text > /etc/leselaut/runtime.env
chmod 600 /etc/leselaut/runtime.env
old_release=''
if test -L /opt/leselaut/current && test -d /opt/leselaut/current; then
  old_release=$(readlink -f /opt/leselaut/current)
fi
systemctl stop leselaut || true
if test -f /var/lib/leselaut/leselaut.sqlite; then /usr/local/bin/leselaut-backup; fi
LESELAUT_SQLITE_PATH=/var/lib/leselaut/leselaut.sqlite /usr/local/bin/node "$release_dir/migrate.mjs"
chown leselaut:leselaut /var/lib/leselaut/leselaut.sqlite*
ln -sfn "$release_dir" /opt/leselaut/current
systemctl start leselaut
for attempt in $(seq 1 45); do
  if curl -fsS http://127.0.0.1:3000/api/health >/dev/null; then
    # Keep the small root disk bounded. Only generated release directories are
    # pruned; learner data lives on a separate retained volume and in S3 backups.
    touch "$release_dir"
    release_count=0
    while read -r candidate; do
      [[ "$candidate" =~ ^[a-f0-9]{40}$ ]] || continue
      release_count=$((release_count + 1))
      candidate_dir=/opt/leselaut/releases/$candidate
      if (( release_count > 3 )) && [[ "$candidate_dir" != "$release_dir" && "$candidate_dir" != "$old_release" ]]; then
        rm -rf -- "$candidate_dir"
      fi
    done < <(find /opt/leselaut/releases -mindepth 1 -maxdepth 1 -type d -printf '%T@ %f\n' | sort -nr | awk '{print $2}')
    echo "Release $release_id healthy"
    exit 0
  fi
  sleep 2
done
# Roll back application code, never restore an older learner database over new
# writes. Migrations must remain additive and backward compatible.
systemctl stop leselaut
if test -n "$old_release" && test -d "$old_release"; then
  ln -sfn "$old_release" /opt/leselaut/current
  systemctl start leselaut
fi
echo 'New release failed readiness; previous code restored where available.' >&2
exit 1
