import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ErrorApi,
  REINTENTOS,
  REVALIDAR_SEGUNDOS,
  esperaReintento,
  contarPersonajes,
  listarPersonajes,
  obtenerEpisodios,
  obtenerPersonaje,
  obtenerPersonajes,
} from "@/lib/api";

function respuesta(cuerpo: unknown, status = 200) {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function simularFetch(...respuestas: Response[]) {
  const espia = vi.fn<typeof fetch>();
  for (const r of respuestas) espia.mockResolvedValueOnce(r);
  vi.stubGlobal("fetch", espia);
  return espia;
}

const urlPedida = (espia: ReturnType<typeof simularFetch>, llamada = 0) =>
  String(espia.mock.calls[llamada][0]);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listarPersonajes", () => {
  it("un 404 («There is nothing here») devuelve una lista vacía", async () => {
    simularFetch(respuesta({ error: "There is nothing here" }, 404));
    const datos = await listarPersonajes({ name: "zzzz" });
    expect(datos.results).toEqual([]);
    expect(datos.info.count).toBe(0);
  });

  it("un 500 lanza un error claro (sin reintentar)", async () => {
    const espia = simularFetch(respuesta({}, 500));
    await expect(listarPersonajes()).rejects.toThrow(ErrorApi);
    expect(espia).toHaveBeenCalledTimes(1);
    simularFetch(respuesta({}, 500));
    await expect(listarPersonajes()).rejects.toThrow(/500/);
  });

  it("reintenta un 429 (límite de la API) y luego responde", async () => {
    vi.useFakeTimers();
    const espia = simularFetch(
      new Response("{}", { status: 429, headers: { "Retry-After": "0" } }),
      respuesta({}, 503),
      respuesta({ info: { count: 1 }, results: [{ id: 1 }] }),
    );
    const promesa = listarPersonajes();
    await vi.runAllTimersAsync();
    expect((await promesa).results).toHaveLength(1);
    expect(espia).toHaveBeenCalledTimes(3);
    vi.useRealTimers();
  });

  it("se rinde tras ${REINTENTOS} reintentos de 429", async () => {
    vi.useFakeTimers();
    const espia = simularFetch(...Array.from({ length: REINTENTOS + 1 }, () => respuesta({}, 429)));
    const promesa = listarPersonajes();
    const verificacion = expect(promesa).rejects.toThrow(/429/);
    await vi.runAllTimersAsync();
    await verificacion;
    expect(espia).toHaveBeenCalledTimes(REINTENTOS + 1);
    vi.useRealTimers();
  });

  it("esperaReintento usa Retry-After o retroceso exponencial con tope", () => {
    expect(esperaReintento(1, "2")).toBe(2000);
    expect(esperaReintento(1, "60")).toBe(3000);
    expect(esperaReintento(1, null)).toBe(300);
    expect(esperaReintento(3, "abc")).toBe(1200);
    expect(esperaReintento(9, null)).toBe(3000);
  });

  it("un fallo de red lanza un error con mensaje en español", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    await expect(listarPersonajes()).rejects.toThrow(/No se pudo conectar/);
  });

  it("propaga la cancelación del llamador", async () => {
    const controlador = new AbortController();
    controlador.abort();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("abort", "AbortError")));
    await expect(listarPersonajes({}, { signal: controlador.signal })).rejects.toThrow("abort");
  });

  it("construye la URL con los filtros válidos y usa la caché de una hora", async () => {
    const espia = simularFetch(respuesta({ info: { count: 1 }, results: [{ id: 1 }] }));
    const datos = await listarPersonajes({ name: "rick", status: "alive", page: 2 });
    expect(urlPedida(espia)).toBe(
      "https://rickandmortyapi.com/api/character/?name=rick&status=alive&page=2",
    );
    expect(espia.mock.calls[0][1]).toMatchObject({ next: { revalidate: REVALIDAR_SEGUNDOS } });
    expect(datos.results).toHaveLength(1);
  });

  it("sin filtros pide /character/", async () => {
    const espia = simularFetch(respuesta({ info: { count: 0 }, results: [] }));
    await listarPersonajes();
    expect(urlPedida(espia)).toBe("https://rickandmortyapi.com/api/character/");
  });
});

