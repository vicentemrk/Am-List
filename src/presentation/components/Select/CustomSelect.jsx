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
 *   - v1.3: Soporte para separadores visuales con `{ type: 'separator' }` en options.
 *   - v1.3: Soporte para `checkedValues` — items que muestran check visual aunque
 *     no sean el valor principal del select (útil para opciones ASC/DESC en ordenamiento).
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
 * @param {Array<{value: string, label: string} | {type: 'separator'}>} props.options - Opciones (o separadores)
 * @param {string[]} [props.checkedValues] - Valores adicionales a marcar como activos (visualmente)
 * @param {string} [props.placeholder] - Texto placeholder si está vacío
 * @param {string} [props.id] - ID para accesibilidad (labels)
 * @param {string} [props.ariaLabel] - Aria label si no hay <label> explícito
 * @param {string} [props.className] - Clase opcional adicional
 */
export function CustomSelect({
  value,
  onValueChange,
  options = [],
  checkedValues = [],
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
            {options.map((opt, index) => {
              // Renderizar separador visual
              if (opt.type === 'separator') {
                return <Select.Separator key={`sep-${index}`} className="custom-select-separator" />;
              }

              // Determinar si este item debe mostrar check visual adicional (ej: dirección ASC/DESC)
              const isSecondaryChecked = checkedValues.includes(String(opt.value));

              return (
                <Select.Item
                  key={opt.value}
                  value={String(opt.value)}
                  className={`custom-select-item${isSecondaryChecked ? ' custom-select-item--secondary-checked' : ''}`}
                >
                  <Select.ItemText>{opt.label}</Select.ItemText>
                  {/* Checkmark para el valor principal seleccionado */}
                  <Select.ItemIndicator className="custom-select-item-indicator">
                    <Check size={14} />
                  </Select.ItemIndicator>
                  {/* Checkmark secundario para checkedValues (ej: dirección activa) */}
                  {isSecondaryChecked && (
                    <span className="custom-select-secondary-indicator" aria-hidden="true">
                      <Check size={14} />
                    </span>
                  )}
                </Select.Item>
              );
            })}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
