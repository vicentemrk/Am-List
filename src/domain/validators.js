/**
 * ============================================================================
 * MÓDULO: domain/validators.js
 * ============================================================================
 * Qué hace:
 *   Contiene las funciones puras de lógica de negocio para validar el progreso
 *   de episodios/capítulos, la puntuación asignada, el estado de usuario y
 *   el filtrado por secciones y rango de puntuación.
 * Cómo lo hace:
 *   Sin ninguna importación externa ni efectos secundarios. Recibe datos nativos
 *   y devuelve objetos de resultado `{ valid: boolean, message: string }` o
 *   listas de ítems filtradas.
 * ============================================================================
 */

import { esEstadoUsuarioValido } from './itemSchema.js';


/**
 * Valida que el progreso actual de un anime/manga no supere el máximo conocido.
 * 
 * Qué hace:
 *   Garantiza que el número de episodios vistos no sea un número negativo ni supere
 *   el límite máximo conocido de la serie (Regla 2 del Negocio).
 * Cómo lo hace:
 *   Convierte las entradas a números y compara `actual` contra `maximo`. Si `maximo`
 *   es `null`, la serie se considera ilimitada (como series en emisión continua).
 * 
 * @param {number} actual - Episodios o capítulos vistos actualmente.
 * @param {number|null} maximo - Total de episodios/capítulos máximos de la serie.
 * @returns {{ valid: boolean, message: string }} Objeto con estado de validación y mensaje de error si aplica.
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
 * Filtra una colección de ítems según la sección seleccionada y el tipo de medio.
 * 
 * Qué hace:
 *   Retorna únicamente las series o mangas que pertenecen a la pestaña activa en la UI.
 * Cómo lo hace:
 *   Primero filtra opcionalmente por `mediaType` ('anime' o 'manga'). Luego aplica una
 *   evaluación `switch` comparando la propiedad `estadoUsuario` o `favorito`.
 *
 * REGLA 6 (Reformulada en v1.1):
 *   - Todos los tabs filtran EXCLUSIVAMENTE por `estadoUsuario` (lo que el usuario eligió).
 *   - EXCEPCIÓN Única: el tab 'en_emision' filtra por `estadoEmision='airing'` porque
 *     es información de la API, no un estado elegido por el usuario.
 *   - El tab 'finalizado' refleja lo que el usuario marcó, NO lo que dice la API.
 * 
 * @param {import('./itemSchema').DEFAULT_ITEM[]} items - Arreglo de ítems a filtrar.
 * @param {import('./itemSchema').SECCIONES[number]} seccion - Clave de la sección activa (ej: 'favorito', 'en_curso').
 * @param {'anime'|'manga'|'all'} [mediaType] - Tipo de contenido opcional.
 * @returns {import('./itemSchema').DEFAULT_ITEM[]} Arreglo filtrado con los ítems correspondientes.
 */
export function filtrarPorSeccion(items, seccion, mediaType) {
  let result = items;

  // Pre-filtrado opcional por tipo de medio cuando estamos en la página dedicada de Anime o Manga
  if (mediaType && mediaType !== 'all') {
    result = result.filter((item) => item.mediaType === mediaType);
  }

  switch (seccion) {
    case 'all':
      return result;

    case 'por_ver':
      return result.filter((item) => item.estadoUsuario === 'por_ver');

    case 'favorito':
      // v1.3+: filtra por estadoUsuario='favorito' (ya no por el campo boolean item.favorito)
      return result.filter((item) => item.estadoUsuario === 'favorito');

    case 'en_curso':
      return result.filter((item) => item.estadoUsuario === 'en_curso');

    case 'en_emision':
      // v1.3+: 'en_emision' es ahora un estadoUsuario elegido por el usuario.
      // Se ignora por completo el campo estadoEmision de la API.
      return result.filter((item) => item.estadoUsuario === 'en_emision');

    case 'pausado':
      return result.filter((item) => item.estadoUsuario === 'pausado');

    case 'finalizado':
      return result.filter((item) => item.estadoUsuario === 'finalizado');

    case 'dropeado':
      return result.filter((item) => item.estadoUsuario === 'dropeado');

    default:
      return result;
  }
}

/**
 * Valida la calificación personal otorgada por el usuario.
 * 
 * Qué hace:
 *   Comprueba que la nota asignada esté dentro del rango permitido (1 a 10).
 * Cómo lo hace:
 *   Permite valores nulos (la nota es opcional). Si existe un valor, verifica
 *   que sea un número entero o decimal finito entre 1 y 10.
 * 
 * @param {number|null} puntuacion - Nota ingresada por el usuario.
 * @returns {{ valid: boolean, message: string }} Objeto de validación.
 */
export function validarPuntuacion(puntuacion) {
  if (puntuacion === null || puntuacion === undefined) {
    return { valid: true, message: '' }; // Campo opcional
  }
  const p = Number(puntuacion);
  if (!Number.isFinite(p) || p < 1 || p > 10) {
    return { valid: false, message: 'La puntuación debe estar entre 1 y 10.' };
  }
  return { valid: true, message: '' };
}

/**
 * Valida que el estadoUsuario sea un valor del enum permitido.
 *
 * Qué hace:
 *   Rechaza cualquier valor fuera de los estados definidos en `VALID_ESTADOS_USUARIO`.
 *   Esto incluye el estado obsoleto 'completado' que fue eliminado en v1.2.
 *
 * @param {string} estado - Valor de estadoUsuario a validar.
 * @returns {{ valid: boolean, message: string }} Objeto de validación.
 */
export function validarEstadoUsuario(estado) {
  if (!esEstadoUsuarioValido(estado)) {
    return {
      valid: false,
      message: `Estado de usuario inválido: "${estado}". Los valores permitidos son: por_ver, en_emision, en_curso, favorito, finalizado, pausado, dropeado.`,
    };
  }
  return { valid: true, message: '' };
}

/**
 * Filtra una colección de ítems por rango de puntuación personal.
 *
 * Qué hace:
 *   Retorna únicamente los ítems cuya puntuación personal (la que pone el usuario)
 *   esté dentro del rango [min, max] especificado.
 *
 * Cómo lo hace:
 *   - Si el rango es [1, 10], el filtro está INACTIVO y devuelve todos los ítems
 *     sin modificar (incluyendo los que tienen `puntuacion=null`).
 *   - Con cualquier rango parcial, los ítems con `puntuacion=null` se excluyen
 *     porque el usuario está buscando explícitamente ítems con puntuación en ese rango.
 *
 * @param {import('./itemSchema').DEFAULT_ITEM[]} items - Arreglo de ítems a filtrar.
 * @param {number} min - Puntuación mínima (1-10).
 * @param {number} max - Puntuación máxima (1-10).
 * @returns {import('./itemSchema').DEFAULT_ITEM[]} Arreglo filtrado.
 */
export function filtrarPorRangoPuntuacion(items, min, max) {
  if (min === 1 && max === 10) return items; // Filtro inactivo — rango completo
  return items.filter((item) => {
    if (item.puntuacion === null || item.puntuacion === undefined) return false;
    return item.puntuacion >= min && item.puntuacion <= max;
  });
}
