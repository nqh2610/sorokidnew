/**
 * ============================================================================
 * SOROKID GAME STORAGE - Module quản lý localStorage tối ưu cho game
 * ============================================================================
 * 
 * Key format: sorokid:{gameId}
 * 
 * Data structure:
 * {
 *   v: 1,           // version - để migrate khi schema thay đổi
 *   t: 1700000000,  // timestamp - lần lưu cuối
 *   s: { ... }      // settings - cấu hình game rút gọn
 * }
 * 
 * BEST PRACTICES:
 * - Chỉ lưu khi user bấm "Bắt đầu" hoặc thoát game
 * - Không lưu mỗi lần click/change
 * - Không lưu UI state, animation state, timer
 * - Chỉ lưu settings có ý nghĩa cho lần chơi sau
 */

// Current schema version - increment when schema changes
const CURRENT_VERSION = 1;

// Prefix cho tất cả game keys
const KEY_PREFIX = 'sorokid:';

// Cache để tránh đọc localStorage nhiều lần
const memoryCache = new Map();

// Tracking để tránh ghi trùng
let lastSaveHash = new Map();

/**
 * Tạo hash đơn giản từ object để so sánh
 */
function simpleHash(obj) {
  return JSON.stringify(obj);
}

/**
 * Check nếu localStorage có sẵn và hoạt động
 */
function isStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Lấy key đầy đủ cho game
 * @param {string} gameId - ID của game (vd: 'flash-zan', 'o-chu')
 */
function getStorageKey(gameId) {
  return `${KEY_PREFIX}${gameId}`;
}

/**
 * Migrate data từ version cũ sang mới
 * Override hàm này trong từng game nếu cần
 * 
 * @param {object} data - Data đã lưu
 * @param {number} fromVersion - Version cũ
 * @param {object} defaults - Giá trị mặc định mới
 * @returns {object} - Data đã migrate
 */
function migrateData(data, fromVersion, defaults) {
  // Nếu version cũ hơn, merge với defaults
  // Giữ lại các field có trong data cũ, thêm field mới từ defaults
  if (fromVersion < CURRENT_VERSION) {
    return {
      ...defaults,
      ...data.s,
    };
  }
  return data.s;
}

/**
 * LƯU SETTINGS CHO GAME
 * 
 * @param {string} gameId - ID của game
 * @param {object} settings - Object settings cần lưu
 * @param {object} options - Tùy chọn
 * @param {boolean} options.force - Bắt buộc ghi dù không đổi
 * @returns {boolean} - true nếu lưu thành công
 * 
 * EXAMPLE:
 * saveGameSettings('flash-zan', {
 *   op: 'add',    // operationType
 *   d: 1,         // digitCount
 *   f: 5,         // flashCount
 *   spd: 1.5,     // speed
 *   snd: 1        // soundEnabled
 * });
 */
export function saveGameSettings(gameId, settings, options = {}) {
  if (!isStorageAvailable()) {
    console.warn('[GameStorage] localStorage không khả dụng');
    return false;
  }

  if (!gameId || typeof gameId !== 'string') {
    console.error('[GameStorage] gameId không hợp lệ');
    return false;
  }

  if (!settings || typeof settings !== 'object') {
    console.error('[GameStorage] settings phải là object');
    return false;
  }

  try {
    const key = getStorageKey(gameId);
    
    // So sánh với lần lưu trước
    const currentHash = simpleHash(settings);
    const previousHash = lastSaveHash.get(gameId);
    
    if (!options.force && currentHash === previousHash) {
      // Không có gì thay đổi, skip
      return true;
    }

    const data = {
      v: CURRENT_VERSION,
      t: Math.floor(Date.now() / 1000), // Unix timestamp (seconds)
      s: settings,
    };

    const json = JSON.stringify(data);
    
    // Check quota trước khi ghi
    const estimatedSize = json.length * 2; // UTF-16
    
    localStorage.setItem(key, json);
    
    // Update cache và hash
    memoryCache.set(gameId, data);
    lastSaveHash.set(gameId, currentHash);
    
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      console.error('[GameStorage] localStorage đầy! Thử dọn dẹp...');
      // Có thể implement cleanup logic ở đây
      cleanupOldEntries();
      // Thử lại 1 lần
      try {
        const key = getStorageKey(gameId);
        const data = {
          v: CURRENT_VERSION,
          t: Math.floor(Date.now() / 1000),
          s: settings,
        };
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (e2) {
        console.error('[GameStorage] Không thể lưu sau khi dọn dẹp');
        return false;
      }
    }
    console.error('[GameStorage] Lỗi khi lưu:', e);
    return false;
  }
}

