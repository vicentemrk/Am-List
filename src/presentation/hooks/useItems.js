/**
 * ============================================================================
 * MÓDULO: presentation/hooks/useItems.js
 * ============================================================================
 * Qué hace:
 *   Custom Hook que actúa como fuente de verdad del estado de la lista de ítems
 *   para la interfaz de usuario en React.
 * Cómo lo hace:
 *   Conecta los eventos de la pantalla (UI) con los adaptadores de datos (`itemsRepository`
 *   e `historyRepository`) y las reglas de dominio (`filtrarPorSeccion`, `construirEntradaHistorial`).
 *   Nunca llama a `localStorage` ni a `fetch` de manera directa (Arquitectura Hexagonal).
 * ============================================================================
 */

import { useState, useCallback } from 'react';
import * as repo from '../../data/itemsRepository.js';
import { appendHistory } from '../../data/historyRepository.js';
import { construirEntradaHistorial } from '../../domain/historial.js';
import { filtrarPorSeccion } from '../../domain/validators.js';

export function useItems() {
  // Inicialización del estado leyendo la colección del repositorio
  const [items, setItems] = useState(() => repo.getAll());

  // ── Operación: Agregar ───────────────────────────────────────────────────────
  /**
   * Agrega un nuevo anime o manga a la lista.
   * @param {object} itemData - Debe contener al menos { malId, mediaType, titulo }.
   * @returns {{ success: boolean, message: string, item?: object }}
   */
  const addItem = useCallback((itemData) => {
    try {
      const created = repo.create(itemData);
      setItems(repo.getAll());
      appendHistory(construirEntradaHistorial(created, 'agregado'));
      return { success: true, message: '', item: created };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  // ── Operación: Actualizar ────────────────────────────────────────────────────
  /**
   * Modifica las propiedades de un ítem existente (progreso, puntuación, estado, tags).
   * @param {string} id - Identificador del ítem.
   * @param {object} patch - Campos a modificar.
   * @param {string} [accion] - Etiqueta descriptiva para el historial.
   * @returns {{ success: boolean, message: string, item?: object }}
   */
  const updateItem = useCallback((id, patch, accion = 'actualizado') => {
    try {
      const updated = repo.update(id, patch);
      setItems(repo.getAll());

      // Determina una etiqueta de historial más precisa según el cambio realizado
      let resolvedAccion = accion;
      if (patch.puntuacion !== undefined) resolvedAccion = 'puntuado';
      else if (patch.favorito !== undefined) resolvedAccion = 'favorito';
      else if (patch.progreso !== undefined) resolvedAccion = 'progreso';

      appendHistory(construirEntradaHistorial(updated, resolvedAccion));
      return { success: true, message: '', item: updated };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  // ── Operación: Eliminar ──────────────────────────────────────────────────────
  /**
   * Elimina un ítem por su ID de la colección.
   * @param {string} id - ID del ítem.
   * @returns {{ success: boolean, message: string }}
   */
  const removeItem = useCallback((id) => {
    try {
      const item = repo.getById(id);
      if (item) appendHistory(construirEntradaHistorial(item, 'eliminado'));
      repo.remove(id);
      setItems(repo.getAll());
      return { success: true, message: '' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  // ── Operación: Importación en Lote ──────────────────────────────────────────
  /**
   * Importa una lista masiva de ítems y registra un evento global en el historial.
   * @param {object[]} batch - Arreglo de ítems a importar.
   * @returns {{ success: boolean, addedCount: number, message: string }}
   */
  const importItems = useCallback((batch) => {
    try {
      const addedCount = repo.importBatch(batch);
      if (addedCount > 0) {
        setItems(repo.getAll());
        // Registrar un único evento de historial para la importación masiva
        appendHistory({
          id: `import_${Date.now()}`,
          timestamp: new Date().toISOString(),
          accion: 'importación masiva',
          detalles: `Se importaron ${addedCount} elemento(s).`,
          item_id: null,
          item_titulo: null
        });
      }
      return { success: true, addedCount, message: '' };
    } catch (err) {
      return { success: false, addedCount: 0, message: err.message };
    }
  }, []);

  // ── Operación: Filtrado por Sección ──────────────────────────────────────────
  /**
   * Obtiene la sublista de ítems correspondientes a la pestaña/sección activa.
   * @param {string} seccion - Clave de la sección (ej: 'completado', 'favorito').
   * @param {'anime'|'manga'|'all'} [mediaType] - Tipo de contenido opcional.
   * @returns {object[]} Lista de ítems filtrados.
   */
  const getFiltered = useCallback(
    (seccion, mediaType) => filtrarPorSeccion(items, seccion, mediaType),
    [items]
  );

  return { items, addItem, updateItem, removeItem, importItems, getFiltered };
}


