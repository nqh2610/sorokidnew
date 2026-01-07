/**
 * SOROBAN ADDITION & SUBTRACTION GUIDE
 * Hướng dẫn cộng trừ theo phương pháp Soroban CHUẨN
 *
 * QUY TẮC SOROBAN:
 *
 * 1. PHÉP CỘNG CÓ NHỚ (+n khi tràn, tức currentDigit + n >= 10):
 *    Công thức: +n = +10 - (10-n) = +10 - bù10
 *    Thứ tự: Nhớ 1 sang cột TRÁI TRƯỚC → Trừ bù10 ở cột hiện tại SAU
 *    VD: 7 + 5 = 12 → Nhớ 1 sang chục (+10) → Trừ 5 ở đơn vị (7-5=2)
 *
 * 2. PHÉP TRỪ CÓ MƯỢN (-n khi không đủ, tức currentDigit - n < 0):
 *    Công thức: -n = -10 + (10-n) = -10 + bù10
 *    Thứ tự: Mượn 1 từ cột TRÁI TRƯỚC → Cộng bù10 vào cột hiện tại SAU
 *    VD: 12 - 5 = 7 → Mượn 1 từ chục (-10) → Cộng 5 vào đơn vị (2+5=7)
 *
 * 3. BẠN NHỎ (Bổ sung của 5):
 *    1+4=5, 2+3=5, 3+2=5, 4+1=5
 *    Dùng khi cần cộng/trừ mà phải thao tác với hạt trời (5)
 *
 * 4. BẠN LỚN (Bổ sung của 10):
 *    1+9=10, 2+8=10, 3+7=10, 4+6=10, 5+5=10, 6+4=10, 7+3=10, 8+2=10, 9+1=10
 *    Dùng khi cần nhớ/mượn 10
 */

// Helper: Tên cột (index 0-8, với 8 = Đơn vị)
function getColumnName(index) {
  const names = {
    0: 'Trăm triệu',
    1: 'Chục triệu',
    2: 'Triệu',
    3: 'Trăm nghìn',
    4: 'Chục nghìn',
    5: 'Nghìn',
    6: 'Trăm',
    7: 'Chục',
    8: 'Đơn vị'
  };
  return names[index] || `Cột ${index}`;
}

// Helper: Emoji cho từng bước
function getStepEmoji(num) {
  const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  return emojis[num - 1] || '▶️';
}

// Helper: Bổ sung của 5 (bạn nhỏ)
function getComplement5(n) {
  return 5 - n;
}

// Helper: Bổ sung của 10 (bạn lớn)
function getComplement10(n) {
  return 10 - n;
}

/**
 * Hướng dẫn ĐẶT một chữ số lên Soroban
 * @param {number} digit - Chữ số cần đặt (0-9)
 * @param {string} columnName - Tên cột
 * @returns {string} - Hướng dẫn text
 */
function getSetDigitInstruction(digit, columnName) {
  if (digit === 0) return `Cột ${columnName} giữ nguyên (số 0)`;

  if (digit <= 4) {
    return `⬆️ Cột ${columnName}: Gạt ${digit} hạt đất LÊN (+${digit})`;
  } else if (digit === 5) {
    return `⬇️ Cột ${columnName}: Gạt hạt trời XUỐNG (+5)`;
  } else {
    const earth = digit - 5;
    return `⬇️ Cột ${columnName}: Gạt hạt trời XUỐNG (+5)\n⬆️ Cột ${columnName}: Gạt ${earth} hạt đất LÊN (+${earth})`;
  }
}

/**
 * Hướng dẫn CỘNG một số vào cột (không nhớ)
 * Sử dụng quy tắc bạn nhỏ khi cần
 * @param {number} currentDigit - Chữ số hiện tại trên cột (0-9)
 * @param {number} addend - Số cần cộng (1-9)
 * @param {string} columnName - Tên cột
 * @returns {object} - {instruction, needCarry}
 */
