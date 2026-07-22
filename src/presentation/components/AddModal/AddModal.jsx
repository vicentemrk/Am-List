import React, { useEffect, useState } from 'react';
import { SearchPanel } from '../SearchPanel/SearchPanel.jsx';
import './AddModal.css';

export function AddModal({ isOpen, onClose, mediaType, onAdd, onRemove, existingIds }) {
  const [isMultiple, setIsMultiple] = useState(false);
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleAdd = (item) => {
    const res = onAdd(item);
    if (res?.success !== false && !isMultiple) {
      onClose();
    }
    return res;
  };

  if (!isOpen) return null;

  return (
    <div
      className="add-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Agregar ${mediaType}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="add-modal">
        <header className="add-modal__header">
          <h2 className="add-modal__title">
            Buscar y Agregar {mediaType === 'anime' ? 'Anime' : 'Manga'}
          </h2>
          <div className="add-modal__controls">
            <label className="add-modal__multiple-label">
              <input 
                type="checkbox" 
                checked={isMultiple} 
                onChange={(e) => setIsMultiple(e.target.checked)} 
              />
              Agregar múltiples
            </label>
            <button
              className="add-modal__close"
              onClick={onClose}
              aria-label="Cerrar ventana de búsqueda"
            >✕</button>
          </div>
        </header>

        <div className="add-modal__body">
          <SearchPanel
            mediaType={mediaType}
            onAdd={handleAdd}
            onRemove={onRemove}
            existingIds={existingIds}
          />
        </div>
      </div>
    </div>
  );
}
