'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Sparkles, User } from 'lucide-react';
import { useToast } from '@/components/Toast/ToastContext';
import Logo from '@/components/Logo/Logo';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [identifier, setIdentifier] = useState(''); // email hoặc username
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!identifier) {
      newErrors.identifier = 'Vui lòng nhập email hoặc tên đăng nhập';
    } else if (identifier.length < 3) {
      newErrors.identifier = 'Email hoặc tên đăng nhập phải có ít nhất 3 ký tự';
    }
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin!');
      return;
    }
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        identifier, // có thể là email hoặc username
        password,
      });
      if (result?.error) {
        // Chuyển thông báo lỗi thành thân thiện với người dùng
        const friendlyError = result.error.includes('credentials') || result.error.includes('password') || result.error.includes('email') || result.error.includes('username')
          ? 'Email/Tên đăng nhập hoặc mật khẩu không đúng!'
          : 'Đăng nhập thất bại. Vui lòng thử lại!';
        toast.error(friendlyError);
      } else {
        toast.success('Đăng nhập thành công! 🎉');
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 500);
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      {/* Floating decorations */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-30 animate-bounce" style={{ animationDuration: '3s' }}></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-violet-400 rounded-full opacity-30 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-32 left-20 w-12 h-12 bg-pink-400 rounded-full opacity-30 animate-bounce" style={{ animationDuration: '2s', animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-400 rounded-full opacity-30 animate-bounce" style={{ animationDuration: '3.5s' }}></div>
      
      {/* Google Loading Overlay */}
      {googleLoading && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 z-50 flex flex-col items-center justify-center">
          <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 text-center">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-white text-xl font-bold mb-2">Đang kết nối với Google...</h2>
            <p className="text-white/80 text-sm">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      )}

      {/* Soroban beads decoration */}
      <div className="absolute top-10 right-1/4 flex gap-2 opacity-30">
        <div className="w-4 h-4 bg-amber-400 rounded-full"></div>
        <div className="w-4 h-4 bg-amber-400 rounded-full"></div>
        <div className="w-4 h-4 bg-amber-400 rounded-full"></div>
      </div>
      <div className="absolute bottom-10 left-1/4 flex gap-2 opacity-30">
        <div className="w-4 h-4 bg-violet-300 rounded-full"></div>
        <div className="w-4 h-4 bg-amber-400 rounded-full"></div>
        <div className="w-4 h-4 bg-amber-400 rounded-full"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <Link href="/" className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 cursor-pointer">
              <div className="transform hover:scale-110 transition-transform duration-300">
                <Logo size="lg" showText={false} />
              </div>
              <span className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                SoroKid
              </span>
            </Link>
            <p className="text-gray-600 flex items-center justify-center gap-2 mb-4 sm:mb-6 text-sm sm:text-base">
              <span className="text-xl">🎮</span> 
              <span className="font-medium">Học toán tính nhanh vui như chơi Game!</span>
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 via-violet-100 to-pink-100 rounded-full">
              <Sparkles size={18} className="text-violet-600" />
              <span className="text-violet-700 font-semibold">Đăng nhập</span>
            </div>
          </div>

          {/* Google Login Button - ĐƯA LÊN TRÊN */}
          <button
            type="button"
            onClick={() => {
              setGoogleLoading(true);
              signIn('google', { callbackUrl: '/dashboard' });
            }}
            disabled={loading || googleLoading}
            className="w-full py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-base shadow-sm hover:shadow-md hover:border-gray-300 hover:bg-gray-50 transform hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-4"
          >
            {googleLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-300 border-t-violet-500 rounded-full animate-spin"></div>
                <span>Đang chuyển hướng...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Đăng nhập với Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="my-4 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">hoặc đăng nhập bằng email</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <User size={18} className="text-violet-600" />
                Email hoặc Tên đăng nhập
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errors.identifier) setErrors({ ...errors, identifier: '' });
                }}
                className={`w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none transition-all bg-gray-50 focus:bg-white ${
                  errors.identifier 
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200'
                }`}
                placeholder="email@example.com hoặc username"
              />
              {errors.identifier && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <span>⚠️</span> {errors.identifier}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <Lock size={18} className="text-violet-600" />
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  className={`w-full px-4 py-3.5 pr-12 border-2 rounded-xl focus:outline-none transition-all bg-gray-50 focus:bg-white ${
                    errors.password 
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <span>⚠️</span> {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                href="/forgot-password" 
                className="text-sm text-violet-600 hover:text-violet-700 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    🚀 Đăng nhập
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Chưa có tài khoản?{' '}
              <Link 
                href="/register" 
                className="text-violet-600 font-bold hover:text-pink-500 transition-colors"
              >
                Đăng ký ngay ✨
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="text-center mt-6 text-white/70 text-sm">
          <p>© {new Date().getFullYear()} SoroKid - Học toán tư duy cùng bàn tính Soroban</p>
        </div>
      </div>
    </div>
  );
}