function getAddInstruction(currentDigit, addend, columnName) {
  const result = currentDigit + addend;

  if (result > 9) {
    // Cần nhớ - xử lý ở hàm khác
    return { instruction: null, needCarry: true };
  }

  const currentHeaven = currentDigit >= 5;
  const resultHeaven = result >= 5;
  const currentEarth = currentDigit >= 5 ? currentDigit - 5 : currentDigit;
  const resultEarth = result >= 5 ? result - 5 : result;

  let instruction = '';

  if (!currentHeaven && !resultHeaven) {
    // 0-4 + x = 0-4: Chỉ thêm hạt đất
    instruction = `⬆️ Cột ${columnName}: Gạt ${addend} hạt đất LÊN (+${addend})`;
  } else if (!currentHeaven && resultHeaven) {
    // 0-4 + x = 5-9: Dùng quy tắc BẠN NHỎ
    // +n = +5 - (5-n) = +5 - bạnNhỏ
    const complement5 = getComplement5(addend);
    if (complement5 > 0 && currentEarth >= complement5) {
      // Có đủ hạt đất để trừ bạn nhỏ
      instruction = `⬇️ Cột ${columnName}: Gạt hạt trời XUỐNG (+5)\n⬇️ Cột ${columnName}: Gạt ${complement5} hạt đất XUỐNG (-${complement5})`;
      instruction += `\n💡 Quy tắc: +${addend} = +5 -${complement5} (bạn nhỏ của ${addend} là ${complement5})`;
    } else {
      // Không cần dùng bạn nhỏ, chỉ cần hạ hạt trời và thêm hạt đất
      instruction = `⬇️ Cột ${columnName}: Gạt hạt trời XUỐNG (+5)`;
      const earthToAdd = resultEarth - currentEarth;
      if (earthToAdd > 0) {
        instruction += `\n⬆️ Cột ${columnName}: Gạt ${earthToAdd} hạt đất LÊN (+${earthToAdd})`;
      }
    }
  } else if (currentHeaven && resultHeaven) {
    // 5-9 + x = 5-9: Chỉ thêm hạt đất
    const earthToAdd = resultEarth - currentEarth;
    if (earthToAdd > 0) {
      instruction = `⬆️ Cột ${columnName}: Gạt ${earthToAdd} hạt đất LÊN (+${earthToAdd})`;
    }
  }

  return { instruction, needCarry: false };
}

/**
 * Hướng dẫn TRỪ một số khỏi cột (không mượn)
 * Sử dụng quy tắc bạn nhỏ khi cần
 * @param {number} currentDigit - Chữ số hiện tại trên cột (0-9)
 * @param {number} subtrahend - Số cần trừ (1-9)
 * @param {string} columnName - Tên cột
 * @returns {object} - {instruction, needBorrow}
 */
function getSubtractInstruction(currentDigit, subtrahend, columnName) {
  const result = currentDigit - subtrahend;

  if (result < 0) {
    // Cần mượn - xử lý ở hàm khác
    return { instruction: null, needBorrow: true };
  }

  const currentHeaven = currentDigit >= 5;
  const resultHeaven = result >= 5;
  const currentEarth = currentDigit >= 5 ? currentDigit - 5 : currentDigit;
  const resultEarth = result >= 5 ? result - 5 : result;

  let instruction = '';

  if (currentHeaven && resultHeaven) {
    // 5-9 - x = 5-9: Chỉ gạt hạt đất xuống
    const earthToRemove = currentEarth - resultEarth;
    if (earthToRemove > 0) {
      instruction = `⬇️ Cột ${columnName}: Gạt ${earthToRemove} hạt đất XUỐNG (-${earthToRemove})`;
    }
  } else if (currentHeaven && !resultHeaven) {
    // 5-9 - x = 0-4: Dùng quy tắc BẠN NHỎ
    // -n = -5 + (5-n) = -5 + bạnNhỏ
    const complement5 = getComplement5(subtrahend);
    if (complement5 >= 0) {
      instruction = `⬆️ Cột ${columnName}: Gạt hạt trời LÊN (-5)`;
      if (complement5 > 0) {
        instruction += `\n⬆️ Cột ${columnName}: Gạt ${complement5} hạt đất LÊN (+${complement5})`;
        instruction += `\n💡 Quy tắc: -${subtrahend} = -5 +${complement5} (bạn nhỏ của ${subtrahend} là ${complement5})`;
      }
    } else {
      // subtrahend > 5
      instruction = `⬆️ Cột ${columnName}: Gạt hạt trời LÊN (-5)`;
      const extraDown = subtrahend - 5;
      if (extraDown > 0) {
        instruction += `\n⬇️ Cột ${columnName}: Gạt ${extraDown} hạt đất XUỐNG (-${extraDown})`;
      }
    }
  } else if (!currentHeaven && !resultHeaven) {
    // 0-4 - x = 0-4: Chỉ gạt hạt đất xuống
    instruction = `⬇️ Cột ${columnName}: Gạt ${subtrahend} hạt đất XUỐNG (-${subtrahend})`;
  }

  return { instruction, needBorrow: false };
}

