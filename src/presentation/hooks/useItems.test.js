import { describe, it, expect, beforeEach } from 'vitest';
import * as itemsRepo from '../../data/itemsRepository.js';

// Setup localStorage stub for Vitest environment
const localStorageStub = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageStub });

describe('itemsRepository & data layer CRUD', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with an empty array of items', () => {
    const all = itemsRepo.getAll();
    expect(all).toEqual([]);
  });

  it('creates an item and persists it deterministically', () => {
    const itemData = {
      id: 'anime_1',
      malId: 1,
      mediaType: 'anime',
      titulo: 'Cowboy Bebop',
      imagen: 'https://example.com/bebop.jpg',
      tipo: 'TV',
    };

    const created = itemsRepo.create(itemData);
    expect(created.id).toBe('anime_1');
    expect(created.titulo).toBe('Cowboy Bebop');
    expect(created.estadoUsuario).toBe('por_ver');

    const all = itemsRepo.getAll();
    expect(all.length).toBe(1);
    expect(all[0].id).toBe('anime_1');
  });

  it('updates an item correctly', () => {
    const created = itemsRepo.create({
      id: 'manga_2',
      malId: 2,
      mediaType: 'manga',
      titulo: 'Berserk',
      tipo: 'Manga',
    });

    const updated = itemsRepo.update(created.id, { puntuacion: 10, estadoUsuario: 'completado' });
    expect(updated.puntuacion).toBe(10);
    expect(updated.estadoUsuario).toBe('completado');

    const fetched = itemsRepo.getById(created.id);
    expect(fetched.puntuacion).toBe(10);
  });

  it('removes an item', () => {
    const created = itemsRepo.create({
      id: 'anime_3',
      malId: 3,
      mediaType: 'anime',
      titulo: 'Trigun',
      tipo: 'TV',
    });

    itemsRepo.remove(created.id);
    expect(itemsRepo.getAll().length).toBe(0);
    expect(itemsRepo.getById(created.id)).toBeNull();
  });
});
