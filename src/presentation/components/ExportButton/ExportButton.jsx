/**
 * presentation/components/ExportButton/ExportButton.jsx
 * Downloads all items as a formatted JSON file.
 */
import React from 'react';
import './ExportButton.css';

export function ExportButton({ items }) {
  const handleExport = () => {
    const blob = new Blob(
      [JSON.stringify(items, null, 2)],
      { type: 'application/json' }
    );
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href  = url;
    link.download = `amlist_export_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      className="export-btn"
      onClick={handleExport}
      aria-label="Exportar lista a JSON"
      title="Exportar a JSON"
    >
      <span aria-hidden="true">⬇</span>
      <span>Exportar</span>
    </button>
  );
}
