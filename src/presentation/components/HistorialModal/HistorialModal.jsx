/**
 * presentation/components/HistorialModal/HistorialModal.jsx
 * A full-screen drawer showing the chronological event history.
 */
import React, { useEffect } from 'react';
import { getAllHistory } from '../../../data/historyRepository.js';
import { ACCION_LABELS } from '../../../domain/historial.js';
import './HistorialModal.css';

export function HistorialModal({ onClose }) {
  // Load history at render time (not reactive — history is append-only)
  const history = getAllHistory().slice().reverse(); // newest first

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div
      className="historial-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Historial de cambios"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="historial-modal">
        <header className="historial-modal__header">
          <h2 className="historial-modal__title">📋 Historial</h2>
          <button
            className="historial-modal__close"
            onClick={onClose}
            aria-label="Cerrar historial"
          >✕</button>
        </header>

        {history.length === 0 ? (
          <p className="historial-modal__empty">Aún no hay eventos registrados.</p>
        ) : (
          <ol className="historial-modal__list" aria-label="Eventos en orden cronológico inverso">
            {history.map((entry) => (
              <li key={entry.id} className="historial-modal__entry">
                <div className="historial-modal__entry-main">
                  <span className={`historial-modal__action historial-action--${entry.accion}`}>
                    {ACCION_LABELS[entry.accion] ?? entry.accion}
                  </span>
                  <span className="historial-modal__item-title">{entry.titulo || entry.item_titulo}</span>
                  <span className="historial-modal__media">{entry.mediaType}</span>
                </div>
                {entry.detalles && (
                  <div className="historial-modal__detalles">
                    {entry.detalles}
                  </div>
                )}
                <time className="historial-modal__time" dateTime={entry.timestamp}>
                  {formatTime(entry.timestamp)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
