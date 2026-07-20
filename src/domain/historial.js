/**
 * domain/historial.js
 * Pure function to build a history entry — no React, fetch or localStorage.
 */

/**
 * @typedef {'agregado'|'actualizado'|'eliminado'|'puntuado'|'favorito'|'progreso'} AccionHistorial
 */

/**
 * Builds a plain-object history entry describing what happened to an item.
 * @param {object} item           The item snapshot at the time of the action
 * @param {AccionHistorial} accion  What happened
 * @param {string} [timestamp]    ISO 8601 string; defaults to Date.now()
 * @returns {{
 *   id: string,
 *   itemId: string,
 *   titulo: string,
 *   mediaType: string,
 *   accion: AccionHistorial,
 *   timestamp: string,
 *   snapshot: object
 * }}
 */
export function construirEntradaHistorial(item, accion, timestamp) {
  return {
    id:        `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    itemId:    item.id,
    titulo:    item.titulo,
    mediaType: item.mediaType,
    accion,
    timestamp: timestamp ?? new Date().toISOString(),
    snapshot:  { ...item }, // shallow copy to freeze the state at action time
  };
}

/** Human-readable labels for each history action */
export const ACCION_LABELS = {
  agregado:    'Agregado',
  actualizado: 'Actualizado',
  eliminado:   'Eliminado',
  puntuado:    'Puntuado',
  favorito:    'Favorito cambiado',
  progreso:    'Progreso actualizado',
};
