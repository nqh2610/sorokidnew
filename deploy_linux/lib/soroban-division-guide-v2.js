/**
 * SOROBAN DIVISION GUIDE V2
 * Hướng dẫn chia theo phương pháp Soroban ĐÚNG - Long Division
 * Chia từng chữ số từ trái sang phải
 */

// Helper: Tên cột (index 0-8)
function getColumnName(index) {
  const names = ['Trăm triệu', 'Chục triệu', 'Triệu', 'Trăm nghìn', 'Chục nghìn', 'Nghìn', 'Trăm', 'Chục', 'Đơn vị'];
  return names[index] || `Cột ${index}`;
}

// Helper: Emoji cho từng bước
function getStepEmoji(num) {
  const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  return emojis[num - 1] || '▶️';
}

// Helper: Hướng dẫn đặt một số lên Soroban (với startColumn nếu có)
function getSetNumberInstruction(number, startColumn = null) {
  const digits = number.toString().split('').map(Number);
  const instructions = [];

  // Tự động tính startColumn nếu không được cung cấp
  // Column index 8 = Đơn vị, 7 = Chục, 6 = Trăm, etc.
  if (startColumn === null) {
    startColumn = 9 - digits.length;
  }

  digits.forEach((digit, index) => {
    const columnIndex = startColumn + index;
    const columnName = getColumnName(columnIndex);

    if (digit === 0) return;

    if (digit <= 4) {
      instructions.push(`${columnName}: gạt ${digit} hạt đất LÊN`);
    } else if (digit === 5) {
      instructions.push(`${columnName}: gạt 1 hạt trời XUỐNG`);
    } else {
      const earth = digit - 5;
      instructions.push(`${columnName}: gạt 1 hạt trời XUỐNG + ${earth} hạt đất LÊN`);
    }
  });

  return instructions.join('\n');
}

// Helper: Hướng dẫn trừ một chữ số khỏi một cột
function getSubtractDigitInstruction(digit, columnIndex) {
  const columnName = getColumnName(columnIndex);
  const instructions = [];

  if (digit === 0) return '';

  if (digit <= 4) {
    instructions.push(`${columnName}: gạt ${digit} hạt đất XUỐNG`);
  } else if (digit === 5) {
    instructions.push(`${columnName}: gạt 1 hạt trời LÊN`);
  } else {
    const earth = digit - 5;
    instructions.push(`${columnName}: gạt 1 hạt trời LÊN`);
    instructions.push(`${columnName}: gạt ${earth} hạt đất XUỐNG`);
  }

  return instructions.join('\n');
}

// Helper: Hướng dẫn trừ một số nhiều chữ số
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
 * Parse division problem và tạo hướng dẫn từng bước
 */
