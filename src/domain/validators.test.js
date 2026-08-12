import { describe, it, expect } from 'vitest';
import { filtrarPorSeccion } from './validators.js';

describe('filtrarPorSeccion', () => {
  /**
   * Nota v1.2: el estado 'completado' fue eliminado del sistema.
   * Los ítems con estadoUsuario='completado' son migrados automáticamente a 'finalizado'
   * en el adaptador de localStorage. Aquí los sampleItems ya reflejan datos post-migración.
   */
  const sampleItems = [
    { id: '1', mediaType: 'anime', estadoUsuario: 'por_ver',    favorito: false, estadoEmision: 'unknown'  },
    { id: '2', mediaType: 'anime', estadoUsuario: 'en_curso',   favorito: true,  estadoEmision: 'airing'   },
    { id: '3', mediaType: 'anime', estadoUsuario: 'finalizado', favorito: false, estadoEmision: 'complete' }, // migrado de 'completado'
    { id: '4', mediaType: 'anime', estadoUsuario: 'pausado',    favorito: false, estadoEmision: 'unknown'  },
    { id: '5', mediaType: 'anime', estadoUsuario: 'dropeado',   favorito: false, estadoEmision: 'unknown'  },
    { id: '6', mediaType: 'anime', estadoUsuario: 'en_emision', favorito: false, estadoEmision: 'airing'   },
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

  it('completado section returns empty — estado eliminado en v1.2 (fallback a default case)', () => {
    // 'completado' ya no es una sección válida — cae en default y devuelve todos los ítems
    // sin filtro adicional (comportamiento seguro del switch)
    const res = filtrarPorSeccion(sampleItems, 'completado', 'anime');
    // El estado 'completado' fue eliminado del switch, retorna todos (default: return result)
    expect(res).toHaveLength(7);
  });

  it('items migrados de completado aparecen en finalizado (Regla migración v1.2)', () => {
    // El ítem '3' fue migrado de estadoUsuario='completado' a 'finalizado'.
    // Debe aparecer en la sección 'finalizado' junto al ítem '7'.
    const res = filtrarPorSeccion(sampleItems, 'finalizado', 'anime');
    expect(res.map((i) => i.id)).toEqual(['3', '7']);
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
    // REGLA 6 reformulada: 'finalizado' filtra por estadoUsuario='finalizado', NO por estadoEmision='complete'
    const res = filtrarPorSeccion(sampleItems, 'finalizado', 'anime');
    expect(res.map((i) => i.id)).toEqual(['3', '7']);
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
