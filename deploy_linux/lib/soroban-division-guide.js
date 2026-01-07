/**
 * SOROBAN DIVISION GUIDE V3
 * Hướng dẫn chia theo phương pháp Soroban
 * - Số chia 1 chữ số: Chia từng chữ số từ trái sang phải
 * - Số chia 2 chữ số: Ước lượng thương, nhân ngược kiểm tra
 */

// Emoji theo loại hành động
const ACTION_EMOJI = {
  set: '✏️',      // Đặt số
  estimate: '🤔', // Ước lượng
  quotient: '📊', // Ghi thương
  subtract: '➖', // Trừ
  result: '✅',   // Kết quả
  skip: '🔍'      // Bước skip
};

// Helper: Tên cột ngắn
function getShortColumnName(index) {
  const names = ['TrTr', 'ChTr', 'Tr', 'TrN', 'ChN', 'N', 'Trăm', 'Chục', 'ĐV'];
  return names[index] || `C${index}`;
}

// Helper: Tên cột đầy đủ
function getColumnName(index) {
  const names = ['Trăm triệu', 'Chục triệu', 'Triệu', 'Trăm nghìn', 'Chục nghìn', 'Nghìn', 'Trăm', 'Chục', 'Đơn vị'];
  return names[index] || `Cột ${index}`;
}

// Helper: Hướng dẫn đặt một chữ số
function getSetDigitInstruction(digit, columnIndex) {
  const col = getShortColumnName(columnIndex);
  if (digit === 0) return '';
  if (digit <= 4) return `${col}: gạt ${digit} hạt đất LÊN`;
  if (digit === 5) return `${col}: gạt 1 hạt trời XUỐNG`;
  return `${col}: gạt 1 hạt trời XUỐNG + ${digit - 5} hạt đất LÊN`;
}

// Helper: Hướng dẫn đặt một số lên Soroban
function getSetNumberInstruction(number) {
  if (number === 0) return 'giữ nguyên (đã là 0)';

  const digits = number.toString().split('').map(Number);
  const startColumn = 9 - digits.length;
  const instructions = [];

  digits.forEach((digit, index) => {
    const inst = getSetDigitInstruction(digit, startColumn + index);
    if (inst) instructions.push(inst);
  });

  return instructions.length > 0 ? instructions.join(', ') : 'giữ nguyên';
}

// Helper: Hướng dẫn trừ một chữ số
function getSubtractDigitInstruction(digit, columnIndex) {
  const col = getShortColumnName(columnIndex);
  if (digit === 0) return '';
  if (digit <= 4) return `${col}: gạt ${digit} hạt đất XUỐNG`;
  if (digit === 5) return `${col}: gạt 1 hạt trời LÊN`;
  return `${col}: gạt 1 hạt trời LÊN + ${digit - 5} hạt đất XUỐNG`;
}

// Helper: Hướng dẫn trừ một số nhiều chữ số
function getSubtractNumberInstruction(number, numDigitsOnBoard) {
  if (number === 0) return 'giữ nguyên';

  const digits = number.toString().split('').map(Number);
  const startColumn = 9 - numDigitsOnBoard; // Căn theo số chữ số trên bàn

  // Cần padding nếu số cần trừ có ít chữ số hơn
  const paddedDigits = [];
  for (let i = 0; i < numDigitsOnBoard - digits.length; i++) {
    paddedDigits.push(0);
  }
  paddedDigits.push(...digits);

  const instructions = paddedDigits
    .map((digit, index) => getSubtractDigitInstruction(digit, startColumn + index))
    .filter(inst => inst);

  return instructions.length > 0 ? instructions.join(', ') : 'giữ nguyên';
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
  const divisorDigits = divisor.toString().length;

  // Số chia 1 chữ số: dùng phương pháp chia từng chữ số
  if (divisorDigits === 1) {
    return generateSingleDigitDivisorGuide(dividend, divisor, quotient);
  }

  // Số chia 2 chữ số trở lên: dùng phương pháp ước lượng
  return generateMultiDigitDivisorGuide(dividend, divisor, quotient);
}

