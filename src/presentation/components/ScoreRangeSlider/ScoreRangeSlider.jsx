/**
 * presentation/components/ScoreRangeSlider/ScoreRangeSlider.jsx
 * Slider dual de rango para filtrar por puntuación personal (1-10).
 * Construido con Radix UI Slider (@radix-ui/react-slider).
 */
import React from 'react';
import * as Slider from '@radix-ui/react-slider';
import './ScoreRangeSlider.css';

/**
 * @param {{ min: number, max: number, onChange: (min: number, max: number) => void }} props
 */
export function ScoreRangeSlider({ min, max, onChange }) {
  const isActive = !(min === 1 && max === 10);

  const handleValueChange = ([newMin, newMax]) => {
    onChange(newMin, newMax);
  };

  const handleReset = () => onChange(1, 10);

  const labelText = isActive ? `${min} – ${max}` : '1 – 10';

  return (
    <div
      className={'score-slider' + (isActive ? ' score-slider--active' : '')}
      aria-label="Filtrar por puntuación personal"
    >
      <span className="score-slider__label">
        {'⭐'} {labelText}
      </span>
      <Slider.Root
        className="score-slider__root"
        value={[min, max]}
        onValueChange={handleValueChange}
        min={1}
        max={10}
        step={1}
        minStepsBetweenThumbs={0}
        aria-label="Rango de puntuación personal"
      >
        <Slider.Track className="score-slider__track">
          <Slider.Range className="score-slider__range" />
        </Slider.Track>
        <Slider.Thumb className="score-slider__thumb" aria-label="Puntuación mínima" />
        <Slider.Thumb className="score-slider__thumb" aria-label="Puntuación máxima" />
      </Slider.Root>
      {isActive && (
        <button
          className="score-slider__reset"
          onClick={handleReset}
          aria-label="Limpiar filtro de puntuación"
          title="Limpiar filtro"
        >
          {'×'}
        </button>
      )}
    </div>
  );
}

