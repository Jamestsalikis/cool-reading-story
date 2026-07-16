#!/usr/bin/env bash
# Build the static bundle for the Capacitor native app from the standalone
# app-native/ project, and sync it into capacitor/www.
#
# app-native/ is a self-contained Next app (output: export) with no server
# routes, so this is a plain build — no file stashing. The web app at the repo
# root is never involved.
#
# Prerendering runs the same code path as SSR, so we pin node@22 to avoid Node
# 25's broken `localStorage` global tripping up supabase-js.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/app-native"

NODE_BIN="/opt/homebrew/opt/node@22/bin"
if [ -d "$NODE_BIN" ]; then export PATH="$NODE_BIN:$PATH"; fi
echo "→ Using node $(node -v)"

# Ensure the shared, uncommitted symlinks exist (node_modules + env come from the
# repo root; public is a committed symlink but recreate defensively).
cd "$APP"
[ -e node_modules ] || ln -sfn ../node_modules node_modules
[ -e .env.local ]   || ln -sfn ../.env.local .env.local
[ -e public ]       || ln -sfn ../public public

echo "→ Building app-native static export"
rm -rf .next out
node_modules/.bin/next build

if [ ! -d out ]; then echo "✗ Export did not produce app-native/out" >&2; exit 1; fi

echo "→ Syncing export → capacitor/www"
rm -rf "$ROOT/capacitor/www"
mkdir -p "$ROOT/capacitor/www"
cp -RL out/. "$ROOT/capacitor/www/"

echo "✓ Capacitor web bundle ready at capacitor/www"
