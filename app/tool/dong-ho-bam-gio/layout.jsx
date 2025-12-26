/**
 * ⏱️ Đồng Hồ Bấm Giờ - SEO Metadata
 */

export const metadata = {
  title: 'Đồng Hồ Bấm Giờ - Timer Lớp Học Màn Hình Lớn',
  description: 'Đồng hồ đếm ngược cho lớp học, hiển thị to rõ trên máy chiếu. Có âm thanh báo, màu sắc thay đổi, sóng não tập trung. Miễn phí cho giáo viên.',
  keywords: [
    'đồng hồ bấm giờ',
    'timer lớp học',
    'đếm ngược',
    'countdown timer',
    'timer máy chiếu',
    'đồng hồ đếm ngược online',
    'classroom timer',
    'pomodoro timer',
  ],
  openGraph: {
    title: 'Đồng Hồ Bấm Giờ - Timer Cho Lớp Học',
    description: 'Đồng hồ đếm ngược màn hình lớn, âm thanh báo, sóng não tập trung.',
    url: 'https://sorokid.com/tool/dong-ho-bam-gio',
    images: ['/og-dong-ho.png'],
    type: 'website',
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/dong-ho-bam-gio',
  },
};

function generateJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Đồng Hồ Bấm Giờ',
    'applicationCategory': 'EducationalApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'VND',
    },
    'description': 'Đồng hồ đếm ngược cho lớp học với màn hình lớn, âm thanh báo và sóng não tập trung.',
    'featureList': [
      'Đếm ngược với âm thanh báo',
      'Màu sắc thay đổi theo thời gian',
      'Hiển thị toàn màn hình',
      'Preset thời gian sẵn có',
      'Âm thanh sóng não tập trung',
      'Âm thanh thiên nhiên thư giãn',
    ],
    'audience': {
      '@type': 'EducationalAudience',
      'educationalRole': 'teacher',
    },
    'educationalUse': [
      'Giới hạn thời gian thảo luận',
      'Làm bài kiểm tra nhanh',
      'Pomodoro học tập',
      'Kiểm soát hoạt động nhóm',
    ],
  };
}

export default function DongHoBamGioLayout({ children }) {
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
