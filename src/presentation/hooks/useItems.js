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
   * Modifica las propiedades de un ítem existente y genera entradas individuales detalladas en el historial.
   * @param {string} id - Identificador del ítem.
   * @param {object} patch - Campos a modificar.
   * @returns {{ success: boolean, message: string, item?: object }}
   */
  const updateItem = useCallback((id, patch) => {
    try {
      const prev = repo.getById(id);
      const updated = repo.update(id, patch);
      setItems(repo.getAll());

      if (prev) {
        let eventsLogged = 0;

        // 1. Cambio de Estado Personal
        if (patch.estadoUsuario !== undefined && prev.estadoUsuario !== updated.estadoUsuario) {
          const labelMap = {
            por_ver: 'Por ver', en_curso: 'En curso', completado: 'Completado',
            finalizado: 'Finalizado', pausado: 'Pausado', dropeado: 'Dropeado'
          };
          const newLabel = labelMap[updated.estadoUsuario] ?? updated.estadoUsuario;
          appendHistory(construirEntradaHistorial(updated, 'estado_cambiado', `Cambió estado a "${newLabel}"`));
          eventsLogged++;
        }

        // 2. Cambio de Progreso
        if (
          patch.progreso !== undefined &&
          (prev.progreso?.actual !== updated.progreso?.actual || prev.progreso?.maximo !== updated.progreso?.maximo)
        ) {
          const maxText = updated.progreso?.maximo ?? '?';
          const unitText = updated.mediaType === 'anime' ? 'episodios' : 'capítulos';
          appendHistory(construirEntradaHistorial(updated, 'progreso', `Progreso: ${updated.progreso?.actual ?? 0} / ${maxText} ${unitText}`));
          eventsLogged++;
        }

        // 3. Cambio de Calificación
        if (patch.puntuacion !== undefined && prev.puntuacion !== updated.puntuacion) {
          const scoreText = updated.puntuacion ? `Puntuación: ${updated.puntuacion} ★` : 'Puntuación eliminada';
          appendHistory(construirEntradaHistorial(updated, 'puntuado', scoreText));
          eventsLogged++;
        }

        // 4. Cambio de Favorito
        if (patch.favorito !== undefined && prev.favorito !== updated.favorito) {
          const favText = updated.favorito ? 'Marcado como favorito' : 'Quitado de favoritos';
          appendHistory(construirEntradaHistorial(updated, 'favorito', favText));
          eventsLogged++;
        }

        // 5. Cambio de Etiquetas
        if (patch.tags !== undefined && JSON.stringify(prev.tags) !== JSON.stringify(updated.tags)) {
          const tagsText = updated.tags.length > 0 ? `Etiquetas: ${updated.tags.map((t) => `#${t}`).join(', ')}` : 'Sin etiquetas';
          appendHistory(construirEntradaHistorial(updated, 'etiquetado', tagsText));
          eventsLogged++;
        }

        // 6. Cambio de Descripción Personal
        if (patch.descripcionPersonal !== undefined && prev.descripcionPersonal !== updated.descripcionPersonal) {
          appendHistory(construirEntradaHistorial(updated, 'nota_personal', 'Nota personal actualizada'));
          eventsLogged++;
        }

        // Fallback genérico si no se clasificó específicamente
        if (eventsLogged === 0) {
          appendHistory(construirEntradaHistorial(updated, 'actualizado', 'Ítem actualizado'));
        }
      }

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


