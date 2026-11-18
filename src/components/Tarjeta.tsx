import Image from "next/image";
import Link from "next/link";
import type { Personaje } from "@/lib/tipos";
import { BotonFavorito } from "./BotonFavorito";
import { Estado } from "./Estado";
import estilos from "./Tarjeta.module.css";

interface Props {
  personaje: Personaje;
  /** Precarga la imagen (la primera tarjeta suele ser el LCP). */
  prioridad?: boolean;
  /** Nivel del título según la página (sin saltar niveles). */
  nivel?: "h2" | "h3";
  /** Posición en la lista (retraso de la animación de entrada). */
  orden?: number;
}

export const TAMANOS_TARJETA =
  "(min-width: 64rem) 18rem, (min-width: 48rem) 30vw, (min-width: 36rem) 45vw, 92vw";

export function Tarjeta({ personaje, prioridad = false, nivel: Titulo = "h2", orden = 0 }: Props) {
  const { id, name, image, status, species, location, episode } = personaje;
  return (
    <article
      className={estilos.tarjeta}
      data-prioridad={prioridad || undefined}
      style={{ "--orden": Math.min(orden, 12) } as React.CSSProperties}
    >
      <div className={estilos.foto}>
        <Image
          src={image}
          alt={name}
          width={300}
          height={300}
          sizes={TAMANOS_TARJETA}
          preload={prioridad}
          loading={prioridad ? "eager" : "lazy"}
        />
      </div>
      <div className={estilos.cuerpo}>
        <Titulo className={estilos.nombre}>
          {/* El enlace del título cubre toda la tarjeta (::after): un solo enlace real. */}
          <Link href={`/personaje/${id}`} className={estilos.enlace}>
            {name}
          </Link>
        </Titulo>
        <p className={estilos.linea}>
          <Estado estado={status} /> <span className={estilos.especie}>{species}</span>
        </p>
        <p className={estilos.dato}>
          <span className={estilos.etiqueta}>Última ubicación</span> {location.name}
        </p>
        <p className={estilos.dato}>
          <span className={estilos.etiqueta}>Episodios</span> {episode.length}
        </p>
      </div>
      <div className={estilos.favorito}>
        <BotonFavorito id={id} nombre={name} />
      </div>
    </article>
  );
}
