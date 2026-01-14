'use client';

import { useState } from 'react';
import { X, CreditCard, Smartphone, Clock, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { formatPrice, PRICING, getTierInfo } from '@/lib/tierSystem';
import { useI18n } from '@/lib/i18n/I18nContext';

/**
 * PaymentQRModal - Modal hiển thị QR thanh toán
 */
export default function PaymentQRModal({ 
  isOpen, 
  onClose, 
  orderData, 
  onPaymentSuccess 
}) {
  const { t } = useI18n();
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
      // 🔧 FIX: Sử dụng đúng API endpoint
      const res = await fetch(`/api/payment/status/${orderCode}`);
      const data = await res.json();
      
      if (data.status === 'completed') {
        setPaymentStatus('success');
        setTimeout(() => {
          onPaymentSuccess?.(data);
          onClose();
        }, 2000);
      } else if (data.status === 'expired') {
        setPaymentStatus('expired');
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
            <div className="text-5xl mb-3">{tierInfo.icon}</div>
            <p className="text-white/80 text-sm">{t('payment.scanQR')}</p>
            <h2 className="text-2xl font-black mt-1">{tierInfo.displayName} - {formatPrice(amount)}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {paymentStatus === 'success' ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('payment.success')}</h3>
              <p className="text-gray-600">{t('payment.activating', { tier: tierInfo.displayName })}</p>
            </div>
          ) : paymentStatus === 'expired' ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('payment.expired')}</h3>
              <p className="text-gray-600 mb-4">{t('payment.createNewOrder')}</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          ) : (
            <>
              {/* Package Info - Nổi bật */}
              <div className={`bg-gradient-to-r ${tierInfo.color} bg-opacity-10 border-2 border-current rounded-2xl p-4 mb-6`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{tierInfo.icon}</div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{tierInfo.displayName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-gray-800">{formatPrice(amount)}</p>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="text-center mb-3">
                  <p className="text-sm text-gray-600 font-medium">{t('payment.scanQR')}</p>
                </div>
                
                {qrDataUrl ? (
                  <div className="flex justify-center">
                    <img 
                      src={qrDataUrl} 
                      alt={t('payment.qrAlt')}
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
                    {t('payment.bankInfo')}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('payment.bank')}:</span>
                      <span className="font-medium">{bankInfo.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('payment.accountNumber')}:</span>
                      <span className="font-medium font-mono">{bankInfo.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('payment.accountName')}:</span>
                      <span className="font-medium">{bankInfo.accountName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('payment.content')}:</span>
                      <span className="font-bold text-blue-600 font-mono">{orderCode}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Code */}
              <div className="text-center mb-6">
                <p className="text-xs text-gray-500">{t('payment.orderCode')}</p>
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
                    {t('payment.checking')}
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    {t('payment.iHavePaid')}
                  </>
                )}
              </button>

              {/* Expiry Notice */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Clock size={14} />
                <span>{t('payment.expiresIn15')}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
