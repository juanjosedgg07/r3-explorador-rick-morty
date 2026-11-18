import type { Metadata } from "next";
import Link from "next/link";
import estilos from "./estados.module.css";

export const metadata: Metadata = { title: "Página no encontrada" };

export default function NoEncontrada() {
  return (
    <section className={estilos.mensaje} aria-labelledby="titulo-404">
      <svg aria-hidden="true" viewBox="0 0 64 64" width="72" height="72" className={estilos.icono}>
        <circle
          cx="32"
          cy="32"
          r="27"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="6 5"
        />
        <text x="32" y="39" textAnchor="middle" fontSize="18" fontWeight="800" fill="currentColor">
          404
        </text>
      </svg>
      <h1 id="titulo-404">Esta página se perdió en otra dimensión</h1>
      <p>
        La dirección no existe o cambió. Vuelva a la lista de personajes para seguir explorando.
      </p>
      <div className={estilos.acciones}>
        <Link href="/" className="boton">
          Ver personajes
        </Link>
        <Link href="/favoritos" className="boton boton-secundario">
          Mis favoritos
        </Link>
      </div>
    </section>
  );
}
