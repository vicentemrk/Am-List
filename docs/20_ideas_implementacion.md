# 20 Ideas de Implementación — AMlist
> Ranking de mejoras pendientes por impacto en UX/valor de negocio.
> Mezcla: UI/UX, características de producto y arquitectura interna.
> Última actualización: 2026-07-21

---

## Criterios de ranking

Cada idea está rankeada por **impacto × esfuerzo**:
- 🔥 **Alta prioridad** — Alto impacto, bajo/medio esfuerzo
- ⚡ **Media prioridad** — Alto impacto, alto esfuerzo OR bajo impacto, bajo esfuerzo
- 💡 **Baja prioridad** — Interesante pero complejo o nicho

---

## 🔥 Alta prioridad (Hacer primero)

### 1. Vista de detalle expandida (Detail Modal)
**Categoría:** UX / Diseño  
**Esfuerzo:** Medio (4-6h)  
Al hacer clic en la portada de un ítem, se abre un modal grande con: sinopsis completa, géneros como pills, score de comunidad y todos los controles de edición. Limpia la `ItemCard` principal.

---

### 2. Dashboard de estadísticas de consumo
**Categoría:** UX / Engagement  
**Esfuerzo:** Medio (4-6h)  
Vista dedicada con: total de episodios/capítulos consumidos, distribución por estado (gráficos CSS), top 5 géneros más vistos y puntuación promedio.

---

### 3. Filtro por género en el listado
**Categoría:** UX  
**Esfuerzo:** Bajo (1-2h)  
Pills o dropdown para filtrar por género (Acción, Romance, Sci-Fi, etc.), aprovechando los datos de géneros ya guardados desde la API.

---

### 4. Botones de acceso rápido (+1 Episodio / Capítulo) en tarjeta
**Categoría:** UX / Productividad  
**Esfuerzo:** Bajo (1h)  
Un botón rápido `+1` directamente en la tarjeta del ítem para incrementar el progreso actual con un solo clic sin necesidad de abrir el modal de edición.

---

### 5. Ordenamiento persistente por lista
**Categoría:** UX  
**Esfuerzo:** Bajo (1h)  
Guardar la preferencia de ordenamiento (título, fecha, puntuación, progreso) en `localStorage` para que no se reinicie al cambiar de pestaña o recargar.

---

### 6. Atajos de teclado (Keyboard Shortcuts)
**Categoría:** UX / Productividad  
**Esfuerzo:** Bajo (1-2h)  
Atajos tipo `/` para enfocar la búsqueda local, `Ctrl+A` para abrir el modal de agregar, y `Esc` para cerrar cualquier modal.

---

## ⚡ Media prioridad

### 7. Modo PWA (Progressive Web App - Instalable & Offline)
**Categoría:** Plataforma  
**Esfuerzo:** Bajo-Medio (2-4h con `vite-plugin-pwa`)  
Permite instalar AMlist como app nativa en escritorio o celular con soporte offline mediante Service Worker.

---

### 8. Importar lista desde AniList o Kitsu
**Categoría:** Onboarding  
**Esfuerzo:** Medio (4-6h)  
Permite al usuario importar sus datos directamente desde un export en JSON de AniList o Kitsu, complementando la importación de MAL.

---

### 9. Listas personalizadas (crear, renombrar, eliminar)
**Categoría:** Producto  
**Esfuerzo:** Alto (8-12h)  
Creación de listas temáticas personalizadas además de las predeterminadas de Anime y Manga (ej: "Favoritos de verano", "Por re-ver").

---

### 10. Changelog visible dentro de la app
**Categoría:** Producto / Confianza  
**Esfuerzo:** Bajo (1h)  
Modal o vista simple que muestre "Novedades de esta versión" cuando la app se actualice, leyendo un archivo `CHANGELOG.md`.

---

### 11. Compartir ítem como tarjeta visual (Share Card)
**Categoría:** Social / Engagement  
**Esfuerzo:** Medio (3-5h)  
Genera una imagen PNG atractiva con la portada, título, puntuación personal y estado del ítem para compartir en redes sociales.

---

### 12. Sugerencias "qué ver a continuación"
**Categoría:** Descubrimiento  
**Esfuerzo:** Medio-Alto (6-10h)  
Recomendación de títulos basada en los géneros de los ítems con puntuación alta (≥7) utilizando la API de AniList.

---

### 13. Exportar a CSV y Markdown (Obsidian / Notion)
**Categoría:** Utilidad / Datos  
**Esfuerzo:** Bajo (1-2h)  
Permite exportar la lista de animes/mangas en formato CSV para Excel o Markdown para notas en Obsidian / Notion.

---

### 14. Indicador visual de episodio en emisión hoy ("Emite Hoy")
**Categoría:** Descubrimiento / UX  
**Esfuerzo:** Medio (2-3h)  
Indica visualmente qué animes de tu lista emiten un nuevo episodio el día de hoy según la programación de AniList.

---

### 15. Selector interactivo de estrellas rápidas en tarjeta
**Categoría:** UX  
**Esfuerzo:** Bajo (1-2h)  
Calificar un ítem directamente desde la tarjeta principal haciendo clic en 1-10 estrellas sin abrir el modal de edición.

