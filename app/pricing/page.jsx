'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Check, X, Sparkles, Crown, Gift, Shield, 
  Zap, HelpCircle, ChevronRight, Star,
  BookOpen, Gamepad2, Trophy, Award, Brain,
  ArrowLeft, Rocket, Timer
} from 'lucide-react';
import TopBar from '@/components/TopBar/TopBar';

// Định nghĩa các gói
const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Miễn Phí',
    description: 'Bắt đầu học Soroban cơ bản',
    price: 0,
    originalPrice: null,
    icon: Gift,
    iconBg: 'bg-gradient-to-br from-slate-100 to-slate-200',
    iconColor: 'text-slate-600',
    badge: null,
    buttonText: 'Gói miễn phí',
    buttonStyle: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    cardStyle: 'border-slate-200 bg-white hover:border-slate-300',
    glowColor: 'group-hover:shadow-slate-200/50',
    features: [
      { text: '5 Level cơ bản', included: true },
      { text: 'Luyện Cộng/Trừ Sơ cấp', included: true },
      { text: 'Thi đấu Sơ cấp', included: true },
      { text: 'Không có chứng nhận', included: false },
    ],
    disabled: true,
  },
  {
    id: 'basic',
    name: 'Cơ Bản',
    description: 'Học Cộng Trừ thành thạo',
    price: 199000,
    originalPrice: 299000,
    icon: Star,
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    iconColor: 'text-white',
    badge: null,
    buttonText: 'Đã có gói cao hơn',
    buttonStyle: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    cardStyle: 'border-blue-200 bg-gradient-to-b from-blue-50/50 to-white hover:border-blue-300',
    glowColor: 'group-hover:shadow-blue-200/50',
    features: [
      { text: '10 Level Cộng Trừ', included: true, highlight: true },
      { text: 'Luyện tập Sơ - Trung cấp', included: true },
      { text: 'Thi đấu Sơ - Trung cấp', included: true },
      { text: 'Chứng nhận Sorokid Cộng Trừ', included: true, highlight: true },
    ],
    disabled: true,
  },
  {
    id: 'advanced',
    name: 'Nâng Cao',
    description: 'Full tính năng + 2 Chứng nhận Sorokid',
    price: 299000,
    originalPrice: 499000,
    icon: Crown,
    iconBg: 'bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500',
    iconColor: 'text-white',
    badge: '🔥 Phổ biến nhất',
    badgeStyle: 'bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 animate-pulse',
    buttonText: 'Gói hiện tại',
    buttonStyle: 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 text-white hover:shadow-xl hover:shadow-fuchsia-300/30 hover:scale-[1.02]',
    cardStyle: 'border-fuchsia-300 bg-gradient-to-b from-fuchsia-50 via-white to-pink-50/30 hover:border-fuchsia-400',
    glowColor: 'group-hover:shadow-fuchsia-300/50',
    popular: true,
    features: [
      { text: 'Full 18 Level - Không giới hạn', included: true, highlight: true },
      { text: 'Tất cả chế độ luyện tập & thi đấu', included: true },
      { text: 'Anzan - Tính nhẩm siêu tốc', included: true, highlight: true },
      { text: '2 Chứng nhận Sorokid', included: true, highlight: true },
    ],
    savings: '200,000đ',
  },
];

