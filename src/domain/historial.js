/**
 * ============================================================================
 * MÓDULO: domain/historial.js
 * ============================================================================
 * Qué hace:
 *   Construye las entradas del historial de eventos cuando un ítem es creado,
 *   modificado, calificado o eliminado.
 * Cómo lo hace:
 *   Crea objetos planos inmutables que congelan una fotografía (snapshot) del
 *   estado del anime/manga en el instante exacto en que ocurrió la acción.
 * ============================================================================
 */

/**
 * @typedef {'agregado'|'actualizado'|'eliminado'|'puntuado'|'favorito'|'progreso'|'estado_cambiado'|'etiquetado'|'nota_personal'} AccionHistorial - Tipos de acciones registrables
 */

/**
 * Construye un objeto de entrada para la bitácora de historial.
 * 
 * @param {object} item - Objeto del ítem sobre el cual se realizó la acción.
 * @param {AccionHistorial} accion - Nombre de la acción ejecutada.
 * @param {string} [detalles] - Texto descriptivo del cambio específico.
 * @param {string} [timestamp] - Fecha en formato ISO 8601; por defecto la hora actual.
 * @returns {object} Objeto formateado de historial.
 */
export function construirEntradaHistorial(item, accion, detalles = '', timestamp) {
  return {
    id:        `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    itemId:    item.id,
    titulo:    item.titulo,
    mediaType: item.mediaType,
    accion,
    detalles,
    timestamp: timestamp ?? new Date().toISOString(),
    snapshot:  { ...item },
  };
}

/** Etiquetas descriptivas en español para cada tipo de acción del historial */
export const ACCION_LABELS = {
  agregado:        'Agregado',
  actualizado:     'Actualizado',
  eliminado:       'Eliminado',
  puntuado:        'Calificación',
  favorito:        'Favorito',
  progreso:        'Progreso',
  estado_cambiado: 'Estado cambiado',
  etiquetado:      'Etiquetas',
  nota_personal:   'Nota personal',
};

