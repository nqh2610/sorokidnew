/**
 * 🚀 HOMEPAGE - STATIC GENERATION
 * 
 * TỐI ƯU:
 * - Loại bỏ 'use client' cho phần lớn page (SSG)
 * - Dynamic import cho Soroban components (chỉ load khi cần)
 * - Giảm TTFB và LCP đáng kể
 * 
 * SEO:
 * - Structured data JSON-LD
 * - Semantic HTML (header, main, section, footer)
 * - Proper heading hierarchy (h1 > h2 > h3)
 */
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Script from 'next/script';

// Structured Data cho SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://sorokid.com/#website',
      'url': 'https://sorokid.com',
      'name': 'Sorokid',
      'description': 'Nền tảng học Soroban trực tuyến #1 Việt Nam',
      'inLanguage': 'vi',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://sorokid.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@type': 'Organization',
      '@id': 'https://sorokid.com/#organization',
      'name': 'Sorokid',
      'url': 'https://sorokid.com',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://sorokid.com/logo.png'
      },
      'sameAs': [
        'https://facebook.com/sorokid',
        'https://youtube.com/@sorokid'
      ]
    },
    {
      '@type': 'WebPage',
      '@id': 'https://sorokid.com/#webpage',
      'url': 'https://sorokid.com',
      'name': 'Sorokid - Học Soroban Online | Tính Nhẩm Nhanh Cho Trẻ Em',
      'isPartOf': { '@id': 'https://sorokid.com/#website' },
      'about': { '@id': 'https://sorokid.com/#organization' },
      'description': 'Học Soroban online miễn phí cho trẻ em. Game hóa học tập, bài học khoa học, luyện tính nhẩm nhanh.',
      'inLanguage': 'vi'
    },
    {
      '@type': 'EducationalOrganization',
      'name': 'Sorokid',
      'description': 'Nền tảng học Soroban trực tuyến cho học sinh tiểu học Việt Nam',
      'url': 'https://sorokid.com',
      'areaServed': {
        '@type': 'Country',
        'name': 'Vietnam'
      },
      'educationalCredentialAwarded': 'Chứng chỉ Soroban các cấp độ'
    },
    {
      '@type': 'Course',
      'name': 'Khóa học Soroban Online',
      'description': 'Học tính nhẩm Soroban từ cơ bản đến nâng cao cho học sinh tiểu học',
      'provider': {
        '@type': 'Organization',
        'name': 'Sorokid'
      },
      'educationalLevel': 'Tiểu học',
      'teaches': ['Tính nhẩm', 'Soroban', 'Toán tư duy', 'Anzan'],
      'availableLanguage': 'vi',
      'isAccessibleForFree': true
    },
    {
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'Soroban là gì?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Soroban là bàn tính Nhật Bản, giúp trẻ em phát triển khả năng tính nhẩm nhanh và tư duy logic.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Sorokid phù hợp với độ tuổi nào?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Sorokid phù hợp với học sinh tiểu học từ 6-12 tuổi, nhưng cũng có thể dành cho người lớn muốn học tính nhẩm.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Học Soroban online có hiệu quả không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Sorokid sử dụng phương pháp game hóa học tập, bàn tính ảo tương tác, giúp trẻ học hiệu quả và thú vị hơn.'
          }
        }
      ]
    }
  ]
};
import { 
  BookOpen, Trophy, Target, Gamepad2, BarChart3, 
  Zap, Clock, Award, TrendingUp, Sparkles
} from 'lucide-react';
import Logo from '@/components/Logo/Logo';

// 🔧 DYNAMIC IMPORTS: Chỉ load Soroban components ở client khi cần
// Giảm ~30% initial JS bundle
const CompactSoroban = dynamic(
  () => import('@/components/FloatingSoroban/CompactSoroban'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-32 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-4xl">🧮</span>
      </div>
    )
  }
);

const SorobanBoard = dynamic(
  () => import('@/components/Soroban/SorobanBoard'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-48 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-6xl">🧮</span>
      </div>
    )
  }
);

