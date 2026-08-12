/**
 * data/snapshotRepository.test.js
 * TDD Red phase: tests para el repositorio de snapshots/backups automáticos.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveSnapshot,
  getSnapshots,
  restoreSnapshot,
  clearSnapshots,
} from './snapshotRepository.js';

// Setup localStorage stub
const localStorageStub = (() => {
  let store = {};
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageStub });

const makeItems = (count) =>
  Array.from({ length: count }, (_, i) => ({
    id: `anime_${i + 1}`,
    titulo: `Anime ${i + 1}`,
    mediaType: 'anime',
    estadoUsuario: 'por_ver',
  }));

describe('snapshotRepository', () => {
  beforeEach(() => {
    localStorage.clear();
    clearSnapshots();
  });

  it('saveSnapshot guarda un snapshot con timestamp e itemCount', () => {
    const items = makeItems(5);
    saveSnapshot(items);
    const snapshots = getSnapshots();
    expect(snapshots).toHaveLength(1);
    expect(snapshots[0].itemCount).toBe(5);
    expect(typeof snapshots[0].timestamp).toBe('string');
    expect(snapshots[0].id).toBeTruthy();
  });

  it('getSnapshots devuelve array vacío cuando no hay snapshots', () => {
    expect(getSnapshots()).toEqual([]);
  });

  it('mantiene máximo 3 snapshots (rotación FIFO)', () => {
    saveSnapshot(makeItems(1));
    saveSnapshot(makeItems(2));
    saveSnapshot(makeItems(3));
    saveSnapshot(makeItems(4)); // debe eliminar el más antiguo

    const snapshots = getSnapshots();
    expect(snapshots).toHaveLength(3);
    // El más antiguo (1 ítem) fue reemplazado — el más viejo tiene 2 ítems
    expect(snapshots[0].itemCount).toBe(2);
    expect(snapshots[2].itemCount).toBe(4);
  });

  it('restoreSnapshot devuelve los ítems del snapshot indicado', () => {
    const items5 = makeItems(5);
    const items3 = makeItems(3);
    saveSnapshot(items5);
    saveSnapshot(items3);

    const snapshots = getSnapshots();
    const snap5 = snapshots.find((s) => s.itemCount === 5);
    const restored = restoreSnapshot(snap5.id);
    expect(restored).toHaveLength(5);
    expect(restored[0].id).toBe('anime_1');
  });

  it('restoreSnapshot devuelve null si el id no existe', () => {
    expect(restoreSnapshot('id-inexistente')).toBeNull();
  });

  it('los snapshots persisten en localStorage', () => {
    saveSnapshot(makeItems(2));
    // Simular recarga — clearSnapshots() limpia la caché en memoria
    // pero los datos siguen en localStorage
    clearSnapshots(); // solo limpia memoria, no localStorage
    const snapshots = getSnapshots(); // debe re-leer de localStorage
    expect(snapshots).toHaveLength(1);
  });

  it('getSnapshots devuelve snapshots ordenados del más antiguo al más reciente', () => {
    saveSnapshot(makeItems(1));
    saveSnapshot(makeItems(3));
    saveSnapshot(makeItems(2));
    const snapshots = getSnapshots();
    // Ordenados por timestamp ascendente (índice 0 = más antiguo)
    expect(snapshots[0].itemCount).toBe(1);
    expect(snapshots[2].itemCount).toBe(2);
  });
});
