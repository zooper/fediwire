#!/bin/bash
# FediWire Deployment Script

set -e

echo "🔨 Building production version..."
npm run build

echo "📦 Deploying to server..."
scp -r dist/* root@10.63.21.31:/var/www/fediwire/

echo "🔄 Reloading nginx..."
ssh root@10.63.21.31 "systemctl reload nginx"

echo "✅ Deployment complete!"
echo "🌐 Site: https://fediwire.kernel-panic.lol/"
echo ""
echo "Note: If changes don't appear immediately due to Caddy caching:"
echo "  1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)"
echo "  2. Or restart Caddy on proxy server: systemctl restart caddy"
