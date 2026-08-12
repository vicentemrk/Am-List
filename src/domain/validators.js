/**
 * ============================================================================
 * MÓDULO: domain/validators.js
 * ============================================================================
 * Qué hace:
 *   Contiene las funciones puras de lógica de negocio para validar el progreso
 *   de episodios/capítulos, la puntuación asignada y el filtrado por secciones.
 * Cómo lo hace:
 *   Sin ninguna importación externa ni efectos secundarios. Recibe datos nativos
 *   y devuelve objetos de resultado `{ valid: boolean, message: string }` o
 *   listas de ítems filtradas.
 * ============================================================================
 */

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
      return result.filter((item) => item.favorito === true);

    case 'en_curso':
      return result.filter((item) => item.estadoUsuario === 'en_curso');

    case 'en_emision':
      // EXCEPCIÓN Única a la Regla 6: filtra por estadoEmision (dato de la API).
      // El usuario no elige este estado; refleja si la serie sigue en emisción en el mundo real.
      return result.filter((item) => item.estadoEmision === 'airing');

    case 'pausado':
      return result.filter((item) => item.estadoUsuario === 'pausado');

    case 'finalizado':
      // Regla 6 (v1.1): filtra por estadoUsuario='finalizado', NO por estadoEmision='complete'.
      // 'Finalizado' = el usuario marcó este ítem como finalizado en su lista personal.
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

