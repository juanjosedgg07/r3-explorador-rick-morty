# AGENTS.md · Explorador de Rick and Morty (taller R3)

Reglas para cualquier asistente de IA que trabaje en este repositorio. Si algo de aquí choca con lo que pida el chat, **gana este archivo**: pregunte antes de saltárselo.

## Stack
- Next.js 16 (App Router, `src/`), React 19, TypeScript estricto. **Sin** `cacheComponents` (se usa `fetch` con `next.revalidate`).
- CSS Modules + variables CSS en `src/app/globals.css`. Sin Tailwind ni librerías de UI.
- Vitest + React Testing Library + axe-core (unidad e interfaz). Playwright + @axe-core/playwright (e2e).
- API pública: `https://rickandmortyapi.com/api` (sin clave). Sin base de datos ni Firebase.

## Comandos
- `npm run dev` — servidor local.
- `npm run check` — tipos + ESLint (0 advertencias) + Prettier + pruebas con cobertura ≥ 80 %. **Debe pasar antes de cada commit.**
- `npm test` — solo pruebas. `npm run e2e` — Playwright (3 anchos + axe).
- `npm run format` — aplica Prettier.

## Estructura
```
src/app/            rutas: /, /personaje/[id], /favoritos + loading, error, not-found
src/components/     componentes (un .tsx + .module.css por componente)
src/hooks/          hooks propios (useDebounce, useFavoritos)
src/lib/            lógica pura y testeable: api.ts, filtros.ts, favoritos.ts, episodios.ts
tests/              pruebas Vitest (*.test.ts / *.test.tsx)
e2e/                pruebas Playwright
ia/                 pruebas de contención y BITACORA.md
calidad/            evidencias de Lighthouse, axe, capturas
```

## Lo que SÍ
- Lea `node_modules/next/dist/docs/` antes de usar una API de Next.js: esta versión cambia cosas.
- Componentes de servidor por defecto; `"use client"` solo donde haya estado o eventos.
- `searchParams` y `params` son **promesas**: `await`.
- Toda llamada a la API pasa por `src/lib/api.ts`, revisa `response.ok` y trata el 404 de búsqueda como lista vacía.
- Episodios y favoritos: **una sola petición** con ids separados por coma; normalice objeto/arreglo con `Array.isArray`.
- `localStorage` siempre dentro de `try/catch`; snapshot del servidor = `[]`.
- HTML semántico: un `<h1>`, `<button>` para acciones, `<a>`/`<Link>` para navegar, `<label>` por control.
- WCAG 2.2 AA: contraste ≥ 4,5:1, foco visible, objetivos ≥ 44 px, estado con texto (no solo color).
- `next/image` con `width`, `height`, `sizes` y `alt`.
- Nombres de dominio en español (`listarPersonajes`, `Tarjeta`), código y comentarios breves.
- Cada función nueva de `src/lib` llega con su prueba.

## Lo que NO
- **No leer** `.env*`, `*.pem`, `*.key`, `secrets/`, credenciales ni `~/.ssh`. No pedirlas ni imprimirlas.
- **No salir** de la carpeta del proyecto (ni leer ni escribir fuera).
- **No ejecutar sin permiso**: `git push`, `npm install`/`npm i`, `npx` que descargue paquetes, `vercel`, `curl` con POST, borrar con `rm -rf`.
- No `<div onClick>`, no `outline: none` sin sustituto, no `!important`, no anchos fijos en px.
- No `any`, no `// eslint-disable`, no `@ts-ignore`, no bajar el umbral de cobertura.
- No añadir dependencias sin justificarlas en la bitácora.
- No inventar campos de la API: confirme con `curl` o la documentación.

## Flujo de trabajo
1. Explique el plan en 3–5 viñetas antes de tocar varios archivos.
2. Cambios pequeños; un commit por paso con mensaje en español (`feat:`, `test:`, `fix:`, `docs:`, `chore:`).
3. Corra `npm run check`; si falla, arregle la causa, no la regla.
4. El estudiante registra en `ia/BITACORA.md` propósito, evidencia, validación y decisión.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
