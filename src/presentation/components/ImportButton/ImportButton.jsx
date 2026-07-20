/**
 * presentation/components/ImportButton/ImportButton.jsx
 */
import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { parseMalXml } from '../../../data/malImporter.js';
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
      const items = await parseMalXml(file);
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
        aria-label="Importar MyAnimeList XML"
        title="Importar lista de MyAnimeList"
      >
        <Upload size={18} />
        <span className="import-btn__text">
          {loading ? 'Leyendo...' : 'Importar'}
        </span>
      </button>
      <input
        type="file"
        accept=".xml"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      {error && <span className="import-btn__error">{error}</span>}
    </div>
  );
}
