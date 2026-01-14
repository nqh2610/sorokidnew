import dynamic from 'next/dynamic';
import ToolLoadingSkeleton from '@/components/ToolLayout/ToolLoadingSkeleton';

/**
 * ⏱️ Đồng Hồ Bấm Giờ - Page với Dynamic Import
 * 
 * Tối ưu hiệu suất:
 * - SSR: false → Không render trên server
 * - Layout giữ metadata SEO → Google crawl được
 * - Client load và chạy tool
 */
const DongHoBamGioClient = dynamic(
  () => import('./DongHoBamGioClient'),
  {
    ssr: false,
    loading: () => (
      <ToolLoadingSkeleton 
        toolKey="timer"
        toolIcon="⏱️"
      />
    ),
  }
);

export default function DongHoBamGioPage() {
  return <DongHoBamGioClient />;
}
