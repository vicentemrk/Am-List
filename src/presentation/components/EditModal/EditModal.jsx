/**
 * presentation/components/EditModal/EditModal.jsx
 * ============================================================================
 * Qué hace:
 *   Modal de edición de propiedades de un ítem (progreso, estado, puntuación,
 *   etiquetas, descripción personal). Migrado a Radix UI Dialog para accesi-
 *   bilidad correcta: focus trap, Escape, aria-modal, body scroll lock.
 * Cómo funciona:
 *   - `Dialog.Root` controla open/close via prop `open` (controlado).
 *   - `Dialog.Portal` → `Dialog.Overlay` → `Dialog.Content` forman el stack.
 *   - v1.3: 'favorito' y 'en_emision' son estadoUsuario válidos.
 *     El campo estadoEmision de la API se conserva en el objeto pero NO se
 *     muestra en UI — la app ignora completamente lo que diga la API de airing.
 * ============================================================================
 */
import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { validarProgreso } from '../../../domain/validators.js';
import { ESTADOS_USUARIO, SCORE_RANGE, TIPOS_MANGA, TIPOS_ANIME, getItemType } from '../../../domain/itemSchema.js';
import { CustomSelect } from '../Select/CustomSelect.jsx';
import { X, Plus, Tv, BookOpen, Star } from 'lucide-react';
import './EditModal.css';

const MAX_TAGS = 5;
const SCORE_OPTIONS = [
  { value: '', label: '--' },
  ...SCORE_RANGE.map((n) => ({ value: String(n), label: `${n} ★` })),
];

