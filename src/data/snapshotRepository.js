/**
 * ============================================================================
 * MÓDULO: data/snapshotRepository.js
 * ============================================================================
 * Qué hace:
 *   Gestiona puntos de restauración automáticos (snapshots) de la lista completa
 *   de ítems. Almacena hasta MAX_SNAPSHOTS slots rotativos en localStorage.
 *   Al superar el máximo, el snapshot más antiguo es reemplazado (FIFO).
 * Cuándo se usa:
 *   - Antes de importar un archivo XML/JSON (ImportButton)
 *   - Antes de una eliminación masiva (BulkActionBar)
 * ============================================================================
 */

const STORAGE_KEY = 'amlist_snapshots';
const MAX_SNAPSHOTS = 3;

/** Caché en memoria para evitar re-parsear localStorage en cada llamada */
let _cache = null;

/**
 * Lee los snapshots desde localStorage (con caché en memoria).
 * @returns {Array<{id: string, timestamp: string, itemCount: number, items: object[]}>}
 */
function readAll() {
  if (_cache !== null) return _cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return (_cache = []);
    const parsed = JSON.parse(raw);
    return (_cache = Array.isArray(parsed) ? parsed : []);
  } catch {
    return (_cache = []);
  }
}

/**
 * Escribe los snapshots en localStorage y actualiza la caché.
 * @param {object[]} snapshots
 */
function writeAll(snapshots) {
  _cache = snapshots;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
  } catch {
    // Storage lleno — ignorar silenciosamente
  }
}

/**
 * Limpia la caché en memoria (útil para tests o reinicio de sesión).
 * NO borra los datos de localStorage.
 */
export function clearSnapshots() {
  _cache = null;
}

/**
 * Guarda un nuevo snapshot de la lista completa.
 * Si ya existen MAX_SNAPSHOTS, elimina el más antiguo (índice 0).
 *
 * @param {object[]} items - Lista completa de ítems a respaldar.
 * @returns {{ id: string, timestamp: string, itemCount: number }} Metadatos del snapshot creado.
 */
export function saveSnapshot(items) {
  const snapshots = readAll();

  const newSnapshot = {
    id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    itemCount: items.length,
    items: items,
  };

  const updated = [...snapshots, newSnapshot];

  // Mantener solo MAX_SNAPSHOTS, eliminando los más antiguos (FIFO)
  const rotated = updated.length > MAX_SNAPSHOTS
    ? updated.slice(updated.length - MAX_SNAPSHOTS)
    : updated;

  writeAll(rotated);

  return {
    id: newSnapshot.id,
    timestamp: newSnapshot.timestamp,
    itemCount: newSnapshot.itemCount,
  };
}

/**
 * Devuelve la lista de snapshots disponibles, ordenados del más antiguo al más reciente.
 * No incluye los ítems para no exponer datos pesados innecesariamente.
 *
 * @returns {Array<{id: string, timestamp: string, itemCount: number}>}
 */
export function getSnapshots() {
  return readAll().map(({ id, timestamp, itemCount }) => ({ id, timestamp, itemCount }));
}

/**
 * Restaura los ítems de un snapshot específico por su ID.
 *
 * @param {string} snapshotId - ID del snapshot a restaurar.
 * @returns {object[]|null} Array de ítems del snapshot, o null si no se encuentra.
 */
export function restoreSnapshot(snapshotId) {
  const snapshots = readAll();
  const snapshot = snapshots.find((s) => s.id === snapshotId);
  return snapshot ? snapshot.items : null;
}
