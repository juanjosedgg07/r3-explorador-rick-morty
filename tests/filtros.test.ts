import { describe, expect, it } from "vitest";
import {
  construirQuery,
  hayFiltros,
  leerFiltros,
  leerPagina,
  primero,
  rutaLista,
} from "@/lib/filtros";

describe("leerPagina", () => {
  it.each([
    ["abc", 1],
    ["-3", 1],
    ["2", 2],
    ["0", 1],
    ["2.5", 1],
    ["", 1],
    [undefined, 1],
    [["4", "9"], 4],
    ["99999999999999999999", 1],
  ])("leerPagina(%j) → %i", (entrada, esperado) => {
    expect(leerPagina(entrada)).toBe(esperado);
  });
});

describe("construirQuery", () => {
  it("omite los valores vacíos", () => {
    expect(construirQuery({ name: "", status: undefined, species: "  ", gender: null })).toBe("");
  });

  it("descarta los valores no permitidos", () => {
    expect(construirQuery({ status: "xyz", gender: "robot", name: "rick" })).toBe("name=rick");
  });

  it("acepta mayúsculas en los valores permitidos y los normaliza", () => {
    expect(construirQuery({ status: "Alive", gender: "FEMALE" })).toBe(
      "status=alive&gender=female",
    );
  });

  it("codifica caracteres especiales", () => {
    const query = construirQuery({ name: "rick & morty" });
    expect(query).toBe("name=rick+%26+morty");
    expect(new URLSearchParams(query).get("name")).toBe("rick & morty");
  });

  it("incluye la página solo si es mayor que 1", () => {
    expect(construirQuery({ name: "rick", page: 1 })).toBe("name=rick");
    expect(construirQuery({ name: "rick", status: "alive", page: "2" })).toBe(
      "name=rick&status=alive&page=2",
    );
  });

  it("incluye la especie como texto libre", () => {
    expect(construirQuery({ species: "Mythological Creature" })).toBe(
      "species=Mythological+Creature",
    );
  });
});

describe("leerFiltros y utilidades", () => {
  it("toma el primer valor de parámetros repetidos", () => {
    expect(primero(["a", "b"])).toBe("a");
    expect(leerFiltros({ name: ["rick", "morty"] }).name).toBe("rick");
  });

  it("limita la longitud del nombre", () => {
    expect(leerFiltros({ name: "x".repeat(200) }).name).toHaveLength(80);
  });

  it("rutaLista devuelve / sin filtros", () => {
    expect(rutaLista({})).toBe("/");
    expect(rutaLista({ name: "rick", page: 3 })).toBe("/?name=rick&page=3");
  });

  it("hayFiltros ignora la página", () => {
    expect(hayFiltros({ page: 4 })).toBe(false);
    expect(hayFiltros({ gender: "male" })).toBe(true);
  });
});
