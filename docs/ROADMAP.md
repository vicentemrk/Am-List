# AMlist — Roadmap Post-MVP
> Features fuera del MVP actual. Referenciado por `PLAN_MAESTRO.md`.
> Última actualización: 2026-07-21

---

## Fases del roadmap

| Feature | Fase | Prioridad |
|---|---|---|
| Filtro por tags | v1.1 — Próximo | 🟢 Alta |
| Vista de detalle (modal/drawer) | v1.1 — Próximo | 🟢 Alta |
| Dashboard de estadísticas | v1.2 — Corto plazo | 🔵 Media |
| Listas personalizadas (crear/renombrar/eliminar) | v1.2 — Corto plazo | 🔵 Media |
| Importación desde AniList / Kitsu | v1.2 — Corto plazo | 🔵 Media |
| Changelog visible (historial de versiones) | v1.2 — Corto plazo | 🔵 Media |
| Cuentas de usuario *(opcional)* | v2.0 — Mediano plazo | 🟣 Baja |
| Sincronización en la nube (Supabase) | v2.0 — Mediano plazo | 🟣 Baja |
| Arquitectura Hexagonal completa | v2.0 — Mediano plazo | 🟣 Baja |
| Nuevo logo AMlist | Mejoras visuales | ⚪ Diseño |
| Filtro por género | Post-MVP | ⚪ En espera |

---

## v1.1 — Próximo

### 1. Filtro por tags

**Estado:** Pendiente — entra en el MVP como último ítem pendiente

Barra de herramientas secundaria debajo de las pestañas con un dropdown multi-select de tags activos. Al seleccionar uno o más tags, la lista se filtra en tiempo real.

**Implicaciones técnicas:**
- Nuevo estado `tagsFiltro: string[]` en `AnimeListPage` / `MangaListPage`
- `filtrarPorSeccion` en `validators.js` ya recibe todos los ítems; se puede encadenar un `.filter()` adicional
- Sin cambios en la arquitectura

---

### 2. Vista de Detalle (Detail Modal / Drawer)

**Estado:** Pendiente Post-MVP (decidido en conversación 1)

Actualmente toda la edición ocurre en `ItemCard` + `EditModal`. La idea es que al hacer clic en la portada del ítem se abra un panel de vista detallada tipo Netflix/AniList con:

- Imagen grande de portada
- Sinopsis completa (sin truncar)
- Géneros como pills
- Trailer (si la API lo provee)
- Ranking de la comunidad
- Todos los controles de edición (estado, progreso, tags, puntuación)

**Implicaciones técnicas:**
- Nuevo componente `DetailModal` o `DetailDrawer`
- No requiere cambios de arquitectura, solo agregar un componente en `presentation/components/`
- Liberar el `ItemCard` de mucha información → tarjeta más limpia y pequeña

---

### 2. Múltiples Listas por Usuario
**Estado:** Pendiente Post-MVP (mencionado en conversación 1)

Actualmente existe 1 lista de Anime y 1 de Manga. El usuario no puede crear listas personalizadas.

**Implicaciones técnicas:**
- Cambio en el modelo de datos: agregar `listaId: string` al `Item`
- `itemsRepository.js` necesita filtrar por `listaId`
- Nueva UI para crear/renombrar/eliminar listas
- Puede requerir migración de datos existentes en localStorage

---

## Prioridad Media

### 3. Dashboard de Estadísticas
**Estado:** Pendiente Post-MVP (mencionado en batch-grill conversación 1)

Un panel con:
- Total de horas/capítulos vistos (estimado)
- Distribución por estado (completados, en curso, dropeados, etc.)
- Géneros más consumidos
- Puntuación promedio
- Racha de actividad

**Implicaciones técnicas:**
- Solo lectura de `itemsRepository.getAll()`
- Nuevo componente `StatsView` en `presentation/pages/`
- Sin cambios en la arquitectura de datos

---

