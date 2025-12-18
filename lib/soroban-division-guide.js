/**
 * LOGIC SINH BƯỚC HƯỚNG DẪN CHO PHÉP CHIA TRÊN SOROBAN
 * Theo phương pháp Soroban chuẩn
 *
 * NGUYÊN TẮC CHIA TRÊN SOROBAN:
 * 1. Đặt số bị chia lên Soroban
 * 2. Ước lượng thương số (số chia được bao nhiêu lần)
 * 3. Nhân thương số với số chia, trừ đi khỏi số bị chia
 * 4. Lặp lại cho phần còn lại (nếu có)
 *
 * Ví dụ: 84 ÷ 12
 *    - Bước 1: Đặt 84 lên Soroban
 *    - Bước 2: 84 ÷ 12 → thử 7 (vì 12 × 7 = 84)
 *    - Bước 3: Kiểm tra: 12 × 7 = 84 ✓
 *    - Bước 4: Xóa 84, đặt thương số 7
 */

// Helper: Lấy tên cột từ vị trí
function getColumnName(column) {
  const names = {
    5: 'Vạn',
    6: 'Ngàn',
    7: 'Trăm',
    8: 'Chục',
    9: 'Đơn vị'
  };
  return names[column] || 'Cột ' + column;
}

// Helper: Lấy emoji số
function getStepEmoji(num) {
  const emojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
  return emojis[num] || `${num}`;
}

// Helper: Hướng dẫn đặt số lên Soroban
function getSetNumberInstruction(number) {
  const digits = number.toString().split('').map(Number);
  const instructions = [];

  digits.forEach((digit, index) => {
    const columnIndex = 10 - digits.length + index;
    const columnName = getColumnName(columnIndex);

    if (digit === 0) return;

    if (digit <= 4) {
      instructions.push(`⬆️ ${columnName}: Gạt ${digit} hạt đất LÊN`);
    } else if (digit === 5) {
      instructions.push(`⬇️ ${columnName}: Gạt hạt trời XUỐNG`);
    } else {
      const earth = digit - 5;
      instructions.push(`⬇️ ${columnName}: Gạt hạt trời XUỐNG\n⬆️ ${columnName}: Gạt ${earth} hạt đất LÊN`);
    }
  });

  return instructions.join('\n');
}

// Helper: Hướng dẫn xóa số và đặt số mới
function getClearAndSetInstruction(oldNumber, newNumber) {
  const instructions = [];

  // Hướng dẫn xóa
  instructions.push(`🧹 Xóa số ${oldNumber}:`);
  const oldDigits = oldNumber.toString().split('').map(Number);
  oldDigits.forEach((digit, index) => {
    const columnIndex = 10 - oldDigits.length + index;
    const columnName = getColumnName(columnIndex);

    if (digit === 0) return;

    if (digit <= 4) {
      instructions.push(`⬇️ ${columnName}: Gạt ${digit} hạt đất XUỐNG`);
    } else if (digit === 5) {
      instructions.push(`⬆️ ${columnName}: Gạt hạt trời LÊN`);
    } else {
      const earth = digit - 5;
      instructions.push(`⬆️ ${columnName}: Gạt hạt trời LÊN\n⬇️ ${columnName}: Gạt ${earth} hạt đất XUỐNG`);
    }
  });

  // Hướng dẫn đặt số mới
  if (newNumber > 0) {
    instructions.push(`\n✨ Đặt kết quả ${newNumber}:`);
    instructions.push(getSetNumberInstruction(newNumber));
  }

  return instructions.join('\n');
}

// Helper: Hướng dẫn trừ một chữ số khỏi một cột
function getSubtractDigitInstruction(digit, columnIndex) {
  const columnName = getColumnName(columnIndex);
  const instructions = [];

  if (digit === 0) return '';

  if (digit <= 4) {
    instructions.push(`⬇️ ${columnName}: Gạt ${digit} hạt đất XUỐNG`);
  } else if (digit === 5) {
    instructions.push(`⬆️ ${columnName}: Gạt hạt trời LÊN`);
  } else {
    const earth = digit - 5;
    instructions.push(`⬆️ ${columnName}: Gạt hạt trời LÊN`);
    instructions.push(`⬇️ ${columnName}: Gạt ${earth} hạt đất XUỐNG`);
  }

  return instructions.join('\n');
}

// Helper: Hướng dẫn trừ một số từ Soroban (hiển thị từng cột)
function getSubtractNumberInstruction(number, startColumn) {
  const digits = number.toString().split('').map(Number);
  const instructions = [];

  digits.forEach((digit, index) => {
    const columnIndex = startColumn + index;
    const inst = getSubtractDigitInstruction(digit, columnIndex);
    if (inst) {
      instructions.push(inst);
    }
  });

  return instructions.join('\n');
}

