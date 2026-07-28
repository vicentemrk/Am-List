# AMlist

> Tu lista personal de anime y manga.

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-green?style=flat)](LICENSE)

---

## ¿Qué es AMlist?

AMlist es una **Single Page Application (SPA)** para gestionar tus listas personales de anime, manga, manhwa y manhwa. Busca títulos usando las APIs de **AniList**, **MangaDex** y **Kitsu**, registra tu progreso, puntúa, marca favoritos y organiza todo en secciones — sin necesitar una cuenta ni un servidor (Por ahora).

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
| [AniList GraphQL](https://anilist.gitbook.io/anilist-apiv2-docs/) | Anime y Manga |
| [MangaDex REST](https://api.mangadex.org/docs/) | Manga, Manhwa y Manhua |
| [Kitsu REST](https://kitsu.docs.apiary.io/) | Fallback secundario |

---

## 🔮 Próximas funciones (roadmap)

Las siguientes funciones están planificadas para versiones futuras:

- **Vista de detalle** — Panel expansible al hacer clic en la portada (sinopsis completa, tráiler, etc.)
- **Múltiples listas** — Crear y gestionar varias listas personalizadas
- **Dashboard de estadísticas** — Horas vistas, géneros favoritos, progreso general
- **Sincronización en la nube** — Opcional, mediante Supabase (manteniendo modo offline)
- **Importar desde AniList / Kitsu** — Además del XML de MyAnimeList ya disponible
- **Crear, editar y eliminar listas personalizadas** -- (Pendiente)
- **Cambiar logo AMlist** -- (Pendiente)
- **Crear Cuenta Usuarios** -- Opcional, no necesario para el uso de la aplicacion, asi podran recuperar sus listas en otros dispositivos (Pendiente)
- **Historial de cambios** -- Entre versiones de la pagina web (Pendiente)
- **Filtro por tags de listas** -- Filtrar tu lista usando tus propias etiquetas

---

## 📝 Licencia

MIT © [vicentemrk](https://github.com/vicentemrk)
