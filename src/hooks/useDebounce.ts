"use client";

import { useEffect, useState } from "react";

/** Devuelve `valor` solo cuando deja de cambiar durante `espera` ms. */
export function useDebounce<T>(valor: T, espera = 400): T {
  const [retrasado, setRetrasado] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setRetrasado(valor), espera);
    return () => clearTimeout(temporizador);
  }, [valor, espera]);

  return retrasado;
}
