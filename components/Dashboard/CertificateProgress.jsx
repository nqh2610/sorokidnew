'use client';

import LocalizedLink from '@/components/LocalizedLink/LocalizedLink';
import { Award, ChevronRight, Lock, CheckCircle, Trophy } from 'lucide-react';
import { useI18n } from '@/lib/i18n/I18nContext';

/**
 * Component showing certificate progress on Dashboard
 */
export default function CertificateProgress({ certificates, compact = false }) {
  const { t } = useI18n();
  
  if (!certificates) return null;

  const { addSub, complete } = certificates;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl text-white shadow-md">
              <Award size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{t('dashboard.certificate.title')}</h3>
              <p className="text-xs text-gray-500">{t('dashboard.certificate.subtitle')}</p>
            </div>
          </div>
          <LocalizedLink 
            href="/certificate"
            className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1"
          >
            {t('dashboard.certificate.viewDetails')}
            <ChevronRight size={16} />
          </LocalizedLink>
        </div>
      </div>

      {/* Certificate Cards */}
      <div className="p-4 sm:p-5 space-y-3">
        {/* Addition & Subtraction Certificate */}
        <CertificateCard 
          type="addSub"
          name={t('dashboard.certificate.addSub')}
          icon="📜"
          data={addSub}
          compact={compact}
          t={t}
        />

        {/* Complete Certificate */}
        <CertificateCard 
          type="complete"
          name={t('dashboard.certificate.complete')}
          icon="🏆"
          data={complete}
          compact={compact}
          t={t}
        />
      </div>
    </div>
  );
}

function CertificateCard({ type, name, icon, data, compact, t }) {
  if (!data) return null;

  const { hasCertificate, hasRequiredTier, totalPercent, isEligible, details } = data;
  const percent = totalPercent || 0;

  // Count completed requirements
  const completedCount = details ? Object.values(details).filter(d => d.isComplete).length : 0;
  const totalCount = details ? Object.keys(details).length : 0;

  // Determine card state
  const isLocked = !hasRequiredTier;
  const isCompleted = hasCertificate;
  const canClaim = isEligible && !hasCertificate;

  return (
    <LocalizedLink
      href="/certificate"
      className={`block p-3 sm:p-4 rounded-xl border-2 transition-all hover:shadow-md ${
        isCompleted 
          ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300' 
          : isLocked 
            ? 'bg-gray-50 border-gray-200 opacity-70'
            : canClaim
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 animate-pulse'
              : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={`text-3xl ${isLocked ? 'grayscale opacity-50' : ''}`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-bold text-sm ${isCompleted ? 'text-amber-700' : 'text-gray-800'}`}>
              {name}
            </h4>
            {isCompleted && (
              <span className="flex items-center gap-1 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
                <CheckCircle size={10} />
                {t('dashboard.certificate.claimed')}
              </span>
            )}
            {isLocked && (
              <span className="flex items-center gap-1 text-xs bg-gray-400 text-white px-2 py-0.5 rounded-full">
                <Lock size={10} />
                {type === 'addSub' ? t('dashboard.certificate.basicPlan') : t('dashboard.certificate.advancedPlan')}
              </span>
            )}
            {canClaim && (
              <span className="flex items-center gap-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full animate-bounce">
                <Trophy size={10} />
                {t('dashboard.certificate.ready')}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {!isCompleted && !isLocked && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{completedCount}/{totalCount} {t('dashboard.certificate.requirements')}</span>
                <span className="font-bold text-purple-600">{percent}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    canClaim ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Completed message */}
          {isCompleted && (
            <p className="text-xs text-amber-600 mt-1">
              {t('dashboard.certificate.congratulations')}
            </p>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight size={20} className={`${isCompleted ? 'text-amber-400' : 'text-gray-400'}`} />
      </div>
    </LocalizedLink>
  );
}