/**
 * Hướng dẫn CỘNG CÓ NHỚ (khi currentDigit + addend >= 10)
 * Quy tắc Soroban: Nhớ 1 sang cột TRÁI TRƯỚC → Trừ bù10 ở cột hiện tại SAU
 * Công thức: +n = +10 - (10-n) = +10 - bù10
 *
 * @param {number} currentDigit - Chữ số hiện tại (0-9)
 * @param {number} addend - Số cần cộng (1-9)
 * @param {string} columnName - Tên cột hiện tại
 * @param {string} leftColumnName - Tên cột bên trái (để nhớ)
 * @param {number} currentValueBeforeCarry - Giá trị bàn tính trước khi nhớ
 * @returns {Array} - Mảng các bước
 */
function getAddWithCarrySteps(currentDigit, addend, columnName, leftColumnName, currentValueBeforeCarry, stepNumber) {
  const steps = [];
  const complement10 = getComplement10(addend);
  const resultDigit = (currentDigit + addend) % 10;

  // BƯỚC 1: Nhớ 1 sang cột TRÁI TRƯỚC
  steps.push({
    emoji: getStepEmoji(stepNumber),
    title: `Nhớ 1 sang ${leftColumnName}`,
    instruction: `⬆️ Cột ${leftColumnName}: Gạt 1 hạt đất LÊN (+10)\n\n💡 Quy tắc BẠN LỚN: +${addend} = +10 -${complement10}\nBạn lớn của ${addend} là ${complement10}`,
    demoValue: currentValueBeforeCarry + 10,
    column: leftColumnName === 'Chục' ? 7 : 6
  });

  // BƯỚC 2: Trừ bù10 ở cột hiện tại SAU
  const subtractResult = getSubtractFromDigit(currentDigit, complement10, columnName);
  steps.push({
    emoji: getStepEmoji(stepNumber + 1),
    title: `Trừ ${complement10} ở ${columnName}`,
    instruction: subtractResult.instruction,
    demoValue: currentValueBeforeCarry + addend, // Kết quả cuối cùng
    column: columnName === 'Đơn vị' ? 8 : 7
  });

  return steps;
}

/**
 * Hướng dẫn TRỪ CÓ MƯỢN (khi currentDigit - subtrahend < 0)
 * Quy tắc Soroban: Mượn 1 từ cột TRÁI TRƯỚC → Cộng bù10 vào cột hiện tại SAU
 * Công thức: -n = -10 + (10-n) = -10 + bù10
 *
 * @param {number} currentDigit - Chữ số hiện tại (0-9)
 * @param {number} subtrahend - Số cần trừ (1-9)
 * @param {string} columnName - Tên cột hiện tại
 * @param {string} leftColumnName - Tên cột bên trái (để mượn)
 * @param {number} currentValueBeforeBorrow - Giá trị bàn tính trước khi mượn
 * @returns {Array} - Mảng các bước
 */
function getSubtractWithBorrowSteps(currentDigit, subtrahend, columnName, leftColumnName, currentValueBeforeBorrow, stepNumber) {
  const steps = [];
  const complement10 = getComplement10(subtrahend);
  const resultDigit = currentDigit + 10 - subtrahend; // 0-9

  // BƯỚC 1: Mượn 1 từ cột TRÁI TRƯỚC
  steps.push({
    emoji: getStepEmoji(stepNumber),
    title: `Mượn 1 từ ${leftColumnName}`,
    instruction: `⬇️ Cột ${leftColumnName}: Gạt 1 hạt đất XUỐNG (-10)\n\n💡 Quy tắc BẠN LỚN: -${subtrahend} = -10 +${complement10}\nBạn lớn của ${subtrahend} là ${complement10}`,
    demoValue: currentValueBeforeBorrow - 10,
    column: leftColumnName === 'Chục' ? 7 : 6
  });

  // BƯỚC 2: Cộng bù10 vào cột hiện tại SAU
  const addResult = getAddToDigit(currentDigit, complement10, columnName);
  steps.push({
    emoji: getStepEmoji(stepNumber + 1),
    title: `Cộng ${complement10} vào ${columnName}`,
    instruction: addResult.instruction,
    demoValue: currentValueBeforeBorrow - subtrahend, // Kết quả cuối cùng
    column: columnName === 'Đơn vị' ? 8 : 7
  });

  return steps;
}

