import Image from "next/image";
import { obtenerEstadisticas } from "@/lib/api";
import { Portal } from "./Portal";
import { Contador } from "./Contador";
import estilos from "./Heroe.module.css";

/** Avatares oficiales que sirve la propia API (ids 1–5: la familia Smith-Sanchez). */
const ORBITA = [1, 2, 3, 4, 5].map((id) => ({
  id,
  src: `https://rickandmortyapi.com/api/character/avatar/${id}.jpeg`,
}));

export async function Heroe() {
  const totales = await obtenerEstadisticas().catch(() => null);

  return (
    <section className={estilos.heroe} aria-labelledby="titulo-principal">
      <div className={estilos.texto}>
        <p className={estilos.antetitulo}>Explorador del multiverso</p>
        <h1 id="titulo-principal" className={estilos.titulo}>
          Personajes de <span className={estilos.resaltado}>Rick and Morty</span>
        </h1>
        <p className={estilos.lead}>
          Busque por nombre, filtre por estado, especie o género y guarde sus favoritos. Todo queda
          en la dirección: compártala o recárguela y verá lo mismo.
        </p>
        {totales && (
          <dl className={estilos.cifras}>
            <div>
              <dt>Personajes</dt>
              <dd>
                <Contador hasta={totales.personajes} />
              </dd>
            </div>
            <div>
              <dt>Ubicaciones</dt>
              <dd>
                <Contador hasta={totales.ubicaciones} />
              </dd>
            </div>
            <div>
              <dt>Episodios</dt>
              <dd>
                <Contador hasta={totales.episodios} />
              </dd>
            </div>
          </dl>
        )}
      </div>

      <div className={estilos.escena} aria-hidden="true">
        <Portal className={estilos.portal} />
        <ul className={estilos.orbita}>
          {ORBITA.map(({ id, src }, i) => (
            <li key={id} style={{ "--i": i } as React.CSSProperties}>
              <Image src={src} alt="" width={96} height={96} sizes="96px" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
