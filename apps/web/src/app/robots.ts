import { PROD_WEB_URL } from "@repo/shared/constants";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/api/",
    },
    sitemap: `${PROD_WEB_URL}/sitemap.xml`,
  };
}
