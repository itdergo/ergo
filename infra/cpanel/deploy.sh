#!/usr/bin/env bash
# =============================================================================
# ERGO Contracts — cPanel deploy
#
# Builds every workspace, uploads the static frontend to public_html and the
# Node.js app to its application directory, then restarts Passenger.
# No Docker, no image registry — cPanel is shared Apache hosting.
#
# Usage:
#   ./infra/cpanel/deploy.sh                 # build + upload + restart
#   ./infra/cpanel/deploy.sh --build-only    # build locally, no upload
#   ./infra/cpanel/deploy.sh --dry-run       # show what would transfer
#   ./infra/cpanel/deploy.sh --seed          # also run `npm run seed` remotely
#   ./infra/cpanel/deploy.sh --delete        # prune remote files no longer present
#                                            # (off by default — public_html may
#                                            # hold .well-known/ and other apps)
#
# Configuration (override via environment):
#   CPANEL_HOST  ssh target, e.g. ergoco@server.ergo.com.ph   [required]
#   PUBLIC_HTML  remote path served by www.ergo.com.ph         [public_html]
#   APP_DIR      remote path of the Node.js app root           [ergo-api]
#
# Prerequisites: ssh + rsync access to the host, and a Node.js app already
# created in cPanel > Setup Node.js App. See infra/cpanel/README.md.
# =============================================================================
set -euo pipefail

CPANEL_HOST="${CPANEL_HOST:-}"
PUBLIC_HTML="${PUBLIC_HTML:-public_html}"
APP_DIR="${APP_DIR:-ergo-api}"

BUILD_ONLY=0
DRY_RUN=0
SEED=0
DELETE=0

for arg in "$@"; do
  case "$arg" in
    --build-only) BUILD_ONLY=1 ;;
    --dry-run)    DRY_RUN=1 ;;
    --seed)       SEED=1 ;;
    --delete)     DELETE=1 ;;
    -h|--help)    sed -n '2,25p' "$0"; exit 0 ;;
    *) echo "error: unknown flag '$arg'" >&2; exit 2 ;;
  esac
done

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

log() { printf '\n\033[1;32m==>\033[0m %s\n' "$*"; }
die() { printf '\n\033[1;31merror:\033[0m %s\n' "$*" >&2; exit 1; }

# -----------------------------------------------------------------------------
# 1. Build
# -----------------------------------------------------------------------------
log "Building all workspaces (shared -> database -> backend -> frontend)"
npm run build

[[ -f frontend/dist/public/index.html ]] \
  || die "frontend build missing frontend/dist/public/index.html"
[[ -f backend/dist/index.mjs ]] \
  || die "backend build missing backend/dist/index.mjs"

if [[ "$BUILD_ONLY" -eq 1 ]]; then
  log "Build complete (--build-only). Artifacts:"
  printf '    frontend -> %s\n' "frontend/dist/public"
  printf '    backend  -> %s\n' "backend/dist/index.mjs"
  exit 0
fi

# -----------------------------------------------------------------------------
# 2. Preflight for upload
# -----------------------------------------------------------------------------
[[ -n "$CPANEL_HOST" ]] || die "CPANEL_HOST is not set (e.g. CPANEL_HOST=user@server.ergo.com.ph)"
command -v rsync >/dev/null || die "rsync is not installed locally"
command -v ssh   >/dev/null || die "ssh is not installed locally"

RSYNC_FLAGS=(-az --human-readable)
[[ "$DELETE" -eq 1 ]] && RSYNC_FLAGS+=(--delete)
[[ "$DRY_RUN" -eq 1 ]] && RSYNC_FLAGS+=(--dry-run --itemize-changes)

# -----------------------------------------------------------------------------
# 3. Frontend -> public_html
# -----------------------------------------------------------------------------
log "Uploading frontend to ${CPANEL_HOST}:${PUBLIC_HTML}/"
rsync "${RSYNC_FLAGS[@]}" \
  --exclude '.DS_Store' \
  frontend/dist/public/ "${CPANEL_HOST}:${PUBLIC_HTML}/"

log "Uploading .htaccess"
HTACCESS_FLAGS=(-az --human-readable)
[[ "$DRY_RUN" -eq 1 ]] && HTACCESS_FLAGS+=(--dry-run)
rsync "${HTACCESS_FLAGS[@]}" \
  infra/cpanel/.htaccess "${CPANEL_HOST}:${PUBLIC_HTML}/.htaccess"

# -----------------------------------------------------------------------------
# 4. Node app -> application directory
# -----------------------------------------------------------------------------
# The frontend is served statically, so frontend/dist and the local node_modules
# are excluded; the server installs its own production dependencies.
log "Uploading application to ${CPANEL_HOST}:${APP_DIR}/"
rsync "${RSYNC_FLAGS[@]}" \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude 'frontend/dist' \
  --exclude 'test-results' \
  --exclude 'playwright-report' \
  --exclude '_image-masters' \
  --exclude 'uploads' \
  --exclude '*.tsbuildinfo' \
  ./ "${CPANEL_HOST}:${APP_DIR}/"

# -----------------------------------------------------------------------------
# 5. Install production deps + restart Passenger
# -----------------------------------------------------------------------------
if [[ "$DRY_RUN" -eq 1 ]]; then
  log "Dry run — skipping remote install/restart."
  exit 0
fi

log "Installing production dependencies on the server"
ssh "$CPANEL_HOST" "cd ~/${APP_DIR} && npm ci --omit=dev"

if [[ "$SEED" -eq 1 ]]; then
  log "Seeding the database (idempotent)"
  ssh "$CPANEL_HOST" "cd ~/${APP_DIR} && npm run seed"
fi

log "Restarting the Node.js app (Passenger)"
ssh "$CPANEL_HOST" "mkdir -p ~/${APP_DIR}/tmp && touch ~/${APP_DIR}/tmp/restart.txt"

log "Done. Verify:"
printf '    https://www.ergo.com.ph/\n'
printf '    https://www.ergo.com.ph/api/healthz\n'