/**
 * PHÂN TÍCH VÀ SINH BƯỚC HƯỚNG DẪN CHO PHÉP CHIA
 *
 * @param {string} problem - Biểu thức chia (VD: "84 ÷ 12", "12 ÷ 2")
 * @param {number} answer - Kết quả đúng
 * @returns {Array} - Mảng các bước hướng dẫn
 */
export function parseDivisionProblem(problem, answer) {
  const steps = [];
  let stepNumber = 1;

  // Parse biểu thức: "số1 ÷ số2" hoặc "số1 / số2"
  const cleanProblem = problem.replace(/\s/g, '');
  const match = cleanProblem.match(/^(\d+)[÷\/](\d+)$/);

  if (!match) {
    // Không parse được, trả về bước đơn giản
    return [{
      emoji: '➗',
      title: `Tính ${problem}`,
      instruction: `Gạt bàn tính để được kết quả ${answer}`,
      demoValue: answer,
      column: null
    }];
  }

  const dividend = parseInt(match[1]); // Số bị chia
  const divisor = parseInt(match[2]);  // Số chia

  // Kiểm tra chia hết
  if (dividend % divisor !== 0) {
    return [{
      emoji: '⚠️',
      title: `Phép chia có số dư`,
      instruction: `${dividend} ÷ ${divisor} không chia hết\n\nTrong học Soroban, chúng ta chỉ học phép chia hết.\n\nKết quả nguyên: ${Math.floor(dividend / divisor)}\nSố dư: ${dividend % divisor}`,
      demoValue: Math.floor(dividend / divisor),
      column: null
    }];
  }

  const quotient = answer; // Thương số

  // ========================================
  // PHƯƠNG PHÁP SOROBAN: CHIA ĐƠN GIẢN
  // ========================================

  // ========== PHƯƠNG PHÁP 1: CHIA 1 CHỮ SỐ ÷ 1 CHỮ SỐ ==========
  if (dividend <= 9 && divisor <= 9) {
    // Chia đơn giản: dùng bảng cửu chương ngược
    steps.push({
      emoji: '📚',
      title: `Phương pháp chia`,
      instruction: `${dividend} ÷ ${divisor} = ?\n\nDùng bảng cửu chương ngược:\n${divisor} × ? = ${dividend}\n${divisor} × ${quotient} = ${dividend} ✓\n\nVậy thương số là: ${quotient}`,
      demoValue: -1,
      column: null,
      skipCheck: true
    });

    // Bước 1: Đặt số bị chia
    steps.push({
      emoji: getStepEmoji(stepNumber++),
      title: `Đặt số bị chia ${dividend}`,
      instruction: getSetNumberInstruction(dividend),
      demoValue: dividend,
      column: null
    });

    // Bước 2: Tính thương số
    const product = divisor * quotient;
    steps.push({
      emoji: '🔢',
      title: `Tính ${divisor} × ${quotient}`,
      instruction: `Thương số là ${quotient}\n\nKiểm tra: ${divisor} × ${quotient} = ${product}\n${product === dividend ? '✅ Đúng!' : '❌ Sai'}`,
      demoValue: dividend,
      column: null,
      skipCheck: true
    });

    // Bước 3: Trừ đi số bị chia
    steps.push({
      emoji: getStepEmoji(stepNumber++),
      title: `Trừ ${dividend} - ${product} = 0`,
      instruction: `Trừ ${product} khỏi Soroban:\n\n${getSubtractDigitInstruction(dividend, 9)}\n\nCòn lại: 0`,
      demoValue: 0,
      column: null
    });

    // Bước 4: Đặt kết quả
    steps.push({
      emoji: getStepEmoji(stepNumber++),
      title: `Đặt thương số ${quotient}`,
      instruction: `${getSetNumberInstruction(quotient)}\n\n✅ Kết quả: ${dividend} ÷ ${divisor} = ${quotient}`,
      demoValue: quotient,
      column: null
    });

    return steps;
  }

  // ========== PHƯƠNG PHÁP 2: CHIA 2 CHỮ SỐ ÷ 1 CHỮ SỐ ==========
  if (dividend >= 10 && dividend < 100 && divisor <= 9) {
    // Giải thích phương pháp
    steps.push({
      emoji: '📚',
      title: `Phương pháp chia`,
      instruction: `${dividend} ÷ ${divisor} = ?\n\nBước 1: Tìm thương số (dùng bảng cửu chương)\nBước 2: Nhân thương số với số chia\nBước 3: Trừ từng cột\nBước 4: Đặt kết quả`,
      demoValue: -1,
      column: null,
      skipCheck: true
    });

    // Bước 1: Đặt số bị chia
    const dividendColumn = 8; // 2 chữ số bắt đầu từ cột Chục
    steps.push({
      emoji: getStepEmoji(stepNumber++),
      title: `Đặt số bị chia ${dividend}`,
      instruction: getSetNumberInstruction(dividend),
      demoValue: dividend,
      column: null
    });

    // Bước 2: Tìm thương số
    const product = divisor * quotient;
    steps.push({
      emoji: '🔍',
      title: `Tìm thương số`,
      instruction: `Thử các số để tìm:\n${divisor} × ? = ${dividend}\n\nThử ${quotient}: ${divisor} × ${quotient} = ${product}\n\n${product === dividend ? '✅ Đúng!' : '❌ Sai, thử số khác'}\n\nThương số là: ${quotient}`,
      demoValue: dividend,
      column: null,
      skipCheck: true
    });

    // Bước 3: Nhân và trừ từng cột
    steps.push({
      emoji: getStepEmoji(stepNumber++),
      title: `Trừ ${dividend} - ${product}`,
      instruction: `Tính ${divisor} × ${quotient} = ${product}\n\nTrừ ${product} khỏi ${dividend}:\n\n${getSubtractNumberInstruction(product, dividendColumn)}\n\nCòn lại: 0`,
      demoValue: 0,
      column: null
    });

    // Bước 4: Đặt kết quả
    const quotientColumn = quotient >= 10 ? 8 : 9;
    steps.push({
      emoji: getStepEmoji(stepNumber++),
      title: `Đặt thương số ${quotient}`,
      instruction: `${getSetNumberInstruction(quotient)}\n\n✅ Kết quả: ${dividend} ÷ ${divisor} = ${quotient}`,
      demoValue: quotient,
      column: null
    });

    return steps;
  }

  // ========== PHƯƠNG PHÁP 3: CHIA 2 CHỮ SỐ ÷ 2 CHỮ SỐ (HOẶC 3 CHỮ SỐ) ==========
  if (divisor >= 10) {
    // Giải thích phương pháp chia
    steps.push({
      emoji: '📚',
      title: `Phương pháp chia`,
      instruction: `${dividend} ÷ ${divisor} = ?\n\nBước 1: Đặt số bị chia lên Soroban\nBước 2: Ước lượng thương số\nBước 3: Nhân thương số với số chia\nBước 4: Trừ từng cột\nBước 5: Đặt kết quả`,
      demoValue: -1,
      column: null,
      skipCheck: true
    });

    // Bước 1: Đặt số bị chia
    const dividendColumn = dividend >= 100 ? 7 : 8;
    steps.push({
      emoji: getStepEmoji(stepNumber++),
      title: `Đặt số bị chia ${dividend}`,
      instruction: getSetNumberInstruction(dividend),
      demoValue: dividend,
      column: null
    });

    // Bước 2: Ước lượng thương số
    const firstDigitDividend = parseInt(dividend.toString()[0]);
    const firstDigitDivisor = parseInt(divisor.toString()[0]);
    const estimatedQuotient = Math.floor(firstDigitDividend / firstDigitDivisor);

    steps.push({
      emoji: '🤔',
      title: `Ước lượng thương số`,
      instruction: `Xem chữ số đầu:\n${firstDigitDividend}_ ÷ ${firstDigitDivisor}_ ≈ ${estimatedQuotient}\n\nThử thương số: ${quotient}`,
      demoValue: dividend,
      column: null,
      skipCheck: true
    });

    // Bước 3: Kiểm tra bằng phép nhân
    const product = divisor * quotient;
    steps.push({
      emoji: '🔍',
      title: `Kiểm tra`,
      instruction: `Nhân thử:\n${divisor} × ${quotient} = ${product}\n\n${product === dividend ? `✅ Đúng! ${product} = ${dividend}` : `❌ ${product} ≠ ${dividend}, cần thử lại`}\n\nThương số đúng là: ${quotient}`,
      demoValue: dividend,
      column: null,
      skipCheck: true
    });

    // Bước 4: Trừ từng cột
    steps.push({
      emoji: getStepEmoji(stepNumber++),
      title: `Trừ ${dividend} - ${product}`,
      instruction: `Tính ${divisor} × ${quotient} = ${product}\n\nTrừ ${product} khỏi ${dividend}:\n\n${getSubtractNumberInstruction(product, dividendColumn)}\n\nCòn lại: 0 (chia hết)`,
      demoValue: 0,
      column: null
    });

    // Bước 5: Đặt kết quả
    const quotientColumn = quotient >= 10 ? 8 : 9;
    steps.push({
      emoji: getStepEmoji(stepNumber++),
      title: `Đặt thương số ${quotient}`,
      instruction: `${getSetNumberInstruction(quotient)}\n\n✅ Kết quả: ${dividend} ÷ ${divisor} = ${quotient}`,
      demoValue: quotient,
      column: null
    });

    return steps;
  }

  // ========== PHƯƠNG PHÁP 4: FALLBACK ==========
  return [{
    emoji: '➗',
    title: `Tính ${problem}`,
    instruction: `Đây là phép chia nâng cao.\n\nHãy tính: ${dividend} ÷ ${divisor}\n\nDùng phương pháp thử và kiểm tra.\n\nKết quả đúng: ${quotient}`,
    demoValue: quotient,
    column: null // Không highlight khi không xử lý được
  }];
}
