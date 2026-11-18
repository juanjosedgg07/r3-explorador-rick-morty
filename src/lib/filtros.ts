import type { Filtros } from "./tipos";

export const ESTADOS = ["alive", "dead", "unknown"] as const;
export const GENEROS = ["female", "male", "genderless", "unknown"] as const;

/** Especies más comunes de la API (el filtro acepta cualquier texto). */
export const ESPECIES = [
  "Human",
  "Alien",
  "Humanoid",
  "Robot",
  "Animal",
  "Mythological Creature",
  "Poopybutthole",
  "Cronenberg",
  "Disease",
  "unknown",
] as const;

export const ETIQUETA_ESTADO: Record<string, string> = {
  alive: "Vivo",
  dead: "Muerto",
  unknown: "Desconocido",
};

export const ETIQUETA_GENERO: Record<string, string> = {
  female: "Femenino",
  male: "Masculino",
  genderless: "Sin género",
  unknown: "Desconocido",
};

type Valor = string | string[] | number | undefined | null;
export type ParametrosCrudos = Record<string, Valor>;

/** Toma el primer valor si viene repetido (`?name=a&name=b`) y recorta espacios. */
export function primero(valor: Valor): string {
  if (Array.isArray(valor)) return primero(valor[0]);
  if (valor === undefined || valor === null) return "";
  return String(valor).trim();
}

/** Convierte cualquier texto en una página válida (entero ≥ 1). */
export function leerPagina(texto: Valor): number {
  const limpio = primero(texto);
  if (!/^\d+$/.test(limpio)) return 1;
  const numero = Number.parseInt(limpio, 10);
  return Number.isSafeInteger(numero) && numero >= 1 ? numero : 1;
}

function permitido(valor: string, lista: readonly string[]): string | undefined {
  const minuscula = valor.toLowerCase();
  return lista.includes(minuscula) ? minuscula : undefined;
}

/** Lee y valida los parámetros de la URL; descarta los valores no permitidos. */
export function leerFiltros(parametros: ParametrosCrudos): Filtros {
  const name = primero(parametros.name).slice(0, 80);
  const species = primero(parametros.species).slice(0, 60);
  const filtros: Filtros = {
    name: name || undefined,
    status: permitido(primero(parametros.status), ESTADOS),
    species: species || undefined,
    gender: permitido(primero(parametros.gender), GENEROS),
    page: leerPagina(parametros.page),
  };
  return filtros;
}

/**
 * Construye la query string (sin «?») con `URLSearchParams`:
 * omite vacíos, descarta valores no permitidos y omite `page=1`.
 */
export function construirQuery(filtros: ParametrosCrudos | Filtros): string {
  const validos = leerFiltros(filtros as ParametrosCrudos);
  const query = new URLSearchParams();
  if (validos.name) query.set("name", validos.name);
  if (validos.status) query.set("status", validos.status);
  if (validos.species) query.set("species", validos.species);
  if (validos.gender) query.set("gender", validos.gender);
  if (validos.page && validos.page > 1) query.set("page", String(validos.page));
  return query.toString();
}

/** Ruta de la lista con esos filtros: «/» o «/?name=rick&page=2». */
export function rutaLista(filtros: ParametrosCrudos | Filtros): string {
  const query = construirQuery(filtros);
  return query ? `/?${query}` : "/";
}

/** ¿Hay algún filtro activo (sin contar la página)? */
export function hayFiltros(filtros: Filtros): boolean {
  return Boolean(filtros.name || filtros.status || filtros.species || filtros.gender);
}
