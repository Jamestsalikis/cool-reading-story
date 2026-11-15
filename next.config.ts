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
  // /download and /get used to 404. They now go to the /app smart link.
  // Next keeps the query string on redirects, so UTMs and fbclid survive.
  async redirects() {
    return [
      { source: '/download', destination: '/app', permanent: false },
      { source: '/get', destination: '/app', permanent: false },
    ];
  },
  outputFileTracingIncludes: {
    "/api/generate-story": ["./lib/sample-stories/**/*.json"],
  },
};

export default nextConfig;
