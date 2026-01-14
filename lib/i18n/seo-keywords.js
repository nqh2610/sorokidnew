/**
 * 🎯 SEO KEYWORDS MAPPING - VIETNAMESE ↔ ENGLISH
 * 
 * Mapping từ khóa SEO song ngữ:
 * - Không dịch word-by-word
 * - Dịch theo intent và search behavior
 * - Tối ưu cho cả Google VN và Google Global
 * 
 * NGUYÊN TẮC:
 * - Keyword tiếng Việt: intent người Việt tìm kiếm
 * - Keyword tiếng Anh: intent người nước ngoài tìm kiếm
 * - Không spam, không duplicate
 * 
 * @version 1.0.0
 */

// ============================================================
// A. BRAND KEYWORDS - Thương hiệu
// ============================================================
export const BRAND_KEYWORDS = {
  vi: ['sorokid', 'soro kid', 'app sorokid', 'ứng dụng sorokid'],
  en: ['sorokid', 'soro kid', 'sorokid app', 'sorokid learning app'],
};

// ============================================================
// B. PRIMARY KEYWORDS - Từ khóa chính
// ============================================================
export const PRIMARY_KEYWORDS = {
  // Ứng dụng học Soroban
  sorobanApp: {
    vi: [
      'ứng dụng học soroban',
      'app học soroban',
      'phần mềm học soroban',
      'ứng dụng học soroban cho bé',
      'app học soroban cho trẻ em',
    ],
    en: [
      'soroban learning app',
      'best soroban app',
      'soroban app for kids',
      'japanese abacus app',
      'learn soroban app',
    ],
  },
  
  // Toán tư duy
  mentalMath: {
    vi: [
      'toán tư duy',
      'toán tư duy cho bé',
      'học toán tư duy',
      'rèn tư duy toán học',
      'phát triển tư duy logic',
    ],
    en: [
      'mental math',
      'mental math for kids',
      'mental arithmetic',
      'cognitive math training',
      'brain math development',
    ],
  },
  
  // Tính nhẩm
  mentalCalculation: {
    vi: [
      'tính nhẩm',
      'tính nhẩm nhanh',
      'luyện tính nhẩm',
      'rèn tính nhẩm cho bé',
      'app tính nhẩm',
    ],
    en: [
      'mental calculation',
      'fast mental math',
      'mental calculation training',
      'quick math skills',
      'mental arithmetic app',
    ],
  },
  
  // Soroban online
  sorobanOnline: {
    vi: [
      'học soroban online',
      'soroban trực tuyến',
      'học soroban tại nhà',
      'soroban online miễn phí',
    ],
    en: [
      'learn soroban online',
      'online soroban course',
      'soroban training online',
      'virtual soroban learning',
    ],
  },
};

// ============================================================
// C. LONG-TAIL KEYWORDS - Từ khóa dài
// ============================================================
export const LONGTAIL_KEYWORDS = {
  // Theo độ tuổi
  byAge: {
    vi: [
      'ứng dụng học soroban cho bé 5 tuổi',
      'ứng dụng học soroban cho bé 6 tuổi',
      'app học toán cho trẻ tiểu học',
      'soroban cho học sinh lớp 1',
      'học toán tư duy cho trẻ 6-12 tuổi',
    ],
    en: [
      'soroban app for 5 year old',
      'soroban app for 6 year old',
      'math app for elementary students',
      'soroban for first graders',
      'mental math for kids 6-12',
    ],
  },
  
  // Theo nhu cầu phụ huynh
  forParents: {
    vi: [
      'phụ huynh kèm con học soroban',
      'phụ huynh không biết soroban',
      'dạy con học toán tại nhà',
      'làm sao kèm con học soroban',
      'cách dạy con tính nhẩm',
    ],
    en: [
      'teach kids soroban at home',
      'parents guide to soroban',
      'homeschool soroban learning',
      'help child learn mental math',
      'soroban for homeschool parents',
    ],
  },
  
  // Câu hỏi
  questions: {
    vi: [
      'soroban là gì',
      'học soroban có tốt không',
      'trẻ mấy tuổi học soroban được',
      'học soroban bao lâu thì giỏi',
      'có nên cho con học soroban',
    ],
    en: [
      'what is soroban',
      'is soroban good for kids',
      'best age to learn soroban',
      'how long to learn soroban',
      'should kids learn soroban',
    ],
  },
};

