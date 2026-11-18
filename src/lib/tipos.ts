export type Estado = "Alive" | "Dead" | "unknown";
export type Genero = "Female" | "Male" | "Genderless" | "unknown";

export interface Lugar {
  name: string;
  url: string;
}

export interface Personaje {
  id: number;
  name: string;
  status: Estado;
  species: string;
  type: string;
  gender: Genero;
  origin: Lugar;
  location: Lugar;
  image: string;
  episode: string[];
  url: string;
  created: string;
}

export interface Episodio {
  id: number;
  name: string;
  air_date: string;
  /** Código de temporada y capítulo, p. ej. «S01E01». */
  episode: string;
  characters: string[];
  url: string;
  created: string;
}

export interface Info {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

export interface Respuesta<T> {
  info: Info;
  results: T[];
}

/** Filtros ya validados que entiende la API. */
export interface Filtros {
  name?: string;
  status?: string;
  species?: string;
  gender?: string;
  page?: number;
}
