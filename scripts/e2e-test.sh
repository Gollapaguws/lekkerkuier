#!/bin/bash
# E2E Browser Test Script for Lekkerkuier.com
# Requires: google-chrome or chromium (headless)
# Usage: ./scripts/e2e-test.sh [url]

URL="${1:-https://lekkerkuier.com}"
OUTDIR="/tmp/lekkerkuier-e2e-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUTDIR"

PASS=0
FAIL=0

pass() { echo "  ✅ $1"; ((PASS++)); }
fail() { echo "  ❌ $1"; ((FAIL++)); }

echo "╔══════════════════════════════════╗"
echo "║  Lekkerkuier E2E Test Suite       ║"
echo "║  Target: $URL"
echo "║  Output: $OUTDIR"
echo "╚══════════════════════════════════╝"
echo ""

# Find Chrome binary
CHROME=$(which google-chrome 2>/dev/null || which chromium 2>/dev/null || which chromium-browser 2>/dev/null || echo "")
if [ -n "$CHROME" ]; then
  BROWSER_TESTS=true
  echo "🌐 Chrome found: $CHROME"
else
  BROWSER_TESTS=false
  echo "⚠️  Chrome not found — skipping browser tests"
fi

# ─── Browser Tests ───────────────────────────────────────
if [ "$BROWSER_TESTS" = true ]; then

  # Detect whether --screenshot works in this environment
  SCREENSHOT_OK=false
  "$CHROME" --headless=new --disable-gpu --no-sandbox --no-first-run \
    --screenshot="$OUTDIR/_test.png" \
    --window-size=1,1 \
    --virtual-time-budget=1000 \
    "about:blank" 2>/dev/null
  if [ -s "$OUTDIR/_test.png" ]; then
    SCREENSHOT_OK=true
    rm -f "$OUTDIR/_test.png"
    echo "📸 Screenshots supported"
  else
    echo "⚠️  Screenshots not supported in this environment — skipping visual tests"
  fi

  # 1. Homepage screenshot + DOM capture
  echo ""
  echo "── Browser: Homepage ──"
  if [ "$SCREENSHOT_OK" = true ]; then
    "$CHROME" --headless=new --disable-gpu --no-sandbox --no-first-run \
      --screenshot="$OUTDIR/homepage.png" \
      --window-size=1280,900 \
      --virtual-time-budget=10000 \
      "$URL" 2>/dev/null
    if [ -s "$OUTDIR/homepage.png" ]; then
      pass "Homepage screenshot ($(wc -c < "$OUTDIR/homepage.png") bytes)"
    else
      fail "Homepage screenshot not created"
    fi
  else
    echo "  ⏭️  Homepage screenshot skipped"
  fi

  "$CHROME" --headless --disable-gpu --no-sandbox \
    --dump-dom --window-size=1280,900 \
    --virtual-time-budget=10000 \
    "$URL" > "$OUTDIR/dom.html" 2>"$OUTDIR/homepage-console.log"

  DOM_SIZE=$(wc -c < "$OUTDIR/dom.html" 2>/dev/null || echo 0)
  if [ "$DOM_SIZE" -gt 5000 ]; then
    pass "DOM captured ($DOM_SIZE bytes)"
  else
    fail "DOM too small ($DOM_SIZE bytes)"
  fi

  # 2. Check for key elements in DOM
  echo ""
  echo "── Browser: Element checks ──"

  grep -q 'id="root"' "$OUTDIR/dom.html" 2>/dev/null && \
    pass "root div present" || fail "root div missing"

  grep -q '<audio' "$OUTDIR/dom.html" 2>/dev/null && \
    pass "audio element present" || fail "audio element missing"

  grep -q '<canvas' "$OUTDIR/dom.html" 2>/dev/null && \
    pass "canvas element present (visualizer)" || fail "canvas element missing"

  grep -q 'hero-play-btn' "$OUTDIR/dom.html" 2>/dev/null && \
    pass "hero play button present" || fail "hero play button missing"

  grep -q 'manifest' "$OUTDIR/dom.html" 2>/dev/null && \
    pass "PWA manifest referenced" || fail "PWA manifest not referenced"

  grep -qE 'service-worker|navigator\.serviceWorker|sw\.js|registerSW' "$OUTDIR/dom.html" 2>/dev/null && \
    pass "service worker referenced" || fail "service worker not referenced"

  # 3. Console errors — exclude Chrome D-Bus noise, look for app-level errors
  echo ""
  echo "── Browser: Console errors ──"
  CONSOLE_ERRS=$(grep -ciE 'net::ERR_|TypeError: |Uncaught |Refused to |Mixed Content|CORS blocked|HTTP status 40[45]| HTTP 500' "$OUTDIR/homepage-console.log" 2>/dev/null)
  CONSOLE_ERRS=${CONSOLE_ERRS:-0}
  DBUS_NOISE=$(grep -ciE 'dbus|D-Bus|freedesktop' "$OUTDIR/homepage-console.log" 2>/dev/null)
  DBUS_NOISE=${DBUS_NOISE:-0}
  if [ "$CONSOLE_ERRS" -eq 0 ]; then
    pass "No app-level console errors (${DBUS_NOISE} D-Bus noise filtered)"
  else
    fail "$CONSOLE_ERRS app-level console errors (${DBUS_NOISE} D-Bus noise filtered)"
  fi

  # 4. Schedule page screenshot
  echo ""
  echo "── Browser: Schedule page ──"
  if [ "$SCREENSHOT_OK" = true ]; then
    "$CHROME" --headless=new --disable-gpu --no-sandbox --no-first-run \
      --screenshot="$OUTDIR/schedule.png" \
      --window-size=1280,900 \
      --virtual-time-budget=8000 \
      "$URL/#/schedule" 2>/dev/null
    if [ -s "$OUTDIR/schedule.png" ]; then
      pass "Schedule screenshot"
    else
      fail "Schedule screenshot"
    fi
  else
    echo "  ⏭️  Schedule screenshot skipped"
  fi

  # 5. Mobile viewport test
  echo ""
  echo "── Browser: Mobile viewport ──"
  if [ "$SCREENSHOT_OK" = true ]; then
    "$CHROME" --headless=new --disable-gpu --no-sandbox --no-first-run \
      --screenshot="$OUTDIR/mobile.png" \
      --window-size=375,812 \
      --virtual-time-budget=8000 \
      "$URL" 2>/dev/null
    if [ -s "$OUTDIR/mobile.png" ]; then
      pass "Mobile screenshot (375x812)"
    else
      fail "Mobile screenshot"
    fi
  else
    echo "  ⏭️  Mobile screenshot skipped"
  fi