/**
 * Phương pháp 1: Chia cho số có 1 chữ số
 * Chia từng chữ số từ trái sang phải
 */
function generateSingleDigitDivisorGuide(dividend, divisor, quotient) {
  const steps = [];
  const dividendStr = dividend.toString();
  const dividendDigits = dividendStr.split('').map(Number);
  const numDigits = dividendDigits.length;
  const startColumn = 9 - numDigits;

  // Bước giải thích
  steps.push({
    emoji: '📚',
    title: `${dividend} ÷ ${divisor} = ?`,
    instruction: `Phương pháp: Chia từng chữ số từ TRÁI sang PHẢI\n• Lấy từng chữ số chia cho ${divisor}\n• Ghi thương, trừ ngay\n• Dư thì ghép với số tiếp theo`,
    demoValue: -1,
    column: null,
    skipCheck: true
  });

  // Bước đặt số bị chia
  steps.push({
    emoji: ACTION_EMOJI.set,
    title: `Đặt ${dividend}`,
    instruction: `🧮 SỐ BỊ CHIA: ${getSetNumberInstruction(dividend)}`,
    demoValue: dividend,
    column: null,
    activeBoard: 'main',
    quotientSoFar: 0,
    quotientTarget: 0,
    mainTarget: dividend
  });

  // Thực hiện chia từng chữ số
  let remainder = 0;
  let quotientDigits = [];
  let currentValue = dividend;

  const calcQuotientValue = (digits) => {
    let val = 0;
    for (let j = 0; j < digits.length; j++) {
      val += digits[j] * Math.pow(10, numDigits - 1 - j);
    }
    return val;
  };

  for (let i = 0; i < numDigits; i++) {
    remainder = remainder * 10 + dividendDigits[i];
    const currentColumn = startColumn + i;
    const previousQuotient = calcQuotientValue(quotientDigits);

    const digitQuotient = Math.floor(remainder / divisor);
    quotientDigits.push(digitQuotient);
    const quotientSoFar = calcQuotientValue(quotientDigits);

    if (digitQuotient === 0) {
      if (i === 0 && numDigits > 1) {
        steps.push({
          emoji: ACTION_EMOJI.skip,
          title: `${remainder} < ${divisor}`,
          instruction: `${remainder} không đủ chia cho ${divisor}\n→ Ghép với chữ số tiếp theo`,
          demoValue: currentValue,
          column: null,
          skipCheck: true,
          quotientSoFar: quotientSoFar
        });
      }
      continue;
    }

    const toSubtract = digitQuotient * divisor;
    const placeValue = Math.pow(10, numDigits - 1 - i);
    const actualSubtract = toSubtract * placeValue;
    const newRemainder = remainder - toSubtract;
    const isLastStep = (i === numDigits - 1);

    const positionName = getColumnName(currentColumn).toLowerCase();

    // Ghi thương
    steps.push({
      emoji: ACTION_EMOJI.quotient,
      title: `Ghi thương ${digitQuotient} (${positionName})`,
      instruction: `${remainder} ÷ ${divisor} = ${digitQuotient} (dư ${newRemainder})\n📊 THƯƠNG SỐ: Gạt số ${digitQuotient} vào hàng ${positionName}`,
      demoValue: currentValue,
      column: null,
      quotientSoFar: quotientSoFar,
      activeBoard: 'quotient',
      quotientTarget: quotientSoFar,
      mainTarget: currentValue
    });

    // Trừ
    const finalMainValue = currentValue - actualSubtract;
    const finalRemainder = dividend - (quotient * divisor);
    const hasRemainder = finalRemainder > 0;
    const resultText = isLastStep
      ? (hasRemainder ? `✅ Đáp số: Thương ${quotient}, Dư ${finalRemainder}` : `✅ Đáp số: ${quotient}`)
      : `→ Còn dư ${newRemainder}, ghép tiếp`;

    steps.push({
      emoji: isLastStep ? ACTION_EMOJI.result : ACTION_EMOJI.subtract,
      title: `Trừ ${toSubtract} (${positionName})`,
      instruction: `${digitQuotient} × ${divisor} = ${toSubtract}\n🧮 SỐ BỊ CHIA: Trừ ${toSubtract} ở hàng ${positionName}` +
        `\n\n${resultText}`,
      demoValue: finalMainValue,
      column: null,
      quotientSoFar: quotientSoFar,
      activeBoard: 'main',
      quotientTarget: quotientSoFar,
      mainTarget: finalMainValue
    });

    currentValue -= actualSubtract;
    remainder = newRemainder;
  }

  return steps;
}

