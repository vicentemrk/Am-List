# Matriz de Ideas de Implementación — AMlist

> Matriz Híbrida de Priorización y Pilares Técnicos para la evolución de AMlist.
> Evaluado por **Impacto × Esfuerzo × Pilar Técnico**.
> Última actualización: 2026-08-11

---

## ✅ Ya Implementados (Completados en v1.1)

Las siguientes ideas fueron completadas en **v1.1** y se retiran del backlog activo:

| # | Idea | Pilar | Versión |
|---|---|---|---|
| 1 | **Vista de Detalle Expandida (`DetailModal`)** | UX / UI | v1.1 ✓ |
| 2 | **Freno de Mano en Búsqueda (`useDebounce` + Throttle)** | Seguridad | v1.1 ✓ |
| 3 | **Botón de Cambio de Estado (`ClipboardList` Glass Dropdown)** | UX / UI | v1.1 ✓ |
| 4 | **Persistencia del Criterio de Ordenamiento (`sortRepository`)** | Rendimiento | v1.1 ✓ |
| 5 | **Suite de Tests (Vitest — `useItems`, `itemsRepository`, `validators`)** | Testing | v1.1 ✓ |

---

## 🚫 Ideas Descartadas (Registro de Exclusiones)

*Estas ideas han sido evaluadas y descartadas explícitamente para evitar volver a sugerirlas o pensarlas en futuras iteraciones:*

1. **Atajos de Teclado (Keyboard Shortcuts)**: Descartado para mantener la experiencia simple e intuitiva centrada en la interacción limpia con mouse/touch sin sobrecargar la curva de aprendizaje.
2. **Estadísticas de Hábitos de Consumo**: Descartado para evitar cluttering visual y mantener el foco de la app en la gestión ágil y rápida de la lista personal.
3. **Generador de Tarjetas para Compartir (Share Card PNG)**: Descartado al no alinearse con el enfoque local-first privado y sin consumo de recursos superfluos en Canvas.
4. **Edición en Lote (Multi-Select Control)**: Descartado permanentemente. La interacción uno a uno (dropdown de estado por tarjeta + `EditModal` individual) es suficiente y más coherente con el diseño de la app. Agregar una barra flotante de acciones masivas añadiría complejidad sin un beneficio real para el caso de uso típico.

---

## ⏸️ Ideas en Suspensión (En Evaluación Futura)

*Ideas que no son ni buenas ni malas por ahora, pero quedan congeladas sin asignación de versión hasta evaluar necesidad real:*

1. **Listas Personalizadas por Usuario (Custom Collections)**: En pausa. Las 8 secciones base actuales cubren el 95% de las necesidades.
2. **Motor de Sugerencias "Qué Ver"**: En pausa. Se prioriza la gestión sobre el descubrimiento activo por API.

---

## 📊 Matriz de Clasificación Híbrida (Backlog Activo)

| Pilar Técnico | 🔥 Alta Prioridad (v1.2) | ⚡ Media Prioridad (v1.2 - v1.3) | 💡 Baja Prioridad / Futuro (v2.0) |
|---|---|---|---|
| **🎨 UX / UI & Diseño** | A. Eliminación completa `completado`<br>B. Edición en Lote (Multi-Select) | C. Modo Compacto / Densidad<br>D. Filtros Avanzados & Combinados | E. Galería HD de Portadas |
| **🧪 Testing & Calidad** | F. Suite E2E Playwright | G. Pruebas de Regresión Visual | H. Mutation Testing (Stryker) |
| **🛡️ Seguridad & Datos** | I. Sanitización JSON/XML Estricta<br>J. Auto-Snapshots / Backups | K. Importador AniList/Kitsu | L. Cifrado Opcional LocalStorage |
| **⚡ Rendimiento & PWA** | M. Offline Status Banner & Graceful Fallback | N. PWA Instalable & Offline | O. Virtualización (@tanstack/virtual) |
| **🚀 Producto & Ecosistema** | P. Changelog In-App | — | Q. Sincronización Supabase<br>R. Perfil Público Compartible |

---

## 🔥 Alta Prioridad (v1.2)

### A. Eliminación Completa del Estado `completado`
* **Pilar**: 🎨 UX / UI & 🛡️ Seguridad & Datos
* **Versión**: v1.2 | **Esfuerzo**: 2-3h
* **Descripción**: El tab fue eliminado en v1.1, pero el estado `completado` aún existe en `ESTADOS_USUARIO`, `itemSchema.js`, `EditModal` e historial. Migrar ítems existentes con `estadoUsuario='completado'` a `'finalizado'`, remover la opción del modal y limpiar todas las referencias en la codebase.

### B. Edición en Lote (Multi-Select Control)
* **Pilar**: 🎨 UX / UI & Diseño
* **Versión**: v1.2 | **Esfuerzo**: 3-4h
* **Descripción**: Permitir seleccionar múltiples tarjetas en la lista (modo selección) para cambiar estado, agregar/quitar etiquetas o eliminar varios ítems simultáneamente mediante una barra flotante de acciones masivas.

### F. Suite E2E con Playwright + GitHub Actions
* **Pilar**: 🧪 Testing & Calidad
* **Versión**: v1.2 | **Esfuerzo**: 4-5h
* **Descripción**: Configurar Playwright para flujos críticos: agregar ítem desde búsqueda, cambiar estado con `ClipboardList`, filtrar por tab, e importar XML de MAL. Integrar en CI/CD.

