# 20 Ideas de Implementación — AMlist

> Matriz Híbrida de Priorización y Pilares Técnicos para la evolución de AMlist.
> Evaluado por **Impacto × Esfuerzo × Pilar Técnico** con las skills del proyecto.
> Última actualización: 2026-07-22

---

## 📊 Matriz de Clasificación Híbrida

| Pilar Técnico | 🔥 Alta Prioridad | ⚡ Media Prioridad | 💡 Baja Prioridad / Futuro |
|---|---|---|---|
| **🎨 UX / UI & Diseño** | 1. Modal Detallado<br>4. Botón `+1` Rápido | 9. Listas Personalizadas<br>11. Share Card PNG | 16. Visualizador de Portada HD |
| **🧪 Testing & Calidad** | 6. Cobertura de Hooks<br>Playwright E2E | 10. Pruebas de Regresión Visual | 17. Mutation Testing (Stryker) |
| **🛡️ Seguridad & Datos** | 3. Throttle/Rate Limit API | 8. Sanitización de JSON/XML | 18. Cifrado LocalStorage |
| **⚡ Rendimiento & PWA** | 5. Ordenamiento Persistente | 7. PWA Instalable & Offline | 19. Virtualización de Listas |
| **🚀 Producto & Ecosistema**| 2. Dashboard Estadísticas | 12. Importación AniList/Kitsu<br>14. Changelog In-App | 15. Sugerencias "Qué Ver"<br>20. Sincronización Supabase |

---

## 🔥 Alta Prioridad (Hacer Primero — Máximo Valor)

### 1. Vista de Detalle Expandida (Detail Modal / Drawer)
* **Pilar**: 🎨 UX / UI & Diseño
* **Esfuerzo**: 4-6h | **Skill**: `react-component-architect`
* **Descripción**: Al presionar la portada de un ítem, abre un modal/drawer completo tipo AniList/Netflix con la sinopsis sin truncar, géneros como pills interactivas, tráiler (si la API lo devuelve), puntuación de la comunidad y controles de edición. Mantiene la tarjeta `ItemCard` limpia y ligera.

### 2. Dashboard de Estadísticas de Consumo (Stats Overview)
* **Pilar**: 🚀 Producto & Ecosistema
* **Esfuerzo**: 4-5h | **Skill**: `web-vitals-performance`
* **Descripción**: Vista dedicada con gráficos CSS/SVG livianos: total de episodios/capítulos consumidos, distribución por estado (completados, en curso, etc.), top 5 géneros más consumidos y promedio de puntuación personal.

### 3. Freno de Mano en Búsqueda (API Rate Limiting & Throttling)
* **Pilar**: 🛡️ Seguridad & Datos
* **Esfuerzo**: 2h | **Skill**: `security-audit-owasp`
* **Descripción**: Agregar una cola/cola suave de peticiones en `useSearch.js` para evitar saturación (HTTP 429) en AniList GraphQL y MangaDex REST cuando el usuario escribe ráfagas rápidas.

### 4. Botón de Incremento Rápido (`+1` Episodio/Capítulo) en Tarjeta
* **Pilar**: 🎨 UX / UI & Diseño
* **Esfuerzo**: 1h | **Skill**: `react-component-architect`
* **Descripción**: Permitir incrementar el progreso actual con un solo toque directo en la tarjeta sin abrir el modal de edición.

### 5. Persistencia del Criterio de Ordenamiento
* **Pilar**: ⚡ Rendimiento & PWA
* **Esfuerzo**: 1h | **Skill**: `socratic-architect`
* **Descripción**: Guardar la preferencia de ordenamiento (fecha, título A-Z, puntuación, progreso) en `localStorage` mediante `themeRepository`/`itemsRepository` para evitar que se reinicie al recargar.

### 6. Suite Completa de Pruebas Unitarias para Hooks (`useItems`, `useSearch`)
* **Pilar**: 🧪 Testing & Calidad
* **Esfuerzo**: 2-3h | **Skill**: `pytest-suite-expert` / Vitest
* **Descripción**: Asegurar que las operaciones de filtrado, guardado, actualización e historial en el hook principal no fallen ante cambios futuros.

---

## ⚡ Media Prioridad (Alto Impacto / Esfuerzo Moderado)

### 7. Soporte PWA Completo (Progressive Web App - Offline First)
* **Pilar**: ⚡ Rendimiento & PWA
* **Esfuerzo**: 3-4h | **Skill**: `web-vitals-performance`
* **Descripción**: Integrar `vite-plugin-pwa` para permitir la instalación de AMlist como aplicación nativa en iOS, Android y escritorio con caché de Service Worker.

