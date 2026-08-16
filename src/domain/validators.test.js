import { describe, it, expect } from 'vitest';
import { filtrarPorSeccion, validarEstadoUsuario, filtrarPorRangoPuntuacion } from './validators.js';

describe('filtrarPorSeccion', () => {
  const sampleItems = [
    { id: '1', mediaType: 'anime', estadoUsuario: 'por_ver',    favorito: false, estadoEmision: 'unknown'  },
    { id: '2', mediaType: 'anime', estadoUsuario: 'en_curso',   favorito: true,  estadoEmision: 'airing'   },
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
    expect(filtrarPorSeccion(sampleItems, 'en_curso', 'anime').map((i) => i.id)).toEqual(['2']);
  });
  it('completado section returns all — fallback a default case', () => {
    expect(filtrarPorSeccion(sampleItems, 'completado', 'anime')).toHaveLength(7);
  });
  it('items migrados de completado aparecen en finalizado (Regla migracion v1.2)', () => {
    expect(filtrarPorSeccion(sampleItems, 'finalizado', 'anime').map((i) => i.id)).toEqual(['3', '7']);
  });
  it('filters favorito items', () => {
    expect(filtrarPorSeccion(sampleItems, 'favorito', 'anime').map((i) => i.id)).toEqual(['2']);
  });
  it('filters en_emision items', () => {
    expect(filtrarPorSeccion(sampleItems, 'en_emision', 'anime').map((i) => i.id)).toEqual(['2', '6']);
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
  it('acepta todos los estados validos', () => {
    for (const e of ['por_ver', 'en_curso', 'finalizado', 'pausado', 'dropeado']) {
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
