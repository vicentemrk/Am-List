/**
 * domain/itemSchema.js
 * Pure constants — no React, no fetch, no localStorage.
 * Defines the shape every item must conform to.
 */

/** @typedef {'anime'|'manga'} MediaType */
/** @typedef {'por_ver'|'en_curso'|'completado'|'dropeado'} EstadoUsuario */
/** @typedef {'airing'|'complete'|'upcoming'|'unknown'} EstadoEmision */

export const MEDIA_TYPES = /** @type {const} */ (['anime', 'manga']);

/** All 8 navigable section keys */
export const SECCIONES = /** @type {const} */ ([
  'all',
  'completado',
  'por_ver',
  'favorito',
  'en_curso',
  'en_emision',
  'finalizado',
  'pausado',
  'dropeado',
]);

/** Human-readable labels for each section (full, used in aria-label) */
export const SECCION_LABELS = {
  all:        'Lista completa',
  completado: 'Completados',
  por_ver:    'Por ver / Por mirar',
  favorito:   'Favoritos',
  en_curso:   'En curso / Mirando',
  en_emision: 'En emisión',
  finalizado: 'Finalizados',
  pausado:    'Pausados',
  dropeado:   'Dropeados / Abandonados',
};

/** Short labels for visual display in tabs */
export const SECCION_LABELS_SHORT = {
  all:        'Todo',
  completado: 'Completados',
  por_ver:    'Por ver',
  favorito:   'Favoritos',
  en_curso:   'En curso',
  en_emision: 'En emisión',
  finalizado: 'Finalizados',
  pausado:    'Pausados',
  dropeado:   'Dropeados',
};

/**
 * Default shape for a new item.
 * All fields are always present to avoid undefined checks downstream.
 */
export const DEFAULT_ITEM = {
  id:            '',
  malId:         0,
  mediaType:     'anime',
  titulo:        '',
  imagen:        '',
  sinopsis:      '',
  genres:        [],
  puntuacion:    null,
  favorito:      false,
  estadoUsuario: 'por_ver',
  estadoEmision: 'unknown',
  progreso: {
    actual: 0,
    maximo: null,
  },
  tags:          [],
  descripcionPersonal: '',
  ordenManual:   0,
  creadoEn:      '',
  actualizadoEn: '',
};

/** Valid user status options */
export const ESTADOS_USUARIO = [
  { value: 'por_ver',    label: 'Por ver'   },
  { value: 'en_curso',   label: 'En curso'  },
  { value: 'pausado',    label: 'Pausado'   },
  { value: 'completado', label: 'Completado'},
  { value: 'finalizado', label: 'Finalizado'},
  { value: 'dropeado',   label: 'Dropeado'  },
];

/** Score range for the 1-10 selector */
export const SCORE_RANGE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
