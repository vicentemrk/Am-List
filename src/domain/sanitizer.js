/**
 * ============================================================================
 * MÓDULO: domain/sanitizer.js
 * ============================================================================
 * Qué hace:
 *   Provee la función pura `sanitizeText()` para limpiar strings de entrada,
 *   eliminando tags HTML (incluyendo vectores XSS) y normalizando espacios.
 * Cómo lo hace:
 *   Sin dependencias externas. Opera únicamente sobre strings nativos de JS.
 *   Reutilizable desde cualquier capa (data/importers, domain/validators, etc.)
 * ============================================================================
 */

/**
 * Sanitiza un string eliminando todos los tags HTML, normalizando espacios
 * y aplicando un límite de longitud máximo.
 *
 * @param {*}      str                       - Valor a sanitizar.
 * @param {object} [opts]                    - Opciones de sanitización.
 * @param {number} [opts.maxLength=500]      - Longitud máxima del resultado.
 * @param {boolean}[opts.collapseSpaces=true]- Si es true, colapsa espacios múltiples en uno.
 * @returns {string} String limpio y seguro.
 */
export function sanitizeText(str, { maxLength = 500, collapseSpaces = true } = {}) {
  if (typeof str !== 'string') return '';

  let result = str
    // 1. Eliminar etiquetas <script>...</script> (vector XSS más común)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // 2. Eliminar TODOS los demás tags HTML (<b>, <img>, <svg>, <iframe>, etc.)
    .replace(/<[^>]+>/g, '')
    // 3. Trim de extremos
    .trim();

  // 4. Colapsar espacios múltiples internos en uno solo
  if (collapseSpaces) {
    result = result.replace(/\s+/g, ' ').trim();
  }

  // 5. Aplicar límite de longitud
  return result.slice(0, maxLength);
}
