'use client';

/**
 * 🌍 FEATURES SECTION - Client Component for i18n
 */

import { useI18n } from '@/lib/i18n/I18nContext';
import { BookOpen, Trophy, Target, Gamepad2, BarChart3, Zap } from 'lucide-react';

export default function FeaturesContent() {
  const { locale } = useI18n();
  
  const texts = {
    vi: {
      title: '✨ Tại sao trẻ thích học cùng Sorokid?',
      subtitle: 'Sorokid được thiết kế đặc biệt cho học sinh tiểu học với giao diện đơn giản, bắt mắt',
      features: [
        {
          icon: <Gamepad2 className="w-8 h-8" />,
          title: "Học như chơi game",
          description: "Điểm thưởng, sao, kim cương... khiến việc luyện tính nhẩm thú vị như chơi game yêu thích!",
          emoji: "🎮"
        },
        {
          icon: <BookOpen className="w-8 h-8" />,
          title: "Bài học sinh động",
          description: "Từ cơ bản đến nâng cao theo phương pháp Soroban Nhật Bản. Dễ hiểu, dễ nhớ, dễ áp dụng.",
          emoji: "📚"
        },
        {
          icon: <Zap className="w-8 h-8" />,
          title: "Phản xạ nhanh hơn",
          description: "Bài tập đa dạng giúp bé tính toán nhanh và chính xác hơn mỗi ngày. Kết quả thấy rõ sau 2 tuần!",
          emoji: "⚡"
        },
        {
          icon: <Trophy className="w-8 h-8" />,
          title: "Thi đua vui vẻ",
          description: "Bảng xếp hạng, giải đấu với bạn bè. Động lực học tập tăng vọt khi có đối thủ!",
          emoji: "🏆"
        },
        {
          icon: <Target className="w-8 h-8" />,
          title: "Nhiệm vụ mỗi ngày",
          description: "Quest hằng ngày giúp bé duy trì thói quen tự học. Hoàn thành = nhận thưởng!",
          emoji: "🎯"
        },
        {
          icon: <BarChart3 className="w-8 h-8" />,
          title: "Báo cáo chi tiết",
          description: "Ba mẹ nắm rõ con học đến đâu: tốc độ, độ chính xác, thời gian học mỗi ngày.",
          emoji: "📊"
        }
      ],
    },
    en: {
      title: '✨ Why Families Choose Sorokid',
      subtitle: 'A thoughtfully designed program that makes daily math practice enjoyable',
      features: [
        {
          icon: <Gamepad2 className="w-8 h-8" />,
          title: "Learning Through Play",
          description: "Earn stars, unlock levels, and collect rewards. The game-based approach keeps kids motivated and coming back to practice.",
          emoji: "🎮"
        },
        {
          icon: <BookOpen className="w-8 h-8" />,
          title: "Visual, Step-by-Step Lessons",
          description: "Clear animations break down each concept. Kids don't just memorize—they understand how numbers work.",
          emoji: "📚"
        },
        {
          icon: <Zap className="w-8 h-8" />,
          title: "Build Mental Math Skills",
          description: "Regular practice strengthens mental calculation abilities. Watch their confidence grow as skills develop.",
          emoji: "⚡"
        },
        {
          icon: <Trophy className="w-8 h-8" />,
          title: "Friendly Challenges",
          description: "Optional leaderboards and weekly challenges add excitement for kids who enjoy a little competition.",
          emoji: "🏆"
        },
        {
          icon: <Target className="w-8 h-8" />,
          title: "Daily Practice Made Easy",
          description: "Short, focused daily missions help build consistent habits without overwhelming busy schedules.",
          emoji: "🎯"
        },
        {
          icon: <BarChart3 className="w-8 h-8" />,
          title: "Clear Progress Tracking",
          description: "Simple dashboards show what your child has learned and where they can improve next.",
          emoji: "📊"
        }
      ],
    }
  };
  
  const t = texts[locale] || texts.vi;
  const colors = [
    "from-blue-500 to-violet-500",
    "from-violet-500 to-purple-500",
    "from-amber-500 to-orange-500",
    "from-yellow-500 to-amber-500",
    "from-pink-500 to-rose-500",
    "from-cyan-500 to-blue-500"
  ];
  
  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-4">
            {t.title}
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {t.features.map((feature, index) => (
            <article key={index} className="group bg-white rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-violet-200 hover:-translate-y-1">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${colors[index]} flex items-center justify-center text-white mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl sm:text-2xl">{feature.emoji}</span>
                <h3 className="font-bold text-gray-800">{feature.title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
