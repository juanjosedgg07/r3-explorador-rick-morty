import estilos from "./Portal.module.css";

interface Props {
  /** Tamaño en rem (si se omite, lo decide el CSS con --tamano). */
  tamano?: number;
  className?: string;
}

/** Portal interdimensional: remolino verde hecho solo con CSS (decorativo). */
export function Portal({ tamano, className = "" }: Props) {
  return (
    <div
      className={`${estilos.portal} ${className}`}
      style={tamano ? ({ "--tamano": `${tamano}rem` } as React.CSSProperties) : undefined}
      aria-hidden="true"
    >
      <div className={estilos.halo} />
      <div className={estilos.remolino} />
      <div className={`${estilos.remolino} ${estilos.remolino2}`} />
      <div className={estilos.nucleo} />
      {Array.from({ length: 8 }, (_, i) => (
        <span key={i} className={estilos.chispa} style={{ "--i": i } as React.CSSProperties} />
      ))}
    </div>
  );
}
