import type { MetadataRoute } from "next";
import { urlSitio } from "@/lib/sitio";

/** Lista base + los primeros personajes (los más visitados de la serie). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = urlSitio().origin;
  const personajes = Array.from({ length: 20 }, (_, i) => ({
    url: `${base}/personaje/${i + 1}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [{ url: `${base}/`, changeFrequency: "daily", priority: 1 }, ...personajes];
}
