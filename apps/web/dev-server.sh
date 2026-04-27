#!/usr/bin/env bash

set -u

echo "Starting Modular Affiliate System - Development Mode"
echo "================================================"

export NODE_ENV=development
export NEXT_DEBUG=1
export DEBUG=*

echo "Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

if [ ! -f .env.local ]; then
  echo "Warning: .env.local not found. Copy from .env.example and configure."
fi

if [ ! -f .env.development ] && [ -f .env.example ]; then
  echo "Creating .env.development from .env.example"
  cp .env.example .env.development
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Running type check..."
npm run type-check || echo "Type check failed. Continuing with dev server."

echo
echo "Starting development server..."
echo "Local:   http://localhost:${PORT:-3000}"
NETWORK_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
if [ -n "${NETWORK_IP}" ]; then
  echo "Network: http://${NETWORK_IP}:${PORT:-3000}"
fi
echo "Press Ctrl+C to stop"
echo "================================================"

exec npx next dev --webpack --port "${PORT:-3000}"
