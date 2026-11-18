import Link from "next/link";
import { BotonAzar } from "@/components/BotonAzar";
import estilos from "../../estados.module.css";

export default function PersonajeNoEncontrado() {
  return (
    <section className={estilos.mensaje} aria-labelledby="titulo-404-personaje">
      <svg aria-hidden="true" viewBox="0 0 64 64" width="72" height="72" className={estilos.icono}>
        <circle cx="32" cy="24" r="12" fill="none" stroke="currentColor" strokeWidth="4" />
        <path
          d="M12 56c2-11 10-17 20-17s18 6 20 17"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          d="M48 8l10 10M58 8L48 18"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <h1 id="titulo-404-personaje">Personaje no encontrado</h1>
      <p>
        No existe un personaje con ese identificador. Los identificadores son números enteros, por
        ejemplo <Link href="/personaje/1">/personaje/1</Link>.
      </p>
      <div className={estilos.acciones}>
        <Link href="/" className="boton">
          Ver todos los personajes
        </Link>
        <BotonAzar className="boton boton-secundario">Uno al azar</BotonAzar>
      </div>
    </section>
  );
}
