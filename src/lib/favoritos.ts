/**
 * Favoritos en localStorage como «almacén externo» para useSyncExternalStore.
 * - `leer()` devuelve SIEMPRE la misma referencia mientras no cambie el dato
 *   (si no, React entra en un bucle de renderizado).
 * - `suscribir()` escucha el evento `storage` (otras pestañas) y un evento
 *   propio (misma pestaña, porque `storage` no se dispara en la que escribe).
 * - Todo acceso a localStorage va en try/catch: si está bloqueado, los
 *   favoritos viven solo en memoria durante la sesión.
 */

export const CLAVE = "r3:favoritos";
const EVENTO_LOCAL = "r3:favoritos-cambio";
const MAXIMO = 500;

const VACIO: readonly number[] = Object.freeze([]);

let memoria: readonly number[] = VACIO;
let ultimoTexto: string | null | undefined;
let ultimoValor: readonly number[] = VACIO;

/** Valida lo guardado: solo enteros positivos, sin repetir. Cualquier basura → []. */
export function parsear(texto: string | null): readonly number[] {
  if (!texto) return VACIO;
  try {
    const datos: unknown = JSON.parse(texto);
    if (!Array.isArray(datos)) return VACIO;
    const ids = datos.filter((x): x is number => Number.isSafeInteger(x) && x > 0);
    return Object.freeze([...new Set(ids)].slice(0, MAXIMO));
  } catch {
    return VACIO;
  }
}

function almacen(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** ¿Se puede guardar de forma persistente? */
export function disponible(): boolean {
  const ls = almacen();
  if (!ls) return false;
  try {
    const prueba = `${CLAVE}:prueba`;
    ls.setItem(prueba, "1");
    ls.removeItem(prueba);
    return true;
  } catch {
    return false;
  }
}

/** Snapshot del cliente: ids favoritos (referencia estable). */
export function leer(): readonly number[] {
  const ls = almacen();
  let texto: string | null;
  try {
    if (!ls) return memoria;
    texto = ls.getItem(CLAVE);
  } catch {
    return memoria;
  }
  if (texto !== ultimoTexto) {
    ultimoTexto = texto;
    ultimoValor = parsear(texto);
  }
  return ultimoValor;
}

/** Snapshot del servidor: siempre vacío (evita el error de hidratación). */
export function leerServidor(): readonly number[] {
  return VACIO;
}

function avisar() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENTO_LOCAL));
}

/** Reemplaza la lista completa. */
export function escribir(ids: readonly number[]): void {
  const limpios = parsear(JSON.stringify(ids));
  memoria = limpios;
  const ls = almacen();
  try {
    if (limpios.length === 0) ls?.removeItem(CLAVE);
    else ls?.setItem(CLAVE, JSON.stringify(limpios));
  } catch {
    // localStorage bloqueado o lleno: queda en memoria.
    ultimoTexto = undefined;
    ultimoValor = limpios;
  }
  avisar();
}

export function esFavorito(id: number, ids: readonly number[] = leer()): boolean {
  return ids.includes(id);
}

/** Agrega o quita un id. Devuelve `true` si quedó como favorito. */
export function alternar(id: number): boolean {
  const actuales = leer();
  const queda = !actuales.includes(id);
  escribir(queda ? [...actuales, id] : actuales.filter((x) => x !== id));
  return queda;
}

export function quitar(id: number): void {
  escribir(leer().filter((x) => x !== id));
}

export function limpiar(): void {
  escribir([]);
}

/** Se suscribe a los cambios; devuelve la función para cancelar. */
export function suscribir(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const alCambiarStorage = (evento: StorageEvent) => {
    if (evento.key === null || evento.key === CLAVE) callback();
  };
  window.addEventListener("storage", alCambiarStorage);
  window.addEventListener(EVENTO_LOCAL, callback);
  return () => {
    window.removeEventListener("storage", alCambiarStorage);
    window.removeEventListener(EVENTO_LOCAL, callback);
  };
}

/** Solo para pruebas: reinicia el estado en memoria. */
export function reiniciarParaPruebas(): void {
  memoria = VACIO;
  ultimoTexto = undefined;
  ultimoValor = VACIO;
}
