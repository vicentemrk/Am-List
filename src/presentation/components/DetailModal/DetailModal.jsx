/**
 * ============================================================================
 * COMPONENTE: presentation/components/DetailModal/DetailModal.jsx
 * ============================================================================
 * Qué hace:
 *   Modal de Vista de Detalle Expandida con efectos visuales estilo Aceternity UI.
 *   Muestra la sinopsis completa, géneros como pills, notas comparativas (comunidad vs personal),
 *   progreso visual y botón de incremento rápido `+1`.
 * 
 * Cómo funciona:
 *   - Utiliza `framer-motion` para transiciones suaves de entrada y salida (`AnimatePresence`).
 *   - Escucha la tecla `Escape` y clics en el backdrop para cerrar.
 *   - Cumple con atributos de accesibilidad WAI-ARIA (`role="dialog"`, `aria-modal="true"`).
 * ============================================================================
 */

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Plus, Tag } from 'lucide-react';
import { ESTADOS_USUARIO, ESTADOS_EMISION } from '../../../domain/itemSchema.js';

import './DetailModal.css';

/**
 * Propiedades del componente DetailModal.
 * 
 * @param {object} props
 * @param {object|null} props.item - Objeto del anime/manga a detallar.
 * @param {boolean} props.isOpen - Indica si el modal está abierto.
 * @param {() => void} props.onClose - Función para cerrar el modal.
 * @param {(id: string, patch: object) => void} props.onUpdate - Función para actualizar el ítem.
 */
export function DetailModal({ item, isOpen, onClose, onUpdate }) {
  // Manejo de atajo de teclado: Tecla Escape para cerrar
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Bloquear scroll del fondo
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !item) return null;

  // Cálculo de estado y etiquetas amigables
  const estadoLabel = ESTADOS_USUARIO.find((e) => e.value === item.estadoUsuario)?.label ?? item.estadoUsuario;
  const emisionLabel = ESTADOS_EMISION.find((e) => e.value === item.estadoEmision)?.label ?? item.estadoEmision;

  // Operación rápida de incremento +1 episodio
  const handlePlusOne = () => {
    const actual = item.progreso?.actual ?? 0;
    const maximo = item.progreso?.maximo;

    if (maximo !== null && actual >= maximo) return;

    onUpdate(item.id, {
      progreso: { ...item.progreso, actual: actual + 1 },
    });
  };

  const isMaxReached = item.progreso?.maximo !== null && (item.progreso?.actual ?? 0) >= item.progreso?.maximo;

  return (
    <AnimatePresence>
      <div className="detail-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
        <motion.div
          className="detail-modal-card"
          onClick={(e) => e.stopPropagation()} // Detener propagación para no cerrar al hacer clic adentro
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {/* Cabecera del Modal */}
          <div className="detail-modal-header">
            <div>
              <h2 className="detail-modal-title">{item.titulo}</h2>
              <div className="detail-modal-meta-row" style={{ marginTop: '0.5rem' }}>
                <span className="detail-badge detail-badge--purple">{estadoLabel}</span>
                <span className="detail-badge detail-badge--gold">{emisionLabel}</span>
              </div>
            </div>
            <button className="detail-modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
              <X size={20} />
            </button>
          </div>

          {/* Cuerpo Principal */}
          <div className="detail-modal-body">
            {/* Portada y datos rápidos */}
            <div className="detail-modal-cover-container">
              <img
                src={item.imagen || '/placeholder.png'}
                alt={`Portada de ${item.titulo}`}
                className="detail-modal-cover"
              />
              <div className="detail-modal-meta-row" style={{ justifyContent: 'center' }}>
                {item.puntuacion && (
                  <span className="detail-badge detail-badge--purple">
                    <Star size={14} /> Tu nota: {item.puntuacion}/10
                  </span>
                )}
              </div>
            </div>

            {/* Información Detallada */}
            <div className="detail-modal-info">
              {/* Géneros */}
              {item.genres && item.genres.length > 0 && (
                <div className="detail-modal-genres">
                  {item.genres.map((genre) => (
                    <span key={genre} className="genre-pill">
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Sinopsis completa */}
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  Sinopsis
                </h3>
                <p className="detail-modal-synopsis">
                  {item.sinopsis || 'Sin sinopsis disponible para este título.'}
                </p>
              </div>

              {/* Etiquetas del usuario */}
              {item.tags && item.tags.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Tag size={14} /> Etiquetas
                  </h3>
                  <div className="detail-modal-genres">
                    {item.tags.map((tag) => (
                      <span key={tag} className="genre-pill" style={{ background: 'rgba(86,44,167,0.08)', color: 'var(--accent-completado)' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pie de modal con acciones rápidas */}
          <div className="detail-modal-actions">
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                Progreso actual: <strong>{item.progreso?.actual ?? 0}</strong> / {item.progreso?.maximo ?? '∞'}{' '}
                {item.mediaType === 'anime' ? 'episodios' : 'capítulos'}
              </span>
            </div>
            <button
              className="quick-plus-one-btn"
              onClick={handlePlusOne}
              disabled={isMaxReached}
              title="Aumentar en 1 episodio visto"
            >
              <Plus size={16} /> +1 Episodio
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
