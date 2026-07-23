import type { MetadataRoute } from "next";
import { AI_CRAWLER_USER_AGENTS, PRIVATE_PATHS, SITE_URL } from "@/lib/seo/config";

export default function robots(): MetadataRoute.Robots {
  const disallow = PRIVATE_PATHS.map((p) => `${p}/`);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", ...disallow],
      },
      // Explicit allow for GEO — answer-engine retrievers respect their own
      // named UA even when a wildcard rule already allows "*".
      {
        userAgent: [...AI_CRAWLER_USER_AGENTS],
        allow: "/",
        disallow: ["/api/", ...disallow],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
