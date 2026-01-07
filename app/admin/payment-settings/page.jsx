'use client';

import { useState, useEffect } from 'react';

const BANKS = [
  { code: 'BIDV', name: 'BIDV', logo: '🏦' },
  { code: 'VCB', name: 'Vietcombank', logo: '🏛️' },
  { code: 'TCB', name: 'Techcombank', logo: '💳' },
  { code: 'MB', name: 'MB Bank', logo: '🏪' },
  { code: 'ACB', name: 'ACB', logo: '🏢' },
  { code: 'VPB', name: 'VPBank', logo: '🏬' },
  { code: 'TPB', name: 'TPBank', logo: '🏤' },
  { code: 'STB', name: 'Sacombank', logo: '🏨' },
  { code: 'HDB', name: 'HDBank', logo: '🏣' },
  { code: 'VIB', name: 'VIB', logo: '🏥' },
  { code: 'SHB', name: 'SHB', logo: '🏫' },
  { code: 'MSB', name: 'MSB', logo: '🏩' },
  { code: 'OCB', name: 'OCB', logo: '🏠' },
  { code: 'SEAB', name: 'SeABank', logo: '🏡' },
];

// Format số tiền
const formatCurrency = (num) => {
  return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
};

export default function PaymentSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [webhookProvider, setWebhookProvider] = useState('sepay');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // null | 'connected' | 'disconnected' | 'checking'
  
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
  const [activeTab, setActiveTab] = useState('bank'); // 'bank' | 'webhook'

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
          setHasApiKey(data.settings.hasApiKey ?? false);
          setWebhookProvider(data.settings.webhookProvider || 'sepay');
          
          // Set connection status based on isActive
          if (data.settings.isActive) {
            setConnectionStatus('connected');
          } else if (data.settings.hasApiKey) {
            setConnectionStatus('disconnected');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Không thể tải cài đặt. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Lưu thông tin ngân hàng
  const handleSaveBank = async () => {
    setIsSavingBank(true);
    setMessage({ type: '', text: '' });

    if (!bankSettings.accountNumber.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập số tài khoản ngân hàng' });
      setIsSavingBank(false);
      return;
    }

    if (!bankSettings.accountName.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập tên chủ tài khoản' });
      setIsSavingBank(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bank',
          ...bankSettings
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Đã lưu thông tin ngân hàng!' });
        fetchSettings();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Có lỗi xảy ra' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu' });
    } finally {
      setIsSavingBank(false);
    }
  };

  // Lưu cấu hình webhook
  const handleSaveWebhook = async () => {
    setIsSavingWebhook(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'webhook',
          webhookProvider,
          apiKey: webhookSettings.apiKey
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Đã lưu cấu hình webhook!' });
        fetchSettings();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Có lỗi xảy ra' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu' });
    } finally {
      setIsSavingWebhook(false);
    }
  };

  const handleTestWebhook = async () => {
    setIsTesting(true);
    setConnectionStatus('checking');
    setMessage({ type: 'info', text: '🔄 Đang kiểm tra kết nối...' });
    
    try {
      const res = await fetch('/api/admin/payment-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: webhookProvider })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setConnectionStatus('connected');
        setMessage({ type: 'success', text: '✅ Kết nối Webhook thành công! Hệ thống sẵn sàng nhận thanh toán.' });
      } else {
        setConnectionStatus('disconnected');
        setMessage({ type: 'error', text: data.error || '❌ Kết nối thất bại. Vui lòng kiểm tra API Key.' });
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      setMessage({ type: 'error', text: '❌ Không thể kết nối. Vui lòng kiểm tra lại cấu hình.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleToggleActive = async () => {
    const newStatus = !isActive;
    
    // Cần có API key để bật
    if (newStatus && !hasApiKey && (!webhookSettings.apiKey || webhookSettings.apiKey === '**********')) {
      setMessage({ type: 'error', text: 'Vui lòng cấu hình API Key trước khi bật thanh toán tự động' });
      return;
    }

    setIsActive(newStatus);
    
    // Auto save
    try {
      await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'toggle',
          isActive: newStatus
        })
      });
      setMessage({ type: 'success', text: newStatus ? '✅ Đã BẬT thanh toán tự động' : '⏸️ Đã TẮT thanh toán tự động' });
      fetchSettings();
    } catch (error) {
      setIsActive(!newStatus); // Revert
      setMessage({ type: 'error', text: 'Không thể thay đổi trạng thái' });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: '📋 Đã copy vào clipboard!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
  };

  const getQRPreviewUrl = (amount = 199000) => {
    if (!bankSettings.accountNumber) return '';
    return `https://img.vietqr.io/image/${bankSettings.bankCode}-${bankSettings.accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent('SOROKIDS TEST')}&accountName=${encodeURIComponent(bankSettings.accountName)}`;
  };

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/payment/webhook/${webhookProvider}`
    : `https://sorokid.com/api/payment/webhook/${webhookProvider}`;

  const selectedBank = BANKS.find(b => b.code === bankSettings.bankCode);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400">Đang tải cài đặt thanh toán...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {/* Header with Status */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-2">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            💳 Cài đặt thanh toán
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 line-clamp-2">Cấu hình tài khoản ngân hàng và webhook để nhận thanh toán tự động</p>
        </div>
        
        {/* Master Toggle */}
        <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${isActive ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800 border-slate-700'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></div>
            <span className={`font-medium text-sm ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isActive ? 'Đang hoạt động' : 'Đang tắt'}
            </span>
          </div>
          <button 
            onClick={handleToggleActive}
            className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${isActive ? 'bg-emerald-500' : 'bg-slate-600'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isActive ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-3 sm:p-4 rounded-xl border flex items-center gap-2 sm:gap-3 text-sm ${
          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
          message.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
          'bg-blue-500/10 text-blue-400 border-blue-500/30'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto hover:opacity-70">✕</button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700">
          <div className="text-slate-400 text-xs sm:text-sm">Ngân hàng</div>
          <div className="text-white font-semibold mt-1 text-sm sm:text-base truncate">{selectedBank?.name || 'Chưa cấu hình'}</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700">
          <div className="text-slate-400 text-xs sm:text-sm">Số tài khoản</div>
          <div className="text-white font-semibold mt-1 font-mono text-xs sm:text-base truncate">{bankSettings.accountNumber || '---'}</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700">
          <div className="text-slate-400 text-xs sm:text-sm">Webhook</div>
          <div className={`font-semibold mt-1 flex items-center gap-1 sm:gap-2 text-xs sm:text-base ${connectionStatus === 'connected' ? 'text-emerald-400' : connectionStatus === 'checking' ? 'text-yellow-400' : 'text-slate-400'}`}>
            <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400' : connectionStatus === 'checking' ? 'bg-yellow-400 animate-pulse' : 'bg-slate-500'}`}></span>
            {connectionStatus === 'connected' ? 'OK' : connectionStatus === 'checking' ? '...' : 'Chưa'}
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700">
          <div className="text-slate-400 text-xs sm:text-sm">Provider</div>
          <div className="text-purple-400 font-semibold mt-1 text-sm sm:text-base">{webhookProvider === 'sepay' ? 'SePay' : 'Casso'}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 border-b border-slate-700 pb-0">
        {[
          { id: 'bank', label: '🏦 Ngân hàng' },
          { id: 'webhook', label: '🔗 Webhook' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-t-xl transition-all font-medium text-sm sm:text-base ${
              activeTab === tab.id 
                ? 'bg-slate-800 text-white border-t border-l border-r border-slate-700' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-slate-800 rounded-b-2xl rounded-tr-2xl p-3 sm:p-6 border border-slate-700 border-t-0">
        
        {/* Bank Settings Tab */}
        {activeTab === 'bank' && (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Tài khoản ngân hàng nhận tiền</h3>
              <p className="text-slate-400 text-xs sm:text-sm">Tiền thanh toán của học sinh sẽ được chuyển vào tài khoản này</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              {/* Form */}
              <div className="space-y-3 sm:space-y-4">
                {/* Bank Select */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">🏦 Ngân hàng *</label>
                  <select
                    value={bankSettings.bankCode}
                    onChange={(e) => setBankSettings({ ...bankSettings, bankCode: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  >
                    {BANKS.map(bank => (
                      <option key={bank.code} value={bank.code}>{bank.logo} {bank.name} ({bank.code})</option>
                    ))}
                  </select>
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2"># Số tài khoản *</label>
                  <input
                    type="text"
                    value={bankSettings.accountNumber}
                    onChange={(e) => setBankSettings({ ...bankSettings, accountNumber: e.target.value.replace(/\D/g, '') })}
                    placeholder="Nhập số tài khoản"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-base sm:text-lg"
                  />
                  <p className="text-slate-500 text-[10px] sm:text-xs mt-1">Có thể dùng Virtual Account (VA) của SePay</p>
                </div>

                {/* Account Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">👤 Tên chủ tài khoản *</label>
                  <input
                    type="text"
                    value={bankSettings.accountName}
                    onChange={(e) => setBankSettings({ ...bankSettings, accountName: e.target.value.toUpperCase() })}
                    placeholder="NGUYEN VAN A"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase text-sm sm:text-base"
                  />
                  <p className="text-slate-500 text-[10px] sm:text-xs mt-1">Nhập chính xác (không dấu, in hoa)</p>
                </div>
              </div>

              {/* QR Preview */}
              <div className="flex flex-col items-center justify-center">
                {bankSettings.accountNumber ? (
                  <div className="text-center">
                    <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-lg inline-block">
                      <img 
                        src={getQRPreviewUrl()} 
                        alt="QR Preview" 
                        className="w-40 h-40 sm:w-52 sm:h-52 object-contain"
                      />
                    </div>
                    <p className="text-slate-400 text-xs sm:text-sm mt-2 sm:mt-3">📱 QR mẫu: {formatCurrency(199000)}</p>
                    <p className="text-emerald-400 text-[10px] sm:text-xs mt-1">Quét để test chuyển tiền</p>
                  </div>
                ) : (
                  <div className="text-center p-6 sm:p-8 border-2 border-dashed border-slate-600 rounded-2xl">
                    <span className="text-3xl sm:text-4xl">📱</span>
                    <p className="text-slate-400 mt-2 text-xs sm:text-sm">Nhập số tài khoản để xem QR</p>
                  </div>
                )}
              </div>
            </div>

            {/* Save Bank Button */}
            <div className="pt-3 sm:pt-4 border-t border-slate-700">
              <button
                onClick={handleSaveBank}
                disabled={isSavingBank}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 flex items-center gap-2 text-sm sm:text-base"
              >
                {isSavingBank ? (
                  <>
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Đang lưu...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>🏦 <span className="hidden sm:inline">Lưu thông tin ngân hàng</span><span className="sm:hidden">Lưu ngân hàng</span></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Webhook Settings Tab */}
        {activeTab === 'webhook' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Dịch vụ Webhook</h3>
                <p className="text-slate-400 text-xs sm:text-sm">Nhận thông báo real-time khi có tiền vào</p>
              </div>
              
              {/* Connection Status Badge */}
              <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-sm w-fit ${
                connectionStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-400' :
                connectionStatus === 'checking' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-slate-700 text-slate-400'
              }`}>
                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-emerald-400' :
                  connectionStatus === 'checking' ? 'bg-yellow-400 animate-pulse' :
                  'bg-slate-500'
                }`}></span>
                {connectionStatus === 'connected' ? '✅ Đã kết nối' : 
                 connectionStatus === 'checking' ? '⏳ Đang kiểm tra...' : 
                 '⚠️ Chưa kết nối'}
              </div>
            </div>

            {/* Provider Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div 
                onClick={() => setWebhookProvider('sepay')}
                className={`p-3 sm:p-5 border-2 rounded-xl cursor-pointer transition-all relative ${
                  webhookProvider === 'sepay' 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <span className="absolute -top-2.5 sm:-top-3 left-3 sm:left-4 bg-emerald-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded font-medium">
                  ⭐ Khuyên dùng
                </span>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl">🔌</span>
                  <div>
                    <div className="font-semibold text-white text-base sm:text-lg">SePay</div>
                    <p className="text-emerald-400 text-xs sm:text-sm font-medium">Miễn phí</p>
                  </div>
                </div>
                <div className="mt-2 sm:mt-3 space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs text-slate-400">
                  <p>✓ Không giới hạn giao dịch</p>
                  <p>✓ Webhook real-time</p>
                  <p className="hidden sm:block">✓ Hỗ trợ 15+ ngân hàng</p>
                </div>
                <a href="https://sepay.vn" target="_blank" rel="noreferrer" className="text-purple-400 text-[10px] sm:text-xs hover:underline inline-flex items-center gap-1 mt-1.5 sm:mt-2">
                  sepay.vn ↗
                </a>
              </div>

              <div 
                onClick={() => setWebhookProvider('casso')}
                className={`p-3 sm:p-5 border-2 rounded-xl cursor-pointer transition-all ${
                  webhookProvider === 'casso' 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl">🔗</span>
                  <div>
                    <div className="font-semibold text-white text-base sm:text-lg">Casso</div>
                    <p className="text-slate-400 text-xs sm:text-sm">Free 7 TK, 50k/th</p>
                  </div>
                </div>
                <div className="mt-2 sm:mt-3 space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs text-slate-400">
                  <p>✓ Nhiều ngân hàng</p>
                  <p>✓ Webhook real-time</p>
                  <p className="hidden sm:block">✓ Dashboard quản lý</p>
                </div>
                <a href="https://casso.vn" target="_blank" rel="noreferrer" className="text-purple-400 text-[10px] sm:text-xs hover:underline inline-flex items-center gap-1 mt-1.5 sm:mt-2">
                  casso.vn ↗
                </a>
              </div>
            </div>

            {/* API Configuration */}
            <div className="bg-slate-900/50 rounded-xl p-3 sm:p-5 space-y-3 sm:space-y-4">
              <h4 className="font-medium text-white flex items-center gap-2 text-sm sm:text-base">
                🔐 Cấu hình {webhookProvider === 'sepay' ? 'SePay' : 'Casso'}
              </h4>

              {/* API Key */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">API Key *</label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={webhookSettings.apiKey}
                    onChange={(e) => setWebhookSettings({ ...webhookSettings, apiKey: e.target.value })}
                    placeholder={hasApiKey ? '••••••••••••' : 'Nhập API Key'}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-16 sm:pr-24 text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs sm:text-sm"
                  >
                    {showApiKey ? '🙈' : '👁️'}
                  </button>
                </div>
                {hasApiKey && (
                  <p className="text-emerald-400 text-[10px] sm:text-xs mt-1">✓ API Key đã được lưu</p>
                )}
              </div>

              {/* Webhook URL */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">🔗 Webhook URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={webhookUrl}
                    readOnly
                    className="flex-1 px-2 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-[10px] sm:text-sm font-mono truncate"
                  />
                  <button
                    onClick={() => copyToClipboard(webhookUrl)}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-medium text-sm"
                  >
                    📋
                  </button>
                </div>
              </div>

              {/* Test Connection Button */}
              <button
                onClick={handleTestWebhook}
                disabled={isTesting || (!hasApiKey && !webhookSettings.apiKey)}
                className="w-full py-2.5 sm:py-3 border-2 border-purple-500 text-purple-400 font-medium rounded-xl hover:bg-purple-500/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isTesting ? (
                  <>
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Đang kiểm tra...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>🔌 <span className="hidden sm:inline">Test kết nối Webhook</span><span className="sm:hidden">Test kết nối</span></>
                )}
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-amber-500/10 rounded-xl p-3 sm:p-4 border border-amber-500/20">
              <h4 className="font-medium text-amber-400 mb-2 text-sm sm:text-base">📋 Hướng dẫn nhanh</h4>
              <ol className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-slate-300 list-decimal ml-4">
                <li>Đăng ký tài khoản tại <a href={`https://${webhookProvider}.vn`} target="_blank" rel="noreferrer" className="text-purple-400 underline">{webhookProvider}.vn</a></li>
                <li>Liên kết tài khoản ngân hàng</li>
                <li>Vào <strong className="text-white">Cài đặt → API → Tạo API Key</strong></li>
                <li>Copy API Key và paste vào ô trên</li>
                <li>Copy <strong className="text-white">Webhook URL</strong> vào {webhookProvider}</li>
              </ol>
            </div>

            {/* Save Webhook Button */}
            <div className="pt-3 sm:pt-4 border-t border-slate-700">
              <button
                onClick={handleSaveWebhook}
                disabled={isSavingWebhook}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 flex items-center gap-2 text-sm sm:text-base"
              >
                {isSavingWebhook ? (
                  <>
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Đang lưu...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>🔗 <span className="hidden sm:inline">Lưu cấu hình Webhook</span><span className="sm:hidden">Lưu Webhook</span></>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
