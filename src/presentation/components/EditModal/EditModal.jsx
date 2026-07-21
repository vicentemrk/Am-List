/**
 * presentation/components/EditModal/EditModal.jsx
 * A detailed view modal for editing all item properties (progress, status, score, tags).
 */
import React, { useEffect, useState } from 'react';
import { validarProgreso } from '../../../domain/validators.js';
import { ESTADOS_USUARIO, SCORE_RANGE } from '../../../domain/itemSchema.js';
import { X, Plus, Tv, BookOpen, Star } from 'lucide-react';
import './EditModal.css';

const MAX_TAGS = 5;

export function EditModal({ item, onClose, onUpdate }) {
  const [editError, setEditError] = useState('');
  const [newTag, setNewTag] = useState('');

  // Close on Escape key
  useEffect(() => {
    if (!item) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [item, onClose]);

  if (!item) return null;

  const tags = Array.isArray(item.tags) ? item.tags : [];
  const genres = Array.isArray(item.genres) ? item.genres : [];
  const progressMax = item.progreso.maximo != null ? item.progreso.maximo : '?';

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleProgressChange = (field, rawValue) => {
    const value = rawValue === '' ? 0 : Number(rawValue);
    const newProgreso = { ...item.progreso, [field]: isNaN(value) ? item.progreso[field] : value };
    const check = validarProgreso(newProgreso.actual, newProgreso.maximo);
    if (!check.valid) { setEditError(check.message); return; }
    setEditError('');
    onUpdate(item.id, { progreso: newProgreso });
  };

  const handleScore = (e) => {
    const val = e.target.value === '' ? null : Number(e.target.value);
    onUpdate(item.id, { puntuacion: val });
  };

  const handleStatus = (e) => onUpdate(item.id, { estadoUsuario: e.target.value });

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed || tags.length >= MAX_TAGS || tags.includes(trimmed)) return;
    onUpdate(item.id, { tags: [...tags, trimmed] });
    setNewTag('');
  };

  const handleRemoveTag = (tag) => {
    onUpdate(item.id, { tags: tags.filter((t) => t !== tag) });
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }
  };

  return (
    <div
      className="edit-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Editar ${item.titulo}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="edit-modal">
        <header className="edit-modal__header">
          <h2 className="edit-modal__title">Detalles de {item.mediaType === 'anime' ? 'Anime' : 'Manga'}</h2>
          <button className="edit-modal__close" onClick={onClose} aria-label="Cerrar modal de edición">
            <X size={20} />
          </button>
        </header>

        <div className="edit-modal__body">
          {/* Header Info */}
          <div className="edit-modal__info-row">
            {item.imagen ? (
              <img src={item.imagen} alt={`Portada de ${item.titulo}`} className="edit-modal__thumb" />
            ) : (
              <div className="edit-modal__thumb edit-modal__thumb--placeholder">
                {item.mediaType === 'anime' ? <Tv size={32} /> : <BookOpen size={32} />}
              </div>
            )}
            <div className="edit-modal__info-text">
              <h3 className="edit-modal__item-title">{item.titulo}</h3>
              
              {item.scoreApi && (
                <div className="edit-modal__api-score">
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span>{item.scoreApi} (Nota de la comunidad)</span>
                </div>
              )}

              {genres.length > 0 && (
                <div className="edit-modal__genres">
                  {genres.map((g) => <span key={g} className="edit-modal__genre-pill">{g}</span>)}
                </div>
              )}

              {item.sinopsis && (
                <p className="edit-modal__sinopsis">{item.sinopsis}</p>
              )}
            </div>
          </div>

          <div className="edit-modal__divider" />

          {/* Controls */}
          <div className="edit-modal__controls">
            <div className="edit-modal__control-group">
              <label className="edit-modal__label" htmlFor={`modal-status-${item.id}`}>Estado</label>
              <select
                id={`modal-status-${item.id}`}
                className="edit-modal__input"
                value={item.estadoUsuario}
                onChange={handleStatus}
              >
                {ESTADOS_USUARIO.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="edit-modal__control-group">
              <label className="edit-modal__label" htmlFor={`modal-score-${item.id}`}>Puntuación</label>
              <select
                id={`modal-score-${item.id}`}
                className="edit-modal__input"
                value={item.puntuacion ?? ''}
                onChange={handleScore}
              >
                <option value="">--</option>
                {SCORE_RANGE.map((n) => (
                  <option key={n} value={n}>{n} ★</option>
                ))}
              </select>
            </div>
          </div>

          <div className="edit-modal__control-group edit-modal__control-group--progress">
            <label className="edit-modal__label" htmlFor={`modal-prog-actual-${item.id}`}>Progreso ({progressMax} totales)</label>
            <div className="edit-modal__progress-inputs">
              <input
                id={`modal-prog-actual-${item.id}`}
                className="edit-modal__input edit-modal__input--small"
                type="number" min="0"
                max={item.progreso.maximo ?? 9999}
                value={item.progreso.actual}
                onChange={(e) => handleProgressChange('actual', e.target.value)}
                title="Vistos/Leídos"
              />
              <span className="edit-modal__progress-sep">/</span>
              <input
                id={`modal-prog-max-${item.id}`}
                className="edit-modal__input edit-modal__input--small"
                type="number" min="0" max="9999"
                value={item.progreso.maximo ?? ''}
                placeholder="?"
                onChange={(e) => handleProgressChange('maximo', e.target.value === '' ? null : e.target.value)}
                title="Total (editar si es incorrecto)"
              />
            </div>
          </div>

          {editError && <p className="edit-modal__error" role="alert">⚠ {editError}</p>}

          <div className="edit-modal__divider" />

          {/* Personal Description */}
          <div className="edit-modal__control-group">
            <label className="edit-modal__label" htmlFor={`modal-desc-${item.id}`}>Descripción Personal</label>
            <textarea
              id={`modal-desc-${item.id}`}
              className="edit-modal__input edit-modal__textarea"
              value={item.descripcionPersonal || ''}
              onChange={(e) => onUpdate(item.id, { descripcionPersonal: e.target.value })}
              placeholder="¿Qué te pareció?"
              rows={3}
            />
          </div>

          <div className="edit-modal__divider" />

          {/* Tags */}
          <div className="edit-modal__tags-editor">
            <label className="edit-modal__label">Etiquetas Personales</label>
            <div className="edit-modal__tags-list">
              {tags.map((t) => (
                <span key={t} className="edit-modal__tag-edit">
                  #{t}
                  <button
                    className="edit-modal__tag-remove"
                    onClick={() => handleRemoveTag(t)}
                    aria-label={`Quitar etiqueta ${t}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {tags.length < MAX_TAGS && (
                <div className="edit-modal__tag-input-wrap">
                  <input
                    className="edit-modal__tag-input"
                    type="text"
                    value={newTag}
                    maxLength={20}
                    placeholder="Nueva etiqueta…"
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    aria-label="Nueva etiqueta"
                  />
                  <button
                    className="edit-modal__tag-add-btn"
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                    aria-label="Agregar etiqueta"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>
            {tags.length >= MAX_TAGS && (
              <span className="edit-modal__tag-limit">Límite alcanzado (Máx. {MAX_TAGS} etiquetas)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
