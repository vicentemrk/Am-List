# AMlist — QA y Criterios de Evaluación
> Documento de trazabilidad técnica y criterios de aseguramiento de calidad QA.
> Última actualización: 2026-07-22

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
| Componente unificado genérico | `src/presentation/pages/ItemListPage.jsx` | `ItemListPage({ media, ... })` (ADR-0002) |
| La capa presentation no usa fetch ni localStorage | Todos los `.jsx` bajo `src/presentation/` | Verificable: `grep -r "fetch\|localStorage" src/presentation/` → sin resultados |

---

## Criterio 2 — Funcionalidades Requeridas y Seguridad

| Feature | Archivo | Detalle |
|---|---|---|
| 8 secciones | `src/domain/itemSchema.js` | `SECCIONES` array; `SECCION_LABELS` object |
| Sanitización XSS en importaciones | `src/data/jsonImporter.js`, `malImporter.js` | Función `sanitizeString()` elimina scripts maliciosos de JSON/XML |
| Rendimiento de tarjetas | `src/presentation/components/ItemCard/ItemCard.jsx` | Enuelto en `React.memo` para prevenir renderizados innecesarios |
| Notificación Toast limpia | `src/presentation/components/Toast/Toast.jsx` | Notificación limpia sin ícono de checkmark sobrante |
| Accesibilidad móvil táctil | `src/presentation/pages/ListPage.css` | Mínimo $44\times 44\text{px}$ para botones en pantallas $\le 768\text{px}$ |
| Tema Eye-Care (Gris Hueso) | `src/index.css` | Token `--bg: #ced2d0;` para descanso visual |

---

## Criterio 3 — Pruebas Automatizadas (QA Suite)

| Nivel de Prueba | Herramienta | Ubicación / Comando | Cobertura |
|---|---|---|---|
| Pruebas Unitarias de Capa de Datos | Vitest | `src/data/apiClient.test.js`, `jsonImporter.test.js` | 100% pasando |
| Pruebas Unitarias de Hooks/Repositorio | Vitest | `src/presentation/hooks/useItems.test.js` | CRUD, integridad y filtrado |
| Pruebas End-to-End (E2E) | Playwright | `e2e/app.spec.js` | Título, cambio de pestañas y búsqueda |
| Análisis Estático / Linter | oxlint | `npm run lint` | 0 errores, 0 advertencias |
| Reporte de Cobertura | Vitest Coverage | `npm run test:coverage` | Audita líneas, funciones y ramas |

---

## Checklist QA para Entrega

- [x] Linter `npm run lint` ejecuta con 0 errores y 0 advertencias.
- [x] Pruebas unitarias `npm test` ejecutan 13 tests pasados al 100%.
- [x] Componentes de páginas de Anime y Manga unificados en `ItemListPage.jsx`.
- [x] Fondo claro en gris hueso `#ced2d0` libre de deslumbramiento.
- [x] Botones móviles en listado con tamaño mínimo táctil de 44px.
- [x] Notificaciones Toast renderizan mensaje limpio.
