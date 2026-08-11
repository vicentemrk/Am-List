# AMlist — Roadmap de Desarrollo

> Hoja de ruta del proyecto vinculada a la matriz híbrida de `20_ideas_implementacion.md` y las reglas de negocio de `business_logic.txt`.
> Última actualización: 2026-08-11

---

## 🎯 Fases del Roadmap
|------------------------------------------------------------------------------------------------------------------|
| Funcionalidad / Módulo | Versión | Prioridad | Estado |
|---|---|---|---|
| **Alineación Estricta de Lógica de Negocio (Reglas 5 y 6)** | **v1.1** | 🔥 **Crítica** | ✅ **Completado** |
| **Reordenamiento y Refactor del Tablist** | **v1.1** | 🔥 **Alta** | ✅ **Completado** |
| **Botón de Estado `ClipboardList` (reemplaza `+1`)** | **v1.1** | 🔥 **Alta** | ✅ **Completado** |
| **Reestructuración UI/UX Header (buscador + Agregar centrado)** | **v1.1** | 🔥 **Alta** | ✅ **Completado** |
| **Vista de Detalle Expandida (`DetailModal`)** | **v1.1** | 🔥 **Alta** | ✅ **Completado** |
| **Freno de Mano en Búsqueda (useDebounce / Throttling)** | **v1.1** | 🔥 **Alta** | ✅ **Completado** |
| **Persistencia del Criterio de Ordenamiento** | **v1.1** | 🔥 **Alta** | ✅ **Completado** |
| **Suite de Tests (27 tests — domain, data, hooks)** | **v1.1** | 🔥 **Alta** | ✅ **Completado** |
|------------------------------------------------------------------------------------------------------------------|
| **Eliminación Completa del Estado `completado`** | v1.2 | 🔥 Alta | Planificado |
| Edición en Lote (Multi-Select Control) | v1.2 | 🔥 Alta | Planificado |
| Auto-Snapshots / Puntos de Restauración Local | v1.2 | 🔥 Alta | Planificado |
| Offline Status Banner & Graceful Fallback | v1.2 | 🔥 Alta | Planificado |
| Sanitización y Validación Estricta en Importación | v1.2 | ⚡ Media | Planificado |
| Suite E2E con Playwright + GitHub Actions CI | v1.2 | ⚡ Media | Planificado |
| Changelog In-App (Novedades de Versión) | v1.2 | ⚡ Media | Planificado |
| Importación Directa desde AniList y Kitsu (JSON) | v1.2 | ⚡ Media | Planificado |
|------------------------------------------------------------------------------------------------------------------|
| Modo Compacto / Densidad de Vista Configurable | v1.3 | ⚡ Media | Planificado |
| Filtros Avanzados y Combinados (Géneros y Score) | v1.3 | ⚡ Media | Planificado |
| Módulo PWA Instalable (`vite-plugin-pwa`) | v1.3 | ⚡ Media | Planificado |
| Pruebas de Regresión Visual con Playwright | v1.3 | ⚡ Media | Planificado |
|------------------------------------------------------------------------------------------------------------------|
| Cuentas de Usuario + Supabase Auth | v2.0 | 💡 Alta | 🎯 Arquitectura Lista |
| Sincronización Multi-dispositivo en la Nube | v2.0 | 💡 Alta | 🎯 Arquitectura Lista |
| Perfil Público Compartible (Read-Only Link) | v2.0 | 💡 Media | Planificado |
| Virtualización de Listas Extensas (@tanstack/virtual) | v2.0 | 💡 Baja | Planificado |
|------------------------------------------------------------------------------------------------------------------|

---

## ✅ v1.1 — Completado (2026-08-11)

### 1. Alineación Estricta de Lógica de Negocio
* **Regla 5**: Al importar desde MAL XML o JSON AMlist, los ítems existentes localmente se mantienen intactos. Los duplicados importados se ignoran.
* **Regla 6 (Reformulada)**: Todos los tabs filtran EXCLUSIVAMENTE por `estadoUsuario`. Única excepción: `en_emision` (filtra por `estadoEmision='airing'`). El tab `finalizado` usa `estadoUsuario='finalizado'`, NO la API.

### 2. Reordenamiento del Tablist
* Nuevo orden: `Todo → Por ver → En emisión → En curso → Favoritos → Finalizados → Pausados → Dropeados`
* Tab `Completados` eliminado de la UI (el estado `completado` sigue en el sistema para no perder datos históricos).

### 3. Botón de Estado `ClipboardList`
* Reemplaza el botón `+1` con un dropdown glass animado.
* Permite cambiar `estadoUsuario` directamente desde la tarjeta.
* Incluye toggle de favorito.
* El código del `+1` queda comentado como `RESERVADO_FUTURO`.

### 4. Reestructuración UI/UX del Header
* Buscador movido al toolbar (junto a "Ordenar por:").
* Botón Agregar ahora centrado debajo del título.
* `ImportButton` eliminado del sidebar (permanece en el top-right del header).

### 5. Vista de Detalle Expandida (`DetailModal`)
* Modal emergente con sinopsis completa, géneros como pills, puntuaciones, estado y controles de edición rápida.

### 6. Freno de Mano en Búsqueda
* `useDebounce` (300ms) + AbortController en vuelo para prevenir HTTP 429 en AniList/MangaDex.

### 7. Persistencia de Ordenamiento
* `sortRepository.js` guarda la preferencia de ordenamiento en localStorage entre sesiones.

### 8. Suite de Tests (27/27 ✓)
* Tests unitarios en: `validators.js`, `genreTranslator.js`, `apiClient.js`, `jsonImporter.js`, `useItems.js`.
* `validators.test.js` actualizado para reflejar la Regla 6 reformulada.

---

## 🛠️ Vinculación con Documentos

- Matriz de Ideas: [`docs/20_ideas_implementacion.md`](./20_ideas_implementacion.md)
- Lógica de Negocio: [`business_logic.txt`](../business_logic.txt)
- Sistema de Auth (privado): [`docs/auth_system_design.md`](./auth_system_design.md)
