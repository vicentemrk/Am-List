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
 * @typedef {'agregado'|'actualizado'|'eliminado'|'puntuado'|'favorito'|'progreso'} AccionHistorial - Tipos de acciones registrables
 */

/**
 * Construye un objeto de entrada para la bitácora de historial.
 * 
 * Qué hace:
 *   Genera un registro único con marca de tiempo e información descriptiva del cambio realizado.
 * Cómo lo hace:
 *   Asigna un ID aleatorio `h_timestamp_rand`, copia el título y medio, y congela una copia
 *   superficial (`snapshot`) del ítem en ese momento.
 * 
 * @param {object} item - Objeto del ítem sobre el cual se realizó la acción.
 * @param {AccionHistorial} accion - Nombre de la acción ejecutada.
 * @param {string} [timestamp] - Fecha en formato ISO 8601; por defecto la hora actual.
 * @returns {{
 *   id: string,
 *   itemId: string,
 *   titulo: string,
 *   mediaType: string,
 *   accion: AccionHistorial,
 *   timestamp: string,
 *   snapshot: object
 * }} Objeto formateado de historial.
 */
export function construirEntradaHistorial(item, accion, timestamp) {
  return {
    id:        `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    itemId:    item.id,
    titulo:    item.titulo,
    mediaType: item.mediaType,
    accion,
    timestamp: timestamp ?? new Date().toISOString(),
    snapshot:  { ...item }, // Copia superficial para congelar el estado en el momento de la acción
  };
}

/** Etiquetas descriptivas en español para cada tipo de acción del historial */
export const ACCION_LABELS = {
  agregado:    'Agregado',
  actualizado: 'Actualizado',
  eliminado:   'Eliminado',
  puntuado:    'Puntuado',
  favorito:    'Favorito cambiado',
  progreso:    'Progreso actualizado',
};

