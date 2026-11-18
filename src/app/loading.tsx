import rejilla from "@/components/Rejilla.module.css";
import estilos from "./estados.module.css";

/** Esqueleto con las mismas proporciones que el contenido real (CLS = 0). */
export default function Cargando() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Cargando personajes…
      </p>
      <div className={estilos.esqueletoTitulo} />
      <div className={estilos.esqueletoTexto} />
      <div className={estilos.esqueletoFiltros} />
      <ul className={rejilla.rejilla} aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i} className={estilos.esqueletoTarjeta}>
            <div className={estilos.esqueletoFoto} />
            <div className={estilos.esqueletoLinea} />
            <div className={estilos.esqueletoLineaCorta} />
          </li>
        ))}
      </ul>
    </div>
  );
}