/**
 * Helper: Hướng dẫn trừ một số từ một chữ số (dùng sau khi đã nhớ)
 */
function getSubtractFromDigit(currentDigit, amount, columnName) {
  const result = currentDigit - amount;
  const currentHeaven = currentDigit >= 5;
  const resultHeaven = result >= 5;
  const currentEarth = currentDigit >= 5 ? currentDigit - 5 : currentDigit;
  const resultEarth = result >= 5 ? result - 5 : result;

  let instruction = '';

  if (amount === 0) {
    instruction = `Cột ${columnName} giữ nguyên`;
  } else if (currentHeaven && result >= 5) {
    // Vẫn có hạt trời sau khi trừ
    const earthToRemove = currentEarth - resultEarth;
    if (earthToRemove > 0) {
      instruction = `⬇️ Cột ${columnName}: Gạt ${earthToRemove} hạt đất XUỐNG (-${earthToRemove})`;
    } else {
      instruction = `Cột ${columnName} giữ nguyên`;
    }
  } else if (currentHeaven && result < 5) {
    // Mất hạt trời sau khi trừ
    instruction = `⬆️ Cột ${columnName}: Gạt hạt trời LÊN (-5)`;
    if (resultEarth > 0) {
      instruction += `\n⬆️ Cột ${columnName}: Gạt ${resultEarth} hạt đất LÊN (+${resultEarth})`;
    }
  } else if (!currentHeaven) {
    // Không có hạt trời
    if (currentEarth >= amount) {
      instruction = `⬇️ Cột ${columnName}: Gạt ${amount} hạt đất XUỐNG (-${amount})`;
    }
  }

  return { instruction, result };
}

/**
 * Helper: Hướng dẫn cộng một số vào một chữ số (dùng sau khi đã mượn)
 */
function getAddToDigit(currentDigit, amount, columnName) {
  const result = currentDigit + amount;
  const currentHeaven = currentDigit >= 5;
  const resultHeaven = result >= 5;
  const currentEarth = currentDigit >= 5 ? currentDigit - 5 : currentDigit;
  const resultEarth = result >= 5 ? result - 5 : result;

  let instruction = '';

  if (amount === 0) {
    instruction = `Cột ${columnName} giữ nguyên`;
  } else if (!currentHeaven && !resultHeaven) {
    // Không có và không cần hạt trời
    instruction = `⬆️ Cột ${columnName}: Gạt ${amount} hạt đất LÊN (+${amount})`;
  } else if (!currentHeaven && resultHeaven) {
    // Cần hạ hạt trời
    instruction = `⬇️ Cột ${columnName}: Gạt hạt trời XUỐNG (+5)`;
    const earthToAdd = resultEarth - currentEarth;
    if (earthToAdd > 0) {
      instruction += `\n⬆️ Cột ${columnName}: Gạt ${earthToAdd} hạt đất LÊN (+${earthToAdd})`;
    } else if (earthToAdd < 0) {
      instruction += `\n⬇️ Cột ${columnName}: Gạt ${-earthToAdd} hạt đất XUỐNG (-${-earthToAdd})`;
    }
  } else if (currentHeaven && resultHeaven) {
    // Giữ hạt trời, thêm hạt đất
    const earthToAdd = resultEarth - currentEarth;
    if (earthToAdd > 0) {
      instruction = `⬆️ Cột ${columnName}: Gạt ${earthToAdd} hạt đất LÊN (+${earthToAdd})`;
    } else {
      instruction = `Cột ${columnName} giữ nguyên`;
    }
  }

  return { instruction, result };
}

/**
 * PHÂN TÍCH VÀ SINH BƯỚC HƯỚNG DẪN CHO PHÉP CỘNG/TRỪ
 *
 * @param {string} problem - Biểu thức (VD: "7 + 5", "12 - 5")
 * @param {number} answer - Kết quả đúng
 * @returns {Array} - Mảng các bước hướng dẫn
 */
