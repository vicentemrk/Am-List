/**
 * domain/validators.js
 * Pure business-logic functions — zero imports of React, fetch or localStorage.
 */

/**
 * Validates that progress `actual` does not exceed `maximo`.
 * @param {number} actual  Current progress count (e.g. episodes watched)
 * @param {number|null} maximo  Maximum known count; null means unknown/unlimited
 * @returns {{ valid: boolean, message: string }}
 */
export function validarProgreso(actual, maximo) {
  const a = Number(actual);

  if (!Number.isFinite(a) || a < 0) {
    return { valid: false, message: 'El progreso actual debe ser un número ≥ 0.' };
  }

  if (maximo !== null && maximo !== undefined) {
    const m = Number(maximo);
    if (!Number.isFinite(m) || m < 0) {
      return { valid: false, message: 'El máximo debe ser un número ≥ 0.' };
    }
    if (a > m) {
      return {
        valid: false,
        message: `El progreso actual (${a}) supera el máximo (${m}). Guardado bloqueado.`,
      };
    }
  }

  return { valid: true, message: '' };
}

/**
 * Filters a list of items by the active section key and optionally by media type.
 * @param {import('./itemSchema').DEFAULT_ITEM[]} items
 * @param {import('./itemSchema').SECCIONES[number]} seccion
 * @param {'anime'|'manga'|'all'} [mediaType]
 * @returns {import('./itemSchema').DEFAULT_ITEM[]}
 */
export function filtrarPorSeccion(items, seccion, mediaType) {
  let result = items;

  // Pre-filter by media type when on a dedicated page
  if (mediaType && mediaType !== 'all') {
    result = result.filter((item) => item.mediaType === mediaType);
  }

  switch (seccion) {
    case 'all':
      return result;

    case 'completado':
      return result.filter((item) => item.estadoUsuario === 'completado');

    case 'por_ver':
      return result.filter((item) => item.estadoUsuario === 'por_ver');

    case 'favorito':
      return result.filter((item) => item.favorito === true);

    case 'en_curso':
      return result.filter((item) => item.estadoUsuario === 'en_curso');

    case 'en_emision':
      return result.filter((item) => item.estadoUsuario === 'en_emision' || item.estadoEmision === 'airing');

    case 'pausado':
      return result.filter((item) => item.estadoUsuario === 'pausado');

    case 'finalizado':
      return result.filter((item) => item.estadoUsuario === 'finalizado' || item.estadoEmision === 'complete');

    case 'dropeado':
      return result.filter((item) => item.estadoUsuario === 'dropeado');

    default:
      return result;
  }
}

/**
 * Validates a score value.
 * @param {number|null} puntuacion
 * @returns {{ valid: boolean, message: string }}
 */
export function validarPuntuacion(puntuacion) {
  if (puntuacion === null || puntuacion === undefined) {
    return { valid: true, message: '' }; // optional field
  }
  const p = Number(puntuacion);
  if (!Number.isFinite(p) || p < 1 || p > 10) {
    return { valid: false, message: 'La puntuación debe estar entre 1 y 10.' };
  }
  return { valid: true, message: '' };
}
