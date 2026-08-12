/**
 * data/kitsuImporter.test.js
 * TDD tests for Kitsu JSON export parser.
 */
import { describe, it, expect } from 'vitest';
import { parseKitsuJson } from './kitsuImporter.js';

const sampleKitsuJson = JSON.stringify({
  data: [
    {
      id: '1001',
      type: 'libraryEntries',
      attributes: {
        status: 'current',
        progress: 12,
        ratingTwenty: 18, // 18/20 -> 9/10
        notes: 'Excelente',
      },
      relationships: {
        anime: {
          data: { id: '5', type: 'anime' },
        },
      },
    },
    {
      id: '1002',
      type: 'libraryEntries',
      attributes: {
        status: 'completed',
        progress: 100,
        ratingTwenty: 20, // 20/20 -> 10/10
        notes: 'Obra maestra',
      },
      relationships: {
        manga: {
          data: { id: '12', type: 'manga' },
        },
      },
    },
  ],
  included: [
    {
      id: '5',
      type: 'anime',
      attributes: {
        canonicalTitle: 'Monster',
        posterImage: { medium: 'https://media.kitsu.app/anime/poster_images/5/medium.jpg' },
        synopsis: 'Tenma...',
        episodeCount: 74,
      },
    },
    {
      id: '12',
      type: 'manga',
      attributes: {
        canonicalTitle: '20th Century Boys',
        posterImage: { medium: 'https://media.kitsu.app/manga/poster_images/12/medium.jpg' },
        synopsis: 'Kenji...',
        chapterCount: 249,
      },
    },
  ],
});

describe('parseKitsuJson', () => {
  it('parsea correctamente un export JSON de Kitsu', async () => {
    const items = await parseKitsuJson(sampleKitsuJson);
    expect(items).toHaveLength(2);

    const monster = items.find((i) => i.titulo === 'Monster');
    expect(monster).toBeTruthy();
    expect(monster.mediaType).toBe('anime');
    expect(monster.estadoUsuario).toBe('en_curso'); // current -> en_curso
    expect(monster.puntuacion).toBe(9); // 18 / 2 = 9

    const boys = items.find((i) => i.titulo === '20th Century Boys');
    expect(boys).toBeTruthy();
    expect(boys.mediaType).toBe('manga');
    expect(boys.estadoUsuario).toBe('finalizado'); // completed -> finalizado
    expect(boys.puntuacion).toBe(10);
  });
});
