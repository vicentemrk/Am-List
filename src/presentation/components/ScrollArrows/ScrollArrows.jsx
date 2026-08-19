/**
 * presentation/components/ScrollArrows/ScrollArrows.jsx
 * ============================================================================
 * Qué hace:
 *   Dos botones flotantes fijos en la esquina inferior-derecha que permiten
 *   navegar al inicio y al final de la página con un click.
 *   Solo aparecen cuando hay suficiente contenido para hacer scroll.
 * ============================================================================
 */
import React, { useEffect, useState, useCallback } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import './ScrollArrows.css';

export function ScrollArrows() {
  const [visible, setVisible] = useState(false);

  const checkVisibility = useCallback(() => {
    // Solo mostrar si la página es más alta que la ventana + 20% de margen
    const scrollable = document.documentElement.scrollHeight > window.innerHeight * 1.2;
    setVisible(scrollable);
  }, []);

  useEffect(() => {
    checkVisibility();
    window.addEventListener('resize', checkVisibility);
    // También verificar al montar por si el contenido cambia
    const observer = new ResizeObserver(checkVisibility);
    observer.observe(document.body);
    return () => {
      window.removeEventListener('resize', checkVisibility);
      observer.disconnect();
    };
  }, [checkVisibility]);

  if (!visible) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="scroll-arrows" aria-label="Navegación rápida de página">
      <button
        className="scroll-arrows__btn scroll-arrows__btn--up"
        onClick={scrollToTop}
        aria-label="Ir al inicio de la página"
        title="Ir arriba"
      >
        <ArrowUp size={18} />
      </button>
      <button
        className="scroll-arrows__btn scroll-arrows__btn--down"
        onClick={scrollToBottom}
        aria-label="Ir al final de la página"
        title="Ir abajo"
      >
        <ArrowDown size={18} />
      </button>
    </div>
  );
}
