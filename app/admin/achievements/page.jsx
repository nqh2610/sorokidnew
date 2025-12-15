'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminConfirmDialog from '@/components/Admin/AdminConfirmDialog';

// Simple toast component inline
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  const bgColor = type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
    : type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400'
    : 'bg-blue-500/20 border-blue-500/30 text-blue-400';
  return (
    <div className={`fixed top-4 right-4 z-[100] ${bgColor} border backdrop-blur-xl rounded-xl px-4 py-3 shadow-xl flex items-center gap-2`}>
      {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'} {message}
    </div>
  );
}

const CATEGORIES = [
  { value: 'learning', label: 'Học tập', icon: '📚', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'practice', label: 'Luyện tập', icon: '🎯', color: 'bg-green-500/20 text-green-400' },
  { value: 'compete', label: 'Thi đấu', icon: '⚔️', color: 'bg-red-500/20 text-red-400' },
  { value: 'streak', label: 'Chuỗi ngày', icon: '🔥', color: 'bg-amber-500/20 text-amber-400' },
  { value: 'social', label: 'Xã hội', icon: '👥', color: 'bg-purple-500/20 text-purple-400' }
];

const ICONS = ['🏆', '⭐', '🎯', '🔥', '💎', '🎮', '📚', '✨', '🚀', '💪', '🌟', '👑', '🎪', '🎨', '🎭', '🎪', '🎲', '🧠', '💡', '📖'];

// Tất cả requirement types có trong database
const REQUIREMENT_TYPES = [
  // === BÀI HỌC ===
  { value: 'complete_lessons', label: 'Hoàn thành bài học', icon: '📚', unit: 'bài', hasTarget: true },
  { value: 'complete_all_lessons', label: 'Hoàn thành tất cả bài học', icon: '📖', unit: '', hasTarget: false },
  { value: 'three_star_lessons', label: 'Đạt 3 sao bài học', icon: '⭐', unit: 'bài', hasTarget: true },
  { value: 'three_star_all_lessons', label: 'Đạt 3 sao tất cả bài học', icon: '🌟', unit: '', hasTarget: false },
  { value: 'complete_levels', label: 'Hoàn thành màn', icon: '🎮', unit: 'màn', hasTarget: true },
  
  // === LUYỆN TẬP ===
  { value: 'complete_exercises', label: 'Hoàn thành lượt luyện tập', icon: '✏️', unit: 'lượt', hasTarget: true },
  { value: 'accurate_exercises', label: 'Trả lời đúng', icon: '✅', unit: 'câu', hasTarget: true },
  { value: 'accuracy_streak', label: 'Chuỗi trả lời đúng liên tiếp', icon: '🎯', unit: 'câu', hasTarget: true },
  { value: 'perfect_exercises', label: 'Đạt điểm tối đa', icon: '💯', unit: 'lượt', hasTarget: true },
  { value: 'perfect_exercise', label: 'Đạt điểm tối đa', icon: '💯', unit: 'lượt', hasTarget: true },
  { value: 'total_practice', label: 'Tổng lượt luyện tập', icon: '🎯', unit: 'lượt', hasTarget: true },
  
  // === TỐC ĐỘ ===
  { value: 'fast_exercise', label: 'Trả lời nhanh', icon: '⚡', unit: 'giây', hasTarget: true },
  { value: 'fast_streak', label: 'Chuỗi trả lời nhanh liên tiếp', icon: '🏃', unit: 'câu', hasTarget: true },
  { value: 'speed_master', label: 'Bậc thầy tốc độ', icon: '🚀', unit: '', hasTarget: false },
  { value: 'speed_rush', label: 'Tia chớp', icon: '💨', unit: '', hasTarget: false },
  
  // === THI ĐẤU ===
  { value: 'win_compete', label: 'Chiến thắng trận thi đấu', icon: '🏆', unit: 'trận', hasTarget: true },
  { value: 'compete_matches', label: 'Tham gia thi đấu', icon: '⚔️', unit: 'trận', hasTarget: true },
  { value: 'compete_first_place', label: 'Đạt hạng nhất thi đấu', icon: '🥇', unit: 'lần', hasTarget: true },
  { value: 'first_compete', label: 'Lần thi đấu đầu tiên', icon: '⚔️', unit: '', hasTarget: false },
  
  // === CHUỖI NGÀY ===
  { value: 'login_streak', label: 'Đăng nhập liên tiếp', icon: '🔥', unit: 'ngày', hasTarget: true },
  { value: 'streak', label: 'Chuỗi ngày hoạt động', icon: '🔥', unit: 'ngày', hasTarget: true },
  
  // === THÀNH TÍCH ===
  { value: 'unlock_achievements', label: 'Mở khóa thành tích', icon: '🏅', unit: 'thành tích', hasTarget: true },
  { value: 'unlock_all_achievements', label: 'Mở tất cả thành tích', icon: '👑', unit: '', hasTarget: false },
  
  // === ĐẶC BIỆT ===
  { value: 'birthday_login', label: 'Đăng nhập ngày sinh nhật', icon: '🎂', unit: '', hasTarget: false },
  { value: 'early_adopter', label: 'Người dùng đầu tiên', icon: '🌅', unit: '', hasTarget: false },
  { value: 'first_lesson', label: 'Hoàn thành bài học đầu tiên', icon: '🎉', unit: '', hasTarget: false },
  
  // === PHẦN THƯỞNG ===
  { value: 'earn_stars', label: 'Tích lũy sao', icon: '⭐', unit: 'sao', hasTarget: true },
  { value: 'earn_diamonds', label: 'Tích lũy kim cương', icon: '💎', unit: 'viên', hasTarget: true },
  { value: 'reach_tier', label: 'Đạt hạng', icon: '🏅', unit: '', hasTarget: false, hasTier: true },
  { value: 'reach_level', label: 'Đạt màn', icon: '📈', unit: 'màn', hasTarget: true },
  { value: 'perfect_score', label: 'Điểm tuyệt đối', icon: '💯', unit: 'lần', hasTarget: true }
];

