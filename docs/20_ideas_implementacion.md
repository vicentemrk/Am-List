# Matriz de Ideas de Implementación — AMlist

> Matriz Híbrida de Priorización y Pilares Técnicos para la evolución de AMlist.
> Evaluado por **Impacto × Esfuerzo × Pilar Técnico**.
> Última actualización: 2026-08-01

---

## 📊 Matriz de Clasificación Híbrida

| Pilar Técnico | 🔥 Alta Prioridad (v1.1) | ⚡ Media Prioridad (v1.2 - v1.3) | 💡 Baja Prioridad / Futuro (v2.0) |
|---|---|---|---|
| **🎨 UX / UI & Diseño** | 1. Modal Detallado<br>4. Botón `+1` Rápido | 9. Listas Personalizadas<br>11. Share Card PNG | 16. Visualizador de Portada HD |
| **🧪 Testing & Calidad** | 6. Cobertura de Hooks & E2E | 10. Pruebas de Regresión Visual | 17. Mutation Testing (Stryker) |
| **🛡️ Seguridad & Datos** | 3. Throttle/Rate Limit API | 8. Sanitización de JSON/XML | 18. Cifrado LocalStorage |
| **⚡ Rendimiento & PWA** | 5. Ordenamiento Persistente | 7. PWA Instalable & Offline | 19. Virtualización de Listas |
| **🚀 Producto & Ecosistema**| 12. Importación AniList/Kitsu (Promovido) | 14. Changelog In-App | 15. Sugerencias "Qué Ver"<br>20. Sincronización Supabase |

> *Nota: La idea previa #2 (Dashboard de Estadísticas) fue cancelada por decisión del usuario.*

---

## 🔥 Alta Prioridad (Asignadas a v1.1)

### 1. Vista de Detalle Expandida (Detail Modal / Drawer)
* **Pilar**: 🎨 UX / UI & Diseño
* **Versión**: v1.1 | **Esfuerzo**: 4-6h
* **Descripción**: Al presionar la portada de un ítem, abre un modal/drawer completo tipo AniList/Netflix con la sinopsis sin truncar, géneros como pills interactivas, tráiler (si la API lo devuelve), puntuación de la comunidad y controles de edición. Mantiene la tarjeta `ItemCard` limpia y ligera.

### 2. Freno de Mano en Búsqueda (API Rate Limiting & Throttling)
* **Pilar**: 🛡️ Seguridad & Datos
* **Versión**: v1.1 | **Esfuerzo**: 2h
* **Descripción**: Agregar una cola/debounce de peticiones en `useSearch.js` para evitar saturación (HTTP 429) en AniList GraphQL y MangaDex REST cuando el usuario escribe ráfagas rápidas.

### 3. Botón de Incremento Rápido (`+1` Episodio/Capítulo) en Tarjeta
* **Pilar**: 🎨 UX / UI & Diseño
* **Versión**: v1.1 | **Esfuerzo**: 1h
* **Descripción**: Permitir incrementar el progreso actual con un solo toque directo en la tarjeta sin abrir el modal de edición.

### 4. Persistencia del Criterio de Ordenamiento
* **Pilar**: ⚡ Rendimiento & PWA
* **Versión**: v1.1 | **Esfuerzo**: 1h
* **Descripción**: Guardar la preferencia de ordenamiento (fecha, título A-Z, puntuación, progreso) en `localStorage` mediante adaptadores para evitar que se reinicie al recargar.

### 5. Suite Completa de Pruebas Unitarias para Hooks (`useItems`, `useSearch`)
* **Pilar**: 🧪 Testing & Calidad
* **Versión**: v1.1 | **Esfuerzo**: 2-3h
* **Descripción**: Asegurar que las operaciones de filtrado, guardado, actualización e historial en los hooks principales y adaptadores no fallen ante cambios futuros.

---

## ⚡ Media Prioridad (v1.2 y v1.3)

### 6. Soporte PWA Completo (Progressive Web App - Offline First)
* **Pilar**: ⚡ Rendimiento & PWA
* **Versión**: v1.3 | **Esfuerzo**: 3-4h
* **Descripción**: Integrar `vite-plugin-pwa` para permitir la instalación de AMlist como aplicación nativa en iOS, Android y escritorio con caché de Service Worker.

