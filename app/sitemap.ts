import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/pricing", "/privacy", "/terms", "/cookies"].map((path) => ({ url: `${APP_URL}${path}` }));
}