// So sánh chi tiết các gói
const COMPARISON_DATA = {
  categories: [
    {
      name: 'Học tập',
      icon: BookOpen,
      features: [
        { name: 'Bài học cơ bản (Level 1-5)', free: true, basic: true, advanced: true },
        { name: 'Bài học Cộng Trừ (Level 6-10)', free: false, basic: true, advanced: true },
        { name: 'Bài học Nhân Chia (Level 11-18)', free: false, basic: false, advanced: true },
      ],
    },
    {
      name: 'Luyện tập',
      icon: Gamepad2,
      features: [
        { name: 'Phép Cộng & Trừ', free: 'Cấp 1-2', basic: 'Cấp 1-3', advanced: 'Tất cả cấp' },
        { name: 'Cộng Trừ Mix', free: false, basic: 'Cấp 1-3', advanced: 'Tất cả cấp' },
        { name: 'Phép Nhân & Chia', free: false, basic: false, advanced: 'Tất cả cấp' },
        { name: 'Tứ Phép Tính (4 phép)', free: false, basic: false, advanced: true },
      ],
    },
    {
      name: 'Thi đấu',
      icon: Trophy,
      features: [
        { name: 'Thi đấu online', free: 'Cấp 1-2', basic: 'Cấp 1-3', advanced: 'Tất cả cấp' },
        { name: 'Siêu Trí Tuệ (Tính nhẩm)', free: false, basic: false, advanced: true },
        { name: 'Tia Chớp (Flash Anzan)', free: false, basic: false, advanced: true },
        { name: 'Bảng xếp hạng', free: true, basic: true, advanced: true },
      ],
    },
    {
      name: 'Chứng nhận',
      icon: Award,
      features: [
        { name: 'Chứng nhận Sorokid Cộng Trừ', free: false, basic: true, advanced: true },
        { name: 'Chứng nhận Sorokid Toàn diện', free: false, basic: false, advanced: true },
      ],
    },
    {
      name: 'Gamification',
      icon: Brain,
      features: [
        { name: 'Nhiệm vụ hàng ngày', free: true, basic: true, advanced: true },
        { name: 'Hệ thống thành tích', free: true, basic: true, advanced: true },
        { name: 'Shop vật phẩm', free: true, basic: true, advanced: true },
      ],
    },
  ],
};

