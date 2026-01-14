'use client';

import { useState, useEffect } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { MonsterAvatar, AVATAR_COUNT } from '@/components/MonsterAvatar';
import { useI18n } from '@/lib/i18n/I18nContext';

export default function AvatarSelector({ 
  isOpen, 
  onClose, 
  currentAvatar, // avatar index hoặc null
  seed, // user seed để tính default avatar
  onSelect 
}) {
  const { t } = useI18n();
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedAvatar(currentAvatar);
    }
  }, [isOpen, currentAvatar]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSelect(selectedAvatar);
      onClose();
    } catch (error) {
      console.error('Error saving avatar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedAvatar(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col animate-in zoom-in-95 duration-200" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Sparkles size={20} className="text-violet-500" />
            {t('avatar.selectAvatar')}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Preview */}
          <div className="p-4 bg-gradient-to-b from-violet-50 to-white flex flex-col items-center">
            <MonsterAvatar 
              seed={seed}
              avatarIndex={selectedAvatar}
              size={100}
              className="border-4 border-violet-300 shadow-lg"
              showBorder={false}
            />
            <p className="mt-2 text-sm text-gray-500">
              {selectedAvatar !== null ? `Avatar #${selectedAvatar + 1}` : t('avatar.defaultAvatar')}
            </p>
          </div>

          {/* Avatar Grid */}
          <div className="p-4">
            {/* Reset to default button */}
            <button
              onClick={handleReset}
              className={`w-full mb-4 p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                selectedAvatar === null 
                  ? 'border-violet-500 bg-violet-50 text-violet-700' 
                  : 'border-gray-200 hover:border-violet-300 text-gray-600'
              }`}
            >
              <span className="text-lg">✨</span>
              <span className="font-medium">{t('avatar.useDefaultAvatar')}</span>
            </button>

            {/* Avatar options */}
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: AVATAR_COUNT }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedAvatar(i)}
                  className={`relative aspect-square rounded-xl p-1 transition-all ${
                    selectedAvatar === i
                      ? 'ring-2 ring-violet-500 ring-offset-2 bg-violet-100 scale-105'
                      : 'hover:bg-gray-100 hover:scale-105'
                  }`}
                >
                  <MonsterAvatar 
                    avatarIndex={i}
                    seed={`avatar_${i}`}
                    size={56}
                    showBorder={false}
                    className="w-full h-full"
                  />
                  {selectedAvatar === i && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 p-4 border-t border-gray-100 flex gap-3 bg-white rounded-b-3xl">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('avatar.saving')}
              </>
            ) : (
              <>
                <Check size={18} />
                {t('common.confirm')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
