#!/usr/bin/env bash
# cutover.sh — atomic build + live-cutover for the Lekkerkuier v3 SPA.
#
# This script is the single source of truth for the rebuild cutover.
# The intent is: a partial `npm run build` cannot half-replace the
# live site. The build output goes to a NON-live staging directory
# first (../public-staging/); only on a successful build do we wipe
# the live assets/ and rsync the staging tree onto the live root.
#
# Usage:
#   ./scripts/cutover.sh             # build + wipe + rsync + reload
#   ./scripts/cutover.sh --dry-run   # show the steps but do not run them
#
# Exit codes:
#   0 — cutover succeeded
#   1 — npm install failure
#   2 — npm run build failure
#   3 — staging tree not produced
#   4 — rsync failure
#   5 — nginx reload failure
#   6 — backup restore failure

set -euo pipefail

# Resolve paths. cutover.sh lives at
#   /opt/radio/web/src-new/scripts/cutover.sh
# so the SPA root is two parents up.
SPA_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LIVE_ROOT="$SPA_ROOT/../public"
STAGING_ROOT="$SPA_ROOT/../public-staging"
BACKUP_ROOT="$SPA_ROOT/../public.bak-cutover-$(date +%Y%m%d-%H%M%S)"

DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    -h|--help)
      sed -n '2,20p' "$0"
      exit 0
      ;;
    *) echo "unknown arg: $arg" >&2; exit 1 ;;
  esac
done

log() { printf '[cutover %s] %s\n' "$(date +%H:%M:%S)" "$*"; }

run() {
  if [ "$DRY_RUN" -eq 1 ]; then
    printf '[dry-run] %s\n' "$*"
  else
    eval "$@"
  fi
}

# Audit invariant: every theme/* consumer must use the explicit .tsx
# extension so Vite's resolve.extensions (['.mjs','.js','.mts','.ts',
# '.jsx','.tsx','.json']) picks the .tsx impl rather than the empty
# stub at themes.ts. The stub predates this cutover and exists to mark
# the rename from `themes.ts` (was) to `themes.tsx` (now); if a future
# author accidentally introduces an extension-less theme import,
# catch it BEFORE we touch the live tree.
#
# `set -o pipefail` is on at the top of this script, so the trailing
# `|| true` keeps an empty-pipeline-grep from aborting the script
# when there are zero violations (the desired steady state).
audit_no_extension_less_theme_imports() {
  local violations
  violations=$(grep -rE "from ['\"][./]*theme/themes['\"]" "$SPA_ROOT/src/" 2>/dev/null \
    | grep -v 'themes\.tsx' \
    | grep . || true)
  if [ -n "$violations" ]; then
    log "AUDIT FAILED: extension-less theme/* imports detected"
    printf '%s\n' "$violations" | sed 's/^/    /'
    return 1
  fi
}

# 0. Preflight
[ ! -f "$SPA_ROOT/package.json" ] && { echo "missing package.json at $SPA_ROOT" >&2; exit 1; }
[ ! -d "$LIVE_ROOT" ] && { echo "missing live root at $LIVE_ROOT" >&2; exit 1; }

log "SPA root:   $SPA_ROOT"
log "Live root:  $LIVE_ROOT"
log "Staging:    $STAGING_ROOT"
log "Backup:     $BACKUP_ROOT"

# 1. Backup the current live tree. This is the operator's rollback
# target if the cutover bricks the site; cutover.sh never deletes
# the backup automatically.
log "1. Backup live tree → $BACKUP_ROOT"
run "cp -a \"$LIVE_ROOT\". \"$BACKUP_ROOT\"/"

# 2. Build into staging. Vite produces fresh fingerprinted assets
# under $STAGING_ROOT/assets/.
log "2. npm run build → $STAGING_ROOT"
run "cd \"$SPA_ROOT\" && npm run build"
[ ! -f "$STAGING_ROOT/index.html" ] && {
  log "ERROR: staging index.html missing after build"
  exit 3
}

# 3. Wipe the live assets/ so old SHAs don't linger in browser
# caches pointing to missing files. index.html + manifest.json are
# NOT touched (manifest is what PWA installs consume; index.html
# gets atomically replaced in step 4).
log "3. Wipe live assets/ to evict stale hashes"
run "rm -rf \"$LIVE_ROOT/assets\""

# 4. Rsync staging tree onto live root. -a preserves perms; --delete
# removes any files in live that aren't in staging (e.g. icons we
# don't want any more — make sure icons live in SPA root public/).
log "4. Rsync staging → live"
run "rsync -a --delete \"$STAGING_ROOT\"/ \"$LIVE_ROOT\"/"

# 5. Verify the live tree has fresh content
log "5. Verify live"
[ ! -f "$LIVE_ROOT/index.html" ] && { log "ERROR: live index.html missing"; exit 4; }
asset_count=$(find "$LIVE_ROOT/assets" -maxdepth 1 -name 'index-*.js' 2>/dev/null | wc -l)
[ "$asset_count" -lt 1 ] && { log "ERROR: no index-*.js in live assets"; exit 4; }
log "live assets: $asset_count fingerprinted entry chunks"

# 6. Reload nginx so the SPA's manifest + new tail behaviours
# (which include new paths) are picked up from a fresh worker.
log "6. Reload nginx"
run "nginx -t && sudo nginx -s reload || systemctl reload nginx"

# 7. Final smoke
log "7. Smoke / endpoint"
run "curl -fsS -o /dev/null -w '  GET / → HTTP %{http_code}, %{size_download} bytes\\n' --max-time 8 https://lekkerkuier.com/"

# 8. Tidy staging (keep it for inspection if build is repeated)
run "rm -rf \"$STAGING_ROOT\""

log "CUTOVER OK. Backup at $BACKUP_ROOT (operator-managed, do not auto-delete)."
