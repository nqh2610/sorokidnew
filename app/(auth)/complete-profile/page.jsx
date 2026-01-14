'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MonsterAvatar } from '@/components/MonsterAvatar';
import Logo from '@/components/Logo/Logo';
import { CheckCircle } from 'lucide-react';
import { LocalizedLink, useLocalizedUrl } from '@/components/LocalizedLink';
import { useI18n } from '@/lib/i18n/I18nContext';

export default function CompleteProfilePage() {
  const { t } = useI18n();
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const localizeUrl = useLocalizedUrl();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [profileCompleted, setProfileCompleted] = useState(false); // Flag để tránh redirect loop

  // Set name from session when loaded
  useEffect(() => {
    if (session?.user?.name) {
      setFormData(prev => ({ ...prev, name: session.user.name }));
    }
  }, [session]);

  // Redirect nếu chưa đăng nhập hoặc đã hoàn thiện profile
  useEffect(() => {
    // Nếu vừa hoàn tất profile, không check redirect nữa
    if (profileCompleted || isLoading) return;
    
    if (status === 'unauthenticated') {
      router.push(localizeUrl('/login'));
    } else if (status === 'authenticated' && session?.user?.isProfileComplete) {
      router.push(localizeUrl('/dashboard'));
    }
  }, [status, session, router, profileCompleted, isLoading, localizeUrl]);

  // Debounce check username availability
  useEffect(() => {
    if (!formData.username || formData.username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(formData.username)}`);
        const data = await res.json();
        setUsernameAvailable(data.available);
      } catch (e) {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // Validate phone Việt Nam
  const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/[\s\-\.]/g, '');
    const vietnamPhoneRegex = /^(0|\+84|84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])[0-9]{7}$/;
    return vietnamPhoneRegex.test(cleanPhone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name.trim()) {
      setError(t('auth.completeProfile.errors.nameRequired'));
      return;
    }
    if (!formData.username.trim()) {
      setError(t('auth.completeProfile.errors.usernameRequired'));
      return;
    }
    if (formData.username.length < 3) {
      setError(t('auth.completeProfile.errors.usernameMinLength'));
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError(t('auth.completeProfile.errors.usernameFormat'));
      return;
    }
    if (usernameAvailable === false) {
      setError(t('auth.completeProfile.errors.usernameTaken'));
      return;
    }
    if (!formData.phone) {
      setError(t('auth.completeProfile.errors.phoneRequired'));
      return;
    }
    if (!validatePhone(formData.phone)) {
      setError(t('auth.completeProfile.errors.invalidPhone'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const cleanPhone = formData.phone.replace(/[\s\-\.]/g, '');
      
      const res = await fetch('/api/users/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          username: formData.username.trim().toLowerCase(),
          phone: cleanPhone
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t('common.error'));
      }

      // 🔧 FIX: Đánh dấu đã hoàn tất để useEffect không redirect sai
      setProfileCompleted(true);

      // 🔧 FIX: SignOut để xóa session cũ, sau đó redirect về login
      // Khi đăng nhập lại, session sẽ có isProfileComplete = true
      await signOut({ redirect: false });
      
      // Redirect về login với thông báo thành công
      window.location.href = '/login?registered=1';
      // Không return, không finally - giữ loading overlay cho đến khi redirect xong
    } catch (err) {
      setError(err.message);
      setIsLoading(false); // Chỉ tắt loading khi có lỗi
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Loading Overlay khi đang submit */}
      {isLoading && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 z-50 flex flex-col items-center justify-center">
          <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 text-center">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-white text-xl font-bold mb-2">{t('auth.completeProfile.completing')}</h2>
            <p className="text-white/80 text-sm">{t('auth.completeProfile.pleaseWait')}</p>
          </div>
        </div>
      )}

      {/* Floating decorations */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-30 animate-bounce" style={{ animationDuration: '3s' }}></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-violet-400 rounded-full opacity-30 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-32 left-20 w-12 h-12 bg-pink-400 rounded-full opacity-30 animate-bounce" style={{ animationDuration: '2s', animationDelay: '1s' }}></div>
      
      <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-white/20 relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <LocalizedLink href="/" className="flex items-center justify-center gap-2 mb-4">
            <Logo size="lg" showText={false} />
            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
              SoroKid
            </span>
          </LocalizedLink>
          <p className="text-gray-600 text-sm">
            {t('auth.completeProfile.greeting')} <span className="font-bold text-violet-600">{session?.user?.name}</span>! 👋
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-all ${
                s <= step ? 'bg-gradient-to-r from-violet-500 to-pink-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="text-center">
            <div className="text-5xl mb-4">👋</div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              {t('auth.completeProfile.step1.title')}
            </h1>
            <p className="text-gray-600 mb-4 text-sm">
              {t('auth.completeProfile.step1.subtitle')}
            </p>
            <p className="text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-4 text-xs">
              🏆 {t('auth.completeProfile.step1.certificateNote')}
            </p>
            
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('auth.completeProfile.step1.placeholder')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-lg focus:border-violet-400 focus:outline-none transition-colors"
              autoFocus
            />

            <button
              onClick={() => {
                if (formData.name.trim()) {
                  setStep(2);
                  setError('');
                } else {
                  setError(t('auth.completeProfile.errors.nameRequired'));
                }
              }}
              className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
            >
              {t('auth.completeProfile.continue')} →
            </button>
          </div>
        )}

        {/* Step 2: Username */}
        {step === 2 && (
          <div className="text-center">
            <div className="text-5xl mb-4">🎮</div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              {t('auth.completeProfile.step2.title')}
            </h1>
            <p className="text-gray-600 mb-6 text-sm">
              {t('auth.completeProfile.step2.subtitle')}
            </p>
            
            <div className="relative">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="username_cua_ban"
                className={`w-full px-4 py-3 pr-12 border-2 rounded-xl text-center text-lg focus:outline-none transition-colors font-mono ${
                  usernameAvailable === true 
                    ? 'border-green-400 focus:border-green-500' 
                    : usernameAvailable === false 
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 focus:border-violet-400'
                }`}
                autoFocus
              />
              {checkingUsername && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin"></div>
                </div>
              )}
              {!checkingUsername && usernameAvailable === true && (
                <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {t('auth.completeProfile.step2.usernameHint')}
            </p>
            {usernameAvailable === false && (
              <p className="text-red-500 text-sm mt-1">{t('auth.completeProfile.errors.usernameTaken')}</p>
            )}

            {/* Monster Avatar Preview */}
            <div className="mt-4 p-3 bg-gradient-to-r from-violet-50 to-pink-50 rounded-xl">
              <div className="flex items-center justify-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                <MonsterAvatar 
                  seed={session?.user?.id || session?.user?.email || formData.username || 'preview'}
                  size={48}
                  showBorder={false}
                />
                <div className="text-left">
                  <div className="font-semibold text-gray-800 text-sm">{formData.name || t('auth.completeProfile.yourName')}</div>
                  <div className="text-xs text-gray-500">@{formData.username || 'username'}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
              >
                ←
              </button>
              <button
                onClick={() => {
                  if (!formData.username.trim() || formData.username.length < 3) {
                    setError(t('auth.completeProfile.errors.usernameMinLength'));
                    return;
                  }
                  if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
                    setError(t('auth.completeProfile.errors.usernameFormat'));
                    return;
                  }
                  if (usernameAvailable === false) {
                    setError(t('auth.completeProfile.errors.usernameTaken'));
                    return;
                  }
                  setStep(3);
                  setError('');
                }}
                disabled={checkingUsername}
                className="flex-[3] py-3 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
              >
                {t('auth.completeProfile.continue')} →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Phone */}
        {step === 3 && (
          <div className="text-center">
            <div className="text-5xl mb-4">📱</div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              {t('auth.completeProfile.step3.title')}
            </h1>
            <p className="text-gray-600 mb-6 text-sm">
              {t('auth.completeProfile.step3.subtitle')}
            </p>
            
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0901234567"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-lg focus:border-violet-400 focus:outline-none transition-colors"
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-2">
              {t('auth.completeProfile.step3.phoneHint')}
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
              >
                ←
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !formData.phone}
                className="flex-[3] py-3 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('auth.completeProfile.saving') : `✨ ${t('auth.completeProfile.complete')}`}
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-center mt-4 text-sm bg-red-50 py-2 px-4 rounded-lg">
            ⚠️ {error}
          </p>
        )}
      </div>
      
      {/* Footer */}
      <p className="absolute bottom-4 text-center text-white/70 text-sm w-full">
        © {new Date().getFullYear()} SoroKid - {t('auth.footer')}
      </p>
    </div>
  );
}
