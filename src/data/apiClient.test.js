/**
 * src/data/apiClient.test.js
 *
 * Tests para las interfaces públicas del cliente de API:
 *   - searchAnime(query, signal?)
 *   - searchManga(query, signal?)
 *
 * Seams: solo las exportaciones públicas. El mock va sobre globalThis.fetch,
 * nunca sobre funciones internas del módulo.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, searchAnime, searchManga } from './apiClient.js';

// ─── helpers para construir respuestas fake de fetch ──────────────────────────

function makeMangaDexResponse(overrides = {}) {
  return {
    data: [
      {
        id: '1',
        attributes: {
          title: { en: 'Naruto' },
          status: 'completed',
          lastChapter: '700',
          description: { en: 'A ninja story.' },
          tags: [{ attributes: { name: { en: 'Action' } } }, { attributes: { name: { en: 'Adventure' } } }]
        },
        relationships: [{ type: 'cover_art', attributes: { fileName: 'cover.jpg' } }],
        ...overrides,
      },
    ],
  };
}

function makeAniListResponse(overrides = {}) {
  return {
    data: {
      Page: {
        media: [
          {
            id: 20,
            idMal: 20,
            title: { english: 'Naruto', romaji: 'Naruto', native: 'ナルト' },
            coverImage: { large: 'https://example.com/naruto-al.jpg' },
            status: 'FINISHED',
            episodes: 220,
            chapters: null,
            averageScore: 79,
            genres: ['Action'],
            description: '<p>A ninja story.</p>',
            ...overrides,
          },
        ],
      },
    },
  };
}

function makeKitsuAnimeResponse(overrides = {}) {
  return {
    data: [
      {
        id: '99',
        attributes: {
          canonicalTitle: 'Naruto',
          posterImage: { large: 'https://example.com/naruto-kitsu.jpg' },
          status: 'finished',
          episodeCount: 220,
          synopsis: 'A ninja story.',
          averageRating: '79.00',
          ...overrides,
        },
      },
    ],
  };
}

function okFetch(body) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  });
}

// ─── Stub de localStorage (no existe en Node/Vitest) ─────────────────────────

const localStorageStub = (() => {
  let store = {};
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = v; },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();

// ─── Setup global ─────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.restoreAllMocks();
  vi.stubGlobal('localStorage', localStorageStub);
  localStorageStub.clear();
  // Limpiar caché en memoria entre tests importando el módulo con side-effects
  // No podemos resetear el Map interno, pero podemos limpiar localStorage.
  // Los tests que dependen del caché usan queries únicas para aislarlos.
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('searchAnime', () => {
  it('retorna resultados normalizados de AniList cuando responde con éxito', async () => {
    vi.stubGlobal('fetch', () => okFetch(makeAniListResponse()));

    const results = await searchAnime('naruto-anilist-ok');

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      malId: 20,
      mediaType: 'anime',
      titulo: 'Naruto',
      estadoEmision: 'complete',
      progreso: { actual: 0, maximo: 220 },
      score: '7.90',
      genres: ['Action'],
      source: 'AniList',
    });
  });

  it('hace fallback a Kitsu si AniList responde con 503 (error)', async () => {
    vi.stubGlobal('fetch', vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(makeKitsuAnimeResponse()) })
    );

    const results = await searchAnime('naruto-fallback-kitsu');

    expect(results).toHaveLength(1);
    expect(results[0].source).toBe('Kitsu');
    expect(results[0].titulo).toBe('Naruto');
  });

  it('retorna [] sin hacer ningún fetch si la query está vacía', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const results = await searchAnime('');

    expect(results).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('retorna resultados del caché en memoria sin hacer otro fetch en la misma query', async () => {
    const fetchSpy = vi.fn(() => okFetch(makeAniListResponse()));
    vi.stubGlobal('fetch', fetchSpy);

    // Primera llamada — va a la red
    await searchAnime('naruto-cache-test');
    // Segunda llamada — debe servirse del caché
    const cached = await searchAnime('naruto-cache-test');

    // fetch solo se debió llamar una vez (la primera)
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(cached).toHaveLength(1);
    expect(cached[0].titulo).toBe('Naruto');
  });

  it('lanza ApiError si las APIs fallan y no hay resultados', async () => {
    vi.stubGlobal('fetch', vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({ ok: false, status: 500, json: () => Promise.resolve({}) })
    );

    await expect(searchAnime('naruto-all-fail')).rejects.toBeInstanceOf(ApiError);
  });
});

describe('searchManga', () => {
  it('retorna resultados normalizados de MangaDex para manga con éxito', async () => {
    vi.stubGlobal('fetch', () => okFetch(makeMangaDexResponse()));

    const results = await searchManga('naruto-mangadex-ok');

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      malId: 'md_1',
      mediaType: 'manga',
      titulo: 'Naruto',
      estadoEmision: 'complete',
      progreso: { actual: 0, maximo: 700 },
      source: 'MangaDex',
    });
  });
});
