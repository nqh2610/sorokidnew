/**
 * 🧮 SOROBAN PROBLEM GENERATOR
 * 
 * Sinh bài tập DỰA TRÊN KỸ NĂNG ĐÃ HỌC, không chỉ độ khó số chữ số.
 * 
 * NGUYÊN TẮC SOROBAN:
 * - Mỗi cột có 4 hạt Đất (giá trị 1) và 1 hạt Trời (giá trị 5)
 * - Bạn Nhỏ: Các cặp số cộng lại = 5 (1+4, 2+3)
 * - Bạn Lớn: Các cặp số cộng lại = 10 (1+9, 2+8, 3+7, 4+6, 5+5)
 * 
 * SKILL LEVELS:
 * 1. basic-add: Cộng đủ hạt (1+1, 2+1, 5+1, 5+2...)
 * 2. friend5-add: Cộng dùng Bạn Nhỏ (4+1, 4+2, 3+3...)
 * 3. friend10-add: Cộng dùng Bạn Lớn (7+5, 8+6...)
 * 4. basic-sub: Trừ đủ hạt 
 * 5. friend5-sub: Trừ dùng Bạn Nhỏ
 * 6. friend10-sub: Trừ dùng Bạn Lớn
 * 7. all: Tất cả kỹ năng
 */

// ============================================================
// 🔍 PHÂN LOẠI PHÉP TÍNH THEO KỸ THUẬT SOROBAN
// ============================================================

/**
 * Kiểm tra phép cộng a + b có cần kỹ thuật gì
 * @returns 'basic' | 'friend5' | 'friend10'
 */
export function classifyAddition(a, b) {
  // Xét từng chữ số (cột) riêng biệt
  const aStr = String(a).padStart(2, '0');
  const bStr = String(b).padStart(2, '0');
  
  let needsFriend5 = false;
  let needsFriend10 = false;
  
  // Duyệt từ phải sang trái (hàng đơn vị trước)
  let carry = 0;
  for (let i = aStr.length - 1; i >= 0; i--) {
    const digitA = parseInt(aStr[i]) + carry;
    const digitB = parseInt(bStr[i] || '0');
    const sum = digitA + digitB;
    
    carry = sum >= 10 ? 1 : 0;
    const resultDigit = sum % 10;
    
    // Phân tích kỹ thuật cho cột này
    const technique = classifySingleDigitAdd(digitA % 10, digitB);
    if (technique === 'friend10') needsFriend10 = true;
    else if (technique === 'friend5') needsFriend5 = true;
  }
  
  if (needsFriend10) return 'friend10';
  if (needsFriend5) return 'friend5';
  return 'basic';
}

/**
 * Phân loại cộng 1 chữ số (trong 1 cột)
 */
function classifySingleDigitAdd(a, b) {
  // a là số hiện tại trên cột, b là số cần cộng thêm
  const aHeaven = a >= 5; // Có hạt Trời không
  const aEarth = a % 5;   // Số hạt Đất đang gạt lên
  
  const sum = a + b;
  
  // Nếu kết quả >= 10 → cần Bạn Lớn (nhớ sang cột tiếp)
  if (sum >= 10) return 'friend10';
  
  // Nếu cần dùng hạt Trời và không đủ hạt Đất để bù
  // VD: 4 + 3 = 7 → cần gạt Trời xuống, bớt hạt Đất = Bạn Nhỏ
  // Điều kiện: a < 5 và a + b >= 5 và a + b < 10
  if (!aHeaven && sum >= 5) {
    // Cần thêm b, nhưng chỉ có 4-a hạt Đất trống
    // Nếu b > (4 - aEarth) → cần Bạn Nhỏ
    if (b > (4 - aEarth)) return 'friend5';
  }
  
  // Nếu đã có hạt Trời và cộng thêm nhưng không đủ chỗ
  // VD: 6 + 2 = 8 → ok (đủ hạt Đất)
  // VD: 7 + 4 = 11 → friend10
  if (aHeaven) {
    // Số hạt Đất cần thêm = b
    // Số hạt Đất còn trống = 4 - aEarth
    if (b > (4 - aEarth)) {
      if (sum >= 10) return 'friend10';
      // Trường hợp đặc biệt: 5 + 3 = 8 → cần gạt thêm 3 hạt Đất, ok
      // 6 + 4 = 10 → friend10
    }
  }
  
  return 'basic';
}

/**
 * Kiểm tra phép trừ a - b cần kỹ thuật gì
 */
