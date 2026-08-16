# AMlist — Plan Maestro
> **Fuente única de verdad del proyecto** · Resume el estado actual, arquitectura y criterios de evaluación.
> Última actualización: 2026-07-22

---

## 0. Resumen del proyecto

| Campo | Valor |
|---|---|
| Nombre | **AMlist** |
| Tipo | SPA (Single Page Application) |
| Stack | React 19 + Vite, Pure Vanilla CSS tokens (Lavanda `#5A35D4` + Menta `#1D9E8B` MD3 Light/Dark) — Sin Tailwind |
| APIs | AniList GraphQL → MangaDex REST → Kitsu REST (triple fallback, sin Jikan) |
| Persistencia | 100 % cliente — `localStorage`, CRUD con integridad validada + `assertSchema` |
| Iconos | `lucide-react` |
| Enfoque | Mobile First · Clean Architecture (3 capas) · Sin backend · OWASP CSP Security |
| Pruebas | Vitest (57 tests unitarios) + Playwright E2E + Regresión Visual (10 snapshots) |
| Calidad | `oxlint` + `npm audit` (0 vulnerabilidades) |
| Repositorio | https://github.com/vicentemrk/AmList |

---

## 1. Arquitectura actual (3 capas — Clean Architecture)

```
src/
  domain/                     # Lógica pura, cero imports de React/fetch/localStorage
    itemSchema.js             # DEFAULT_ITEM, SECCIONES, ESTADOS_USUARIO, VALID_ESTADOS_USUARIO Set
    validators.js             # validarProgreso(), filtrarPorSeccion(), validarPuntuacion(), validarEstadoUsuario(), filtrarPorRangoPuntuacion()
    historial.js              # construirEntradaHistorial()
    genreTranslator.js        # Traductor de géneros de API a español
    sanitizer.js              # Sanitización contra XSS

  data/                       # Único punto de acceso a efectos secundarios
    apiClient.js              # AniList → MangaDex → Kitsu (triple fallback)
    itemsRepository.js        # CRUD sobre localStorage + assertSchema validation
    historyRepository.js      # Log de historial en localStorage
    themeRepository.js        # Persistencia del tema
    sortRepository.js         # Persistencia del criterio de ordenamiento
    viewRepository.js         # Persistencia de la densidad de vista (detailed / compact)
    snapshotRepository.js     # Puntos de restauración local
    jsonImporter.js           # Importador JSON
    malImporter.js            # Importador XML de MyAnimeList
    anilistImporter.js        # Importador AniList JSON
    kitsuImporter.js          # Importador Kitsu JSON

  presentation/               # React puro: hooks + componentes + páginas
    App.jsx
    hooks/
      useItems.js
      useViewDensity.js       # Hook de densidad de vista (modo compacto vs detallado)
      useSearch.js
      useDebounce.js
      useTheme.js
    components/
      AddModal/               # Modal de búsqueda + agregar (multi-add checkbox)
      DetailModal/            # Modal de vista de detalle expandida
      EditModal/              # Modal de edición completa
      ItemCard/               # Tarjeta con prop `density` ('detailed' | 'compact')
      ScoreRangeSlider/       # Slider dual CSS puro para rango de puntuación personal (1-10)
      SearchPanel/            # Panel de resultados de búsqueda
      Layout/AppShell/        # Shell con sidebar flotante centrado, header, footer
      SectionTabs/            # Pestañas arrastrables
      ThemeToggle/            # Sun/Moon
      ExportButton/           # Exportar JSON
      ImportButton/           # Importar XML/JSON
      HistorialModal/         # Historial cronológico
      Toast/                  # Notificaciones emergentes
    pages/
      ItemListPage.jsx        # Componente unificado con filtros, orden, densidad y slider de nota
      AnimeListPage.jsx       # Wrapper (media="anime")
      MangaListPage.jsx       # Wrapper (media="manga")

  index.css                   # System tokens (Lavanda/Menta) MD3 + Eye Care — Pure Vanilla CSS

docs/
  20_ideas_implementacion.md  # Matriz híbrida de priorización de ideas
  ROADMAP.md                  # Roadmap del proyecto y registro de versiones
  PLAN_MAESTRO.md             # Fuente única de verdad

e2e/                          # Pruebas End-to-End y Regresión Visual con Playwright
  app.spec.js
  visual.spec.js              # 10/10 visual regression snapshots (fixtures sintéticos)
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
