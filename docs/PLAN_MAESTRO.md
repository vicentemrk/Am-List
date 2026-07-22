# AMlist — Plan Maestro
> **Fuente única de verdad del proyecto** · Resume el estado actual, arquitectura y criterios de evaluación.
> Última actualización: 2026-07-22

---

## 0. Resumen del proyecto

| Campo | Valor |
|---|---|
| Nombre | **AMlist** |
| Tipo | SPA (Single Page Application) |
| Stack | React 19 + Vite, CSS con variables (Light Eye-Care `#ced2d0` / Dark Navy `#0A1B1F`) |
| APIs | AniList GraphQL → MangaDex REST → Kitsu REST (triple fallback, sin Jikan) |
| Persistencia | 100 % cliente — `localStorage`, CRUD con integridad validada |
| Iconos | `lucide-react` |
| Enfoque | Mobile First · Clean Architecture (3 capas) · Sin backend |
| Pruebas | Vitest (13 tests unitarios) + Playwright E2E |
| Calidad | `oxlint` (0 errores, 0 advertencias) |
| Repositorio | https://github.com/vicentemrk/AmList |

---

## 1. Arquitectura actual (3 capas — Clean Architecture)

```
src/
  domain/                     # Lógica pura, cero imports de React/fetch/localStorage
    itemSchema.js             # DEFAULT_ITEM, SECCIONES, SECCION_LABELS
    validators.js             # validarProgreso(), filtrarPorSeccion(), validarPuntuacion()
    historial.js              # construirEntradaHistorial()

  data/                       # Único punto de acceso a efectos secundarios
    apiClient.js              # AniList → MangaDex → Kitsu (triple fallback)
    apiClient.test.js         # Tests: 100% pasan, sin rastro de Jikan
    itemsRepository.js        # CRUD sobre localStorage (create/getAll/getById/update/remove)
    historyRepository.js      # Log de historial en localStorage
    themeRepository.js        # Persistencia del tema
    jsonImporter.js           # Importador JSON con sanitización XSS
    jsonImporter.test.js      # Tests unitarios de importación JSON
    malImporter.js            # Importador de XML de MyAnimeList con sanitización

  presentation/               # React puro: hooks + componentes + páginas
    App.jsx
    hooks/
      useItems.js
      useItems.test.js        # Pruebas unitarias de repositorio e integridad
      useSearch.js
      useDebounce.js
      useTheme.js
    components/
      AddModal/               # Modal de búsqueda + agregar (multi-add checkbox)
      EditModal/              # Modal de edición completa (puntuación, tags, descripción)
      ItemCard/               # Tarjeta de ítem optimizada con React.memo
      SearchPanel/            # Panel de resultados de búsqueda
      Layout/AppShell/        # Shell con sidebar flotante centrado, header, footer
      SectionTabs/            # Pestañas arrastrables (scroll)
      ThemeToggle/            # Sun/Moon (lucide-react)
      ExportButton/           # Descarga amlist_export_{fecha}.json
      ImportButton/           # Importa XML de MyAnimeList / JSON AMlist
      FloatingActionButton/   # FAB mobile-only (+ agregar)
      HistorialModal/         # Historial cronológico descendente
      Toast/                  # Notificaciones emergentes (sin ícono de checkmark sobrante)
    pages/
      ItemListPage.jsx        # Componente genérico unificado para Anime y Manga (ADR-0002)
      AnimeListPage.jsx       # Wrapper delgado sobre ItemListPage (media="anime")
      MangaListPage.jsx       # Wrapper delgado sobre ItemListPage (media="manga")

  index.css                   # Tokens CSS + Eye Care Design (#ced2d0) + Mobile First

docs/
  adr/                        # Registros de Decisiones de Arquitectura
    0001-local-first-and-api-fallback.md
    0002-unified-item-list-page.md
  recomendaciones.md          # Recomendaciones ejecutivas de mejora
  20_ideas_implementacion.md  # Matriz híbrida de priorización de ideas

e2e/                          # Pruebas End-to-End con Playwright
  app.spec.js
```

**Regla de dependencia (invariante):**
```
presentation → domain, data
data         → domain
domain       → (nada)
```

> [!IMPORTANT]
> `grep -r "fetch|localStorage" src/presentation/` → debe dar 0 resultados siempre.

---

## 2. Modelo de datos (domain/itemSchema.js)

