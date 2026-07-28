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
/** @typedef {'por_ver'|'en_curso'|'completado'|'dropeado'} EstadoUsuario - Estado asignado por el usuario */
/** @typedef {'airing'|'complete'|'upcoming'|'unknown'} EstadoEmision - Estado de emisión proveniente de la API */

/** Tipos de contenido permitidos */
export const MEDIA_TYPES = /** @type {const} */ (['anime', 'manga']);

/** Lista con las 8 secciones navegables de la aplicación */
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

/** Nombres descriptivos completos para accesibilidad (aria-label) */
export const SECCION_LABELS = {
  all: 'Lista completa',
  completado: 'Completados',
  por_ver: 'Por ver / Por mirar',
  favorito: 'Favoritos',
  en_curso: 'En curso / Mirando',
  en_emision: 'En emisión',
  finalizado: 'Finalizados',
  pausado: 'Pausados',
  dropeado: 'Dropeados / Abandonados',
};

/** Nombres cortos para visualización en las pestañas gráficas */
export const SECCION_LABELS_SHORT = {
  all: 'Todo',
  completado: 'Completados',
  por_ver: 'Por ver',
  favorito: 'Favoritos',
  en_curso: 'En curso',
  en_emision: 'En emisión',
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
  { value: 'por_ver', label: 'Por ver' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'completado', label: 'Completado' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'pausado', label: 'Pausado' },
  { value: 'dropeado', label: 'Dropeado' },
];

/** Opciones de estado de emisión otorgadas por la API externa */
export const ESTADOS_EMISION = [
  { value: 'airing', label: 'En emisión' },
  { value: 'complete', label: 'Finalizado' },
  { value: 'upcoming', label: 'Próximamente' },
  { value: 'unknown', label: 'Desconocido' },
];

/** Rango numérico permitido para la calificación personal (1 al 10) */
export const SCORE_RANGE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