// ============================================================
// D. TOOLBOX KEYWORDS - Từ khóa Toolbox
// ============================================================
export const TOOLBOX_KEYWORDS = {
  // Toolbox chung
  general: {
    vi: [
      'toolbox giáo viên',
      'công cụ dạy học',
      'trò chơi lớp học',
      'game giáo dục',
      'công cụ dạy học tích cực',
    ],
    en: [
      'teacher toolbox',
      'classroom tools',
      'classroom games',
      'educational games',
      'active learning tools',
    ],
  },
  
  // Các tool cụ thể
  tools: {
    spinWheel: {
      vi: ['chiếc nón kỳ diệu', 'quay số gọi tên', 'vòng quay may mắn'],
      en: ['spin wheel', 'random name picker', 'wheel of names'],
    },
    millionaire: {
      vi: ['ai là triệu phú', 'game show lớp học', 'trò chơi kiến thức'],
      en: ['millionaire quiz', 'quiz show game', 'trivia game'],
    },
    crossword: {
      vi: ['ô chữ', 'trò chơi ô chữ', 'crossword tiếng việt'],
      en: ['crossword', 'crossword puzzle', 'word game'],
    },
    animalRace: {
      vi: ['đua thú hoạt hình', 'đua xe động vật', 'game đua thú'],
      en: ['animal race', 'race game', 'team race game'],
    },
    timer: {
      vi: ['đồng hồ bấm giờ', 'hẹn giờ lớp học', 'timer giáo viên'],
      en: ['classroom timer', 'teaching timer', 'countdown timer'],
    },
    groupMaker: {
      vi: ['chia nhóm', 'chia nhóm học sinh', 'random chia nhóm'],
      en: ['group maker', 'team divider', 'random group generator'],
    },
    dice: {
      vi: ['xúc xắc', 'xúc xắc 3D', 'gieo xúc xắc online'],
      en: ['dice roller', '3d dice', 'virtual dice'],
    },
    flashAnzan: {
      vi: ['flash anzan', 'luyện tính nhẩm', 'flash zan'],
      en: ['flash anzan', 'mental math trainer', 'anzan practice'],
    },
  },
};

// ============================================================
// E. COMPETITIVE KEYWORDS - Từ khóa so sánh
// ============================================================
export const COMPETITIVE_KEYWORDS = {
  vi: [
    'ứng dụng học soroban tốt nhất',
    'app soroban tốt nhất việt nam',
    'so sánh app học soroban',
    'sorokid có tốt không',
    'review sorokid',
  ],
  en: [
    'best soroban app',
    'top soroban learning app',
    'soroban app comparison',
    'sorokid review',
    'best mental math app for kids',
  ],
};

// ============================================================
// F. HELPER FUNCTIONS
// ============================================================

/**
 * Lấy keywords theo ngôn ngữ
 * @param {string} locale - 'vi' hoặc 'en'
 * @param {string} category - tên category
 * @returns {string[]} - mảng keywords
 */
export function getKeywordsByLocale(locale, category) {
  const categoryMap = {
    brand: BRAND_KEYWORDS,
    competitive: COMPETITIVE_KEYWORDS,
    toolbox: TOOLBOX_KEYWORDS.general,
    ...PRIMARY_KEYWORDS,
    ...LONGTAIL_KEYWORDS,
  };
  
  const keywords = categoryMap[category];
  if (!keywords) return [];
  
  return keywords[locale] || keywords.vi || [];
}

