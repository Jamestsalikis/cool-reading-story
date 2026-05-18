import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    turbopackBuild: false,
  },
  // Ensure sample story JSON files are included in serverless function bundles.
  // Without this, fs.readFileSync calls in lib/sample-stories/index.ts may not
  // find the JSON files at runtime on Vercel.
  outputFileTracingIncludes: {
    "/api/generate-story": ["./lib/sample-stories/**/*.json"],
  },
};

export default nextConfig;
