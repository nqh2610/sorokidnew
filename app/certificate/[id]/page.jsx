'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { ArrowLeft, Download, Share2, Printer, Award, Star, CheckCircle } from 'lucide-react';
import { LogoIcon } from '@/components/Logo/Logo';
import { useToast } from '@/components/Toast/ToastContext';

export default function CertificateDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [certificate, setCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    fetchCertificate();
  }, [id]);

  // Auto download nếu có query param
  useEffect(() => {
    if (certificate && searchParams.get('download') === 'true') {
      handleDownloadPDF();
    }
  }, [certificate, searchParams]);

  const fetchCertificate = async () => {
    try {
      const res = await fetch(`/api/certificate?id=${id}`);
      const data = await res.json();
      
      if (data.certificate) {
        setCertificate(data.certificate);
        // Generate QR code
        const verifyUrl = `${window.location.origin}/api/certificate/verify/${data.certificate.code || id}`;
        const qr = await QRCode.toDataURL(verifyUrl, { width: 150, margin: 1 });
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

  const handleDownloadPDF = async () => {
    if (!certificateRef.current || isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      // Dynamic import để không load khi không cần
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      const element = certificateRef.current;
      
      // Đợi font load hoàn tất
      await document.fonts.ready;
      
      // Render canvas với chất lượng cao
      const canvas = await html2canvas(element, {
        scale: 3, // Tăng scale để chất lượng cao hơn
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        letterRendering: true,
        imageTimeout: 15000,
        removeContainer: true,
        // Fix for gradient rendering
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-certificate]');
          if (clonedElement) {
            clonedElement.style.transform = 'none';
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Tạo PDF khổ A4 ngang
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Tính toán kích thước để fit vào A4 với margin
      const margin = 5;
      const availableWidth = pdfWidth - (margin * 2);
      const availableHeight = pdfHeight - (margin * 2);
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
      
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      const offsetX = (pdfWidth - finalWidth) / 2;
      const offsetY = (pdfHeight - finalHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', offsetX, offsetY, finalWidth, finalHeight);
      
      // Tên file
      const fileName = `Chung_chi_Sorokid_${certificate.recipientName?.replace(/\s+/g, '_') || 'certificate'}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Có lỗi khi tạo PDF. Vui lòng thử lại!');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Chứng chỉ Sorokid',
      text: `${certificate.recipientName} đã hoàn thành ${certificate.certType === 'addSub' ? 'Chứng chỉ Cộng Trừ' : 'Chứng chỉ Toàn Diện'} tại Sorokid!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã copy link chứng chỉ!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải chứng chỉ...</p>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy chứng chỉ</h2>
          <p className="text-gray-600 mb-6">Chứng chỉ này không tồn tại hoặc đã bị xóa.</p>
          <Link href="/certificate" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium">
            <ArrowLeft size={20} />
            Quay lại danh sách chứng chỉ
          </Link>
        </div>
      </div>
    );
  }

  const certConfig = {
    addSub: {
      title: 'CHỨNG CHỈ TÍNH NHẨM CỘNG TRỪ',
      subtitle: 'Soroban Addition & Subtraction Certificate',
      description: 'Chứng nhận năng lực tính nhẩm cộng trừ trên bàn tính Soroban',
      badgeTitle: 'Tính nhẩm Cộng Trừ',
      gradient: 'from-blue-500 to-cyan-500',
      border: 'border-blue-400'
    },
    complete: {
      title: 'CHỨNG CHỈ SOROBAN TOÀN DIỆN',
      subtitle: 'Complete Soroban Mastery Certificate',
      description: 'Chứng nhận năng lực Soroban toàn diện: Cộng Trừ Nhân Chia + Siêu Trí Tuệ + Tia Chớp',
      badgeTitle: 'Soroban Toàn Diện',
      gradient: 'from-amber-500 to-orange-500',
      border: 'border-amber-400'
    }
  };

  const config = certConfig[certificate.certType] || certConfig.addSub;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 print:hidden">
          <Link href="/certificate" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium bg-white px-4 py-2 rounded-xl shadow-sm">
            <ArrowLeft size={20} />
            Quay lại
          </Link>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleShare}
              className="px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 font-medium shadow-md"
            >
              <Share2 size={18} />
              Chia sẻ
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium shadow-md"
            >
              <Printer size={18} />
              In
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-bold shadow-md disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Tải PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Certificate Display */}
        <div
          ref={certificateRef}
          data-certificate
          className="bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none"
          style={{ aspectRatio: '1.414' }}
        >
          {/* Outer Border with gradient */}
          <div className={`m-3 sm:m-4 p-4 sm:p-8 border-4 border-double ${config.border} h-[calc(100%-1.5rem)] sm:h-[calc(100%-2rem)] flex flex-col relative overflow-hidden`}>
            
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-32 h-32 opacity-10">
              <div className={`w-full h-full bg-gradient-to-br ${config.gradient} rounded-full transform -translate-x-1/2 -translate-y-1/2`}></div>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
              <div className={`w-full h-full bg-gradient-to-br ${config.gradient} rounded-full transform translate-x-1/2 translate-y-1/2`}></div>
            </div>
            
            {/* Corner decorations */}
            <div className="absolute top-4 left-4 text-2xl opacity-30">✦</div>
            <div className="absolute top-4 right-4 text-2xl opacity-30">✦</div>
            <div className="absolute bottom-4 left-4 text-2xl opacity-30">✦</div>
            <div className="absolute bottom-4 right-4 text-2xl opacity-30">✦</div>

            {/* Header với Logo */}
            <div className="text-center mb-4 sm:mb-6 relative z-10">
              <div className="flex justify-center mb-2">
                <LogoIcon size={48} />
              </div>
              <h1 className={`text-2xl sm:text-4xl font-serif font-bold tracking-wide ${certificate.certType === 'complete' ? 'text-amber-600' : 'text-blue-600'}`}>
                {config.title}
              </h1>
              <p className="text-amber-600 font-medium mt-1 text-sm sm:text-base">{config.subtitle}</p>
            </div>

            {/* Decorative line */}
            <div className="flex items-center gap-4 mb-4 sm:mb-6">
              <div className={`flex-1 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent`}></div>
              <Star className="text-amber-400 w-5 h-5" fill="currentColor" />
              <div className={`flex-1 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent`}></div>
            </div>

            {/* Content */}
            <div className="text-center flex-1 flex flex-col justify-center relative z-10">
              <p className="text-gray-600 text-base sm:text-lg mb-2">Chứng nhận</p>
              <h2 className="text-3xl sm:text-5xl font-bold text-gray-800 mb-4 font-serif">
                {certificate.recipientName}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg mb-4 sm:mb-6">
                Đã hoàn thành xuất sắc chương trình
              </p>
              
              {/* Certificate Type Badge */}
              <div className={`inline-block bg-gradient-to-r ${config.gradient} px-6 sm:px-10 py-3 sm:py-5 rounded-xl sm:rounded-2xl mx-auto mb-4 sm:mb-6 shadow-lg`}>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {config.badgeTitle}
                </h3>
                <p className="text-white/90 text-sm sm:text-base">{config.description}</p>
              </div>
              
              {/* Honor Title */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="text-amber-500 w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-lg sm:text-xl font-bold text-amber-600">{certificate.honorTitle}</span>
                <Award className="text-amber-500 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              
              {certificate.isExcellent && (
                <div className="flex items-center justify-center gap-1 text-amber-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-medium">Xuất sắc</span>
                  <Star size={14} fill="currentColor" />
                </div>
              )}
              
              <p className="text-gray-600 mt-4 text-sm sm:text-base">
                Chương trình Tính nhẩm Soroban tại <span className="font-bold text-purple-600">Sorokid Education</span>
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end mt-4 sm:mt-6 relative z-10">
              {/* Date */}
              <div className="text-left">
                <p className="text-gray-500 text-xs sm:text-sm">Ngày cấp</p>
                <p className="font-medium text-gray-700 text-sm sm:text-base">{formatDate(certificate.issuedAt)}</p>
              </div>

              {/* Logo Sorokid Education */}
              <div className="text-center flex flex-col items-center">
                <LogoIcon size={40} />
                <p className="font-bold text-purple-600 text-sm sm:text-base mt-1">Sorokid Education</p>
                <p className="text-xs text-gray-400">sorokid.com</p>
              </div>

              {/* QR Code */}
              <div className="text-right">
                {qrCodeUrl && (
                  <div className="inline-block bg-white p-1 border rounded shadow-sm">
                    <img src={qrCodeUrl} alt="QR Verify" className="w-16 h-16 sm:w-20 sm:h-20" />
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">Quét để xác minh</p>
              </div>
            </div>

            {/* Certificate Code */}
            <div className="text-center mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400 font-mono flex items-center justify-center gap-2">
                <CheckCircle size={12} className="text-green-500" />
                Mã chứng chỉ: {certificate.code}
              </p>
            </div>
          </div>
        </div>

        {/* Verify info */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg print:hidden">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <CheckCircle className="text-green-500" />
            Xác minh chứng chỉ
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            Chứng chỉ này có thể được xác minh bằng cách quét mã QR hoặc truy cập đường dẫn sau:
          </p>
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-3">
            <code className="text-sm text-gray-700 flex-1 break-all font-mono">
              {`${typeof window !== 'undefined' ? window.location.origin : ''}/api/certificate/verify/${certificate.code}`}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/api/certificate/verify/${certificate.code}`
                );
                toast.success('Đã copy link!');
              }}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Copy link"
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
