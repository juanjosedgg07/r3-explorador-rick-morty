"use client";

import { useState } from "react";

/** Comparte la página con la API nativa del sistema o copia el enlace. */
export function Compartir({ titulo }: { titulo: string }) {
  const [mensaje, setMensaje] = useState("");

  async function compartir() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: titulo, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setMensaje("Enlace copiado");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMensaje("No se pudo copiar el enlace");
    }
    setTimeout(() => setMensaje(""), 3000);
  }

  return (
    <>
      <button type="button" className="boton boton-secundario" onClick={compartir}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Compartir
      </button>
      <span role="status">{mensaje}</span>
    </>
  );
}
