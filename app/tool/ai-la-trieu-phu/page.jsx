import DauTruongWrapper from './DauTruongWrapper';

export const metadata = {
  title: 'Ai Là Triệu Phú - Trò Chơi Đố Vui Kiến Thức | SoroKid',
  description: 'Trò chơi Ai Là Triệu Phú phiên bản giáo dục. Tạo câu hỏi tùy chỉnh, 4 trợ giúp hấp dẫn, giao diện đẹp như gameshow. Miễn phí cho giáo viên.',
  keywords: ['ai là triệu phú', 'đố vui kiến thức', 'game show giáo dục', 'tool giáo viên', 'trò chơi lớp học', 'quiz game'],
  openGraph: {
    title: 'Ai Là Triệu Phú - Trò Chơi Đố Vui Kiến Thức',
    description: 'Gameshow Ai Là Triệu Phú trong lớp học - tạo câu hỏi riêng, 4 trợ giúp hấp dẫn!',
    type: 'website',
    images: ['/blog/ai-la-trieu-phu-game-show-kiem-tra-kien-thuc-trong-lop.png'],
  },
};

export default function DauTruongKienThucPage() {
  return <DauTruongWrapper />;
}