export function classifySubtraction(a, b) {
  if (a < b) return null; // Không hợp lệ
  
  let needsFriend5 = false;
  let needsFriend10 = false;
  
  const aStr = String(a).padStart(2, '0');
  const bStr = String(b).padStart(2, '0');
  
  let borrow = 0;
  for (let i = aStr.length - 1; i >= 0; i--) {
    const digitA = parseInt(aStr[i]) - borrow;
    const digitB = parseInt(bStr[i] || '0');
    
    if (digitA < digitB) {
      // Cần mượn từ cột trước
      needsFriend10 = true;
      borrow = 1;
    } else {
      borrow = 0;
      // Kiểm tra có cần Bạn Nhỏ không
      const technique = classifySingleDigitSub(digitA, digitB);
      if (technique === 'friend5') needsFriend5 = true;
    }
  }
  
  if (needsFriend10) return 'friend10';
  if (needsFriend5) return 'friend5';
  return 'basic';
}

/**
 * Phân loại trừ 1 chữ số
 */
function classifySingleDigitSub(a, b) {
  // a là số hiện tại, b là số cần trừ
  const aHeaven = a >= 5;
  const aEarth = a % 5;
  
  if (a < b) return 'friend10'; // Cần mượn
  
  // Nếu có hạt Trời và cần trừ nhiều hơn số hạt Đất
  // VD: 7 - 3 = 4 → gạt Trời lên, thêm hạt Đất = Bạn Nhỏ
  if (aHeaven && b > aEarth) {
    return 'friend5';
  }
  
  return 'basic';
}

// ============================================================
// 🎲 SINH BÀI TẬP THEO SKILL LEVEL
// ============================================================

/**
 * Sinh phép cộng theo skill level
 * @param {string} skillLevel - 'basic-add' | 'friend5-add' | 'friend10-add' | 'all-add'
 * @param {number} digits - Số chữ số (1, 2, 3...)
 */
export function generateAdditionProblem(skillLevel, digits = 1) {
  const maxNum = Math.pow(10, digits) - 1;
  const minNum = digits === 1 ? 1 : Math.pow(10, digits - 1);
  
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    let a, b;
    
    if (skillLevel === 'basic-add') {
      // Cộng đủ hạt - kết quả không quá 9 mỗi cột, không cần kỹ thuật
      // VD: 1+2, 2+1, 5+1, 5+2, 5+3, 1+3
      a = randRange(minNum, maxNum);
      b = randRange(1, Math.min(4, maxNum)); // Số nhỏ để không cần kỹ thuật
      
      if (classifyAddition(a, b) === 'basic') {
        return { a, b, answer: a + b, display: `${a} + ${b}`, technique: 'basic' };
      }
    }
    else if (skillLevel === 'friend5-add') {
      // Cộng cần Bạn Nhỏ - tổng cột >= 5 nhưng < 10
      // VD: 3+3=6, 4+2=6, 4+3=7, 2+4=6
      if (digits === 1) {
        a = randRange(1, 4);
        b = randRange(5 - a + 1, 9 - a); // Tổng từ 5-9
      } else {
        a = randRange(minNum, maxNum);
        b = randRange(1, maxNum);
      }
      
      if (classifyAddition(a, b) === 'friend5') {
        return { a, b, answer: a + b, display: `${a} + ${b}`, technique: 'friend5' };
      }
    }
    else if (skillLevel === 'friend10-add') {
      // Cộng cần Bạn Lớn - tổng cột >= 10
      // VD: 7+5=12, 8+6=14, 9+3=12
      if (digits === 1) {
        a = randRange(5, 9);
        b = randRange(10 - a + 1, 9); // Tổng >= 10
      } else {
        a = randRange(minNum, maxNum);
        b = randRange(Math.max(1, 10 - (a % 10)), maxNum);
      }
      
      if (classifyAddition(a, b) === 'friend10') {
        return { a, b, answer: a + b, display: `${a} + ${b}`, technique: 'friend10' };
      }
    }
    else if (skillLevel === 'all-add' || skillLevel === 'mixed-add') {
      // Mix tất cả kỹ thuật
      a = randRange(minNum, maxNum);
      b = randRange(1, maxNum);
      const technique = classifyAddition(a, b);
      return { a, b, answer: a + b, display: `${a} + ${b}`, technique };
    }
  }
  
  // Fallback
  return { a: 1, b: 1, answer: 2, display: '1 + 1', technique: 'basic' };
}

/**
 * Sinh phép trừ theo skill level
 */
