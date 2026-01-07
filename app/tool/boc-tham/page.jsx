import dynamic from 'next/dynamic';
import ToolLoadingSkeleton from '@/components/ToolLayout/ToolLoadingSkeleton';

/**
 * 🎫 Bốc Thăm - Page với Dynamic Import
 * 
 * Tối ưu hiệu suất:
 * - SSR: false → Không render trên server
 * - Layout giữ metadata SEO → Google crawl được
 * - Client load và chạy tool
 */
const BocThamClient = dynamic(
  () => import('./BocThamClient'),
  {
    ssr: false,
    loading: () => (
      <ToolLoadingSkeleton 
        toolName="Bốc Thăm"
        toolIcon="🎫"
        message="Đang chuẩn bị bốc thăm..."
      />
    ),
  }
);

export default function BocThamPage() {
  return <BocThamClient />;
}