### I. Sanitización y Validación Estricta en Importación
* **Pilar**: 🛡️ Seguridad & Datos
* **Versión**: v1.2 | **Esfuerzo**: 2h
* **Descripción**: Sanitización XSS y limpieza de campos maliciosos en `malImporter.js` y `jsonImporter.js` usando un helper `sanitizeText(str)` en el dominio antes de guardar en `localStorage`.

### J. Snapshots Automáticos & Puntos de Restauración Local
* **Pilar**: 🛡️ Seguridad & Datos
* **Versión**: v1.2 | **Esfuerzo**: 2-3h
* **Descripción**: Creación automática de un punto de restauración en `localStorage` antes de ejecutar una importación o borrado masivo, permitiendo deshacer la operación con 1 solo clic.

### M. Offline Status Banner & Graceful Fallback
* **Pilar**: ⚡ Rendimiento & PWA
* **Versión**: v1.2 | **Esfuerzo**: 2h
* **Descripción**: Notificación sutil en la UI cuando falla la conexión al buscar o actualizar en la API, manteniendo la funcionalidad local al 100% y reintentando automáticamente al volver la red.

### P. Changelog In-App (Novedades de Versión)
* **Pilar**: 🚀 Producto & Ecosistema
* **Versión**: v1.2 | **Esfuerzo**: 1-2h
* **Descripción**: Modal "Novedades de la versión" que abre automáticamente la primera vez que se detecta una nueva versión en `localStorage`.

---

## ⚡ Media Prioridad (v1.2 → v1.3)

### C. Modo Compacto / Densidad de Vista Configurable
* **Pilar**: 🎨 UX / UI & Diseño
* **Versión**: v1.3 | **Esfuerzo**: 2-3h
* **Descripción**: Selector de densidad: vista detallada actual | vista compacta (solo portada + título + badge) | cuadrícula de portadas (galería). Persistido en `localStorage`.

### D. Filtros Avanzados & Combinados
* **Pilar**: 🎨 UX / UI & Diseño
* **Versión**: v1.3 | **Esfuerzo**: 3h
* **Descripción**: Panel de filtros combinados: filtrar por múltiples géneros simultáneamente (inclusión/exclusión) y rango de puntuación personal en la barra de herramientas.

### G. Pruebas de Regresión Visual con Playwright
* **Pilar**: 🧪 Testing & Calidad
* **Versión**: v1.3 | **Esfuerzo**: 3-4h
* **Descripción**: Capturas de pantalla automatizadas en tema claro y oscuro para prevenir regresiones visuales en `ItemCard`, `SectionTabs`, `DetailModal` y toolbars.

### K. Importador Directo desde AniList y Kitsu (JSON)
* **Pilar**: 🛡️ Seguridad & Datos
* **Versión**: v1.2 | **Esfuerzo**: 3-4h
* **Descripción**: Extender la importación para aceptar exports nativos en JSON de AniList y Kitsu, complementando la importación XML de MyAnimeList.

### N. Soporte PWA Completo (Progressive Web App - Offline First)
* **Pilar**: ⚡ Rendimiento & PWA
* **Versión**: v1.3 | **Esfuerzo**: 3-4h
* **Descripción**: Integrar `vite-plugin-pwa` para permitir la instalación de AMlist como app nativa en móvil y escritorio con Service Worker.

---

## 💡 Baja Prioridad / Futuro (v2.0+)

### E. Galería de Portadas en Alta Resolución
* **Pilar**: 🎨 UX / UI & Diseño
* **Versión**: v2.0 | **Esfuerzo**: 2-3h
* **Descripción**: Visualizador emergente con zoom y pan táctil para apreciar la portada original desde el `DetailModal`.

### H. Pruebas de Mutación de Código con Stryker
* **Pilar**: 🧪 Testing & Calidad
* **Versión**: v2.0 | **Esfuerzo**: 4h
* **Descripción**: Evaluación de la suite introduciendo mutantes en `validators.js` e `itemsRepository.js`. Meta: >80% de mutantes eliminados.

### L. Cifrado Opcional de Datos Locales
* **Pilar**: 🛡️ Seguridad & Datos
* **Versión**: v2.0 | **Esfuerzo**: 3-4h
* **Descripción**: Cifrado AES-GCM opcional para el `localStorage`, activado por PIN del usuario para dispositivos compartidos.

### O. Virtualización de Listas Extensas (@tanstack/virtual)
* **Pilar**: ⚡ Rendimiento & PWA
* **Versión**: v2.0 | **Esfuerzo**: 3-4h
* **Descripción**: Renderizar únicamente los elementos visibles en pantalla si la lista supera los 500 ítems.

### Q. Sincronización Opcional en la Nube (Supabase Local-First)
* **Pilar**: 🚀 Producto & Ecosistema
* **Versión**: v2.0 | **Esfuerzo**: 12-16h
* **Descripción**: Sincronización en segundo plano con Supabase PostgreSQL sin perder la operación 100% offline. Adaptador hexagonal dual.

### R. Perfil Público Compartible (Read-Only Link)
* **Pilar**: 🚀 Producto & Ecosistema
* **Versión**: v2.0 | **Esfuerzo**: 6-8h
* **Descripción**: Generar una URL pública de solo lectura para mostrar la lista de forma visual (requiere backend v2.0).
