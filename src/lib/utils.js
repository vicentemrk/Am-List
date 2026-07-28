/**
 * ============================================================================
 * UTILIDAD DE ESTILOS: lib/utils.js
 * ============================================================================
 * Qué hace:
 *   Proporciona la función `cn(...)` para combinar y fusionar clases de CSS y
 *   Tailwind CSS de manera inteligente sin conflictos de especificidad.
 * 
 * Cómo funciona:
 *   Utiliza `clsx` para evaluar expresiones condicionales (ej: `isTrue && 'bg-red-500'`)
 *   y pasa el resultado a `tailwindMerge` de `tailwind-merge` para resolver
 *   sobreescrituras de clases en componentes reutilizables de Shadcn y Aceternity UI.
 * ============================================================================
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Fusiona arreglos de clases CSS evitando duplicados y conflictos de especificidad de Tailwind.
 * 
 * @param  {...(string|boolean|null|undefined|object)} inputs - Nombres o expresiones de clases.
 * @returns {string} Cuerda de clases CSS optimizada.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
