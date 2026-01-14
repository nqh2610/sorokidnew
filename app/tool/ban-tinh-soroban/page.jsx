import dynamic from 'next/dynamic';
import ToolLoadingSkeleton from '@/components/ToolLayout/ToolLoadingSkeleton';

/**
 * 🧮 Bàn Tính Soroban - Page với Dynamic Import
 * 
 * Tối ưu hiệu suất:
 * - SSR: false → Không render trên server
 * - Layout giữ metadata SEO → Google crawl được
 * - Client load và chạy tool
 */
const SorobanClient = dynamic(
  () => import('./SorobanClient'),
  {
    ssr: false,
    loading: () => (
      <ToolLoadingSkeleton 
        toolKey="soroban"
        toolIcon="🧮"
      />
    ),
  }
);

export default function SorobanPage() {
  return <SorobanClient />;
}