export function generateSubtractionProblem(skillLevel, digits = 1) {
  const maxNum = Math.pow(10, digits) - 1;
  const minNum = digits === 1 ? 1 : Math.pow(10, digits - 1);
  
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    let a, b;
    
    if (skillLevel === 'basic-sub') {
      // Trừ đủ hạt
      a = randRange(minNum + 1, maxNum);
      b = randRange(1, Math.min(a - 1, 4));
      
      if (classifySubtraction(a, b) === 'basic') {
        return { a, b, answer: a - b, display: `${a} - ${b}`, technique: 'basic' };
      }
    }
    else if (skillLevel === 'friend5-sub') {
      // Trừ cần Bạn Nhỏ
      if (digits === 1) {
        a = randRange(5, 9);
        b = randRange(a % 5 + 1, a - 1);
      } else {
        a = randRange(minNum, maxNum);
        b = randRange(1, a - 1);
      }
      
      if (classifySubtraction(a, b) === 'friend5') {
        return { a, b, answer: a - b, display: `${a} - ${b}`, technique: 'friend5' };
      }
    }
    else if (skillLevel === 'friend10-sub') {
      // Trừ cần Bạn Lớn (mượn)
      if (digits === 1) {
        // 1 chữ số không có mượn, skip
        continue;
      }
      a = randRange(minNum + 10, maxNum);
      b = randRange(a % 10 + 1, Math.min(a - minNum, maxNum));
      
      if (classifySubtraction(a, b) === 'friend10') {
        return { a, b, answer: a - b, display: `${a} - ${b}`, technique: 'friend10' };
      }
    }
    else if (skillLevel === 'all-sub' || skillLevel === 'mixed-sub') {
      a = randRange(minNum + 1, maxNum);
      b = randRange(1, a - 1);
      const technique = classifySubtraction(a, b);
      if (technique) {
        return { a, b, answer: a - b, display: `${a} - ${b}`, technique };
      }
    }
  }
  
  // Fallback
  return { a: 5, b: 2, answer: 3, display: '5 - 2', technique: 'basic' };
}

/**
 * Sinh bài tập cộng trừ mix
 */
export function generateMixedProblem(allowedSkills, digits = 1) {
  const skills = Array.isArray(allowedSkills) ? allowedSkills : [allowedSkills];
  const skill = skills[Math.floor(Math.random() * skills.length)];
  
  if (skill.includes('add')) {
    return { ...generateAdditionProblem(skill, digits), operation: 'addition' };
  } else {
    return { ...generateSubtractionProblem(skill, digits), operation: 'subtraction' };
  }
}

/**
 * Sinh số để tạo trên Soroban (mode create-number)
 * @param {number} digits - Số chữ số (1, 2, 3...)
 */
export function generateCreateNumberProblem(digits = 1) {
  const maxNum = Math.pow(10, digits) - 1;
  const minNum = digits === 1 ? 1 : Math.pow(10, digits - 1);
  
  const target = randRange(minNum, maxNum);
  
  return {
    target,
    answer: target,
    display: `Tạo số ${target}`,
    technique: 'create-number',
    type: 'create'
  };
}

// ============================================================
// 🎯 CONFIG CHO TỪNG ZONE/STAGE
// ============================================================

/**
 * Skill config cho từng zone trong adventure
 * Định nghĩa kỹ năng được phép sinh bài
 */
export const ZONE_SKILL_CONFIG = {
  // Zone 1: Làng - CHỈ học biểu diễn số, KHÔNG có boss practice
  // Nếu có practice thì chỉ là TẠO SỐ (create number), không phải phép tính
  'village': {
    allowedSkills: [], // Không có phép tính
    practiceType: 'create-number', // Chỉ tạo số
    digits: 1
  },
  
  // Zone 2: Rừng - Cộng cơ bản + Bạn Nhỏ Cộng
  'forest': {
    allowedSkills: ['basic-add', 'friend5-add'],
    practiceType: 'calculation',
    digits: 1
  },
  
  // Zone 3: Thung Lũng - Trừ cơ bản + Bạn Nhỏ Trừ + Mix cộng trừ Bạn Nhỏ
  'valley': {
    allowedSkills: ['basic-add', 'friend5-add', 'basic-sub', 'friend5-sub'],
    practiceType: 'calculation',
    digits: 1
  },
  
  // Zone 4: Núi - Bạn Lớn Cộng
  'mountain': {
    allowedSkills: ['basic-add', 'friend5-add', 'friend10-add'],
    practiceType: 'calculation',
    digits: 1
  },
  
  // Zone 5: Hang Động - Bạn Lớn Trừ
  'cave': {
    allowedSkills: ['basic-add', 'friend5-add', 'friend10-add', 'basic-sub', 'friend5-sub', 'friend10-sub'],
    practiceType: 'calculation',
    digits: 1
  },
  
  // Zone 6+: 2 chữ số, tất cả kỹ năng
  'castle': {
    allowedSkills: ['all-add', 'all-sub'],
    practiceType: 'calculation',
    digits: 2
  }
};

/**
 * Lấy config cho một stage cụ thể
 */
export function getStageSkillConfig(stageId, zoneId) {
  return ZONE_SKILL_CONFIG[zoneId] || ZONE_SKILL_CONFIG['forest'];
}

// Helper
function randRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const sorobanProblemGenerator = {
  classifyAddition,
  classifySubtraction,
  generateAdditionProblem,
  generateSubtractionProblem,
  generateMixedProblem,
  generateCreateNumberProblem,
  ZONE_SKILL_CONFIG,
  getStageSkillConfig
};

export default sorobanProblemGenerator;