const TIER_OPTIONS = [
  { value: 'bronze', label: 'Đồng 🥉' },
  { value: 'silver', label: 'Bạc 🥈' },
  { value: 'gold', label: 'Vàng 🥇' },
  { value: 'platinum', label: 'Bạch Kim 💠' },
  { value: 'diamond', label: 'Kim Cương 💎' },
  { value: 'master', label: 'Cao Thủ 👑' }
];

// Helper function để hiển thị requirement dạng dễ đọc
function formatRequirement(requirement) {
  if (!requirement) return { text: 'Chưa thiết lập', icon: '❓' };
  
  const req = typeof requirement === 'string' ? JSON.parse(requirement) : requirement;
  const type = req.type;
  const target = req.target || req.count || 1;
  const tier = req.tier;
  
  const typeConfig = REQUIREMENT_TYPES.find(t => t.value === type);
  
  if (!typeConfig) {
    return { text: `${type}: ${target}`, icon: '📝' };
  }
  
  if (typeConfig.hasTier && tier) {
    const tierConfig = TIER_OPTIONS.find(t => t.value === tier);
    return { 
      text: `${tierConfig?.label || tier}`, 
      icon: typeConfig.icon,
      label: typeConfig.label
    };
  }
  
  if (typeConfig.hasTarget) {
    return { 
      text: `${target} ${typeConfig.unit}`, 
      icon: typeConfig.icon,
      label: typeConfig.label
    };
  }
  
  return { 
    text: typeConfig.label, 
    icon: typeConfig.icon,
    label: ''
  };
}

