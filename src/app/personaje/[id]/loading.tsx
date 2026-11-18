import { Portal } from "@/components/Portal";
import estilos from "./detalle.module.css";

/** Mientras se carga un personaje: un portal abriéndose. */
export default function CargandoPersonaje() {
  return (
    <div className={estilos.cargando} aria-busy="true">
      <Portal tamano={12} />
      <p role="status" className={estilos.cargandoTexto}>
        Abriendo un portal hacia el personaje…
      </p>
    </div>
  );
}
