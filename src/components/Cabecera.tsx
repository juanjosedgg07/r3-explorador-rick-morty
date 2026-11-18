import Link from "next/link";
import { MenuPrincipal } from "./MenuPrincipal";
import estilos from "./Cabecera.module.css";

export function Cabecera() {
  return (
    <header className={estilos.cabecera}>
      <div className={`contenedor ${estilos.barra}`}>
        <Link href="/" className={estilos.marca}>
          <svg
            aria-hidden="true"
            viewBox="0 0 32 32"
            width="32"
            height="32"
            className={estilos.logo}
          >
            <circle cx="16" cy="16" r="14" fill="currentColor" opacity="0.18" />
            <circle
              cx="16"
              cy="16"
              r="9.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray="4 3"
            />
            <circle cx="16" cy="16" r="4" fill="currentColor" />
          </svg>
          <span>
            Explorador <span className={estilos.marcaSub}>Rick and Morty</span>
          </span>
        </Link>
        <MenuPrincipal />
      </div>
    </header>
  );
}
