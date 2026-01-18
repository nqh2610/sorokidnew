'use client';

/**
 * 🌍 HOMEPAGE HERO SECTION - Client Component for i18n
 * 
 * Wrap hero section với i18n support
 * Hiển thị nội dung theo ngôn ngữ người dùng chọn
 */

import { useI18n } from '@/lib/i18n/I18nContext';
import { LocalizedLink } from '@/components/LocalizedLink';
import { Sparkles } from 'lucide-react';

export default function HeroContent() {
  const { locale } = useI18n();
  
  // Text theo ngôn ngữ
  const texts = {
    vi: {
      badge: 'Phương pháp Soroban từ Nhật Bản',
      title1: 'Toán tư duy',
      title2: 'Tính nhẩm siêu nhanh',
      title3: 'Học mà chơi, chơi mà học!',
      description: 'Ứng dụng học toán Soroban dành cho học sinh tiểu học.',
      highlight: ' Từ sợ toán thành yêu toán chỉ sau vài tuần!',
      cta: 'Đăng ký ngay',
      benefits: [
        { icon: "👨‍👩‍👧", text: "Ba mẹ dễ dàng kèm con" },
        { icon: "🎮", text: "Vui như chơi game" },
        { icon: "⏰", text: "Linh hoạt thời gian" },
        { icon: "📈", text: "Thấy rõ tiến bộ từng ngày" }
      ],
    },
    en: {
      badge: 'Trusted by 12,000+ families worldwide',
      title1: 'Build Math Confidence',
      title2: 'That Lasts',
      title3: 'Mental math made simple—through visual learning kids actually enjoy.',
      description: 'Sorokid helps children ages 4-12 develop strong mental math skills using a proven visual method.',
      highlight: 'Join thousands of families building math confidence at home.',
      cta: 'Start Free Trial',
      benefits: [
        { icon: "📚", text: "Self-paced learning" },
        { icon: "👁️", text: "Visual method" },
        { icon: "⏱️", text: "10 min/day" },
        { icon: "📊", text: "Track progress" }
      ],
    }
  };
  
  const t = texts[locale] || texts.vi;
  
  return (
    <div className="text-center mb-10">
      <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm mb-6">
        <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
        <span className="text-sm font-medium text-gray-600">{t.badge}</span>
        <span className="w-6 h-4 bg-white border border-gray-300 rounded flex items-center justify-center shadow-sm" aria-label="Japan Flag" role="img">
          <span className="w-3 h-3 bg-red-600 rounded-full"></span>
        </span>
      </div>
      
      <h1 id="hero-heading" className="font-black mb-4 sm:mb-6">
        <span className="block text-2xl sm:text-4xl lg:text-6xl leading-tight pb-1 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-violet-500">
          {t.title1}
        </span>
        <span className="block text-2xl sm:text-4xl lg:text-6xl leading-tight pt-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-500">
          {t.title2}
        </span>
        <span className="block text-lg sm:text-2xl lg:text-3xl mt-2 text-gray-800 font-bold">
          {t.title3}
        </span>
      </h1>

      <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
        {t.description}
        <strong className="text-violet-600">{t.highlight}</strong>
      </p>

      <div className="flex justify-center mb-8 px-4">
        <LocalizedLink href="/register" className="group px-8 py-4 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white rounded-full text-lg font-bold shadow-xl hover:shadow-violet-500/30 transform hover:scale-105 transition-all flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5" />
          {t.cta}
        </LocalizedLink>
      </div>

      {/* Benefits badges */}
      <div className="flex flex-wrap justify-center gap-3 px-4">
        {t.benefits.map((benefit, index) => (
          <div key={index} className="flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm">
            <span>{benefit.icon}</span>
            <span className="text-sm font-medium text-gray-700">{benefit.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
