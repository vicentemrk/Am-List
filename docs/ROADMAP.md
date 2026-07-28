# AMlist — Roadmap de Desarrollo

> Hoja de ruta del proyecto vinculada a la matriz híbrida de `20_ideas_implementacion.md`.
> Última actualización: 2026-07-27

---

## 🎯 Fases del Roadmap

| Feature / Mejora | Versión | Prioridad | Estado |
|---|---|---|---|
| Componente Unificado `ItemListPage` | v1.0.1 | 🔥 Alta | ✅ Completado (ADR-0002) |
| Sanitización XSS en Importadores | v1.0.1 | 🔥 Alta | ✅ Completado |
| Pruebas Unitarias `useItems` | v1.0.1 | 🔥 Alta | ✅ Completado |
| Tema Eye-Care Gris Hueso (`#ced2d0`) | v1.0.1 | 🔥 Alta | ✅ Completado |
| Pruebas E2E Iniciales con Playwright | v1.0.1 | 🔥 Alta | ✅ Completado (`e2e/app.spec.js`) |
| **Limpieza de Iconos en Notificaciones (`Toast.jsx`)** | **v1.1** | 🔥 **Alta** | ✅ **Completado** |
| **Comentarios JSDoc en Español en todo `src/`** | **v1.1** | 🔥 **Alta** | ⏳ **En Progreso** |
| **Refactorización Hexagonal de Adaptadores** | **v1.1** | 🔥 **Alta** | ⏳ **En Progreso** |
| **Setup de Shadcn UI + Aceternity UI** | **v1.2** | 🔥 **Alta** | 📅 **Planificado** |
| **Vista de detalle expandida (Detail Modal / Aceternity)** | **v1.2** | 🔥 **Alta** | 📅 **Planificado** |
| **Dashboard de estadísticas de consumo** | **v1.2** | ⚡ **Media** | 📅 **Planificado** |
| **Botón `+1` episodio rápido en tarjeta** | **v1.2** | 🔥 **Alta** | 📅 **Planificado** |
| Modulo PWA Offline (`vite-plugin-pwa`) | v1.3 | ⚡ Media | Planificado |
| Importación directa desde AniList / Kitsu | v1.3 | ⚡ Media | Planificado |
| **Backend Costo $0 (Serverless Postgres + Drizzle ORM sin Lock-in)** | **v2.0** | 💡 **Alta** | 🎯 **Arquitectura Lista** |
| Sincronización Multi-dispositivo en la Nube | v2.0 | 💡 Alta | 🎯 Arquitectura Lista |

---

## 🚀 v1.1 — Ciclo de Desarrollo Actual

### 1. Limpieza de UI & Notificaciones
* **Objetivo**: Notificaciones emergentes `Toast.jsx` con diseño limpio sin iconos sobrantes.

### 2. Documentación Exhaustiva JSDoc en Español
* **Objetivo**: Documentar todos los módulos de `src/domain/`, `src/data/` y `src/presentation/` en lenguaje claro en español.

### 3. Fortalecimiento de Arquitectura Hexagonal
* **Objetivo**: Mantener el aislamiento estricto entre el Núcleo de Dominio y los Adaptadores de Salida (localStorage / HTTP API).

---

## 🛠️ Vinculación con Documentos
- Matriz de 20 Ideas: [`docs/20_ideas_implementacion.md`](./20_ideas_implementacion.md)
- Plan Maestro: [`docs/PLAN_MAESTRO.md`](./PLAN_MAESTRO.md)
- Criterios QA: [`docs/QA_CRITERIOS.md`](./QA_CRITERIOS.md)

