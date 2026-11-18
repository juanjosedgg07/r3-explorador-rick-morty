/**
 * Pruebas de contención de la configuración de IA (sección 11).
 * Corren dentro de `npm run check`: si alguien (o la IA) debilita la
 * configuración, el check falla.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { evaluar } from "../.ia/hooks/proteger.mjs";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOOK = path.join(RAIZ, ".ia", "hooks", "proteger.mjs");

const decidir = (tool_name: string, tool_input: Record<string, string>) =>
  evaluar({ tool_name, tool_input }, RAIZ);

describe("hook proteger.mjs: secretos", () => {
  it.each([
    ["Read", { file_path: ".env" }],
    ["Read", { file_path: ".env.local" }],
    ["Read", { file_path: "config/.env.production" }],
    ["Read", { file_path: "certs/servidor.pem" }],
    ["Read", { file_path: "secrets/api.json" }],
    ["Edit", { file_path: ".env" }],
    ["Write", { file_path: "llave.key" }],
    ["Grep", { pattern: "API_KEY", path: ".env" }],
    ["Glob", { pattern: "**/.env*" }],
    ["Bash", { command: "cat .env" }],
    ["Bash", { command: "type .env.local" }],
    ["Bash", { command: "grep TOKEN .env" }],
    ["Bash", { command: "printenv" }],
    ["Bash", { command: "cat ~/.ssh/id_rsa" }],
    ["Bash", { command: "Get-Content .env" }],
  ])("bloquea %s %j", (herramienta, datos) => {
    expect(decidir(herramienta, datos).bloquear).toBe(true);
  });
});

describe("hook proteger.mjs: fuera del proyecto", () => {
  it.each([
    ["Read", { file_path: "C:/Windows/System32/drivers/etc/hosts" }],
    ["Read", { file_path: "../otro-proyecto/notas.md" }],
    ["Write", { file_path: "/etc/passwd" }],
    ["Bash", { command: "ls ../.." }],
    ["Bash", { command: "cp src/app/page.tsx C:/Users/Public/robado.tsx" }],
    ["Bash", { command: "rm -rf /" }],
    ["Bash", { command: "git push --force origin main" }],
  ])("bloquea %s %j", (herramienta, datos) => {
    expect(decidir(herramienta, datos).bloquear).toBe(true);
  });
});

describe("hook proteger.mjs: trabajo normal permitido", () => {
  it.each([
    ["Read", { file_path: "src/app/page.tsx" }],
    ["Read", { file_path: path.join(RAIZ, "AGENTS.md") }],
    ["Read", { file_path: "src/lib/environment.ts" }],
    ["Edit", { file_path: "src/lib/api.ts" }],
    ["Grep", { pattern: "listarPersonajes", path: "src" }],
    ["Bash", { command: "npm run check" }],
    ["Bash", { command: "npm test 2>/dev/null" }],
    ["Bash", { command: "git log --oneline" }],
    ["Bash", { command: "curl -s https://rickandmortyapi.com/api/character/1" }],
  ])("permite %s %j", (herramienta, datos) => {
    expect(decidir(herramienta, datos).bloquear).toBe(false);
  });

  it("el proceso real sale con código 2 al bloquear y 0 al permitir", () => {
    const correr = (entrada: object) =>
      spawnSync(process.execPath, [HOOK], {
        input: JSON.stringify(entrada),
        env: { ...process.env, PROYECTO_DIR: RAIZ },
        encoding: "utf8",
      });
    const bloqueado = correr({ tool_name: "Read", tool_input: { file_path: ".env" } });
    expect(bloqueado.status).toBe(2);
    expect(bloqueado.stderr).toMatch(/secretos/);
    expect(correr({ tool_name: "Read", tool_input: { file_path: "README.md" } }).status).toBe(0);
  });
});

describe("configuración versionada", () => {
  const ajustes = JSON.parse(readFileSync(path.join(RAIZ, ".ia", "politica.json"), "utf8"));

  it("politica.json niega leer secretos y editar la propia configuración", () => {
    expect(ajustes.permissions.deny).toEqual(
      expect.arrayContaining([
        "Read(./.env)",
        "Read(./.env.*)",
        "Read(**/*.pem)",
        "Read(~/.ssh/**)",
        "Edit(./.ia/politica.json)",
        "Bash(rm -rf*)",
      ]),
    );
  });

  it("politica.json pide permiso para acciones con efecto fuera de la máquina", () => {
    expect(ajustes.permissions.ask).toEqual(
      expect.arrayContaining(["Bash(git push*)", "Bash(npm install*)", "Bash(vercel*)"]),
    );
  });

  it("el hook está registrado antes de cada herramienta", () => {
    const comandos = JSON.stringify(ajustes.hooks.antesDeCadaHerramienta);
    expect(comandos).toContain("proteger.mjs");
  });

  it("AGENTS.md tiene 100 líneas o menos", () => {
    const lineas = readFileSync(path.join(RAIZ, "AGENTS.md"), "utf8").trimEnd().split("\n");
    expect(lineas.length).toBeLessThanOrEqual(100);
  });

  it("el umbral de cobertura sigue en 80 % (bajarlo rompe el check)", () => {
    const config = readFileSync(path.join(RAIZ, "vitest.config.mts"), "utf8");
    expect(config).toMatch(/lines:\s*80/);
    expect(config).toMatch(/functions:\s*80/);
    expect(config).toMatch(/branches:\s*80/);
    expect(config).toMatch(/statements:\s*80/);
  });

  it("npm run check ejecuta tipos, lint sin advertencias, prettier y cobertura", () => {
    const paquete = JSON.parse(readFileSync(path.join(RAIZ, "package.json"), "utf8"));
    expect(paquete.scripts.check).toMatch(/typecheck/);
    expect(paquete.scripts.check).toMatch(/lint/);
    expect(paquete.scripts.check).toMatch(/format:check/);
    expect(paquete.scripts.check).toMatch(/coverage/);
    expect(paquete.scripts.lint).toMatch(/--max-warnings=0/);
  });
});
