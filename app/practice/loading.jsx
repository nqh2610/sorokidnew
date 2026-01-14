'use client';

import { useI18n } from '@/lib/i18n/I18nContext';

export default function Loading() {
  const { t } = useI18n();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="text-center">
        <div className="text-6xl animate-bounce mb-4">💪</div>
        <p className="text-gray-600 font-medium">{t('common.loading')}</p>
      </div>
    </div>
  );
}
