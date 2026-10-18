import type { MetadataRoute } from 'next';
import { APP_URL } from '@/lib/site';
import { INDEXABLE_PATHS } from '@/lib/seo';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  // No profiles or private routes. No guessed lastmod/changefreq/priority values.
  return INDEXABLE_PATHS.map(path => ({url:new URL(path,APP_URL).href}));
}
