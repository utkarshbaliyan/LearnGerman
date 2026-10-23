#!/usr/bin/env bash
set -euo pipefail
export LESELAUT_BUILD_TARGET=aws
node scripts/run-bounded.mjs 5m 10s node_modules/.bin/vinext build
cp -R drizzle dist/standalone/drizzle
cp deploy/aws/migrate.mjs dist/standalone/migrate.mjs
mkdir -p dist/standalone/operations
cp deploy/aws/retry-deletions.mjs deploy/aws/auth-admin.mjs dist/standalone/operations/
