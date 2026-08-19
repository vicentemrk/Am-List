import { describe, it, expect } from 'vitest';
import { filtrarPorSeccion, validarEstadoUsuario, filtrarPorRangoPuntuacion } from './validators.js';
import { getItemType } from './itemSchema.js';

describe('filtrarPorSeccion', () => {
  // v1.3: favorito y en_emision son estadoUsuario, no campos separados
  const sampleItems = [
    { id: '1', mediaType: 'anime', estadoUsuario: 'por_ver',    favorito: false, estadoEmision: 'unknown'  },
    { id: '2', mediaType: 'anime', estadoUsuario: 'favorito',   favorito: true,  estadoEmision: 'airing'   },
    { id: '3', mediaType: 'anime', estadoUsuario: 'finalizado', favorito: false, estadoEmision: 'complete' },
    { id: '4', mediaType: 'anime', estadoUsuario: 'pausado',    favorito: false, estadoEmision: 'unknown'  },
    { id: '5', mediaType: 'anime', estadoUsuario: 'dropeado',   favorito: false, estadoEmision: 'unknown'  },
    { id: '6', mediaType: 'anime', estadoUsuario: 'en_emision', favorito: false, estadoEmision: 'airing'   },
    { id: '7', mediaType: 'anime', estadoUsuario: 'finalizado', favorito: false, estadoEmision: 'complete' },
  ];

  it('filters all section items', () => {
    expect(filtrarPorSeccion(sampleItems, 'all', 'anime')).toHaveLength(7);
  });
  it('filters por_ver items', () => {
    expect(filtrarPorSeccion(sampleItems, 'por_ver', 'anime').map((i) => i.id)).toEqual(['1']);
  });
  it('filters en_curso items', () => {
    expect(filtrarPorSeccion(sampleItems, 'en_curso', 'anime').map((i) => i.id)).toEqual([]);
  });
  it('completado section returns all — fallback a default case', () => {
    expect(filtrarPorSeccion(sampleItems, 'completado', 'anime')).toHaveLength(7);
  });
  it('items migrados de completado aparecen en finalizado (Regla migracion v1.2)', () => {
    expect(filtrarPorSeccion(sampleItems, 'finalizado', 'anime').map((i) => i.id)).toEqual(['3', '7']);
  });
  // v1.3: favorito filtra por estadoUsuario='favorito'
  it('filters favorito items by estadoUsuario (v1.3)', () => {
    expect(filtrarPorSeccion(sampleItems, 'favorito', 'anime').map((i) => i.id)).toEqual(['2']);
  });
  // v1.3: en_emision filtra por estadoUsuario='en_emision', NO por estadoEmision API
  it('filters en_emision items by estadoUsuario (v1.3 — ignora API)', () => {
    expect(filtrarPorSeccion(sampleItems, 'en_emision', 'anime').map((i) => i.id)).toEqual(['6']);
  });
  it('filters finalizado items by estadoUsuario (Regla 6 v1.1)', () => {
    expect(filtrarPorSeccion(sampleItems, 'finalizado', 'anime').map((i) => i.id)).toEqual(['3', '7']);
  });
  it('filters pausado items', () => {
    expect(filtrarPorSeccion(sampleItems, 'pausado', 'anime').map((i) => i.id)).toEqual(['4']);
  });
  it('filters dropeado items', () => {
    expect(filtrarPorSeccion(sampleItems, 'dropeado', 'anime').map((i) => i.id)).toEqual(['5']);
  });
});

describe('validarEstadoUsuario', () => {
  it('acepta todos los estados validos (v1.3: incluye en_emision y favorito)', () => {
    for (const e of ['por_ver', 'en_emision', 'en_curso', 'favorito', 'finalizado', 'pausado', 'dropeado']) {
      expect(validarEstadoUsuario(e).valid).toBe(true);
    }
  });
  it('rechaza "completado" (eliminado en v1.2)', () => {
    const r = validarEstadoUsuario('completado');
    expect(r.valid).toBe(false);
    expect(r.message).toMatch(/completado/i);
  });
  it('rechaza strings arbitrarios', () => {
    expect(validarEstadoUsuario('viendo').valid).toBe(false);
    expect(validarEstadoUsuario('').valid).toBe(false);
  });
  it('rechaza undefined y null', () => {
    expect(validarEstadoUsuario(undefined).valid).toBe(false);
    expect(validarEstadoUsuario(null).valid).toBe(false);
  });
});

describe('filtrarPorRangoPuntuacion', () => {
  const items = [
    { id: '1', puntuacion: 1 },
    { id: '2', puntuacion: 5 },
    { id: '3', puntuacion: 7 },
    { id: '4', puntuacion: 10 },
    { id: '5', puntuacion: null },
    { id: '6', puntuacion: undefined },
  ];

  it('rango completo [1,10] = filtro inactivo — devuelve todos incluyendo null', () => {
    expect(filtrarPorRangoPuntuacion(items, 1, 10)).toHaveLength(6);
  });
  it('rango parcial [5,7] — excluye fuera del rango y null', () => {
    expect(filtrarPorRangoPuntuacion(items, 5, 7).map((i) => i.id)).toEqual(['2', '3']);
  });
  it('rango exacto [10,10]', () => {
    expect(filtrarPorRangoPuntuacion(items, 10, 10).map((i) => i.id)).toEqual(['4']);
  });
  it('null se excluye cuando el filtro esta activo', () => {
    const res = filtrarPorRangoPuntuacion(items, 1, 9);
    expect(res.find((i) => i.id === '5')).toBeUndefined();
  });
  it('devuelve array vacio si ningun item esta en el rango', () => {
    expect(filtrarPorRangoPuntuacion(items, 8, 9)).toHaveLength(0);
  });
});

describe('inferItemType y getItemType', () => {
  it('infiere Manhwa para Solo Leveling', () => {
    expect(getItemType({ titulo: 'Solo Leveling', mediaType: 'manga' })).toBe('Manhwa');
  });

  it('infiere Manhua para Kaiju Qian Dao Huanggu Shengti', () => {
    expect(getItemType({ titulo: 'Kaiju Qian Dao Huanggu Shengti', mediaType: 'manga' })).toBe('Manhua');
  });

  it('infiere Manga para Innocents Shounen Juujigun', () => {
    expect(getItemType({ titulo: 'Innocents Shounen Juujigun', mediaType: 'manga' })).toBe('Manga');
  });

  it('respeta tipo si ya esta explícitamente seteado', () => {
    expect(getItemType({ titulo: 'Cualquier Cosa', mediaType: 'manga', tipo: 'Novela' })).toBe('Novela');
  });

  it('usa countryOfOrigin para determinar Manhwa y Manhua', () => {
    expect(getItemType({ titulo: 'Obra Coreana', mediaType: 'manga', countryOfOrigin: 'KR' })).toBe('Manhwa');
    expect(getItemType({ titulo: 'Obra China', mediaType: 'manga', countryOfOrigin: 'CN' })).toBe('Manhua');
  });

  it('usa format/subType para animes', () => {
    expect(getItemType({ titulo: 'Película Anime', mediaType: 'anime', format: 'MOVIE' })).toBe('Película');
    expect(getItemType({ titulo: 'Serie Anime', mediaType: 'anime', format: 'TV' })).toBe('TV');
    expect(getItemType({ titulo: 'OVA Anime', mediaType: 'anime', format: 'OVA' })).toBe('OVA');
  });
});
