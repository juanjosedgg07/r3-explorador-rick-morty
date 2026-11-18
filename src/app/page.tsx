import type { Metadata } from "next";
import Link from "next/link";
import { Filtros } from "@/components/Filtros";
import { Heroe } from "@/components/Heroe";
import { Recientes } from "@/components/Recientes";
import { Paginacion } from "@/components/Paginacion";
import { Tarjeta } from "@/components/Tarjeta";
import { listarPersonajes } from "@/lib/api";
import { ETIQUETA_ESTADO, hayFiltros, leerFiltros, rutaLista } from "@/lib/filtros";
import { textoResultados } from "@/lib/paginas";
import rejilla from "@/components/Rejilla.module.css";
import estilos from "./inicio.module.css";

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

/** RF-01: la lista se pide EN EL SERVIDOR con los parámetros de la URL. */
export default async function Inicio({ searchParams }: PageProps<"/">) {
  const filtros = leerFiltros(await searchParams);
  const pagina = filtros.page ?? 1;
  const { info, results } = await listarPersonajes(filtros);
  const filtrado = hayFiltros(filtros);

  return (
    <>
      <Heroe />
      <Recientes />

      <Filtros inicial={filtros} />

      {/* Anuncio para lectores de pantalla cada vez que cambian los resultados. */}
      <p role="status" aria-live="polite" aria-atomic="true" className={estilos.estado}>
        {textoResultados(info.count)}
        {info.count > 0 && info.pages > 1 && (
          <span className="sr-only">
            , página {pagina} de {info.pages}
          </span>
        )}
      </p>

      {results.length === 0 ? (
        <section className={estilos.vacio} aria-labelledby="titulo-vacio">
          <svg
            aria-hidden="true"
            viewBox="0 0 64 64"
            width="72"
            height="72"
            className={estilos.vacioIcono}
          >
            <circle cx="28" cy="28" r="18" fill="none" stroke="currentColor" strokeWidth="4" />
            <path d="M41 41l14 14" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            <path
              d="M21 24h.01M35 24h.01M21 35c4-3 10-3 14 0"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <h2 id="titulo-vacio">Ningún personaje coincide con esa búsqueda</h2>
          <p>
            {pagina > 1 && !filtrado
              ? `La página ${pagina} no existe.`
              : "Pruebe con otro nombre o quite algún filtro. La búsqueda por nombre acepta coincidencias parciales (por ejemplo, «smi» encuentra a Morty Smith)."}
          </p>
          <Link href="/" className="boton">
            Limpiar los filtros
          </Link>
        </section>
      ) : (
        <ul className={rejilla.rejilla} aria-label="Resultados">
          {results.map((personaje, i) => (
            <li key={personaje.id}>
              <Tarjeta personaje={personaje} prioridad={i === 0} orden={i} />
            </li>
          ))}
        </ul>
      )}

      <Paginacion filtros={filtros} pagina={pagina} paginas={info.pages} total={info.count} />
    </>
  );
}
