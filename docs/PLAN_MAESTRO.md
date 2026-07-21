# AMlist — Plan Maestro
> **Fuente única de verdad del proyecto** · Reemplaza `Plan-AMlist.md`, `REFACTOR_PLAN.md` y resume el estado actual.
> Última actualización: 2026-07-21

---

## 0. Resumen del proyecto

| Campo | Valor |
|---|---|
| Nombre | **AMlist** |
| Tipo | SPA (Single Page Application) |
| Stack | React 18 + Vite, CSS con variables (light/dark/eye-care) |
| APIs | AniList GraphQL → MangaDex REST → Kitsu REST (triple fallback, sin Jikan) |
| Persistencia | 100 % cliente — `localStorage`, CRUD con integridad validada |
| Iconos | `lucide-react` |
| Enfoque | Mobile First · Clean Architecture (3 capas) · Sin backend |
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
    malImporter.js            # Importador de XML de MyAnimeList

  presentation/               # React puro: hooks + componentes + páginas
    App.jsx
    hooks/
      useItems.js
      useSearch.js
      useDebounce.js
      useTheme.js
    components/
      AddModal/               # Modal de búsqueda + agregar (multi-add checkbox)
      EditModal/              # Modal de edición completa (puntuación, tags, descripción)
      ItemCard/               # Tarjeta de ítem (drag handle, doble puntuación)
      SearchPanel/            # Panel de resultados de búsqueda
      Layout/AppShell/        # Shell con sidebar flotante centrado, header, footer
      SectionTabs/            # Pestañas arrastrables (scroll)
      ThemeToggle/            # Sun/Moon (lucide-react)
      ExportButton/           # Descarga amlist_export_{fecha}.json
      ImportButton/           # Importa XML de MyAnimeList
      FloatingActionButton/   # FAB mobile-only (+ agregar)
      HistorialModal/         # Historial cronológico descendente
    pages/
      AnimeListPage.jsx
      MangaListPage.jsx

  index.css                   # Tokens CSS + Eye Care Design + Mobile First

public/
  favicon.svg                 # SVG con colores de marca
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
 * @property {string}  id              — `${media}_${malId}`, determinista, sin duplicados
 * @property {number}  malId           — ID de AniList/MangaDex/Kitsu
 * @property {'anime'|'manga'} media
 * @property {string}  titulo
 * @property {string}  imagen
 * @property {string}  tipo            — TV/OVA/Movie/Special | Manga/Manhwa/Manhua/One-shot
 * @property {'por_ver'|'en_curso'|'completado'|'dropeado'|'pausado'} estado
 * @property {'en_emision'|'finalizado'|null} estadoEmision — NO se asigna automáticamente
 * @property {number|null}  puntuacionApi    — Score de la comunidad (dorado)
 * @property {number|null}  puntuacion       — Score del usuario (morado), 1-10 o null
 * @property {boolean} favorito
 * @property {{actual:number, maximo:number|null, unidad:'episodio'|'capitulo'}} progreso
 * @property {string[]} tags            — Máximo 5 tags
 * @property {string}  descripcionPersonal — Texto libre del usuario
 * @property {string[]} generos         — Desde la API
 * @property {string}  sinopsis         — Desde la API, truncada en UI
 * @property {number}  ordenPersonal    — Para drag and drop
 * @property {string}  fechaAgregado    — ISO 8601
 * @property {string}  fechaActualizado — ISO 8601
 */