/**
 * Phương pháp 2: Chia cho số có 2+ chữ số
 * Dùng phương pháp "thử thương" - ước lượng và kiểm tra
 */
function generateMultiDigitDivisorGuide(dividend, divisor, quotient) {
  const steps = [];
  const dividendDigits = dividend.toString().length;
  const quotientDigits = quotient.toString().length;
  const firstDivisorDigit = parseInt(divisor.toString()[0]);

  // Bước 1: Giải thích phương pháp thử thương
  steps.push({
    emoji: '📚',
    title: `${dividend} ÷ ${divisor} = ?`,
    instruction: `Phương pháp THỬ THƯƠNG:\n` +
      `1. Lấy chữ số đầu của số chia (${firstDivisorDigit})\n` +
      `2. Chia thử để ước lượng thương\n` +
      `3. Nhân ngược kiểm tra, điều chỉnh nếu cần`,
    demoValue: -1,
    column: null,
    skipCheck: true
  });

  // Bước 2: Đặt số bị chia
  steps.push({
    emoji: ACTION_EMOJI.set,
    title: `Đặt ${dividend}`,
    instruction: `🧮 SỐ BỊ CHIA: ${getSetNumberInstruction(dividend)}`,
    demoValue: dividend,
    column: null,
    activeBoard: 'main',
    quotientSoFar: 0,
    quotientTarget: 0,
    mainTarget: dividend
  });

  // Tính toán các bước chia
  const divisionSteps = calculateDivisionSteps(dividend, divisor, quotient);

  let currentQuotient = 0;
  let currentValue = dividend;

  for (let i = 0; i < divisionSteps.length; i++) {
    const step = divisionSteps[i];
    const isLastStep = (i === divisionSteps.length - 1);

    // Tạo giải thích chi tiết cách ước lượng
    const firstDigitOfWorking = parseInt(step.workingNumber.toString()[0]);
    const secondDigitOfWorking = step.workingNumber >= 10 ? parseInt(step.workingNumber.toString()[1]) : 0;
    const estimateByFirstDigit = Math.floor(firstDigitOfWorking / firstDivisorDigit);

    // Tìm quá trình thử thương
    let trialProcess = '';
    if (estimateByFirstDigit > step.quotientDigit) {
      // Phải giảm xuống
      const wrongTry = estimateByFirstDigit;
      const wrongProduct = wrongTry * divisor;
      trialProcess = `• Thử ${wrongTry}: ${wrongTry} × ${divisor} = ${wrongProduct} > ${step.workingNumber} ❌ quá lớn!\n` +
        `• Giảm xuống ${step.quotientDigit}: ${step.quotientDigit} × ${divisor} = ${step.product}`;
    } else if (estimateByFirstDigit < step.quotientDigit) {
      // Phải tăng lên
      const wrongTry = estimateByFirstDigit;
      const wrongProduct = wrongTry * divisor;
      const wrongRemainder = step.workingNumber - wrongProduct;
      trialProcess = `• Thử ${wrongTry}: ${wrongTry} × ${divisor} = ${wrongProduct}, dư ${wrongRemainder} ≥ ${divisor} → còn chia được!\n` +
        `• Tăng lên ${step.quotientDigit}: ${step.quotientDigit} × ${divisor} = ${step.product}`;
    } else {
      trialProcess = `• Thử ${step.quotientDigit}: ${step.quotientDigit} × ${divisor} = ${step.product}`;
    }

    // Bước ước lượng - giải thích CHI TIẾT
    steps.push({
      emoji: ACTION_EMOJI.estimate,
      title: `Ước lượng: ${step.workingNumber} ÷ ${divisor}`,
      instruction: `Cách làm: Lấy ${firstDigitOfWorking} ÷ ${firstDivisorDigit} = ${estimateByFirstDigit}\n` +
        trialProcess +
        (step.product === step.workingNumber ? ' ✓ vừa khớp!' : ` ✓ (dư ${step.remainder})`),
      demoValue: currentValue,
      column: null,
      skipCheck: true,
      quotientSoFar: currentQuotient
    });

    // Ghi thương
    currentQuotient = step.quotientSoFar;
    const quotientPosition = quotientDigits === 1 ? 'đơn vị' :
                             (i === 0 && quotientDigits === 2) ? 'chục' : 'đơn vị';

    steps.push({
      emoji: ACTION_EMOJI.quotient,
      title: `Ghi thương ${step.quotientDigit}`,
      instruction: `Thương là ${step.quotientDigit}\n📊 THƯƠNG SỐ: Gạt số ${step.quotientDigit} vào hàng ${quotientPosition}`,
      demoValue: currentValue,
      column: null,
      quotientSoFar: currentQuotient,
      activeBoard: 'quotient',
      quotientTarget: currentQuotient,
      mainTarget: currentValue
    });

    // Trừ
    const newValue = currentValue - step.subtractValue;
    const finalRemainder = dividend - (quotient * divisor);
    const hasRemainder = finalRemainder > 0;
    const resultText = hasRemainder
      ? `✅ Đáp số: Thương ${quotient}, Dư ${finalRemainder}`
      : `✅ Đáp số: ${quotient}`;

    steps.push({
      emoji: isLastStep ? ACTION_EMOJI.result : ACTION_EMOJI.subtract,
      title: `Trừ ${step.product}`,
      instruction: `${step.quotientDigit} × ${divisor} = ${step.product}\n` +
        `🧮 SỐ BỊ CHIA: ${currentValue} − ${step.subtractValue} = ${newValue}` +
        (isLastStep ? `\n\n${resultText}` : ''),
      demoValue: newValue,
      column: null,
      quotientSoFar: currentQuotient,
      activeBoard: 'main',
      quotientTarget: currentQuotient,
      mainTarget: newValue
    });

    currentValue = newValue;
  }

  return steps;
}

