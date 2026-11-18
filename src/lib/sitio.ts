export const NOMBRE_SITIO = "Explorador Rick and Morty";
export const DESCRIPCION_SITIO =
  "Busque, filtre y guarde sus personajes favoritos de Rick and Morty: estado, especie, origen y todos los episodios en los que aparecen.";

/** URL pública: la de producción en Vercel o localhost en desarrollo. */
export function urlSitio(): URL {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return new URL(vercel ? `https://${vercel}` : "http://localhost:3000");
}
