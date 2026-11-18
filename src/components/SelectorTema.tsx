"use client";

import { useId, useSyncExternalStore } from "react";
import { IconoAtomo } from "./Iconos";
import estilos from "./Cabecera.module.css";

const CLAVE = "r3:tema";
const TEMAS = [
  { valor: "system", texto: "Sistema" },
  { valor: "light", texto: "Claro" },
  { valor: "dark", texto: "Oscuro" },
  { valor: "contrast", texto: "Alto contraste" },
] as const;

type Tema = (typeof TEMAS)[number]["valor"];

const oyentes = new Set<() => void>();

function leerTema(): Tema {
  const actual = document.documentElement.dataset.theme;
  return actual === "light" || actual === "dark" || actual === "contrast" ? actual : "system";
}

function suscribir(callback: () => void) {
  oyentes.add(callback);
  return () => oyentes.delete(callback);
}

function aplicar(tema: Tema) {
  const raiz = document.documentElement;
  if (tema === "system") delete raiz.dataset.theme;
  else raiz.dataset.theme = tema;
  try {
    if (tema === "system") localStorage.removeItem(CLAVE);
    else localStorage.setItem(CLAVE, tema);
  } catch {
    // Sin localStorage el tema dura solo esta visita.
  }
  oyentes.forEach((f) => f());
}

export function SelectorTema() {
  const tema = useSyncExternalStore(suscribir, leerTema, () => "system" as Tema);
  const id = useId();

  return (
    <div className={`${estilos.tema} no-imprimir`}>
      <label htmlFor={id}>
        <IconoAtomo tamano={20} />
        Tema
      </label>
      <select id={id} value={tema} onChange={(e) => aplicar(e.target.value as Tema)}>
        {TEMAS.map((t) => (
          <option key={t.valor} value={t.valor}>
            {t.texto}
          </option>
        ))}
      </select>
    </div>
  );
}
