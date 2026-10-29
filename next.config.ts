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
  // /pricing, /faq and /safety used to 404. Until they have pages of their own,
  // send them to the matching homepage sections. Temporary (307) on purpose so a
  // real page can replace them later without browsers caching the redirect.
  // A proper Safety page is still needed; /safety lands on the "For the
  // grown-ups" section (id="safety"), which covers ads, tracking and data.
  async redirects() {
    return [
      { source: '/pricing', destination: '/#pricing', permanent: false },
      { source: '/faq', destination: '/#faq', permanent: false },
      { source: '/safety', destination: '/#safety', permanent: false },
    ];
  },
  outputFileTracingIncludes: {
    "/api/generate-story": ["./lib/sample-stories/**/*.json"],
  },
};

export default nextConfig;
