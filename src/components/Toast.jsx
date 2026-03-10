import { createContext, useContext, useState, useCallback } from 'react';
import { Icon } from './Icon';
import './Toast.css';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(type === 'success' ? 50 : 100);
    }

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const toast = {
    success: (message) => addToast(message, 'success'),
    error: (message) => addToast(message, 'error'),
    info: (message) => addToast(message, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <ToastItem key={t.id} {...t} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ message, type }) {
  const icons = {
    success: 'checkmark-circle-1',
    error: 'warning',
    info: 'information-1',
  };

  return (
    <div className={`toast toast--${type}`}>
      <Icon name={icons[type]} className="toast__icon" />
      <span className="toast__message">{message}</span>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
