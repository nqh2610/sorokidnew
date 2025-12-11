'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function CertificatePage() {
  const { data: session } = useSession();
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userTier, setUserTier] = useState('free');

  useEffect(() => {
    fetchCertificates();
    fetchUserTier();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await fetch('/api/certificate');
      const data = await res.json();
      setCertificates(data.certificates || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserTier = async () => {
    try {
      const res = await fetch('/api/tier');
      const data = await res.json();
      setUserTier(data.tier || 'free');
    } catch (error) {
      console.error('Error fetching tier:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getLevelName = (level) => {
    const levelNames = {
      1: 'Bước đầu',
      2: 'Làm quen',
      3: 'Cơ bản',
      4: 'Nâng cao 1',
      5: 'Nâng cao 2',
      6: 'Thành thạo 1',
      7: 'Thành thạo 2',
      8: 'Chuyên gia 1',
      9: 'Chuyên gia 2',
      10: 'Cao thủ'
    };
    return levelNames[level] || `Cấp độ ${level}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Nếu không phải VIP
  if (userTier !== 'vip') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">🏆</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Chứng chỉ VIP
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Tính năng chứng chỉ chỉ dành riêng cho thành viên VIP. 
            Nâng cấp ngay để nhận chứng chỉ khi hoàn thành các cấp độ!
          </p>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Lợi ích của chứng chỉ:
            </h3>
            <ul className="text-left space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span>Chứng nhận kỹ năng tính nhẩm Soroban cho bé</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span>Mã QR xác thực để kiểm tra tính hợp lệ</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span>Tải về và in chứng chỉ chất lượng cao</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span>Chia sẻ thành tích lên mạng xã hội</span>
              </li>
            </ul>
          </div>

          <Link
            href="/pricing"
            className="inline-block px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            Nâng cấp VIP ngay 👑
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🏆 Chứng chỉ của tôi
          </h1>
          <p className="text-gray-600">
            Bộ sưu tập chứng chỉ khi hoàn thành các cấp độ
          </p>
        </div>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📜</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Chưa có chứng chỉ nào
            </h3>
            <p className="text-gray-600 mb-6">
              Hoàn thành các cấp độ để nhận chứng chỉ đầu tiên!
            </p>
            <Link
              href="/learn"
              className="inline-block px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors"
            >
              Bắt đầu học ngay
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Certificate Preview */}
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-6 border-b-4 border-amber-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎖️</div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {getLevelName(cert.level)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Cấp độ {cert.level}
                    </p>
                  </div>
                </div>

                {/* Certificate Info */}
                <div className="p-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 text-sm">Ngày cấp:</span>
                    <span className="font-medium">{formatDate(cert.issuedAt)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 text-sm">Điểm số:</span>
                    <span className="font-medium text-green-600">{cert.score}/100</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 text-sm">Mã chứng chỉ:</span>
                    <span className="font-mono text-xs text-gray-500">{cert.id}</span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/certificate/${cert.id}`}
                      className="flex-1 py-2 text-center bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Xem chi tiết
                    </Link>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/api/certificate/verify/${cert.id}`
                        );
                        alert('Đã copy link xác minh!');
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