### 4. Filtro por Género
**Estado:** En espera (decidido en conversación 3 — "dejarlo en espera el de género")

Los géneros ya se guardan en el modelo (`item.generos[]`). Solo falta la UI para filtrarlos.

**Implicaciones técnicas:**
- Muy similar al filtro de tags que sí entra en el MVP
- Agregar un segundo dropdown `filtrarPorGenero` en la barra de herramientas de `ListPage`

---

### 5. Arquitectura Hexagonal (Ports & Adapters)
**Estado:** Pausado (guardado en `REFACTOR_PLAN.md` original)

Migración de la arquitectura Clean Architecture de 3 capas a una Hexagonal con inyección de dependencias, preparando la app para conectar a una base de datos real.

**Nueva estructura propuesta:**
```
src/
  domain/                        # Sin cambios — sigue siendo JS puro
  application/
    usecases/
      GetAllItems.js
      CreateItem.js
      UpdateItem.js
      DeleteItem.js
      SearchItems.js
  infrastructure/
    localStorage/
      LocalStorageItemsRepository.js
      LocalStorageHistoryRepository.js
      LocalStorageThemeRepository.js
    api/
      AniListAdapter.js
      MangaDexAdapter.js
      KitsuAdapter.js
    di/
      DependencyContext.jsx      # React Context que inyecta los adaptadores
  presentation/                  # Sin cambios en componentes, solo hooks consumen usecases
```

**Beneficio principal:** Cuando se quiera pasar a Supabase, solo hay que crear `SupabaseItemsRepository.js` en `infrastructure/` y conectarlo en `DependencyContext.jsx`. La UI no se entera.

**Opciones de BD gratuitas evaluadas:**
1. **Supabase** (PostgreSQL, recomendado): generoso tier gratuito, SDK moderno, Auth incluido
2. **Firebase Firestore**: NoSQL, ideal para offline-first
3. **MongoDB Atlas**: flexible, pero SDK más pesado

**Nota:** Este refactor requiere varias semanas y es un proyecto en sí mismo. No bloquea cerrar el MVP.

---

## Prioridad Baja

### 6. Sincronización en la Nube
**Estado:** Decidido como Post-MVP v2 (conversación 1)

Depende de completar la Arquitectura Hexagonal primero. La idea es Local-First: los datos viven en localStorage y se sincronizan con la nube cuando hay conexión. Sin perder datos offline.

---

### 7. Importación desde AniList / Kitsu
**Estado:** Post-MVP v2

Actualmente solo importamos XML de MyAnimeList. Expandir para leer el JSON de exportación de AniList o Kitsu.

**Precaución de seguridad:** Usar `DOMParser` o `JSON.parse` estándar del navegador — no ejecutar código externo. Nunca usar `eval()`.

---

## Historial de decisiones (Architecture Decision Records)

| Decisión | Elegida | Descartada | Razón |
|---|---|---|---|
| Router | `useState` (sin librería) | react-router | Sin necesidad para 2 páginas |
| TypeScript | JSDoc | TypeScript | Setup lean, contratos documentados |
| Bundler | Vite | CRA | Dev server rápido, tree-shaking |
| Librería de iconos | lucide-react | react-icons, emojis | Ligera, tree-shakeable, diseño limpio |
| API primaria | AniList | Jikan | Jikan eliminado por timeouts sistemáticos |
| API para Manhwa/Manhua | MangaDex | MangaFire | MangaFire sin API oficial |
| Persistencia | localStorage | Supabase/Firebase | Local-first para MVP |
| Confirmación de borrado | `window.confirm()` | Modal propio | Simple y efectivo para MVP |
| Límite de progreso | 9999 | Ilimitado | Prevenir entradas absurdas |
| Máximo de tags | 5 | Ilimitado | UX: evitar listas de tags muy largas |
| Importar duplicados | Mantener local | Sobrescribir | Prevenir pérdida de datos accidental |
