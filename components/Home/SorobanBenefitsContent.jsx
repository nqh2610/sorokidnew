'use client';

/**
 * 🌍 SOROBAN BENEFITS SECTION - Client Component for i18n
 */

import { useI18n } from '@/lib/i18n/I18nContext';

export default function SorobanBenefitsContent() {
  const { locale } = useI18n();
  
  const texts = {
    vi: {
      title: 'Soroban là gì?',
      description: 'Soroban là <strong class="text-violet-600">bàn tính Nhật Bản</strong> được hơn 400 năm lịch sử. Trẻ học Soroban sẽ hình dung bàn tính trong đầu và tính nhẩm <strong class="text-violet-600">nhanh như máy tính</strong> mà không cần giấy bút.',
      benefits: [
        { icon: '🧠', title: 'Phát triển não bộ', desc: 'Kích hoạt cả não trái (logic) và não phải (hình ảnh)' },
        { icon: '⚡', title: 'Tính nhẩm siêu nhanh', desc: 'Cộng trừ 2-3 chữ số trong vài giây, không cần giấy bút' },
        { icon: '🎯', title: 'Rèn tập trung', desc: 'Chú ý từng bước, áp dụng vào mọi môn học' },
        { icon: '🌏', title: 'Phương pháp toàn cầu', desc: 'Phổ biến tại Nhật, Hàn, Trung Quốc, Malaysia...' },
      ],
      whyTitle: '✨ Tại sao chọn Sorokid?',
      whySubtitle: 'Phụ huynh không cần biết Soroban vẫn kèm con học được!',
      whyPoints: [
        '✓ Hướng dẫn từng bước bằng hình ảnh',
        '✓ Game hóa - con tự giác học',
        '✓ Theo dõi: chăm chỉ, tốc độ, chính xác',
      ],
    },
    en: {
      title: 'The Power of Visual Learning',
      description: 'Our method helps children <strong class="text-violet-600">visualize numbers</strong> and operations in their mind. Rather than rote memorization, kids develop <strong class="text-violet-600">genuine number sense</strong>—the foundation for lasting math confidence.',
      benefits: [
        { icon: '🧠', title: 'Engages Both Sides of the Brain', desc: 'Combines logical reasoning with visual-spatial thinking for deeper understanding' },
        { icon: '⚡', title: 'Builds Mental Calculation Skills', desc: 'Children learn to solve problems in their head, reducing dependence on calculators' },
        { icon: '🎯', title: 'Improves Focus & Concentration', desc: 'The step-by-step method naturally builds attention skills that help in all subjects' },
        { icon: '🌏', title: 'Based on Proven Methods', desc: 'Rooted in visual arithmetic techniques used successfully around the world' },
      ],
      whyTitle: '✨ Designed for Busy Families',
      whySubtitle: 'No teaching experience required—the app guides your child through every lesson',
      whyPoints: [
        '✓ Kids learn independently with clear instructions',
        '✓ Game-based approach keeps them engaged',
        '✓ Track progress anytime from your phone',
      ],
    }
  };
  
  const t = texts[locale] || texts.vi;
  const colors = ['from-blue-400 to-blue-600', 'from-violet-400 to-violet-600', 'from-pink-400 to-pink-600', 'from-amber-400 to-amber-600'];
  
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-violet-50/50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-3">
            {t.title}
          </h2>
          <p 
            className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t.description }}
          />
        </div>

        {/* 4 Benefits Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          {t.benefits.map((benefit, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center`}>
                <span className="text-2xl sm:text-3xl">{benefit.icon}</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2">{benefit.title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>

        {/* Why Sorokid Banner */}
        <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-2xl p-5 sm:p-6 shadow-lg">
          <div className="text-center mb-4">
            <h3 className="font-bold text-lg sm:text-xl text-white mb-2">{t.whyTitle}</h3>
            <p className="text-white/90 text-sm sm:text-base">
              <strong>{t.whySubtitle}</strong>
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 max-w-4xl mx-auto">
            {t.whyPoints.map((point, idx) => (
              <span key={idx} className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm bg-white/20 text-white px-3 py-2 rounded-full text-center">
                {point}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
