/**
 * presentation/components/SectionTabs/SectionTabs.jsx
 * Responsive filter tabs:
 *  - Mobile  (<768px): horizontal scrollable pills (Design A, no color badges)
 *  - Desktop (≥768px): underline indicator tabs (Design C, animated)
 */
import React, { useEffect, useRef, useState } from 'react';
import { SECCIONES, SECCION_LABELS_SHORT } from '../../../domain/itemSchema.js';
import './SectionTabs.css';

export function SectionTabs({ activeSection, onSectionChange, counts }) {
  const navRef     = useRef(null);
  const activeRef  = useRef(null);
  const listRef    = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Move the underline indicator to match the active tab (desktop only)
  useEffect(() => {
    const nav = navRef.current;
    const tab = activeRef.current;
    if (!nav || !tab) return;

    const update = () => {
      const navRect = nav.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      nav.style.setProperty('--indicator-left',  `${tabRect.left - navRect.left + nav.scrollLeft}px`);
      nav.style.setProperty('--indicator-width', `${tabRect.width}px`);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(nav);
    return () => ro.disconnect();
  }, [activeSection]);

  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - listRef.current.offsetLeft);
    setScrollLeft(listRef.current.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - listRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast
    listRef.current.scrollLeft = scrollLeft - walk;
  };

  const onWheel = (e) => {
    if (e.deltaY !== 0) {
      listRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <nav className="section-tabs" aria-label="Secciones de la lista" ref={navRef}>
      {/* Desktop underline indicator — positioned by CSS custom props set above */}
      <span className="section-tabs__indicator" aria-hidden="true" />

      <ul 
        className={`section-tabs__list ${isDragging ? 'section-tabs__list--dragging' : ''}`} 
        role="tablist"
        ref={listRef}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onWheel={onWheel}
      >
        {SECCIONES.map((sec) => {
          const isActive = activeSection === sec;
          return (
            <li key={sec} role="presentation">
              <button
                id={`tab-${sec}`}
                ref={isActive ? activeRef : null}
                className={`section-tabs__tab${isActive ? ' section-tabs__tab--active' : ''}`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${sec}`}
                onClick={() => onSectionChange(sec)}
              >
                <span className="section-tabs__label">{SECCION_LABELS_SHORT[sec]}</span>
                {counts?.[sec] !== undefined && (
                  <span className="section-tabs__count" aria-label={`${counts[sec]} ítems`}>
                    {counts[sec]}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
