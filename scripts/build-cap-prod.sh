#!/usr/bin/env bash
# PRODUCTION build of the Capacitor native app.
#
# Identical to build-cap.sh, but points the app at the PRODUCTION Supabase
# project ("Cool Reading Story") instead of talepop-staging. Next.js does not
# override environment variables that are already set in the process env, so the
# NEXT_PUBLIC_* values exported here take precedence over the staging values in
# .env.local. Everything below is a PUBLIC client value (safe to commit).
#
# Usage:  ./scripts/build-cap-prod.sh   then   npx cap sync ios
set -euo pipefail

export NEXT_PUBLIC_SUPABASE_URL="https://ushahpjykpqysdpuvwra.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_dWU7F1FNkn0mBc0fi-fjEQ_VOJ33t0h"
export NEXT_PUBLIC_SITE_URL="https://www.talepopstories.com"
# NEXT_PUBLIC_REVENUECAT_IOS_KEY is the same for sandbox + production, so it is
# left to inherit from .env.local.

echo "→ PRODUCTION build → $NEXT_PUBLIC_SUPABASE_URL"
exec "$(cd "$(dirname "$0")" && pwd)/build-cap.sh"