export function parseDivisionProblem(problem, expectedAnswer) {
  const parts = problem.split('÷').map(p => p.trim());
  if (parts.length !== 2) {
    return [{
      emoji: '❌',
      title: 'Lỗi',
      instruction: 'Không phân tích được bài toán',
      demoValue: 0,
      column: null
    }];
  }

  const dividend = parseInt(parts[0]);
  const divisor = parseInt(parts[1]);
  const quotient = expectedAnswer;

  const steps = [];
  let stepNumber = 1;

  // ========== PHƯƠNG PHÁP 1: CHIA 1 CHỮ SỐ ÷ 1 CHỮ SỐ ==========
  if (dividend <= 9 && divisor <= 9) {
    // Giải thích
    steps.push({
      emoji: '📚',
      title: `Phương pháp chia`,
      instruction: `${dividend} ÷ ${divisor} = ?\n\nDùng bảng cửu chương ngược:\n${divisor} × ? = ${dividend}\n${divisor} × ${quotient} = ${dividend}\n\nVậy ${dividend} ÷ ${divisor} = ${quotient}`,
      demoValue: -1,
      column: null,
      skipCheck: true
    });

    // Đặt số
    steps.push({
      emoji: getStepEmoji(stepNumber++),
      title: `Đặt ${dividend} lên bàn tính`,
      instruction: getSetNumberInstruction(dividend, 8),
      demoValue: dividend,
      column: null
    });

    // Trừ
    steps.push({
      emoji: getStepEmoji(stepNumber++),
      title: `Trừ ${dividend}`,
      instruction: `Thương số là ${quotient}\n\nTrừ ${dividend} khỏi bàn tính:\n${getSubtractDigitInstruction(dividend, 9)}\n\nCòn: 0`,
      demoValue: 0,
      column: null
    });

    // Ghi kết quả
    const quotientStartCol = quotient >= 10 ? 8 : 9;
    steps.push({
      emoji: getStepEmoji(stepNumber++),
      title: `Ghi thương ${quotient}`,
      instruction: `${getSetNumberInstruction(quotient, quotientStartCol)}\n\n✅ Kết quả: ${dividend} ÷ ${divisor} = ${quotient}`,
      demoValue: quotient,
      column: null
    });

    return steps;
  }

  // ========== PHƯƠNG PHÁP 2: LONG DIVISION - CHIA TỪNG CHỮ SỐ ==========
  // Áp dụng cho TẤT CẢ phép chia từ 2 chữ số trở lên

  const dividendStr = dividend.toString();
  const dividendDigits = dividendStr.split('').map(Number);
  const numDigits = dividendDigits.length;

  // Giải thích phương pháp
  steps.push({
    emoji: '📚',
    title: `Phương pháp chia`,
    instruction: `${dividend} ÷ ${divisor} = ?\n\nChia từng chữ số từ trái sang phải:\n1. Đặt số bị chia lên bàn tính\n2. Chia từng cột, trừ ngay\n3. Ghép số dư với chữ số tiếp theo\n4. Lặp lại cho đến hết`,
    demoValue: -1,
    column: null,
    skipCheck: true
  });

  // Bước 1: Đặt số bị chia
  const startColumn = 9 - numDigits;
  steps.push({
    emoji: getStepEmoji(stepNumber++),
    title: `Đặt ${dividend}`,
    instruction: getSetNumberInstruction(dividend, startColumn),
    demoValue: dividend,
    column: null
  });

  // Thực hiện long division
  let remainder = 0;
  let quotientDigits = [];
  let currentValue = dividend;

  for (let i = 0; i < numDigits; i++) {
    // Ghép remainder với chữ số hiện tại
    remainder = remainder * 10 + dividendDigits[i];
    const currentColumn = startColumn + i;

    // Tìm chữ số thương
    const digitQuotient = Math.floor(remainder / divisor);
    quotientDigits.push(digitQuotient);

    if (digitQuotient === 0) {
      // Không chia được, chuyển sang chữ số tiếp theo
      if (i === 0 && numDigits > 1) {
        steps.push({
          emoji: '🔍',
          title: `Chia ${getColumnName(currentColumn).toLowerCase()}`,
          instruction: `${remainder} ÷ ${divisor} = 0 (không đủ chia)\n\nGiữ dư ${remainder}, ghép với chữ số tiếp`,
          demoValue: currentValue,
          column: null,
          skipCheck: true
        });
      }
      continue;
    }

    // Tính số cần trừ
    const toSubtract = digitQuotient * divisor;
    const newRemainder = remainder - toSubtract;

    // Hiển thị bước chia
    const positionName = i === 0 ? getColumnName(currentColumn).toLowerCase() :
                         i === numDigits - 1 ? 'hàng đơn vị' :
                         getColumnName(currentColumn).toLowerCase();

    steps.push({
      emoji: getStepEmoji(stepNumber++),
      title: `Chia ${positionName} (${remainder} ÷ ${divisor} = ${digitQuotient})`,
      instruction: `${remainder} ÷ ${divisor} = ${digitQuotient} dư ${newRemainder}\n\nGhi thương: ${digitQuotient}\nTrừ ${toSubtract}:\n\n${getSubtractNumberInstruction(toSubtract, currentColumn)}\n\n→ Còn ${newRemainder}`,
      demoValue: currentValue - toSubtract,
      column: null
    });

    currentValue -= toSubtract;
    remainder = newRemainder;
  }

  // Bước cuối: Kết quả
  const finalQuotient = parseInt(quotientDigits.join(''));
  steps.push({
    emoji: '✅',
    title: `Kết quả`,
    instruction: `Thương số: ${quotientDigits.join(' ')}\n\n${dividend} ÷ ${divisor} = ${finalQuotient}\n\nSố dư: ${remainder}`,
    demoValue: finalQuotient,
    column: null,
    skipCheck: true
  });

  return steps;
}
