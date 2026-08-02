import { describe, it, expect } from 'vitest';
import { translateGenre, translateGenres } from './genreTranslator.js';

describe('genreTranslator', () => {
  it('translates known English genres to Spanish correctly', () => {
    expect(translateGenre('Action')).toBe('Acción');
    expect(translateGenre('Sci-Fi')).toBe('Ciencia Ficción');
    expect(translateGenre('Slice of Life')).toBe('Recuentos de la Vida');
    expect(translateGenre('Fantasy')).toBe('Fantasía');
    expect(translateGenre('Supernatural')).toBe('Sobrenatural');
  });

  it('handles case-insensitive matches', () => {
    expect(translateGenre('action')).toBe('Acción');
    expect(translateGenre('sci-fi')).toBe('Ciencia Ficción');
  });

  it('returns original string if not in dictionary', () => {
    expect(translateGenre('Custom Genre')).toBe('Custom Genre');
  });

  it('translates an array of genres cleanly without duplicates', () => {
    const input = ['Action', 'Sci-Fi', 'Acción', 'Comedy'];
    const output = translateGenres(input);
    expect(output).toEqual(['Acción', 'Ciencia Ficción', 'Comedia']);
  });
});
