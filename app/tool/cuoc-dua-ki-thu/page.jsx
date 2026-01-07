import dynamic from 'next/dynamic';

// Dynamic import để tránh SSR issues với Web Audio API
const CuocDuaClient = dynamic(
  () => import('./CuocDuaClient').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 
        flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏁</div>
          <p className="text-white/80">Đang chuẩn bị cuộc đua...</p>
        </div>
      </div>
    )
  }
);

export const metadata = {
  title: 'Cuộc Đua Kì Thú - Tool Chấm Điểm Thi Đua Nhóm | SoroKid',
  description: 'Trò chơi cuộc đua kì thú giúp giáo viên chấm điểm, thi đua nhóm và tạo động lực học tập trong lớp học. Miễn phí, không cần đăng nhập.',
  keywords: ['cuộc đua kì thú', 'chấm điểm nhóm', 'thi đua lớp học', 'game học tập', 'tool giáo viên', 'gamification'],
  openGraph: {
    title: 'Cuộc Đua Kì Thú - Thi Đua Điểm Số Cho Lớp Học',
    description: 'Ai dẫn đầu? Ai tăng nhanh nhất? Game thi đua điểm số vui nhộn!',
    type: 'website',
    images: ['/blog/cuoc-dua-ki-thu-bien-lop-hoc-thanh-duong-dua.png'],
  },
};

export default function CuocDuaPage() {
  return <CuocDuaClient />;
}
