'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Check, X, Sparkles, Crown, Gift, Shield, 
  Zap, HelpCircle, ChevronRight, Star,
  BookOpen, Gamepad2, Trophy, Award, Brain,
  ArrowLeft
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
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    badge: null,
    buttonText: 'Gói miễn phí',
    buttonStyle: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    cardStyle: 'border-gray-200 bg-white',
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
    buttonStyle: 'bg-gray-100 text-gray-500',
    cardStyle: 'border-gray-200 bg-white',
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
    iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
    iconColor: 'text-white',
    badge: 'Phổ biến nhất',
    badgeStyle: 'bg-gradient-to-r from-pink-500 to-rose-500',
    buttonText: 'Gói hiện tại',
    buttonStyle: 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 text-white hover:shadow-lg',
    cardStyle: 'border-fuchsia-300 bg-gradient-to-b from-fuchsia-50 to-white shadow-xl shadow-fuchsia-100',
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
      return <Check className="w-5 h-5 text-fuchsia-500 mx-auto" />;
    }
    if (value === false) {
      return <X className="w-5 h-5 text-gray-300 mx-auto" />;
    }
    return <span className="text-sm text-gray-700">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-fuchsia-50">
      {/* TopBar */}
      <TopBar />
      
      {/* Header */}
      <div className="pt-8 pb-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6">
            <Sparkles size={16} className="text-fuchsia-600" />
            <span className="text-sm text-fuchsia-700 font-medium">
              Học Soroban - Đầu tư cho tương lai
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-500 bg-clip-text text-transparent">
              Chọn gói phù hợp với bạn
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Thanh toán một lần, sử dụng trọn đời. Không cần đăng ký hàng tháng!
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {PRICING_PLANS.map((plan) => {
              const IconComponent = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`relative border-2 rounded-3xl p-6 lg:p-8 transition-all duration-300 ${plan.cardStyle} ${
                    plan.popular ? 'md:-mt-4 md:mb-4' : ''
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-white text-sm font-semibold ${plan.badgeStyle}`}>
                      {plan.badge}
                    </div>
                  )}

                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${plan.iconBg}`}>
                      <IconComponent className={`w-8 h-8 ${plan.iconColor}`} />
                    </div>
                  </div>

                  {/* Plan Name & Description */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-6">
                    {plan.originalPrice && (
                      <div className="text-gray-400 line-through text-lg mb-1">
                        {formatPrice(plan.originalPrice)}đ
                      </div>
                    )}
                    <div className={`text-4xl font-bold ${plan.popular ? 'text-fuchsia-600' : 'text-gray-800'}`}>
                      {plan.price === 0 ? '0đ' : `${formatPrice(plan.price)}đ`}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {plan.price === 0 ? 'Mãi mãi' : 'Một lần, trọn đời'}
                    </div>
                    {plan.savings && (
                      <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                        <Sparkles size={14} />
                        Tiết kiệm {plan.savings}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${feature.highlight ? 'text-fuchsia-500' : 'text-green-500'}`} />
                        ) : (
                          <X className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-300" />
                        )}
                        <span className={`text-sm ${feature.included ? (feature.highlight ? 'text-gray-800 font-medium' : 'text-gray-700') : 'text-gray-400'}`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={plan.disabled || isLoading}
                    className={`w-full py-4 rounded-xl font-semibold transition-all ${plan.buttonStyle} ${
                      plan.disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                    }`}
                  >
                    {isLoading && selectedPlan === plan.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Đang xử lý...
                      </div>
                    ) : (
                      plan.buttonText
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 lg:p-8 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-center text-gray-800">
                So sánh chi tiết các gói
              </h2>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-100">
              <div className="p-4 font-semibold text-gray-700">Tính năng</div>
              <div className="p-4 text-center font-semibold text-gray-500">Miễn Phí</div>
              <div className="p-4 text-center font-semibold text-blue-600">Cơ Bản</div>
              <div className="p-4 text-center font-semibold text-fuchsia-600">Nâng Cao</div>
            </div>

            {/* Table Body */}
            {COMPARISON_DATA.categories.map((category, catIdx) => {
              const CategoryIcon = category.icon;
              return (
                <div key={catIdx}>
                  {/* Category Header */}
                  <div className="grid grid-cols-4 bg-gray-50/50 border-b border-gray-100">
                    <div className="p-4 col-span-4">
                      <div className="flex items-center gap-2 font-semibold text-gray-800">
                        <CategoryIcon size={18} className="text-fuchsia-500" />
                        {category.name}
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  {category.features.map((feature, featIdx) => (
                    <div
                      key={featIdx}
                      className="grid grid-cols-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="p-4 text-sm text-gray-600">{feature.name}</div>
                      <div className="p-4 text-center">{renderFeatureValue(feature.free)}</div>
                      <div className="p-4 text-center">{renderFeatureValue(feature.basic)}</div>
                      <div className="p-4 text-center">{renderFeatureValue(feature.advanced)}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Câu hỏi thường gặp
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {FAQ_DATA.map((faq, idx) => {
              const FaqIcon = faq.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                      <FaqIcon size={20} className="text-fuchsia-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">{faq.question}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 rounded-3xl p-8 lg:p-12 text-center text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Sẵn sàng bắt đầu hành trình Soroban?
              </h2>
              <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                Học Soroban không chỉ giúp tính toán nhanh mà còn phát triển tư duy logic,
                trí nhớ và sự tập trung.
              </p>
              <button
                onClick={() => router.push('/learn')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-fuchsia-600 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
              >
                Vào học ngay
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-gray-500 text-sm">
        <p>© 2025 SoroKid - Học Soroban vui như chơi Game! 🎮</p>
      </div>

      {/* QR Modal */}
      {showQR && orderInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-fuchsia-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Quét mã QR để thanh toán
              </h3>
              <p className="text-gray-600 mb-4">
                {orderInfo.packageName} - {formatPrice(orderInfo.amount)}đ
              </p>

              {/* QR Code */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl mb-4">
                <img
                  src={orderInfo.qrUrl}
                  alt="QR Code"
                  className="mx-auto w-56 h-56 rounded-xl"
                />
              </div>

              {/* Payment Info */}
              <div className="text-left bg-gray-50 rounded-xl p-4 mb-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngân hàng:</span>
                  <span className="font-medium text-gray-800">{orderInfo.paymentInfo.bankCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số tài khoản:</span>
                  <span className="font-medium text-gray-800">{orderInfo.paymentInfo.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Chủ tài khoản:</span>
                  <span className="font-medium text-gray-800">{orderInfo.paymentInfo.accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số tiền:</span>
                  <span className="font-semibold text-green-600">{formatPrice(orderInfo.amount)}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Nội dung CK:</span>
                  <span className="font-medium text-fuchsia-600">{orderInfo.content}</span>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Sau khi thanh toán, vui lòng đợi 1-5 phút để hệ thống xác nhận
              </p>

              <button
                onClick={closeQRModal}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
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
