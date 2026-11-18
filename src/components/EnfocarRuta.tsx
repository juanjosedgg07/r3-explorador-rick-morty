"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Navegación accesible: al cambiar de RUTA (no de filtros) mueve el foco al
 * <h1> de la nueva página para que el lector de pantalla anuncie el título.
 * Next.js además anuncia el <title> con su route announcer.
 */
export function EnfocarRuta() {
  const ruta = usePathname();
  const primera = useRef(true);

  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    const titulo = document.querySelector<HTMLElement>("main h1");
    if (!titulo) return;
    if (!titulo.hasAttribute("tabindex")) titulo.setAttribute("tabindex", "-1");
    titulo.focus({ preventScroll: false });
  }, [ruta]);

  return null;
}