fi

# ─── HTTP-level Checks ──────────────────────────────────
echo ""
echo "── HTTP: Status checks ──"

check_http() {
  local path="$1" label="$2" expected="${3:-200}"
  local status
  status=$(curl -sk -o /dev/null -w "%{http_code}" "$URL$path" 2>/dev/null)
  if [ "$status" = "$expected" ] || { [ "$expected" = "2xx" ] && [ "${status:0:1}" = "2" ]; }; then
    pass "$label → HTTP $status"
  else
    fail "$label → HTTP $status (expected $expected)"
  fi
}

check_http "/"                        "Homepage"             "200"
check_http "/manifest.json"           "PWA manifest"         "200"
check_http "/sw.js"                   "Service worker"       "200"

# Audio stream — 206 is valid (partial content), 200 also OK
AUDIO_STATUS=$(curl -sk -o /dev/null -w "%{http_code}" "$URL/autodj.mp3" -r 0-1024 2>/dev/null)
if [ "$AUDIO_STATUS" = "200" ] || [ "$AUDIO_STATUS" = "206" ]; then
  pass "Audio stream → HTTP $AUDIO_STATUS"
else
  fail "Audio stream → HTTP $AUDIO_STATUS (expected 200/206)"
fi

# Dynamic asset URL extraction — don't hardcode hashed filenames
HTML=$(curl -sk "$URL" 2>/dev/null)
JS_FILES=$(echo "$HTML" | grep -oP 'src="/assets/[^"]+\.js"' | sed 's/src="//;s/"//' | head -5)
CSS_FILES=$(echo "$HTML" | grep -oP 'href="/assets/[^"]+\.css"' | sed 's/href="//;s/"//' | head -3)