// Component builder cho requirement
function RequirementBuilder({ value, onChange }) {
  const [reqType, setReqType] = useState('complete_lessons');
  const [target, setTarget] = useState(1);
  const [tier, setTier] = useState('bronze');

  // Parse giá trị ban đầu
  useEffect(() => {
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      if (parsed.type) setReqType(parsed.type);
      if (parsed.target) setTarget(parsed.target);
      if (parsed.tier) setTier(parsed.tier);
    } catch (e) {}
  }, []);

  // Cập nhật JSON khi thay đổi
  useEffect(() => {
    const currentType = REQUIREMENT_TYPES.find(t => t.value === reqType);
    const requirement = { type: reqType };
    
    if (currentType?.hasTarget) {
      requirement.target = parseInt(target) || 1;
    }
    if (currentType?.hasTier) {
      requirement.tier = tier;
    }
    
    onChange(JSON.stringify(requirement));
  }, [reqType, target, tier]);

  const currentType = REQUIREMENT_TYPES.find(t => t.value === reqType) || REQUIREMENT_TYPES[0];

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Loại điều kiện *</label>
        <select
          value={reqType}
          onChange={(e) => setReqType(e.target.value)}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
        >
          {REQUIREMENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
      </div>
      
      {currentType.hasTarget && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Mục tiêu {currentType.unit ? `(${currentType.unit})` : ''} *
          </label>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            min={1}
            placeholder={`Nhập số ${currentType.unit}`}
          />
        </div>
      )}

      {currentType.hasTier && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Chọn hạng *</label>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            {TIER_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Preview */}
      <div className="mt-2 p-2 bg-slate-900/50 rounded-lg">
        <div className="text-xs text-slate-500 mb-1">Điều kiện đạt thành tích:</div>
        <div className="text-sm text-emerald-400 font-medium">
          {currentType.icon} {currentType.label}
          {currentType.hasTarget && `: ${target} ${currentType.unit}`}
          {currentType.hasTier && `: ${TIER_OPTIONS.find(t => t.value === tier)?.label}`}
        </div>
      </div>
    </div>
  );
}

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  
  // Toast & Confirm states
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const showToast = (message, type = 'info') => setToast({ message, type });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🏆',
    category: 'learning',
    requirement: '{"type":"complete_lessons","target":1}',
    stars: 100,
    diamonds: 20
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchAchievements();
  }, [filterCategory]);

  // Filtered & paginated data
  const filteredAchievements = useMemo(() => {
    return achievements.filter(a => {
      if (search && !a.name?.toLowerCase().includes(search.toLowerCase()) && 
          !a.description?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [achievements, search]);

  const totalPages = Math.ceil(filteredAchievements.length / itemsPerPage);
  const paginatedAchievements = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAchievements.slice(start, start + itemsPerPage);
  }, [filteredAchievements, currentPage, itemsPerPage]);

  const fetchAchievements = async () => {
    try {
      let url = '/api/admin/achievements';
      if (filterCategory) url += '?category=' + filterCategory;

      const res = await fetch(url);
      const data = await res.json();
      setAchievements(data.achievements || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingAchievement ? 'PUT' : 'POST';
      const body = editingAchievement 
        ? { ...formData, id: editingAchievement.id }
        : formData;

      const res = await fetch('/api/admin/achievements', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditingAchievement(null);
        resetForm();
        fetchAchievements();
        showToast(editingAchievement ? 'Cập nhật thành tích thành công' : 'Thêm thành tích thành công', 'success');
      } else {
        showToast(data.error || 'Có lỗi xảy ra', 'error');
      }
    } catch (error) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      type: 'danger',
      title: 'Xóa thành tích',
      message: 'Bạn có chắc muốn xóa thành tích này? Dữ liệu thành tích của người dùng cũng sẽ bị xóa!',
      confirmText: 'Xóa',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/achievements?id=${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            fetchAchievements();
            showToast('Đã xóa thành tích', 'success');
          } else {
            showToast(data.error, 'error');
          }
        } catch (error) {
          showToast('Có lỗi xảy ra', 'error');
        }
        setConfirmDialog(null);
      }
    });
  };

  const openEditModal = (achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category,
      requirement: JSON.stringify(achievement.requirement, null, 2),
      stars: achievement.stars,
      diamonds: achievement.diamonds
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '🏆',
      category: 'learning',
      requirement: '{"type":"complete_lessons","target":1}',
      stars: 100,
      diamonds: 20
    });
  };

  const getCategoryConfig = (cat) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[0];

  return (
    <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white">🏆 Quản lí Thành tích</h1>
            <p className="text-slate-400 mt-1 text-xs sm:text-sm truncate">Tạo và quản lí các thành tích cho người học</p>
          </div>
          <button
            onClick={() => { setEditingAchievement(null); resetForm(); setShowModal(true); }}
            className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm sm:text-base"
          >
            + Thêm thành tích
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4">
          <div className="bg-slate-800 rounded-xl p-2 sm:p-4 border border-slate-700">
            <div className="text-lg sm:text-2xl font-bold text-white">{stats.total || 0}</div>
            <div className="text-slate-400 text-xs sm:text-sm">Tổng</div>
          </div>
          {CATEGORIES.slice(0, 2).map((cat) => (
            <div key={cat.value} className="bg-slate-800 rounded-xl p-2 sm:p-4 border border-slate-700">
              <div className="text-lg sm:text-2xl font-bold text-white">{stats[cat.value] || 0}</div>
              <div className="text-slate-400 text-xs sm:text-sm">{cat.icon}</div>
            </div>
          ))}
          {CATEGORIES.slice(2).map((cat) => (
            <div key={cat.value} className="hidden sm:block bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="text-2xl font-bold text-white">{stats[cat.value] || 0}</div>
              <div className="text-slate-400 text-sm">{cat.icon} {cat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter & Search */}
        <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700">
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[150px]">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Tìm..."
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
            </div>
            {/* Category filter */}
            <div className="flex items-center gap-2">
              <label className="text-white font-medium text-sm hidden sm:block">Danh mục:</label>
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
              >
                <option value="">Tất cả</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table - Desktop */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Thành tích</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Danh mục</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Điều kiện</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Phần thưởng</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Đã mở khóa</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      Đang tải...
                    </td>
                  </tr>
                ) : achievements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      Chưa có thành tích nào
                    </td>
                  </tr>
                ) : filteredAchievements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      Không tìm thấy thành tích phù hợp
                    </td>
                  </tr>
                ) : (
                  paginatedAchievements.map((achievement) => {
                    const catConfig = getCategoryConfig(achievement.category);
                    return (
                      <tr key={achievement.id} className="hover:bg-slate-700/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{achievement.icon}</span>
                            <div>
                              <div className="text-white font-medium">{achievement.name}</div>
                              <div className="text-slate-400 text-sm truncate max-w-xs">{achievement.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-sm ${catConfig.color}`}>
                            {catConfig.icon} {catConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {(() => {
                            const formatted = formatRequirement(achievement.requirement);
                            return (
                              <div className="bg-slate-900/50 px-3 py-2 rounded-lg max-w-xs">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{formatted.icon}</span>
                                  <div>
                                    {formatted.label && (
                                      <div className="text-xs text-slate-500">{formatted.label}</div>
                                    )}
                                    <div className="text-sm text-emerald-400 font-medium">{formatted.text}</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400">⭐ {achievement.stars}</span>
                            <span className="text-purple-400">💎 {achievement.diamonds}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <span className="text-green-400 font-medium">{achievement.unlockedCount || 0}</span>
                            <span className="text-slate-500"> người</span>
                            {achievement.unlockRate > 0 && (
                              <div className="text-slate-500 text-xs">{achievement.unlockRate}%</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openEditModal(achievement)}
                            className="px-3 py-1 text-blue-400 hover:bg-blue-500/20 rounded mr-2"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(achievement.id)}
                            className="px-3 py-1 text-red-400 hover:bg-red-500/20 rounded"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden p-3 space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-slate-400">Đang tải...</div>
            ) : filteredAchievements.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                {search ? 'Không tìm thấy thành tích phù hợp' : 'Chưa có thành tích nào'}
              </div>
            ) : (
              paginatedAchievements.map((achievement) => {
                const catConfig = getCategoryConfig(achievement.category);
                const formatted = formatRequirement(achievement.requirement);
                return (
                  <div key={achievement.id} className="bg-slate-700/50 rounded-xl p-3 border border-slate-600">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-3xl">{achievement.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium">{achievement.name}</div>
                        <div className="text-slate-400 text-xs line-clamp-2">{achievement.description}</div>
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                      <span className={`px-1.5 py-0.5 rounded ${catConfig.color}`}>
                        {catConfig.icon} {catConfig.label}
                      </span>
                      <span className="text-amber-400">⭐{achievement.stars}</span>
                      <span className="text-purple-400">💎{achievement.diamonds}</span>
                      <span className="text-green-400">{achievement.unlockedCount || 0} người</span>
                    </div>
                    
                    {/* Requirement */}
                    <div className="bg-slate-900/50 px-2 py-1.5 rounded mb-3 flex items-center gap-2">
                      <span>{formatted.icon}</span>
                      <span className="text-emerald-400 text-xs">{formatted.text}</span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-slate-600">
                      <button onClick={() => openEditModal(achievement)} className="flex-1 py-1.5 text-blue-400 hover:bg-blue-500/20 rounded text-sm">✏️ Sửa</button>
                      <button onClick={() => handleDelete(achievement.id)} className="flex-1 py-1.5 text-red-400 hover:bg-red-500/20 rounded text-sm">🗑️ Xóa</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {filteredAchievements.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-4 px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                <span className="hidden sm:inline">Hiển thị</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs sm:text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span><span className="hidden sm:inline">trong tổng số </span>{filteredAchievements.length}</span>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 sm:px-3 py-1 bg-slate-700 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm"
                >
                  ←
                </button>
                
                {/* Mobile: Show current/total */}
                <span className="sm:hidden px-3 py-1 text-white text-sm">{currentPage}/{totalPages}</span>
                
                {/* Desktop: Page numbers */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.ceil(filteredAchievements.length / itemsPerPage) }, (_, i) => i + 1)
                    .filter(page => {
                      const totalPages = Math.ceil(filteredAchievements.length / itemsPerPage);
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                      return false;
                    })
                    .map((page, idx, arr) => (
                      <span key={page} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-2 text-slate-500">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[32px] px-2 py-1 rounded ${
                            currentPage === page
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-700 text-white hover:bg-slate-600'
                          }`}
                        >
                          {page}
                        </button>
                      </span>
                    ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredAchievements.length / itemsPerPage), p + 1))}
                  disabled={currentPage >= Math.ceil(filteredAchievements.length / itemsPerPage)}
                  className="px-3 py-1 bg-slate-700 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-slate-700">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {editingAchievement ? 'Sửa thành tích' : 'Thêm thành tích mới'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Biểu tượng *</label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({...formData, icon})}
                        className={`text-xl sm:text-2xl p-1.5 sm:p-2 rounded-lg border ${
                          formData.icon === icon 
                            ? 'border-amber-500 bg-amber-500/20' 
                            : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Tên thành tích *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                    placeholder="VD: Nhà vô địch"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Mô tả *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                    rows={2}
                    placeholder="Mô tả cách đạt được thành tích này"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Danh mục *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs sm:text-sm font-medium text-slate-300">Điều kiện đạt thành tích *</label>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      {showAdvanced ? '← Đơn giản' : 'Nâng cao →'}
                    </button>
                  </div>
                  
                  {showAdvanced ? (
                    <div>
                      <textarea
                        value={formData.requirement}
                        onChange={(e) => setFormData({...formData, requirement: e.target.value})}
                        className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-xs sm:text-sm"
                        rows={4}
                        placeholder='{"type":"complete_lessons","target":10}'
                        required
                      />
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                        Các loại: complete_lessons, total_practice, win_compete, login_streak, reach_tier, earn_stars
                      </p>
                    </div>
                  ) : (
                    <RequirementBuilder
                      value={formData.requirement}
                      onChange={(req) => setFormData({...formData, requirement: req})}
                    />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Sao thưởng ⭐</label>
                    <input
                      type="number"
                      value={formData.stars}
                      onChange={(e) => setFormData({...formData, stars: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Kim cương 💎</label>
                    <input
                      type="number"
                      value={formData.diamonds}
                      onChange={(e) => setFormData({...formData, diamonds: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                      min={0}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white text-sm order-2 sm:order-1"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 sm:px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium text-sm order-1 sm:order-2"
                  >
                    {editingAchievement ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* Confirm Dialog */}
        {confirmDialog && (
          <AdminConfirmDialog
            isOpen={true}
            onClose={() => setConfirmDialog(null)}
            onConfirm={confirmDialog.onConfirm}
            title={confirmDialog.title}
            message={confirmDialog.message}
            confirmText={confirmDialog.confirmText}
            type={confirmDialog.type}
          />
        )}
      </div>
  );
}
