# AMlist

> Tu lista personal de anime y manga — 100% en el navegador, sin backend.

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-green?style=flat)](LICENSE)

---

## ¿Qué es AMlist?

AMlist es una **Single Page Application (SPA)** para gestionar tus listas personales de anime, manga, manhwa y manhua. Busca títulos usando las APIs de **AniList**, **MangaDex** y **Kitsu**, registra tu progreso, puntúa, marca favoritos y organiza todo en secciones — sin necesitar una cuenta ni un servidor (por ahora).

Todo se guarda directamente en tu navegador (`localStorage`).

---

## ✨ Funciones actuales

- 🔍 **Búsqueda multi-API** — AniList → MangaDex → Kitsu (triple fallback automático)
- 📋 **8 secciones** — Lista completa, Por ver, En curso, Completados, Favoritos, En emisión, Finalizados y Dropeados
- ⭐ **Doble puntuación** — Score de la comunidad (dorado) y tu puntuación personal (morado)
- 📈 **Control de progreso** — Episodios o capítulos con validación automática (no puede superar el máximo)
- 🏷️ **Multi-tags** — Hasta 5 etiquetas personales por ítem
- 📝 **Descripción personal** — Notas propias sobre cada anime o manga
- 🔃 **Ordenamiento** — Por fecha, título, puntuación, progreso o arrastrar manualmente
- 📤 **Exportar / Importar** — Exporta tu lista a JSON e importa desde MyAnimeList XML
- 📖 **Historial** — Registro cronológico de todos tus cambios
- 🌙 **Tema claro / oscuro** — Diseño Eye Care (sin blancos ni negros puros)
- 📱 **Mobile First** — Usable desde 360px de ancho

---

## 🛠️ Stack técnico

| Herramienta | Uso |
|---|---|
| [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) | UI y bundler |
| CSS con variables | Theming light/dark sin librerías externas |
| [Lucide React](https://lucide.dev/) | Iconografía |
| `fetch` nativo | Consumo de APIs (sin Axios) |
| `localStorage` | Persistencia (sin backend) |

### APIs utilizadas

| API | Uso |
|---|---|
| [AniList GraphQL](https://anilist.gitbook.io/anilist-apiv2-docs/) | Anime y Manga (fuente primaria) |
| [MangaDex REST](https://api.mangadex.org/docs/) | Manga, Manhwa y Manhua |
| [Kitsu REST](https://kitsu.docs.apiary.io/) | Fallback secundario |

---

## 🔮 Próximas funciones (roadmap)

Las siguientes funciones están planificadas y organizadas por prioridad:

### 🟢 Próximo (v1.1)
Funciones de alto impacto y menor complejidad:

- **Filtro por tags** — Filtrar la lista usando tus propias etiquetas personales
- **Vista de detalle** — Panel expandible al hacer clic en la portada (sinopsis completa, géneros, info extra)

### 🔵 Corto plazo (v1.2)
Funciones que agregan valor significativo al uso diario:

- **Dashboard de estadísticas** — Total de horas vistas, géneros favoritos, progreso general y racha de actividad
- **Listas personalizadas** — Crear, renombrar y eliminar múltiples listas además de Anime y Manga
- **Importar desde AniList / Kitsu** — Además del importador de MyAnimeList XML ya disponible
- **Changelog visible** — Historial de cambios entre versiones de la aplicación

### 🟣 Mediano plazo (v2.0)
Funciones que requieren cambios de arquitectura o mayor alcance:

- **Cuentas de usuario** *(opcional)* — Sin cuenta la app sigue funcionando al 100%; la cuenta permite recuperar listas en otros dispositivos
- **Sincronización en la nube** *(requiere cuenta)* — Local-first: funciona offline, sincroniza cuando hay conexión (Supabase)

### ⚪ Mejoras visuales
Pendientes de diseño:

- **Nuevo logo AMlist** — Rediseño del ícono y branding general

---

## 📝 Licencia

MIT © [vicentemrk](https://github.com/vicentemrk)
