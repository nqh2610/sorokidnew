'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MonsterAvatar } from '@/components/MonsterAvatar';

export default function CompleteProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    username: '',
    age: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name.trim()) {
      setError('Vui lòng nhập tên của bạn');
      return;
    }
    if (!formData.username.trim()) {
      setError('Vui lòng nhập username');
      return;
    }
    if (formData.username.length < 3) {
      setError('Username phải có ít nhất 3 ký tự');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username chỉ được chứa chữ, số và dấu gạch dưới');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      // Update session
      await update({
        ...session,
        user: {
          ...session.user,
          name: formData.name,
          username: formData.username
        }
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-all ${
                s <= step ? 'bg-purple-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="text-center">
            <div className="text-6xl mb-4">👋</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Chào mừng đến Sorokids!
            </h1>
            <p className="text-gray-600 mb-6">
              Bạn tên là gì?
            </p>
            
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên của bạn"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-lg focus:border-purple-400 focus:outline-none transition-colors"
              autoFocus
            />

            <button
              onClick={() => {
                if (formData.name.trim()) {
                  setStep(2);
                } else {
                  setError('Vui lòng nhập tên');
                }
              }}
              className="w-full mt-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
            >
              Tiếp tục →
            </button>
          </div>
        )}

        {/* Step 2: Username */}
        {step === 2 && (
          <div className="text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Chọn tên người chơi
            </h1>
            <p className="text-gray-600 mb-6">
              Username sẽ hiển thị trên bảng xếp hạng
            </p>
            
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="username_cua_ban"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-lg focus:border-purple-400 focus:outline-none transition-colors font-mono"
              autoFocus
            />
            <p className="text-sm text-gray-400 mt-2">
              Chỉ dùng chữ, số và dấu gạch dưới (_)
            </p>

            {/* Monster Avatar Preview */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-3 text-center">Avatar quái vật của bạn:</p>
              <div className="flex items-center justify-center gap-4 bg-white rounded-lg p-4 shadow-sm">
                <MonsterAvatar 
                  seed={session?.user?.id || session?.user?.email || formData.username || 'preview'}
                  size={64}
                  className="border-2 border-purple-300"
                  showBorder={false}
                />
                <div className="text-left">
                  <div className="font-semibold text-gray-800">{formData.name || 'Tên của bạn'}</div>
                  <div className="text-sm text-gray-500">@{formData.username || 'username'}</div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">🎨 Avatar được tạo ngẫu nhiên và cố định cho bạn!</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
              >
                ← Quay lại
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !formData.username.trim() || formData.username.length < 3}
                className="flex-1 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang lưu...' : 'Hoàn tất ✓'}
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-center mt-4 text-sm">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
