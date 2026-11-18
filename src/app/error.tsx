"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { IconoProbeta } from "@/components/Iconos";
import estilos from "./estados.module.css";

/** Límite de error (componente de cliente) con «Reintentar». */
export default function ErrorPagina({ error, retry }: { error: unknown; retry: () => void }) {
  const titulo = useRef<HTMLHeadingElement>(null);
  const digest = error instanceof Error ? (error as Error & { digest?: string }).digest : undefined;

  useEffect(() => {
    console.error(error);
    titulo.current?.focus();
  }, [error]);

  return (
    <section className={estilos.mensaje} role="alert" aria-labelledby="titulo-error">
      <IconoProbeta tamano={80} className={estilos.icono} strokeWidth={1.4} />
      <h1 id="titulo-error" ref={titulo} tabIndex={-1}>
        No pudimos cargar los personajes
      </h1>
      <p>
        Puede que no haya conexión a internet o que la API de Rick and Morty no esté respondiendo.
        Revise su conexión y vuelva a intentarlo.
      </p>
      <div className={estilos.acciones}>
        <button type="button" className="boton" onClick={() => retry()}>
          Reintentar
        </button>
        <Link href="/" className="boton boton-secundario">
          Ir al inicio
        </Link>
      </div>
      {digest && <p className={estilos.codigo}>Código del error: {digest}</p>}
    </section>
  );
}
