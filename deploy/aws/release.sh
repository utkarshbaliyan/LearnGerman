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
# Never extract over code currently serving traffic (including a rerun of a SHA).
if [[ -d "$release_dir" && "$(readlink -f /opt/leselaut/current 2>/dev/null || true)" == "$(readlink -f "$release_dir")" ]]; then
  /usr/local/bin/node "$release_dir/verify-public.mjs" https://leselaut.com "$release_id"
  exit 0
fi
# A previous failed attempt may have left generated files. Extract a fresh tree.
rm -rf -- "$release_dir"
mkdir -p "$release_dir"
aws s3 cp "s3://$ARTIFACT_BUCKET/releases/$release_id.tgz" /tmp/leselaut-release.tgz --region "$AWS_REGION" --only-show-errors
if tar -tzf /tmp/leselaut-release.tgz | grep -Eq '(^/|(^|/)\.\.(/|$))'; then exit 65; fi
tar -xzf /tmp/leselaut-release.tgz --no-same-owner -C "$release_dir"
chmod 755 /opt/leselaut /opt/leselaut/releases "$release_dir"
rm /tmp/leselaut-release.tgz
test -f "$release_dir/server.js"

# Runtime secrets stay in SSM SecureString and a root-only environment file.
# They are never build inputs, tarball contents or GitHub secrets.
runtime_file=$(mktemp /etc/leselaut/runtime-XXXXXX)
if ! aws ssm get-parameter --name /leselaut/runtime --with-decryption --region "$AWS_REGION" --query Parameter.Value --output text > "$runtime_file"; then
  rm -f "$runtime_file"
  exit 1
fi
chmod 600 "$runtime_file"
mv -f "$runtime_file" /etc/leselaut/runtime.env
old_release=''
if test -L /opt/leselaut/current && test -d /opt/leselaut/current; then
  old_release=$(readlink -f /opt/leselaut/current)
fi
# A failed backup or migration must also restore service, not only a failed
# readiness check. Keep the learner database at its latest state in all cases.
restore_service() {
  result=$?
  trap - EXIT
  if (( result != 0 )); then
    set +e
    systemctl stop leselaut
    if test -n "$old_release" && test -d "$old_release"; then
      ln -sfn "$old_release" /opt/leselaut/current
      systemctl start leselaut
    fi
    if test -n "$old_release" && curl --retry 5 --retry-connrefused --retry-delay 2 --connect-timeout 2 --max-time 5 -fsS http://127.0.0.1:3000/api/health >/dev/null; then
      echo 'Deployment failed; previous code restored and database readiness passed. Learner database retained.' >&2
    else
      echo 'Deployment failed; rollback readiness NOT confirmed. Inspect the service through SSM.' >&2
    fi
  fi
  exit "$result"
}
trap restore_service EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
systemctl stop leselaut || true
if test -f /var/lib/leselaut/leselaut.sqlite; then /usr/local/bin/leselaut-backup; fi
LESELAUT_SQLITE_PATH=/var/lib/leselaut/leselaut.sqlite /usr/local/bin/node "$release_dir/migrate.mjs"
chown leselaut:leselaut /var/lib/leselaut/leselaut.sqlite*
ln -sfn "$release_dir" /opt/leselaut/current
systemctl start leselaut
for attempt in $(seq 1 45); do
  if curl --connect-timeout 2 --max-time 5 -fsS http://127.0.0.1:3000/api/health | grep -Fq "\"release\":\"$release_id\""; then
    # Keep public checks inside the rollback trap, while holding the deploy lock.
    /usr/local/bin/node "$release_dir/verify-public.mjs" https://leselaut.com "$release_id"
    /usr/local/bin/node "$release_dir/verify-public.mjs" https://d19k6l47v6hw3.cloudfront.net "$release_id"
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
echo 'New release failed readiness.' >&2
exit 1
