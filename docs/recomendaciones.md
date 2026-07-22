# Recomendaciones de Mejora e Implementación — AMlist
> Diagnóstico y sugerencias en palabras simples y concisas utilizando los principios de las skills de Testing, Arquitectura, Seguridad y Frontend.
> Última actualización: 2026-07-22

---

## 1. 🧪 Pruebas Automatizadas (Testing)

* **Agregar Pruebas E2E (Playwright)**: Actualmente solo existen 9 pruebas unitarias de datos. Conviene agregar pruebas de navegación real (agregar ítem, cambiar de estado, editar puntuación y cambiar de tema) para asegurar que la app funcione siempre bien en el navegador.
* **Probar los Hooks de React**: Crear pruebas para `useItems.js` y `useSearch.js` para garantizado que la lógica de filtrado y guardado en `localStorage` nunca falle.
* **Medir Cobertura de Código**: Configurar un comando `npm run test:coverage` en Vitest para saber con precisión qué partes del código faltan por probar.

---

## 2. 🏗️ Arquitectura y Estructura (Architecture)

* **Unificar Páginas Duplicadas**: `AnimeListPage.jsx` y `MangaListPage.jsx` son casi idénticas. Se recomienda fusionarlas en un componente genérico `ItemListPage.jsx` pasando la propiedad `media="anime"` o `media="manga"`. Esto reducirá el código a la mitad.
* **Registrar Decisiones (ADRs)**: Crear documentos simples (ADRs) en `docs/adr/` que expliquen por qué se tomó cada decisión importante (por ejemplo, el uso de Local-First y el triple fallback de APIs).

---

## 3. 🛡️ Seguridad y Resiliencia (Security)

* **Control de Peticiones en APIs (Rate Limiting)**: Agregar un pequeño freno de mano (debounce o cola) a las búsquedas de AniList/MangaDex para no saturar las APIs si el usuario escribe muy rápido.
* **Validación Estricta al Importar**: Al cargar archivos de respaldo (XML de MyAnimeList o JSON de AMlist), sanitizar y validar todos los textos antes de guardarlos en el navegador.

---

## 4. ⚛️ Interfaz y Rendimiento (Frontend & React)

* **Evitar Renderizados Innecesarios**: Usar `React.memo` o `useCallback` en `ItemCard` para que cuando edites un solo anime, no se vuelvan a dibujar los 50 animes de la pantalla.
* **Accesibilidad y Tamaño de Botones en Móviles**: Asegurar que todos los botones e íconos en pantallas pequeñas tengan una zona táctil mínima de 44x44 píxeles para que sean fáciles de presionar con el pulgar.
* **Limpieza Continua de Código**: Mantener la disciplina de ejecutar `npm run lint` antes de cada entrega para asegurar 0 advertencias y 0 código muerto.
