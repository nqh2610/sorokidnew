import dynamic from 'next/dynamic';
import ToolLoadingSkeleton from '@/components/ToolLayout/ToolLoadingSkeleton';

/**
 * 👥 Chia Nhóm - Page với Dynamic Import
 * 
 * Tối ưu hiệu suất:
 * - SSR: false → Không render trên server
 * - Layout giữ metadata SEO → Google crawl được
 * - Client load và chạy tool
 */
const ChiaNhomClient = dynamic(
  () => import('./ChiaNhomClient'),
  {
    ssr: false,
    loading: () => (
      <ToolLoadingSkeleton 
        toolKey="groupMaker"
        toolIcon="👥"
      />
    ),
  }
);

export default function ChiaNhomPage() {
  return <ChiaNhomClient />;
}
