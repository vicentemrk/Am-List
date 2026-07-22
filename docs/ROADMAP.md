# AMlist — Roadmap de Desarrollo

> Hoja de ruta del proyecto vinculada a la matriz híbrida de `20_ideas_implementacion.md`.
> Última actualización: 2026-07-22

---

## 🎯 Fases del Roadmap

| Feature / Mejora | Versión | Prioridad | Estado |
|---|---|---|---|
| Componente Unificado `ItemListPage` | v1.0.1 | 🔥 Alta | ✅ Completado (ADR-0002) |
| Sanitización XSS en Importadores | v1.0.1 | 🔥 Alta | ✅ Completado |
| Pruebas Unitarias `useItems` | v1.0.1 | 🔥 Alta | ✅ Completado |
| Tema Eye-Care Gris Hueso (`#ced2d0`) | v1.0.1 | 🔥 Alta | ✅ Completado |
| Pruebas E2E Iniciales con Playwright | v1.0.1 | 🔥 Alta | ✅ Completado (`e2e/app.spec.js`) |
| **Vista de detalle expandida (Detail Modal)** | **v1.1** | 🔥 **Alta** | **Próximo** |
| **Dashboard de estadísticas de consumo** | **v1.1** | 🔥 **Alta** | **Próximo** |
| **Botón `+1` episodio rápido en tarjeta** | **v1.1** | 🔥 **Alta** | **Próximo** |
| **Persistencia de criterio de ordenamiento** | **v1.1** | 🔥 **Alta** | **Próximo** |
| Modulo PWA Offline (`vite-plugin-pwa`) | v1.2 | ⚡ Media | Planificado |
| Importación directa desde AniList / Kitsu | v1.2 | ⚡ Media | Planificado |
| Listas personalizadas por usuario | v1.2 | ⚡ Media | Planificado |
| Generador de Tarjeta para compartir PNG | v1.2 | ⚡ Media | Planificado |
| Sugerencias "Qué ver a continuación" | v2.0 | 💡 Baja | Post-MVP v2 |
| Sincronización en la Nube (Supabase) | v2.0 | 💡 Baja | Post-MVP v2 |

---

## 🚀 v1.1 — Próximo Ciclo de Desarrollo

### 1. Vista de Detalle Expandida (Detail Modal / Drawer)
* **Objetivo**: Al hacer clic en la portada de un anime o manga, abrir un modal grande con la sinopsis completa, género como pills interactivas y todos los datos de edición, manteniendo la tarjeta `ItemCard` limpia.

### 2. Dashboard de Estadísticas de Consumo
* **Objetivo**: Panel con visualización de total de episodios vistos, distribución por estado y top de géneros más consumidos.

### 3. Botón de Incremento Rápido (`+1`)
* **Objetivo**: Incrementar el capítulo o episodio visto en 1 toque directo desde la lista.

---

## 🛠️ Vinculación con Documentos
- Matriz de 20 Ideas: [`docs/20_ideas_implementacion.md`](./20_ideas_implementacion.md)
- Plan Maestro: [`docs/PLAN_MAESTRO.md`](./PLAN_MAESTRO.md)
- Criterios QA: [`docs/QA_CRITERIOS.md`](./QA_CRITERIOS.md)
