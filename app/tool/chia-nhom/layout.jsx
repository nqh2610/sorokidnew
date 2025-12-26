/**
 * 👥 Chia Nhóm - SEO Metadata
 */

export const metadata = {
  title: 'Chia Nhóm Ngẫu Nhiên - Tạo Nhóm Học Tập Nhanh',
  description: 'Công cụ chia nhóm học sinh ngẫu nhiên, công bằng. Chọn số nhóm hoặc số người/nhóm, tự động chọn nhóm trưởng. Phù hợp THPT lớp đông. Miễn phí.',
  keywords: [
    'chia nhóm ngẫu nhiên',
    'tạo nhóm học tập',
    'chia team',
    'random group',
    'nhóm học sinh',
    'group generator',
    'chia nhóm online',
    'team picker',
  ],
  openGraph: {
    title: 'Chia Nhóm Ngẫu Nhiên - Tổ Chức Nhóm Nhanh',
    description: 'Công cụ chia nhóm ngẫu nhiên, công bằng. Tự động chọn nhóm trưởng.',
    url: 'https://sorokid.com/tool/chia-nhom',
    images: ['/og-chia-nhom.png'],
    type: 'website',
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/chia-nhom',
  },
};

function generateJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Chia Nhóm Ngẫu Nhiên',
    'applicationCategory': 'EducationalApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'VND',
    },
    'description': 'Công cụ chia nhóm học sinh ngẫu nhiên, công bằng, tự động chọn nhóm trưởng.',
    'featureList': [
      'Chia theo số nhóm hoặc số người',
      'Tự động chọn nhóm trưởng',
      'Hiển thị kết quả rõ ràng',
      'Lưu và chia lại nhanh',
      'Xuất danh sách nhóm',
    ],
    'audience': {
      '@type': 'EducationalAudience',
      'educationalRole': 'teacher',
    },
    'educationalUse': [
      'Tổ chức thảo luận nhóm',
      'Làm project team',
      'Hoạt động học tập hợp tác',
      'Chia đội thi đua',
    ],
  };
}

export default function ChiaNhomLayout({ children }) {
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