/**
 * Lấy tất cả keywords cho một ngôn ngữ
 * @param {string} locale - 'vi' hoặc 'en'
 * @returns {string[]} - mảng tất cả keywords
 */
export function getAllKeywords(locale) {
  const allKeywords = [
    ...BRAND_KEYWORDS[locale],
    ...Object.values(PRIMARY_KEYWORDS).flatMap(k => k[locale] || []),
    ...Object.values(LONGTAIL_KEYWORDS).flatMap(k => k[locale] || []),
    ...TOOLBOX_KEYWORDS.general[locale],
    ...COMPETITIVE_KEYWORDS[locale],
  ];
  
  // Loại bỏ duplicate
  return [...new Set(allKeywords)];
}

/**
 * Mapping keyword từ VI sang EN và ngược lại
 * Dùng cho internal linking và hreflang
 */
export const KEYWORD_MAPPING = {
  // Soroban app
  'ứng dụng học soroban': 'soroban learning app',
  'app học soroban': 'best soroban app',
  'app học soroban cho bé': 'soroban app for kids',
  'ứng dụng học soroban cho trẻ em': 'soroban app for children',
  'phần mềm học soroban': 'soroban learning software',
  
  // Mental math
  'toán tư duy': 'mental math',
  'toán tư duy cho bé': 'mental math for kids',
  'học toán tư duy': 'learn mental math',
  'phát triển tư duy': 'cognitive development',
  
  // Tính nhẩm
  'tính nhẩm': 'mental calculation',
  'tính nhẩm nhanh': 'fast mental math',
  'luyện tính nhẩm': 'mental math training',
  'rèn tính nhẩm': 'mental calculation practice',
  
  // Soroban general
  'soroban': 'soroban',
  'bàn tính soroban': 'japanese abacus',
  'học soroban': 'learn soroban',
  'học soroban online': 'learn soroban online',
  'học soroban tại nhà': 'learn soroban at home',
  
  // Parents
  'phụ huynh kèm con học': 'parents teach kids',
  'phụ huynh không cần biết soroban': 'parents don\'t need to know soroban',
  'dạy con học toán': 'teach kids math',
  
  // Toolbox
  'toolbox giáo viên': 'teacher toolbox',
  'công cụ dạy học': 'teaching tools',
  'trò chơi lớp học': 'classroom games',
  'game giáo dục': 'educational games',
  
  // Tools
  'chiếc nón kỳ diệu': 'spin wheel',
  'ai là triệu phú': 'millionaire quiz',
  'ô chữ': 'crossword',
  'đua thú hoạt hình': 'animal race',
  'đồng hồ bấm giờ': 'classroom timer',
  'chia nhóm': 'group maker',
  'xúc xắc': 'dice roller',
  'bốc thăm': 'random picker',
  
  // Questions
  'soroban là gì': 'what is soroban',
  'học soroban có tốt không': 'is soroban good for kids',
  'trẻ mấy tuổi học soroban': 'best age to learn soroban',
};

// Tạo reverse mapping (EN -> VI)
export const REVERSE_KEYWORD_MAPPING = Object.fromEntries(
  Object.entries(KEYWORD_MAPPING).map(([vi, en]) => [en, vi])
);

/**
 * Dịch keyword sang ngôn ngữ khác
 * @param {string} keyword - từ khóa cần dịch
 * @param {string} targetLocale - ngôn ngữ đích ('vi' hoặc 'en')
 * @returns {string} - từ khóa đã dịch
 */
export function translateKeyword(keyword, targetLocale) {
  const lowerKeyword = keyword.toLowerCase();
  
  if (targetLocale === 'en') {
    return KEYWORD_MAPPING[lowerKeyword] || keyword;
  } else {
    return REVERSE_KEYWORD_MAPPING[lowerKeyword] || keyword;
  }
}
