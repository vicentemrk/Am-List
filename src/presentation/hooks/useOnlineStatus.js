/**
 * presentation/hooks/useOnlineStatus.js
 * Hook que monitorea el estado de conectividad del navegador.
 * Escucha los eventos nativos 'online' y 'offline' del window.
 */
import { useState, useEffect } from 'react';

/**
 * @returns {boolean} true si el navegador tiene conexión a internet, false si está offline.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
