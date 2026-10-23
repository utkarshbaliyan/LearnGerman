#!/bin/bash
set -euo pipefail
umask 077
source /etc/leselaut/config
test -f /var/lib/leselaut/leselaut.sqlite || exit 0
snapshot=$(mktemp /var/lib/leselaut/backup-XXXXXX.sqlite)
trap 'rm -f "$snapshot"' EXIT
sqlite3 /var/lib/leselaut/leselaut.sqlite ".backup '$snapshot'"
test "$(sqlite3 "$snapshot" 'PRAGMA integrity_check')" = ok
key=database/$(date -u +%Y/%m/%d/%H%M%S)-$(cat /proc/sys/kernel/random/uuid).sqlite
aws s3 cp "$snapshot" "s3://$BACKUP_BUCKET/$key" --sse AES256 --region "$AWS_REGION" --only-show-errors
aws cloudwatch put-metric-data --namespace LeseLaut --metric-data '[{"MetricName":"BackupSucceeded","Dimensions":[{"Name":"Site","Value":"leselaut"}],"Value":1,"Unit":"Count"}]' --region "$AWS_REGION" >/dev/null || true
echo 'Consistent database backup uploaded.'
