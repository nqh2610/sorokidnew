'use client';

import { useState, useEffect } from 'react';

const BANKS = [
  { code: 'BIDV', name: 'BIDV' },
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'TCB', name: 'Techcombank' },
  { code: 'MB', name: 'MB Bank' },
  { code: 'ACB', name: 'ACB' },
  { code: 'VPB', name: 'VPBank' },
  { code: 'TPB', name: 'TPBank' },
  { code: 'STB', name: 'Sacombank' },
  { code: 'HDB', name: 'HDBank' },
  { code: 'VIB', name: 'VIB' },
  { code: 'SHB', name: 'SHB' },
  { code: 'MSB', name: 'MSB' },
  { code: 'OCB', name: 'OCB' },
  { code: 'SEAB', name: 'SeABank' },
];

export default function PaymentSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [webhookProvider, setWebhookProvider] = useState('sepay');
  
  // Bank settings
  const [bankSettings, setBankSettings] = useState({
    bankCode: 'BIDV',
    accountNumber: '',
    accountName: ''
  });

  // Webhook settings
  const [webhookSettings, setWebhookSettings] = useState({
    apiKey: '',
    webhookUrl: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/payment-settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setBankSettings({
            bankCode: data.settings.bankCode || 'BIDV',
            accountNumber: data.settings.accountNumber || '',
            accountName: data.settings.accountName || ''
          });
          setWebhookSettings({
            apiKey: data.settings.apiKey || '',
            webhookUrl: data.settings.webhookUrl || ''
          });
          setIsActive(data.settings.isActive ?? false);
          setWebhookProvider(data.settings.webhookProvider || 'sepay');
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBankSettings = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bankSettings,
          webhookProvider,
          apiKey: webhookSettings.apiKey
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Đã lưu thông tin ngân hàng!' });
        fetchSettings();
      } else {
        setMessage({ type: 'error', text: 'Có lỗi xảy ra' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveWebhook = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bankSettings,
          webhookProvider,
          apiKey: webhookSettings.apiKey
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Đã lưu cấu hình Webhook!' });
        fetchSettings();
      } else {
        setMessage({ type: 'error', text: 'Có lỗi xảy ra' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    setMessage({ type: 'info', text: 'Đang test kết nối...' });
    
    try {
      const res = await fetch('/api/admin/payment-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: webhookProvider })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Kết nối thành công!' });
      } else {
        setMessage({ type: 'error', text: 'Kết nối thất bại' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Kết nối thất bại' });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: 'Đã copy!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
  };

  const getQRPreviewUrl = () => {
    if (!bankSettings.accountNumber) return '';
    return `https://img.vietqr.io/image/${bankSettings.bankCode}-${bankSettings.accountNumber}-compact2.png?amount=199000&addInfo=${encodeURIComponent('SOROKIDS TEST')}&accountName=${encodeURIComponent(bankSettings.accountName)}`;
  };

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/payment/webhook/${webhookProvider}`
    : `https://sorokid.com/api/payment/webhook/${webhookProvider}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Status */}
      <div className={`p-4 rounded-xl border ${isActive ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
          <span className={`font-medium ${isActive ? 'text-emerald-400' : 'text-red-400'}`}>
            Thanh toán tự động đang {isActive ? 'HOẠT ĐỘNG' : 'TẮT'}
          </span>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-xl border ${
          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
          message.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
          'bg-blue-500/10 text-blue-400 border-blue-500/30'
        }`}>
          {message.text}
        </div>
      )}

      {/* Bank Settings */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🏦</span>
          <h2 className="text-lg font-semibold text-white">Tài khoản ngân hàng nhận tiền</h2>
        </div>
        <p className="text-slate-400 text-sm mb-6">Tiền thanh toán sẽ được chuyển vào tài khoản này</p>

        <div className="space-y-4">
          {/* Bank Select */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Ngân hàng *</label>
            <select
              value={bankSettings.bankCode}
              onChange={(e) => setBankSettings({ ...bankSettings, bankCode: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {BANKS.map(bank => (
                <option key={bank.code} value={bank.code}>{bank.name} ({bank.code})</option>
              ))}
            </select>
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1"># Số tài khoản *</label>
            <input
              type="text"
              value={bankSettings.accountNumber}
              onChange={(e) => setBankSettings({ ...bankSettings, accountNumber: e.target.value })}
              placeholder="Nhập số tài khoản"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-slate-500 text-xs mt-1">Có thể nhập số tài khoản hoặc Virtual Account (VA) của SePay</p>
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">👤 Tên chủ tài khoản *</label>
            <input
              type="text"
              value={bankSettings.accountName}
              onChange={(e) => setBankSettings({ ...bankSettings, accountName: e.target.value })}
              placeholder="NGUYEN VAN A"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
            />
            <p className="text-slate-500 text-xs mt-1">Nhập chính xác như trên tài khoản ngân hàng (không dấu, in hoa)</p>
          </div>

          {/* QR Preview */}
          {bankSettings.accountNumber && (
            <div className="pt-4 border-t border-slate-700">
              <label className="block text-sm font-medium text-slate-300 mb-3">📱 Preview QR Code thanh toán</label>
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-xl">
                  <img 
                    src={getQRPreviewUrl()} 
                    alt="QR Preview" 
                    className="w-48 h-48 object-contain"
                  />
                  <p className="text-center text-xs text-gray-500 mt-2">QR mẫu với số tiền 199.000đ</p>
                </div>
              </div>
            </div>
          )}

          {/* Save Bank Button */}
          <button
            onClick={handleSaveBankSettings}
            disabled={isSaving}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>💾</span> Lưu thông tin ngân hàng
          </button>
        </div>
      </div>

      {/* Webhook Settings */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🔗</span>
          <h2 className="text-lg font-semibold text-white">Dịch vụ Webhook (Tự động kích hoạt)</h2>
        </div>
        <p className="text-slate-400 text-sm mb-6">Chọn dịch vụ để nhận thông báo khi có tiền vào tài khoản</p>

        {/* Provider Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div 
            onClick={() => setWebhookProvider('sepay')}
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all relative ${
              webhookProvider === 'sepay' 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-slate-600 hover:border-slate-500'
            }`}
          >
            {webhookProvider === 'sepay' && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded">
                Khuyên dùng
              </span>
            )}
            <div className="font-semibold text-white">SePay ⭐</div>
            <p className="text-xs text-emerald-400">Miễn phí hoàn toàn, Không giới hạn</p>
            <p className="text-xs text-slate-400 mt-1">Webhook real-time · API đơn giản</p>
            <a href="https://sepay.vn" target="_blank" rel="noreferrer" className="text-purple-400 text-xs hover:underline">Xem hướng dẫn →</a>
          </div>

          <div 
            onClick={() => setWebhookProvider('casso')}
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
              webhookProvider === 'casso' 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-slate-600 hover:border-slate-500'
            }`}
          >
            <div className="font-semibold text-white">Casso</div>
            <p className="text-xs text-slate-400">Free: 7 TK, sau đó 50k/tháng</p>
            <p className="text-xs text-slate-400 mt-1">Webhook real-time · Nhiều bank</p>
            <a href="https://casso.vn" target="_blank" rel="noreferrer" className="text-purple-400 text-xs hover:underline">Xem hướng dẫn →</a>
          </div>
        </div>

        {/* API Config */}
        <div className="bg-amber-500/10 rounded-xl p-4 mb-4 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-3">
            <span>⭐</span>
            <span className="font-medium text-white">Cấu hình {webhookProvider === 'sepay' ? 'SePay' : 'Casso'} (Miễn phí hoàn toàn)</span>
          </div>

          {/* API Key */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">API Key *</label>
            <div className="relative">
              <input
                type="password"
                value={webhookSettings.apiKey}
                onChange={(e) => setWebhookSettings({ ...webhookSettings, apiKey: e.target.value })}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
              />
            </div>
            <div className="mt-2 text-xs text-blue-400">
              <p>Hướng dẫn lấy API Key:</p>
              <ol className="list-decimal ml-4 mt-1 space-y-1 text-slate-400">
                <li>Đăng ký tài khoản tại <a href="https://sepay.vn" target="_blank" rel="noreferrer" className="text-purple-400 underline">sepay.vn</a></li>
                <li>Liên kết tài khoản ngân hàng</li>
                <li>Vào <strong className="text-white">Cài đặt → API & Webhooks → Tạo API Key</strong></li>
                <li>Copy API Key và paste vào đây</li>
              </ol>
            </div>
          </div>

          {/* Webhook URL */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">🔗 Webhook URL (Copy vào {webhookProvider === 'sepay' ? 'SePay' : 'Casso'})</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={webhookUrl}
                readOnly
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 text-sm"
              />
              <button
                onClick={() => copyToClipboard(webhookUrl)}
                className="px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Vào {webhookProvider === 'sepay' ? 'SePay' : 'Casso'} → Cài đặt Webhook → Dán URL này
            </p>
          </div>

          {/* Save Webhook Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveWebhook}
              disabled={isSaving}
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>💾</span> Lưu cấu hình Webhook
            </button>
            <button
              onClick={handleTestWebhook}
              className="px-6 py-3 border-2 border-purple-500 text-purple-400 font-medium rounded-xl hover:bg-purple-500/10 transition-colors flex items-center gap-2"
            >
              <span>🔌</span> Test kết nối
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📋</span>
          <h2 className="text-lg font-semibold text-white">Hướng dẫn cài đặt với SePay (Miễn phí)</h2>
        </div>
        
        <ol className="space-y-3 text-sm">
          <li className="flex gap-2">
            <span className="text-purple-400 font-semibold">Bước 1:</span>
            <span className="text-slate-300">Điền thông tin tài khoản ngân hàng nhận tiền → Nhấn &ldquo;Lưu thông tin ngân hàng&rdquo;</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400 font-semibold">Bước 2:</span>
            <span className="text-slate-300">Đăng ký tài khoản tại <a href="https://sepay.vn" target="_blank" rel="noreferrer" className="text-purple-400 underline">sepay.vn</a> (Hoàn toàn miễn phí)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400 font-semibold">Bước 3:</span>
            <span className="text-slate-300">Liên kết tài khoản ngân hàng trong SePay</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400 font-semibold">Bước 4:</span>
            <span className="text-slate-300">Vào <strong className="text-white">Cài đặt → API & Webhooks → Tạo API Key</strong></span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400 font-semibold">Bước 5:</span>
            <span className="text-slate-300">Copy API Key và paste vào phần Webhook bên trên</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400 font-semibold">Bước 6:</span>
            <span className="text-slate-300">Copy <strong className="text-white">Webhook URL</strong> và paste vào SePay → Webhooks → Thêm Webhook</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400 font-semibold">Bước 7:</span>
            <span className="text-slate-300">Nhấn &ldquo;Lưu cấu hình Webhook&rdquo; → Done! 🎉</span>
          </li>
        </ol>

        <div className="mt-4 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <p className="text-emerald-400 text-sm">
            <strong>✅ Ưu điểm SePay:</strong> Miễn phí hoàn toàn, Không giới hạn giao dịch, webhook real-time, hỗ trợ 15+ ngân hàng, bảo mật ISO 27001
          </p>
        </div>
      </div>
    </div>
  );
}
