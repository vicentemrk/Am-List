# AMlist

> Tu lista personal de anime, manga, manhwa y manhua.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?style=flat&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-black?style=flat&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Radix UI](https://img.shields.io/badge/Radix_UI-Primitives-161618?style=flat&logo=radix-ui&logoColor=white)](https://www.radix-ui.com/)
[![Lucide](https://img.shields.io/badge/Lucide-Icons-F56565?style=flat)](https://lucide.dev/)
[![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-green?style=flat)](LICENSE)

---

## ¿Qué es AMlist?

AMlist es una **Single Page Application (SPA) local-first** para gestionar tus listas personales de anime, manga, manhwa y manhua. Busca títulos usando las APIs de **AniList**, **MangaDex** y **Kitsu**, registra tu progreso, puntúa, marca favoritos y organiza todo en secciones — sin necesitar una cuenta ni un servidor (por ahora).

Todo se guarda directamente en tu navegador (`localStorage`). No hay telemetría, no hay rastreo.

---

## Funciones actuales

- 🔍 **Búsqueda multi-API** — AniList → MangaDex → Kitsu (triple fallback automático)
- 📋 **8 secciones** — Todo, Por ver, En emisión, En curso, Favoritos, Finalizados, Pausados y Dropeados
- ⭐ **Doble puntuación** — Score de la comunidad (dorado) y tu puntuación personal (morado)
- 📈 **Control de progreso** — Episodios o capítulos con validación automática (no puede superar el máximo)
- 🏷️ **Multi-tags** — Hasta 5 etiquetas personales por ítem
- 📝 **Descripción personal** — Notas propias sobre cada anime o manga
- 📋 **Cambio rápido de estado** — Dropdown con ícono ClipboardList directamente desde la tarjeta
- 🔃 **Ordenamiento** — Por fecha, título, puntuación, progreso o arrastrar manualmente (drag & drop)
- 📤 **Exportar / Importar** — Exporta tu lista a JSON e importa desde MyAnimeList XML
- 📖 **Historial** — Registro cronológico de todos tus cambios (máx. 500 entradas)
- 🔎 **Vista de Detalle** — Modal expandido con sinopsis completa, géneros y datos de la API
- 🌙 **Tema claro / oscuro** — Diseño Material Design 3 (sin blancos ni negros puros)
- 📱 **Mobile First** — FAB flotante, drag-to-scroll en tabs, usable desde 360px

---

## Stack técnico

### Frontend

| Herramienta | Versión | Uso |
|---|---|---|
| [React](https://react.dev/) | 19 | UI declarativa y gestión de estado |
| [Vite](https://vitejs.dev/) | 8 | Bundler y servidor de desarrollo ultrarrápido |
| [Framer Motion](https://www.framer.com/motion/) | 12 | Animaciones de layout (tabs indicador deslizante) |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Utilidades CSS base (custom properties MD3 encima) |
| [Lucide React](https://lucide.dev/) | 1.x | Sistema de íconos SVG (ClipboardList, Star, Trash2, etc.) |
| Vanilla CSS + Custom Properties | — | Design System propio (tokens MD3, glassmorphism, dark/light) |
| [Google Fonts — Inter](https://fonts.google.com/specimen/Inter) | — | Tipografía principal |

### Componentes UI (Radix Primitives)

| Paquete | Uso |
|---|---|
| `@radix-ui/react-dialog` | Modales accesibles (AddModal, EditModal, DetailModal, HistorialModal) |
| `@radix-ui/react-select` | Select accesible con teclado (CustomSelect / Ordenar por) |
| `@radix-ui/react-tabs` | Tabs accesibles (base del SectionTabs) |
| `@radix-ui/react-visually-hidden` | Texto oculto para lectores de pantalla |

### Utilidades

| Paquete | Uso |
|---|---|
| `clsx` | Construcción condicional de className |
| `tailwind-merge` | Merge seguro de clases Tailwind sin conflictos |

### Testing & Calidad

| Herramienta | Uso |
|---|---|
| [Vitest](https://vitest.dev/) | Suite de tests unitarios (27 tests pasando) |
| [oxlint](https://oxc.rs/docs/guide/usage/linter.html) | Linter ultrarrápido (Rust) en reemplazo de ESLint |

### APIs externas

| API | Protocolo | Uso |
|---|---|---|
| [AniList](https://anilist.gitbook.io/anilist-apiv2-docs/) | GraphQL | Fuente primaria: anime y manga |
| [MangaDex](https://api.mangadex.org/docs/) | REST | Manga, manhwa y manhua coreano/chino |
| [Kitsu](https://kitsu.docs.apiary.io/) | REST JSON:API | Fallback secundario |

---

## Arquitectura

AMlist usa **Arquitectura Hexagonal (Ports & Adapters)**:

```
presentation/  ← React, hooks, componentes (nunca toca storage directamente)
     ↓
data/          ← Adaptadores (localStorage hoy, Supabase en v2.0)
     ↓
domain/        ← Reglas puras de negocio (sin React, sin fetch, sin storage)
  └─ ports/    ← Contratos/interfaces que los adaptadores deben cumplir
```

Esta separación permite migrar de `localStorage` a Supabase en v2.0 **sin tocar la UI**.

---

## Licencia

MIT © [vicentemrk](https://github.com/vicentemrk)
