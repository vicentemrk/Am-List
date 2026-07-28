# ADR-0003: Adopción de Primitivas Radix UI, Tokens MD3 y Animación de Pestañas Estructura B

* **Status**: Accepted
* **Date**: 2026-07-28
* **Authors**: Antigravity Team & vicentemrk

## Context & Problem Statement
El proyecto requería una UI accesible, moderna y sobria sin depender de librerías visuales pesadas con efectos neón/glowing. Además, se necesitaba mejorar la accesibilidad de los modales (focus trap, ARIA, teclado) y reemplazar los controles nativos `<select>` por componentes estilizados e integrados en el sistema de diseño.

## Decision Drivers
* Accesibilidad WAI-ARIA estándar out-of-the-box (teclado, focus trap, aria-modal, portal).
* Estética limpia e icónica alineada con Material Design 3 (MD3) y paleta Arctic Minimal (#D9DAE1).
* Transiciones suaves sin efectos neón ni glowing ambiental.
* Cero deuda técnica o dependencias propietarias innecesarias.

## Considered Options
1. **Modales y Selects Nativos hechos a mano**: Requería código JS complejo para manejar focus trap, portales y accesibilidad.
2. **Librerías completas pesadas (Chakra/MUI)**: Aumentaban drásticamente el tamaño del bundle.
3. **Radix UI Primitives (`@radix-ui/react-dialog`, `@radix-ui/react-select`, `@radix-ui/react-visually-hidden`) + Tokens HSL de MD3 + Framer Motion**: Primitivas sin estilos con control total de CSS custom properties.

## Decision Outcome
Opción elegida: **Opción 3 (Radix UI Primitives + Tokens MD3 + Framer Motion)**.

### Cambios Clave Realizados
* **Modales Radix**: `EditModal` y `DetailModal` utilizan `Dialog.Root`, `Dialog.Portal`, `Dialog.Overlay` y `Dialog.Content` para manejar accesibilidad y scroll-lock.
* **Componente `CustomSelect`**: Selector reutilizable basado en `@radix-ui/react-select` que reemplaza todos los `<select>` nativos del sistema.
* **Estructura B de Pestañas**: Pestañas con indicador inferior animado via `<motion.span layoutId="tab-indicator">` de Framer Motion y colores representativos por estado.
* **Barra de Progreso Lineal MD3**: Barra plana sobria (4px) en la tarjeta (`ItemCard`) que calcula el % completado sin efectos de resplandor.

### Positive Consequences
* Cumplimiento total de WAI-ARIA en navegabilidad por teclado y lectores de pantalla.
* Interfaz sobria, elegante y consistente en Light Mode y Dark Mode.
* Mantención del 100% de la suite de pruebas unitarias y 0 errores de linter.

### Negative Consequences / Trade-offs
* Se incorporaron 42 paquetes pequeños de Radix UI en `node_modules` (desatendibles en bundle final gracias a tree-shaking de Vite).
