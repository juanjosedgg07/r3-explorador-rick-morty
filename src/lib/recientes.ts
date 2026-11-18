/**
 * «Vistos recientemente»: los últimos personajes abiertos, en localStorage.
 * Mismo patrón que favoritos.ts (snapshot estable, try/catch, evento local).
 */

export const CLAVE_RECIENTES = "r3:recientes";
const EVENTO = "r3:recientes-cambio";
export const MAX_RECIENTES = 8;

export interface Reciente {
  id: number;
  name: string;
  image: string;
}

const VACIO: readonly Reciente[] = Object.freeze([]);
let ultimoTexto: string | null | undefined;
let ultimoValor: readonly Reciente[] = VACIO;

function esReciente(x: unknown): x is Reciente {
  if (typeof x !== "object" || x === null) return false;
  const r = x as Record<string, unknown>;
  return (
    Number.isSafeInteger(r.id) &&
    (r.id as number) > 0 &&
    typeof r.name === "string" &&
    typeof r.image === "string" &&
    r.image.startsWith("https://rickandmortyapi.com/")
  );
}

export function parsearRecientes(texto: string | null): readonly Reciente[] {
  if (!texto) return VACIO;
  try {
    const datos: unknown = JSON.parse(texto);
    return Array.isArray(datos)
      ? Object.freeze(datos.filter(esReciente).slice(0, MAX_RECIENTES))
      : VACIO;
  } catch {
    return VACIO;
  }
}

export function leerRecientes(): readonly Reciente[] {
  let texto: string | null;
  try {
    texto = window.localStorage.getItem(CLAVE_RECIENTES);
  } catch {
    return ultimoValor;
  }
  if (texto !== ultimoTexto) {
    ultimoTexto = texto;
    ultimoValor = parsearRecientes(texto);
  }
  return ultimoValor;
}

export function leerRecientesServidor(): readonly Reciente[] {
  return VACIO;
}

/** Pone al personaje al principio (sin duplicados) y recorta la lista. */
export function registrarVisita(personaje: Reciente): void {
  const nueva = [
    { id: personaje.id, name: personaje.name, image: personaje.image },
    ...leerRecientes().filter((r) => r.id !== personaje.id),
  ].slice(0, MAX_RECIENTES);
  try {
    window.localStorage.setItem(CLAVE_RECIENTES, JSON.stringify(nueva));
  } catch {
    ultimoTexto = undefined;
    ultimoValor = Object.freeze(nueva);
  }
  window.dispatchEvent(new Event(EVENTO));
}

export function borrarRecientes(): void {
  try {
    window.localStorage.removeItem(CLAVE_RECIENTES);
  } catch {
    ultimoTexto = undefined;
    ultimoValor = VACIO;
  }
  window.dispatchEvent(new Event(EVENTO));
}

export function suscribirRecientes(callback: () => void): () => void {
  const alStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === CLAVE_RECIENTES) callback();
  };
  window.addEventListener("storage", alStorage);
  window.addEventListener(EVENTO, callback);
  return () => {
    window.removeEventListener("storage", alStorage);
    window.removeEventListener(EVENTO, callback);
  };
}

/** Solo para pruebas. */
export function reiniciarRecientes(): void {
  ultimoTexto = undefined;
  ultimoValor = VACIO;
}
