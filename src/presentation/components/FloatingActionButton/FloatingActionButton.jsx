import React from 'react';
import { Plus } from 'lucide-react';
import './FloatingActionButton.css';

export function FloatingActionButton({ onClick, ariaLabel }) {
  return (
    <button
      className="fab-button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <Plus size={24} />
    </button>
  );
}
