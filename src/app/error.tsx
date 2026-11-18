"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
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
      <svg aria-hidden="true" viewBox="0 0 64 64" width="72" height="72" className={estilos.icono}>
        <circle
          cx="32"
          cy="32"
          r="27"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="6 5"
        />
        <path d="M32 18v18M32 44v.01" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
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
