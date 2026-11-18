import { describe, expect, it } from "vitest";
import { textoResultados, ventanaPaginas } from "@/lib/paginas";

describe("ventanaPaginas", () => {
  it("muestra todas si son pocas", () => {
    expect(ventanaPaginas(1, 3)).toEqual([1, 2, 3]);
  });

  it("pone «…» en los huecos", () => {
    expect(ventanaPaginas(6, 42)).toEqual([1, "…", 5, 6, 7, "…", 42]);
  });

  it("rellena un hueco de una sola página con el número", () => {
    expect(ventanaPaginas(3, 6)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("acota una página fuera de rango y maneja total 0", () => {
    expect(ventanaPaginas(99, 4)).toEqual([1, 2, 3, 4]);
    expect(ventanaPaginas(1, 0)).toEqual([]);
  });
});

describe("textoResultados", () => {
  it("singular, plural y vacío", () => {
    expect(textoResultados(0)).toBe("Ningún personaje coincide con esa búsqueda");
    expect(textoResultados(1)).toBe("1 personaje encontrado");
    expect(textoResultados(12)).toBe("12 personajes encontrados");
    expect(textoResultados(826)).toBe("826 personajes encontrados");
  });
});