```js
/**
 * @typedef {Object} Item
 * @property {string}  id              — `${mediaType}_${malId}`, determinista, sin duplicados
 * @property {number}  malId           — ID de AniList/MangaDex/Kitsu
 * @property {'anime'|'manga'} mediaType
 * @property {string}  titulo
 * @property {string}  imagen
 * @property {string}  tipo            — TV/OVA/Movie/Special | Manga/Manhwa/Manhua/One-shot
 * @property {'por_ver'|'en_curso'|'completado'|'dropeado'|'pausado'} estadoUsuario
 * @property {'airing'|'complete'|'upcoming'|'unknown'} estadoEmision
 * @property {number|null}  puntuacionApi    — Score de la comunidad (dorado)
 * @property {number|null}  puntuacion       — Score del usuario (morado), 1-10 o null
 * @property {boolean} favorito
 * @property {{actual:number, maximo:number|null}} progreso
 * @property {string[]} tags            — Máximo 5 tags
 * @property {string}  descripcionPersonal — Texto libre del usuario
 * @property {string[]} genres          — Desde la API
 * @property {string}  sinopsis         — Desde la API, truncada en UI
 * @property {number}  ordenManual      — Para drag and drop
 * @property {string}  creadoEn         — ISO 8601
 * @property {string}  actualizadoEn    — ISO 8601
 */
```

---

## 3. Las 8 secciones

| Sección | Filtro |
|---|---|
| Lista completa | todos |
| Completados | `estadoUsuario === 'completado'` |
| Por ver / Por mirar | `estadoUsuario === 'por_ver'` ← **estado por defecto al agregar** |
| Favoritos | `favorito === true` (cruza cualquier estado) |
| En curso / Mirando | `estadoUsuario === 'en_curso'` |
| En emisión | `estadoEmision === 'airing'` |
| Finalizados | `estadoEmision === 'complete'` |
| Dropeados / Abandonados | `estadoUsuario === 'dropeado'` |

---

## 4. APIs (apiClient.js) — Triple Fallback

```
AniList GraphQL (primaria) → MangaDex REST (respaldo 1) → Kitsu REST (respaldo 2)
```

- **Jikan fue eliminado permanentemente** del proyecto.
- Caché en memoria (LRU 20 entradas) + localStorage (TTL 5 min).
- Timeout: 12s con `AbortController`. Errores tipados.

---

## 5. Theming — Eye Care Design

```css
:root {
  --bg:               #ced2d0;   /* Gris hueso mate descansado */
  --surface:          #FFFFFF;   /* Superficie clara de tarjetas */
  --text-primary:     #0A1B1F;
  --text-muted:       #4A6065;
  --accent-visto:     #0096B3;
  --accent-completado:#562ca7;
  --border:           #B8C0BE;
}

[data-theme='dark'] {
  --bg:               #0A1B1F;
  --surface:          #14282D;
  --text-primary:     #E2ECF0;
  --text-muted:       #829DA3;
  --accent-visto:     #00E9FF;
  --accent-completado:#a278f3;
  --border:           #243C42;
}
```

Toggle: `Sun` / `Moon` de `lucide-react`. Persiste en localStorage.

---

## 6. Estado de tareas MVP

### ✅ Completado

- [x] Setup Vite + React 19 + estructura `domain/data/presentation`
- [x] Tokens CSS light/dark (Gris hueso Eye-Care `#ced2d0`) + favicon SVG
- [x] Componente genérico `ItemListPage.jsx` unificando Anime y Manga (ADR-0002)
- [x] `data/itemsRepository.js` — CRUD + integridad + recuperación de JSON corrupto
- [x] `data/jsonImporter.js` y `malImporter.js` con sanitización contra XSS
- [x] `apiClient.js` — Triple fallback AniList → MangaDex → Kitsu (sin Jikan)
- [x] Pruebas unitarias en Vitest (13 tests pasando al 100%)
- [x] Script `npm run test:coverage` agregado
- [x] Pruebas E2E configuradas con Playwright (`e2e/app.spec.js`)
- [x] Linter oxlint ejecutado con 0 errores y 0 advertencias
- [x] Notificación Toast limpia (sin checkmark redundante)
- [x] Accesibilidad táctil móvil ajustada a 44px
- [x] Registros de decisión de arquitectura en `docs/adr/` (ADR-0001, ADR-0002)
- [x] Subida a GitHub: https://github.com/vicentemrk/AmList

---

## 7. Criterios de evaluación — Trazabilidad

Ver detalles completos en [`docs/QA_CRITERIOS.md`](./QA_CRITERIOS.md), [`docs/ROADMAP.md`](./ROADMAP.md) y [`docs/recomendaciones.md`](./recomendaciones.md).