export function EditModal({ item, onClose, onUpdate }) {
  const [draft, setDraft] = useState(null);
  const [editError, setEditError] = useState('');
  const [newTag, setNewTag] = useState('');

  // Sincroniza el draft cuando cambia el ítem seleccionado
  useEffect(() => {
    if (item) {
      setDraft(JSON.parse(JSON.stringify(item)));
      setEditError('');
      setNewTag('');
    } else {
      setDraft(null);
    }
  }, [item]);

  if (!item || !draft) return null;

  const tags = Array.isArray(draft.tags) ? draft.tags : [];
  const genres = Array.isArray(draft.genres) ? draft.genres : [];
  const progressMax = draft.progreso?.maximo != null ? draft.progreso.maximo : '?';
  const tipoOptions = draft.mediaType === 'manga' ? TIPOS_MANGA : TIPOS_ANIME;
  const currentTipo = draft.tipo || getItemType(draft);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSave = () => {
    const check = validarProgreso(draft.progreso?.actual ?? 0, draft.progreso?.maximo ?? null);
    if (!check.valid) {
      setEditError(check.message);
      return;
    }
    // Sincronizar favorito boolean con estadoUsuario al guardar
    const isFavorito = draft.estadoUsuario === 'favorito';
    onUpdate(item.id, {
      tipo: draft.tipo || currentTipo,
      estadoUsuario: draft.estadoUsuario,
      estadoAnterior: draft.estadoAnterior ?? '',
      favorito: isFavorito,
      puntuacion: draft.puntuacion,
      progreso: draft.progreso,
      descripcionPersonal: draft.descripcionPersonal,
      tags: draft.tags,
    });
    onClose();
  };

  const handleProgressChange = (field, rawValue) => {
    const value = rawValue === '' ? 0 : Number(rawValue);
    setDraft((prev) => ({
      ...prev,
      progreso: {
        ...prev.progreso,
        [field]: field === 'maximo' && rawValue === '' ? null : (isNaN(value) ? 0 : value),
      },
    }));
  };

  const handleStatus = (newStatus) => {
    setDraft((prev) => ({
      ...prev,
      estadoUsuario: newStatus,
      // Si el usuario elige 'favorito', marcar favorito boolean también
      favorito: newStatus === 'favorito' ? true : prev.favorito,
    }));
  };

  const handleTipo = (newTipo) => {
    setDraft((prev) => ({
      ...prev,
      tipo: newTipo,
    }));
  };

  const handleScore = (val) => {
    const num = val === '' ? null : Number(val);
    setDraft((prev) => ({ ...prev, puntuacion: num }));
  };

  const handleToggleFavorito = () => {
    setDraft((prev) => {
      const nextFav = !prev.favorito;
      return {
        ...prev,
        favorito: nextFav,
        estadoUsuario: nextFav ? 'favorito' : (prev.estadoUsuario === 'favorito' ? 'por_ver' : prev.estadoUsuario),
        estadoAnterior: nextFav ? (prev.estadoUsuario !== 'favorito' ? prev.estadoUsuario : prev.estadoAnterior) : '',
      };
    });
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const clean = newTag.trim();
    if (!clean) return;
    if (tags.length >= MAX_TAGS) return;
    if (tags.includes(clean)) return;

    setDraft((prev) => ({ ...prev, tags: [...tags, clean] }));
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setDraft((prev) => ({ ...prev, tags: tags.filter((t) => t !== tagToRemove) }));
  };

  const handleDescriptionChange = (e) => {
    setDraft((prev) => ({ ...prev, descripcionPersonal: e.target.value }));
  };

  return (
    <Dialog.Root open={Boolean(item)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        {/* ── Overlay (backdrop) ── */}
        <Dialog.Overlay className="edit-modal-overlay" />

        {/* ── Contenido del modal ── */}
        <Dialog.Content
          className="edit-modal"
          aria-describedby="edit-modal-desc"
          onEscapeKeyDown={onClose}
          onPointerDownOutside={onClose}
        >
          <Dialog.Title asChild>
            <VisuallyHidden>Editar {draft.titulo}</VisuallyHidden>
          </Dialog.Title>
          <Dialog.Description asChild>
            <VisuallyHidden id="edit-modal-desc">
              Formulario para editar estado, progreso, puntuación y etiquetas de {draft.titulo}
            </VisuallyHidden>
          </Dialog.Description>

          <header className="edit-modal__header">
            <h2 className="edit-modal__title">Detalles de {currentTipo}</h2>
            <Dialog.Close asChild>
              <button
                className="edit-modal__close"
                onClick={handleSave}
                aria-label="Aceptar y guardar cambios"
                title="Aceptar cambios"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </header>

          <div className="edit-modal__body">
            {/* Header Info */}
            <div className="edit-modal__info-row">
              <div className="edit-modal__thumb-wrap">
                {draft.imagen ? (
                  <img src={draft.imagen} alt={`Portada de ${draft.titulo}`} className="edit-modal__thumb" />
                ) : (
                  <div className="edit-modal__thumb edit-modal__thumb--placeholder">
                    {draft.mediaType === 'anime' ? <Tv size={32} /> : <BookOpen size={32} />}
                  </div>
                )}
                <button
                  className={`edit-modal__fav-btn${draft.favorito ? ' edit-modal__fav-btn--active' : ''}`}
                  onClick={handleToggleFavorito}
                  aria-label={draft.favorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
                  title={draft.favorito ? 'Favorito' : 'Marcar como favorito'}
                >
                  <Star size={18} fill={draft.favorito ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="edit-modal__info-text">
                <h3 className="edit-modal__item-title">{draft.titulo}</h3>

                {draft.scoreApi && (
                  <div className="edit-modal__api-score">
                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    <span>{draft.scoreApi} (Nota de la comunidad)</span>
                  </div>
                )}

                {genres.length > 0 && (
                  <div className="edit-modal__genres">
                    {genres.map((g) => <span key={g} className="edit-modal__genre-pill">{g}</span>)}
                  </div>
                )}

                {draft.sinopsis && (
                  <p className="edit-modal__sinopsis">{draft.sinopsis}</p>
                )}
              </div>
            </div>

            <div className="edit-modal__divider" />

            {/* Row 1: Tu Estado (Lista) + Tipo / Formato */}
            <div className="edit-modal__controls">
              <div className="edit-modal__control-group">
                <label className="edit-modal__label" htmlFor={`modal-status-${draft.id}`}>Tu Estado (Lista)</label>
                <CustomSelect
                  id={`modal-status-${draft.id}`}
                  value={draft.estadoUsuario}
                  onValueChange={handleStatus}
                  options={ESTADOS_USUARIO}
                />
              </div>

              <div className="edit-modal__control-group">
                <label className="edit-modal__label" htmlFor={`modal-tipo-${draft.id}`}>Tipo / Formato</label>
                <CustomSelect
                  id={`modal-tipo-${draft.id}`}
                  value={currentTipo}
                  onValueChange={handleTipo}
                  options={tipoOptions}
                />
              </div>
            </div>

            {/* Row 2: Puntuación + Favorito */}
            <div className="edit-modal__controls" style={{ marginTop: '0.75rem' }}>
              <div className="edit-modal__control-group">
                <label className="edit-modal__label" htmlFor={`modal-score-${draft.id}`}>Puntuación</label>
                <CustomSelect
                  id={`modal-score-${draft.id}`}
                  value={draft.puntuacion != null ? String(draft.puntuacion) : ''}
                  onValueChange={handleScore}
                  options={SCORE_OPTIONS}
                />
              </div>

              <div className="edit-modal__control-group">
                <label className="edit-modal__label">Favorito</label>
                <button
                  type="button"
                  className={`edit-modal__fav-toggle-btn${draft.favorito ? ' edit-modal__fav-toggle-btn--active' : ''}`}
                  onClick={handleToggleFavorito}
                  aria-pressed={draft.favorito}
                  title={draft.favorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
                >
                  <Star size={16} fill={draft.favorito ? 'currentColor' : 'none'} />
                  <span>{draft.favorito ? 'Favorito' : 'No favorito'}</span>
                </button>
              </div>
            </div>

            {/* Row 3: Progreso */}
            <div className="edit-modal__controls" style={{ marginTop: '0.75rem' }}>
              <div className="edit-modal__control-group edit-modal__control-group--progress" style={{ gridColumn: '1 / -1' }}>
                <label className="edit-modal__label" htmlFor={`modal-prog-actual-${draft.id}`}>Progreso ({progressMax} totales)</label>
                <div className="edit-modal__progress-inputs">
                  <input
                    id={`modal-prog-actual-${draft.id}`}
                    className="edit-modal__input edit-modal__input--small"
                    type="number" min="0"
                    max={draft.progreso.maximo ?? 9999}
                    value={draft.progreso.actual}
                    onChange={(e) => handleProgressChange('actual', e.target.value)}
                    title="Vistos/Leídos"
                  />
                  <span className="edit-modal__progress-sep">/</span>
                  <input
                    id={`modal-prog-max-${draft.id}`}
                    className="edit-modal__input edit-modal__input--small"
                    type="number" min="0" max="9999"
                    value={draft.progreso.maximo ?? ''}
                    placeholder="?"
                    onChange={(e) => handleProgressChange('maximo', e.target.value)}
                    title="Total (editar si es incorrecto)"
                  />
                </div>
              </div>
            </div>

            {editError && <p className="edit-modal__error" role="alert">⚠ {editError}</p>}

            <div className="edit-modal__divider" />

            {/* Personal Description */}
            <div className="edit-modal__control-group">
              <label className="edit-modal__label" htmlFor={`modal-desc-${draft.id}`}>Descripción Personal</label>
              <textarea
                id={`modal-desc-${draft.id}`}
                className="edit-modal__input edit-modal__textarea"
                value={draft.descripcionPersonal || ''}
                onChange={handleDescriptionChange}
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

          <footer className="edit-modal__footer">
            <Dialog.Close asChild>
              <button className="edit-modal__btn edit-modal__btn--cancel" onClick={onClose}>
                Cancelar
              </button>
            </Dialog.Close>
            <button className="edit-modal__btn edit-modal__btn--save" onClick={handleSave}>
              Aceptar
            </button>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
