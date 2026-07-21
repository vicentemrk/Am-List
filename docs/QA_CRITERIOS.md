# AMlist — QA y Criterios de Evaluación
> Documento de trazabilidad técnica. Referenciado por `PLAN_MAESTRO.md`.
> Última actualización: 2026-07-21

---

## Criterio 1 — Arquitectura Limpia (Clean Architecture)

| Regla | Archivo | Función/Export |
|---|---|---|
| Lógica de dominio pura, sin React/fetch/localStorage | `src/domain/validators.js` | `validarProgreso()`, `filtrarPorSeccion()`, `validarPuntuacion()` |
| Historial puro | `src/domain/historial.js` | `construirEntradaHistorial()` |
| Esquema y secciones del dominio | `src/domain/itemSchema.js` | `DEFAULT_ITEM`, `SECCIONES`, `SECCION_LABELS` |
| Único punto de fetch | `src/data/apiClient.js` | `searchAnime()`, `searchManga()` (triple fallback) |
| Único punto de localStorage para ítems | `src/data/itemsRepository.js` | `create()`, `getAll()`, `getById()`, `update()`, `remove()` |
| Único punto de localStorage para historial | `src/data/historyRepository.js` | `appendHistory()`, `getAllHistory()` |
| Único punto de localStorage para tema | `src/data/themeRepository.js` | `getTheme()`, `setTheme()` |
| La capa presentation no usa fetch ni localStorage | Todos los `.jsx` bajo `src/presentation/` | Verificable: `grep -r "fetch\|localStorage" src/presentation/` → sin resultados |

---

## Criterio 2 — Funcionalidades Requeridas

| Feature | Archivo | Detalle |
|---|---|---|
| 8 secciones | `src/domain/itemSchema.js` | `SECCIONES` array; `SECCION_LABELS` object |
| Filtrado por sección | `src/domain/validators.js` | `filtrarPorSeccion(items, seccion, mediaType)` |
| Estado inicial al agregar = `por_ver` | `src/domain/itemSchema.js` | `DEFAULT_ITEM.estado = 'por_ver'` |
| `estadoEmision` nunca auto-asignado desde API | `src/data/itemsRepository.js` | `create()` fuerza `estadoEmision: null` si no viene explícito del usuario |
| Bloqueo de progreso en UI | `src/presentation/components/EditModal/EditModal.jsx` | Llama `validarProgreso()` antes de `onUpdate` |
| Bloqueo de progreso en repositorio | `src/data/itemsRepository.js` | `assertSchema()` llama `validarProgreso()` antes de escribir |
| Límite de progreso a 9999 | `src/domain/validators.js` | Validación con `MAX_PROGRESO = 9999` |
| Doble puntuación (comunidad + usuario) | `src/presentation/components/ItemCard/ItemCard.jsx` + `EditModal.jsx` | `puntuacionApi` (dorado) y `puntuacion` (morado) son campos independientes |
| Favorito independiente de puntuación | `src/presentation/components/ItemCard/ItemCard.jsx` | `handleFavorito()` y `handleScore()` son handlers separados |
| Búsqueda con debounce 500ms | `src/presentation/hooks/useSearch.js` + `useDebounce.js` | `useDebounce(query, 500)` |
| AbortController para cancelar búsquedas obsoletas | `src/presentation/hooks/useSearch.js` | `abortRef.current.abort()` al inicio de cada búsqueda |
| Preview con imagen + título + botón Agregar | `src/presentation/components/SearchPanel/SearchPanel.jsx` | Lista de resultados con imagen + nombre |
| Agregar múltiples ítems sin cerrar modal | `src/presentation/components/AddModal/AddModal.jsx` | Checkbox "Agregar múltiples" |
| Multi-tags (máx 5) | `src/presentation/components/EditModal/EditModal.jsx` | Input inline + botón + × por tag |
| Descripción personal | `src/presentation/components/EditModal/EditModal.jsx` + `ItemCard.jsx` | Campo `descripcionPersonal` |
| Sinopsis + géneros de la API | `src/data/apiClient.js` | `normalizeAnime()`, `normalizeManga()` |
| Exportar a JSON | `src/presentation/components/ExportButton/ExportButton.jsx` | `handleExport()` — Blob + download link |
| Importar MAL XML | `src/data/malImporter.js` + `src/presentation/components/ImportButton/ImportButton.jsx` | `DOMParser` estándar, prioriza datos locales ante duplicados |
| Historial cronológico | `src/data/historyRepository.js` + `src/presentation/components/HistorialModal/HistorialModal.jsx` | Orden invertido (newest first) |
| Drag & drop con handle | `src/presentation/pages/AnimeListPage.jsx`, `MangaListPage.jsx` | Handle visible en modo "Orden personalizado" |
| Barra de búsqueda local | `src/presentation/pages/AnimeListPage.jsx`, `MangaListPage.jsx` | Filtra por título, tags y descripción personal |
| Ordenamiento | `src/presentation/pages/AnimeListPage.jsx`, `MangaListPage.jsx` | 5 criterios: reciente, A-Z, puntuación, progreso, personal |
| Navegación Animes / Mangas | `src/presentation/App.jsx` | `activePage` state |
| Mobile first / 360px | `src/index.css`, CSS de componentes | Grid `minmax(280px, 1fr)`, overflow-x en tabs |
| Animaciones sutiles | `ItemCard.css`, `AppShell.css`, `AddModal.css` | keyframes: `cardIn`, `sheetUp`, `expandIn` |
| Favicon propio | `public/favicon.svg` | SVG con colores de marca |
| Theme con variables exactas + eye-care | `src/index.css` | `:root` y `[data-theme='dark']` |
| Persistencia de tema | `src/data/themeRepository.js` + `src/presentation/hooks/useTheme.js` | `localStorage.setItem('amlist_theme', ...)` |
| Footer con créditos de APIs | `src/presentation/components/Layout/AppShell.jsx` | Links a AniList, Kitsu, MangaDex |

