import dynamic from 'next/dynamic';

const XucXac3DClient = dynamic(() => import('./XucXac3DClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Đang tải...</div>
    </div>
  ),
});

export const metadata = {
  title: 'Xúc Xắc 3D - Lắc Xúc Xắc Online Miễn Phí | SoroKid',
  description: 'Công cụ lắc xúc xắc 3D trực tuyến cho giáo viên và học sinh. Hiệu ứng 3D đẹp mắt, hỗ trợ 1-6 xúc xắc, miễn phí không cần đăng nhập.',
  keywords: ['xúc xắc 3D', 'lắc xúc xắc online', 'dice roller', 'tool giáo viên', 'trò chơi lớp học', 'random dice'],
  openGraph: {
    title: 'Xúc Xắc 3D - Lắc Xúc Xắc Online Miễn Phí',
    description: 'Lắc xúc xắc 3D đẹp mắt, hỗ trợ 1-6 viên xúc xắc cùng lúc!',
    type: 'website',
  },
};

export default function XucXac3DPage() {
  return <XucXac3DClient />;
}
