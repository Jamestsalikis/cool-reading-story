import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/stories', '/api/'] },
    sitemap: 'https://cool-reading-story.vercel.app/sitemap.xml',
  };
}
