import { describe, expect, it } from "vitest";
import {
  agruparPorTemporada,
  comoArreglo,
  idDesdeUrl,
  idsDeEpisodios,
  leerCodigo,
} from "@/lib/episodios";
import type { Episodio } from "@/lib/tipos";

const episodio = (id: number, codigo: string): Episodio => ({
  id,
  name: `Episodio ${id}`,
  air_date: "December 2, 2013",
  episode: codigo,
  characters: [],
  url: `https://rickandmortyapi.com/api/episode/${id}`,
  created: "",
});

describe("episodios", () => {
  it("idDesdeUrl toma el número final", () => {
    expect(idDesdeUrl("https://rickandmortyapi.com/api/episode/28")).toBe(28);
    expect(idDesdeUrl("https://rickandmortyapi.com/api/episode/7/")).toBe(7);
    expect(idDesdeUrl("https://rickandmortyapi.com/api/episode/abc")).toBeNull();
  });

  it("idsDeEpisodios elimina duplicados y ordena", () => {
    expect(
      idsDeEpisodios([
        "https://rickandmortyapi.com/api/episode/3",
        "https://rickandmortyapi.com/api/episode/1",
        "https://rickandmortyapi.com/api/episode/3",
        "basura",
      ]),
    ).toEqual([1, 3]);
  });

  it("comoArreglo trata objeto, arreglo y nulo", () => {
    expect(comoArreglo({ id: 1 })).toEqual([{ id: 1 }]);
    expect(comoArreglo([{ id: 1 }, { id: 2 }])).toHaveLength(2);
    expect(comoArreglo(null)).toEqual([]);
    expect(comoArreglo(undefined)).toEqual([]);
  });

  it("leerCodigo interpreta S02E07", () => {
    expect(leerCodigo("S02E07")).toEqual({ temporada: 2, capitulo: 7 });
    expect(leerCodigo("especial")).toBeNull();
  });

  it("agruparPorTemporada ordena temporadas y episodios", () => {
    const grupos = agruparPorTemporada([
      episodio(12, "S02E01"),
      episodio(2, "S01E02"),
      episodio(1, "S01E01"),
      episodio(99, "raro"),
    ]);
    expect(grupos.map((g) => g.temporada)).toEqual([0, 1, 2]);
    expect(grupos[1].episodios.map((e) => e.id)).toEqual([1, 2]);
  });
});
