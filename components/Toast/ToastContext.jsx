'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
  const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
  const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
  const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);
  
  // Toast đặc biệt cho level up - hiển thị lâu hơn và có animation đẹp
  const levelUp = useCallback((oldLevel, newLevel, duration = 5000) => {
    return addToast({ oldLevel, newLevel }, 'levelup', duration);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info, levelUp }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full px-4 sm:px-0" role="region" aria-label="Notifications">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }) {
  const { type, message } = toast;

  // Toast đặc biệt cho Level Up
  if (type === 'levelup') {
    const { oldLevel, newLevel } = message;
    return (
      <div
        className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-2xl shadow-2xl p-4 animate-slide-in-right overflow-hidden relative"
        role="alert"
      >
        {/* Sparkle effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1 left-2 text-lg animate-pulse">✨</div>
          <div className="absolute top-2 right-4 text-sm animate-bounce delay-100">⭐</div>
          <div className="absolute bottom-1 left-6 text-xs animate-pulse delay-200">💫</div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="text-3xl animate-bounce">🎊</div>
          <div className="flex-1">
            <div className="text-white font-bold text-sm">LÊN CẤP!</div>
            <div className="flex items-center gap-2 text-white/90 text-xs mt-1">
              <span>{oldLevel?.icon} {oldLevel?.name}</span>
              <span className="text-yellow-300">→</span>
              <span className="font-bold text-yellow-200">{newLevel?.icon} {newLevel?.name}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    );
  }

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-800',
      iconColor: 'text-green-500'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-800',
      iconColor: 'text-red-500'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500'
    }
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[type];

  return (
    <div
      className={`${bgColor} ${borderColor} border-l-4 rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slide-in-right`}
      role="alert"
    >
      <Icon className={`${iconColor} flex-shrink-0 mt-0.5`} size={20} />
      <p className={`${textColor} flex-1 text-sm font-medium`}>{message}</p>
      <button
        onClick={onClose}
        className={`${textColor} hover:opacity-70 transition-opacity flex-shrink-0`}
        aria-label="Đóng thông báo"
      >
        <X size={18} />
      </button>
    </div>
  );
}
