import type { NextConfig } from "next";

// BUILD_TARGET=capacitor produces a fully static client bundle (no server) that
// is bundled inside the native app. The default build is the normal Next.js
// server app deployed to Vercel (marketing, API routes, cron, webhooks).
const isCapacitor = process.env.BUILD_TARGET === "capacitor";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  ...(isCapacitor
    ? {
        // Static HTML export → served locally from the app's webDir.
        output: "export",
        // No Next.js Image Optimization server in a static bundle.
        images: { unoptimized: true },
        // Emit /login/index.html etc. so routes resolve under file:// in the webview.
        trailingSlash: true,
        // Static site is written to ./out (default for output: export).
      }
    : {
        // Ensure sample story JSON files are included in serverless function bundles.
        // Without this, fs.readFileSync calls in lib/sample-stories/index.ts may not
        // find the JSON files at runtime on Vercel.
        outputFileTracingIncludes: {
          "/api/generate-story": ["./lib/sample-stories/**/*.json"],
        },
      }),
};

export default nextConfig;
