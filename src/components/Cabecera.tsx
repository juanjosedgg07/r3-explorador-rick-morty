import Link from "next/link";
import { IconoPortal } from "./Iconos";
import { MenuPrincipal } from "./MenuPrincipal";
import estilos from "./Cabecera.module.css";

export function Cabecera() {
  return (
    <header className={estilos.cabecera}>
      <div className={`contenedor ${estilos.barra}`}>
        <Link href="/" className={estilos.marca}>
          <IconoPortal className={estilos.logo} />
          <span>
            Explorador <span className={estilos.marcaSub}>Rick and Morty</span>
          </span>
        </Link>
        <MenuPrincipal />
      </div>
    </header>
  );
}
