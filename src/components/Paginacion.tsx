import Link from "next/link";
import { rutaLista } from "@/lib/filtros";
import { ventanaPaginas } from "@/lib/paginas";
import type { Filtros } from "@/lib/tipos";
import { IconoSalto } from "./Iconos";
import estilos from "./Paginacion.module.css";

interface Props {
  filtros: Filtros;
  pagina: number;
  paginas: number;
  total: number;
}

/** Paginación con enlaces reales que conservan los filtros. */
export function Paginacion({ filtros, pagina, paginas, total }: Props) {
  if (paginas <= 1) return null;
  const href = (p: number) => rutaLista({ ...filtros, page: p });
  const hayAnterior = pagina > 1;
  const haySiguiente = pagina < paginas;
  const numero = new Intl.NumberFormat("es-CO");

  return (
    <nav aria-label="Paginación" className={`${estilos.paginacion} no-imprimir`}>
      <p className={estilos.resumen}>
        Página <strong>{pagina}</strong> de <strong>{paginas}</strong> · {numero.format(total)}{" "}
        resultados
      </p>
      <ul className={estilos.lista}>
        <li>
          {hayAnterior ? (
            <Link href={href(pagina - 1)} rel="prev" className={estilos.paso}>
              <IconoSalto direccion="izquierda" tamano={18} /> Anterior
            </Link>
          ) : (
            <span className={estilos.paso} aria-disabled="true">
              <IconoSalto direccion="izquierda" tamano={18} /> Anterior
            </span>
          )}
        </li>
        {ventanaPaginas(pagina, paginas).map((p, i) =>
          p === "…" ? (
            <li key={`hueco-${i}`} className={estilos.hueco} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={p} className={estilos.numeroItem}>
              <Link
                href={href(p)}
                className={estilos.numero}
                aria-current={p === pagina ? "page" : undefined}
                aria-label={`Página ${p}`}
              >
                {p}
              </Link>
            </li>
          ),
        )}
        <li>
          {haySiguiente ? (
            <Link href={href(pagina + 1)} rel="next" className={estilos.paso}>
              Siguiente <IconoSalto tamano={18} />
            </Link>
          ) : (
            <span className={estilos.paso} aria-disabled="true">
              Siguiente <IconoSalto tamano={18} />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
