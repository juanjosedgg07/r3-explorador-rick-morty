"use client";

import { useCallback, useSyncExternalStore } from "react";
import * as favoritos from "@/lib/favoritos";

/** Favoritos sincronizados entre componentes y entre pestañas. */
export function useFavoritos() {
  const ids = useSyncExternalStore(favoritos.suscribir, favoritos.leer, favoritos.leerServidor);

  const esFavorito = useCallback((id: number) => ids.includes(id), [ids]);

  return {
    ids,
    total: ids.length,
    esFavorito,
    alternar: favoritos.alternar,
    quitar: favoritos.quitar,
    limpiar: favoritos.limpiar,
    escribir: favoritos.escribir,
  };
}