// Static data - không thay đổi
const features = [
  {
    icon: <Gamepad2 className="w-8 h-8" />,
    title: "Học như chơi game",
    description: "Điểm thưởng, sao, kim cương... khiến việc luyện tính nhẩm thú vị như chơi game yêu thích!",
    color: "from-blue-500 to-violet-500",
    emoji: "🎮"
  },
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: "Bài học sinh động",
    description: "Từ cơ bản đến nâng cao theo phương pháp Soroban Nhật Bản. Dễ hiểu, dễ nhớ, dễ áp dụng.",
    color: "from-violet-500 to-purple-500",
    emoji: "📚"
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Phản xạ nhanh hơn",
    description: "Bài tập đa dạng giúp bé tính toán nhanh và chính xác hơn mỗi ngày. Kết quả thấy rõ sau 2 tuần!",
    color: "from-amber-500 to-orange-500",
    emoji: "⚡"
  },
  {
    icon: <Trophy className="w-8 h-8" />,
    title: "Thi đua vui vẻ",
    description: "Bảng xếp hạng, giải đấu với bạn bè. Động lực học tập tăng vọt khi có đối thủ!",
    color: "from-yellow-500 to-amber-500",
    emoji: "🏆"
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: "Nhiệm vụ mỗi ngày",
    description: "Quest hằng ngày giúp bé duy trì thói quen tự học. Hoàn thành = nhận thưởng!",
    color: "from-pink-500 to-rose-500",
    emoji: "🎯"
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Báo cáo chi tiết",
    description: "Ba mẹ nắm rõ con học đến đâu: tốc độ, độ chính xác, thời gian học mỗi ngày.",
    color: "from-cyan-500 to-blue-500",
    emoji: "📊"
  }
];

const userTypes = [
  {
    title: "Học sinh 6-12 tuổi",
    description: "Học qua game thú vị, nhận thưởng khi hoàn thành bài, thi đua cùng bạn bè. Tự tin giơ tay phát biểu!",
    color: "bg-gradient-to-br from-blue-500 to-violet-500",
    emoji: "👦"
  },
  {
    title: "Phụ huynh", 
    description: "Công cụ kèm con tự học tại nhà hiệu quả. Biết con tiến bộ từng ngày, không cần đưa đón đi học thêm.",
    color: "bg-gradient-to-br from-violet-500 to-purple-500",
    emoji: "👨‍👩‍👧"
  },
  {
    title: "Giáo viên",
    description: "Công cụ dạy học hiện đại, giao bài - chấm điểm tự động. Cá nhân hóa theo năng lực từng học sinh.",
    color: "bg-gradient-to-br from-pink-500 to-rose-500",
    emoji: "👩‍🏫"
  }
];

