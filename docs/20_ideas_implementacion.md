# 20 Ideas de Implementación — AMlist
> Ranking de mejoras realistas por impacto en UX/valor de negocio.
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

### 1. Filtro por tags en la lista
**Categoría:** UX  
**Esfuerzo:** Bajo (1-2h)  
El usuario ya puede crear tags en cada ítem. Falta poder filtrar la lista usando esos tags. Sin esto, los tags son solo decorativos.

**Cómo se vería:** Un dropdown o pills clicables debajo de las pestañas. Puedes tener activos varios tags a la vez. La lista se filtra en tiempo real.

**Por qué es prioritario:** Completar una feature ya existente tiene más impacto que agregar funciones nuevas.

---

### 2. Vista de detalle expandida (Detail Modal)
**Categoría:** UX / Diseño  
**Esfuerzo:** Medio (4-6h)  
Al hacer clic en la portada de un ítem, se abre un modal grande con: sinopsis completa, géneros como pills, score de comunidad, todos los controles de edición. La tarjeta principal se vuelve mucho más limpia.

**Por qué es prioritario:** La `ItemCard` actual tiene demasiada información en pantalla. Este modal la liberaría y haría la lista más legible.

---

### 3. Indicador de progreso visual en la tarjeta
**Categoría:** UX  
**Esfuerzo:** Bajo (1h)  
Una barra de progreso visual (ej: `■■■■□□□□`) debajo del título en la `ItemCard`. Visible de un vistazo sin necesidad de leer los números.

**Por qué es prioritario:** Mejora instantánea de legibilidad. Una barra de progreso CSS es trivial de implementar.

---

### 4. Búsqueda local en tiempo real con highlight
**Categoría:** UX  
**Esfuerzo:** Bajo (1-2h)  
Ya existe una barra de búsqueda local. Mejorarla para que resalte (`<mark>`) las coincidencias en el título, tags y descripción personal mientras el usuario tipea.

**Por qué es prioritario:** Mejora de usabilidad inmediata, especialmente cuando la lista tiene muchos ítems.

---

### 5. Confirmación visual de "guardado" (toast notification)
**Categoría:** UX / Feedback  
**Esfuerzo:** Bajo (2h)  
Actualmente cuando el usuario guarda cambios en `EditModal`, no hay ningún feedback visual. Agregar un toast (notificación pequeña) que diga "✓ Guardado" por 2 segundos.

**Por qué es prioritario:** El feedback inmediato reduce la incertidumbre del usuario ("¿se guardó o no?").

---

### 6. Modo "ahorrando datos" para imágenes
**Categoría:** Performance / UX mobile  
**Esfuerzo:** Bajo (1h)  
Lazy loading de imágenes con `loading="lazy"` en todas las portadas + un skeleton placeholder mientras cargan. Mejora significativa en mobile con conexión lenta.

**Por qué es prioritario:** Las portadas de anime/manga son la parte más pesada de la UI y actualmente cargan todas a la vez.

---

### 7. Dashboard de estadísticas
**Categoría:** UX / Engagement  
**Esfuerzo:** Medio (4-6h)  
Una vista nueva con:
- Total de episodios/capítulos consumidos
- Distribución por estado (pie chart o barras CSS)
- Top 5 géneros del usuario
- Puntuación promedio personal
- Racha de actividad (ítems agregados por mes)

**Por qué es prioritario:** Hace que el usuario "vea el valor" de sus datos acumulados — incentiva seguir usando la app.

---

## ⚡ Media prioridad

### 8. Modo PWA (Progressive Web App)
**Categoría:** Plataforma  
**Esfuerzo:** Bajo-Medio (2-4h con Vite PWA plugin)  
Convierte AMlist en una PWA instalable. El usuario puede "Instalar" la app en su escritorio o celular y abrirla sin el navegador. Con Service Worker, funciona completamente offline.

**Cómo se hace:** `vite-plugin-pwa` — prácticamente automático con Vite.

---

### 9. Ordenamiento persistente por lista
**Categoría:** UX  
**Esfuerzo:** Bajo (1h)  
La preferencia de ordenamiento (fecha, título, puntuación, etc.) actualmente se reinicia cada vez que cambias de sección o recargas. Persistirla en `localStorage` por lista.

---

### 10. Listas personalizadas (crear, renombrar, eliminar)
**Categoría:** Producto  
**Esfuerzo:** Alto (8-12h)  
El usuario puede crear listas temáticas además de Anime y Manga. Por ejemplo: "Plan de verano", "Mejores de 2025", "Recomendados por X".

**Riesgo técnico:** Requiere cambio en el modelo de datos (`listaId` en cada ítem) y migración de datos existentes.

---

### 11. Importar lista desde AniList o Kitsu
**Categoría:** Onboarding  
**Esfuerzo:** Medio (4-6h)  
El usuario puede traer su lista de AniList en formato JSON o Kitsu export. Complementa el importador MAL XML ya existente.

**Nota de seguridad:** Solo `JSON.parse` estándar del navegador, nunca `eval()`.

---

### 12. Changelog visible dentro de la app
**Categoría:** Producto / Confianza  
**Esfuerzo:** Bajo (1h)  
Una sección o modal simple que muestre "Novedades en esta versión" al usuario cuando la app se actualiza. Se lee de un archivo `CHANGELOG.md` en el repo.

