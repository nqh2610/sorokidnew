import XucXacWrapper from './XucXacWrapper';

export const metadata = {
  title: 'Xúc Xắc 3D - Lắc Xúc Xắc Online Miễn Phí | SoroKid',
  description: 'Công cụ lắc xúc xắc 3D trực tuyến cho giáo viên và học sinh. Hiệu ứng 3D đẹp mắt, hỗ trợ 1-6 xúc xắc, miễn phí không cần đăng nhập.',
  keywords: ['xúc xắc 3D', 'lắc xúc xắc online', 'dice roller', 'tool giáo viên', 'trò chơi lớp học', 'random dice'],
  openGraph: {
    title: 'Xúc Xắc 3D - Lắc Xúc Xắc Online Miễn Phí',
    description: 'Lắc xúc xắc 3D đẹp mắt, hỗ trợ 1-6 viên xúc xắc cùng lúc!',
    type: 'website',
    images: ['/blog/xuc-xac-3d-cong-cu-random-vui-nhon-trong-lop-hoc.png'],
  },
};

export default function XucXac3DPage() {
  return <XucXacWrapper />;
}
