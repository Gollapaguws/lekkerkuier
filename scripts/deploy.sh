#!/bin/bash
# Deploy React SPA to both VPSs
# Usage: ./scripts/deploy.sh

set -e

VPS2="root@100.68.154.21"
WEB_DIR="/var/www/lekkerkuier"
SRC_DIR="/root/lekkerkuier-preserved/src-new"
PUBLIC_DIR="/root/lekkerkuier-preserved/public-staging"

echo "🔨 Building React SPA..."
cd "$SRC_DIR"
npm run build 2>&1

echo "📦 Build complete — output in $PUBLIC_DIR/..."

# Vite builds directly to ../public-staging; no dist copy needed
echo "🚀 Deploying to VPS1..."
rm -rf "$WEB_DIR"/*
cp -r "$PUBLIC_DIR"/* "$WEB_DIR/"
chown -R www-data:www-data "$WEB_DIR"
nginx -s reload 2>/dev/null || systemctl reload nginx

echo "🚀 Deploying to VPS2 ($VPS2)..."
rsync -avz --delete "$PUBLIC_DIR/" "$VPS2:$WEB_DIR/" 2>&1
ssh "$VPS2" 'chown -R www-data:www-data /var/www/lekkerkuier && nginx -s reload 2>/dev/null || systemctl reload nginx'

echo "✅ Deployed to both VPSs"
