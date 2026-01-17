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
import { useLocalizedUrl } from '@/components/LocalizedLink';
import { useI18n } from '@/lib/i18n/I18nContext';

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

// So sánh chi tiết các gói - translation keys
const COMPARISON_DATA_KEYS = {
  categories: [
    {
      nameKey: 'pricingPage.comparison.learning.name',
      icon: BookOpen,
      features: [
        { nameKey: 'pricingPage.comparison.learning.basicLessons', free: true, basic: true, advanced: true },
        { nameKey: 'pricingPage.comparison.learning.addSubLessons', free: false, basic: true, advanced: true },
        { nameKey: 'pricingPage.comparison.learning.mulDivLessons', free: false, basic: false, advanced: true },
      ],
    },
    {
      nameKey: 'pricingPage.comparison.practice.name',
      icon: Gamepad2,
      features: [
        { nameKey: 'pricingPage.comparison.practice.addSub', freeKey: 'pricingPage.comparison.level12', basicKey: 'pricingPage.comparison.level13', advancedKey: 'pricingPage.comparison.allLevels' },
        { nameKey: 'pricingPage.comparison.practice.addSubMix', free: false, basicKey: 'pricingPage.comparison.level13', advancedKey: 'pricingPage.comparison.allLevels' },
        { nameKey: 'pricingPage.comparison.practice.mulDiv', free: false, basic: false, advancedKey: 'pricingPage.comparison.allLevels' },
        { nameKey: 'pricingPage.comparison.practice.fourOps', free: false, basic: false, advanced: true },
      ],
    },
    {
      nameKey: 'pricingPage.comparison.compete.name',
      icon: Trophy,
      features: [
        { nameKey: 'pricingPage.comparison.compete.online', freeKey: 'pricingPage.comparison.level12', basicKey: 'pricingPage.comparison.level13', advancedKey: 'pricingPage.comparison.allLevels' },
        { nameKey: 'pricingPage.comparison.compete.mentalMath', free: false, basic: false, advanced: true },
        { nameKey: 'pricingPage.comparison.compete.flashAnzan', free: false, basic: false, advanced: true },
        { nameKey: 'pricingPage.comparison.compete.leaderboard', free: true, basic: true, advanced: true },
      ],
    },
    {
      nameKey: 'pricingPage.comparison.certificate.name',
      icon: Award,
      features: [
        { nameKey: 'pricingPage.comparison.certificate.addSub', free: false, basic: true, advanced: true },
        { nameKey: 'pricingPage.comparison.certificate.complete', free: false, basic: false, advanced: true },
      ],
    },
    {
      nameKey: 'pricingPage.comparison.gamification.name',
      icon: Brain,
      features: [
        { nameKey: 'pricingPage.comparison.gamification.dailyQuests', free: true, basic: true, advanced: true },
        { nameKey: 'pricingPage.comparison.gamification.achievements', free: true, basic: true, advanced: true },
        { nameKey: 'pricingPage.comparison.gamification.shop', free: true, basic: true, advanced: true },
      ],
    },
  ],
};

