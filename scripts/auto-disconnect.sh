#!/bin/bash
# Auto-disconnect: kick DJs when their scheduled show ends
# Runs from VPS1 via cron every minute.
# Uses the AzuraCast API directly on 127.0.0.1:8443.

set -e

API_BASE="https://127.0.0.1:8443/api"
API_KEY="a6acb1bd58608448:3b48bc3dc682f7516d49b8f2bdf553e1"
STATION_ID="1"
LOG_FILE="/var/log/auto-disconnect.log"
STATE_FILE="/tmp/auto-disconnect-state"
HOST_HEADER="lekkerkuier.com"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S %Z')] $1" | tee -a "$LOG_FILE" || true
}

# ─── Check if a DJ is live ──────────────────────────────
NOWPLAYING=$(curl -sk --max-time 10 \
    -H "Host: $HOST_HEADER" \
    "$API_BASE/nowplaying" 2>/dev/null || echo "[]")

IS_LIVE=$(echo "$NOWPLAYING" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data and len(data) > 0:
        live = data[0].get('live', {})
        if live.get('is_live'):
            print(live.get('streamer_name', ''))
        else:
            print('')
    else:
        print('')
except:
    print('')
" 2>/dev/null)

if [ -z "$IS_LIVE" ]; then
    exit 0  # No live DJ — nothing to do
fi

log "🎧 Live DJ detected: $IS_LIVE"

# Get current day and time in station timezone (Africa/Johannesburg)
NOW_DAY=$(TZ=Africa/Johannesburg date +%A | tr '[:upper:]' '[:lower:]')
NOW_TIME=$(TZ=Africa/Johannesburg date +%H:%M)

# ─── Anti-flap: skip if already disconnected this minute ─
LAST_DISCONNECT=$(cat "$STATE_FILE" 2>/dev/null || echo "")
if [ "$LAST_DISCONNECT" = "$NOW_TIME" ]; then
    log "  ⏭️  Already disconnected at $NOW_TIME — skipping"
    exit 0
fi

# ─── Fetch schedule, find shows that just ended ─────────
SCHEDULE=$(curl -sk --max-time 10 \
    -H "Host: $HOST_HEADER" \
    -H "Authorization: Bearer $API_KEY" \
    "$API_BASE/station/$STATION_ID/schedule" 2>/dev/null || echo "[]")

# Find shows ending now — pass IS_LIVE as env var to avoid shell injection
MATCHED_SHOW=$(echo "$SCHEDULE" | STREAMER_NAME="$IS_LIVE" python3 -c "
import sys, json, os
try:
    shows = json.load(sys.stdin)
except:
    shows = []

now_day = '$NOW_DAY'
now_time = '$NOW_TIME'
streamer = os.environ.get('STREAMER_NAME', '')

for show in shows:
    show_day = show.get('day_of_week', '').lower()
    show_end = show.get('end_time', '')
    show_dj = show.get('streamer_name', show.get('dj_name', ''))

    if not show_day or not show_end:
        continue

    if show_day == now_day and show_end == now_time:
        print(json.dumps({
            'id': show.get('id', ''),
            'title': show.get('title', ''),
            'dj': show_dj,
            'end': show_end,
            'matches_streamer': show_dj.lower() == streamer.lower()
        }))
        break
" 2>/dev/null)

if [ -z "$MATCHED_SHOW" ]; then
    # No show ending right now — check if DJ has been live too long (>12h maybe stuck)
    log "  ℹ️  No scheduled show ending at $NOW_TIME — DJ may be unscheduled"
    exit 0
fi

SHOW_TITLE=$(echo "$MATCHED_SHOW" | python3 -c "import sys,json; print(json.load(sys.stdin).get('title',''))" 2>/dev/null)
SHOW_DJ=$(echo "$MATCHED_SHOW" | python3 -c "import sys,json; print(json.load(sys.stdin).get('dj',''))" 2>/dev/null)
MATCHES=$(echo "$MATCHED_SHOW" | python3 -c "import sys,json; print(json.load(sys.stdin).get('matches_streamer',''))" 2>/dev/null)

log "  📅 Show ending: '$SHOW_TITLE' by $SHOW_DJ (matches streamer: $MATCHES)"

# ─── Only disconnect if the live streamer matches the scheduled DJ ─
if [ "$MATCHES" != "true" ]; then
    log "  ⏭️  Scheduled DJ ($SHOW_DJ) does not match live streamer ($IS_LIVE) — skipping"
    exit 0
fi

# ─── Disconnect ─────────────────────────────────────────
DISCONNECT_RESULT=$(curl -sk --max-time 15 \
    -X POST \
    -H "Host: $HOST_HEADER" \
    -H "Authorization: Bearer $API_KEY" \
    "$API_BASE/station/$STATION_ID/backend/disconnect" 2>&1)

HTTP_CODE=$(echo "$DISCONNECT_RESULT" | head -1 || echo "unknown")

if echo "$DISCONNECT_RESULT" | grep -qi "success\|ok\|200\|204"; then
    log "  ✅ DJ '$IS_LIVE' disconnected — '$SHOW_TITLE' ended at $NOW_TIME"
    echo "$NOW_TIME" > "$STATE_FILE"
else
    log "  ⚠️  Disconnect may have failed: $HTTP_CODE"
fi

exit 0
