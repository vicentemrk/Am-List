import React from 'react';
import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css';

export function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={isDark ? 'Tema claro' : 'Tema oscuro'}
    >
      {isDark
        ? <Sun size={18} strokeWidth={2} />
        : <Moon size={18} strokeWidth={2} />
      }
    </button>
  );
}