---

## Criterio 3 — Triple Fallback de APIs y Manejo de Errores

| Requisito | Archivo | Implementación |
|---|---|---|
| Fetch nativo (sin Axios) | `src/data/apiClient.js` | `fetch(url, { signal })` puro |
| Triple fallback | `src/data/apiClient.js` | AniList → MangaDex → Kitsu |
| Timeout de 12s | `src/data/apiClient.js` | `AbortController` + `setTimeout(12000)` |
| Cancelación de búsquedas obsoletas | `src/presentation/hooks/useSearch.js` | `abortRef.current.abort()` antes de cada búsqueda nueva |
| Error 429 con mensaje legible | `src/data/apiClient.js` | `if (status === 429)` → error tipado |
| Error 404 | `src/data/apiClient.js` | `if (status === 404)` |
| Error 5xx | `src/data/apiClient.js` | `if (status >= 500)` |
| Error de red | `src/data/apiClient.js` | `catch` de `AbortError` vs error de red nativo |
| Respuesta malformada | `src/data/apiClient.js` | Verifica forma de la respuesta antes de mapear |
| Botón de reintento manual | `src/presentation/components/SearchPanel/SearchPanel.jsx` | `retry()` callback |
| Caché en memoria (LRU 20 entradas) | `src/data/apiClient.js` | `memCache` Map |
| Caché en localStorage (TTL 5min) | `src/data/apiClient.js` | con timestamp |
| Normalización a contrato de dominio | `src/data/apiClient.js` | `normalizeAnime()` / `normalizeManga()` |
| Tests automatizados | `src/data/apiClient.test.js` | 100% pasan, cubre fallback AniList → MangaDex → Kitsu |

---

## Criterio 4 — Calidad de Código y UX

| Aspecto | Archivo | Detalle |
|---|---|---|
| Solo componentes funcionales | Todos los `.jsx` | `function Component() {}` — sin clases |
| Sin lógica de negocio en JSX | `ItemCard.jsx`, `EditModal.jsx`, `AnimeListPage.jsx` | Handlers fuera del JSX; JSX solo renderiza estado |
| `key` estable por `item.id` | `AnimeListPage.jsx`, `MangaListPage.jsx` | `key={item.id}` en todos los `.map()` |
| Accesibilidad: `alt` en imágenes | `SearchPanel.jsx`, `ItemCard.jsx` | `alt={titulo}` |
| Accesibilidad: `aria-label` | Botones de icono en toda la app | `ThemeToggle`, `ExportButton`, botón favorito, etc. |
| Accesibilidad: foco visible | `src/index.css` | `:focus-visible` global |
| Recuperación de JSON corrupto | `src/data/itemsRepository.js`, `historyRepository.js`, `themeRepository.js` | `try/catch` en todos los `JSON.parse` |
| Lucide-react (sin emojis) | Toda la iconografía | `lucide-react` tree-shakeable |

---

## Checklist QA para cierre del MVP

- [ ] Las 8 secciones renderizan ítems correctos
- [ ] Preview de búsqueda muestra imagen + título + botón Agregar
- [ ] Progreso actual > máximo: error visible, guardado bloqueado en UI y repositorio
- [ ] Doble puntuación funciona de forma independiente (API vs usuario)
- [ ] Favorito se puede cambiar sin afectar la puntuación (y viceversa)
- [ ] Exportar JSON descarga un archivo válido
- [ ] Importar MAL XML no sobreescribe datos locales existentes
- [ ] Historial muestra eventos en orden cronológico inverso
- [ ] El tema persiste al recargar la página
- [ ] La app funciona en viewport de 360px sin scroll horizontal
- [ ] El favicon aparece en la pestaña del navegador
- [ ] Los datos de localStorage sobreviven un hard refresh
- [ ] `grep -r "fetch\|localStorage" src/presentation/` → sin resultados
- [ ] Error de API → aparece mensaje legible + botón Reintentar
- [ ] `npm run build` termina sin errores ni warnings
- [ ] `npm run test` → todos los tests pasan
- [ ] Manhwa/Manhua: MangaDex entrega tipo correcto y se muestra en ItemCard
- [ ] Filtro por tags muestra solo ítems con los tags seleccionados
