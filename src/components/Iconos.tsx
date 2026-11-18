/**
 * Íconos originales de «laboratorio interdimensional» (SVG propios, decorativos).
 * Todos llevan aria-hidden: el texto del botón o enlace es la etiqueta accesible.
 */
import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & { tamano?: number };

function Base({ tamano = 22, children, ...resto }: Props) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      width={tamano}
      height={tamano}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...resto}
    >
      {children}
    </svg>
  );
}

/** Remolino de portal (logo). */
export function IconoPortal({ tamano = 34, ...p }: Props) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 48 48"
      width={tamano}
      height={tamano}
      {...p}
    >
      <defs>
        <radialGradient id="portal-centro" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#f4ffd9" />
          <stop offset="0.45" stopColor="#97ce4c" />
          <stop offset="1" stopColor="#2f7d12" />
        </radialGradient>
      </defs>
      <ellipse cx="24" cy="24" rx="21" ry="20" fill="url(#portal-centro)" />
      <path
        d="M24 9c8 0 14 6 14 14s-5 12-11 12-9-4-9-8 3-7 6-7 5 2 5 4"
        fill="none"
        stroke="#eaffc4"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M11 30c-2-9 4-17 12-18"
        fill="none"
        stroke="#1d5c0a"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity=".7"
      />
    </svg>
  );
}

/** Probeta burbujeante (Personajes / laboratorio). */
export function IconoProbeta(p: Props) {
  return (
    <Base {...p}>
      <path d="M9 3h6M10 3v6.5L4.8 18.2A2 2 0 006.5 21h11a2 2 0 001.7-2.8L14 9.5V3" />
      <path d="M7.2 15h9.6" />
      <circle cx="10.5" cy="17.6" r=".8" fill="currentColor" stroke="none" />
      <circle cx="13.8" cy="18.4" r=".6" fill="currentColor" stroke="none" />
    </Base>
  );
}

/** Corazón con órbita (Favoritos). */
export function IconoCorazonOrbita(p: Props) {
  return (
    <Base {...p}>
      <path d="M12 19s-6-3.7-7.6-7.4C3.3 9 5 6 8 6c1.7 0 2.9.9 4 2.4C13.1 6.9 14.3 6 16 6c3 0 4.7 3 3.6 5.6C18 15.3 12 19 12 19z" />
      <ellipse
        cx="12"
        cy="12.5"
        rx="10.5"
        ry="3.6"
        transform="rotate(-20 12 12.5)"
        strokeDasharray="2.5 2.5"
      />
    </Base>
  );
}

/** Pistola de rayos de ciencia ficción (Al azar). */
export function IconoPistolaRayos(p: Props) {
  return (
    <Base {...p}>
      <path d="M3 9.5h11.5a2.5 2.5 0 010 5H9l-1.5 5.5H4.5L6 14.5H3z" />
      <path d="M17 12h1.8M20.5 9.5l1.2-1.2M20.5 14.5l1.2 1.2M21 12h1.5" />
      <circle cx="10.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </Base>
  );
}

/** Átomo (selector de tema). */
export function IconoAtomo(p: Props) {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
    </Base>
  );
}

/** Radar de escaneo (Buscar). */
export function IconoRadar(p: Props) {
  return (
    <Base {...p}>
      <circle cx="11" cy="11" r="7.5" />
      <path d="M11 11l4.5-4.5M11 6.5a4.5 4.5 0 014.5 4.5M16.5 16.5L21 21" />
      <circle cx="13.6" cy="13.2" r=".9" fill="currentColor" stroke="none" />
    </Base>
  );
}

/** Reinicio de dimensión (Limpiar). */
export function IconoReinicio(p: Props) {
  return (
    <Base {...p}>
      <path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5" />
      <path d="M4 4v4.5h4.5" />
      <path d="M12 9v3l2 1.5" />
    </Base>
  );
}

/** Antena interdimensional (Compartir). */
export function IconoAntena(p: Props) {
  return (
    <Base {...p}>
      <path d="M12 12v9M9 21h6M12 12l-3.5-3.5M12 12l3.5-3.5" />
      <circle cx="12" cy="11" r="1.4" fill="currentColor" stroke="none" />
      <path d="M7 6.5a7 7 0 0110 0M4.5 4a10.5 10.5 0 0115 0" />
    </Base>
  );
}

/** Platillo volador (no encontrado). */
export function IconoPlatillo(p: Props) {
  return (
    <Base {...p}>
      <path d="M8 10a4 4 0 018 0" />
      <ellipse cx="12" cy="12" rx="10" ry="3.2" />
      <path d="M7 15.5l-1.5 4M17 15.5l1.5 4M12 15.5V20" strokeDasharray="1.5 2" />
    </Base>
  );
}

/** Menú con tres «tubos de ensayo» horizontales. */
export function IconoMenu({ abierto, ...p }: Props & { abierto?: boolean }) {
  return (
    <Base {...p}>
      {abierto ? (
        <path d="M6 6l12 12M18 6L6 18" />
      ) : (
        <>
          <path d="M4 7h13M4 12h16M4 17h10" />
          <circle cx="20" cy="7" r="1" fill="currentColor" stroke="none" />
          <circle cx="17" cy="17" r="1" fill="currentColor" stroke="none" />
        </>
      )}
    </Base>
  );
}

/** Flechas de salto dimensional (paginación y vecinos). */
export function IconoSalto({
  direccion = "derecha",
  ...p
}: Props & { direccion?: "izquierda" | "derecha" }) {
  return (
    <Base {...p} style={direccion === "izquierda" ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M4 12h12M12 7l5 5-5 5" />
      <path d="M20 6v12" strokeDasharray="2 2" />
    </Base>
  );
}
