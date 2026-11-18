import type { MetadataRoute } from "next";
import { urlSitio } from "@/lib/sitio";

export default function robots(): MetadataRoute.Robots {
  const base = urlSitio().origin;
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/aleatorio", "/favoritos"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
