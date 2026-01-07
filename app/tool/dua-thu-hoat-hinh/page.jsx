import dynamic from 'next/dynamic';
import ToolLoadingSkeleton from '@/components/ToolLayout/ToolLoadingSkeleton';

/**
 * 🦆 Đua Vịt Sông Nước - Page với Dynamic Import
 * 
 * Tối ưu hiệu suất:
 * - SSR: false → Không render trên server, giảm server load
 * - Layout giữ metadata SEO → Google vẫn crawl được
 * - Client tải và chạy tool → Tận dụng tài nguyên client
 */
const DuaThuClient = dynamic(
  () => import('./DuaThuClient'),
  {
    ssr: false,
    loading: () => (
      <ToolLoadingSkeleton 
        toolName="Đua Vịt Sông Nước"
        toolIcon="🦆"
        message="Đang chuẩn bị đường đua..."
      />
    ),
  }
);

export default function DuaThuPage() {
  return <DuaThuClient />;
}
