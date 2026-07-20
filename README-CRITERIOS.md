# README-CRITERIOS.md — AMlist

Mapeo de los 4 criterios de evaluación a archivos y funciones concretas.

---

## Criterio 1 — Arquitectura Limpia (Clean Architecture)

| Regla | Archivo | Función/Export |
|-------|---------|---------------|
| Lógica de dominio pura, sin React/fetch/localStorage | `src/domain/validators.js` | `validarProgreso()`, `filtrarPorSeccion()`, `validarPuntuacion()` |
| Dominio puro | `src/domain/historial.js` | `construirEntradaHistorial()` |
| Dominio puro | `src/domain/itemSchema.js` | `DEFAULT_ITEM`, `SECCIONES`, `SECCION_LABELS` |
| Único punto de fetch | `src/data/jikanClient.js` | `searchAnime()`, `searchManga()`, `getAnimeById()` |
| Único punto de localStorage para ítems | `src/data/itemsRepository.js` | `create()`, `getAll()`, `getById()`, `update()`, `remove()` |
| Único punto de localStorage para historial | `src/data/historyRepository.js` | `appendHistory()`, `getAllHistory()` |
| Único punto de localStorage para tema | `src/data/themeRepository.js` | `getTheme()`, `setTheme()` |
| La capa presentation no usa fetch ni localStorage | Todos los archivos bajo `src/presentation/` | Verificable con grep: `grep -r "fetch\|localStorage" src/presentation/` → sin resultados |

---

## Criterio 2 — Funcionalidades Requeridas

| Feature | Archivo | Detalle |
|---------|---------|---------|
| 8 secciones | `src/domain/itemSchema.js` | `SECCIONES` array; `SECCION_LABELS` object |
| Filtrado por sección | `src/domain/validators.js` | `filtrarPorSeccion(items, seccion, mediaType)` |
| Campos de ítem (id, imagen, título, tipo, puntuación, favorito, estado, estado emisión, progreso, tag) | `src/domain/itemSchema.js` | `DEFAULT_ITEM` shape |
| IDs deterministas `${media}_${malId}` | `src/data/itemsRepository.js` | `create()` — el id viene de la capa de presentación y sigue la convención |
| Bloqueo de progreso en UI | `src/presentation/components/ItemCard/ItemCard.jsx` | `handleProgressChange()` llama `validarProgreso()` antes de `onUpdate` |
| Bloqueo de progreso en repositorio | `src/data/itemsRepository.js` | `assertSchema()` llama `validarProgreso()` antes de escribir |
| Favorito independiente de puntuación | `src/presentation/components/ItemCard/ItemCard.jsx` | `handleFavorito()` y `handleScore()` son llamadas independientes |
| Búsqueda Jikan con debounce 500ms | `src/presentation/hooks/useSearch.js` + `src/presentation/hooks/useDebounce.js` | `useDebounce(query, 500)` |
| AbortController para cancelar búsquedas obsoletas | `src/presentation/hooks/useSearch.js` | `abortRef.current.abort()` al inicio de cada búsqueda |
| Preview con imagen + título + botón Agregar | `src/presentation/components/SearchPanel/SearchPanel.jsx` | `.search-panel__result` list items |
| Exportar a JSON | `src/presentation/components/ExportButton/ExportButton.jsx` | `handleExport()` — Blob + download link |
| Historial cronológico | `src/data/historyRepository.js` + `src/presentation/components/HistorialModal/HistorialModal.jsx` | Orden invertido al mostrar (newest first) |
| Navegación Animes / Mangas | `src/presentation/App.jsx` | `activePage` state + `onPageChange` prop |
| Mobile first / 360px | `src/index.css`, todos los `.css` de componentes | grid `minmax(280px, 1fr)`, overflow-x en tabs |
| Animaciones sutiles | `ItemCard.css`, `SearchPanel.css`, `HistorialModal.css`, `AppShell.css` | `cardIn`, `slideDown`, `sheetUp`, `expandIn` keyframes |
| Favicon propio | `public/favicon.svg` | SVG inline con colores de marca |
| Theme con variables exactas | `src/index.css` | `:root` y `[data-theme='dark']` con las 7 variables del prompt |
| Persistencia de tema | `src/data/themeRepository.js` + `src/presentation/hooks/useTheme.js` | `localStorage.setItem('amlist_theme', ...)` |

---

## Criterio 3 — API y Manejo de Errores

