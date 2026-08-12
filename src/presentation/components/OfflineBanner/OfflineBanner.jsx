/**
 * presentation/components/OfflineBanner/OfflineBanner.jsx
 * Banner no intrusivo que aparece cuando el usuario pierde conexión.
 * Desaparece automáticamente al recuperar la red.
 */
import React from 'react';
import { WifiOff } from 'lucide-react';
import './OfflineBanner.css';

/**
 * @param {{ isOnline: boolean }} props
 */
export function OfflineBanner({ isOnline }) {
  if (isOnline) return null;

  return (
    <div className="offline-banner" role="status" aria-live="assertive">
      <WifiOff size={14} className="offline-banner__icon" />
      <span className="offline-banner__text">
        Sin conexión — La app sigue funcionando localmente
      </span>
    </div>
  );
}
