"use client";

import Image from "next/image";
import { useState, type AnimationEvent } from "react";
import estilos from "./Heroe.module.css";

/**
 * Grupos de personajes (ids de la API) que se turnan en la órbita del portal.
 * En cada vuelta completa entra el grupo siguiente.
 */
export const GRUPOS = [
  [1, 2, 3, 4, 5], // familia Smith-Sanchez
  [47, 242, 244, 265, 118],
  [15, 38, 103, 180, 196],
  [8, 71, 183, 306, 331],
  [372, 394, 435, 584, 664],
] as const;

const avatar = (id: number) => `https://rickandmortyapi.com/api/character/avatar/${id}.jpeg`;

export function OrbitaRotativa() {
  const [grupo, setGrupo] = useState(0);
  const siguiente = (grupo + 1) % GRUPOS.length;

  // Solo el primer avatar avisa al terminar cada vuelta (todos giran juntos).
  function alCompletarVuelta(evento: AnimationEvent<HTMLLIElement>) {
    if (evento.animationName.includes("orbita")) setGrupo(siguiente);
  }

  return (
    <>
      <ul className={estilos.orbita}>
        {GRUPOS[grupo].map((id, i) => (
          <li
            key={i}
            style={{ "--i": i } as React.CSSProperties}
            onAnimationIteration={i === 0 ? alCompletarVuelta : undefined}
          >
            {/* key={id}: al cambiar de grupo la imagen se vuelve a montar y entra con fundido. */}
            <Image
              key={id}
              src={avatar(id)}
              alt=""
              width={96}
              height={96}
              sizes="64px"
              className={estilos.avatar}
            />
          </li>
        ))}
      </ul>
      {/* Precarga discreta del siguiente grupo para que el cambio no parpadee. */}
      <div hidden>
        {GRUPOS[siguiente].map((id) => (
          <Image
            key={id}
            src={avatar(id)}
            alt=""
            width={96}
            height={96}
            sizes="64px"
            loading="eager"
          />
        ))}
      </div>
    </>
  );
}
