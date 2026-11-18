"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import {
  borrarRecientes,
  leerRecientes,
  leerRecientesServidor,
  registrarVisita,
  suscribirRecientes,
  type Reciente,
} from "@/lib/recientes";
import estilos from "./Recientes.module.css";

/** Registra la visita al detalle (no pinta nada). */
export function RegistrarVisita({ personaje }: { personaje: Reciente }) {
  const { id, name, image } = personaje;
  useEffect(() => {
    registrarVisita({ id, name, image });
  }, [id, name, image]);
  return null;
}

/** Tira de «Vistos recientemente» en la portada. */
export function Recientes() {
  const recientes = useSyncExternalStore(suscribirRecientes, leerRecientes, leerRecientesServidor);
  if (recientes.length === 0) return null;

  return (
    <section className={`${estilos.recientes} no-imprimir`} aria-labelledby="titulo-recientes">
      <div className={estilos.encabezado}>
        <h2 id="titulo-recientes" className={estilos.titulo}>
          Vistos recientemente
        </h2>
        <button type="button" className={estilos.borrar} onClick={borrarRecientes}>
          Borrar historial
        </button>
      </div>
      <ul className={estilos.lista}>
        {recientes.map((r) => (
          <li key={r.id}>
            <Link href={`/personaje/${r.id}`} className={estilos.item}>
              <Image src={r.image} alt="" width={64} height={64} sizes="64px" />
              <span>{r.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