/**
 * ĐỌC SETTINGS CỦA GAME
 * 
 * @param {string} gameId - ID của game
 * @param {object} defaults - Giá trị mặc định nếu chưa có data
 * @returns {object} - Settings đã lưu hoặc defaults
 * 
 * EXAMPLE:
 * const settings = loadGameSettings('flash-zan', {
 *   op: 'add',
 *   d: 1,
 *   f: 5,
 *   spd: 1.5,
 *   snd: 1
 * });
 */
export function loadGameSettings(gameId, defaults = {}) {
  if (!isStorageAvailable()) {
    console.warn('[GameStorage] localStorage không khả dụng, dùng defaults');
    return { ...defaults };
  }

  if (!gameId || typeof gameId !== 'string') {
    console.error('[GameStorage] gameId không hợp lệ');
    return { ...defaults };
  }

  // Check cache trước
  if (memoryCache.has(gameId)) {
    const cached = memoryCache.get(gameId);
    return { ...defaults, ...cached.s };
  }

  try {
    const key = getStorageKey(gameId);
    const raw = localStorage.getItem(key);

    if (!raw) {
      return { ...defaults };
    }

    const data = JSON.parse(raw);

    // Validate structure
    if (!data || typeof data !== 'object' || !data.s) {
      console.warn('[GameStorage] Data không hợp lệ, dùng defaults');
      return { ...defaults };
    }

    // Check version và migrate nếu cần
    const savedVersion = data.v || 1;
    let settings;
    
    if (savedVersion < CURRENT_VERSION) {
      settings = migrateData(data, savedVersion, defaults);
      // Lưu lại với version mới
      saveGameSettings(gameId, settings, { force: true });
    } else {
      settings = data.s;
    }

    // Merge với defaults để đảm bảo có đủ fields
    const result = { ...defaults, ...settings };
    
    // Update cache
    memoryCache.set(gameId, { ...data, s: result });
    lastSaveHash.set(gameId, simpleHash(result));
    
    return result;
  } catch (e) {
    console.error('[GameStorage] Lỗi khi đọc, dùng defaults:', e);
    // Clear corrupted data
    try {
      localStorage.removeItem(getStorageKey(gameId));
    } catch (_) {}
    return { ...defaults };
  }
}

/**
 * XÓA SETTINGS CỦA GAME
 * 
 * @param {string} gameId - ID của game
 * @returns {boolean} - true nếu xóa thành công
 */
export function resetGameSettings(gameId) {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    const key = getStorageKey(gameId);
    localStorage.removeItem(key);
    memoryCache.delete(gameId);
    lastSaveHash.delete(gameId);
    return true;
  } catch (e) {
    console.error('[GameStorage] Lỗi khi xóa:', e);
    return false;
  }
}

/**
 * Dọn dẹp các entry cũ khi storage gần đầy
 * Xóa các entry của sorokid có timestamp cũ nhất
 */
function cleanupOldEntries() {
  try {
    const entries = [];
    
    // Collect all sorokid entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(KEY_PREFIX)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data && data.t) {
            entries.push({ key, timestamp: data.t });
          }
        } catch (_) {
          // Invalid data, remove it
          localStorage.removeItem(key);
        }
      }
    }
    
    // Sort by timestamp, oldest first
    entries.sort((a, b) => a.timestamp - b.timestamp);
    
    // Remove oldest 20%
    const toRemove = Math.max(1, Math.floor(entries.length * 0.2));
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(entries[i].key);
      // Also clear from cache
      const gameId = entries[i].key.replace(KEY_PREFIX, '');
      memoryCache.delete(gameId);
      lastSaveHash.delete(gameId);
    }
    
    console.log(`[GameStorage] Đã dọn dẹp ${toRemove} entries cũ`);
  } catch (e) {
    console.error('[GameStorage] Lỗi khi dọn dẹp:', e);
  }
}

/**
 * LẤY TỔNG DUNG LƯỢNG SOROKID ĐANG DÙNG
 * 
 * @returns {object} - { count, sizeBytes, sizeKB }
 */