// FAQ - translation keys
const FAQ_DATA_KEYS = [
  {
    icon: Shield,
    questionKey: 'pricingPage.faq.paymentSafe.question',
    answerKey: 'pricingPage.faq.paymentSafe.answer',
  },
  {
    icon: Zap,
    questionKey: 'pricingPage.faq.activation.question',
    answerKey: 'pricingPage.faq.activation.answer',
  },
  {
    icon: HelpCircle,
    questionKey: 'pricingPage.faq.lifetime.question',
    answerKey: 'pricingPage.faq.lifetime.answer',
  },
  {
    icon: Sparkles,
    questionKey: 'pricingPage.faq.upgrade.question',
    answerKey: 'pricingPage.faq.upgrade.answer',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const localizeUrl = useLocalizedUrl();
  const { data: session, status } = useSession();
  const toast = useToast();
  const { t, locale } = useI18n();
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
  
  // 🌍 International payment state
  const [internationalPaymentInfo, setInternationalPaymentInfo] = useState(null);
  
  // Check if using international payment (non-Vietnamese locale)
  const isInternationalPayment = locale !== 'vi';

  // Load pricing plans and user tier
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch plans - bypass cache bằng timestamp
        const plansRes = await fetch(`/api/pricing?t=${Date.now()}`);
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

  // 🌍 Load international payment info for non-Vietnamese users
  useEffect(() => {
    if (isInternationalPayment) {
      fetch('/api/payment/international')
        .then(res => res.json())
        .then(data => {
          setInternationalPaymentInfo(data);
        })
        .catch(err => {
          console.error('Error loading international payment info:', err);
        });
    }
  }, [isInternationalPayment]);
  
  // 🌍 Check for payment success/cancelled from LemonSqueezy redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const tier = urlParams.get('tier');
    
    if (paymentStatus === 'success' && tier) {
      // Show success modal
      setSuccessTierInfo({ 
        name: tier, 
        displayName: tier === 'basic' ? t('tier.basic') : t('tier.advanced')
      });
      setShowSuccessModal(true);
      
      // Clean URL
      window.history.replaceState({}, '', '/pricing');
      
      // Refresh user tier
      if (session?.user?.id) {
        fetch('/api/user/tier')
          .then(res => res.json())
          .then(data => {
            setUserTier(data.tier || 'free');
          });
      }
    } else if (paymentStatus === 'cancelled') {
      // Payment was cancelled
      toast.info(t('pricingPage.paymentCancelled') || 'Payment was cancelled');
      // Clean URL
      window.history.replaceState({}, '', '/pricing');
    }
  }, [session, t]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };
  
  // 🌍 Format USD price for international users
  const formatPriceUsd = (tier) => {
    if (!internationalPaymentInfo?.products?.[tier]) return '';
    return `$${internationalPaymentInfo.products[tier].priceUsd}`;
  };

  // 🌍 Translate plan name from DB (Vietnamese) to current locale
  const translatePlanName = (plan) => {
    if (locale === 'vi') return plan.name;
    const key = `pricingPage.plans.${plan.id}.name`;
    const translated = t(key);
    return translated !== key ? translated : plan.name;
  };
  
  // 🌍 Translate plan description from DB (Vietnamese) to current locale
  const translatePlanDescription = (plan) => {
    if (locale === 'vi') return plan.description;
    const key = `pricingPage.plans.${plan.id}.description`;
    const translated = t(key);
    return translated !== key ? translated : plan.description;
  };
  
  // 🌍 Translate feature text from DB (Vietnamese) to current locale
  const translateFeatureText = (planId, featureText) => {
    if (locale === 'vi') return featureText;
    const key = `pricingPage.plans.${planId}.features.${featureText}`;
    const translated = t(key);
    return translated !== key ? translated : featureText;
  };
  
  // 🌍 Translate badge text (e.g., "🔥 Tiết kiệm 50%")
  const translateBadge = (badgeText) => {
    if (!badgeText || locale === 'vi') return badgeText;
    // Common badge translations
    const badgeMap = {
      '🔥 Tiết kiệm 50%': '🔥 Save 50%',
      'Tiết kiệm 50%': 'Save 50%',
      '🔥 Phổ biến nhất': '🔥 Most Popular',
      'Phổ biến nhất': 'Most Popular',
    };
    return badgeMap[badgeText] || badgeText;
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
    if (plan.id === 'free') return t('tier.free');
    if (plan.id === userTier) return t('pricingPage.currentPlan');
    
    const currentTierOrder = TIER_ORDER[userTier] || 0;
    const targetTierOrder = TIER_ORDER[plan.id] || 0;
    
    if (targetTierOrder <= currentTierOrder) return t('pricingPage.lowerPlan');
    
    // 🌍 International pricing display
    if (isInternationalPayment) {
      const usdPrice = formatPriceUsd(plan.id);
      if (usdPrice) return `${t('pricingPage.buyNow')} ${usdPrice}`;
      return t('pricingPage.buyNow');
    }
    
    if (userTier !== 'free') {
      const payable = getPayableAmount(plan);
      return `${t('pricingPage.upgrade')} ${formatPrice(payable)}đ`;
    }
    
    return t('pricingPage.buyNow');
  };

  const handleSelectPlan = async (plan) => {
    if (!canPurchasePlan(plan.id)) return;
    
    if (!session) {
      router.push(localizeUrl('/login?redirect=/pricing'));
      return;
    }

    setSelectedPlan(plan.id);
    setIsLoading(true);

    try {
      // 🌍 Use international payment for non-Vietnamese users
      if (isInternationalPayment) {
        const res = await fetch('/api/payment/international', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            packageId: plan.id,
            locale
          })
        });

        const data = await res.json();

        if (data.success && data.checkoutUrl) {
          // Redirect to LemonSqueezy checkout
          window.location.href = data.checkoutUrl;
          return;
        } else {
          toast.error(data.error || 'Payment error occurred');
        }
        setIsLoading(false);
        return;
      }
      
      // 🇻🇳 Vietnamese payment (VietQR) - keep existing logic
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

  const renderFeatureValue = (value, translatedValue) => {
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
    // Use translated value if provided (from key), otherwise use raw value
    const displayValue = translatedValue || value;
    return <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">{displayValue}</span>;
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
              {t('pricingPage.badge')}
            </span>
            <Sparkles size={14} className="text-emerald-600" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight tracking-tight">
            <span className="text-slate-800">{t('pricingPage.heroTitle1')} </span>
            <span className="bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              {t('pricingPage.heroTitle2')}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-6">
            {t('pricingPage.heroSubtitle')}
          </p>

          {/* 💰 VALUE COMPARISON - So sánh giá trị thực tế */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 px-4 py-3 bg-slate-100 rounded-2xl text-sm text-slate-600 mb-8">
            <span>{t('pricingPage.centerCost')}:</span>
            <span className="font-semibold text-slate-500">{t('pricingPage.centerCostValue')}</span>
            <span className="hidden sm:block text-slate-400">•</span>
            <span className="text-emerald-600 font-semibold">{t('pricingPage.hereCost')}</span>
          </div>

          {/* Trust indicators */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white backdrop-blur rounded-full border border-slate-200 shadow-sm">
              <Shield size={16} className="text-emerald-500" />
              <span className="text-slate-700 text-sm font-medium">{t('pricingPage.safePayment')}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white backdrop-blur rounded-full border border-slate-200 shadow-sm">
              <Zap size={16} className="text-amber-500" />
              <span className="text-slate-700 text-sm font-medium">{t('pricingPage.instantActivation')}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white backdrop-blur rounded-full border border-slate-200 shadow-sm">
              <Heart size={16} className="text-rose-500" />
              <span className="text-slate-700 text-sm font-medium">{t('pricingPage.zaloSupport')}</span>
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
                        {plan.popular ? t('pricingPage.mostPopular') : translateBadge(plan.badge)}
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
                        <h3 className="text-2xl font-bold text-slate-800 mb-1">{translatePlanName(plan)}</h3>
                        <p className="text-slate-500 text-sm">{translatePlanDescription(plan)}</p>
                      </div>

                      {/* Price */}
                      <div className="mb-8">
                        {/* 🌍 International pricing (USD) - same layout as Vietnamese */}
                        {isInternationalPayment && plan.id !== 'free' ? (
                          <>
                            {/* Original price & discount badge */}
                            {internationalPaymentInfo?.products?.[plan.id]?.originalPriceUsd > internationalPaymentInfo?.products?.[plan.id]?.priceUsd && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-slate-400 line-through text-lg">
                                  ${internationalPaymentInfo?.products?.[plan.id]?.originalPriceUsd}
                                </span>
                                <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-bold rounded-full">
                                  -{Math.round((1 - internationalPaymentInfo?.products?.[plan.id]?.priceUsd / internationalPaymentInfo?.products?.[plan.id]?.originalPriceUsd) * 100)}%
                                </span>
                              </div>
                            )}
                            {/* Current price */}
                            <div className="flex items-baseline gap-1">
                              <span className={`text-5xl font-black ${style.priceColor}`}>
                                ${internationalPaymentInfo?.products?.[plan.id]?.priceUsd || '—'}
                              </span>
                              <span className="text-xl font-bold text-slate-400">USD</span>
                            </div>
                            <p className="text-slate-500 text-sm mt-2">
                              {t('pricingPage.oneTimePayment')}
                            </p>
                          </>
                        ) : (
                          <>
                            {/* 🇻🇳 Vietnamese pricing (VND) */}
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
                              {plan.price === 0 ? t('pricingPage.freeForever') : t('pricingPage.oneTimePayment')}
                            </p>
                          </>
                        )}
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
                              {translateFeatureText(plan.id, feature.text)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Current Plan Badge */}
                      {plan.id === userTier && (
                        <div className="mb-4 py-2 px-4 bg-emerald-100 text-emerald-700 rounded-lg text-center text-sm font-semibold">
                          ✓ {t('pricingPage.yourCurrentPlan')}
                        </div>
                      )}

                      {/* Upgrade Price Info */}
                      {session && userTier !== 'free' && canPurchasePlan(plan.id) && (
                        <div className="mb-4 py-2 px-4 bg-fuchsia-100 text-fuchsia-700 rounded-lg text-center text-sm">
                          {t('pricingPage.difference')}: <span className="font-bold">{formatPrice(getPayableAmount(plan))}đ</span>
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
                            {t('pricingPage.processing')}
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
              <span className="text-sm text-slate-600 font-medium">{t('pricingPage.featureDetails')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
              {t('pricingPage.comparePlans')}
            </h2>
          </div>

          {/* Mobile hint */}
          <p className="text-center text-sm text-slate-500 mb-4 md:hidden">👉 {t('pricingPage.swipeToSee')}</p>
          
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Table Header */}
                <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200">
                  <div className="p-5 font-bold text-slate-700 text-sm md:text-base">{t('pricingPage.feature')}</div>
                  <div className="p-5 text-center">
                    <span className="font-bold text-slate-500 text-xs md:text-sm">{t('tier.free')}</span>
                  </div>
                  <div className="p-5 text-center">
                    <span className="font-bold text-blue-600 text-xs md:text-sm">{t('tier.basic')}</span>
                  </div>
                  <div className="p-5 text-center bg-fuchsia-50">
                    <span className="inline-flex items-center gap-1 font-bold text-fuchsia-600 text-xs md:text-sm">
                      <Crown size={14} className="text-amber-500" />
                      {t('tier.advanced')}
                    </span>
                  </div>
                </div>

                {/* Table Body */}
                {COMPARISON_DATA_KEYS.categories.map((category, catIdx) => {
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
                            {t(category.nameKey)}
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      {category.features.map((feature, featIdx) => (
                        <div
                          key={featIdx}
                          className="grid grid-cols-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <div className="p-4 text-xs md:text-sm text-slate-600">{t(feature.nameKey)}</div>
                          <div className="p-4 text-center">{renderFeatureValue(feature.free, feature.freeKey ? t(feature.freeKey) : null)}</div>
                          <div className="p-4 text-center">{renderFeatureValue(feature.basic, feature.basicKey ? t(feature.basicKey) : null)}</div>
                          <div className="p-4 text-center bg-fuchsia-50/50">{renderFeatureValue(feature.advanced, feature.advancedKey ? t(feature.advancedKey) : null)}</div>
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
              {t('pricingPage.faqTitle')}
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_DATA_KEYS.map((faq, idx) => {
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
                      <h3 className="font-bold text-slate-800 mb-2 text-lg">{t(faq.questionKey)}</h3>
                      <p className="text-slate-600 leading-relaxed">{t(faq.answerKey)}</p>
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
              <span className="text-sm text-slate-600 font-medium">{t('pricingPage.benefits.badge')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
              {t('pricingPage.benefits.title')} <span className="text-fuchsia-600">Soroban?</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                titleKey: "pricingPage.benefits.brain.title",
                contentKey: "pricingPage.benefits.brain.content",
                color: "from-purple-500 to-indigo-500"
              },
              {
                icon: Zap,
                titleKey: "pricingPage.benefits.speed.title",
                contentKey: "pricingPage.benefits.speed.content",
                color: "from-amber-500 to-orange-500"
              },
              {
                icon: Heart,
                titleKey: "pricingPage.benefits.fun.title",
                contentKey: "pricingPage.benefits.fun.content",
                color: "from-rose-500 to-pink-500"
              }
            ].map((benefit, idx) => {
              const BenefitIcon = benefit.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-fuchsia-200 transition-all text-center">
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center`}>
                    <BenefitIcon size={24} className="text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-2">{t(benefit.titleKey)}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{t(benefit.contentKey)}</p>
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
                  {t('pricingPage.cta.title1')}
                  <br />
                  <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    {t('pricingPage.cta.title2')}
                  </span>
                </h2>
                <p className="text-slate-400 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                  {t('pricingPage.cta.description')}
                </p>
                <button
                  onClick={() => router.push(localizeUrl('/learn'))}
                  className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-fuchsia-500/30 hover:scale-105 transition-all duration-300"
                >
                  <span>{t('pricingPage.cta.button')}</span>
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
        <p>© {new Date().getFullYear()} SoroKid - {t('footer.copyright')}</p>
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
              {/* Header nổi bật với tên gói và giá */}
              <div className="bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 -mx-5 lg:-mx-6 -mt-5 lg:-mt-6 px-5 py-5 rounded-t-3xl mb-4">
                <div className="w-16 h-16 mx-auto mb-3 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <p className="text-white/80 text-sm mb-1">{t('pricingPage.modal.scanQR')}</p>
                <h3 className="text-2xl font-black text-white">
                  {orderInfo.packageName} - {formatPrice(orderInfo.amount)}đ
                </h3>
              </div>

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
                      <span className="text-amber-700 font-semibold text-sm">{t('pricingPage.modal.confirmingPayment')}</span>
                    </>
                  ) : (
                    <>
                      <Clock size={16} className="text-amber-600" />
                      <span className="text-amber-700 font-semibold text-sm">{t('pricingPage.modal.waitingPayment')}</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-amber-600">
                  {isCheckingPayment 
                    ? `${t('pricingPage.modal.systemChecking')} (${paymentCheckCount})`
                    : t('pricingPage.modal.autoConfirm')
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
                  <span>{t('pricingPage.modal.transferDetails')}</span>
                  <ChevronRight size={16} className="text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="p-3 pt-0 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('pricingPage.modal.bank')}:</span>
                    <span className="font-semibold text-slate-800">{orderInfo.paymentInfo.bankCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('pricingPage.modal.accountNumber')}:</span>
                    <span className="font-semibold text-slate-800">{orderInfo.paymentInfo.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('pricingPage.modal.accountName')}:</span>
                    <span className="font-semibold text-slate-800">{orderInfo.paymentInfo.accountName}</span>
                  </div>
                  <div className="h-px bg-slate-200 my-1"></div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('pricingPage.modal.amount')}:</span>
                    <span className="font-bold text-emerald-600">{formatPrice(orderInfo.amount)}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('pricingPage.modal.content')}:</span>
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
                          toast.info(t('pricingPage.modal.notReceived'));
                        }
                      })
                      .catch(() => {
                        toast.error(t('pricingPage.modal.connectionError'));
                      });
                  }
                }}
                className="w-full py-3 mb-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Check size={18} />
                {t('pricingPage.modal.iHaveTransferred')}
              </button>

              <button
                onClick={closeQRModal}
                className="w-full py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-all"
              >
                {t('common.cancel')}
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
