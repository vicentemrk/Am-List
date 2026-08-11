import { describe, it, expect } from 'vitest';
import { filtrarPorSeccion } from './validators.js';

describe('filtrarPorSeccion', () => {
  const sampleItems = [
    { id: '1', mediaType: 'anime', estadoUsuario: 'por_ver', favorito: false, estadoEmision: 'unknown' },
    { id: '2', mediaType: 'anime', estadoUsuario: 'en_curso', favorito: true, estadoEmision: 'airing' },
    { id: '3', mediaType: 'anime', estadoUsuario: 'completado', favorito: false, estadoEmision: 'complete' },
    { id: '4', mediaType: 'anime', estadoUsuario: 'pausado', favorito: false, estadoEmision: 'unknown' },
    { id: '5', mediaType: 'anime', estadoUsuario: 'dropeado', favorito: false, estadoEmision: 'unknown' },
    { id: '6', mediaType: 'anime', estadoUsuario: 'en_emision', favorito: false, estadoEmision: 'airing' },
    { id: '7', mediaType: 'anime', estadoUsuario: 'finalizado', favorito: false, estadoEmision: 'complete' },
  ];

  it('filters all section items', () => {
    expect(filtrarPorSeccion(sampleItems, 'all', 'anime')).toHaveLength(7);
  });

  it('filters por_ver items', () => {
    const res = filtrarPorSeccion(sampleItems, 'por_ver', 'anime');
    expect(res.map((i) => i.id)).toEqual(['1']);
  });

  it('filters en_curso items', () => {
    const res = filtrarPorSeccion(sampleItems, 'en_curso', 'anime');
    expect(res.map((i) => i.id)).toEqual(['2']);
  });

  it('filters completado items', () => {
    const res = filtrarPorSeccion(sampleItems, 'completado', 'anime');
    expect(res.map((i) => i.id)).toEqual(['3']);
  });

  it('filters favorito items', () => {
    const res = filtrarPorSeccion(sampleItems, 'favorito', 'anime');
    expect(res.map((i) => i.id)).toEqual(['2']);
  });

  it('filters en_emision items', () => {
    const res = filtrarPorSeccion(sampleItems, 'en_emision', 'anime');
    expect(res.map((i) => i.id)).toEqual(['2', '6']);
  });

  it('filters finalizado items by estadoUsuario (Regla 6 v1.1 — NOT by estadoEmision)', () => {
    // REGLA 6 reformulada: 'finalizado' filtra por estadoUsuario='finalizado',
    // NO por estadoEmision='complete'. El ítem '3' tiene estadoEmision='complete'
    // pero estadoUsuario='completado', por lo tanto NO debe aparecer en 'finalizado'.
    const res = filtrarPorSeccion(sampleItems, 'finalizado', 'anime');
    expect(res.map((i) => i.id)).toEqual(['7']);
  });

  it('filters pausado items', () => {
    const res = filtrarPorSeccion(sampleItems, 'pausado', 'anime');
    expect(res.map((i) => i.id)).toEqual(['4']);
  });

  it('filters dropeado items', () => {
    const res = filtrarPorSeccion(sampleItems, 'dropeado', 'anime');
    expect(res.map((i) => i.id)).toEqual(['5']);
  });
});
