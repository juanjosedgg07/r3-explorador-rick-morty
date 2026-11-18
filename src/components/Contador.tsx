"use client";

import { useEffect, useState } from "react";

const formato = new Intl.NumberFormat("es-CO");

/**
 * Cifra que «sube» al aparecer. El HTML del servidor ya trae el valor final
 * (sin JS, lectores de pantalla y SEO lo ven completo); la animación es solo visual.
 */
export function Contador({ hasta, duracion = 1200 }: { hasta: number; duracion?: number }) {
  const [valor, setValor] = useState(hasta);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let marco = 0;
    const inicio = performance.now();
    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / duracion);
      const suavizado = 1 - Math.pow(1 - t, 3);
      setValor(Math.round(hasta * suavizado));
      if (t < 1) marco = requestAnimationFrame(paso);
    };
    marco = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(marco);
  }, [hasta, duracion]);

  return (
    <>
      <span aria-hidden="true">{formato.format(valor)}</span>
      <span className="sr-only">{formato.format(hasta)}</span>
    </>
  );
}
