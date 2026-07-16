import type { NextConfig } from "next";

// Standalone native-app front end. Builds a fully static export that is bundled
// inside the Capacitor app (served from webDir). No server, no API routes, no
// middleware — it talks directly to Supabase + the app-generate edge function.
// This project is intentionally separate from the web app at the repo root.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true, // emit /login/index.html etc. for file:// serving in the webview
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
