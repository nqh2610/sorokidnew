'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Check, X, Sparkles, Crown, Gift, Shield, 
  Zap, HelpCircle, ChevronRight, Star,
  BookOpen, Gamepad2, Trophy, Award, Brain,
  ArrowLeft, Rocket, Timer, Lock, Clock, Users, TrendingUp, Heart, MessageCircle
} from 'lucide-react';
import TopBar from '@/components/TopBar/TopBar';
import PaymentSuccessModal from '@/components/Payment/PaymentSuccessModal';
import { useToast } from '@/components/Toast/ToastContext';

// Thứ tự tier (dùng để so sánh)
const TIER_ORDER = {
  free: 0,
  basic: 1,
  advanced: 2,
  vip: 3
};

// Icon mapping
const ICON_MAP = {
  Gift, Star, Crown, Zap, Shield, Award, Rocket, 
  Check, X, Sparkles, BookOpen, Gamepad2, Trophy, Brain, Timer, Lock
};

// Style mapping cho các gói
const PLAN_STYLES = {
  free: {
    iconBg: 'bg-gradient-to-br from-slate-400 to-slate-500',
    iconColor: 'text-white',
    buttonStyle: 'bg-slate-200 text-slate-600 hover:bg-slate-300 border-2 border-transparent',
    cardBg: 'bg-white',
    borderColor: 'border-slate-200 hover:border-slate-300',
    priceColor: 'text-slate-700',
  },
  basic: {
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    iconColor: 'text-white',
    buttonStyle: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5',
    cardBg: 'bg-white',
    borderColor: 'border-blue-200 hover:border-blue-400',
    priceColor: 'text-blue-600',
  },
  advanced: {
    iconBg: 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500',
    iconColor: 'text-white',
    buttonStyle: 'bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-1',
    cardBg: 'bg-gradient-to-br from-fuchsia-50/80 via-white to-amber-50/50',
    borderColor: 'border-fuchsia-300 hover:border-fuchsia-400',
    priceColor: 'bg-gradient-to-r from-fuchsia-600 to-purple-600 bg-clip-text text-transparent',
  },
  default: {
    iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    iconColor: 'text-white',
    buttonStyle: 'bg-purple-500 text-white hover:bg-purple-600',
    cardBg: 'bg-white',
    borderColor: 'border-purple-200 hover:border-purple-300',
    priceColor: 'text-purple-600',
  }
};

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
  const { data: session, status } = useSession();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [userTier, setUserTier] = useState('free');
  
  // 🎉 State cho Success Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTierInfo, setSuccessTierInfo] = useState({ name: '', displayName: '' });
  
  // 📌 Ref để track polling interval
  const pollingRef = useRef(null);
  
  // 🔄 State cho trạng thái đang kiểm tra thanh toán
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentCheckCount, setPaymentCheckCount] = useState(0);

  // Load pricing plans and user tier
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch plans
        const plansRes = await fetch('/api/pricing');
        if (plansRes.ok) {
          const data = await plansRes.json();
          setPricingPlans(data.plans || []);
        }

        // Fetch user tier if logged in
        if (session?.user?.id) {
          const userRes = await fetch('/api/user/tier');
          if (userRes.ok) {
            const userData = await userRes.json();
            setUserTier(userData.tier || 'free');
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoadingPlans(false);
      }
    };
    
    if (status !== 'loading') {
      fetchData();
    }
  }, [session, status]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Get style for plan
  const getPlanStyle = (planId) => {
    return PLAN_STYLES[planId] || PLAN_STYLES.default;
  };

  // Get icon component
  const getIconComponent = (iconName) => {
    return ICON_MAP[iconName] || Star;
  };

  // Kiểm tra xem gói có thể mua được không
  const canPurchasePlan = (planId) => {
    if (planId === 'free') return false;
    const currentTierOrder = TIER_ORDER[userTier] || 0;
    const targetTierOrder = TIER_ORDER[planId] || 0;
    return targetTierOrder > currentTierOrder;
  };

  // Tính giá cần thanh toán (chênh lệch nếu đang có gói)
  const getPayableAmount = (plan) => {
    if (!session || userTier === 'free') return plan.price;
    
    // Tìm giá gói hiện tại
    const currentPlan = pricingPlans.find(p => p.id === userTier);
    if (!currentPlan) return plan.price;
    
    // Tính chênh lệch
    const difference = plan.price - currentPlan.price;
    return difference > 0 ? difference : plan.price;
  };

  // Lấy text cho nút
  const getButtonText = (plan) => {
    if (plan.id === 'free') return 'Miễn phí';
    if (plan.id === userTier) return 'Đang sử dụng';
    
    const currentTierOrder = TIER_ORDER[userTier] || 0;
    const targetTierOrder = TIER_ORDER[plan.id] || 0;
    
    if (targetTierOrder <= currentTierOrder) return 'Gói thấp hơn';
    
    if (userTier !== 'free') {
      const payable = getPayableAmount(plan);
      return `Nâng cấp ${formatPrice(payable)}đ`;
    }
    
    return 'Mua ngay';
  };

  const handleSelectPlan = async (plan) => {
    if (!canPurchasePlan(plan.id)) return;
    
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
        body: JSON.stringify({ 
          packageId: plan.id,
          currentTier: userTier
        })
      });

      const data = await res.json();

      if (data.success) {
        setOrderInfo(data.order);
        setShowQR(true);
        // Bắt đầu polling kiểm tra trạng thái - truyền thêm tên gói
        startPaymentPolling(data.order.orderId, plan.id, plan.name);
      } else {
        toast.error(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  // Function để bắt đầu polling kiểm tra trạng thái thanh toán
  // 🔧 TỐI ƯU: Dùng progressive polling - check nhanh ban đầu, chậm dần sau
  const startPaymentPolling = (orderId, tierId, tierDisplayName) => {
    // Clear polling cũ nếu có
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    
    let pollCount = 0;
    const MAX_POLLS = 180; // Tổng 15 phút
    setPaymentCheckCount(0);
    setIsCheckingPayment(true);
    
    // Progressive polling: nhanh ban đầu (3s), chậm dần (10s sau 2 phút)
    const doPoll = async () => {
      pollCount++;
      setPaymentCheckCount(pollCount);
      
      // 🔧 Dừng nếu đã poll quá nhiều
      if (pollCount > MAX_POLLS) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        setIsCheckingPayment(false);
        return;
      }
      
      try {
        const res = await fetch(`/api/payment/status/${orderId}`);
        const data = await res.json();
        
        if (data.status === 'completed') {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setIsCheckingPayment(false);
          setShowQR(false);
          setOrderInfo(null);
          setSelectedPlan(null);
          // Cập nhật tier mới
          setUserTier(data.tier);
          
          // 🎉 Hiển thị Success Modal thay vì alert xấu
          setSuccessTierInfo({ 
            name: data.tier, 
            displayName: tierDisplayName || data.tierName || 'Gói Premium' 
          });
          setShowSuccessModal(true);
        } else if (data.status === 'expired') {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setIsCheckingPayment(false);
          // Hiển thị thông báo hết hạn với style tốt hơn
          setShowQR(false);
          setOrderInfo(null);
          setSelectedPlan(null);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };
    
    // 🚀 Check ngay lập tức lần đầu
    doPoll();
    
    // Sau đó check mỗi 5 giây (cân bằng giữa UX và server load)
    const pollInterval = setInterval(doPoll, 5000);
    pollingRef.current = pollInterval;

    // Tự động dừng sau 30 phút
    setTimeout(() => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        setIsCheckingPayment(false);
      }
    }, 30 * 60 * 1000);
  };
  
  // Cleanup polling khi unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const closeQRModal = () => {
    setShowQR(false);
    setOrderInfo(null);
    setSelectedPlan(null);
    setIsCheckingPayment(false);
    setPaymentCheckCount(0);
    // Clear polling khi đóng modal
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };
  
  // Handle success modal close
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    // Force reload để cập nhật tier trên TopBar và toàn bộ UI
    window.location.reload();
  };
  
  // Handle go to dashboard
  const handleGoToDashboard = () => {
    setShowSuccessModal(false);
    // Force reload để cập nhật tier trên TopBar trước khi chuyển trang
    window.location.href = '/dashboard';
  };

  const renderFeatureValue = (value) => {
    if (value === true) {
      return (
        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 shadow-lg shadow-fuchsia-500/20">
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
    return <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-purple-50/30">
      {/* Animated Background - Light version */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-fuchsia-200/20 rounded-full blur-[150px]"></div>
        {/* Grid overlay - lighter */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Unified TopBar */}
      <TopBar showStats={false} />
      
      {/* Hero Header */}
      <div className="relative pt-10 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Floating badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-emerald-100 border border-emerald-200 rounded-full mb-6 animate-bounce-slow shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-emerald-700 font-medium">
              Thanh toán 1 lần • Sử dụng trọn đời
            </span>
            <Sparkles size={14} className="text-emerald-600" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight tracking-tight">
            <span className="text-slate-800">Học Soroban </span>
            <span className="bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              mọi lúc, mọi nơi
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-6">
            Phương pháp tính nhẩm Nhật Bản giúp bé phát triển tư duy toán học và khả năng tập trung
          </p>

          {/* 💰 VALUE COMPARISON - So sánh giá trị thực tế */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 px-4 py-3 bg-slate-100 rounded-2xl text-sm text-slate-600 mb-8">
            <span>Chi phí học trung tâm:</span>
            <span className="font-semibold text-slate-500">500K - 1.5 triệu/tháng</span>
            <span className="hidden sm:block text-slate-400">•</span>
            <span className="text-emerald-600 font-semibold">Tại đây: Trả 1 lần, dùng mãi</span>
          </div>

          {/* Trust indicators */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white backdrop-blur rounded-full border border-slate-200 shadow-sm">
              <Shield size={16} className="text-emerald-500" />
              <span className="text-slate-700 text-sm font-medium">Thanh toán an toàn</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white backdrop-blur rounded-full border border-slate-200 shadow-sm">
              <Zap size={16} className="text-amber-500" />
              <span className="text-slate-700 text-sm font-medium">Kích hoạt tức thì</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white backdrop-blur rounded-full border border-slate-200 shadow-sm">
              <Heart size={16} className="text-rose-500" />
              <span className="text-slate-700 text-sm font-medium">Hỗ trợ qua Zalo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="relative px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          {isLoadingPlans ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {pricingPlans.map((plan, index) => {
              const style = getPlanStyle(plan.id);
              const IconComponent = getIconComponent(plan.icon);
              const discountPercent = plan.originalPrice > plan.price 
                ? Math.round((1 - plan.price / plan.originalPrice) * 100)
                : 0;
              
              return (
                <div
                  key={plan.id}
                  className={`group relative transition-all duration-500 ${
                    plan.popular ? 'md:-mt-4 md:scale-105 z-10' : 'z-0'
                  }`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Glow effect for popular */}
                  {plan.popular && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
                  )}
                  
                  {/* Card */}
                  <div className={`relative rounded-3xl border-2 ${style.borderColor} ${style.cardBg} overflow-hidden transition-all duration-300 group-hover:shadow-2xl`}>
                    
                    {/* Top Badge */}
                    {(plan.badge || plan.popular) && (
                      <div className={`absolute top-0 right-0 px-4 py-2 rounded-bl-2xl text-xs font-bold text-white ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                          : 'bg-gradient-to-r from-rose-500 to-pink-500'
                      }`}>
                        {plan.popular ? '🔥 Phổ biến nhất' : plan.badge}
                      </div>
                    )}

                    <div className="p-8">
                      {/* Icon */}
                      <div className="mb-6">
                        <div className={`w-16 h-16 rounded-2xl ${style.iconBg} flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                          <IconComponent className={`w-8 h-8 ${style.iconColor}`} />
                        </div>
                      </div>

                      {/* Plan Info */}
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-slate-800 mb-1">{plan.name}</h3>
                        <p className="text-slate-500 text-sm">{plan.description}</p>
                      </div>

                      {/* Price */}
                      <div className="mb-8">
                        {plan.originalPrice > plan.price && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-400 line-through text-lg">
                              {formatPrice(plan.originalPrice)}đ
                            </span>
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-bold rounded-full">
                              -{discountPercent}%
                            </span>
                          </div>
                        )}
                        <div className="flex items-baseline gap-1">
                          <span className={`text-5xl font-black ${style.priceColor}`}>
                            {plan.price === 0 ? '0' : formatPrice(plan.price)}
                          </span>
                          <span className="text-2xl font-bold text-slate-400">đ</span>
                        </div>
                        <p className="text-slate-500 text-sm mt-2">
                          {plan.price === 0 ? 'Miễn phí mãi mãi' : 'Thanh toán một lần'}
                        </p>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-6"></div>

                      {/* Features */}
                      <div className="space-y-4 mb-8">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              feature.included 
                                ? feature.highlight 
                                  ? 'bg-gradient-to-br from-fuchsia-500 to-purple-500' 
                                  : 'bg-emerald-500'
                                : 'bg-slate-200'
                            }`}>
                              {feature.included ? (
                                <Check className="w-3 h-3 text-white" />
                              ) : (
                                <X className="w-3 h-3 text-slate-400" />
                              )}
                            </div>
                            <span className={`text-sm leading-tight ${
                              feature.included 
                                ? feature.highlight 
                                  ? 'text-fuchsia-700 font-semibold' 
                                  : 'text-slate-700'
                                : 'text-slate-400 line-through'
                            }`}>
                              {feature.text}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Current Plan Badge */}
                      {plan.id === userTier && (
                        <div className="mb-4 py-2 px-4 bg-emerald-100 text-emerald-700 rounded-lg text-center text-sm font-semibold">
                          ✓ Gói hiện tại của bạn
                        </div>
                      )}

                      {/* Upgrade Price Info */}
                      {session && userTier !== 'free' && canPurchasePlan(plan.id) && (
                        <div className="mb-4 py-2 px-4 bg-fuchsia-100 text-fuchsia-700 rounded-lg text-center text-sm">
                          Chênh lệch: <span className="font-bold">{formatPrice(getPayableAmount(plan))}đ</span>
                        </div>
                      )}

                      {/* CTA Button */}
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        disabled={!canPurchasePlan(plan.id) || isLoading}
                        className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-300 ${
                          canPurchasePlan(plan.id) 
                            ? style.buttonStyle 
                            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isLoading && selectedPlan === plan.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Đang xử lý...
                          </div>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            {!canPurchasePlan(plan.id) && plan.id !== userTier && plan.id !== 'free' && (
                              <Lock size={16} />
                            )}
                            {getButtonText(plan)}
                            {canPurchasePlan(plan.id) && <ChevronRight size={18} />}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="relative px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full mb-4 shadow-sm">
              <BookOpen size={16} className="text-fuchsia-500" />
              <span className="text-sm text-slate-600 font-medium">Chi tiết tính năng</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
              So sánh các gói
            </h2>
          </div>

          {/* Mobile hint */}
          <p className="text-center text-sm text-slate-500 mb-4 md:hidden">👉 Vuốt ngang để xem thêm</p>
          
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Table Header */}
                <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200">
                  <div className="p-5 font-bold text-slate-700 text-sm md:text-base">Tính năng</div>
                  <div className="p-5 text-center">
                    <span className="font-bold text-slate-500 text-xs md:text-sm">Miễn Phí</span>
                  </div>
                  <div className="p-5 text-center">
                    <span className="font-bold text-blue-600 text-xs md:text-sm">Cơ Bản</span>
                  </div>
                  <div className="p-5 text-center bg-fuchsia-50">
                    <span className="inline-flex items-center gap-1 font-bold text-fuchsia-600 text-xs md:text-sm">
                      <Crown size={14} className="text-amber-500" />
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
                      <div className="grid grid-cols-4 bg-gradient-to-r from-fuchsia-50 via-purple-50/50 to-transparent border-b border-slate-100">
                        <div className="p-4 col-span-4">
                          <div className="flex items-center gap-3 font-bold text-slate-700 text-sm md:text-base">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
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
                          className="grid grid-cols-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <div className="p-4 text-xs md:text-sm text-slate-600">{feature.name}</div>
                          <div className="p-4 text-center">{renderFeatureValue(feature.free)}</div>
                          <div className="p-4 text-center">{renderFeatureValue(feature.basic)}</div>
                          <div className="p-4 text-center bg-fuchsia-50/50">{renderFeatureValue(feature.advanced)}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="relative px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full mb-4 shadow-sm">
              <HelpCircle size={16} className="text-cyan-500" />
              <span className="text-sm text-slate-600 font-medium">FAQ</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
              Câu hỏi thường gặp
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_DATA.map((faq, idx) => {
              const FaqIcon = faq.icon;
              return (
                <div
                  key={idx}
                  className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-fuchsia-300 hover:shadow-lg hover:shadow-fuchsia-100 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-100 to-purple-100 border border-fuchsia-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:border-fuchsia-300 transition-all">
                      <FaqIcon size={22} className="text-fuchsia-500" />
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

      {/* 💬 LỢI ÍCH KHI HỌC SOROBAN */}
      <div className="relative px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full mb-4 shadow-sm">
              <Star size={16} className="text-amber-500" />
              <span className="text-sm text-slate-600 font-medium">Lợi ích thực tế</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
              Tại sao chọn <span className="text-fuchsia-600">Soroban?</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "Phát triển não bộ",
                content: "Rèn luyện cả 2 bán cầu não, tăng khả năng tập trung và trí nhớ",
                color: "from-purple-500 to-indigo-500"
              },
              {
                icon: Zap,
                title: "Tính nhẩm nhanh",
                content: "Bé có thể tính nhẩm các phép tính phức tạp chỉ trong vài giây",
                color: "from-amber-500 to-orange-500"
              },
              {
                icon: Heart,
                title: "Học mà chơi",
                content: "Game hóa việc học giúp bé hứng thú, không cảm thấy nhàm chán",
                color: "from-rose-500 to-pink-500"
              }
            ].map((benefit, idx) => {
              const BenefitIcon = benefit.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-fuchsia-200 transition-all text-center">
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center`}>
                    <BenefitIcon size={24} className="text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-2">{benefit.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{benefit.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden">
            {/* Glow effects */}
            <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 rounded-[2.5rem] blur-xl opacity-30"></div>
            
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] p-8 lg:p-16 text-center border border-white/10 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-cyan-500/20 rounded-full blur-2xl"></div>
              
              {/* Grid pattern overlay */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTEgMGExIDEgMCAxIDAgMiAwYTEgMSAwIDEgMCAtMiAwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9nPjwvc3ZnPg==')] opacity-50"></div>
              
              {/* Floating particles */}
              <div className="absolute top-10 right-10 w-3 h-3 bg-fuchsia-400/50 rounded-full animate-bounce"></div>
              <div className="absolute bottom-20 left-20 w-2 h-2 bg-cyan-400/50 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-purple-400/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-fuchsia-500/30">
                  <Rocket className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight text-white">
                  Sẵn sàng bắt đầu
                  <br />
                  <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    hành trình Soroban?
                  </span>
                </h2>
                <p className="text-slate-400 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                  Học Soroban không chỉ giúp tính toán nhanh mà còn phát triển tư duy logic,
                  trí nhớ và sự tập trung cho con bạn.
                </p>
                <button
                  onClick={() => router.push('/learn')}
                  className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-fuchsia-500/30 hover:scale-105 transition-all duration-300"
                >
                  <span>Vào học ngay</span>
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <ChevronRight size={20} className="text-white" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative text-center py-10 text-slate-500 text-sm border-t border-slate-200 bg-white/50">
        <p>© 2025 SoroKid - Học toán tư duy cùng bàn tính Soroban</p>
      </div>

      {/* QR Modal - Light Theme với UX cải thiện */}
      {showQR && orderInfo && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeQRModal}
        >
          <div 
            className="relative bg-white rounded-3xl p-5 lg:p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300 border border-slate-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-fuchsia-100 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-100 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative text-center">
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                Quét mã QR để thanh toán
              </h3>
              <p className="text-slate-500 text-sm mb-3">
                {orderInfo.packageName} - {formatPrice(orderInfo.amount)}đ
              </p>

              {/* QR Code */}
              <div className="bg-slate-50 p-4 rounded-2xl mb-3 border border-slate-200">
                <img
                  src={orderInfo.qrUrl}
                  alt="QR Code"
                  className="mx-auto w-48 h-48 rounded-xl shadow-md"
                />
              </div>

              {/* 🔄 TRẠNG THÁI ĐANG CHỜ XÁC NHẬN - Đặt ngay dưới QR để thấy ngay */}
              <div className="mb-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {isCheckingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-amber-700 font-semibold text-sm">Đang chờ xác nhận thanh toán...</span>
                    </>
                  ) : (
                    <>
                      <Clock size={16} className="text-amber-600" />
                      <span className="text-amber-700 font-semibold text-sm">Chờ thanh toán</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-amber-600">
                  {isCheckingPayment 
                    ? `Hệ thống đang kiểm tra... (${paymentCheckCount})`
                    : 'Sau khi chuyển khoản, hệ thống sẽ tự động xác nhận'
                  }
                </p>
                {/* Progress indicator */}
                {isCheckingPayment && (
                  <div className="mt-2 h-1 bg-amber-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse w-full"></div>
                  </div>
                )}
              </div>

              {/* Payment Info - Thu gọn để không cần scroll nhiều */}
              <details className="text-left bg-slate-50 rounded-xl mb-3 border border-slate-200 group">
                <summary className="p-3 cursor-pointer text-sm font-medium text-slate-700 flex items-center justify-between hover:bg-slate-100 rounded-xl transition-colors">
                  <span>Chi tiết chuyển khoản</span>
                  <ChevronRight size={16} className="text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="p-3 pt-0 text-sm space-y-2">
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
                    <span className="font-bold text-emerald-600">{formatPrice(orderInfo.amount)}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nội dung CK:</span>
                    <span className="font-bold text-fuchsia-600 text-xs break-all">{orderInfo.content}</span>
                  </div>
                </div>
              </details>

              {/* Nút "Tôi đã chuyển khoản" để trigger check ngay */}
              <button
                onClick={() => {
                  // Trigger check ngay lập tức
                  if (orderInfo?.orderId) {
                    setIsCheckingPayment(true);
                    fetch(`/api/payment/status/${orderInfo.orderId}`)
                      .then(res => res.json())
                      .then(data => {
                        if (data.status === 'completed') {
                          closeQRModal();
                          setUserTier(data.tier);
                          setSuccessTierInfo({ 
                            name: data.tier, 
                            displayName: orderInfo.packageName || 'Gói Premium' 
                          });
                          setShowSuccessModal(true);
                        } else {
                          toast.info('Chưa nhận được thanh toán. Hệ thống sẽ tự động kiểm tra lại...');
                        }
                      })
                      .catch(() => {
                        toast.error('Lỗi kết nối. Vui lòng đợi...');
                      });
                  }
                }}
                className="w-full py-3 mb-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Tôi đã chuyển khoản
              </button>

              <button
                onClick={closeQRModal}
                className="w-full py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🎉 SUCCESS MODAL - Thông báo thanh toán thành công với UX đẹp */}
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        tierName={successTierInfo.name}
        tierDisplayName={successTierInfo.displayName}
        onGoToDashboard={handleGoToDashboard}
      />
    </div>
  );
}
