import dynamic from 'next/dynamic';
import ToolLoadingSkeleton from '@/components/ToolLayout/ToolLoadingSkeleton';

/**
 * ⚡ Flash ZAN - Page với Dynamic Import
 * 
 * Tối ưu hiệu suất:
 * - SSR: false → Không render trên server
 * - Layout giữ metadata SEO → Google crawl được
 * - Client load và chạy tool
 */
const FlashZanClient = dynamic(
  () => import('./FlashZanClient'),
  {
    ssr: false,
    loading: () => (
      <ToolLoadingSkeleton 
        toolKey="flashAnzan"
        toolIcon="⚡"
      />
    ),
  }
);

export default function FlashZanPage() {
  return <FlashZanClient />;
}
