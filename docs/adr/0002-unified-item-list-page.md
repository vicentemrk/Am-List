# ADR-0002: Consolidación de Páginas en Componente Genérico ItemListPage

* **Estado**: Aceptado
* **Fecha**: 2026-07-22
* **Autores**: Equipo AMlist

## Contexto y Problema
Las páginas `AnimeListPage.jsx` y `MangaListPage.jsx` compartían más del 90% de su estructura (pestañas, barra de búsqueda local, filtrado de tags, ordenamiento y modales), duplicando innecesariamente la mantenibilidad del proyecto.

## Decisión
Crear un componente unificado `ItemListPage.jsx` que acepta la propiedad `media` (`'anime'` o `'manga'`). `AnimeListPage` y `MangaListPage` se convierten en wrappers delgados.

## Consecuencias
### Positivas
* Eliminación de ~240 líneas de código duplicado.
* Las futuras mejoras en filtros o UI benefician a ambas vistas inmediatamente.
