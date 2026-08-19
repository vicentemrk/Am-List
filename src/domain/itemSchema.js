/**
 * ============================================================================
 * MÓDULO: domain/itemSchema.js
 * ============================================================================
 * Qué hace:
 *   Define los esquemas, tipos y constantes puras del dominio para los ítems
 *   (animes y mangas) de AMlist.
 * Cómo lo hace:
 *   Utiliza objetos y arrays de JavaScript inmutables sin ninguna dependencia
 *   de React, manipulaciones del DOM ni llamadas a la red. Garantiza la
 *   consistencia estructural de los datos en toda la aplicación.
 * ============================================================================
 */

/** @typedef {'anime'|'manga'} MediaType - Tipos de medios soportados */
/** @typedef {'por_ver'|'en_curso'|'finalizado'|'pausado'|'dropeado'} EstadoUsuario - Estado asignado por el usuario */

/** @typedef {'airing'|'complete'|'upcoming'|'unknown'} EstadoEmision - Estado de emisión proveniente de la API */

/** Tipos de contenido permitidos */
export const MEDIA_TYPES = /** @type {const} */ (['anime', 'manga']);

/**
 * Lista con las secciones navegables de la aplicación.
 * REGLA: Los tabs se filtran por estadoUsuario excepto 'en_emision' (única excepción
 * que filtra por estadoEmision='airing'). Ver Regla 6 en business_logic.txt.
 * NOTA: 'completado' fue eliminado completamente del sistema en v1.2.
 * La migración automática ocurre en `itemsLocalStorageAdapter.readAll()`.
 */
export const SECCIONES = /** @type {const} */ ([
  'all',
  'por_ver',
  'en_emision',
  'en_curso',
  'favorito',
  'finalizado',
  'pausado',
  'dropeado',
]);

/**
 * NOTA v1.3+: 'favorito' y 'en_emision' son ahora estadoUsuario válidos.
 * - 'favorito': el tab Favoritos filtra por estadoUsuario='favorito'.
 * - 'en_emision': el tab En emisión filtra por estadoUsuario='en_emision' (ya no por estadoEmision API).
 */

/** Nombres descriptivos completos para accesibilidad (aria-label) */
export const SECCION_LABELS = {
  all: 'Lista completa',
  por_ver: 'Por ver / Por mirar',
  en_emision: 'En emisión',
  en_curso: 'En curso / Mirando',
  favorito: 'Favoritos',
  finalizado: 'Finalizados',
  pausado: 'Pausados',
  dropeado: 'Dropeados / Abandonados',
};

/** Nombres cortos para visualización en las pestañas gráficas */
export const SECCION_LABELS_SHORT = {
  all: 'Todo',
  por_ver: 'Por ver',
  en_emision: 'En emisión',
  en_curso: 'En curso',
  favorito: 'Favoritos',
  finalizado: 'Finalizados',
  pausado: 'Pausados',
  dropeado: 'Dropeados',
};

/**
 * Plantilla por defecto para un nuevo ítem.
 * Todos los campos están inicializados para prevenir errores de 'undefined'.
 */
export const DEFAULT_ITEM = {
  id: '',
  malId: 0,
  mediaType: 'anime',
  titulo: '',
  imagen: '',
  sinopsis: '',
  genres: [],
  puntuacion: null,
  favorito: false,
  estadoUsuario: 'por_ver',
  /** Guarda el estadoUsuario previo al marcar como favorito, para poder restaurarlo al desmarcar. */
  estadoAnterior: '',
  estadoEmision: 'unknown',
  progreso: {
    actual: 0,
    maximo: null,
  },
  tags: [],
  descripcionPersonal: '',
  ordenManual: 0,
  creadoEn: '',
  actualizadoEn: '',
};

/** Opciones válidas de estado elegidas por el usuario */
export const ESTADOS_USUARIO = [
  { value: 'por_ver',    label: 'Por ver' },
  { value: 'en_emision', label: 'En emisión' },
  { value: 'en_curso',   label: 'En curso' },
  { value: 'favorito',   label: 'Favorito' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'pausado',    label: 'Pausado' },
  { value: 'dropeado',   label: 'Dropeado' },
];

/**
 * Set de valores válidos de estadoUsuario derivado de ESTADOS_USUARIO.
 * Fuente única de verdad — no requiere sincronización manual.
 * OWASP v1.3: valida cualquier estado antes de persistir.
 */
export const VALID_ESTADOS_USUARIO = new Set(ESTADOS_USUARIO.map((e) => e.value));

/**
 * Comprueba si un valor es un estadoUsuario válido.
 * @param {string} estado
 * @returns {boolean}
 */
export function esEstadoUsuarioValido(estado) {
  return VALID_ESTADOS_USUARIO.has(estado);
}

/**
 * Devuelve el label legible del estadoUsuario.
 * @param {string} estado
 * @returns {string}
 */
export function getEstadoUsuarioLabel(estado) {
  return ESTADOS_USUARIO.find((e) => e.value === estado)?.label ?? estado;
}


/** Opciones de estado de emisión otorgadas por la API externa */
export const ESTADOS_EMISION = [
  { value: 'airing', label: 'En emisión' },
  { value: 'complete', label: 'Finalizado' },
  { value: 'upcoming', label: 'Próximamente' },
  { value: 'unknown', label: 'Desconocido' },
];

/** Rango numérico permitido para la calificación personal (1 al 10) */
export const SCORE_RANGE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

