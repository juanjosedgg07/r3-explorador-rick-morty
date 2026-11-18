"use client";

import { useReportWebVitals } from "next/web-vitals";

type Metrica = Parameters<Parameters<typeof useReportWebVitals>[0]>[0];

const METAS: Record<string, number> = { LCP: 2500, INP: 200, CLS: 0.1, FCP: 1800, TTFB: 800 };

// Referencia estable (si cambia, se reportan métricas duplicadas).
function reportar(metrica: Metrica) {
  const meta = METAS[metrica.name];
  const valor =
    metrica.name === "CLS" ? metrica.value.toFixed(3) : `${Math.round(metrica.value)} ms`;
  const estado = meta === undefined ? "" : metrica.value <= meta ? "✔" : "✘";
  console.info(`[web-vitals] ${metrica.name} ${valor} ${estado} (${metrica.rating})`);
  // Disponible en DevTools para las evidencias: window.__webVitals
  const w = window as typeof window & { __webVitals?: Record<string, number> };
  w.__webVitals = { ...w.__webVitals, [metrica.name]: metrica.value };
}

/** Core Web Vitals reales (incluido INP, que Lighthouse no mide en laboratorio). */
export function WebVitals() {
  useReportWebVitals(reportar);
  return null;
}
