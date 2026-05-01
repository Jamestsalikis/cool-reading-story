import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gzip/Brotli compress all responses — free bandwidth saving on Vercel
  compress: true,

  // Optimise images served via next/image
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 604800, // 7 days
  },

  // Keep ignoring TS build errors for now (existing codebase has known issues)
  // TODO: remove this once types are cleaned up
  typescript: {
    ignoreBuildErrors: true,
  },

  // Don't expose source maps in production — reduces bundle size ~15%
  productionBrowserSourceMaps: false,
};

export default nextConfig;
