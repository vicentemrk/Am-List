/**
 * presentation/components/SectionTabs/SectionTabs.jsx
 * ============================================================================
 * Qué hace:
 *   Pestañas de filtro con indicador inferior animado (Estructura B).
 *   Usa Framer Motion `layoutId` para que el indicador se mueva suavemente
 *   entre tabs al cambiar de sección. Cada tab adopta el color representativo
 *   de su estado via CSS custom property --tab-color.
 *
 * Cómo funciona:
 *   - `motion.span` con `layoutId="tab-indicator"` crea UN solo elemento DOM
 *     que Framer Motion interpola automáticamente entre posiciones.
 *   - El color del indicador se define en CSS via [data-section] → --tab-color.
 *   - Drag-to-scroll en escritorio para navegar con ratón.
 *   - Accesibilidad WAI-ARIA: role="tab", aria-selected, aria-controls.
 * ============================================================================
 */
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { SECCIONES, SECCION_LABELS_SHORT } from '../../../domain/itemSchema.js';
import './SectionTabs.css';

export function SectionTabs({ activeSection, onSectionChange, counts }) {
  const listRef = useRef(null);

  // ── Refs para drag-to-scroll sin re-renders ────────────────────────────────
  const isMouseDownRef    = useRef(false);
  const startXRef         = useRef(0);
  const startScrollLeft   = useRef(0);
  const hasDraggedRef     = useRef(false);

  const handleMouseDown = (e) => {
    if (e.button !== 0 || !listRef.current) return;
    isMouseDownRef.current  = true;
    hasDraggedRef.current   = false;
    startXRef.current       = e.pageX - listRef.current.offsetLeft;
    startScrollLeft.current = listRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isMouseDownRef.current || !listRef.current) return;
    const walk = e.pageX - listRef.current.offsetLeft - startXRef.current;
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current       = true;
      listRef.current.scrollLeft  = startScrollLeft.current - walk;
    }
  };

  const handleMouseUp = () => { isMouseDownRef.current = false; };

  const handleWheel = (e) => {
    if (e.deltaY !== 0 && listRef.current) {
      listRef.current.scrollLeft += e.deltaY;
    }
  };

  // Evitar que el click dispare si el usuario estaba arrastrando
  const handleTabClick = (sec) => {
    if (!hasDraggedRef.current) onSectionChange(sec);
  };

  return (
    <nav className="section-tabs" aria-label="Secciones de la lista">
      <ul
        className="section-tabs__list"
        role="tablist"
        ref={listRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {SECCIONES.map((sec) => {
          const isActive = activeSection === sec;
          return (
            <li key={sec} role="presentation">
              <button
                id={`tab-${sec}`}
                data-section={sec}
                className={`section-tabs__tab${isActive ? ' section-tabs__tab--active' : ''}`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${sec}`}
                onClick={() => handleTabClick(sec)}
              >
                {/* Label del tab */}
                <span className="section-tabs__label">{SECCION_LABELS_SHORT[sec]}</span>

                {/* Contador como superíndice (solo si hay ítems) */}
                {counts?.[sec] !== undefined && (
                  <sup className="section-tabs__count" aria-label={`${counts[sec]} ítems`}>
                    {counts[sec]}
                  </sup>
                )}

                {/* Indicador inferior animado — Framer Motion layoutId garantiza
                    una sola instancia que se interpola entre tabs activos */}
                {isActive && (
                  <motion.span
                    className="section-tabs__indicator"
                    layoutId="tab-indicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
