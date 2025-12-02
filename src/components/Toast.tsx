'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

// Simple global toast state (in production, use Context API)
let toastState: Toast[] = [];
let toastListeners: ((toasts: Toast[]) => void)[] = [];

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setToasts(newToasts);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  const addToast = (message: string, type: ToastType = 'info', duration = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, message, type, duration };
    toastState = [...toastState, newToast];
    toastListeners.forEach((listener) => listener(toastState));

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    toastState = toastState.filter((toast) => toast.id !== id);
    toastListeners.forEach((listener) => listener(toastState));
  };

  return { toasts, addToast, removeToast };
}

/**
 * Toast Container Component
 * Renders all active toasts
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getStyles = (type: ToastType) => {
    const baseStyles =
      'fixed right-4 bottom-4 rounded-lg shadow-lg p-4 max-w-sm text-white animate-slideIn';
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500`;
      case 'error':
        return `${baseStyles} bg-red-500`;
      case 'warning':
        return `${baseStyles} bg-yellow-500`;
      case 'info':
        return `${baseStyles} bg-blue-500`;
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
    }
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={getStyles(toast.type)}
          style={{
            pointerEvents: 'auto',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl font-bold flex-shrink-0">{getIcon(toast.type)}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white hover:opacity-80 flex-shrink-0 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Toast Notification Helper
 * Use this for quick success/error messages
 */
export const toast = {
  success: (message: string) => {
    const { addToast } = useToast();
    addToast(message, 'success');
  },
  error: (message: string) => {
    const { addToast } = useToast();
    addToast(message, 'error');
  },
  info: (message: string) => {
    const { addToast } = useToast();
    addToast(message, 'info');
  },
  warning: (message: string) => {
    const { addToast } = useToast();
    addToast(message, 'warning');
  },
};
