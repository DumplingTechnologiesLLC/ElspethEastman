#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ ! -f public/build/index.html || ! -f node_modules/@playwright/test/cli.js ]]; then
  echo 'Run yarn install --frozen-lockfile and yarn build before the Docker suite.' >&2
  exit 1
fi
docker build --platform linux/amd64 -f e2e/Dockerfile -t elspeth-playwright .
options=(--env CI)
if [[ -n "${E2E_DATABASE_URL:-}" ]]; then
  options+=(--network host --env E2E_DATABASE_URL)
fi
docker run --rm --init --ipc=host --platform linux/amd64 \
  "${options[@]}" \
  --mount "type=bind,source=$PWD,target=/app" \
  elspeth-playwright node node_modules/@playwright/test/cli.js test "$@"
