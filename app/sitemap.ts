import { MetadataRoute } from 'next';
import { SAMPLE_STORIES } from '@/lib/sampleStories';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.talepopstories.com';
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/sample-stories`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ...SAMPLE_STORIES.map((s) => ({
      url: `${base}/sample-stories/${s.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${base}/story-ideas`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
