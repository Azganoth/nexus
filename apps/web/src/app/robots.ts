import { WEB_URL } from "$/lib/constants";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/api/",
    },
    sitemap: `${WEB_URL}/sitemap.xml`,
  };
}
