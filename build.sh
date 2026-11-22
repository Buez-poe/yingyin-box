#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export BUILD_COMMIT="${BUILD_COMMIT:-$(git rev-parse --short=12 HEAD 2>/dev/null || echo local)}"
node tools/build.mjs .
