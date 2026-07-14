#!/usr/bin/env bash
# Build the static client bundle for the Capacitor native app.
#
# Next.js `output: export` cannot coexist with API route handlers or middleware,
# so we move them out of the build tree, run the export, then always restore them
# (even on failure). The export is prerendered, which runs the same code path as
# SSR — so we pin it to node@22 to avoid Node 25's broken `localStorage` global.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Node pinned to match production (Node 25 breaks supabase-js during prerender).
NODE_BIN="/opt/homebrew/opt/node@22/bin"
if [ -d "$NODE_BIN" ]; then
  export PATH="$NODE_BIN:$PATH"
fi
echo "→ Using node $(node -v)"

# Server-only / website-only paths that cannot exist in a static export.
# Each entry is a path relative to the repo root. Restored after the build.
STASH_PATHS=(
  "app/api"                 # POST route handlers (generation, stripe, cron, webhooks)
  "middleware.ts"           # runs on a server only
  "app/auth"                # OAuth callback route handler (web); native uses deep links
  "app/sitemap.ts"          # SEO route handler (website only)
  "app/robots.ts"           # SEO route handler (website only)
  "app/icon.tsx"            # dynamic favicon route (app uses native icons)
)

STASH=".cap-build-stash"
rm -rf "$STASH"
mkdir -p "$STASH"

restore() {
  echo "→ Restoring server-only files"
  local i=0
  for p in "${STASH_PATHS[@]}"; do
    if [ -e "$STASH/$i" ]; then
      mkdir -p "$(dirname "$p")"
      mv "$STASH/$i" "$p"
    fi
    i=$((i + 1))
  done
  rm -rf "$STASH" 2>/dev/null || true
}
trap restore EXIT

echo "→ Stashing server-only / website-only files (not valid in a static export)"
i=0
for p in "${STASH_PATHS[@]}"; do
  if [ -e "$p" ]; then
    echo "   - $p"
    mv "$p" "$STASH/$i"
  fi
  i=$((i + 1))
done

echo "→ Building static export (BUILD_TARGET=capacitor)"
BUILD_TARGET=capacitor node_modules/.bin/next build

echo "→ Syncing export → capacitor/www"
rm -rf capacitor/www
mkdir -p capacitor/www
cp -R out/. capacitor/www/

echo "✓ Capacitor web bundle ready at capacitor/www"
