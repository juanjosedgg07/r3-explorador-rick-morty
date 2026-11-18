import type { MetadataRoute } from "next";
import { DESCRIPCION_SITIO, NOMBRE_SITIO } from "@/lib/sitio";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: NOMBRE_SITIO,
    short_name: "Rick & Morty",
    description: DESCRIPCION_SITIO,
    lang: "es",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1016",
    theme_color: "#0b1016",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
