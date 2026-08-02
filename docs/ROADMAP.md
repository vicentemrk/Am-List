# AMlist — Roadmap de Desarrollo

> Hoja de ruta del proyecto vinculada a la matriz híbrida de `20_ideas_implementacion.md` y las reglas de negocio de `business_logic.txt`.
> Última actualización: 2026-08-01

---

## 🎯 Fases del Roadmap

| Funcionalidad / Módulo | Versión | Prioridad | Estado |
|---|---|---|---|
| **Alineación Estricta de Lógica de Negocio (Reglas 5 y 6)** | **v1.1** | 🔥 **Crítica** | 🚀 **En Desarrollo** |
| **Limpieza de UI & Notificaciones (`Toast.jsx`)** | **v1.1** | 🔥 **Alta** | 🚀 **En Desarrollo** |
| **Documentación Exhaustiva JSDoc 100% en Español** | **v1.1** | 🔥 **Alta** | 🚀 **En Desarrollo** |
| **Fortalecimiento de Arquitectura Hexagonal** | **v1.1** | 🔥 **Alta** | 🚀 **En Desarrollo** |
| **Vista de Detalle Expandida (`DetailModal`)** | **v1.1** | 🔥 **Alta** | 🚀 **En Desarrollo** |
| **Botón de Incremento Rápido `+1` en Tarjeta (`ItemCard`)** | **v1.1** | 🔥 **Alta** | 🚀 **En Desarrollo** |
| **Freno de Mano en Búsqueda (API Rate Limiting / Throttling)** | **v1.1** | 🔥 **Alta** | 🚀 **En Desarrollo** |
| **Persistencia del Criterio de Ordenamiento** | **v1.1** | 🔥 **Alta** | 🚀 **En Desarrollo** |
| Listas Personalizadas por Usuario (Custom Collections) | v1.2 | ⚡ Media | Planificado |
| Importación Directa desde AniList y Kitsu (JSON) | v1.2 | ⚡ Media | Planificado |
| Sanitización y Validación Estricta en Importación | v1.2 | ⚡ Media | Planificado |
| Atajos de Teclado (Keyboard Shortcuts) | v1.2 | ⚡ Media | Planificado |
| Módulo PWA Offline (`vite-plugin-pwa`) | v1.3 | ⚡ Media | Planificado |
| Pruebas de Regresión Visual con Playwright | v1.3 | ⚡ Media | Planificado |
| Generador de Tarjetas para Compartir (Share Card PNG) | v1.3 | ⚡ Media | Planificado |
| Backend Costo $0 (Serverless Postgres + Drizzle ORM sin Lock-in) | v2.0 | 💡 Alta | 🎯 Arquitectura Lista |
| Sincronización Multi-dispositivo en la Nube | v2.0 | 💡 Alta | 🎯 Arquitectura Lista |

---

## 🚀 v1.1 — Ciclo de Desarrollo Actual (Completado y Verificado)

### 1. Alineación Estricta de Lógica de Negocio (`business_logic.txt`)
* **Objetivo**: Asegurar el cumplimiento al 100% de las 6 reglas fundamentales de negocio.
* **Acciones**:
  - **Regla 5 (Prioridad Local en Importaciones)**: En `src/data/adapters/localStorage/itemsLocalStorageAdapter.js`, al importar desde MAL XML o JSON AMlist, los ítems existentes localmente se mantienen intactos. Las versiones importadas duplicadas se ignoran.
  - **Regla 6 (Pestaña Finalizados vs Completados)**: En `src/domain/validators.js`, la sección `finalizado` filtra por `estadoEmision === 'complete'` (serie finalizada en el mundo real), dejando `completado` exclusivamente para el estado asignado por el usuario (`estadoUsuario === 'completado'`).

### 2. Limpieza de UI & Notificaciones (`Toast.jsx`)
* **Objetivo**: Componente `Toast.jsx` con diseño accesible, limpio y sin iconos o marcas redundantes.

### 3. Documentación Exhaustiva JSDoc 100% en Español
* **Objetivo**: Documentar todos los módulos de `src/domain/`, `src/data/` y `src/presentation/` en lenguaje claro en español sin anglicismos innecesarios ni ambigüedades.

### 4. Fortalecimiento de Arquitectura Hexagonal
* **Objetivo**: Garantizar el aislamiento estricto entre el Núcleo de Dominio (`src/domain`), la Capa de Datos (`src/data`) y la Capa de Presentación (`src/presentation`). Ningún componente visual llama a `localStorage` ni `fetch` directamente.

### 5. Vista de Detalle Expandida (`DetailModal`)
* **Objetivo**: Modal emergente para inspeccionar sinopsis completa, géneros, tráiler, puntuación y detalles sin sobrecargar la tarjeta `ItemCard`.

### 6. Botón de Incremento Rápido (`+1` Episodio/Capítulo) en Tarjeta
* **Objetivo**: Permitir al usuario avanzar su progreso actual con un solo clic directamente desde la tarjeta `ItemCard`, validando el límite máximo conocido (Regla 2).

### 7. Freno de Mano en Búsqueda (API Rate Limiting & Throttling)
* **Objetivo**: Sistema de control de frecuencia en `useSearch.js` y `apiClient.js` con debounce (300ms) y abort en vuelo para prevenir HTTP 429 en AniList/MangaDex.

### 8. Persistencia del Criterio de Ordenamiento
* **Objetivo**: Guardar la preferencia de ordenamiento (título, puntuación, progreso, fecha) en `localStorage` a través del adaptador correspondiente para recordar la vista del usuario tras recargar la página.

---

## 🛠️ Vinculación con Documentos

- Matriz de Ideas de Implementación: [`docs/20_ideas_implementacion.md`](./20_ideas_implementacion.md)
- Plan Maestro: [`docs/PLAN_MAESTRO.md`](./PLAN_MAESTRO.md)
- Explicación de Lógica de Negocio: [`business_logic.txt`](../business_logic.txt)
- Criterios QA: [`docs/QA_CRITERIOS.md`](./QA_CRITERIOS.md)