```

**Nota Manhwa/Manhua:** Se tratan como `media: 'manga'` con `tipo: 'Manhwa'` o `tipo: 'Manhua'`.
MangaDex los devuelve con esos tipos nativamente.

---

## 3. Las 8 secciones

| Sección | Filtro |
|---|---|
| Lista completa | todos |
| Completados | `estado === 'completado'` |
| Por ver / Por mirar | `estado === 'por_ver'` ← **estado por defecto al agregar** |
| Favoritos | `favorito === true` (cruza cualquier estado) |
| En curso / Mirando | `estado === 'en_curso'` |
| En emisión | `estadoEmision === 'en_emision'` |
| Finalizados | `estadoEmision === 'finalizado'` |
| Dropeados / Abandonados | `estado === 'dropeado'` |

> [!IMPORTANT]
> Al agregar un ítem, el estado se fija siempre en `por_ver` y `estadoEmision` en `null`.
> El usuario es quien lo cambia manualmente. NUNCA se asigna automáticamente según la API.

---

## 4. APIs (apiClient.js) — Triple Fallback

```
AniList GraphQL (primaria) → MangaDex REST (respaldo 1) → Kitsu REST (respaldo 2)
```

- **Jikan fue eliminado permanentemente** del proyecto (causaba timeouts y 504s sistemáticos).
- MangaDex es el proveedor principal para Manhwa/Manhua.
- Todas las respuestas se normalizan al mismo contrato de dominio antes de llegar a la UI.
- Cache en memoria (LRU 20 entradas) + localStorage (TTL 5 min).
- Timeout: 12s con `AbortController`. Errores tipados con `.code`.
- Botón "Reintentar" en UI ante cualquier fallo de API.

**APIs descartadas (documentadas):**
- **MangaFire**: no tiene API pública oficial — solo scrapers que violan ToS.
- **Jikan**: eliminado por inestabilidad estructural (scraping de MyAnimeList, 504s frecuentes).

---

## 5. CRUD + Integridad (itemsRepository.js)

| Operación | Reglas de integridad |
|---|---|
| `create(item)` | Valida esquema completo. Estado inicial = `por_ver`. |
| `getAll()` | Recupera sin romper la app si hay JSON corrupto (catch + array vacío). |
| `update(id, cambios)` | Rechaza si `progreso.actual > progreso.maximo`. Límite: 9999. |
| `remove(id)` | Requiere confirmación en UI antes de ejecutar. |
| `getById(id)` | Retorna `null` si no existe, sin throw. |

IDs deterministas: `${media}_${malId}` — re-agregar el mismo ítem no lo duplica.

---

## 6. Theming — Eye Care Design

```css
:root {
  --bg: #F0F6F6;
  --surface: #FFFFFF;
  --text-primary: #162425;
  --text-muted: #6D8788;
  --accent-visto: #10B99B;
  --accent-completado: #9333EA;
  --border: #DCE7E7;
}

