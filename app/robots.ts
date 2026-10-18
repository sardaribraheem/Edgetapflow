import type { MetadataRoute } from 'next';
import { APP_URL } from '@/lib/site';
export const dynamic = 'force-static';
export default function robots(): MetadataRoute.Robots {
  // Crawlers must be able to read private/profile pages' noindex directives.
  // Authentication, RLS and private Storage permissions protect the actual data.
  return {rules:{userAgent:'*',allow:'/'},sitemap:`${APP_URL}/sitemap.xml`};
}
