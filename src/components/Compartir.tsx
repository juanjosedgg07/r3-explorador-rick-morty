"use client";

import { useState } from "react";
import { IconoAntena } from "./Iconos";

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
        <IconoAntena tamano={20} />
        Compartir
      </button>
      <span role="status">{mensaje}</span>
    </>
  );
}