export function parseAdditionSubtractionProblem(problem, answer) {
  const steps = [];
  let stepNumber = 1;

  // Parse biểu thức
  const cleanProblem = problem.replace(/\s/g, '');
  const match = cleanProblem.match(/^(\d+)([\+\-])(\d+)$/);

  if (!match) {
    return [{
      emoji: '🎯',
      title: `Tính ${problem}`,
      instruction: `Gạt bàn tính để được kết quả ${answer}`,
      demoValue: answer,
      column: 8
    }];
  }

  const num1 = parseInt(match[1]);
  const operator = match[2];
  const num2 = parseInt(match[3]);
  const result = operator === '+' ? num1 + num2 : num1 - num2;

  // Phân tích chữ số
  const tens1 = Math.floor(num1 / 10);
  const ones1 = num1 % 10;
  const tens2 = Math.floor(num2 / 10);
  const ones2 = num2 % 10;

  // ========== BƯỚC 1: ĐẶT SỐ ĐẦU TIÊN ==========
  if (num1 >= 10) {
    // Đặt hàng chục
    if (tens1 > 0) {
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `Đặt hàng Chục: ${tens1}`,
        instruction: getSetDigitInstruction(tens1, 'Chục'),
        demoValue: tens1 * 10,
        column: 7
      });
    }

    // Đặt hàng đơn vị
    if (ones1 > 0) {
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `Đặt số ${num1}`,
        instruction: getSetDigitInstruction(ones1, 'Đơn vị'),
        demoValue: num1,
        column: 8
      });
    } else {
      // Cập nhật bước trước nếu ones1 = 0
      if (steps.length > 0) {
        steps[steps.length - 1].title = `Đặt số ${num1}`;
        steps[steps.length - 1].demoValue = num1;
      }
    }
  } else {
    // Số 1 chữ số
    steps.push({
      emoji: getStepEmoji(stepNumber++),
      title: `Đặt số ${num1}`,
      instruction: getSetDigitInstruction(num1, 'Đơn vị'),
      demoValue: num1,
      column: 8
    });
  }

  // ========== BƯỚC 2: THỰC HIỆN PHÉP TÍNH ==========
  if (operator === '+') {
    // === PHÉP CỘNG ===
    if (num2 < 10) {
      // Cộng số 1 chữ số
      const sumOnes = ones1 + num2;

      if (sumOnes <= 9) {
        // KHÔNG CẦN NHỚ
        const addResult = getAddInstruction(ones1, num2, 'Đơn vị');
        steps.push({
          emoji: getStepEmoji(stepNumber++),
          title: `Cộng ${num2}`,
          instruction: addResult.instruction + `\n\n✅ ${num1} + ${num2} = ${result}`,
          demoValue: result,
          column: 8
        });
      } else {
        // CẦN NHỚ - Dùng quy tắc BẠN LỚN
        // Thứ tự: Nhớ sang Chục TRƯỚC → Trừ bù ở Đơn vị SAU
        const carrySteps = getAddWithCarrySteps(ones1, num2, 'Đơn vị', 'Chục', num1, stepNumber);

        // Thêm các bước với thông tin bổ sung
        carrySteps[0].instruction = carrySteps[0].instruction;
        carrySteps[1].instruction = carrySteps[1].instruction + `\n\n✅ ${num1} + ${num2} = ${result}`;
        carrySteps[1].demoValue = result;

        steps.push(...carrySteps);
        stepNumber += 2;
      }
    } else {
      // Cộng số 2 chữ số - xử lý từng hàng
      // Cộng hàng chục trước
      if (tens2 > 0) {
        const currentTens = tens1;
        const sumTens = currentTens + tens2;

        if (sumTens <= 9) {
          const addResult = getAddInstruction(currentTens, tens2, 'Chục');
          steps.push({
            emoji: getStepEmoji(stepNumber++),
            title: `Cộng ${tens2 * 10} vào hàng Chục`,
            instruction: addResult.instruction,
            demoValue: num1 + tens2 * 10,
            column: 7
          });
        } else {
          // Cần nhớ ở hàng chục
          steps.push({
            emoji: getStepEmoji(stepNumber++),
            title: `Cộng ${tens2 * 10} (có nhớ)`,
            instruction: `Cộng ${tens2} vào hàng Chục có nhớ sang hàng Trăm`,
            demoValue: num1 + tens2 * 10,
            column: 6
          });
        }
      }

      // Cộng hàng đơn vị
      if (ones2 > 0) {
        const sumOnes = ones1 + ones2;

        if (sumOnes <= 9) {
          const addResult = getAddInstruction(ones1, ones2, 'Đơn vị');
          steps.push({
            emoji: getStepEmoji(stepNumber++),
            title: `Cộng ${ones2}`,
            instruction: addResult.instruction + `\n\n✅ ${num1} + ${num2} = ${result}`,
            demoValue: result,
            column: 8
          });
        } else {
          // Cần nhớ
          const carrySteps = getAddWithCarrySteps(ones1, ones2, 'Đơn vị', 'Chục', num1 + tens2 * 10, stepNumber);
          carrySteps[carrySteps.length - 1].instruction += `\n\n✅ ${num1} + ${num2} = ${result}`;
          carrySteps[carrySteps.length - 1].demoValue = result;
          steps.push(...carrySteps);
          stepNumber += carrySteps.length;
        }
      }
    }
  } else {
    // === PHÉP TRỪ ===
    if (num2 < 10) {
      // Trừ số 1 chữ số
      const diffOnes = ones1 - num2;

      if (diffOnes >= 0) {
        // KHÔNG CẦN MƯỢN
        const subResult = getSubtractInstruction(ones1, num2, 'Đơn vị');
        steps.push({
          emoji: getStepEmoji(stepNumber++),
          title: `Trừ ${num2}`,
          instruction: subResult.instruction + `\n\n✅ ${num1} - ${num2} = ${result}`,
          demoValue: result,
          column: 8
        });
      } else {
        // CẦN MƯỢN - Dùng quy tắc BẠN LỚN
        // Thứ tự: Mượn từ Chục TRƯỚC → Cộng bù vào Đơn vị SAU
        const borrowSteps = getSubtractWithBorrowSteps(ones1, num2, 'Đơn vị', 'Chục', num1, stepNumber);

        // Thêm các bước với thông tin bổ sung
        borrowSteps[borrowSteps.length - 1].instruction += `\n\n✅ ${num1} - ${num2} = ${result}`;
        borrowSteps[borrowSteps.length - 1].demoValue = result;

        steps.push(...borrowSteps);
        stepNumber += 2;
      }
    } else {
      // Trừ số 2 chữ số - xử lý từng hàng
      // Trừ hàng chục trước
      if (tens2 > 0) {
        const diffTens = tens1 - tens2;

        if (diffTens >= 0) {
          const subResult = getSubtractInstruction(tens1, tens2, 'Chục');
          steps.push({
            emoji: getStepEmoji(stepNumber++),
            title: `Trừ ${tens2 * 10} ở hàng Chục`,
            instruction: subResult.instruction,
            demoValue: num1 - tens2 * 10,
            column: 7
          });
        } else {
          // Cần mượn ở hàng chục
          steps.push({
            emoji: getStepEmoji(stepNumber++),
            title: `Trừ ${tens2 * 10} (có mượn)`,
            instruction: `Trừ ${tens2} ở hàng Chục có mượn từ hàng Trăm`,
            demoValue: num1 - tens2 * 10,
            column: 6
          });
        }
      }

      // Trừ hàng đơn vị
      if (ones2 > 0) {
        const diffOnes = ones1 - ones2;

        if (diffOnes >= 0) {
          const subResult = getSubtractInstruction(ones1, ones2, 'Đơn vị');
          steps.push({
            emoji: getStepEmoji(stepNumber++),
            title: `Trừ ${ones2}`,
            instruction: subResult.instruction + `\n\n✅ ${num1} - ${num2} = ${result}`,
            demoValue: result,
            column: 8
          });
        } else {
          // Cần mượn
          const borrowSteps = getSubtractWithBorrowSteps(ones1, ones2, 'Đơn vị', 'Chục', num1 - tens2 * 10, stepNumber);
          borrowSteps[borrowSteps.length - 1].instruction += `\n\n✅ ${num1} - ${num2} = ${result}`;
          borrowSteps[borrowSteps.length - 1].demoValue = result;
          steps.push(...borrowSteps);
          stepNumber += borrowSteps.length;
        }
      }
    }
  }

  return steps;
}

// Export các helper functions nếu cần dùng ở nơi khác
export {
  getColumnName,
  getStepEmoji,
  getComplement5,
  getComplement10,
  getSetDigitInstruction,
  getAddInstruction,
  getSubtractInstruction,
  getAddWithCarrySteps,
  getSubtractWithBorrowSteps
};
