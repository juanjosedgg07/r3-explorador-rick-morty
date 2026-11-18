import { construirQuery } from "./filtros";
import { comoArreglo } from "./episodios";
import type { Episodio, Filtros, Personaje, Respuesta } from "./tipos";

export const API = "https://rickandmortyapi.com/api";

/** Una hora en la caché de datos de Next.js (RF-08). */
export const REVALIDAR_SEGUNDOS = 3600;

/** Tiempo máximo de espera por petición antes de rendirse. */
const LIMITE_MS = 10_000;

export class ErrorApi extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ErrorApi";
  }
}

export const RESPUESTA_VACIA: Respuesta<Personaje> = Object.freeze({
  info: { count: 0, pages: 0, next: null, prev: null },
  results: [],
}) as Respuesta<Personaje>;

interface Opciones {
  signal?: AbortSignal;
}

/**
 * Pide JSON a la API. Devuelve `null` si responde 404 (el llamador decide si es
 * «vacío» o «no encontrado») y lanza `ErrorApi` en cualquier otro fallo.
 */
async function pedir<T>(ruta: string, { signal }: Opciones = {}): Promise<T | null> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${API}${ruta}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDAR_SEGUNDOS },
      signal: signal ?? AbortSignal.timeout(LIMITE_MS),
    });
  } catch (causa) {
    if (signal?.aborted) throw causa;
    throw new ErrorApi("No se pudo conectar con la API de Rick and Morty. Revise su conexión.", 0);
  }
  if (respuesta.status === 404) return null;
  if (!respuesta.ok) {
    throw new ErrorApi(
      `La API de Rick and Morty respondió con un error (${respuesta.status}).`,
      respuesta.status,
    );
  }
  return (await respuesta.json()) as T;
}

/** Lista paginada y filtrada. Un 404 («There is nothing here») es una lista vacía. */
export async function listarPersonajes(
  filtros: Filtros = {},
  opciones?: Opciones,
): Promise<Respuesta<Personaje>> {
  const query = construirQuery(filtros);
  const datos = await pedir<Respuesta<Personaje>>(
    `/character/${query ? `?${query}` : ""}`,
    opciones,
  );
  return datos ?? RESPUESTA_VACIA;
}

function idValido(id: number | string): number | null {
  const texto = String(id).trim();
  if (!/^\d+$/.test(texto)) return null;
  const numero = Number(texto);
  return numero >= 1 && Number.isSafeInteger(numero) ? numero : null;
}

/** Un personaje, o `null` si el id no es un número válido o no existe. */
export async function obtenerPersonaje(
  id: number | string,
  opciones?: Opciones,
): Promise<Personaje | null> {
  const valido = idValido(id);
  if (valido === null) return null;
  return pedir<Personaje>(`/character/${valido}`, opciones);
}

function idsLimpios(ids: Array<number | string>): number[] {
  const validos = ids.map(idValido).filter((id): id is number => id !== null);
  return [...new Set(validos)];
}

/** Varios recursos con UNA sola petición (`/recurso/1,2,3`), siempre como arreglo. */
async function obtenerVarios<T extends { id: number }>(
  recurso: "character" | "episode",
  ids: Array<number | string>,
  opciones?: Opciones,
): Promise<T[]> {
  const limpios = idsLimpios(ids);
  if (limpios.length === 0) return [];
  const datos = await pedir<T | T[]>(`/${recurso}/${limpios.join(",")}`, opciones);
  const lista = comoArreglo(datos);
  // La API puede devolverlos en otro orden: se respeta el orden pedido.
  const orden = new Map(limpios.map((id, posicion) => [id, posicion]));
  return [...lista].sort((a, b) => (orden.get(a.id) ?? 0) - (orden.get(b.id) ?? 0));
}

/** Nombres de episodios en una sola petición; trata el caso de un único episodio. */
export function obtenerEpisodios(
  ids: Array<number | string>,
  opciones?: Opciones,
): Promise<Episodio[]> {
  return obtenerVarios<Episodio>("episode", ids, opciones);
}

/** Varios personajes en una sola petición (para /favoritos). */
export function obtenerPersonajes(
  ids: Array<number | string>,
  opciones?: Opciones,
): Promise<Personaje[]> {
  return obtenerVarios<Personaje>("character", ids, opciones);
}

/** Total de personajes de la API (para «Personaje al azar»). */
export async function contarPersonajes(opciones?: Opciones): Promise<number> {
  const datos = await pedir<Respuesta<Personaje>>("/character", opciones);
  return datos?.info.count ?? 0;
}

export interface Estadisticas {
  personajes: number;
  ubicaciones: number;
  episodios: number;
}

/** Totales del multiverso con `Promise.all` (tres peticiones en paralelo, en caché 1 h). */
export async function obtenerEstadisticas(opciones?: Opciones): Promise<Estadisticas> {
  const contar = async (recurso: string) =>
    (await pedir<{ info: { count: number } }>(`/${recurso}`, opciones))?.info.count ?? 0;
  const [personajes, ubicaciones, episodios] = await Promise.all([
    contar("character"),
    contar("location"),
    contar("episode"),
  ]);
  return { personajes, ubicaciones, episodios };
}