export function getStorageStats() {
  if (!isStorageAvailable()) {
    return { count: 0, sizeBytes: 0, sizeKB: 0 };
  }
  
  let count = 0;
  let sizeBytes = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(KEY_PREFIX)) {
      count++;
      const value = localStorage.getItem(key);
      if (value) {
        sizeBytes += (key.length + value.length) * 2; // UTF-16
      }
    }
  }
  
  return {
    count,
    sizeBytes,
    sizeKB: (sizeBytes / 1024).toFixed(2),
  };
}

/**
 * CLEAR CACHE - Gọi khi cần force reload từ localStorage
 */
export function clearCache() {
  memoryCache.clear();
  lastSaveHash.clear();
}

/**
 * HOOK HELPER: Debounce save
 * Dùng khi cần lưu sau một khoảng delay (ví dụ: user thoát trang)
 */
let saveTimeout = null;

export function debouncedSave(gameId, settings, delayMs = 1000) {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(() => {
    saveGameSettings(gameId, settings);
    saveTimeout = null;
  }, delayMs);
}

/**
 * Cancel pending debounced save
 */
export function cancelDebouncedSave() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
}

// ============================================================================
// REACT HOOK - Custom hook để dùng trong React components
// ============================================================================

/**
 * useGameSettings - React hook để quản lý game settings
 * 
 * @param {string} gameId - ID của game
 * @param {object} defaultSettings - Giá trị mặc định
 * @returns {[object, function, function]} - [settings, updateSettings, resetSettings]
 * 
 * EXAMPLE:
 * const [settings, setSettings, resetSettings] = useGameSettings('flash-zan', {
 *   op: 'add',
 *   d: 1,
 *   f: 5,
 *   spd: 1.5,
 *   snd: 1
 * });
 * 
 * // Update settings (auto-save khi component unmount hoặc gọi save)
 * setSettings({ ...settings, d: 2 });
 * 
 * // Force save ngay
 * setSettings({ ...settings, d: 2 }, { immediate: true });
 * 
 * // Reset về defaults
 * resetSettings();
 */
// Note: This hook should be used in React components
// Import: import { useGameSettings } from '@/lib/gameStorage';

// Export constants for reference
export const STORAGE_VERSION = CURRENT_VERSION;
export const STORAGE_PREFIX = KEY_PREFIX;

// ============================================================================
// GAME ID CONSTANTS - Sử dụng để đồng nhất game IDs
// ============================================================================
export const GAME_IDS = {
  // === TOOLBOX GAMES ===
  AI_LA_TRIEU_PHU: 'altp',
  BAN_TINH_SOROBAN: 'soroban',
  BOC_THAM: 'boc-tham',
  CHIA_NHOM: 'chia-nhom',
  CHIEC_NON_KY_DIEU: 'vong-quay',
  CUOC_DUA_KI_THU: 'cuoc-dua',
  DEN_MAY_MAN: 'den-may-man',
  DONG_HO_BAM_GIO: 'timer',
  DUA_THU_HOAT_HINH: 'dua-thu',
  FLASH_ZAN: 'flash-zan',
  O_CHU: 'o-chu',
  XUC_XAC: 'xuc-xac',
  
  // === MAIN PAGES ===
  LEARN: 'learn',
  PRACTICE: 'practice',
  COMPETE: 'compete',
  ADVENTURE: 'adventure',
};

// ============================================================================
// MIGRATION HELPERS - Dùng để migrate từ schema cũ
// ============================================================================

/**
 * Migrate từ nhiều keys cũ sang 1 key mới
 * Dùng 1 lần khi deploy version mới
 * 
 * @param {string} gameId - ID game mới
 * @param {string[]} oldKeys - Các keys cũ cần migrate
 * @param {function} transformer - Hàm transform data cũ sang format mới
 */
export function migrateFromOldKeys(gameId, oldKeys, transformer) {
  if (!isStorageAvailable()) return false;
  
  try {
    // Check if already migrated
    const newKey = getStorageKey(gameId);
    if (localStorage.getItem(newKey)) {
      // Đã có data mới, chỉ xóa keys cũ
      oldKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (_) {}
      });
      return true;
    }
    
    // Collect old data
    const oldData = {};
    oldKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          oldData[key] = value;
        }
      } catch (_) {}
    });
    
    // Transform to new format
    if (Object.keys(oldData).length > 0) {
      const newSettings = transformer(oldData);
      if (newSettings) {
        saveGameSettings(gameId, newSettings);
      }
    }
    
    // Remove old keys
    oldKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (_) {}
    });
    
    return true;
  } catch (e) {
    console.error('[GameStorage] Migration error:', e);
    return false;
  }
}
