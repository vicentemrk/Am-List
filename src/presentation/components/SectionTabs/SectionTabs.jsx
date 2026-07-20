/**
 * presentation/components/SectionTabs/SectionTabs.jsx
 * Horizontal scrollable tabs for the 8 navigable sections.
 */
import React from 'react';
import { SECCIONES, SECCION_LABELS } from '../../../domain/itemSchema.js';
import './SectionTabs.css';

export function SectionTabs({ activeSection, onSectionChange, counts }) {
  return (
    <nav className="section-tabs" aria-label="Secciones de la lista">
      <ul className="section-tabs__list" role="tablist">
        {SECCIONES.map((sec) => (
          <li key={sec} role="presentation">
            <button
              id={`tab-${sec}`}
              className={`section-tabs__tab${activeSection === sec ? ' section-tabs__tab--active' : ''}`}
              role="tab"
              aria-selected={activeSection === sec}
              aria-controls={`panel-${sec}`}
              onClick={() => onSectionChange(sec)}
            >
              {SECCION_LABELS[sec]}
              {counts?.[sec] !== undefined && (
                <span className="section-tabs__count" aria-label={`${counts[sec]} ítems`}>
                  {counts[sec]}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
