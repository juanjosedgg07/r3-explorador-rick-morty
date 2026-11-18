import Link from "next/link";
import { BotonAzar } from "@/components/BotonAzar";
import { IconoPlatillo } from "@/components/Iconos";
import estilos from "../../estados.module.css";

export default function PersonajeNoEncontrado() {
  return (
    <section className={estilos.mensaje} aria-labelledby="titulo-404-personaje">
      <IconoPlatillo tamano={80} className={estilos.icono} strokeWidth={1.4} />
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
