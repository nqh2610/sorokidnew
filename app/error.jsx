'use client';

import { useEffect } from 'react';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useI18n } from '@/lib/i18n/I18nContext';

export default function Error({ error, reset }) {
  const { t } = useI18n();
  
  useEffect(() => {
    // Log error in development mode
    if (process.env.NODE_ENV === 'development') {
      console.error('Application error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">😅</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          {t('errors.500.title')}
        </h1>
        <p className="text-gray-600 mb-8">
          {t('errors.500.description')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg transition-all"
          >
            🔄 {t('errors.500.retry')}
          </button>
          <LocalizedLink
            href="/"
            className="px-6 py-3 bg-white text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
          >
            🏠 {t('errors.404.backHome')}
          </LocalizedLink>
        </div>
      </div>
    </div>
  );
}
