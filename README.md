# AMlist

> Tu gestor personal, gratuito y 100% privado de anime, manga, manhwa y manhua.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-57_Tests_Pass-6E9F18?style=flat&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-Visual_Regression-2EAD33?style=flat&logo=playwright&logoColor=white)](https://playwright.dev/)
[![Radix UI](https://img.shields.io/badge/Radix_UI-Primitives-161618?style=flat&logo=radix-ui&logoColor=white)](https://www.radix-ui.com/)
[![Pure Vanilla CSS](https://img.shields.io/badge/CSS-Vanilla_Custom_Properties-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)
[![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-green?style=flat)](LICENSE)

---

## ¿Qué es AMlist?

**AMlist** es una **Single Page Application (SPA) local-first** para organizar tus listas personales de anime, manga, manhwa y manhua en español. Busca títulos utilizando las APIs de **AniList**, **MangaDex** y **Kitsu** con un sistema de fallback automático, registra tu progreso, asigna puntuaciones personales, gestiona etiquetas y personaliza tu experiencia con filtros de rango y densidades de vista.

Funciona directamente en tu navegador (`localStorage`), sin servidor obligatorio, sin cuentas requeridas, 100% offline y totalmente privado.

---

## Características principales

- 🔍 **Búsqueda multi-API inteligente** — AniList GraphQL (primario) → MangaDex REST (manhwas/manhuas) → Kitsu REST (respaldo) con freno de mano (debounce 300ms + AbortController).
- 📋 **Secciones de estado** — Todo, Por ver, En emisión, En curso, Favoritos, Finalizados, Pausados y Dropeados.
- 🎨 **Densidad de vista configurable** — Alterna entre vista detallada completa y vista compacta de 56px para navegar listas extensas con agilidad.
- ⭐ **Filtro por Rango de Puntuación (1-10)** — Slider dual basado en Radix UI Slider para filtrar por tu puntuación personal.
- 🏷️ **Multi-etiquetas y filtrado** — Asigna hasta 5 etiquetas personalizadas por ítem y filtra en combinación con la barra de búsqueda.
- 📈 **Control de progreso estricto** — Validación automática en la capa de dominio (el progreso no puede superar el máximo conocido de la serie).
- 🔒 **Seguridad OWASP** — Meta tag Content-Security-Policy estricto, sanitización XSS de textos y enum validado para estados antes de la persistencia.
- 📤 **Exportación e Importación** — Respalda tu lista en JSON e importa datos desde MyAnimeList XML, AniList, Kitsu o copias JSON previas.
- 📖 **Historial de actividades** — Registro cronológico con las últimas 500 acciones (cambios de estado, progreso, notas y favoritos).
- 📸 **Pruebas de Regresión Visual** — Suite Playwright E2E con 10 snapshots deterministas en tema claro y oscuro.
- 🌙 **Tema claro y oscuro** — Paleta basada en Material Design 3 (Lavanda `#5A35D4` + Menta `#1D9E8B`) con alto contraste verificada WCAG AA.

---

## Stack técnico

### Frontend

| Herramienta | Versión | Uso |
|---|---|---|
| [React](https://react.dev/) | 19 | Interfaz declarativa y gestión de estado reactivo |
| [Vite](https://vitejs.dev/) | 8 | Servidor de desarrollo y empaquetador ultrarrápido |
| [Framer Motion](https://www.framer.com/motion/) | 12 | Transiciones y animaciones de componentes |
| Pure Vanilla CSS | — | Sistema de diseño basado en Custom Properties HSL, glassmorphism y modo oscuro |
| [Lucide React](https://lucide.dev/) | 1.x | Iconografía SVG vectorial |
| [Google Fonts — Inter](https://fonts.google.com/specimen/Inter) | — | Tipografía principal |

### Componentes de UI (Radix UI Primitives)

| Paquete | Uso |
|---|---|
| `@radix-ui/react-slider` | Slider dual accesible para el filtro de puntuación personal (1-10) |
| `@radix-ui/react-dialog` | Modales accesibles (AddModal, EditModal, DetailModal, HistorialModal) |
| `@radix-ui/react-select` | Selector accesible de criterios de ordenamiento (CustomSelect) |
| `@radix-ui/react-tabs` | Pestañas de navegación por secciones (SectionTabs) |
| `@radix-ui/react-visually-hidden` | Accesibilidad para lectores de pantalla |

### Testing & Calidad

| Herramienta | Uso |
|---|---|
| [Vitest](https://vitest.dev/) | Pruebas unitarias de dominio y datos (57/57 tests pasando al 100%) |
| [Playwright](https://playwright.dev/) | Pruebas End-to-End y Regresión Visual (10 snapshots deterministas) |
| [oxlint](https://oxc.rs/docs/guide/usage/linter.html) | Linter ultrarrápido en Rust |

### APIs Externas (Triple Fallback)

| API | Protocolo | Tipo de contenido |
|---|---|---|
| [AniList](https://anilist.gitbook.io/anilist-apiv2-docs/) | GraphQL | Fuente primaria (Anime y Manga) |
| [MangaDex](https://api.mangadex.org/docs/) | REST | Especializada en Manga, Manhwa y Manhua |
| [Kitsu](https://kitsu.docs.apiary.io/) | REST JSON:API | Fallback secundario de respaldo |

---

## Licencia

MIT © [vicentemrk](https://github.com/vicentemrk)

