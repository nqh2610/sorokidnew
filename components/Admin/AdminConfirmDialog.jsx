'use client';

import { useState } from 'react';
import { AlertTriangle, Info, Trash2, CheckCircle } from 'lucide-react';

/**
 * Admin Confirm Dialog - Dark theme confirm dialog cho admin panel
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - onConfirm: function
 * - title: string
 * - message: string
 * - confirmText: string (default: 'Xác nhận')
 * - cancelText: string (default: 'Hủy')
 * - type: 'danger' | 'warning' | 'info' | 'success' (default: 'warning')
 */
export default function AdminConfirmDialog({
  isOpen = true,  // Default to true - component only rendered when needed
  onClose,
  onCancel,  // Alias for onClose
  onConfirm,
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'warning',
  loading = false
}) {
  // Support both onClose and onCancel
  const handleClose = onCancel || onClose;
  
  // Internal loading state
  const [isProcessing, setIsProcessing] = useState(false);
  
  if (!isOpen) return null;

  const handleConfirm = async () => {
    // Prevent double click
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      // Support both sync and async onConfirm
      if (onConfirm) {
        await onConfirm();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Use external loading prop or internal isProcessing
  const showLoading = loading || isProcessing;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const icons = {
    danger: <Trash2 className="w-12 h-12 text-red-400" />,
    warning: <AlertTriangle className="w-12 h-12 text-amber-400" />,
    info: <Info className="w-12 h-12 text-blue-400" />,
    success: <CheckCircle className="w-12 h-12 text-emerald-400" />
  };

  const confirmButtonStyles = {
    danger: 'bg-red-500 hover:bg-red-600 focus:ring-red-500/50',
    warning: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500/50',
    info: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500/50',
    success: 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500/50'
  };

  const bgGlow = {
    danger: 'shadow-red-500/20',
    warning: 'shadow-amber-500/20',
    info: 'shadow-blue-500/20',
    success: 'shadow-emerald-500/20'
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={handleClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-dialog-title"
    >
      <div
        className={`bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl ${bgGlow[type]} max-w-md w-full p-6 transform transition-all animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-full ${type === 'danger' ? 'bg-red-500/10' : type === 'warning' ? 'bg-amber-500/10' : type === 'success' ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`}>
            {icons[type]}
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 id="admin-dialog-title" className="text-lg font-bold text-white mb-2">
            {title}
          </h3>
          <p className="text-sm text-slate-400">{message}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={showLoading}
            className="flex-1 px-4 py-2.5 bg-slate-700 text-slate-300 rounded-xl font-medium hover:bg-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-slate-500/50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={showLoading}
            className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-all focus:outline-none focus:ring-2 disabled:opacity-50 ${confirmButtonStyles[type]}`}
          >
            {showLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang xử lý...
              </span>
            ) : confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
