import { ETIQUETA_ESTADO } from "@/lib/filtros";
import type { Estado as TipoEstado } from "@/lib/tipos";
import estilos from "./Estado.module.css";

/** Estado con texto + forma (no solo color): ● vivo, ✕ muerto, ? desconocido. */
export function Estado({ estado }: { estado: TipoEstado }) {
  const clave = estado.toLowerCase();
  const icono = clave === "alive" ? "●" : clave === "dead" ? "✕" : "?";
  return (
    <span className={estilos.estado} data-estado={clave}>
      <span aria-hidden="true" className={estilos.icono}>
        {icono}
      </span>
      {ETIQUETA_ESTADO[clave] ?? estado}
    </span>
  );
}
