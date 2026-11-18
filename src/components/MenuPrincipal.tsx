"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useFavoritos } from "@/hooks/useFavoritos";
import { SelectorTema } from "./SelectorTema";
import estilos from "./Cabecera.module.css";

const ENLACES = [
  { href: "/", texto: "Personajes" },
  { href: "/favoritos", texto: "Favoritos" },
] as const;

/** Navegación principal: colapsable en móvil (botón con aria-expanded) y visible en escritorio. */
export function MenuPrincipal() {
  const ruta = usePathname();
  const { total } = useFavoritos();
  const [abierto, setAbierto] = useState(false);
  const [rutaAnterior, setRutaAnterior] = useState(ruta);
  const idMenu = useId();
  const boton = useRef<HTMLButtonElement>(null);

  // Cerrar el menú al cambiar de ruta (ajuste de estado durante el render).
  if (ruta !== rutaAnterior) {
    setRutaAnterior(ruta);
    setAbierto(false);
  }

  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [abierto]);

  return (
    <nav aria-label="Principal" className={estilos.nav}>
      <button
        ref={boton}
        type="button"
        className={`${estilos.botonMenu} no-imprimir`}
        aria-expanded={abierto}
        aria-controls={idMenu}
        onClick={() => setAbierto((a) => !a)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22">
          {abierto ? (
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          )}
        </svg>
        Menú
      </button>
      <div id={idMenu} className={estilos.menu} data-abierto={abierto}>
        <ul className={estilos.enlaces}>
          {ENLACES.map(({ href, texto }) => {
            const actual = href === "/" ? ruta === "/" : ruta.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={actual ? "page" : undefined}
                  className={estilos.enlace}
                >
                  {texto}
                  {href === "/favoritos" && total > 0 && (
                    <span className={estilos.contador}>
                      <span className="sr-only">: </span>
                      {total}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
          <li>
            <a href="/aleatorio" className={estilos.enlace}>
              Al azar
            </a>
          </li>
        </ul>
        <SelectorTema />
      </div>
    </nav>
  );
}
