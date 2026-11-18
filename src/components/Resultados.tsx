import Link from "next/link";
import { listarPersonajes } from "@/lib/api";
import { hayFiltros } from "@/lib/filtros";
import { textoResultados } from "@/lib/paginas";
import type { Filtros } from "@/lib/tipos";
import { Paginacion } from "./Paginacion";
import { Tarjeta } from "./Tarjeta";
import rejilla from "./Rejilla.module.css";
import estilos from "@/app/inicio.module.css";

/** RF-01: la lista se pide EN EL SERVIDOR con los filtros de la URL. */
export async function Resultados({ filtros }: { filtros: Filtros }) {
  const pagina = filtros.page ?? 1;
  const { info, results } = await listarPersonajes(filtros);
  const filtrado = hayFiltros(filtros);

  return (
    <>
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

/** Esqueleto con las proporciones de la rejilla real (CLS = 0). */
export function ResultadosEsqueleto() {
  return (
    <div aria-busy="true">
      <p role="status" className={estilos.estado}>
        Buscando personajes…
      </p>
      <ul className={rejilla.rejilla} aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i} className={estilos.esqueletoTarjeta} />
        ))}
      </ul>
    </div>
  );
}
