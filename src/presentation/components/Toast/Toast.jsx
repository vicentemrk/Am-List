import { AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { message, type = 'success', action } = toast;

  return (
    <div className={`toast-container toast-container--${type}`} role="status" aria-live="polite">
      <div className="toast-content">
        {type === 'error' && <AlertCircle className="toast-icon" size={18} />}
        {type === 'info' && <Info className="toast-icon" size={18} />}
        <span className="toast-message">{message}</span>
      </div>
      {action && (
        <button className="toast-action-btn" onClick={action.onClick}>
          {action.label}
        </button>
      )}
      <button className="toast-close" onClick={onClose} aria-label="Cerrar notificación">
        <X size={14} />
      </button>
    </div>
  );
}
