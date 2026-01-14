import dynamic from 'next/dynamic';
import ToolLoadingSkeleton from '@/components/ToolLayout/ToolLoadingSkeleton';

/**
 * 🚦 Đèn May Mắn - Page với Dynamic Import
 * 
 * Tối ưu hiệu suất:
 * - SSR: false → Không render trên server
 * - Layout giữ metadata SEO → Google crawl được
 * - Client load và chạy tool
 */
const DenMayManClient = dynamic(
  () => import('./DenMayManClient'),
  {
    ssr: false,
    loading: () => (
      <ToolLoadingSkeleton 
        toolKey="luckyLight"
        toolIcon="🚦"
      />
    ),
  }
);

export default function DenMayManPage() {
  return <DenMayManClient />;
}
