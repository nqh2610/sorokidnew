'use client';

import { useI18n } from '@/lib/i18n/I18nContext';

export default function Loading() {
  const { t } = useI18n();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="text-center">
        <div className="text-6xl animate-bounce mb-4">📚</div>
        <p className="text-gray-600 font-medium">{t('learn.loading')}</p>
      </div>
    </div>
  );
}