### 7. Sanitización y Validación Estricta en Importación (JSON / MAL XML)
* **Pilar**: 🛡️ Seguridad & Datos
* **Versión**: v1.2 | **Esfuerzo**: 2h
* **Descripción**: Limpiar y desinfectar etiquetas HTML y scripts maliciosos de cualquier archivo cargado por el usuario antes de guardarlo en `localStorage`.

### 8. Listas Personalizadas por Usuario (Custom Collections)
* **Pilar**: 🎨 UX / UI & Diseño
* **Versión**: v1.2 | **Esfuerzo**: 6-8h
* **Descripción**: Permitir al usuario crear, renombrar y eliminar listas temáticas personalizadas (ej. "Animes de Verano", "Manga para Re-leer") además de las listas base.

### 9. Pruebas de Regresión Visual con Playwright
* **Pilar**: 🧪 Testing & Calidad
* **Versión**: v1.3 | **Esfuerzo**: 3-4h
* **Descripción**: Configurar capturas de pantalla automatizadas para comparar visualmente que el tema claro (gris hueso `#ced2d0`) y oscuro no sufran regresiones.

### 10. Tarjeta Visual para Compartir en Redes (Share Card Generator)
* **Pilar**: 🎨 UX / UI & Diseño
* **Versión**: v1.3 | **Esfuerzo**: 3-4h
* **Descripción**: Renderizar una imagen PNG usando `html-to-image` o Canvas con la portada, título y puntuación personal para compartir en redes sociales.

### 11. Importador Directo desde AniList y Kitsu
* **Pilar**: 🚀 Producto & Ecosistema
* **Versión**: v1.2 | **Esfuerzo**: 4-5h
* **Descripción**: Extender la función de importación para aceptar exports nativos en JSON de AniList y Kitsu, complementando la importación XML de MyAnimeList.

### 12. Atajos de Teclado (Keyboard Navigation & Shortcuts)
* **Pilar**: 🎨 UX / UI & Diseño
* **Versión**: v1.2 | **Esfuerzo**: 2h
* **Descripción**: Atajos de teclado: `/` para buscar, `Ctrl+A` para agregar, y `Esc` para cerrar modales.

### 13. Changelog Visible en la Aplicación (Novedades de Versión)
* **Pilar**: 🚀 Producto & Ecosistema
* **Versión**: v1.2 | **Esfuerzo**: 1-2h
* **Descripción**: Modal desplegable de novedades que lee directamente los cambios de la versión instalada.

---

## 💡 Baja Prioridad / Futuro (v2.0)

### 14. Motor de Sugerencias "Qué Ver a Continuación"
* **Pilar**: 🚀 Producto & Ecosistema
* **Versión**: v2.0 | **Esfuerzo**: 6-8h
* **Descripción**: Algoritmo local que analiza los géneros más puntuados por el usuario para sugerir nuevos títulos de la API.

### 15. Galería de Portadas en Alta Resolución
* **Pilar**: 🎨 UX / UI & Diseño
* **Versión**: v2.0 | **Esfuerzo**: 2-3h
* **Descripción**: Visualizador emergente con zoom para apreciar la ilustración de portada original.

### 16. Pruebas de Mutación de Código con Stryker
* **Pilar**: 🧪 Testing & Calidad
* **Versión**: v2.0 | **Esfuerzo**: 4h
* **Descripción**: Evaluación de la suite de pruebas introduciendo mutantes para verificar que los errores sean detectados.

### 17. Cifrado Opcional de Datos Locales
* **Pilar**: 🛡️ Seguridad & Datos
* **Versión**: v2.0 | **Esfuerzo**: 3-4h
* **Descripción**: Cifrado AES opcional para la información guardada en `localStorage`.

### 18. Virtualización de Listas Extensas (`react-window`)
* **Pilar**: ⚡ Rendimiento & PWA
* **Versión**: v2.0 | **Esfuerzo**: 3-4h
* **Descripción**: Renderizar únicamente los elementos visibles en pantalla si la lista del usuario supera los 500 ítems.

### 19. Sincronización Opcional en la Nube (Supabase Local-First)
* **Pilar**: 🚀 Producto & Ecosistema
* **Versión**: v2.0 | **Esfuerzo**: 12-16h
* **Descripción**: Sincronización en segundo plano con Supabase PostgreSQL sin perder la capacidad de operar 100% offline.
