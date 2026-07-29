#!/bin/bash
# Auto-heal: monitor VPS2 health and restart cloudflared/nginx if unhealthy
# Runs from VPS1 via cron every 5 minutes.
# VPS2 is reachable via Tailscale at 100.68.154.21.

set -e

VPS2_TAILSCALE="100.68.154.21"
HEALTH_URL="http://${VPS2_TAILSCALE}/health"
LOG_FILE="/var/log/auto-heal.log"
MAX_FAILURES=2
STATE_FILE="/tmp/auto-heal-failures"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE" || true
}

# Check VPS2 health via Tailscale
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -H "Host: lekkerkuier.com" "$HEALTH_URL" 2>/dev/null || echo "000")

if [ "$HEALTH" = "200" ]; then
    # Healthy — reset failure counter
    echo "0" > "$STATE_FILE" || true
    # Only log if previously failing (recovery)
    if [ -s "$LOG_FILE" ]; then
        LAST_LINE=$(tail -1 "$LOG_FILE" 2>/dev/null || true)
        if echo "$LAST_LINE" | grep -q "FAIL\|RESTARTED" 2>/dev/null; then
            log "✅ VPS2 recovered (HTTP $HEALTH)"
        fi
    fi
    exit 0
fi

# Unhealthy — increment failure counter
FAILURES=$(cat "$STATE_FILE" 2>/dev/null || echo 0)
FAILURES=$((FAILURES + 1))
echo "$FAILURES" > "$STATE_FILE"

log "❌ VPS2 unhealthy (HTTP $HEALTH) — failure $FAILURES/$MAX_FAILURES"

if [ "$FAILURES" -ge "$MAX_FAILURES" ]; then
    log "🔄 Attempting to restart services on VPS2..."

    # Restart cloudflared
    if ssh -o ConnectTimeout=10 -o BatchMode=yes "root@${VPS2_TAILSCALE}" "systemctl restart cloudflared" 2>/dev/null; then
        log "✅ cloudflared restarted on VPS2"
    else
        log "⚠️  Failed to restart cloudflared on VPS2 (SSH unreachable?)"
    fi

    # Restart nginx for good measure
    if ssh -o ConnectTimeout=10 -o BatchMode=yes "root@${VPS2_TAILSCALE}" "systemctl restart nginx" 2>/dev/null; then
        log "✅ nginx restarted on VPS2"
    else
        log "⚠️  Failed to restart nginx on VPS2"
    fi

    # Reset failure counter after restart attempt
    echo "0" > "$STATE_FILE"
    log "🔄 Restart complete — will re-check next cycle"
fi

exit 0