/**
 * Tính toán các bước chia cho số chia 2+ chữ số
 */
function calculateDivisionSteps(dividend, divisor, quotient) {
  const steps = [];
  const dividendStr = dividend.toString();
  const quotientStr = quotient.toString();
  const divisorLen = divisor.toString().length;

  let position = 0;
  let workingNumber = 0;
  let quotientSoFar = 0;
  let remainingDividend = dividend;

  // Xây dựng số làm việc ban đầu (đủ lớn để chia)
  while (position < dividendStr.length && workingNumber < divisor) {
    workingNumber = workingNumber * 10 + parseInt(dividendStr[position]);
    position++;
  }

  // Tính place value cho vị trí hiện tại
  let placeValue = Math.pow(10, dividendStr.length - position);

  while (position <= dividendStr.length) {
    const quotientDigit = Math.floor(workingNumber / divisor);
    const product = quotientDigit * divisor;
    const remainder = workingNumber - product;
    const subtractValue = product * placeValue;

    quotientSoFar = quotientSoFar * 10 + quotientDigit;

    steps.push({
      workingNumber,
      quotientDigit,
      product,
      remainder,
      subtractValue,
      quotientSoFar,
      placeValue
    });

    remainingDividend -= subtractValue;

    // Chuẩn bị cho bước tiếp theo
    if (position < dividendStr.length) {
      workingNumber = remainder * 10 + parseInt(dividendStr[position]);
      placeValue = placeValue / 10;
      position++;
    } else {
      break;
    }
  }

  return steps;
}