describe("obtenerPersonaje", () => {
  it("devuelve el personaje", async () => {
    simularFetch(respuesta({ id: 1, name: "Rick Sanchez" }));
    expect(await obtenerPersonaje(1)).toMatchObject({ name: "Rick Sanchez" });
  });

  it("devuelve null en 404 o con un id que no es número (sin pedir nada)", async () => {
    const espia = simularFetch(respuesta({ error: "Character not found" }, 404));
    expect(await obtenerPersonaje("99999")).toBeNull();
    expect(await obtenerPersonaje("abc")).toBeNull();
    expect(await obtenerPersonaje("0")).toBeNull();
    expect(espia).toHaveBeenCalledTimes(1);
  });
});

describe("obtenerEpisodios", () => {
  it("[1] devuelve un arreglo aunque la API devuelva un objeto", async () => {
    const espia = simularFetch(respuesta({ id: 1, name: "Pilot" }));
    const episodios = await obtenerEpisodios([1]);
    expect(Array.isArray(episodios)).toBe(true);
    expect(episodios).toHaveLength(1);
    expect(urlPedida(espia)).toBe("https://rickandmortyapi.com/api/episode/1");
  });

  it("[1, 2] hace UNA petición y devuelve un arreglo en el orden pedido", async () => {
    const espia = simularFetch(
      respuesta([
        { id: 2, name: "Lawnmower Dog" },
        { id: 1, name: "Pilot" },
      ]),
    );
    const episodios = await obtenerEpisodios([1, 2, 2]);
    expect(espia).toHaveBeenCalledTimes(1);
    expect(urlPedida(espia)).toBe("https://rickandmortyapi.com/api/episode/1,2");
    expect(episodios.map((e) => e.name)).toEqual(["Pilot", "Lawnmower Dog"]);
  });

  it("sin ids no pide nada", async () => {
    const espia = simularFetch();
    expect(await obtenerEpisodios([])).toEqual([]);
    expect(espia).not.toHaveBeenCalled();
  });
});

describe("obtenerPersonajes y contarPersonajes", () => {
  it("pide varios personajes en una sola petición", async () => {
    const espia = simularFetch(respuesta([{ id: 1 }, { id: 2 }]));
    expect(await obtenerPersonajes([1, 2])).toHaveLength(2);
    expect(urlPedida(espia)).toBe("https://rickandmortyapi.com/api/character/1,2");
  });

  it("un 404 en varios devuelve lista vacía", async () => {
    simularFetch(respuesta({ error: "not found" }, 404));
    expect(await obtenerPersonajes([999999])).toEqual([]);
  });

  it("cuenta los personajes", async () => {
    simularFetch(respuesta({ info: { count: 826 }, results: [] }));
    expect(await contarPersonajes()).toBe(826);
    simularFetch(respuesta({}, 404));
    expect(await contarPersonajes()).toBe(0);
  });
});

describe("obtenerEstadisticas", () => {
  it("pide los tres totales en paralelo", async () => {
    const espia = simularFetch(
      respuesta({ info: { count: 826 } }),
      respuesta({ info: { count: 126 } }),
      respuesta({ info: { count: 51 } }),
    );
    const { obtenerEstadisticas } = await import("@/lib/api");
    expect(await obtenerEstadisticas()).toEqual({
      personajes: 826,
      ubicaciones: 126,
      episodios: 51,
    });
    expect(espia).toHaveBeenCalledTimes(3);
  });

  it("un 404 cuenta como 0", async () => {
    simularFetch(respuesta({}, 404), respuesta({}, 404), respuesta({}, 404));
    const { obtenerEstadisticas } = await import("@/lib/api");
    expect(await obtenerEstadisticas()).toEqual({ personajes: 0, ubicaciones: 0, episodios: 0 });
  });
});
