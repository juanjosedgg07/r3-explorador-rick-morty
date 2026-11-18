import type { Metadata } from "next";
import Link from "next/link";
import { IconoPlatillo } from "@/components/Iconos";
import estilos from "./estados.module.css";

export const metadata: Metadata = { title: "Página no encontrada" };

export default function NoEncontrada() {
  return (
    <section className={estilos.mensaje} aria-labelledby="titulo-404">
      <IconoPlatillo tamano={80} className={estilos.icono} strokeWidth={1.4} />
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
