import { describe, it, expect } from 'vitest';
import { parseHash, slugToSection, sectionToSlug } from './useAppRouter.js';

describe('useAppRouter helpers', () => {
  describe('slugToSection', () => {
    it('normalizes spanish slugs with hyphens', () => {
      expect(slugToSection('por-ver')).toBe('por_ver');
      expect(slugToSection('en-emision')).toBe('en_emision');
      expect(slugToSection('en-curso')).toBe('en_curso');
      expect(slugToSection('favoritos')).toBe('favorito');
      expect(slugToSection('finalizados')).toBe('finalizado');
      expect(slugToSection('pausados')).toBe('pausado');
      expect(slugToSection('dropeados')).toBe('dropeado');
    });

    it('falls back to all for unknown slugs', () => {
      expect(slugToSection('')).toBe('all');
      expect(slugToSection('random_slug')).toBe('all');
    });
  });

  describe('sectionToSlug', () => {
    it('converts underscore sections to url friendly slugs', () => {
      expect(sectionToSlug('por_ver')).toBe('por-ver');
      expect(sectionToSlug('en_emision')).toBe('en-emision');
      expect(sectionToSlug('en_curso')).toBe('en-curso');
      expect(sectionToSlug('favorito')).toBe('favorito');
      expect(sectionToSlug('all')).toBe('all');
    });
  });

  describe('parseHash', () => {
    it('parses empty or root hash as default anime/all', () => {
      expect(parseHash('')).toEqual({ media: 'anime', section: 'all' });
      expect(parseHash('#')).toEqual({ media: 'anime', section: 'all' });
      expect(parseHash('#/')).toEqual({ media: 'anime', section: 'all' });
    });

    it('parses direct media and sections correctly', () => {
      expect(parseHash('#/anime/favorito')).toEqual({ media: 'anime', section: 'favorito' });
      expect(parseHash('#/manga/por-ver')).toEqual({ media: 'manga', section: 'por_ver' });
      expect(parseHash('#/manga/finalizados')).toEqual({ media: 'manga', section: 'finalizado' });
    });

    it('handles media only hashes', () => {
      expect(parseHash('#/manga')).toEqual({ media: 'manga', section: 'all' });
      expect(parseHash('#/anime')).toEqual({ media: 'anime', section: 'all' });
    });
  });
});
