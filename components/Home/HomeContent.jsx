'use client';

/**
 * 🌍 HOMEPAGE CONTENT - CLIENT COMPONENT
 * 
 * Phần content động theo ngôn ngữ
 * Được wrap trong page.jsx để SEO vẫn có static HTML
 */

import { useI18n } from '@/lib/i18n/I18nContext';
import { LocalizedLink } from '@/components/LocalizedLink';

/**
 * Hero Section - Phần banner chính
 */
export function HeroSection() {
  const { t, locale } = useI18n();
  
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-pink-50 py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span>🎯</span>
            <span>{locale === 'vi' ? 'Ứng dụng học Soroban #1 Việt Nam' : '#1 Soroban Learning App in Vietnam'}</span>
          </div>
          
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 mb-6 leading-tight">
            {t('home.hero.title') || (locale === 'vi' ? 'Cho Con Học Soroban Tại Nhà' : 'Learn Soroban at Home')}
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-violet-600 font-medium mb-4">
            {t('home.hero.subtitle') || (locale === 'vi' 
              ? 'Phụ huynh không cần biết Soroban vẫn kèm con được' 
              : 'Parents don\'t need to know Soroban to guide their kids')}
          </p>
          
          {/* Description */}
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            {t('home.hero.description') || (locale === 'vi'
              ? 'Hướng dẫn từng bước bằng hình ảnh. Con tự học, tự tiến bộ. Game hóa - con TỰ GIÁC muốn học mỗi ngày.'
              : 'Step-by-step visual guide. Kids learn at their own pace. Gamified - kids WANT to learn every day.')}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LocalizedLink
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold rounded-full hover:shadow-lg hover:scale-105 transition-all"
            >
              <span>🚀</span>
              <span>{t('home.hero.cta') || (locale === 'vi' ? 'Bắt đầu miễn phí' : 'Start for Free')}</span>
            </LocalizedLink>
            <LocalizedLink
              href="/tool"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-full hover:border-violet-300 hover:bg-violet-50 transition-all"
            >
              <span>🧰</span>
              <span>{locale === 'vi' ? 'Toolbox Giáo Viên' : 'Teacher Toolbox'}</span>
            </LocalizedLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Features Section - Tính năng nổi bật
 */
export function FeaturesSection() {
  const { t, locale } = useI18n();
  
  const features = [
    {
      icon: '🎮',
      title: t('home.features.gameified.title') || (locale === 'vi' ? 'Học qua game' : 'Learn Through Games'),
      description: t('home.features.gameified.description') || (locale === 'vi' 
        ? 'Trẻ học mà chơi, chơi mà học. Không nhàm chán như học truyền thống.'
        : 'Kids learn while playing. No more boring traditional learning.'),
    },
    {
      icon: '🗺️',
      title: t('home.features.pathway.title') || (locale === 'vi' ? 'Lộ trình rõ ràng' : 'Clear Learning Path'),
      description: t('home.features.pathway.description') || (locale === 'vi'
        ? 'Từ làm quen số đến tính nhẩm Anzan. Mỗi bước đều có hướng dẫn chi tiết.'
        : 'From basic numbers to Anzan mental math. Every step has detailed guidance.'),
    },
    {
      icon: '👨‍👩‍👧',
      title: t('home.features.parentFriendly.title') || (locale === 'vi' ? 'Phụ huynh không cần biết' : 'No Prior Knowledge Required'),
      description: t('home.features.parentFriendly.description') || (locale === 'vi'
        ? 'App hướng dẫn con từng bước. Phụ huynh chỉ cần động viên và theo dõi.'
        : 'The app guides kids step by step. Parents just need to encourage and monitor.'),
    },
    {
      icon: '📊',
      title: t('home.features.tracking.title') || (locale === 'vi' ? 'Theo dõi tiến độ' : 'Progress Tracking'),
      description: t('home.features.tracking.description') || (locale === 'vi'
        ? 'Biết con đang học đến đâu, mạnh yếu gì. 3 chỉ số: chăm chỉ, tốc độ, chính xác.'
        : 'Know where your child is. 3 metrics: diligence, speed, accuracy.'),
    },
  ];
  
  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-4">
            {t('home.features.title') || (locale === 'vi' ? 'Tại sao chọn Sorokid?' : 'Why Choose Sorokid?')}
          </h2>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className="bg-gradient-to-br from-violet-50 to-pink-50 p-6 rounded-2xl border border-violet-100 hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Stats Section - Số liệu ấn tượng
 */
export function StatsSection() {
  const { t, locale } = useI18n();
  
  const stats = [
    { number: '12,000+', label: t('home.stats.students') || (locale === 'vi' ? 'Học sinh' : 'Students') },
    { number: '200+', label: t('home.stats.lessons') || (locale === 'vi' ? 'Bài học' : 'Lessons') },
    { number: '5,000+', label: t('home.stats.exercises') || (locale === 'vi' ? 'Bài tập' : 'Exercises') },
    { number: '8,500+', label: t('home.stats.parents') || (locale === 'vi' ? 'Phụ huynh tin dùng' : 'Trusted Parents') },
  ];
  
  return (
    <section className="py-12 bg-gradient-to-r from-violet-600 to-pink-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center text-white">
          {stats.map((stat, idx) => (
            <div key={idx}>
              <div className="text-3xl sm:text-4xl font-black mb-1">{stat.number}</div>
              <div className="text-violet-100 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * CTA Section - Kêu gọi hành động cuối trang
 */
export function CTASection() {
  const { t, locale } = useI18n();
  
  return (
    <section className="py-12 sm:py-20 bg-gradient-to-r from-violet-600 to-pink-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4">
          {t('home.cta.title') || (locale === 'vi' 
            ? 'Bắt đầu hành trình Soroban cùng con ngay hôm nay' 
            : 'Start Your Child\'s Soroban Journey Today')}
        </h2>
        <p className="text-violet-100 mb-8">
          {t('home.cta.description') || (locale === 'vi'
            ? 'Miễn phí 7 ngày dùng thử. Không cần thẻ tín dụng.'
            : 'Free 7-day trial. No credit card required.')}
        </p>
        <LocalizedLink
          href="/register"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-violet-600 font-bold rounded-full hover:shadow-lg hover:scale-105 transition-all"
        >
          <span>✨</span>
          <span>{t('home.cta.button') || (locale === 'vi' ? 'Đăng ký miễn phí' : 'Sign Up for Free')}</span>
        </LocalizedLink>
      </div>
    </section>
  );
}

/**
 * Blog Section Title - Dynamic
 */
export function BlogSectionTitle() {
  const { t, locale } = useI18n();
  
  return (
    <>
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-4">
        <span aria-hidden="true">📚</span>{' '}
        {t('home.blog.title') || (locale === 'vi' ? 'Chia sẻ cho phụ huynh' : 'Tips for Parents')}
      </h2>
      <p className="text-gray-600 text-lg max-w-2xl mx-auto">
        {t('home.blog.description') || (locale === 'vi' 
          ? 'Kinh nghiệm thực tế giúp ba mẹ đồng hành cùng con học toán – nhẹ nhàng, hiệu quả'
          : 'Practical tips to help parents support their kids in learning math - gently and effectively')}
      </p>
    </>
  );
}

/**
 * View All Blog Button
 */
export function ViewAllBlogButton() {
  const { t, locale } = useI18n();
  
  return (
    <LocalizedLink 
      href="/blog"
      className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
    >
      {t('home.blog.viewAll') || (locale === 'vi' ? 'Xem tất cả bài viết' : 'View All Posts')}
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </LocalizedLink>
  );
}
