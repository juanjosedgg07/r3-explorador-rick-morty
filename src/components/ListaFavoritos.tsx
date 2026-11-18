"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useFavoritos } from "@/hooks/useFavoritos";
import { obtenerPersonajes } from "@/lib/api";
import type { Personaje } from "@/lib/tipos";
import { Tarjeta } from "./Tarjeta";
import rejilla from "./Rejilla.module.css";
import estilos from "./ListaFavoritos.module.css";

type Carga =
  | { estado: "cargando" }
  | { estado: "listo"; personajes: Personaje[] }
  | { estado: "error"; mensaje: string };

type Orden = "agregado" | "nombre";

const sinSuscripcion = () => () => {};

/**
 * RF-07: pide los favoritos con UNA sola petición (`/character/1,2,3`).
 * Al quitar uno no se vuelve a pedir nada: se filtra lo que ya está cargado.
 */
export function ListaFavoritos() {
  const { ids, limpiar } = useFavoritos();
  const [cargados, setCargados] = useState<Map<number, Personaje>>(() => new Map());
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);
  const [orden, setOrden] = useState<Orden>("agregado");
  // false en el servidor y en la hidratación; true después (evita mostrar «vacío» por error).
  const montado = useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false,
  );
  const dialogo = useRef<HTMLDialogElement>(null);

  const faltantes = ids.filter((id) => !cargados.has(id));
  const claveFaltantes = faltantes.join(",");

  useEffect(() => {
    if (!claveFaltantes) return;
    const controlador = new AbortController();
    obtenerPersonajes(claveFaltantes.split(","), { signal: controlador.signal })
      .then((nuevos) => {
        setError(null);
        setCargados((previos) => {
          const mapa = new Map(previos);
          for (const p of nuevos) mapa.set(p.id, p);
          return mapa;
        });
      })
      .catch((e: unknown) => {
        if (controlador.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Error desconocido");
      });
    return () => controlador.abort();
  }, [claveFaltantes, intento]);

  const carga: Carga = !montado
    ? { estado: "cargando" }
    : error
      ? { estado: "error", mensaje: error }
      : faltantes.length > 0
        ? { estado: "cargando" }
        : {
            estado: "listo",
            personajes: ids.map((id) => cargados.get(id)).filter((p): p is Personaje => !!p),
          };

  const personajes =
    carga.estado === "listo" && orden === "nombre"
      ? [...carga.personajes].sort((a, b) => a.name.localeCompare(b.name, "es"))
      : carga.estado === "listo"
        ? carga.personajes
        : [];

  function exportar() {
    const blob = new Blob([JSON.stringify(ids)], { type: "application/json" });
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(blob);
    enlace.download = "favoritos-rick-and-morty.json";
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  }

  return (
    <div>
      <p role="status" aria-live="polite" className={estilos.estado}>
        {carga.estado === "cargando" && "Cargando favoritos…"}
        {carga.estado === "listo" &&
          (ids.length === 0
            ? "No tiene favoritos todavía"
            : `${ids.length} ${ids.length === 1 ? "favorito" : "favoritos"}`)}
      </p>

      {carga.estado === "error" && (
        <div role="alert" className={estilos.aviso}>
          <h2>No pudimos cargar sus favoritos</h2>
          <p>{carga.mensaje}</p>
          <button type="button" className="boton" onClick={() => setIntento((n) => n + 1)}>
            Reintentar
          </button>
        </div>
      )}

      {carga.estado === "listo" && ids.length === 0 && (
        <section className={estilos.vacio} aria-labelledby="titulo-sin-favoritos">
          <h2 id="titulo-sin-favoritos">Aún no ha guardado personajes</h2>
          <p>
            Use el botón con forma de corazón en cualquier tarjeta o en la página de un personaje.
          </p>
          <Link href="/" className="boton">
            Explorar personajes
          </Link>
        </section>
      )}

      {carga.estado === "listo" && ids.length > 0 && (
        <>
          <div className={`${estilos.barra} no-imprimir`}>
            <div className={estilos.orden}>
              <label htmlFor="orden-favoritos">Ordenar por</label>
              <select
                id="orden-favoritos"
                value={orden}
                onChange={(e) => setOrden(e.target.value as Orden)}
              >
                <option value="agregado">Orden en que los agregó</option>
                <option value="nombre">Nombre (A–Z)</option>
              </select>
            </div>
            <div className={estilos.botones}>
              <button type="button" className="boton boton-secundario" onClick={exportar}>
                Exportar JSON
              </button>
              <button
                type="button"
                className="boton boton-secundario"
                onClick={() => dialogo.current?.showModal()}
              >
                Quitar todos
              </button>
            </div>
          </div>
          <ul className={rejilla.rejilla} aria-label="Favoritos">
            {personajes.map((p, i) => (
              <li key={p.id}>
                <Tarjeta personaje={p} prioridad={i === 0} />
              </li>
            ))}
          </ul>
        </>
      )}

      {carga.estado === "cargando" && montado && ids.length > 0 && (
        <ul className={rejilla.rejilla} aria-hidden="true">
          {ids.slice(0, 8).map((id) => (
            <li key={id} className={estilos.esqueleto} />
          ))}
        </ul>
      )}

      <dialog ref={dialogo} className={estilos.dialogo} aria-labelledby="titulo-confirmar">
        <form method="dialog">
          <h2 id="titulo-confirmar">¿Quitar todos los favoritos?</h2>
          <p>Se borrarán los {ids.length} personajes guardados en este navegador.</p>
          <div className={estilos.botones}>
            <button value="cancelar" className="boton boton-secundario">
              Cancelar
            </button>
            <button value="confirmar" className="boton" onClick={() => limpiar()}>
              Sí, quitar todos
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
