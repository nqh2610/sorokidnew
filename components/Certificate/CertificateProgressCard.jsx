'use client';

import { Award, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import LocalizedLink from '@/components/LocalizedLink/LocalizedLink';
import { useI18n } from '@/lib/i18n/I18nContext';

/**
 * CertificateProgressCard - Card hiển thị tiến độ đạt chứng chỉ
 */
export default function CertificateProgressCard({ 
  levelId,
  levelName,
  totalLessons,
  completedLessons,
  requiredAccuracy = 70,
  currentAccuracy = 0,
  hasCertificate = false,
  certificateCode,
  isPremium = false
}) {
  const { t } = useI18n();
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const canGetCertificate = completedLessons >= totalLessons && currentAccuracy >= requiredAccuracy;
  const isLocked = !isPremium && levelId > 2;

  if (hasCertificate && certificateCode) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 border-2 border-amber-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center text-3xl">
            🏆
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800">{t('certificate.progress.levelCert', { level: levelId })}</h3>
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle size={14} />
              {t('certificate.progress.completed')}
            </p>
          </div>
          <LocalizedLink
            href={`/certificate/${certificateCode}`}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center gap-2"
          >
            {t('certificate.progress.view')}
            <ArrowRight size={16} />
          </LocalizedLink>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="bg-gray-100 rounded-2xl p-5 opacity-70">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center">
            <Lock className="text-gray-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-500">{t('certificate.progress.levelCert', { level: levelId })}</h3>
            <p className="text-sm text-gray-400">{t('certificate.progress.needPremium')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-3xl">
          📜
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800">{t('certificate.progress.levelCert', { level: levelId })}</h3>
          <p className="text-sm text-gray-500">{levelName}</p>
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-3">
        {/* Lesson progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{t('certificate.progress.lessons')}</span>
            <span className="font-medium">{completedLessons}/{totalLessons}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Accuracy */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{t('certificate.progress.accuracyRequired', { percent: requiredAccuracy })}</span>
            <span className={`font-medium ${currentAccuracy >= requiredAccuracy ? 'text-green-600' : 'text-orange-500'}`}>
              {currentAccuracy}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                currentAccuracy >= requiredAccuracy 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-orange-400 to-amber-500'
              }`}
              style={{ width: `${Math.min(currentAccuracy, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="mt-4">
        {canGetCertificate ? (
          <button className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all">
            <Award size={18} />
            {t('certificate.progress.claimCert')}
          </button>
        ) : (
          <div className="text-center text-sm text-gray-500">
            {completedLessons < totalLessons 
              ? t('certificate.progress.lessonsRemaining', { count: totalLessons - completedLessons })
              : t('certificate.progress.needAccuracy', { percent: requiredAccuracy })
            }
          </div>
        )}
      </div>
    </div>
  );
}
