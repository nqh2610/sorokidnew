'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';

export default function CertificateDetailPage() {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const certificateRef = useRef(null);

  useEffect(() => {
    fetchCertificate();
  }, [id]);

  const fetchCertificate = async () => {
    try {
      const res = await fetch(`/api/certificate?id=${id}`);
      const data = await res.json();
      
      if (data.certificate) {
        setCertificate(data.certificate);
        // Generate QR code
        const verifyUrl = `${window.location.origin}/api/certificate/verify/${id}`;
        const qr = await QRCode.toDataURL(verifyUrl, { width: 120 });
        setQrCodeUrl(qr);
      }
    } catch (error) {
      console.error('Error fetching certificate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
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

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Chứng chỉ Sorokids',
      text: `${certificate.userName} đã hoàn thành cấp độ ${certificate.level} tại Sorokids!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      // Fallback: copy link
      navigator.clipboard.writeText(window.location.href);
      alert('Đã copy link chứng chỉ!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải chứng chỉ...</p>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy chứng chỉ</h2>
          <p className="text-gray-600 mb-6">Chứng chỉ này không tồn tại hoặc đã bị xóa.</p>
          <Link href="/certificate" className="text-purple-600 hover:underline">
            ← Quay lại danh sách chứng chỉ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Actions */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link href="/certificate" className="text-gray-600 hover:text-gray-800 flex items-center gap-2">
            ← Quay lại
          </Link>
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              📤 Chia sẻ
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              🖨️ In chứng chỉ
            </button>
          </div>
        </div>

        {/* Certificate */}
        <div
          ref={certificateRef}
          className="bg-white rounded-lg shadow-2xl overflow-hidden print:shadow-none"
          style={{
            aspectRatio: '1.414', // A4 landscape ratio
          }}
        >
          {/* Border */}
          <div className="m-4 p-8 border-4 border-double border-amber-400 h-[calc(100%-2rem)] flex flex-col">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">🎖️</div>
              <h1 className="text-3xl font-serif font-bold text-gray-800 tracking-wide">
                CHỨNG CHỈ
              </h1>
              <p className="text-amber-600 font-medium mt-1">CERTIFICATE OF COMPLETION</p>
            </div>

            {/* Decorative line */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
              <span className="text-amber-400">✦</span>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="text-center flex-1 flex flex-col justify-center">
              <p className="text-gray-600 text-lg mb-2">Chứng nhận</p>
              <h2 className="text-4xl font-bold text-gray-800 mb-4 font-serif">
                {certificate.userName}
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Đã hoàn thành xuất sắc
              </p>
              <div className="inline-block bg-gradient-to-r from-amber-100 to-orange-100 px-8 py-4 rounded-xl mx-auto mb-6">
                <h3 className="text-2xl font-bold text-amber-700">
                  {getLevelName(certificate.level)}
                </h3>
                <p className="text-amber-600">Cấp độ {certificate.level}</p>
              </div>
              <p className="text-gray-600">
                Chương trình Tính nhẩm Soroban tại <span className="font-semibold">Sorokids</span>
              </p>
              <p className="text-lg font-medium text-green-600 mt-2">
                Điểm số: {certificate.score}/100
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end mt-6">
              {/* Date */}
              <div className="text-left">
                <p className="text-gray-500 text-sm">Ngày cấp</p>
                <p className="font-medium text-gray-700">{formatDate(certificate.issuedAt)}</p>
              </div>

              {/* Logo */}
              <div className="text-center">
                <div className="text-4xl">🧮</div>
                <p className="font-bold text-purple-600">Sorokids</p>
              </div>

              {/* QR Code */}
              <div className="text-right">
                {qrCodeUrl && (
                  <div className="inline-block bg-white p-1 border rounded">
                    <img src={qrCodeUrl} alt="QR Verify" className="w-20 h-20" />
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">Quét để xác minh</p>
              </div>
            </div>

            {/* Certificate ID */}
            <div className="text-center mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400 font-mono">
                Mã chứng chỉ: {certificate.id}
              </p>
            </div>
          </div>
        </div>

        {/* Verify info */}
        <div className="mt-6 bg-white rounded-xl p-6 shadow-lg print:hidden">
          <h3 className="font-semibold text-gray-800 mb-3">Xác minh chứng chỉ</h3>
          <p className="text-gray-600 text-sm mb-3">
            Chứng chỉ này có thể được xác minh bằng cách quét mã QR hoặc truy cập đường dẫn sau:
          </p>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-3">
            <code className="text-sm text-gray-700 flex-1 break-all">
              {`${typeof window !== 'undefined' ? window.location.origin : ''}/api/certificate/verify/${certificate.id}`}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/api/certificate/verify/${certificate.id}`
                );
                alert('Đã copy link!');
              }}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
            >
              📋
            </button>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          [ref="certificateRef"],
          [ref="certificateRef"] * {
            visibility: visible;
          }
          [ref="certificateRef"] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
