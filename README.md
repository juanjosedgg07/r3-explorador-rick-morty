# Explorador de Rick and Morty · Taller R3

Aplicación Next.js que explora [The Rick and Morty API](https://rickandmortyapi.com) con búsqueda, filtros y paginación guardados en la URL, detalle por personaje con sus episodios y lista de favoritos sincronizada entre pestañas.

**Producción:** https://r3-explorador-rick-morty.vercel.app

## Requisitos

- Node.js LTS (≥ 20.9) y npm
- Git

## Instalar y ejecutar

```bash
npm install
npm run dev          # http://localhost:3000
```

## Comprobar y probar

```bash
npm run check        # tipos + ESLint (0 advertencias) + Prettier + Vitest con cobertura ≥ 80 %
npm test             # solo pruebas unitarias y de interfaz (Vitest + RTL + axe)
npx playwright install chromium   # solo la primera vez
npm run e2e          # Playwright: 3 anchos × 2 temas × 5 rutas con axe + criterios de aceptación
BASE_URL=https://r3-explorador-rick-morty.vercel.app npm run e2e   # contra producción
```

## Rutas

| Ruta              | Qué hace                                                                                                                         |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `/`               | Lista con filtros (nombre con debounce, estado, especie, género) y paginación, todo en la URL: `/?name=rick&status=alive&page=2` |
| `/personaje/[id]` | Foto, datos (`<dl>`), origen, ubicación y episodios agrupados por temporada (una sola petición a `/episode/1,2,3`)               |
| `/favoritos`      | Favoritos de `localStorage` pedidos en una sola petición (`/character/1,2,3`)                                                    |
| `/aleatorio`      | Redirige a un personaje al azar (con JS: animación de portal)                                                                    |

Archivos especiales: `loading.tsx`, `error.tsx` (con «Reintentar»), `not-found.tsx`, `personaje/[id]/not-found.tsx` y `personaje/[id]/loading.tsx`.

## Requisitos funcionales

| RF                                                                              | Dónde                                                      |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| RF-01 lista en el servidor con `await searchParams`                             | `src/app/page.tsx`                                         |
| RF-02 filtros de cliente, debounce 400 ms, `router.replace`, vuelta a `page=1`  | `src/components/Filtros.tsx`, `src/hooks/useDebounce.ts`   |
| RF-03 paginación con extremos deshabilitados, «Página X de Y» y total           | `src/components/Paginacion.tsx`                            |
| RF-04 404 de la API = estado vacío con «Limpiar los filtros»                    | `src/lib/api.ts`, `src/app/page.tsx`                       |
| RF-05 episodios en una petición, `notFound()` para id inexistente o no numérico | `src/app/personaje/[id]/page.tsx`                          |
| RF-06 favorito con `aria-pressed`, `useSyncExternalStore`, evento `storage`     | `src/lib/favoritos.ts`, `src/components/BotonFavorito.tsx` |
| RF-07 `/favoritos` con una sola petición y quitar                               | `src/components/ListaFavoritos.tsx`                        |
| RF-08 caché de una hora (`next: { revalidate: 3600 }`)                          | `src/lib/api.ts`                                           |

## Valor agregado (más allá del enunciado)

- **Diseño temático «portal interdimensional»**: tema claro (laboratorio) y oscuro (espacio con estrellas), alto contraste, tipografía de cómic en títulos e íconos SVG propios (portal, probeta, pistola de rayos, átomo, radar, antena, platillo).
- **Portada animada**: portal en CSS con personajes oficiales de la API en órbita que **cambian en cada vuelta**, y cifras del multiverso (personajes, ubicaciones, episodios) con `Promise.all` y contador animado.
- **«Al azar»** con animación de portal mientras carga, y `loading` del detalle con portal.
- **Animaciones**: entrada escalonada de tarjetas, borde de portal giratorio, latido del favorito, transiciones de vista. Todas respetan `prefers-reduced-motion`.
- **Vistos recientemente** (historial en `localStorage`), **atajo `/`** para buscar, filtro por **especie**, paginación numerada, migas de pan, personaje anterior/siguiente, primera y última aparición, episodios agrupados por temporada con fechas en español (`Intl`).
- **Favoritos**: orden por nombre, exportar a JSON, «Quitar todos» con `<dialog>`; funcionan en memoria si `localStorage` está bloqueado.
- **Robustez**: reintentos ante 429/5xx con `Retry-After`, tiempo límite por petición, cancelación con `AbortController`.
- **SEO**: metadatos por ruta, Open Graph (imagen generada y foto del personaje), JSON-LD, `sitemap.xml`, `robots.txt`, `manifest`, canónicas y `noindex` en combinaciones de filtros.
- **Seguridad**: cabeceras (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS), sin `X-Powered-By`.
- **Impresión** (`@media print`) y métricas reales de Web Vitals en consola (`window.__webVitals`).

## Estructura

```
src/app/          rutas y archivos especiales
src/components/   componentes (+ .module.css)
src/hooks/        useDebounce, useFavoritos
src/lib/          api, filtros, episodios, favoritos, recientes, paginas (lógica pura)
tests/            Vitest + React Testing Library + axe-core
e2e/              Playwright + @axe-core/playwright
ia/               configuración de IA: pruebas de contención y BITACORA.md
calidad/          evidencias (Lighthouse, capturas, axe) → ver CALIDAD.md
```

## IA

Configuración en el primer commit: `AGENTS.md`, `.ia/politica.json` y el hook `.ia/hooks/proteger.mjs`. Detalle en [`ia/README.md`](ia/README.md) y bitácora en [`ia/BITACORA.md`](ia/BITACORA.md).

## Créditos

Datos e imágenes de personajes: [The Rick and Morty API](https://rickandmortyapi.com). _Rick and Morty_ es una marca de sus respectivos dueños; este es un proyecto académico sin fines comerciales.
