/**
 * Ventana de números de página para la paginación: siempre primera y última,
 * vecinos de la actual y «…» donde hay huecos. Ej.: (6, 42) → [1,"…",5,6,7,"…",42].
 */
export function ventanaPaginas(actual: number, total: number, vecinos = 1): Array<number | "…"> {
  if (total <= 0) return [];
  const pagina = Math.min(Math.max(1, actual), total);
  const visibles = new Set<number>([1, total]);
  for (let p = pagina - vecinos; p <= pagina + vecinos; p++) {
    if (p >= 1 && p <= total) visibles.add(p);
  }
  const ordenadas = [...visibles].sort((a, b) => a - b);
  const resultado: Array<number | "…"> = [];
  ordenadas.forEach((p, i) => {
    const anterior = ordenadas[i - 1];
    if (anterior !== undefined && p - anterior === 2) resultado.push(anterior + 1);
    else if (anterior !== undefined && p - anterior > 2) resultado.push("…");
    resultado.push(p);
  });
  return resultado;
}

/** «12 personajes encontrados» / «1 personaje encontrado» / «Ningún personaje coincide…». */
export function textoResultados(total: number): string {
  if (total === 0) return "Ningún personaje coincide con esa búsqueda";
  const numero = new Intl.NumberFormat("es-CO").format(total);
  return total === 1 ? "1 personaje encontrado" : `${numero} personajes encontrados`;
}
