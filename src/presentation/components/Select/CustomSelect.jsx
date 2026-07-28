/**
 * presentation/components/Select/CustomSelect.jsx
 * ============================================================================
 * Qué hace:
 *   Un selector personalizado sobre @radix-ui/react-select siguiendo el diseño
 *   limpio y sobrio de Material Design 3. Reemplaza los <select> nativos.
 *
 * Características:
 *   - Totalmente accesible via Radix UI (teclado, aria-expanded, aria-activedescendant).
 *   - Menú flotante elevado con sombra MD3 limpia sin resplandor.
 *   - Indicador de item seleccionado con icono Check.
 * ============================================================================
 */

import React from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import './CustomSelect.css';

/**
 * @param {object} props
 * @param {string} props.value - Valor seleccionado
 * @param {(val: string) => void} props.onValueChange - Callback de cambio
 * @param {Array<{value: string, label: string}>} props.options - Opciones
 * @param {string} [props.placeholder] - Texto placeholder si está vacío
 * @param {string} [props.id] - ID para accesibilidad (labels)
 * @param {string} [props.ariaLabel] - Aria label si no hay <label> explícito
 * @param {string} [props.className] - Clase opcional adicional
 */
export function CustomSelect({
  value,
  onValueChange,
  options = [],
  placeholder = 'Seleccionar...',
  id,
  ariaLabel,
  className = '',
}) {
  return (
    <Select.Root value={value ?? ''} onValueChange={onValueChange}>
      <Select.Trigger
        id={id}
        className={`custom-select-trigger ${className}`}
        aria-label={ariaLabel}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="custom-select-icon">
          <ChevronDown size={16} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="custom-select-content" position="popper" sideOffset={4}>
          <Select.Viewport className="custom-select-viewport">
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={String(opt.value)}
                className="custom-select-item"
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator className="custom-select-item-indicator">
                  <Check size={14} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
