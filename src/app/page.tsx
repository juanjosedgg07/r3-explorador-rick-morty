import type { Metadata } from "next";
import { Suspense } from "react";
import { Resultados, ResultadosEsqueleto } from "@/components/Resultados";
import { Filtros } from "@/components/Filtros";
import { Heroe } from "@/components/Heroe";
import { Recientes } from "@/components/Recientes";
import { ETIQUETA_ESTADO, hayFiltros, leerFiltros, rutaLista } from "@/lib/filtros";

export async function generateMetadata({ searchParams }: PageProps<"/">): Promise<Metadata> {
  const filtros = leerFiltros(await searchParams);
  const partes = [
    filtros.name && `«${filtros.name}»`,
    filtros.status && ETIQUETA_ESTADO[filtros.status]?.toLowerCase(),
    filtros.species,
  ].filter(Boolean);
  const titulo = partes.length ? `Personajes: ${partes.join(", ")}` : "Personajes";
  return {
    title: filtros.page && filtros.page > 1 ? `${titulo} (página ${filtros.page})` : titulo,
    alternates: { canonical: rutaLista(filtros) },
    // Las combinaciones de filtros no se indexan; la lista base sí.
    robots: hayFiltros(filtros) ? { index: false, follow: true } : undefined,
  };
}

/**
 * Portada. Lo que no depende de la API (héroe, filtros) se pinta de inmediato;
 * la lista y las cifras llegan en bloques <Suspense> con esqueleto.
 */
export default async function Inicio({ searchParams }: PageProps<"/">) {
  const filtros = leerFiltros(await searchParams);

  return (
    <>
      <Heroe />
      <Recientes />
      <Filtros inicial={filtros} />
      <Suspense fallback={<ResultadosEsqueleto />}>
        <Resultados filtros={filtros} />
      </Suspense>
    </>
  );
}
