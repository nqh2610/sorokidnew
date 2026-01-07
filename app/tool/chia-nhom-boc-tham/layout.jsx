/**
 * 🎲 Chia Nhóm & Bốc Thăm - SEO Metadata
 */

export const metadata = {
  title: 'Chia Nhóm & Bốc Thăm - Tool 2 Trong 1 Cho Giáo Viên | SoroKid',
  description: 'Công cụ chia nhóm ngẫu nhiên kết hợp bốc thăm học sinh. Tự động chọn nhóm trưởng, animation đẹp mắt. Miễn phí, không cần đăng nhập.',
  keywords: [
    'chia nhóm ngẫu nhiên',
    'bốc thăm học sinh', 
    'tool chia nhóm',
    'random team generator',
    'tool giáo viên',
    'chia nhóm lớp học',
    'random student picker'
  ],
  openGraph: {
    title: 'Chia Nhóm & Bốc Thăm - Tool 2 Trong 1',
    description: 'Chia nhóm ngẫu nhiên + Bốc thăm học sinh trong cùng 1 tool. Tiện lợi cho giáo viên!',
    type: 'website',
    images: ['/blog/chia-nhom-hoc-sinh.jpg'],
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/chia-nhom-boc-tham',
  },
};

export default function ChiaNhomBocThamLayout({ children }) {
  return children;
}
