# AMlist

> Tu lista personal de anime y manga — 100% en el navegador, sin backend.

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-green?style=flat)](LICENSE)

---

## ¿Qué es AMlist?

AMlist es una **Single Page Application (SPA)** para gestionar tus listas personales de anime y manga. Busca títulos usando las APIs de **AniList** y **MangaDex**, registra tu progreso, puntúa, marca favoritos y organiza todo en secciones — sin necesitar una cuenta ni un servidor.

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

## 🚀 Instalación y uso local

**Requisitos:** Node.js 18+

```bash
# Clonar el repositorio
git clone https://github.com/vicentemrk/AmList.git
cd AmList

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

```bash
# Compilar para producción
npm run build

# Ejecutar tests
npm run test
```

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

## 🗂️ Estructura del proyecto

```
src/
├── domain/          # Lógica pura de negocio (sin React, sin fetch, sin localStorage)
│   ├── itemSchema.js
│   ├── validators.js
│   └── historial.js
├── data/            # Acceso a efectos secundarios (API, localStorage)
│   ├── apiClient.js
│   ├── itemsRepository.js
│   ├── historyRepository.js
│   ├── themeRepository.js
│   └── malImporter.js
└── presentation/    # React: componentes, hooks y páginas
    ├── App.jsx
    ├── hooks/
    ├── components/
    └── pages/
```

La arquitectura sigue los principios de **Clean Architecture**: `presentation` → `data` → `domain`. La capa de dominio no depende de nada externo.

---

## 🔮 Próximas funciones (roadmap)

Las siguientes funciones están planificadas para versiones futuras:

- **Vista de detalle** — Panel expansible al hacer clic en la portada (sinopsis completa, tráiler, etc.)
- **Filtro por tags** — Filtrar tu lista usando tus propias etiquetas
- **Múltiples listas** — Crear y gestionar varias listas personalizadas
- **Dashboard de estadísticas** — Horas vistas, géneros favoritos, progreso general
- **Sincronización en la nube** — Opcional, mediante Supabase (manteniendo modo offline)
- **Importar desde AniList / Kitsu** — Además del XML de MyAnimeList ya disponible

---

## 📄 Documentación

| Documento | Descripción |
|---|---|
| [`docs/PLAN_MAESTRO.md`](docs/PLAN_MAESTRO.md) | Arquitectura, modelo de datos y estado del proyecto |
| [`docs/QA_CRITERIOS.md`](docs/QA_CRITERIOS.md) | Trazabilidad técnica y checklist de QA |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Funciones futuras y decisiones de arquitectura |

---

## 📝 Licencia

MIT © [vicentemrk](https://github.com/vicentemrk)
