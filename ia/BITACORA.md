# Bitácora de uso de IA

Asistente: agente de IA de programación en terminal, con la configuración del primer commit (`AGENTS.md`, `.ia/politica.json`, hook `.ia/hooks/proteger.mjs`).

Formato de cada entrada: **propósito · evidencia · validación · decisión**.

## Usos

| #   | Propósito                                              | Evidencia                                                                                                                     | Validación                                                                                         | Decisión                          |
| --- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------- |
| 1   | Configuración de IA antes de escribir código           | Commit `chore(ia): configuración de IA…` (primero del historial)                                                              | `ia/contencion.test.ts` (38 casos) dentro de `npm run check`                                       | Aceptado                          |
| 2   | Capa de datos (`api.ts`, `filtros.ts`, `episodios.ts`) | Commit `feat(datos)…`; casos de la API comprobados antes con `curl` (404 en búsqueda vacía, objeto vs. arreglo en `/episode`) | `tests/api.test.ts`, `tests/filtros.test.ts` con `fetch` simulado                                  | Aceptado                          |
| 3   | Favoritos con `useSyncExternalStore`                   | `src/lib/favoritos.ts`, `src/hooks/useFavoritos.ts`                                                                           | Pruebas de referencia estable, evento `storage` y `localStorage` bloqueado; e2e criterio 6 y 7     | Aceptado                          |
| 4   | Filtros con debounce de 400 ms                         | `src/components/Filtros.tsx`                                                                                                  | RTL con `vi.useFakeTimers()` (una sola llamada a `router.replace`) y e2e «morty → 1 actualización» | Aceptado tras corrección (caso C) |
| 5   | Interfaz, tema visual y animaciones                    | Commits `feat(ui)`, `feat(diseño)`                                                                                            | axe en Vitest y Playwright (30 combinaciones, 0 violaciones), capturas en `calidad/capturas`       | Aceptado tras corrección (caso D) |
| 6   | Pruebas e2e con Playwright                             | `e2e/*.spec.ts`                                                                                                               | `npm run e2e`: 42 pruebas en verde                                                                 | Aceptado tras corrección (caso E) |

## Casos en que se rechazó o corrigió a la IA

### A · Identidad de Git (rechazado)

- **Propuesta de la IA:** configurar `git config user.email` con el correo de la cuenta del asistente.
- **Problema:** no es la identidad de GitHub del estudiante; los commits no quedarían vinculados a su perfil.
- **Corrección:** se rechazó el comando y se pidió tomar usuario y correo de la sesión de GitHub (`gh auth status`, `gh api user`). Se usó el correo _noreply_ de GitHub de la cuenta.

### B · Coautoría en los commits (rechazado y revertido)

- **Propuesta de la IA:** añadir una línea `Co-Authored-By` del asistente al final de cada mensaje de commit.
- **Problema:** el trabajo es individual y la bitácora ya documenta el uso de IA.
- **Corrección:** se pidió quitarlo; la IA reescribió los 3 commits existentes (`git filter-branch --msg-filter`) antes de publicar nada y no volvió a añadirlo.

### C · Debounce que reescribía la URL al limpiar (corregido)

- **Propuesta de la IA:** un `useEffect` con `[valorRetrasado, nombreUrl]` como dependencias.
- **Problema detectado al revisar:** al pulsar «Limpiar», `nombreUrl` cambia a `""` mientras el valor retrasado aún es `"mor"`, y el efecto volvía a escribir `name=mor` en la URL.
- **Corrección:** el efecto depende solo del valor retrasado (`useEffectEvent` para leer la URL actual) y la sincronización URL → campo se hace con «ajuste de estado durante el render». Sin `eslint-disable` (prohibido en `AGENTS.md`).

### D · Diseño genérico (rechazado)

- **Propuesta de la IA:** una interfaz correcta pero neutra (verde/blanco genérico).
- **Problema:** no transmitía el tema de la serie.
- **Corrección:** se pidió un diseño propio del universo: tema «portal interdimensional», tipografía de cómic en títulos, íconos originales (portal, probeta, pistola de rayos, platillo), animaciones y órbita de personajes que rota en cada vuelta. Se mantuvieron contraste AA, `prefers-reduced-motion` y 0 violaciones de axe.

### E · Imágenes tomadas de la web (rechazado por la IA, decisión aceptada)

- **Pedido:** buscar en internet imágenes reales de la serie para decorar.
- **Problema:** las imágenes sueltas de la web suelen tener derechos de autor y el sitio queda público.
- **Decisión:** usar solo los avatares oficiales que sirve la propia API (pensados para este uso) y arte propio en CSS/SVG.

### F · Reto «funciona sin JavaScript» (descartado tras medir)

- **Propuesta de la IA:** declarar el reto porque el formulario tiene `method="get"`.
- **Problema detectado con Playwright sin JS:** con `loading.tsx` el contenido llega por _streaming_ y sin JavaScript la página se queda en el esqueleto.
- **Decisión:** no se declara ese reto; se eligieron otros cinco con evidencia (ver `CALIDAD.md`).

### G · Errores 429 en pruebas paralelas (corregido)

- **Hallazgo:** con varias pruebas en paralelo la API devolvía 429 y aparecía la pantalla de error.
- **Validación:** `curl` en paralelo confirmó el límite (~30 peticiones seguidas).
- **Corrección:** reintentos con `Retry-After` o retroceso exponencial (máx. 3) en `pedir()`, con pruebas.

## Reglas que seguí

- No compartí contraseñas, claves ni datos personales con la IA.
- `git push` y el despliegue los ejecuté yo o los autoricé explícitamente en el momento.
- Revisé y puedo explicar cada archivo entregado.