| Requisito | Archivo | Implementación |
|-----------|---------|---------------|
| Fetch nativo (sin Axios) | `src/data/jikanClient.js` | `fetch(url, { signal })` puro |
| Timeout de 12s | `src/data/jikanClient.js` | `AbortController` + `setTimeout(12000)` en `jikanFetch()` |
| Cancelación de búsquedas obsoletas | `src/presentation/hooks/useSearch.js` | `abortRef.current.abort()` antes de cada nueva búsqueda |
| Error 429 con mensaje legible | `src/data/jikanClient.js` | `if (response.status === 429)` → `JikanApiError('Demasiadas solicitudes...', 429)` |
| Error 404 | `src/data/jikanClient.js` | `if (response.status === 404)` |
| Error 5xx | `src/data/jikanClient.js` | `if (response.status >= 500)` |
| Error de red | `src/data/jikanClient.js` | `catch` de `AbortError` vs. error de red nativo |
| Respuesta malformada | `src/data/jikanClient.js` | Verifica `Array.isArray(json.data)` |
| `JikanApiError` tipado con `.code` | `src/data/jikanClient.js` | `class JikanApiError extends Error { constructor(msg, code) }` |
| Botón de reintento manual | `src/presentation/components/SearchPanel/SearchPanel.jsx` | `retry()` callback de `useSearch` + botón "Reintentar" |
| Caché en memoria (LRU 20 entradas) | `src/data/jikanClient.js` | `memCache` Map + `memGet()` / `memSet()` |
| Caché en localStorage (TTL 5min) | `src/data/jikanClient.js` | `lsGet()` / `lsSet()` con timestamp |
| Normalización a contrato de dominio | `src/data/jikanClient.js` | `normalizeAnime()` / `normalizeManga()` |
| Capa intercambiable para otras APIs | `src/data/jikanClient.js` | Comentario al final: "ALTERNATIVE API LAYER (ready to swap)" |

---

## Criterio 4 — Calidad de Código y UX

| Aspecto | Archivo | Detalle |
|---------|---------|---------|
| Solo componentes funcionales | Todos los `.jsx` | `function Component() {}` — sin clases |
| Sin lógica de negocio en JSX | `ItemCard.jsx`, `SearchPanel.jsx`, `AnimeListPage.jsx` | Handlers fuera del JSX; JSX solo renderiza estado |
| `key` estable por `item.id` | `AnimeListPage.jsx`, `MangaListPage.jsx` | `key={item.id}` en todos los `.map()` |
| Accesibilidad: `alt` en imágenes | `SearchPanel.jsx`, `ItemCard.jsx` | `alt={...}` en todos los `<img>` |
| Accesibilidad: `aria-label` | Todos los botones de icono | `ThemeToggle`, `ExportButton`, `ItemCard.fav`, etc. |
| Accesibilidad: foco visible | `src/index.css` + CSS de componentes | `:focus-visible` global; `:focus-visible` en cada interactivo |
| Recuperación de JSON corrupto | `src/data/itemsRepository.js`, `historyRepository.js`, `themeRepository.js` | `try/catch` en todos los `JSON.parse` |
| `README-CRITERIOS.md` | Este archivo | ✓ |

---

## Decisiones Técnicas Documentadas

1. **Sin react-router**: la navegación entre Anime/Manga usa un `useState` en `App.jsx`. Evita dependencias innecesarias y es suficiente para 2 páginas.
2. **Sin TypeScript**: JavaScript puro con JSDoc mantiene el setup lean. Los contratos de dominio están documentados con `@typedef`.
3. **Vite + React**: bundler moderno, dev server rápido, sin configuración extra.
4. **`AbortSignal.any()` con fallback**: navegadores muy antiguos no soportan `AbortSignal.any`; se cae al signal del timeout únicamente.
5. **Historial máximo 500 entradas**: limita el crecimiento ilimitado del localStorage.
6. **IDs deterministas**: `${mediaType}_${malId}` garantiza que agregar el mismo título dos veces no duplica el ítem.
7. **Alternativa API gratuita**: AniList GraphQL y Kitsu son APIs gratuitas y sin autenticación. La capa `jikanClient.js` está diseñada para intercambiarlas sin tocar la UI.

---

## Verificación QA — Checklist

- [ ] Las 8 secciones renderizan ítems correctos
- [ ] Preview de Jikan muestra imagen + título + botón Agregar
- [ ] Progreso actual > máximo: error visible, guardado bloqueado en UI Y repositorio
- [ ] Favorito se puede cambiar sin afectar la puntuación (y viceversa)
- [ ] Exportar JSON descarga un archivo válido
- [ ] Historial muestra eventos en orden cronológico inverso
- [ ] El tema persiste al recargar la página
- [ ] La app funciona en viewport de 360px
- [ ] El favicon aparece en la pestaña del navegador
- [ ] Los datos de localStorage sobreviven un hard refresh
- [ ] `grep -r "fetch\|localStorage" src/presentation/` → sin resultados
- [ ] Error 429 de Jikan → aparece mensaje legible + botón Reintentar
- [ ] `npm run build` termina sin errores
