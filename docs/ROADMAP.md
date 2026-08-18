# AMlist — Roadmap de Desarrollo

> Hoja de ruta del proyecto vinculada a la matriz híbrida de `20_ideas_implementacion.md` y las reglas de negocio de `business_logic.txt`.
> Última actualización: 2026-08-12

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
| **Eliminación Completa del Estado `completado`** | **v1.2** | 🔥 **Alta** | ✅ **Completado** |
| **Auto-Snapshots / Puntos de Restauración Local** | **v1.2** | 🔥 **Alta** | ✅ **Completado** |
| **Offline Status Banner & Graceful Fallback** | **v1.2** | 🔥 **Alta** | ✅ **Completado** |
| **Sanitización al Dominio (`sanitizeText`)** | **v1.2** | ⚡ **Media** | ✅ **Completado** |
| **Changelog In-App (`ChangelogModal`)** | **v1.2** | ⚡ **Media** | ✅ **Completado** |
| **Importación Directa desde AniList y Kitsu (JSON)** | **v1.2** | ⚡ **Media** | ✅ **Completado** |
| **Suite E2E con Playwright + GitHub Actions CI** | **v1.2** | ⚡ **Media** | ✅ **Completado** |


|------------------------------------------------------------------------------------------------------------------|
| **Modo Compacto / Densidad de Vista Configurable** | **v1.3** | ⚡ **Media** | ✅ **Completado** |
| **Filtro por Rango de Puntuación Personal (1-10)** | **v1.3** | ⚡ **Media** | ✅ **Completado** |
| **Pruebas de Regresión Visual con Playwright** | **v1.3** | ⚡ **Media** | ✅ **Completado** |
| **Limpieza Total de Tailwind CSS** | **v1.3** | 🔧 **Técnico** | ✅ **Completado** |
| **Correcciones de Seguridad OWASP** (CSP header, npm audit, `estadoUsuario` enum) | **v1.3** | 🛡️ **Seguridad** | ✅ **Completado** |
|------------------------------------------------------------------------------------------------------------------|
| **Estado e Insignia de Favorito + Control en EditModal** | **v1.4** | 🔥 **Alta** | ✅ **Completado** |
| **Corrección de Ícono en Modo Oscuro (`ThemeToggle`)** | **v1.4** | ⚡ **Media** | ✅ **Completado** |
| **Traducción Automática de Sinopsis (CSP + Service)** | **v1.4** | 🔥 **Alta** | ✅ **Completado** |
| **Enrutamiento por Pestañas y Páginas (`useAppRouter` Hash)** | **v1.4** | 🔥 **Alta** | ✅ **Completado** |
|------------------------------------------------------------------------------------------------------------------|
| Cuentas de Usuario + Supabase Auth | v2.0 | 💡 Alta | 🎯 Arquitectura Lista |
| Sincronización Multi-dispositivo en la Nube | v2.0 | 💡 Alta | 🎯 Arquitectura Lista |
| Perfil Público Compartible (Read-Only Link) | v2.0 | 💡 Media | Planificado |
| Módulo PWA Instalable (`vite-plugin-pwa`) | v2.0 | 💡 Media | Pospuesto v2.0 |
| Virtualización de Listas Extensas (@tanstack/virtual) | v2.0 | 💡 Baja | Planificado |
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

## ✅ v1.3 — Completado (2026-08-16)

### 1. Correcciones de Seguridad OWASP
* Meta tag `Content-Security-Policy` estricto en `index.html` con whitelist de CDNs (AniList, MangaDex, Kitsu).
* Vulnerabilidades `npm audit` resueltas a 0.
* Enum estricto de dominio `VALID_ESTADOS_USUARIO` (`por_ver`, `en_curso`, `finalizado`, `pausado`, `dropeado`) integrado en `validators.js` y forzado en `assertSchema()` antes de escribir en localStorage.

### 2. Modo Compacto / Densidad de Vista Configurable
* Toggle de densidad (`detailed` vs `compact`) en el toolbar (`LayoutList` / `LayoutGrid`).
* Persistencia local vía `viewRepository.js` (`amlist_view_density`).
* Vista compacta de 56px con portada 40x40, título truncado, badge de estado y menú de acciones rápidas.

### 3. Filtro por Rango de Puntuación Personal (1-10)
* Componente `ScoreRangeSlider` con CSS puro y dos `<input type="range">` superpuestos.
* Función pura `filtrarPorRangoPuntuacion(items, min, max)` en la capa de dominio (`validators.js`).
* Comportamiento inteligente: inactivo en `[1, 10]` (muestra todos incluyendo `puntuacion=null`).

### 4. Pruebas de Regresión Visual con Playwright (10/10 ✓)
* Archivo de spec `e2e/visual.spec.js` con helper `seedItem` sintético determinista.
* Cobertura de snapshots visuales para `ItemCard` (detailed + compact), `SectionTabs`, `Toolbar` y `DetailModal` en tema claro y oscuro.

### 5. Limpieza Total de Dependencias Tailwind CSS
* Eliminación completa de `tailwindcss`, `@tailwindcss/vite`, `tailwind-merge` y `clsx`.
* `vite.config.js` y `index.css` limpios sin directivas `@tailwind`. Reducción del ~14% en el bundle CSS final.

### 6. Descarte Formal de Edición en Lote
* Edición en Lote (Multi-Select) descartada permanentemente y registrada en `20_ideas_implementacion.md` para preservar la agilidad de la interacción uno a uno por tarjeta.

---

## ✅ v1.4 — Completado (2026-08-17)

### 1. Estado e Insignia de Favorito
* El badge superior izquierdo en `ItemCard` (tanto en modo detallado como compacto) cambia dinámicamente a **"FAVORITO"** con el color dorado correspondiente (`--tab-favorito`) cuando el ítem tiene estrella activa (`favorito: true`).
* Se añadió un control dedicado y destacado de Favorito en `EditModal` dentro del formulario de edición.

### 2. Corrección de Ícono en Modo Oscuro
* Corrección en `ThemeToggle.css` garantizando `color: #ffffff;` en tema oscuro (`[data-theme='dark'] .theme-toggle`), mejorando la visibilidad del ícono solar.

### 3. Traducción Automática de Sinopsis
* Actualización de `Content-Security-Policy` en `index.html` para permitir peticiones seguras a `https://translate.googleapis.com` en `connect-src`.
* Traducción automática de sinopsis en segundo plano con persistencia local y decodificación de entidades HTML.

### 4. Enrutamiento Hash Nativo (`useAppRouter`)
* Implementación de enrutamiento por hash (`#/anime/favorito`, `#/manga/por-ver`, etc.) para todas las listas y secciones.
* Soporte nativo de navegación histórica (atrás/adelante) y enlaces directos compatibles con GitHub Pages.

---

## 🛠️ Vinculación con Documentos

- Matriz de Ideas: [`docs/20_ideas_implementacion.md`](./20_ideas_implementacion.md)
- Lógica de Negocio: [`business_logic.txt`](../business_logic.txt)
- Sistema de Auth (privado): [`docs/auth_system_design.md`](./auth_system_design.md)