### 8. Sanitización y Validación Estricta en Importación (JSON / MAL XML)
* **Pilar**: 🛡️ Seguridad & Datos
* **Esfuerzo**: 2h | **Skill**: `security-audit-owasp`
* **Descripción**: Limpiar y desinfectar etiquetas HTML y scripts maliciosos de cualquier archivo cargado por el usuario antes de guardarlo en `localStorage`.

### 9. Listas Personalizadas por Usuario (Custom Collections)
* **Pilar**: 🎨 UX / UI & Diseño
* **Esfuerzo**: 6-8h | **Skill**: `adr-decision-records`
* **Descripción**: Permitir al usuario crear, renombrar y eliminar listas temáticas personalizadas (ej. "Animes de Verano", "Manga para Re-leer") además de las listas base.

### 10. Pruebas de Regresión Visual con Playwright
* **Pilar**: 🧪 Testing & Calidad
* **Esfuerzo**: 3-4h | **Skill**: `playwright-e2e-expert`
* **Descripción**: Configurar capturas de pantalla automatizadas para comparar visualmente que el tema claro (gris hueso `#ced2d0`) y oscuro no sufran regresiones.

### 11. Tarjeta Visual para Compartir en Redes (Share Card Generator)
* **Pilar**: 🎨 UX / UI & Diseño
* **Esfuerzo**: 3-4h | **Skill**: `image-generation-prompter`
* **Descripción**: Renderizar una imagen PNG usando `html-to-image` o Canvas con la portada, título y puntuación personal para compartir en redes sociales.

### 12. Importador Directo desde AniList y Kitsu
* **Pilar**: 🚀 Producto & Ecosistema
* **Esfuerzo**: 4-5h | **Skill**: `api-documentation-generator`
* **Descripción**: Extender la función de importación para aceptar exports nativos en JSON de AniList y Kitsu, complementando la importación XML de MyAnimeList.

### 13. Atajos de Teclado (Keyboard Navigation & Shortcuts)
* **Pilar**: 🎨 UX / UI & Diseño
* **Esfuerzo**: 2h | **Skill**: `react-component-architect`
* **Descripción**: Atajos de teclado: `/` para buscar, `Ctrl+A` para agregar, y `Esc` para cerrar modales.

### 14. Changelog Visible en la Aplicación (Novedades de Versión)
* **Pilar**: 🚀 Producto & Ecosistema
* **Esfuerzo**: 1-2h | **Skill**: `living-documentation-architect`
* **Descripción**: Modal desplegable de novedades que lee directamente los cambios de la versión instalada.

---

## 💡 Baja Prioridad / Futuro (Funcionalidades Avanzadas)

### 15. Motor de Sugerencias "Qué Ver a Continuación"
* **Pilar**: 🚀 Producto & Ecosistema
* **Esfuerzo**: 6-8h | **Skill**: `deep-tech-researcher`
* **Descripción**: Algoritmo local que analiza los géneros más puntuados por el usuario para sugerir nuevos títulos de la API.

### 16. Galería de Portadas en Alta Resoluciòn
* **Pilar**: 🎨 UX / UI & Diseño
* **Esfuerzo**: 2-3h | **Skill**: `modern-vanilla-css`
* **Descripción**: Visualizador emergente con zoom para apreciar la ilustración de portada original.

### 17. Pruebas de Mutación de Código con Stryker
* **Pilar**: 🧪 Testing & Calidad
* **Esfuerzo**: 4h | **Skill**: `mutation-testing-expert`
* **Descripción**: Evaluación de la suite de pruebas introduciendo mutantes para verificar que los errores sean detectados.

### 18. Cifrado Opcional de Datos Locales
* **Pilar**: 🛡️ Seguridad & Datos
* **Esfuerzo**: 3-4h | **Skill**: `security-audit-owasp`
* **Descripción**: Cifrado AES opcional para la información guardada en `localStorage`.

### 19. Virtualización de Listas Extensas (`react-window`)
* **Pilar**: ⚡ Rendimiento & PWA
* **Esfuerzo**: 3-4h | **Skill**: `web-vitals-performance`
* **Descripción**: Renderizar únicamente los elementos visibles en pantalla si la lista del usuario supera los 500 ítems.

### 20. Sincronización Opcional en la Nube (Supabase Local-First)
* **Pilar**: 🚀 Producto & Ecosistema
* **Esfuerzo**: 12-16h | **Skill**: `python-fastapi-clean-arch` / Supabase
* **Descripción**: Sincronización en segundo plano con Supabase PostgreSQL sin perder la capacidad de operar 100% offline.
