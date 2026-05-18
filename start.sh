#!/bin/bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "⏹  Зогсоож байна..."
pkill -f "serve dist" 2>/dev/null
pkill -f "cloudflared" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

echo "🔨 Build хийж байна..."
cd "$(dirname "$0")"
npm run build 2>&1 | tail -2

echo "🚀 Сервер эхлүүлж байна..."
npx serve dist -p 3001 -s > /tmp/serve.log 2>&1 &
sleep 3

echo "🌐 Cloudflare tunnel нээж байна..."
/tmp/cloudflared tunnel --url http://localhost:3001 > /tmp/cf.log 2>&1 &
sleep 10

URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cf.log | head -1)

echo ""
echo "✅ БЭЛЭН!"
echo "================================"
echo "  $URL"
echo "================================"
echo ""
echo "Зогсооход Ctrl+C дарна уу"
wait