**Por qué importa:** Comunica que la app está activa y mejorando — genera confianza en el usuario.

---

### 13. Compartir ítem como tarjeta visual (Share Card)
**Categoría:** Social / Engagement  
**Esfuerzo:** Medio (3-5h)  
Al hacer clic en "Compartir" en un ítem, genera una imagen PNG visualmente atractiva con: portada, título, puntuación personal y estado. Se puede compartir por cualquier red social.

**Cómo se hace:** `html2canvas` o Canvas API del navegador.

---

### 14. Filtro por género
**Categoría:** UX  
**Esfuerzo:** Bajo (1-2h)  
Ya guardamos `genres: []` en cada ítem desde la API. Falta un dropdown para filtrar por género. Muy similar al filtro de tags, puede compartir código.

---

### 15. Sugerencias de "qué ver a continuación" basadas en tu lista
**Categoría:** Descubrimiento  
**Esfuerzo:** Medio-Alto (6-10h)  
Usando los géneros de los ítems que tienes como "Completado" y puntuación alta (≥7), llamar a AniList API para buscar títulos similares que el usuario NO tenga en su lista.

**Por qué es poderoso:** Convierte AMlist de un "rastreador" a un "descubridor" — aumenta el tiempo de uso.

---

## 💡 Baja prioridad (Ideas para el futuro)

### 16. Cuentas de usuario + sincronización en la nube
**Categoría:** Arquitectura / Plataforma  
**Esfuerzo:** Muy alto (20-40h)  
Login opcional con Google/GitHub (Supabase Auth). Sin cuenta, la app sigue 100% funcional. Con cuenta, las listas se sincronizan entre dispositivos en la nube.

**Requisito previo:** Completar la Arquitectura Hexagonal para que el cambio de `localStorage` a `Supabase` no toque la UI.

---

### 17. Arquitectura Hexagonal completa
**Categoría:** Arquitectura interna  
**Esfuerzo:** Alto (15-20h)  
Migrar de Clean Architecture de 3 capas a Hexagonal con inyección de dependencias. Ver detalles en `docs/ROADMAP.md`.

**Por qué importa:** Es el prerequisito técnico para la sincronización en la nube y las pruebas unitarias completas.

---

### 18. Modo "Maratón" (sesión de progreso rápido)
**Categoría:** UX / Engagement  
**Esfuerzo:** Medio (3-5h)  
Un modo especial donde el usuario puede actualizar el progreso de múltiples ítems a la vez (flechas rápidas +1 episodio) sin abrir el EditModal cada vez. Pensado para después de una sesión intensa de maratón.

---

### 19. Calendario de estrenos "En emisión"
**Categoría:** Descubrimiento / UX  
**Esfuerzo:** Medio-Alto (6-8h)  
Una vista de calendario semanal que muestra los días en que se emiten nuevos episodios de los animes que tienes en "En emisión". Usa el campo `estadoEmision: 'airing'` ya existente + datos del schedule de AniList.

---

### 20. Suite de tests automatizados completa (TDD)
**Categoría:** Calidad interna  
**Esfuerzo:** Alto (10-15h)  
Actualmente solo `apiClient.test.js` tiene tests. Expandir a:
- Tests unitarios de `validators.js`, `historial.js`, `itemsRepository.js`
- Tests de integración para los flujos principales (agregar ítem, cambiar estado, exportar JSON)
- Tests de regresión para el fallback de APIs

**Por qué importa:** Blindar la app ante cambios futuros. Si se toca la lógica de progreso o el triple fallback, los tests lo atrapa antes de llegar al usuario.

---

## Resumen de prioridades

| # | Idea | Prioridad | Esfuerzo |
|---|---|---|---|
| 1 | Filtro por tags | 🔥 Alta | Bajo |
| 2 | Vista de detalle (Detail Modal) | 🔥 Alta | Medio |
| 3 | Barra de progreso visual en tarjeta | 🔥 Alta | Bajo |
| 4 | Búsqueda local con highlight | 🔥 Alta | Bajo |
| 5 | Toast de "guardado" | 🔥 Alta | Bajo |
| 6 | Lazy loading de portadas | 🔥 Alta | Bajo |
| 7 | Dashboard de estadísticas | 🔥 Alta | Medio |
| 8 | PWA instalable | ⚡ Media | Bajo-Medio |
| 9 | Ordenamiento persistente | ⚡ Media | Bajo |
| 10 | Listas personalizadas | ⚡ Media | Alto |
| 11 | Importar AniList / Kitsu | ⚡ Media | Medio |
| 12 | Changelog visible | ⚡ Media | Bajo |
| 13 | Compartir como tarjeta visual | ⚡ Media | Medio |
| 14 | Filtro por género | ⚡ Media | Bajo |
| 15 | Sugerencias "qué ver" | ⚡ Media | Medio-Alto |
| 16 | Cuentas + sincronización nube | 💡 Baja | Muy alto |
| 17 | Arquitectura Hexagonal | 💡 Baja | Alto |
| 18 | Modo "Maratón" | 💡 Baja | Medio |
| 19 | Calendario de estrenos | 💡 Baja | Medio-Alto |
| 20 | Suite de tests TDD completa | 💡 Baja | Alto |
