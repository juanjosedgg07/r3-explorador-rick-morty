"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useFavoritos } from "@/hooks/useFavoritos";
import { BotonAzar } from "./BotonAzar";
import { IconoCorazonOrbita, IconoMenu, IconoPistolaRayos, IconoProbeta } from "./Iconos";
import { SelectorTema } from "./SelectorTema";
import estilos from "./Cabecera.module.css";

const ENLACES = [
  { href: "/", texto: "Personajes", Icono: IconoProbeta },
  { href: "/favoritos", texto: "Favoritos", Icono: IconoCorazonOrbita },
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
        <IconoMenu abierto={abierto} />
        Menú
      </button>
      <div id={idMenu} className={estilos.menu} data-abierto={abierto}>
        <ul className={estilos.enlaces}>
          {ENLACES.map(({ href, texto, Icono }) => {
            const actual = href === "/" ? ruta === "/" : ruta.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={actual ? "page" : undefined}
                  className={estilos.enlace}
                >
                  <Icono tamano={20} />
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
            <BotonAzar className={estilos.enlace}>
              <IconoPistolaRayos tamano={20} />
              Al azar
            </BotonAzar>
          </li>
        </ul>
        <SelectorTema />
      </div>
    </nav>
  );
}
