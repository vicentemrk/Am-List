/**
 * presentation/components/SectionTabs/SectionTabs.jsx
 * Responsive filter tabs:
 *  - Mobile  (<768px): horizontal scrollable pills (Design A, no color badges)
 *  - Desktop (≥768px): underline indicator tabs (Design C, animated)
 */
import React, { useEffect, useRef } from 'react';
import { SECCIONES, SECCION_LABELS_SHORT } from '../../../domain/itemSchema.js';
import './SectionTabs.css';

export function SectionTabs({ activeSection, onSectionChange, counts }) {
  const navRef     = useRef(null);
  const activeRef  = useRef(null);
  const listRef    = useRef(null);

  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Keep the light indicator in sync with the active tab on resize, activeSection change, and SCROLL
  useEffect(() => {
    const nav  = navRef.current;
    const list = listRef.current;
    const tab  = activeRef.current;
    if (!nav || !tab || !list) return;

    const updateIndicator = () => {
      const navRect = nav.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      nav.style.setProperty('--indicator-left',  `${tabRect.left - navRect.left}px`);
      nav.style.setProperty('--indicator-width', `${tabRect.width}px`);
    };

    updateIndicator();

    const ro = new ResizeObserver(updateIndicator);
    ro.observe(nav);
    ro.observe(list);
    list.addEventListener('scroll', updateIndicator, { passive: true });
    window.addEventListener('resize', updateIndicator);

    return () => {
      ro.disconnect();
      list.removeEventListener('scroll', updateIndicator);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeSection]);

  // ── Drag to scroll handlers (using refs to avoid React re-renders) ─────────
  const handleMouseDown = (e) => {
    if (e.button !== 0 || !listRef.current) return;
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - listRef.current.offsetLeft;
    startScrollLeftRef.current = listRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isMouseDownRef.current || !listRef.current) return;
    const x = e.pageX - listRef.current.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
      listRef.current.scrollLeft = startScrollLeftRef.current - walk;
    }
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
  };

  const handleWheel = (e) => {
    if (e.deltaY !== 0 && listRef.current) {
      listRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleTabClick = (sec) => {
    if (!hasDraggedRef.current) {
      onSectionChange(sec);
    }
  };

  return (
    <nav className="section-tabs" aria-label="Secciones de la lista" ref={navRef}>
      {/* Desktop underline indicator — positioned by CSS custom props set above */}
      <span className="section-tabs__indicator" aria-hidden="true" />

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
                ref={isActive ? activeRef : null}
                className={`section-tabs__tab${isActive ? ' section-tabs__tab--active' : ''}`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${sec}`}
                onClick={() => handleTabClick(sec)}
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
