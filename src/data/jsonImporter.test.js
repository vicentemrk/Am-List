import { describe, it, expect } from 'vitest';
import { parseAmListJson } from './jsonImporter.js';

describe('jsonImporter', () => {
  it('parses valid AMlist JSON string array', async () => {
    const jsonStr = JSON.stringify([
      {
        id: 'anime_1',
        malId: 1,
        mediaType: 'anime',
        titulo: 'Cowboy Bebop',
        progreso: { actual: 26, maximo: 26 },
        puntuacion: 10,
      },
    ]);

    const result = await parseAmListJson(jsonStr);
    expect(result).toHaveLength(1);
    expect(result[0].titulo).toBe('Cowboy Bebop');
    expect(result[0].id).toBe('anime_1');
  });

  it('throws error for invalid JSON string', async () => {
    await expect(parseAmListJson('not-json')).rejects.toThrow(
      'El archivo no contiene un formato JSON válido.'
    );
  });

  it('throws error for empty or non-array JSON', async () => {
    await expect(parseAmListJson('{"foo": "bar"}')).rejects.toThrow(
      'El archivo JSON no contiene un listado de AMlist válido.'
    );
  });
});
