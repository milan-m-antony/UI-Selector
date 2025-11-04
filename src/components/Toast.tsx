import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ message, type = 'info', onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // allow messages with optional description separated by a `|` character
  const [title, desc] = message.split('|', 2);

  const actionLabel = type === 'success' ? 'Got It!' : type === 'error' ? 'Fixing!' : 'OK';

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-left">
        <div className={`toast-icon toast-icon-${type}`} aria-hidden>
          {type === 'success' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {type === 'error' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94A2 2 0 0 0 23 18L14.53 3.86a2 2 0 0 0-3.24 0z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 9v4" strokeLinecap="round" />
              <path d="M12 17h.01" strokeLinecap="round" />
            </svg>
          )}
          {type === 'info' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeLinecap="round" />
              <path d="M12 16v-4" strokeLinecap="round" />
              <path d="M12 8h.01" strokeLinecap="round" />
            </svg>
          )}
        </div>
      </div>

      <div className="toast-content">
        <div className="toast-title">{title?.trim() || 'Notification'}</div>
        <div className="toast-desc">{desc?.trim() || 'Notification description will be here'}</div>
      </div>

      <div className="toast-right">
        <button className="toast-action" onClick={onClose}>{actionLabel}</button>
      </div>
    </div>
  );
};