// FAQ
const FAQ_DATA = [
  {
    icon: Shield,
    question: 'Thanh toán có an toàn không?',
    answer: 'Chúng tôi sử dụng các cổng thanh toán uy tín, đảm bảo an toàn tuyệt đối cho giao dịch của bạn.',
  },
  {
    icon: Zap,
    question: 'Kích hoạt gói như thế nào?',
    answer: 'Sau khi thanh toán thành công, gói sẽ được kích hoạt ngay lập tức và bạn có thể sử dụng mọi tính năng.',
  },
  {
    icon: HelpCircle,
    question: 'Gói có thời hạn không?',
    answer: 'Không! Bạn chỉ cần thanh toán một lần và sử dụng trọn đời, không có phí hàng tháng hay ẩn phí nào.',
  },
  {
    icon: Sparkles,
    question: 'Có thể nâng cấp sau không?',
    answer: 'Có! Bạn có thể nâng cấp từ Cơ Bản lên Nâng Cao bất cứ lúc nào và chỉ trả phần chênh lệch.',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleSelectPlan = async (plan) => {
    if (plan.disabled || plan.id === 'free') return;
    
    if (!session) {
      router.push('/login?redirect=/pricing');
      return;
    }

    setSelectedPlan(plan.id);
    setIsLoading(true);

    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: plan.id })
      });

      const data = await res.json();

      if (data.success) {
        setOrderInfo(data.order);
        setShowQR(true);
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const closeQRModal = () => {
    setShowQR(false);
    setOrderInfo(null);
    setSelectedPlan(null);
  };

  const renderFeatureValue = (value) => {
    if (value === true) {
      return (
        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500">
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
      );
    }
    if (value === false) {
      return (
        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100">
          <X className="w-3.5 h-3.5 text-slate-400" />
        </div>
      );
    }
    return <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-violet-50/30 to-pink-50/30">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-fuchsia-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-violet-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Unified TopBar */}
      <TopBar showStats={false} />
      
      {/* Header */}
      <div className="relative pt-6 pb-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Floating badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/90 backdrop-blur-sm border border-green-200 rounded-full mb-6 shadow-md">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-700 font-semibold">
              Thanh toán 1 lần • Sử dụng trọn đời
            </span>
            <Sparkles size={16} className="text-amber-500" />
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-slate-800 via-violet-700 to-fuchsia-600 bg-clip-text text-transparent">
              Chọn gói phù hợp với bé
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto mb-6">
            Đầu tư cho tư duy toán học - Nền tảng vững chắc cho tương lai
          </p>

          {/* Trust indicators */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 md:gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-full border border-slate-200 text-sm">
              <Shield size={14} className="text-green-500" />
              <span className="text-slate-600 font-medium">Bảo mật</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-full border border-slate-200 text-sm">
              <Zap size={14} className="text-amber-500" />
              <span className="text-slate-600 font-medium">Kích hoạt ngay</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-full border border-slate-200 text-sm">
              <Rocket size={14} className="text-fuchsia-500" />
              <span className="text-slate-600 font-medium">10K+ học sinh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="relative px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {PRICING_PLANS.map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`group relative border-2 rounded-3xl p-6 lg:p-8 transition-all duration-500 hover:shadow-2xl ${plan.cardStyle} ${plan.glowColor} ${
                    plan.popular ? 'md:-mt-6 md:mb-6 scale-[1.02] md:scale-105' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Popular glow effect */}
                  {plan.popular && (
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  )}

                  <div className={`relative ${plan.popular ? 'bg-white rounded-[22px] p-6 lg:p-8 -m-6 lg:-m-8' : ''}`}>
                    {/* Badge */}
                    {plan.badge && (
                      <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-white text-sm font-bold shadow-lg ${plan.badgeStyle}`}>
                        {plan.badge}
                      </div>
                    )}

                    {/* Icon with ring effect */}
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        {plan.popular && (
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-pink-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                        )}
                        <div className={`relative w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center ${plan.iconBg} shadow-lg`}>
                          <IconComponent className={`w-8 h-8 lg:w-10 lg:h-10 ${plan.iconColor}`} />
                        </div>
                      </div>
                    </div>

                    {/* Plan Name & Description */}
                    <div className="text-center mb-6">
                      <h3 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                      <p className="text-sm text-slate-500">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-8">
                      {plan.originalPrice && (
                        <div className="inline-flex items-center gap-2 mb-2">
                          <span className="text-slate-400 line-through text-lg">
                            {formatPrice(plan.originalPrice)}đ
                          </span>
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                            -{Math.round((1 - plan.price / plan.originalPrice) * 100)}%
                          </span>
                        </div>
                      )}
                      <div className={`text-4xl lg:text-5xl font-extrabold ${plan.popular ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent' : 'text-slate-800'}`}>
                        {plan.price === 0 ? '0đ' : `${formatPrice(plan.price)}đ`}
                      </div>
                      <div className="text-sm text-slate-500 mt-2 font-medium">
                        {plan.price === 0 ? 'Mãi mãi miễn phí' : 'Một lần • Trọn đời'}
                      </div>
                      {plan.savings && (
                        <div className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 text-sm rounded-full font-semibold">
                          <Sparkles size={14} className="text-green-500" />
                          Tiết kiệm {plan.savings}
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-6"></div>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3 group/item">
                          {feature.included ? (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${feature.highlight ? 'bg-gradient-to-br from-fuchsia-500 to-pink-500' : 'bg-green-500'}`}>
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-100">
                              <X className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                          )}
                          <span className={`text-sm ${feature.included ? (feature.highlight ? 'text-slate-800 font-semibold' : 'text-slate-700') : 'text-slate-400'}`}>
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={plan.disabled || isLoading}
                      className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-300 ${plan.buttonStyle} ${
                        plan.disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                      }`}
                    >
                      {isLoading && selectedPlan === plan.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Đang xử lý...
                        </div>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          {plan.buttonText}
                          {!plan.disabled && <ChevronRight size={18} />}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="relative px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full mb-4">
              <BookOpen size={16} className="text-violet-600" />
              <span className="text-sm text-slate-600 font-medium">Chi tiết tính năng</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
              So sánh các gói
            </h2>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-4 bg-gradient-to-r from-slate-50 via-slate-100/50 to-slate-50 border-b border-slate-200">
              <div className="p-5 font-bold text-slate-700 text-lg">Tính năng</div>
              <div className="p-5 text-center">
                <span className="font-bold text-slate-500">Miễn Phí</span>
              </div>
              <div className="p-5 text-center">
                <span className="font-bold text-blue-600">Cơ Bản</span>
              </div>
              <div className="p-5 text-center">
                <span className="inline-flex items-center gap-1.5 font-bold text-fuchsia-600">
                  <Crown size={16} className="text-amber-500" />
                  Nâng Cao
                </span>
              </div>
            </div>

            {/* Table Body */}
            {COMPARISON_DATA.categories.map((category, catIdx) => {
              const CategoryIcon = category.icon;
              return (
                <div key={catIdx}>
                  {/* Category Header */}
                  <div className="grid grid-cols-4 bg-gradient-to-r from-violet-50/50 via-fuchsia-50/30 to-pink-50/50 border-b border-slate-100">
                    <div className="p-4 col-span-4">
                      <div className="flex items-center gap-3 font-bold text-slate-700">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                          <CategoryIcon size={16} className="text-white" />
                        </div>
                        {category.name}
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  {category.features.map((feature, featIdx) => (
                    <div
                      key={featIdx}
                      className="grid grid-cols-4 border-b border-slate-100 hover:bg-slate-50/50 transition-colors group"
                    >
                      <div className="p-4 text-sm text-slate-600 group-hover:text-slate-800 transition-colors">{feature.name}</div>
                      <div className="p-4 text-center">{renderFeatureValue(feature.free)}</div>
                      <div className="p-4 text-center">{renderFeatureValue(feature.basic)}</div>
                      <div className="p-4 text-center bg-fuchsia-50/30">{renderFeatureValue(feature.advanced)}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="relative px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full mb-4">
              <HelpCircle size={16} className="text-violet-600" />
              <span className="text-sm text-slate-600 font-medium">FAQ</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
              Câu hỏi thường gặp
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {FAQ_DATA.map((faq, idx) => {
              const FaqIcon = faq.icon;
              return (
                <div
                  key={idx}
                  className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 via-fuchsia-100 to-pink-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <FaqIcon size={22} className="text-fuchsia-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 mb-2 text-lg">{faq.question}</h3>
                      <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 rounded-3xl p-8 lg:p-16 text-center text-white overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-amber-400/20 rounded-full blur-2xl"></div>
            
            {/* Floating particles */}
            <div className="absolute top-10 right-10 w-3 h-3 bg-white/30 rounded-full animate-bounce"></div>
            <div className="absolute bottom-20 left-20 w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-amber-400/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Rocket className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
                Sẵn sàng bắt đầu
                <br />
                hành trình Soroban?
              </h2>
              <p className="text-white/80 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                Học Soroban không chỉ giúp tính toán nhanh mà còn phát triển tư duy logic,
                trí nhớ và sự tập trung cho con bạn.
              </p>
              <button
                onClick={() => router.push('/learn')}
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-fuchsia-600 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-white/30 hover:scale-105 transition-all duration-300"
              >
                <span>Vào học ngay</span>
                <div className="w-8 h-8 bg-fuchsia-100 rounded-lg flex items-center justify-center">
                  <ChevronRight size={20} className="text-fuchsia-600" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative text-center py-10 text-slate-500 text-sm border-t border-slate-100">
        <p>© 2025 SoroKid - Học Soroban vui như chơi Game! 🎮</p>
      </div>

      {/* QR Modal */}
      {showQR && orderInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-fuchsia-200">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Quét mã QR để thanh toán
              </h3>
              <p className="text-slate-600 mb-4">
                {orderInfo.packageName} - {formatPrice(orderInfo.amount)}đ
              </p>

              {/* QR Code */}
              <div className="bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 p-5 rounded-2xl mb-4 border border-fuchsia-100">
                <img
                  src={orderInfo.qrUrl}
                  alt="QR Code"
                  className="mx-auto w-56 h-56 rounded-xl shadow-lg"
                />
              </div>

              {/* Payment Info */}
              <div className="text-left bg-slate-50 rounded-xl p-4 mb-4 text-sm space-y-2.5 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngân hàng:</span>
                  <span className="font-semibold text-slate-800">{orderInfo.paymentInfo.bankCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số tài khoản:</span>
                  <span className="font-semibold text-slate-800">{orderInfo.paymentInfo.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chủ tài khoản:</span>
                  <span className="font-semibold text-slate-800">{orderInfo.paymentInfo.accountName}</span>
                </div>
                <div className="h-px bg-slate-200 my-1"></div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số tiền:</span>
                  <span className="font-bold text-green-600">{formatPrice(orderInfo.amount)}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nội dung CK:</span>
                  <span className="font-bold text-fuchsia-600">{orderInfo.content}</span>
                </div>
              </div>

              <p className="text-sm text-slate-500 mb-4">
                Sau khi thanh toán, vui lòng đợi 1-5 phút để hệ thống xác nhận
              </p>

              <button
                onClick={closeQRModal}
                className="w-full py-3.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
