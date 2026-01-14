'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { User, Mail, Lock, UserCircle, Eye, EyeOff, Award, Phone } from 'lucide-react';
import { useToast } from '@/components/Toast/ToastContext';
import Logo from '@/components/Logo/Logo';
import { LocalizedLink, useLocalizedUrl } from '@/components/LocalizedLink';
import { useI18n } from '@/lib/i18n/I18nContext';

// 🔧 Detect if running in Capacitor WebView
function isCapacitorApp() {
  if (typeof window === 'undefined') return false;
  return !!(window.Capacitor?.isNativePlatform?.() || window.Capacitor?.isNative);
}

// 🔧 Open URL in external browser (for OAuth in Capacitor)
async function openExternalBrowser(url) {
  if (typeof window === 'undefined') return;
  
  try {
    if (window.Capacitor?.Plugins?.Browser) {
      await window.Capacitor.Plugins.Browser.open({ 
        url,
        windowName: '_system',
        presentationStyle: 'fullscreen'
      });
      return true;
    }
    window.open(url, '_system');
    return true;
  } catch (error) {
    console.error('Failed to open external browser:', error);
    window.location.href = url;
    return true;
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const localizeUrl = useLocalizedUrl();
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);

  // Detect Capacitor on mount
  useEffect(() => {
    setIsNativeApp(isCapacitorApp());
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('auth.validation.nameRequired');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('auth.validation.nameMinLength');
    }

    if (!formData.username.trim()) {
      newErrors.username = t('auth.validation.usernameRequired');
    } else if (formData.username.trim().length < 3) {
      newErrors.username = t('auth.validation.usernameMinLength');
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = t('auth.validation.usernameFormat');
    }

    if (!formData.email) {
      newErrors.email = t('auth.validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('auth.validation.emailInvalid');
    }

    // Validate phone number
    if (!formData.phone) {
      newErrors.phone = t('auth.validation.phoneRequired');
    } else {
      const cleanPhone = formData.phone.replace(/[\s\-\.]/g, '');
      const vietnamPhoneRegex = /^(0|\+84|84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])[0-9]{7}$/;
      if (!vietnamPhoneRegex.test(cleanPhone)) {
        newErrors.phone = t('auth.validation.phoneInvalid');
      }
    }

    if (!formData.password) {
      newErrors.password = t('auth.validation.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.validation.passwordMinLength');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.validation.confirmRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.validation.passwordMismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t('auth.register.checkInfo'));
      return;
    }

    setLoading(true);

    try {
      // Chuẩn hóa số điện thoại trước khi gửi
      const cleanPhone = formData.phone.replace(/[\s\-\.]/g, '');

      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          phone: cleanPhone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let friendlyError = t('auth.register.error');
        if (data.error === 'Email already exists') {
          friendlyError = t('auth.validation.emailExists');
          setErrors(prev => ({ ...prev, email: t('auth.validation.emailExists') }));
        } else if (data.error === 'Username already exists') {
          friendlyError = t('auth.validation.usernameExists');
          setErrors(prev => ({ ...prev, username: t('auth.validation.usernameExists') }));
        } else if (data.error === 'Phone already exists') {
          friendlyError = t('auth.validation.phoneExists');
          setErrors(prev => ({ ...prev, phone: t('auth.validation.phoneExists') }));
        } else if (data.error?.includes('email')) {
          friendlyError = t('auth.validation.emailInvalid');
        } else if (data.error?.includes('password')) {
          friendlyError = t('auth.validation.passwordInvalid');
        } else if (data.error?.includes('phone')) {
          friendlyError = t('auth.validation.phoneInvalid');
        }
        toast.error(friendlyError);
        return;
      }

      toast.success(t('auth.register.success'));
      setTimeout(() => {
        router.push(localizeUrl('/login'));
      }, 1000);
    } catch (error) {
      toast.error(t('auth.register.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 flex items-center justify-center p-4 py-6">
      {/* Google Loading Overlay */}
      {googleLoading && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 z-50 flex flex-col items-center justify-center">
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 text-center">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3"></div>
            <h2 className="text-white text-lg font-bold mb-1">{t('auth.login.googleLoading')}</h2>
            <p className="text-white/80 text-sm">{t('auth.login.googleWait')}</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-5 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <LocalizedLink href="/" className="flex items-center justify-center gap-2 mb-4">
            <Logo size="md" showText={false} />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
              SoroKid
            </span>
          </LocalizedLink>

          {/* Google Register Button */}
          <button
            type="button"
            onClick={async () => {
              setGoogleLoading(true);
              
              if (isNativeApp) {
                // 🔧 Trong Capacitor app: mở external browser
                const baseUrl = 'https://sorokid.com';
                const googleAuthUrl = `${baseUrl}/api/auth/signin/google?callbackUrl=${encodeURIComponent(baseUrl + localizeUrl('/dashboard'))}`;
                
                try {
                  await openExternalBrowser(googleAuthUrl);
                  toast.info(t('auth.login.openingBrowser'));
                  setTimeout(() => setGoogleLoading(false), 3000);
                } catch (error) {
                  toast.error(t('auth.login.browserError'));
                  setGoogleLoading(false);
                }
              } else {
                signIn('google', { callbackUrl: localizeUrl('/dashboard') });
              }
            }}
            disabled={loading || googleLoading}
            className="w-full py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold shadow-sm hover:shadow-md hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {googleLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-300 border-t-violet-500 rounded-full animate-spin"></div>
                <span>{t('auth.login.redirecting')}</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t('auth.register.googleButton')}
              </>
            )}
          </button>

          {/* Divider */}
          <div className="my-3 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-xs">{t('auth.register.or')}</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm flex items-center gap-1.5">
                <User size={15} className="text-violet-500" />
                {t('auth.register.fullName')}
                <span className="text-xs text-amber-600 ml-1">({t('auth.register.displayOnCertificate')})</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-all text-sm ${
                  errors.name 
                    ? 'border-red-400 focus:border-red-500' 
                    : 'border-gray-200 focus:border-violet-500'
                }`}
                placeholder={t('auth.register.fullNamePlaceholder')}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm flex items-center gap-1.5">
                <UserCircle size={15} className="text-violet-500" />
                {t('auth.register.username')}
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-all text-sm ${
                  errors.username 
                    ? 'border-red-400 focus:border-red-500' 
                    : 'border-gray-200 focus:border-violet-500'
                }`}
                placeholder={t('auth.register.usernamePlaceholder')}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-500">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm flex items-center gap-1.5">
                <Mail size={15} className="text-violet-500" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-all text-sm ${
                  errors.email
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 focus:border-violet-500'
                }`}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm flex items-center gap-1.5">
                <Phone size={15} className="text-violet-500" />
                {t('auth.register.phone')}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-all text-sm ${
                  errors.phone
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 focus:border-violet-500'
                }`}
                placeholder={t('auth.register.phonePlaceholder')}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm flex items-center gap-1.5">
                <Lock size={15} className="text-violet-500" />
                {t('auth.register.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border-2 rounded-lg focus:outline-none transition-all text-sm ${
                    errors.password 
                      ? 'border-red-400 focus:border-red-500' 
                      : 'border-gray-200 focus:border-violet-500'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-500"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm flex items-center gap-1.5">
                <Lock size={15} className="text-violet-500" />
                {t('auth.register.confirmPassword')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border-2 rounded-lg focus:outline-none transition-all text-sm ${
                    errors.confirmPassword 
                      ? 'border-red-400 focus:border-red-500' 
                      : 'border-gray-200 focus:border-violet-500'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-500"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white rounded-lg font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {t('auth.register.submitting')}
                </span>
              ) : (
                t('auth.register.submit')
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-4 text-center text-sm text-gray-600">
            {t('auth.register.haveAccount')}{' '}
            <LocalizedLink href="/login" className="text-violet-600 font-semibold hover:text-pink-500">
              {t('auth.register.signIn')}
            </LocalizedLink>
          </p>
        </div>

        {/* Copyright */}
        <p className="text-center mt-4 text-white/70 text-xs">
          © {new Date().getFullYear()} SoroKid - {t('auth.login.copyright')}
        </p>
      </div>
    </div>
  );
}