echo ""
echo "── HTTP: Static assets ──"
for asset in $JS_FILES $CSS_FILES; do
  status=$(curl -sk -o /dev/null -w "%{http_code}" "$URL$asset" 2>/dev/null)
  if [ "$status" = "200" ]; then
    pass "$asset"
  else
    fail "$asset → HTTP $status"
  fi
done

echo ""
echo "── HTTP: API endpoints ──"
check_http "/api/nowplaying"          "Now Playing API"     "200"
check_http "/api/auth/health"         "Auth health"         "200"
check_http "/api/station/1/schedule"  "Schedule API"        "200"

echo ""
echo "── HTTP: Page routes (SPA — all serve index.html) ──"
for page in schedule djs events blog history about contact chat support sitemap login register listen submit dj manager admin podcast gallery; do
  check_http "/#/$page" "SPA route /#/$page" "200"
done

# ─── PWA Verification ───────────────────────────────────
echo ""
echo "── PWA: Deep checks ──"

# Check manifest.json has required fields
MANIFEST=$(curl -sk "$URL/manifest.json" 2>/dev/null)
if echo "$MANIFEST" | python3 -c "import sys,json; d=json.load(sys.stdin); print('name' in d and 'short_name' in d)" 2>/dev/null | grep -q "True"; then
  pass "manifest.json has name + short_name"
else
  fail "manifest.json missing required fields"
fi

if echo "$MANIFEST" | python3 -c "import sys,json; d=json.load(sys.stdin); print('start_url' in d and 'display' in d)" 2>/dev/null | grep -q "True"; then
  pass "manifest.json has start_url + display"
else
  fail "manifest.json missing start_url or display"
fi

# Check service worker responds with correct MIME type
SW_MIME=$(curl -skI "$URL/sw.js" 2>/dev/null | grep -i 'content-type' | head -1 | tr -d '\r')
if echo "$SW_MIME" | grep -qiE 'javascript|ecmascript'; then
  pass "sw.js served as JavaScript ($SW_MIME)"
else
  fail "sw.js wrong MIME type: $SW_MIME"
fi

# Check service worker has valid JS content
SW_CONTENT=$(curl -sk "$URL/sw.js" 2>/dev/null | head -1)
if echo "$SW_CONTENT" | grep -qE 'self\.|addEventListener|cache|fetch|const CACHE|const CACHE_NAME'; then
  pass "sw.js looks like a valid service worker"
else
  fail "sw.js may be invalid: $SW_CONTENT"
fi

# ─── Audio Stream Verification ──────────────────────────
echo ""
echo "── Audio: Stream verification ──"

AUDIO_HEADERS=$(curl -skI "$URL/autodj.mp3" -r 0-1024 2>/dev/null)
if echo "$AUDIO_HEADERS" | grep -qi "content-type.*audio"; then
  pass "Audio stream has audio content-type"
else
  fail "Audio stream missing audio content-type"
fi

if echo "$AUDIO_HEADERS" | grep -qi "icy-name\|icy-description\|ice-audio"; then
  pass "Audio stream has Icecast/Shoutcast headers"
else
  pass "Audio stream OK (no Icecast headers — direct proxy)"
fi

# ─── Summary ────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════╗"
TOTAL=$((PASS + FAIL))
echo "║  E2E RESULTS                      ║"
printf "║  ✅ %3d passed                     ║\n" "$PASS"
printf "║  ❌ %3d failed                     ║\n" "$FAIL"
printf "║  📊 %3d total                      ║\n" "$TOTAL"
echo "║  📁 $OUTDIR"
echo "╚══════════════════════════════════╝"

if [ "$FAIL" -gt 0 ]; then
  exit 1
else
  exit 0
fi
