'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Award, CheckCircle, Circle, Lock, ChevronRight, Star, Trophy, Sparkles } from 'lucide-react';
import TopBar from '@/components/TopBar/TopBar';

export default function CertificatePage() {
  const { data: session } = useSession();
  const [progressData, setProgressData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingCert, setClaimingCert] = useState(null);

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
        alert('🎉 Chúc mừng! Bạn đã nhận được chứng chỉ!');
        fetchProgress(); // Refresh
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      alert('Có lỗi xảy ra');
    } finally {
      setClaimingCert(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
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
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  const { userTier, progress, certificates } = progressData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <TopBar showStats={true} />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Chứng chỉ Sorokid</h1>
              <p className="text-gray-500">Hoàn thành lộ trình để nhận chứng chỉ công nhận năng lực</p>
            </div>
          </div>
        </div>

        {/* Certificate Cards */}
        <div className="space-y-6">
          {/* Chứng chỉ Cộng Trừ */}
          <CertificateCard 
            certType="addSub"
            data={progress?.addSub}
            userTier={userTier}
            onClaim={() => handleClaimCertificate('addSub')}
            claiming={claimingCert === 'addSub'}
          />

          {/* Chứng chỉ Toàn Diện */}
          <CertificateCard 
            certType="complete"
            data={progress?.complete}
            userTier={userTier}
            onClaim={() => handleClaimCertificate('complete')}
            claiming={claimingCert === 'complete'}
          />
        </div>

        {/* Chứng chỉ đã nhận */}
        {certificates && certificates.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="text-amber-500" />
              Chứng chỉ đã nhận ({certificates.length})
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <Link
                  key={cert.id}
                  href={`/certificate/${cert.code}`}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-2xl shadow-md">
                      {cert.certType === 'addSub' ? '📜' : '🏆'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">
                        {cert.certType === 'addSub' ? 'Chứng chỉ Cộng Trừ' : 'Chứng chỉ Toàn Diện'}
                      </h3>
                      <p className="text-sm text-gray-500">{cert.honorTitle}</p>
                      <p className="text-xs text-amber-600">Cấp ngày: {formatDate(cert.issuedAt)}</p>
                    </div>
                    <ChevronRight className="text-gray-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Component hiển thị card chứng chỉ với tiến độ
 */
function CertificateCard({ certType, data, userTier, onClaim, claiming }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!data) return null;

  const isLocked = !data.hasRequiredTier;
  const hasCert = data.hasCertificate;
  const percent = data.totalPercent || 0;
  const isEligible = data.isEligible && !hasCert;

  const tierLabels = {
    basic: 'Cơ Bản',
    advanced: 'Nâng Cao',
    vip: 'VIP'
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
          {isLocked && (
            <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full">
              <Lock size={14} className="text-white" />
              <span className="text-white text-sm">Cần gói {tierLabels[data.requiredTier]}</span>
            </div>
          )}
          {hasCert && (
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
              <CheckCircle size={14} className="text-white" />
              <span className="text-white text-sm font-medium">Đã nhận</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {!hasCert && (
          <div className="mt-4">
            <div className="flex justify-between text-white/90 text-sm mb-1">
              <span>Tiến độ</span>
              <span className="font-bold">{percent}%</span>
            </div>
            <div className="h-3 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Requirements Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {data.details?.lessons && (
            <RequirementBadge 
              icon="📚"
              label="Học bài"
              value={`${data.details.lessons.completed}/${data.details.lessons.total}`}
              percent={data.details.lessons.percent}
              maxPercent={data.details.lessons.maxPercent}
              isComplete={data.details.lessons.isComplete}
            />
          )}
          {data.details?.practice && (
            <RequirementBadge 
              icon="🎯"
              label="Luyện tập"
              value={`${data.details.practice.completed}/${data.details.practice.total} mode`}
              percent={data.details.practice.percent}
              maxPercent={data.details.practice.maxPercent}
              isComplete={data.details.practice.isComplete}
            />
          )}
          {data.details?.compete && (
            <RequirementBadge 
              icon="⚔️"
              label="Thi đấu"
              value={`${data.details.compete.completed}/${data.details.compete.total} mode`}
              percent={data.details.compete.percent}
              maxPercent={data.details.compete.maxPercent}
              isComplete={data.details.compete.isComplete}
            />
          )}
          {data.details?.mentalMath && (
            <RequirementBadge 
              icon="🧠"
              label="Siêu Trí Tuệ"
              value={`${data.details.mentalMath.correct}/${data.details.mentalMath.required} bài`}
              percent={data.details.mentalMath.percent}
              maxPercent={data.details.mentalMath.maxPercent}
              isComplete={data.details.mentalMath.isComplete}
            />
          )}
          {data.details?.flashAnzan && (
            <RequirementBadge 
              icon="⚡"
              label="Flash Anzan"
              value={`${data.details.flashAnzan.correct}/${data.details.flashAnzan.required} bài`}
              percent={data.details.flashAnzan.percent}
              maxPercent={data.details.flashAnzan.maxPercent}
              isComplete={data.details.flashAnzan.isComplete}
            />
          )}
          {data.details?.accuracy && (
            <RequirementBadge 
              icon="📊"
              label="Độ chính xác"
              value={`${data.details.accuracy.current}%`}
              percent={data.details.accuracy.percent}
              maxPercent={data.details.accuracy.maxPercent}
              isComplete={data.details.accuracy.isComplete}
              target={`Cần ${data.details.accuracy.required}%`}
            />
          )}
        </div>

        {/* Todo List */}
        {!hasCert && data.todoList && data.todoList.length > 0 && (
          <div className="border-t pt-4">
            <button 
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-gray-700 font-medium mb-3 hover:text-purple-600 transition-colors"
            >
              <span>📋 Cần hoàn thành ({data.todoList.length})</span>
              <ChevronRight 
                size={16} 
                className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
              />
            </button>
            
            {expanded && (
              <div className="space-y-2">
                {data.todoList.map((todo, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-xl">{todo.icon}</span>
                    <div>
                      <p className="text-gray-800 text-sm font-medium">{todo.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4">
          {hasCert ? (
            <Link
              href={`/certificate/${data.hasCertificate}`}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            >
              <Award size={20} />
              Xem chứng chỉ
            </Link>
          ) : isLocked ? (
            <Link
              href="/pricing"
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            >
              <Sparkles size={20} />
              Nâng cấp để mở khóa
            </Link>
          ) : isEligible ? (
            <button
              onClick={onClaim}
              disabled={claiming}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {claiming ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <Trophy size={20} />
                  Nhận chứng chỉ ngay!
                </>
              )}
            </button>
          ) : (
            <div className="text-center text-gray-500 text-sm">
              Hoàn thành các yêu cầu trên để nhận chứng chỉ
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Badge hiển thị từng yêu cầu
 */
function RequirementBadge({ icon, label, value, percent, maxPercent, isComplete, target }) {
  return (
    <div className={`p-3 rounded-xl border ${
      isComplete 
        ? 'bg-green-50 border-green-200' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className={`text-xs font-medium ${isComplete ? 'text-green-600' : 'text-gray-600'}`}>
          {label}
        </span>
        {isComplete && <CheckCircle size={12} className="text-green-500" />}
      </div>
      <div className="text-sm font-bold text-gray-800">{value}</div>
      {target && !isComplete && (
        <div className="text-xs text-orange-500">{target}</div>
      )}
      <div className="mt-1 text-xs text-gray-400">
        {percent}/{maxPercent}%
      </div>
    </div>
  );
}
