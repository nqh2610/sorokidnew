'use client';

import { useState, useEffect } from 'react';

const ICONS = ['Gift', 'Star', 'Crown', 'Zap', 'Shield', 'Award', 'Rocket', 'Diamond'];

const formatCurrency = (num) => {
  return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
};

export default function PricingAdminPage() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingPlan, setEditingPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/admin/pricing');
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Không thể tải danh sách gói' });
    } finally {
      setIsLoading(false);
    }
  };

  // Lưu tất cả plans vào database
  const savePlansToDb = async (newPlans) => {
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans: newPlans })
      });

      if (res.ok) {
        return true;
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Có lỗi xảy ra' });
        return false;
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu' });
      return false;
    }
  };

  const handleDeletePlan = async (planId) => {
    if (planId === 'free') {
      setMessage({ type: 'error', text: 'Không thể xóa gói miễn phí!' });
      return;
    }

    if (!confirm('Bạn có chắc muốn xóa gói này?')) return;

    setIsSaving(true);
    const newPlans = plans.filter(p => p.id !== planId);
    const success = await savePlansToDb(newPlans);
    if (success) {
      setPlans(newPlans);
      setMessage({ type: 'success', text: '✅ Đã xóa gói thành công!' });
    }
    setIsSaving(false);
  };

  const handleEditPlan = (plan) => {
    setEditingPlan({ ...plan });
    setShowModal(true);
  };

  const handleAddPlan = () => {
    setEditingPlan({
      id: '',
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      icon: 'Star',
      badge: '',
      popular: false,
      disabled: false,
      order: plans.length,
      features: [],
      maxLevels: 18,
      maxDifficulty: 5,
    });
    setShowModal(true);
  };

  const handleSavePlan = async () => {
    if (!editingPlan.id || !editingPlan.name) {
      setMessage({ type: 'error', text: 'Vui lòng nhập ID và Tên gói' });
      return;
    }

    setIsSaving(true);
    const index = plans.findIndex(p => p.id === editingPlan.id);
    let newPlans;
    
    if (index === -1) {
      // Add new
      newPlans = [...plans, editingPlan];
    } else {
      // Update existing
      newPlans = [...plans];
      newPlans[index] = editingPlan;
    }

    const success = await savePlansToDb(newPlans);
    if (success) {
      setPlans(newPlans);
      setShowModal(false);
      setEditingPlan(null);
      setMessage({ type: 'success', text: index === -1 ? '✅ Đã thêm gói mới!' : '✅ Đã cập nhật gói!' });
    }
    setIsSaving(false);
  };

  const handleFeatureChange = (index, field, value) => {
    const newFeatures = [...editingPlan.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setEditingPlan({ ...editingPlan, features: newFeatures });
  };

  const addFeature = () => {
    setEditingPlan({
      ...editingPlan,
      features: [...editingPlan.features, { text: '', included: true, highlight: false }]
    });
  };

  const removeFeature = (index) => {
    const newFeatures = editingPlan.features.filter((_, i) => i !== index);
    setEditingPlan({ ...editingPlan, features: newFeatures });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
            💰 Quản lý Gói Dịch vụ
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Thêm, sửa, xóa các gói dịch vụ hiển thị trên trang Pricing</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={handleAddPlan}
            className="px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2 text-sm sm:text-base"
          >
            <span>➕</span> <span className="hidden sm:inline">Thêm gói mới</span><span className="sm:hidden">Thêm</span>
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

      {/* Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`bg-slate-800 rounded-2xl p-4 sm:p-6 border transition-all hover:shadow-lg ${
              plan.popular ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-700'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl ${
                  plan.id === 'free' ? 'bg-slate-700' :
                  plan.id === 'basic' ? 'bg-blue-500/20' :
                  plan.id === 'advanced' ? 'bg-purple-500/20' :
                  'bg-amber-500/20'
                }`}>
                  {plan.id === 'free' ? '🎁' : 
                   plan.id === 'basic' ? '⭐' : 
                   plan.id === 'advanced' ? '👑' : '💎'}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base sm:text-lg">{plan.name}</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">{plan.id}</p>
                </div>
              </div>
              {plan.badge && (
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-pink-500 to-orange-500 text-white text-[10px] sm:text-xs rounded-full">
                  {plan.badge}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="mb-3 sm:mb-4">
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-white">{formatCurrency(plan.price)}</span>
                {plan.originalPrice > plan.price && (
                  <span className="text-slate-500 line-through text-xs sm:text-sm">{formatCurrency(plan.originalPrice)}</span>
                )}
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 line-clamp-2">{plan.description}</p>
            </div>

            {/* Features */}
            <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
              {plan.features?.slice(0, 4).map((feature, i) => (
                <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <span className={feature.included ? 'text-emerald-400' : 'text-slate-500'}>
                    {feature.included ? '✓' : '✗'}
                  </span>
                  <span className={feature.highlight ? 'text-purple-400 font-medium' : 'text-slate-300'}>
                    {feature.text}
                  </span>
                </div>
              ))}
              {plan.features?.length > 4 && (
                <p className="text-slate-500 text-xs">+{plan.features.length - 4} tính năng...</p>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              {plan.disabled && (
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-slate-700 text-slate-400 text-[10px] sm:text-xs rounded">Không mua</span>
              )}
              {plan.popular && (
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-500/20 text-purple-400 text-[10px] sm:text-xs rounded">Popular</span>
              )}
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-slate-700 text-slate-400 text-[10px] sm:text-xs rounded">
                Lv: 1-{plan.maxLevels}
              </span>
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-slate-700 text-slate-400 text-[10px] sm:text-xs rounded">
                Cấp: 1-{plan.maxDifficulty}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 sm:pt-4 border-t border-slate-700">
              <button
                onClick={() => handleEditPlan(plan)}
                className="flex-1 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors text-xs sm:text-sm font-medium"
              >
                ✏️ Sửa
              </button>
              <button
                onClick={() => handleDeletePlan(plan.id)}
                disabled={plan.id === 'free'}
                className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🗑️ Xóa
              </button>
            </div>
          </div>
        ))}

        {/* Add New Card */}
        <div 
          onClick={handleAddPlan}
          className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 border-2 border-dashed border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-slate-800 transition-all min-h-[250px] sm:min-h-[300px]"
        >
          <span className="text-3xl sm:text-4xl mb-2 sm:mb-3">➕</span>
          <p className="text-slate-400 font-medium text-sm sm:text-base">Thêm gói mới</p>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && editingPlan && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-800 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {plans.find(p => p.id === editingPlan.id) ? 'Sửa gói' : 'Thêm gói mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xl sm:text-2xl">
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">ID gói *</label>
                  <input
                    type="text"
                    value={editingPlan.id}
                    onChange={(e) => setEditingPlan({ ...editingPlan, id: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                    placeholder="vd: premium"
                    disabled={plans.find(p => p.id === editingPlan.id)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white disabled:opacity-50 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Tên gói *</label>
                  <input
                    type="text"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    placeholder="vd: Premium"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Mô tả</label>
                <input
                  type="text"
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  placeholder="Mô tả ngắn về gói..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm sm:text-base"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Giá bán (VNĐ)</label>
                  <input
                    type="number"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm sm:text-base"
                  />
                  <p className="text-purple-400 text-xs sm:text-sm mt-1">{formatCurrency(editingPlan.price)}</p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Giá gốc (VNĐ)</label>
                  <input
                    type="number"
                    value={editingPlan.originalPrice}
                    onChange={(e) => setEditingPlan({ ...editingPlan, originalPrice: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm sm:text-base"
                  />
                  {editingPlan.originalPrice > editingPlan.price && (
                    <p className="text-emerald-400 text-xs sm:text-sm mt-1">
                      Tiết kiệm: {formatCurrency(editingPlan.originalPrice - editingPlan.price)}
                    </p>
                  )}
                </div>
              </div>

              {/* Display Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Icon</label>
                  <select
                    value={editingPlan.icon}
                    onChange={(e) => setEditingPlan({ ...editingPlan, icon: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm sm:text-base"
                  >
                    {ICONS.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Badge</label>
                  <input
                    type="text"
                    value={editingPlan.badge || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, badge: e.target.value || null })}
                    placeholder="vd: 🔥 Phổ biến nhất"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPlan.popular}
                    onChange={(e) => setEditingPlan({ ...editingPlan, popular: e.target.checked })}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded border-slate-600 bg-slate-700 text-purple-500"
                  />
                  <span className="text-slate-300 text-xs sm:text-sm">Popular</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPlan.disabled}
                    onChange={(e) => setEditingPlan({ ...editingPlan, disabled: e.target.checked })}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded border-slate-600 bg-slate-700 text-purple-500"
                  />
                  <span className="text-slate-300 text-xs sm:text-sm">Disabled</span>
                </label>
              </div>

              {/* Tier Limits */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Max Lv</label>
                  <input
                    type="number"
                    value={editingPlan.maxLevels}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxLevels: parseInt(e.target.value) || 5 })}
                    min="1"
                    max="50"
                    className="w-full px-2 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Max Cấp</label>
                  <input
                    type="number"
                    value={editingPlan.maxDifficulty}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxDifficulty: parseInt(e.target.value) || 2 })}
                    min="1"
                    max="10"
                    className="w-full px-2 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Thứ tự</label>
                  <input
                    type="number"
                    value={editingPlan.order}
                    onChange={(e) => setEditingPlan({ ...editingPlan, order: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-2 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Features */}
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <label className="text-xs sm:text-sm font-medium text-slate-300">Tính năng</label>
                  <button
                    onClick={addFeature}
                    className="px-2 sm:px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs sm:text-sm hover:bg-purple-500/30"
                  >
                    + Thêm
                  </button>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {editingPlan.features?.map((feature, index) => (
                    <div key={index} className="flex gap-1.5 sm:gap-2 items-center">
                      <input
                        type="text"
                        value={feature.text}
                        onChange={(e) => handleFeatureChange(index, 'text', e.target.value)}
                        placeholder="Mô tả..."
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs sm:text-sm"
                      />
                      <label className="flex items-center gap-0.5 sm:gap-1 cursor-pointer whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={feature.included}
                          onChange={(e) => handleFeatureChange(index, 'included', e.target.checked)}
                          className="w-3 h-3 sm:w-4 sm:h-4 rounded"
                        />
                        <span className="text-[10px] sm:text-xs text-slate-400">Có</span>
                      </label>
                      <label className="flex items-center gap-0.5 sm:gap-1 cursor-pointer whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={feature.highlight}
                          onChange={(e) => handleFeatureChange(index, 'highlight', e.target.checked)}
                          className="w-3 h-3 sm:w-4 sm:h-4 rounded"
                        />
                        <span className="text-[10px] sm:text-xs text-slate-400">HL</span>
                      </label>
                      <button
                        onClick={() => removeFeature(index)}
                        className="p-1.5 sm:p-2 text-red-400 hover:bg-red-500/20 rounded-lg text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-800 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-700 flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isSaving}
                className="flex-1 py-2.5 sm:py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                Hủy
              </button>
              <button
                onClick={handleSavePlan}
                disabled={isSaving}
                className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {isSaving ? (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Đang lưu...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>💾 <span className="hidden sm:inline">Lưu gói</span><span className="sm:hidden">Lưu</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
