import type { Episodio } from "./tipos";

/** «https://…/api/episode/28» → 28. Devuelve `null` si no termina en número. */
export function idDesdeUrl(url: string): number | null {
  const ultimo = url.replace(/\/+$/, "").split("/").at(-1) ?? "";
  return /^\d+$/.test(ultimo) ? Number(ultimo) : null;
}

/** Ids únicos y ordenados a partir de las direcciones de los episodios. */
export function idsDeEpisodios(urls: string[]): number[] {
  const ids = urls.map(idDesdeUrl).filter((id): id is number => id !== null);
  return [...new Set(ids)].sort((a, b) => a - b);
}

/** Normaliza la respuesta de la API: un objeto (un id) o un arreglo (varios). */
export function comoArreglo<T>(datos: T | T[] | null | undefined): T[] {
  if (datos === null || datos === undefined) return [];
  return Array.isArray(datos) ? datos : [datos];
}

/** «S02E07» → { temporada: 2, capitulo: 7 }. */
export function leerCodigo(codigo: string): { temporada: number; capitulo: number } | null {
  const coincidencia = /^S(\d+)E(\d+)$/i.exec(codigo.trim());
  if (!coincidencia) return null;
  return { temporada: Number(coincidencia[1]), capitulo: Number(coincidencia[2]) };
}

export interface Temporada {
  temporada: number;
  episodios: Episodio[];
}

/** Agrupa los episodios por temporada, en orden. Los códigos raros van a la temporada 0. */
export function agruparPorTemporada(episodios: Episodio[]): Temporada[] {
  const grupos = new Map<number, Episodio[]>();
  for (const episodio of episodios) {
    const temporada = leerCodigo(episodio.episode)?.temporada ?? 0;
    grupos.set(temporada, [...(grupos.get(temporada) ?? []), episodio]);
  }
  return [...grupos.entries()]
    .sort(([a], [b]) => a - b)
    .map(([temporada, lista]) => ({
      temporada,
      episodios: [...lista].sort((a, b) => a.id - b.id),
    }));
}
