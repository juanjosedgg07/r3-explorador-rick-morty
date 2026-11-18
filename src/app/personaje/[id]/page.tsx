import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { BotonFavorito } from "@/components/BotonFavorito";
import { Compartir } from "@/components/Compartir";
import { Estado } from "@/components/Estado";
import { RegistrarVisita } from "@/components/Recientes";
import { contarPersonajes, obtenerEpisodios, obtenerPersonaje } from "@/lib/api";
import { agruparPorTemporada, idDesdeUrl, idsDeEpisodios } from "@/lib/episodios";
import { ETIQUETA_GENERO } from "@/lib/filtros";
import { NOMBRE_SITIO } from "@/lib/sitio";
import estilos from "./detalle.module.css";

// Se comparte entre generateMetadata y la página (una sola petición).
const cargarPersonaje = cache(obtenerPersonaje);

const formatoFecha = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function fechaIso(texto: string): string | undefined {
  const fecha = new Date(`${texto} UTC`);
  return Number.isNaN(fecha.getTime()) ? undefined : fecha.toISOString().slice(0, 10);
}

function fechaLegible(texto: string): string {
  const iso = fechaIso(texto);
  return iso ? formatoFecha.format(new Date(`${iso}T12:00:00Z`)) : texto;
}

const traducir = (valor: string) => (valor === "unknown" ? "Desconocido" : valor);

export async function generateMetadata({
  params,
}: PageProps<"/personaje/[id]">): Promise<Metadata> {
  const { id } = await params;
  const personaje = await cargarPersonaje(id);
  if (!personaje) return { title: "Personaje no encontrado" };
  const descripcion = `${personaje.name}: ${personaje.species}, ${personaje.status === "Alive" ? "vivo" : personaje.status === "Dead" ? "muerto" : "estado desconocido"}. Origen: ${traducir(personaje.origin.name)}. Aparece en ${personaje.episode.length} episodios.`;
  return {
    title: personaje.name,
    description: descripcion,
    alternates: { canonical: `/personaje/${personaje.id}` },
    openGraph: {
      title: `${personaje.name} · ${NOMBRE_SITIO}`,
      description: descripcion,
      images: [{ url: personaje.image, width: 300, height: 300, alt: personaje.name }],
    },
  };
}

/** RF-05: personaje + nombres de episodios con UNA sola petición a /episode/1,2,3. */
export default async function DetallePersonaje({ params }: PageProps<"/personaje/[id]">) {
  const { id } = await params;
  const personaje = await cargarPersonaje(id);
  if (!personaje) notFound();

  const [episodios, totalPersonajes] = await Promise.all([
    obtenerEpisodios(idsDeEpisodios(personaje.episode)),
    contarPersonajes().catch(() => 0),
  ]);
  const temporadas = agruparPorTemporada(episodios);
  const { name, image, status, species, type, gender, origin, location } = personaje;
  const anterior = personaje.id > 1 ? personaje.id - 1 : null;
  const siguiente =
    totalPersonajes === 0 || personaje.id < totalPersonajes ? personaje.id + 1 : null;
  const primero = episodios[0];
  const ultimo = episodios.at(-1);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    image,
    gender,
    description: `${species}${type ? ` (${type})` : ""} de la serie Rick and Morty`,
    homeLocation: { "@type": "Place", name: origin.name },
  };

  return (
    <article className={estilos.detalle}>
      <RegistrarVisita personaje={{ id: personaje.id, name, image }} />
      <script
        type="application/ld+json"
        // JSON.stringify + escape de «<» evita inyectar etiquetas.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="Migas de pan" className={`${estilos.migas} no-imprimir`}>
        <ol>
          <li>
            <Link href="/">Personajes</Link>
          </li>
          <li aria-current="page">{name}</li>
        </ol>
      </nav>

      <div className={estilos.cabecera}>
        <figure className={estilos.foto}>
          <Image
            src={image}
            alt={`Retrato de ${name}`}
            width={300}
            height={300}
            sizes="(min-width: 48rem) 300px, 80vw"
            preload
            loading="eager"
          />
        </figure>

        <div className={estilos.info}>
          <h1>{name}</h1>
          <p className={estilos.resumen}>
            <Estado estado={status} /> <span>{species}</span>
            {type && <span className={estilos.tipo}>· {type}</span>}
          </p>

          <dl className={estilos.datos}>
            <div>
              <dt>Especie</dt>
              <dd>{species}</dd>
            </div>
            {type && (
              <div>
                <dt>Subtipo</dt>
                <dd>{type}</dd>
              </div>
            )}
            <div>
              <dt>Género</dt>
              <dd>{ETIQUETA_GENERO[gender.toLowerCase()] ?? gender}</dd>
            </div>
            <div>
              <dt>Origen</dt>
              <dd>{traducir(origin.name)}</dd>
            </div>
            <div>
              <dt>Última ubicación conocida</dt>
              <dd>{traducir(location.name)}</dd>
            </div>
            <div>
              <dt>Episodios</dt>
              <dd>{personaje.episode.length}</dd>
            </div>
            {primero && (
              <div>
                <dt>Primera aparición</dt>
                <dd>
                  {primero.episode} · {primero.name}
                </dd>
              </div>
            )}
            {ultimo && ultimo !== primero && (
              <div>
                <dt>Última aparición</dt>
                <dd>
                  {ultimo.episode} · {ultimo.name}
                </dd>
              </div>
            )}
          </dl>

          <div className={`${estilos.acciones} no-imprimir`}>
            <BotonFavorito id={personaje.id} nombre={name} variante="completo" />
            <Compartir titulo={name} />
          </div>
        </div>
      </div>

      <section aria-labelledby="titulo-episodios" className={estilos.episodios}>
        <h2 id="titulo-episodios">
          Episodios en los que aparece <span className={estilos.cuenta}>({episodios.length})</span>
        </h2>
        {temporadas.map(({ temporada, episodios: lista }, i) => (
          <details
            key={temporada}
            className={estilos.temporada}
            open={i === 0 || temporadas.length === 1}
          >
            <summary>
              {temporada === 0 ? "Otros" : `Temporada ${temporada}`}{" "}
              <span className={estilos.cuenta}>
                · {lista.length} {lista.length === 1 ? "episodio" : "episodios"}
              </span>
            </summary>
            <ol className={estilos.listaEpisodios}>
              {lista.map((ep) => (
                <li key={ep.id}>
                  <span className={estilos.codigo}>{ep.episode}</span>
                  <span className={estilos.nombreEpisodio}>{ep.name}</span>
                  <time dateTime={fechaIso(ep.air_date)} className={estilos.fecha}>
                    {fechaLegible(ep.air_date)}
                  </time>
                </li>
              ))}
            </ol>
          </details>
        ))}
      </section>

      <nav aria-label="Otros personajes" className={`${estilos.vecinos} no-imprimir`}>
        {anterior ? (
          <Link href={`/personaje/${anterior}`} className="boton boton-secundario" rel="prev">
            <span aria-hidden="true">←</span> Personaje #{anterior}
          </Link>
        ) : (
          <span />
        )}
        {siguiente && (
          <Link href={`/personaje/${siguiente}`} className="boton boton-secundario" rel="next">
            Personaje #{siguiente} <span aria-hidden="true">→</span>
          </Link>
        )}
      </nav>
      <p className="sr-only">Identificador {idDesdeUrl(personaje.url) ?? personaje.id}</p>
    </article>
  );
}
