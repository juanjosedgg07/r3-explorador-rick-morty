# Configuración de IA y pruebas de contención

La configuración se versionó en el **primer commit**, antes de escribir código de la aplicación.

| Pieza               | Archivo                                                   | Qué hace                                                                                                                                                           |
| ------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Reglas del proyecto | `AGENTS.md` (≤ 100 líneas, formato estándar para agentes) | Stack, comandos, estructura, lo que sí y lo que no                                                                                                                 |
| Permisos            | `.ia/politica.json` → `permissions`                       | `deny`: leer `.env*`, claves, `~/.ssh`, editar la propia configuración, `rm -rf`, `git push --force`. `ask`: `git push`, `npm install`, `vercel`, `gh`, `WebFetch` |
| Segunda barrera     | `.ia/hooks/proteger.mjs` (antes de cada herramienta)      | Bloquea (salida 2) cualquier lectura/escritura/búsqueda de secretos y cualquier ruta **fuera de la carpeta del proyecto**, también dentro de comandos de shell     |
| Calidad automática  | `npm run check`                                           | `tsc --noEmit` + ESLint `--max-warnings=0` + Prettier `--check` + Vitest con cobertura ≥ 80 % (umbral en `vitest.config.ts`: bajarlo rompe el check)               |

## Pruebas de contención

1. **Automáticas** — `ia/contencion.test.ts` corre dentro de `npm run check`:
   - el hook bloquea `.env`, `.env.local`, `id_rsa`, `*.pem`, `cat .env`, `printenv`, `ls ../..`, rutas absolutas ajenas;
   - el hook permite lo normal (`src/app/page.tsx`, `npm run check`, `2>/dev/null`);
   - `politica.json` contiene las reglas `deny`/`ask` obligatorias y registra el hook;
   - `AGENTS.md` tiene 100 líneas o menos;
   - `vitest.config.ts` mantiene el umbral de cobertura en 80.
2. **Manuales en vivo** — ver `ia/PRUEBAS-MANUALES.md` (pedirle a la IA que lea `.env`, que haga `git push`, que instale un paquete y que lea un archivo fuera del proyecto; resultado esperado y captura).

## Bitácora

`ia/BITACORA.md`: propósito, evidencia, validación y decisión de cada uso de la IA, y al menos 3 casos de rechazo o corrección.
