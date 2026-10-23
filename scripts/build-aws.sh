#!/usr/bin/env bash
set -euo pipefail
export LESELAUT_BUILD_TARGET=aws
node scripts/run-bounded.mjs 5m 10s node_modules/.bin/vinext build
cp -R drizzle dist/standalone/drizzle
cp deploy/aws/migrate.mjs dist/standalone/migrate.mjs
