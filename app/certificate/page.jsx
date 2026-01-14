'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { LocalizedLink } from '@/components/LocalizedLink';
import { ArrowLeft, Award, CheckCircle, Circle, Lock, ChevronRight, ChevronDown, Star, Trophy, Sparkles, Target, BookOpen, Swords, Brain, Zap, TrendingUp, Download, Eye } from 'lucide-react';
import TopBar from '@/components/TopBar/TopBar';
import { useToast } from '@/components/Toast/ToastContext';
import { useI18n } from '@/lib/i18n/I18nContext';

export default function CertificatePage() {
  const { t, locale } = useI18n();
  const { data: session } = useSession();
  const [progressData, setProgressData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingCert, setClaimingCert] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/certificate/progress');
      const data = await res.json();
      if (data.success) {
        setProgressData(data);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimCertificate = async (certType) => {
    setClaimingCert(certType);
    try {
      const res = await fetch('/api/certificate/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certType })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('certificate.claimSuccess'));
        fetchProgress(); // Refresh
      } else {
        toast.error(data.error || t('certificate.error'));
      }
    } catch (error) {
      toast.error(t('certificate.error'));
    } finally {
      setClaimingCert(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-4">🏆</div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const { userTier, progress, certificates } = progressData || {};

  // Tính tổng số yêu cầu đã hoàn thành
  const getTotalStats = () => {
    let totalCompleted = 0;
    let totalRequired = 0;
    
    Object.values(progress || {}).forEach(cert => {
      if (cert.details) {
        Object.values(cert.details).forEach(detail => {
          totalRequired++;
          if (detail.isComplete) totalCompleted++;
        });
      }
    });
    
    return { totalCompleted, totalRequired };
  };

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <TopBar showStats={true} />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header với thống kê tổng quan */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{t('certificate.title')}</h1>
                <p className="text-gray-500">{t('certificate.subtitle')}</p>
              </div>
            </div>
            
            {/* Thống kê nhanh */}
            <div className="flex gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl px-4 py-3 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalCompleted}/{stats.totalRequired}</div>
                <div className="text-xs text-green-600">{t('certificate.requirementsMet')}</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
                <div className="text-2xl font-bold text-amber-600">{certificates?.length || 0}</div>
                <div className="text-xs text-amber-600">{t('certificate.certificates')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chứng chỉ đã nhận - Đưa lên đầu nếu có */}
        {certificates && certificates.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="text-amber-500" />
              🎉 {t('certificate.earnedCertificates')} ({certificates.length})
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border-2 border-amber-300 shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-3xl shadow-md animate-pulse">
                      {cert.certType === 'addSub' ? '📜' : '🏆'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">
                        {cert.certType === 'addSub' ? t('certificate.addSubCert') : t('certificate.completeCert')}
                      </h3>
                      <p className="text-amber-700 font-medium">{cert.honorTitle}</p>
                      <p className="text-sm text-gray-500">{t('certificate.issuedOn')}: {formatDate(cert.issuedAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <LocalizedLink
                      href={`/certificate/${cert.code}`}
                      className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all text-sm"
                    >
                      <Eye size={16} />
                      {t('certificate.viewCertificate')}
                    </LocalizedLink>
                    <LocalizedLink
                      href={`/certificate/${cert.code}?download=true`}
                      className="py-2.5 px-4 bg-white border-2 border-amber-400 text-amber-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-50 transition-all text-sm"
                    >
                      <Download size={16} />
                      PDF
                    </LocalizedLink>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificate Cards - Lộ trình */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="text-purple-500" />
            {t('certificate.roadmap')}
          </h2>
        </div>
        
        <div className="space-y-6">
          {/* Chứng chỉ Cộng Trừ */}
          <CertificateCard 
            certType="addSub"
            data={progress?.addSub}
            userTier={userTier}
            onClaim={() => handleClaimCertificate('addSub')}
            claiming={claimingCert === 'addSub'}
            t={t}
          />

          {/* Chứng chỉ Toàn Diện */}
          <CertificateCard 
            certType="complete"
            data={progress?.complete}
            userTier={userTier}
            onClaim={() => handleClaimCertificate('complete')}
            claiming={claimingCert === 'complete'}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Component hiển thị card chứng chỉ với tiến độ chi tiết
 */
function CertificateCard({ certType, data, userTier, onClaim, claiming, t }) {
  const [expanded, setExpanded] = useState(true); // Mặc định mở rộng
  
  if (!data) return null;

  const isLocked = !data.hasRequiredTier;
  const hasCert = data.hasCertificate;
  const percent = data.totalPercent || 0;
  const isEligible = data.isEligible && !hasCert;

  const tierLabels = {
    basic: t('tier.basic'),
    advanced: t('tier.advanced'),
    vip: t('tier.vip')
  };

  // Tính số yêu cầu đã hoàn thành
  const completedCount = data.details ? Object.values(data.details).filter(d => d.isComplete).length : 0;
  const totalCount = data.details ? Object.keys(data.details).length : 0;

  // Icon và màu cho từng loại requirement
  const getRequirementStyle = (type) => {
    const styles = {
      certificate: { icon: '🎖️', color: 'amber', label: t('certificate.prereqLabel') },
      lessons: { icon: '📚', color: 'blue', label: t('certificate.lessonsLabel') },
      practice: { icon: '🎯', color: 'purple', label: t('certificate.practiceLabel') },
      compete: { icon: '⚔️', color: 'red', label: t('certificate.competeLabel') },
      mentalMath: { icon: '🧠', color: 'pink', label: t('certificate.mentalMathLabel') },
      flashAnzan: { icon: '⚡', color: 'yellow', label: t('certificate.flashAnzanLabel') },
      accuracy: { icon: '📊', color: 'green', label: t('certificate.accuracyLabel') }
    };
    return styles[type] || { icon: '📌', color: 'gray', label: type };
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${isLocked ? 'opacity-80' : ''}`}>
      {/* Header */}
      <div className={`p-5 ${
        hasCert 
          ? 'bg-gradient-to-r from-amber-400 to-orange-500' 
          : isLocked 
            ? 'bg-gradient-to-r from-gray-400 to-gray-500'
            : 'bg-gradient-to-r from-purple-500 to-pink-500'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-3xl">
              {data.icon}
            </div>
            <div className="text-white">
              <h3 className="text-xl font-bold">{data.name}</h3>
              <p className="text-white/80 text-sm">{data.description}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {isLocked && (
              <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full">
                <Lock size={14} className="text-white" />
                <span className="text-white text-sm">{t('certificate.needTier')} {tierLabels[data.requiredTier]}</span>
              </div>
            )}
            {hasCert && (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                <CheckCircle size={14} className="text-white" />
                <span className="text-white text-sm font-medium">{t('certificate.claimed')}</span>
              </div>
            )}
            {!hasCert && !isLocked && (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                <Target size={14} className="text-white" />
                <span className="text-white text-sm font-medium">{completedCount}/{totalCount} {t('certificate.completed')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {!hasCert && (
          <div className="mt-4">
            <div className="flex justify-between text-white/90 text-sm mb-1">
              <span>{t('certificate.totalProgress')}</span>
              <span className="font-bold">{percent}%</span>
            </div>
            <div className="h-3 bg-white/30 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  percent >= 100 ? 'bg-green-400' : 'bg-white'
                }`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Body - Lộ trình chi tiết */}
      <div className="p-5">
        {/* Toggle button */}
        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-gray-700 font-bold mb-4 hover:text-purple-600 transition-colors"
        >
          <span className="flex items-center gap-2">
            📋 {t('certificate.detailedRoadmap')} ({completedCount}/{totalCount} {t('certificate.requirements')})
          </span>
          <ChevronDown 
            size={20} 
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>

        {expanded && (
          <div className="space-y-3">
            {/* Hiển thị từng requirement với chi tiết đầy đủ */}
            {data.details && Object.entries(data.details).map(([key, detail]) => {
              const style = getRequirementStyle(key);
              return (
                <RequirementRow 
                  key={key}
                  type={key}
                  detail={detail}
                  style={style}
                  t={t}
                />
              );
            })}
          </div>
        )}

        {/* Todo List - Việc cần làm */}
        {!hasCert && data.todoList && data.todoList.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
              <h4 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
                ⚡ {t('certificate.nextTasks')} ({data.todoList.length})
              </h4>
              <div className="space-y-2">
                {data.todoList.slice(0, 3).map((todo, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 bg-white rounded-lg">
                    <span className="text-lg">{todo.icon}</span>
                    <p className="text-gray-700 text-sm">{todo.text}</p>
                  </div>
                ))}
                {data.todoList.length > 3 && (
                  <p className="text-orange-600 text-sm text-center">
                    +{data.todoList.length - 3} {t('certificate.moreTasks')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4">
          {hasCert ? (
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-green-700 font-medium">{t('certificate.alreadyCompleted')}</p>
              <p className="text-green-600 text-sm">{t('certificate.viewAbove')}</p>
            </div>
          ) : isLocked ? (
            <LocalizedLink
              href="/pricing"
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            >
              <Sparkles size={20} />
              {t('certificate.upgradeToUnlock')}
            </LocalizedLink>
          ) : isEligible ? (
            <button
              onClick={onClaim}
              disabled={claiming}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 animate-pulse"
            >
              {claiming ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <Trophy size={20} />
                  🎉 {t('certificate.claimNow')}
                </>
              )}
            </button>
          ) : (
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-sm">
                {t('certificate.remainingRequirements', { count: totalCount - completedCount })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Component hiển thị chi tiết một yêu cầu với progress bar
 */
function RequirementRow({ type, detail, style, t }) {
  const isComplete = detail.isComplete;
  
  // Mode names with i18n
  const getModeNames = () => ({
    addition: t('certificate.modes.addition'),
    subtraction: t('certificate.modes.subtraction'),
    addSubMixed: t('certificate.modes.addSubMixed'),
    multiplication: t('certificate.modes.multiplication'),
    division: t('certificate.modes.division'),
    mulDiv: t('certificate.modes.mulDiv'),
    mixed: t('certificate.modes.mixed')
  });
  
  // Tính phần trăm hoàn thành của requirement này
  const getProgressPercent = () => {
    if (isComplete) return 100;
    if (detail.completed !== undefined && detail.total !== undefined) {
      return Math.round((detail.completed / detail.total) * 100);
    }
    if (detail.correct !== undefined && detail.required !== undefined) {
      return Math.round((detail.correct / detail.required) * 100);
    }
    if (detail.current !== undefined && detail.required !== undefined) {
      return Math.round((detail.current / detail.required) * 100);
    }
    return 0;
  };

  const progressPercent = getProgressPercent();

  // Render chi tiết cho từng loại
  const renderDetail = () => {
    const modeNames = getModeNames();
    
    switch (type) {
      case 'certificate':
        return (
          <div className="text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">{t('certificate.prereqRequirement')}</span>
              <span className={`font-bold ${isComplete ? 'text-green-600' : 'text-orange-600'}`}>
                {isComplete ? `✓ ${t('certificate.has')}` : `✗ ${t('certificate.notHas')}`}
              </span>
            </div>
            <div className="text-xs text-gray-500">{detail.description}</div>
          </div>
        );
      
      case 'lessons':
        return (
          <div className="text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">{t('certificate.completeLessons')}</span>
              <span className={`font-bold ${isComplete ? 'text-green-600' : 'text-gray-800'}`}>
                {detail.completed}/{detail.total} Level
              </span>
            </div>
            <div className="text-xs text-gray-500">{detail.description}</div>
          </div>
        );
      
      case 'practice':
        return (
          <div className="text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">{t('certificate.practiceModes')}</span>
              <span className={`font-bold ${isComplete ? 'text-green-600' : 'text-gray-800'}`}>
                {detail.completed}/{detail.total} mode
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {t('certificate.difficultyLevel')} {detail.minDifficulty}+, {t('certificate.eachMode')} {detail.minCorrect} {t('certificate.correctAnswers')}
            </div>
            {detail.modes && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(detail.modes).map(([mode, stat]) => {
                  return (
                    <span 
                      key={mode}
                      className={`px-2 py-0.5 rounded text-xs ${
                        stat.isComplete 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {stat.isComplete ? '✓' : ''} {modeNames[mode]} ({stat.correct})
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );
      
      case 'compete':
        return (
          <div className="text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">{t('certificate.competeModes')}</span>
              <span className={`font-bold ${isComplete ? 'text-green-600' : 'text-gray-800'}`}>
                {detail.completed}/{detail.total} mode
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {t('certificate.achieve')} {detail.minCorrect}+ {t('certificate.correctPerRound')}
            </div>
            {detail.modes && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(detail.modes).map(([mode, stat]) => {
                  return (
                    <span 
                      key={mode}
                      className={`px-2 py-0.5 rounded text-xs ${
                        stat.isComplete 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {stat.isComplete ? '✓' : ''} {modeNames[mode]}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );
      
      case 'mentalMath':
        return (
          <div className="text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">{t('certificate.mentalMathLabel')}</span>
              <span className={`font-bold ${isComplete ? 'text-green-600' : 'text-gray-800'}`}>
                {detail.correct}/{detail.required} {t('certificate.correct')}
              </span>
            </div>
            <div className="text-xs text-gray-500">{detail.description}</div>
          </div>
        );
      
      case 'flashAnzan':
        return (
          <div className="text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">{t('certificate.flashAnzanLabel')}</span>
              <span className={`font-bold ${isComplete ? 'text-green-600' : 'text-gray-800'}`}>
                {detail.correct}/{detail.required} {t('certificate.correct')}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {t('certificate.levelAndAbove', { level: detail.minLevelName || detail.minLevel })}
            </div>
          </div>
        );
      
      case 'accuracy':
        return (
          <div className="text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">{t('certificate.totalAccuracy')}</span>
              <span className={`font-bold ${isComplete ? 'text-green-600' : 'text-orange-600'}`}>
                {detail.current}% / {detail.required}%
              </span>
            </div>
            <div className="text-xs text-gray-500">{detail.description}</div>
          </div>
        );
      
      default:
        return <div className="text-sm text-gray-600">{detail.description}</div>;
    }
  };

  return (
    <div className={`p-4 rounded-xl border-2 transition-all ${
      isComplete 
        ? 'bg-green-50 border-green-300' 
        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-start gap-3">
        {/* Icon và trạng thái */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
          isComplete ? 'bg-green-500' : 'bg-gray-300'
        }`}>
          {isComplete ? '✓' : style.icon}
        </div>
        
        {/* Nội dung */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-bold ${isComplete ? 'text-green-700' : 'text-gray-800'}`}>
              {style.label}
            </span>
            {isComplete && (
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                {t('certificate.completed')}
              </span>
            )}
          </div>
          
          {renderDetail()}
          
          {/* Progress bar */}
          <div className="mt-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isComplete ? 'bg-green-500' : 'bg-purple-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-400">{progressPercent}%</span>
              <span className="text-xs text-gray-400">
                {t('certificate.points')}: {detail.percent}/{detail.maxPercent}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
