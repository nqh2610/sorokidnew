/**
 * 🎡 Chiếc Nón Kỳ Diệu - SEO Metadata
 */

export const metadata = {
  title: 'Chiếc Nón Kỳ Diệu - Quay Số Ngẫu Nhiên Cho Lớp Học',
  description: 'Tool quay số ngẫu nhiên để gọi học sinh, chọn câu hỏi, phân công nhiệm vụ. Vòng quay may mắn hấp dẫn cho mọi cấp học từ Tiểu học đến THPT. Miễn phí, không cần đăng nhập.',
  keywords: [
    'quay số ngẫu nhiên',
    'gọi học sinh ngẫu nhiên',
    'vòng quay may mắn',
    'chiếc nón kỳ diệu',
    'random picker',
    'chọn tên ngẫu nhiên',
    'tool cho giáo viên',
    'công cụ lớp học',
    'hoạt động khởi động',
  ],
  openGraph: {
    title: 'Chiếc Nón Kỳ Diệu - Quay Số Ngẫu Nhiên',
    description: 'Vòng quay may mắn để gọi học sinh, chọn câu hỏi. Phù hợp mọi cấp học.',
    url: 'https://sorokid.com/tool/chiec-non-ky-dieu',
    images: ['/og-chiec-non-ky-dieu.png'],
    type: 'website',
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/chiec-non-ky-dieu',
  },
};

// JSON-LD Structured Data
function generateJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Chiếc Nón Kỳ Diệu',
    'applicationCategory': 'EducationalApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'VND',
    },
    'description': 'Tool quay số ngẫu nhiên để gọi học sinh, chọn câu hỏi, phân công nhiệm vụ trong lớp học.',
    'featureList': [
      'Quay số ngẫu nhiên',
      'Nhập danh sách tên tùy ý',
      'Hiệu ứng vòng quay đẹp mắt',
      'Âm thanh hồi hộp',
      'Hiển thị toàn màn hình',
      'Loại bỏ tên đã chọn',
    ],
    'audience': {
      '@type': 'EducationalAudience',
      'educationalRole': 'teacher',
    },
    'educationalUse': [
      'Gọi học sinh trả lời',
      'Chọn lượt chơi',
      'Phân công nhiệm vụ',
      'Khởi động tiết học',
    ],
  };
}

export default function ChiecNonKyDieuLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateJsonLd()) }}
      />
      {children}
    </>
  );
}
