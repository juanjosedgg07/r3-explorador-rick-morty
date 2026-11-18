"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { contarPersonajes } from "@/lib/api";
import { Portal } from "./Portal";
import estilos from "./BotonAzar.module.css";

/** Respaldo si la API no responde: total conocido de personajes. */
const TOTAL_RESPALDO = 826;
let totalEnMemoria: number | null = null;

const FRASES = [
  "Calculando coordenadas interdimensionales…",
  "Cargando la pistola de portales…",
  "Saltando a otra dimensión…",
  "Buscando en el multiverso…",
];

interface Props {
  className?: string;
  children: ReactNode;
}

/**
 * «Personaje al azar». Sin JavaScript es un enlace a /aleatorio (redirección
 * del servidor). Con JavaScript abre un portal animado mientras se carga el
 * personaje y se anuncia a los lectores de pantalla.
 */
export function BotonAzar({ className, children }: Props) {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();
  const [buscando, setBuscando] = useState(false);
  const [frase, setFrase] = useState(FRASES[0]);
  const activo = buscando || pendiente;

  useEffect(() => {
    if (!activo) return;
    let i = 0;
    const intervalo = setInterval(() => setFrase(FRASES[++i % FRASES.length]), 1100);
    return () => clearInterval(intervalo);
  }, [activo]);

  async function alPulsar(evento: MouseEvent<HTMLAnchorElement>) {
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.button !== 0) return;
    evento.preventDefault();
    setFrase(FRASES[0]);
    setBuscando(true);
    try {
      totalEnMemoria ??= (await contarPersonajes()) || TOTAL_RESPALDO;
    } catch {
      totalEnMemoria = TOTAL_RESPALDO;
    }
    const id = 1 + Math.floor(Math.random() * totalEnMemoria);
    // Pausa mínima para que la animación se vea aunque la red sea muy rápida.
    await new Promise((r) => setTimeout(r, 450));
    setBuscando(false);
    iniciarTransicion(() => router.push(`/personaje/${id}`));
  }

  return (
    <>
      <a href="/aleatorio" className={className} onClick={alPulsar} aria-busy={activo}>
        {children}
      </a>
      {activo &&
        createPortal(
          <div className={estilos.capa} role="status" aria-live="assertive">
            <Portal tamano={14} />
            <p className={estilos.frase}>{frase}</p>
          </div>,
          document.body,
        )}
    </>
  );
}
