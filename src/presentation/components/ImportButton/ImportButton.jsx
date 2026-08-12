/**
 * presentation/components/ImportButton/ImportButton.jsx
 */
import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { parseMalXml } from '../../../data/malImporter.js';
import { parseAmListJson } from '../../../data/jsonImporter.js';
import { parseAniListJson } from '../../../data/anilistImporter.js';
import { parseKitsuJson } from '../../../data/kitsuImporter.js';
import './ImportButton.css';


export function ImportButton({ onImport }) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      let items;
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.json') || file.type === 'application/json') {
        const text = await file.text();
        const parsed = JSON.parse(text);

        // AniList export format check
        if (parsed?.MediaListCollection || parsed?.data?.MediaListCollection) {
          items = await parseAniListJson(text);
        }
        // Kitsu export format check
        else if (Array.isArray(parsed?.data) && parsed.data[0]?.type === 'libraryEntries') {
          items = await parseKitsuJson(text);
        }
        // AMlist native JSON format
        else {
          items = await parseAmListJson(text);
        }
      } else {
        items = await parseMalXml(file);
      }
      onImport(items);

    } catch (err) {
      setError(err.message || 'Error al importar.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
      // Reset input so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="import-btn-wrapper">
      <button
        className="import-btn"
        onClick={handleClick}
        disabled={loading}
        aria-label="Importar archivo JSON o XML"
        title="Importar lista desde JSON (AMlist, AniList, Kitsu) o XML (MyAnimeList)"

      >
        <Upload size={18} />
        <span className="import-btn__text">
          {loading ? 'Leyendo...' : 'Importar'}
        </span>
      </button>
      <input
        type="file"
        accept=".xml,.json"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      {error && <span className="import-btn__error">{error}</span>}
    </div>
  );
}
