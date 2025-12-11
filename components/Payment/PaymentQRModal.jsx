'use client';

import { useState } from 'react';
import { X, CreditCard, Smartphone, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { formatPrice, PRICING, getTierInfo } from '@/lib/tierSystem';

/**
 * PaymentQRModal - Modal hiển thị QR thanh toán
 */
export default function PaymentQRModal({ 
  isOpen, 
  onClose, 
  orderData, 
  onPaymentSuccess 
}) {
  const [checking, setChecking] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, checking, success, failed

  if (!isOpen || !orderData) return null;

  const { orderCode, amount, tierName, duration, qrDataUrl, bankInfo } = orderData;
  const tierInfo = getTierInfo(tierName);

  // Kiểm tra trạng thái thanh toán
  const checkPaymentStatus = async () => {
    setChecking(true);
    setPaymentStatus('checking');
    
    try {
      const res = await fetch(`/api/payment/check?orderCode=${orderCode}`);
      const data = await res.json();
      
      if (data.status === 'completed') {
        setPaymentStatus('success');
        setTimeout(() => {
          onPaymentSuccess?.(data);
          onClose();
        }, 2000);
      } else {
        setPaymentStatus('pending');
      }
    } catch (error) {
      console.error('Error checking payment:', error);
      setPaymentStatus('pending');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`bg-gradient-to-r ${tierInfo.color} p-6 rounded-t-3xl text-white`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="text-center">
            <div className="text-4xl mb-2">{tierInfo.icon}</div>
            <h2 className="text-xl font-bold">{tierInfo.displayName}</h2>
            <p className="text-white/80 text-sm mt-1">{duration} ngày</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {paymentStatus === 'success' ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h3>
              <p className="text-gray-600">Đang kích hoạt gói {tierInfo.displayName}...</p>
            </div>
          ) : (
            <>
              {/* Amount */}
              <div className="text-center mb-6">
                <p className="text-gray-500 text-sm">Số tiền thanh toán</p>
                <p className="text-3xl font-black text-gray-800">{formatPrice(amount)}</p>
              </div>

              {/* QR Code */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="text-center mb-3">
                  <p className="text-sm text-gray-600 font-medium">Quét mã QR để thanh toán</p>
                </div>
                
                {qrDataUrl ? (
                  <div className="flex justify-center">
                    <img 
                      src={qrDataUrl} 
                      alt="QR Code thanh toán"
                      className="w-48 h-48 rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                  </div>
                )}
              </div>

              {/* Bank Info */}
              {bankInfo && (
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <CreditCard size={18} className="text-blue-500" />
                    Thông tin chuyển khoản
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ngân hàng:</span>
                      <span className="font-medium">{bankInfo.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Số tài khoản:</span>
                      <span className="font-medium font-mono">{bankInfo.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Chủ tài khoản:</span>
                      <span className="font-medium">{bankInfo.accountName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nội dung CK:</span>
                      <span className="font-bold text-blue-600 font-mono">{orderCode}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Code */}
              <div className="text-center mb-6">
                <p className="text-xs text-gray-500">Mã đơn hàng</p>
                <p className="font-mono font-bold text-gray-800">{orderCode}</p>
              </div>

              {/* Check Payment Button */}
              <button
                onClick={checkPaymentStatus}
                disabled={checking}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  checking 
                    ? 'bg-gray-100 text-gray-400' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'
                }`}
              >
                {checking ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang kiểm tra...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Tôi đã thanh toán
                  </>
                )}
              </button>

              {/* Expiry Notice */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Clock size={14} />
                <span>Đơn hàng hết hạn sau 15 phút</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
