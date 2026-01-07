'use client';

import { AlertTriangle, Info } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'warning' // 'warning' or 'info'
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          {type === 'warning' ? (
            <AlertTriangle className="w-16 h-16 sm:w-20 sm:h-20 text-orange-500 mx-auto mb-4" />
          ) : (
            <Info className="w-16 h-16 sm:w-20 sm:h-20 text-blue-500 mx-auto mb-4" />
          )}
          <h3 id="dialog-title" className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-gray-600">{message}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-bold hover:bg-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400"
            autoFocus
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-6 py-3 rounded-full font-bold transition-all focus:outline-none focus:ring-2 ${
              type === 'warning'
                ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white hover:shadow-lg focus:ring-red-400'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg focus:ring-blue-400'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