export default function HomePage() {

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50">
        {/* Header Navigation */}
        <header role="banner">
          <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50" aria-label="Main navigation">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
              <Logo size="md" />
              <div className="flex gap-2 sm:gap-3">
                <Link href="/login" className="px-3 sm:px-6 py-2 text-sm sm:text-base text-violet-600 font-bold hover:bg-violet-50 rounded-full transition-all" aria-label="Đăng nhập vào tài khoản">
                  Đăng nhập
                </Link>
                <Link href="/register" className="px-3 sm:px-6 py-2 text-sm sm:text-base bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white font-bold rounded-full hover:scale-105 transition-all shadow-lg" aria-label="Đăng ký tài khoản miễn phí">
                  Đăng ký
                </Link>
              </div>
            </div>
          </nav>
        </header>

        <main role="main">

        {/* Hero Section */}
        <section className="relative overflow-hidden" aria-labelledby="hero-heading">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-violet-400/10 to-pink-400/10" aria-hidden="true" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-20">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm mb-6">
                <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-600">Phương pháp Soroban từ Nhật Bản</span>
                <span className="w-6 h-4 bg-white border border-gray-300 rounded flex items-center justify-center shadow-sm" aria-label="Cờ Nhật Bản" role="img">
                  <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                </span>
              </div>
              
              <h1 id="hero-heading" className="text-2xl sm:text-4xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500">
                  Tính nhẩm siêu nhanh
                </span>
                <br />
                <span className="text-gray-800">Chơi mà học, học mà chơi!</span>
              </h1>
              
              <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Ứng dụng học tính nhẩm Soroban dành cho học sinh tiểu học. 
              <strong className="text-violet-600"> Từ sợ toán thành yêu toán chỉ sau vài tuần!</strong>
            </p>

            <div className="flex justify-center mb-8 px-4">
              <Link href="/register" className="group px-8 py-4 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white rounded-full text-lg font-bold shadow-xl hover:shadow-violet-500/30 transform hover:scale-105 transition-all flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Đăng ký ngay
              </Link>
            </div>

            {/* Benefits badges */}
            <div className="flex flex-wrap justify-center gap-3 px-4">
              {[
                { icon: "🧠", text: "Phát triển tư duy" },
                { icon: "⚡", text: "Tính nhẩm siêu nhanh" },
                { icon: "🎯", text: "Tăng tập trung" },
                { icon: "😊", text: "Học mà vui" }
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm">
                  <span>{benefit.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

            {/* Soroban Demo */}
            <div className="max-w-4xl mx-auto" role="region" aria-labelledby="soroban-demo-heading">
              <div className="text-center mb-6">
                <h2 id="soroban-demo-heading" className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  <span aria-hidden="true">🧮</span> Thử ngay bàn tính ảo!
                </h2>
                <p className="text-gray-600">Click vào các hạt để di chuyển lên/xuống</p>
              </div>
            
            {/* Mobile */}
            <div className="md:hidden px-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/50">
                <CompactSoroban />
              </div>
            </div>
            {/* Desktop */}
            <div className="hidden md:block px-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/50">
                <SorobanBoard />
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Features Section - Tính năng học Soroban online */}
        <section className="py-12 sm:py-20 bg-white" aria-labelledby="features-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 id="features-heading" className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-4">
                <span aria-hidden="true">✨</span> Tại sao trẻ thích học cùng Sorokid?
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
                Sorokid được thiết kế đặc biệt cho học sinh tiểu học với giao diện đơn giản, bắt mắt
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
              {features.map((feature, index) => (
                <article key={index} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-violet-200 hover:-translate-y-1" role="listitem">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`} aria-hidden="true">
                    {feature.icon}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl" aria-hidden="true">{feature.emoji}</span>
                    <h3 className="text-xl font-bold text-gray-800">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works - Lộ trình học Soroban */}
        <section className="py-12 sm:py-20 bg-gradient-to-br from-violet-50 to-pink-50" aria-labelledby="roadmap-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 id="roadmap-heading" className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-4">
                <span aria-hidden="true">📈</span> Lộ trình học tập khoa học
              </h2>
              <p className="text-gray-600 text-lg">Từ chưa biết gì đến tính nhẩm nhanh như máy tính!</p>
            </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Học lý thuyết", desc: "Làm quen với bàn tính Soroban qua bài học sinh động", icon: "📖", color: "bg-blue-500" },
              { step: "2", title: "Thực hành", desc: "Luyện tập với bài tập từ dễ đến khó", icon: "✍️", color: "bg-violet-500" },
              { step: "3", title: "Luyện tập", desc: "Tăng tốc độ và độ chính xác qua các bài luyện", icon: "🏃", color: "bg-pink-500" },
              { step: "4", title: "Thi đấu", desc: "Thử thách bản thân, xếp hạng cùng bạn bè", icon: "🏆", color: "bg-amber-500" }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg text-center h-full">
                  <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4`}>
                    {item.step}
                  </div>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-300 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* Measurement System - Theo dõi tiến độ học Soroban */}
        <section className="py-12 sm:py-20 bg-white" aria-labelledby="progress-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 id="progress-heading" className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-6">
                  <span aria-hidden="true">📊</span> Phụ huynh yên tâm theo dõi con
                </h2>
              <p className="text-gray-600 text-lg mb-8">
                Hệ thống tự động đánh giá và đo lường sự tiến bộ của học sinh qua từng bài học.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: <Clock className="w-6 h-6" />, label: "Tốc độ tính toán", desc: "Đo thời gian hoàn thành mỗi bài", color: "text-blue-500" },
                  { icon: <Target className="w-6 h-6" />, label: "Độ chính xác", desc: "Tỷ lệ trả lời đúng", color: "text-violet-500" },
                  { icon: <TrendingUp className="w-6 h-6" />, label: "Tính chăm chỉ", desc: "Số ngày học liên tiếp (streak)", color: "text-pink-500" },
                  { icon: <Award className="w-6 h-6" />, label: "Thành tích", desc: "Huy hiệu, level, điểm kinh nghiệm", color: "text-amber-500" }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 bg-gray-50 rounded-xl p-4">
                    <div className={`${item.color} bg-white rounded-lg p-2 shadow-sm`}>{item.icon}</div>
                    <div>
                      <div className="font-bold text-gray-800">{item.label}</div>
                      <div className="text-gray-600 text-sm">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">🎁 Hệ thống phần thưởng</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "⭐", label: "Sao", desc: "Nhận khi hoàn thành bài học" },
                  { icon: "💎", label: "Kim cương", desc: "Phần thưởng đặc biệt" },
                  { icon: "🏅", label: "Huy hiệu", desc: "Đạt thành tích nổi bật" },
                  { icon: "🎖️", label: "Cấp bậc", desc: "Thăng cấp khi tích điểm" }
                ].map((item, index) => (
                  <div key={index} className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="font-bold">{item.label}</div>
                    <div className="text-xs text-white/80">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* User Types - Đối tượng học Soroban */}
        <section className="py-12 sm:py-20 bg-gradient-to-br from-blue-50 to-violet-50" aria-labelledby="users-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 id="users-heading" className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-4">
                <span aria-hidden="true">👥</span> Ai nên dùng Sorokid?
              </h2>
              <p className="text-gray-600 text-lg">Phù hợp với mọi người muốn con giỏi toán tư duy</p>
            </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {userTypes.map((type, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
                <div className={`${type.color} p-6 text-white text-center`}>
                  <div className="text-5xl mb-2">{type.emoji}</div>
                  <h3 className="text-xl font-bold">{type.title}</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* Highlights - Điểm nổi bật của Sorokid */}
        <section className="py-12 sm:py-20 bg-white" aria-labelledby="highlights-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 id="highlights-heading" className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-4">
                <span aria-hidden="true">💡</span> Vì sao chọn Sorokid?
              </h2>
            </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🎨", title: "Giao diện bắt mắt", desc: "Màu sắc tươi sáng, dễ thương - bé thích ngay từ cái nhìn đầu tiên" },
              { icon: "📱", title: "Học mọi lúc mọi nơi", desc: "Điện thoại, máy tính bảng, laptop - thiết bị nào cũng được" },
              { icon: "🧮", title: "Bàn tính ảo miễn phí", desc: "Không cần mua bàn tính thật, tiết kiệm chi phí cho gia đình" },
              { icon: "🏠", title: "Tự học tại nhà", desc: "Ba mẹ bận cũng yên tâm - con tự học được với hướng dẫn chi tiết" }
            ].map((item, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-2xl hover:bg-violet-50 transition-colors">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* CTA Section - Đăng ký học Soroban */}
        <section className="py-12 sm:py-20 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500" aria-labelledby="cta-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-white">
            <h2 id="cta-heading" className="text-xl sm:text-3xl lg:text-4xl font-black mb-4 sm:mb-6">
              <span aria-hidden="true">🚀</span> Chỉ 15 phút mỗi ngày - Thần đồng tính nhẩm trong tầm tay!
            </h2>
            <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Hơn 10.000 học sinh đã tính nhẩm nhanh hơn sau 3 tháng. Sẵn sàng cho con bạn chưa?
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link href="/register" className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-violet-600 rounded-full text-base sm:text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all" aria-label="Đăng ký học Soroban miễn phí">
                Đăng ký miễn phí
              </Link>
              <Link href="/login" className="px-6 sm:px-8 py-3 sm:py-4 bg-white/20 backdrop-blur text-white rounded-full text-base sm:text-lg font-bold hover:bg-white/30 transition-all border-2 border-white/50" aria-label="Đăng nhập vào tài khoản Sorokid">
                Đã có tài khoản? Đăng nhập
              </Link>
            </div>
          </div>
        </section>

        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 sm:py-12" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <Logo size="md" />
                <span className="text-gray-400" aria-hidden="true">|</span>
                <span className="text-gray-400">Học toán tính nhanh vui như chơi game</span>
              </div>
              <nav aria-label="Footer navigation">
                <ul className="flex flex-wrap justify-center gap-6 text-gray-400">
                  <li><Link href="/learn" className="hover:text-white transition-colors">Bài học</Link></li>
                  <li><Link href="/practice" className="hover:text-white transition-colors">Luyện tập</Link></li>
                  <li><Link href="/compete" className="hover:text-white transition-colors">Thi đấu</Link></li>
                  <li><Link href="/leaderboard" className="hover:text-white transition-colors">Xếp hạng</Link></li>
                </ul>
              </nav>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
              <p>© 2024 Sorokid. Phát triển với <span aria-label="tình yêu">❤️</span> cho học sinh Việt Nam.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
