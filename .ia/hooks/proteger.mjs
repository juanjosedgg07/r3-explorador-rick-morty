#!/usr/bin/env node
// Hook «antes de cada herramienta»: segunda barrera (además de permissions.deny) para que la IA
// no lea secretos ni salga de la carpeta del proyecto.
// Código de salida 2 = bloquear la herramienta y devolver el motivo a la IA.
import path from "node:path";
import { fileURLToPath } from "node:url";

const SECRETO =
  /(^|[\\/\s"'=*])((\.env(\.[\w-]+)?|id_rsa\w*|id_ed25519\w*|[\w-]+\.pem|[\w-]+\.key|credentials(\.json)?|\.npmrc)(?=$|[\s"';|&)*]|[\\/])|(secrets|\.ssh|\.aws)[\\/])/i;

const PELIGROSO = [
  /\bprintenv\b/i,
  /(^|[;&|]\s*)env\s*($|[;&|])/i,
  /\brm\s+-rf?\s+(\/|~|\*|\.\.)/i,
  /\bgit\s+push\s+.*--force\b/i,
  /\bGet-Content\b.*\.env/i,
];

/** Normaliza rutas estilo Windows/POSIX para compararlas. */
function normalizar(ruta) {
  return path.resolve(ruta).replace(/\\/g, "/").toLowerCase();
}

/** ¿La ruta cae dentro de la raíz del proyecto? */
export function dentroDe(raiz, ruta) {
  const r = normalizar(raiz);
  const destino = normalizar(path.isAbsolute(ruta) ? ruta : path.join(raiz, ruta));
  return destino === r || destino.startsWith(r + "/");
}

/** Extrae rutas absolutas o con `..` de un comando de shell. */
export function rutasDelComando(comando) {
  const tokens = comando.match(/"[^"]*"|'[^']*'|[^\s;&|<>]+/g) ?? [];
  return tokens
    .map((t) => t.replace(/^["']|["']$/g, ""))
    .filter(
      (t) =>
        /^[a-z]:[\\/]/i.test(t) ||
        t.startsWith("/") ||
        t.startsWith("~") ||
        /(^|[\\/])\.\.([\\/]|$)/.test(t),
    )
    .filter((t) => !/^\/(dev\/null|tmp\b)/.test(t) && !/^https?:/.test(t));
}

/**
 * Decide si se bloquea una llamada a herramienta.
 * @returns {{ bloquear: boolean, motivo?: string }}
 */
export function evaluar(entrada, raiz) {
  const { tool_name: herramienta = "", tool_input: datos = {} } = entrada ?? {};

  if (herramienta === "Bash") {
    const comando = String(datos.command ?? "");
    if (SECRETO.test(comando)) {
      return {
        bloquear: true,
        motivo: "El comando menciona un archivo de secretos (.env, claves, credenciales).",
      };
    }
    const peligro = PELIGROSO.find((re) => re.test(comando));
    if (peligro)
      return {
        bloquear: true,
        motivo: `Comando no permitido por la política del proyecto (${peligro}).`,
      };
    const fuera = rutasDelComando(comando).find((r) => !dentroDe(raiz, r));
    if (fuera)
      return { bloquear: true, motivo: `El comando sale de la carpeta del proyecto: ${fuera}` };
    return { bloquear: false };
  }

  const ruta = datos.file_path ?? datos.notebook_path ?? datos.path;
  if (typeof ruta === "string" && ruta.length > 0) {
    if (SECRETO.test(ruta.replace(/\\/g, "/"))) {
      return { bloquear: true, motivo: `Acceso a un archivo de secretos bloqueado: ${ruta}` };
    }
    if (!dentroDe(raiz, ruta)) {
      return { bloquear: true, motivo: `Ruta fuera del proyecto bloqueada: ${ruta}` };
    }
  }
  const patron = datos.pattern ?? datos.glob;
  if (
    (herramienta === "Glob" || herramienta === "Grep") &&
    typeof patron === "string" &&
    SECRETO.test(patron)
  ) {
    return { bloquear: true, motivo: `Búsqueda de secretos bloqueada: ${patron}` };
  }
  return { bloquear: false };
}

async function leerEntrada() {
  let texto = "";
  for await (const trozo of process.stdin) texto += trozo;
  return texto ? JSON.parse(texto) : {};
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const entrada = await leerEntrada().catch(() => ({}));
  const raiz = process.env.PROYECTO_DIR || entrada.cwd || process.cwd();
  const { bloquear, motivo } = evaluar(entrada, raiz);
  if (bloquear) {
    process.stderr.write(`[proteger.mjs] ${motivo}\n`);
    process.exit(2);
  }
  process.exit(0);
}
