/**
 * data/anilistImporter.test.js
 * TDD tests for AniList JSON export parser.
 */
import { describe, it, expect } from 'vitest';
import { parseAniListJson } from './anilistImporter.js';

const sampleAniListJson = JSON.stringify({
  version: '1.0',
  MediaListCollection: {
    lists: [
      {
        name: 'Completed',
        status: 'COMPLETED',
        entries: [
          {
            id: 101,
            mediaId: 1,
            status: 'COMPLETED',
            score: 9,
            progress: 26,
            media: {
              id: 1,
              title: { romaji: 'Cowboy Bebop', english: 'Cowboy Bebop' },
              coverImage: { medium: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx1-z8d7elSpLycW.png' },
              episodes: 26,
              genres: ['Action', 'Sci-Fi'],
              description: 'The year 2071 AD...',
              format: 'TV',
            },
          },
        ],
      },
      {
        name: 'Planning',
        status: 'PLANNING',
        entries: [
          {
            id: 102,
            mediaId: 2,
            status: 'PLANNING',
            score: 0,
            progress: 0,
            media: {
              id: 2,
              title: { romaji: 'Berserk', english: 'Berserk' },
              coverImage: { medium: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx30001-tNQy7sL4tQ5Z.jpg' },
              chapters: 364,
              genres: ['Action', 'Dark Fantasy'],
              description: 'Guts...',
              format: 'MANGA',
            },
          },
        ],
      },
    ],
  },
});

describe('parseAniListJson', () => {
  it('parsea correctamente un export JSON de AniList', async () => {
    const items = await parseAniListJson(sampleAniListJson);
    expect(items).toHaveLength(2);

    const bebop = items.find((i) => i.titulo.includes('Cowboy Bebop'));
    expect(bebop).toBeTruthy();
    expect(bebop.mediaType).toBe('anime');
    expect(bebop.estadoUsuario).toBe('finalizado'); // COMPLETED -> finalizado
    expect(bebop.puntuacion).toBe(9);

    const berserk = items.find((i) => i.titulo.includes('Berserk'));
    expect(berserk).toBeTruthy();
    expect(berserk.mediaType).toBe('manga');
    expect(berserk.estadoUsuario).toBe('por_ver'); // PLANNING -> por_ver
  });
});