[data-theme='dark'] {
  --bg: #162425;
  --surface: #213334;
  --text-primary: #E2F0F0;
  --text-muted: #8AA4A5;
  --accent-visto: #2BEBC8;
  --accent-completado: #B966FF;
  --border: #30484A;
}
```

Toggle: `Sun` / `Moon` de `lucide-react`. Persiste en localStorage.

---

## 7. Estado de tareas MVP

### ✅ Completado

- [x] Setup Vite + React + estructura `domain/data/presentation`
- [x] Tokens CSS light/dark (eye-care) + favicon SVG
- [x] `domain/models`, `domain/usecases` (validarProgreso, filtrarPorSeccion, historial)
- [x] `data/itemsRepository.js` — CRUD + integridad + recuperación de JSON corrupto
- [x] `data/historyRepository.js` y `themeRepository.js`
- [x] `data/apiClient.js` — Triple fallback AniList → MangaDex → Kitsu (sin Jikan)
- [x] `apiClient.test.js` — Tests pasando al 100%
- [x] Hooks: `useItems`, `useSearch`, `useDebounce`, `useTheme`
- [x] `SearchPanel` — debounce 500ms, AbortController, preview imagen + título + Agregar
- [x] `AddModal` — modal flotante + checkbox "Agregar múltiples"
- [x] `ItemCard` — vista lista amplia (no grid), doble puntuación (comunidad/usuario)
- [x] `EditModal` — estado, progreso bloqueado si > máximo, multi-tags (máx 5), descripción personal, puntuación
- [x] 8 secciones + pestañas arrastrables (scroll drag)
- [x] Drag and drop con handle visual en modo "Orden personalizado"
- [x] Barra de búsqueda local (filtra por título, tags y descripción personal)
- [x] Ordenamiento: Agregado recientemente · Título A-Z · Puntuación · Progreso · Orden personalizado
- [x] Importador MAL XML (datos locales siempre tienen prioridad ante duplicados)
- [x] Exportar a JSON
- [x] Historial cronológico descendente
- [x] AppShell: sidebar flotante centrado verticalmente + animaciones · header · footer con créditos APIs
- [x] `FloatingActionButton` (mobile-only) + botón Agregar en header (desktop)
- [x] `ThemeToggle` Sun/Moon (lucide-react), sin emojis de texto
- [x] Créditos en footer: AniList · Kitsu · MangaDex
- [x] Subida a GitHub: https://github.com/vicentemrk/AmList

### 🔲 Pendiente para cerrar el MVP

- [ ] **Filtro por tags** — dropdown multi-select de tags debajo de las pestañas
- [ ] **Verificar Manhwa/Manhua** — confirmar que MangaDex entrega `tipo: 'Manhwa'/'Manhua'` y se muestra correctamente en ItemCard
- [ ] **README-CRITERIOS.md** — actualizar para reflejar código real (sin Jikan, con triple fallback, con tests)
- [ ] **QA Mobile 360px** — sin scroll horizontal
- [ ] **QA 8 secciones** — todas renderizan ítems correctos
- [ ] **QA bloqueo de progreso** — UI + repositorio rechazan actual > máximo
- [ ] **`npm run build`** — 0 errores y 0 warnings

---

## 8. Criterios de evaluación — Trazabilidad

| # | Criterio | Archivo clave |
|---|---|---|
| 1 | Arquitectura limpia (Clean Architecture) | `domain/`, `data/`, `presentation/` — regla de dependencia verificable por grep |
| 2 | Buenas prácticas React (funcionales, hooks, key estable, a11y) | Todos los `.jsx` en `presentation/` |
| 3 | CRUD con localStorage e integridad | `src/data/itemsRepository.js` |
| 4 | Consumo de APIs con Fetch nativo, manejo de errores | `src/data/apiClient.js` (triple fallback, errores tipados) |

Ver detalles completos en [`docs/QA_CRITERIOS.md`](./QA_CRITERIOS.md).

---

## 9. Roadmap Post-MVP

Decisiones explícitas tomadas en conversaciones — fuera del alcance del MVP:

| Feature | Prioridad | Notas |
|---|---|---|
| Vista de detalle (modal/drawer en clic de portada) | Alta | Similar a Netflix/AniList |
| Múltiples listas por usuario | Alta | Requiere refactor del modelo de datos |
| Dashboard de estadísticas | Media | Horas vistas, géneros top, completados |
| Filtro por género | Media | Tags ya en el MVP; géneros en espera |
| Arquitectura Hexagonal completa | Media | `src/infrastructure/` + DI, preparar para BD |
| Sincronización en la nube (Supabase/Firebase) | Baja | Local-first primero |
| Importación desde AniList/Kitsu | Baja | Hoy solo MAL XML |

Ver detalles técnicos en [`docs/ROADMAP.md`](./ROADMAP.md).

---

## 10. Reglas del proyecto

1. **Nunca** usar `fetch` o `localStorage` dentro de `src/presentation/`.
2. **Nunca** crear lógica de negocio dentro de componentes `.jsx` — va en `domain/` o `hooks/`.
3. Estado inicial al agregar siempre = `por_ver`. `estadoEmision` = `null`. El usuario cambia manualmente.
4. Progreso máximo = 9999.
5. Tags máximo = 5 por ítem.
6. IDs siempre deterministas: `${media}_${malId}`.
7. Importar duplicados → priorizar SIEMPRE los datos locales.
8. Sin Jikan en ningún archivo del proyecto (eliminado permanentemente).
9. `lucide-react` para toda la iconografía. Sin emojis de texto como iconos.
10. Antes de ejecutar cualquier plan, esperar confirmación explícita del usuario en el chat.