---

### 16. Filtro rápido por tipo de emisión / formato (TV, Movie, OVA, Manga, Manhwa)
**Categoría:** UX  
**Esfuerzo:** Bajo (1-2h)  
Filtro para clasificar entre series de TV, películas, OVAs o formatos de lectura (Manga vs Manhwa/Webtoon).

---

## 💡 Baja prioridad (Ideas para el futuro)

### 17. Modo "Maratón" (sesión de progreso rápido)
**Categoría:** UX / Engagement  
**Esfuerzo:** Medio (3-5h)  
Vista rápida tipo lista compacta para actualizar múltiples ítems velozmente tras una maratón de episodios.

---

### 18. Calendario semanal de estrenos "En emisión"
**Categoría:** Descubrimiento / UX  
**Esfuerzo:** Medio-Alto (6-8h)  
Vista de calendario semanal con los días de emisión de los animes en curso que el usuario sigue.

---

### 19. Filtro por temporada / año de emisión
**Categoría:** UX  
**Esfuerzo:** Medio (3-4h)  
Filtrar la lista por temporada (Ej: Primavera 2026, Invierno 2025) aprovechando la fecha de emisión de los animes.

---

### 20. Cuentas de usuario + sincronización en la nube
**Categoría:** Arquitectura / Plataforma  
**Esfuerzo:** Muy alto (20-40h con Supabase Auth)  
Login opcional con Google/GitHub para sincronizar listas en la nube manteniendo el soporte 100% offline sin cuenta.

---

## 📊 Resumen de prioridades activas (20 Ideas Pendientes)

| # | Idea | Prioridad | Esfuerzo |
|---|---|---|---|
| 1 | Vista de detalle expandida (Detail Modal) | 🔥 Alta | Medio (4-6h) |
| 2 | Dashboard de estadísticas de consumo | 🔥 Alta | Medio (4-6h) |
| 3 | Filtro por género en el listado | 🔥 Alta | Bajo (1-2h) |
| 4 | Botones de acceso rápido (+1 Episodio/Capítulo) | 🔥 Alta | Bajo (1h) |
| 5 | Ordenamiento persistente por lista | 🔥 Alta | Bajo (1h) |
| 6 | Atajos de teclado (Keyboard Shortcuts) | 🔥 Alta | Bajo (1-2h) |
| 7 | Modo PWA (Progressive Web App) | ⚡ Media | Bajo-Medio (2-4h) |
| 8 | Importar lista desde AniList o Kitsu | ⚡ Media | Medio (4-6h) |
| 9 | Listas personalizadas (crear/editar) | ⚡ Media | Alto (8-12h) |
| 10 | Changelog visible en la app | ⚡ Media | Bajo (1h) |
| 11 | Compartir como tarjeta visual (Share Card) | ⚡ Media | Medio (3-5h) |
| 12 | Sugerencias "qué ver a continuación" | ⚡ Media | Medio-Alto (6-10h) |
| 13 | Exportar a CSV y Markdown | ⚡ Media | Bajo (1-2h) |
| 14 | Indicador visual de episodio en emisión hoy | ⚡ Media | Medio (2-3h) |
| 15 | Selector interactivo de estrellas en tarjeta | ⚡ Media | Bajo (1-2h) |
| 16 | Filtro por formato (TV, Movie, OVA, Manhwa) | ⚡ Media | Bajo (1-2h) |
| 17 | Modo "Maratón" | 💡 Baja | Medio (3-5h) |
| 18 | Calendario semanal de estrenos | 💡 Baja | Medio-Alto (6-8h) |
| 19 | Filtro por temporada / año de emisión | 💡 Baja | Medio (3-4h) |
| 20 | Cuentas + sincronización en la nube | 💡 Baja | Muy alto (20-40h) |

---

## ✅ Historial de Features Completadas

- **[Completado ✅] Eliminación instantánea + Toast "Deshacer"**: Removida la ventana emergente `window.confirm`; borrado directo con opción de deshacer.
- **[Completado ✅] Filtro por tags en la lista**: Pills clicables para filtrar en tiempo real por una o más etiquetas.
- **[Completado ✅] Indicador de progreso visual**: Barra gráfica CSS en cada tarjeta que muestra el % avanzado.
- **[Completado ✅] Búsqueda local con highlight**: Resaltado amarillo (`<mark>`) de texto coincidente en títulos y etiquetas.
- **[Completado ✅] Toast de notificaciones**: Feedback flotante en esquina inferior derecha al guardar/agregar/eliminar/importar.
- **[Completado ✅] Lazy loading de portadas**: Carga diferida de imágenes `loading="lazy"` y contenedores placeholder.
- **[Completado ✅] Modal de Edición con Borrador Local**: Botones Aceptar, Cancelar y comportamiento de botón X.
- **[Completado ✅] Des-agregar en búsqueda múltiple**: Quitar ítems agregados haciendo clic en el check `✓`.
- **[Completado ✅] Importación JSON nativa de AMlist**: Soporte para archivos `.json` exportados desde la propia app.
