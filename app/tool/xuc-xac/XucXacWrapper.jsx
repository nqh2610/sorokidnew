'use client';

import dynamic from 'next/dynamic';
import { useI18n } from '@/lib/i18n/I18nContext';

const XucXac3DClient = dynamic(() => import('./XucXac3DClient'), {
  ssr: false,
  loading: () => (
    <LoadingFallback />
  ),
});

// Separate loading component to use i18n hook
function LoadingFallback() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">{t('dice.loading')}</div>
    </div>
  );
}

export default function XucXacWrapper() {
  return <XucXac3DClient />;
}
