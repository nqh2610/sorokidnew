import dynamic from 'next/dynamic';
import ToolLoadingSkeleton from '@/components/ToolLayout/ToolLoadingSkeleton';

/**
 * 🎡 Chiếc Nón Kỳ Diệu - Page với Dynamic Import
 * 
 * Tối ưu hiệu suất:
 * - SSR: false → Không render trên server
 * - Layout giữ metadata SEO → Google crawl được
 * - Client load và chạy tool
 */
const ChiecNonClient = dynamic(
  () => import('./ChiecNonClient'),
  {
    ssr: false,
    loading: () => (
      <ToolLoadingSkeleton 
        toolName="Chiếc Nón Kỳ Diệu"
        toolIcon="🎡"
        message="Đang chuẩn bị vòng quay..."
      />
    ),
  }
);

export default function ChiecNonPage() {
  return <ChiecNonClient />;
}
