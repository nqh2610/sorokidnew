/**
 * LOGIC SINH BƯỚC HƯỚNG DẪN CHO PHÉP NHÂN TRÊN SOROBAN
 * Theo phương pháp Soroban chuẩn
 *
 * NGUYÊN TẮC NHÂN TRÊN SOROBAN:
 * 1. Nhân số NHÊN với từng chữ số của số BỊ NHÂN (từ trái sang phải)
 * 2. Đặt kết quả vào đúng vị trí hàng
 * 3. Ví dụ: 23 × 4
 *    - Bước 1: 20 × 4 = 80 (đặt vào hàng chục)
 *    - Bước 2: 3 × 4 = 12 (cộng dồn)
 *    - Kết quả: 80 + 12 = 92
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

// Helper: Hướng dẫn đặt 1 chữ số trên Soroban
function getSetDigitInstruction(digit, columnIndex) {
  if (digit === 0) return null;

  const columnName = getColumnName(columnIndex);

  if (digit <= 4) {
    return `⬆️ ${columnName}: Gạt ${digit} hạt đất LÊN`;
  } else if (digit === 5) {
    return `⬇️ ${columnName}: Gạt hạt trời XUỐNG (+5)`;
  } else {
    const earth = digit - 5;
    return `⬇️ ${columnName}: Gạt hạt trời XUỐNG (+5)\n⬆️ ${columnName}: Gạt ${earth} hạt đất LÊN (+${earth})`;
  }
}

// Helper: Hướng dẫn CỘNG một số vào cột (dùng cho cộng dồn kết quả)
function getAddToColumnInstruction(digit, columnIndex, currentValue) {
  if (digit === 0) return null;

  const columnName = getColumnName(columnIndex);
  const currentDigit = Math.floor(currentValue / Math.pow(10, 9 - columnIndex)) % 10;
  const result = currentDigit + digit;

  // Nếu không cần nhớ
  if (result <= 9) {
    if (digit <= 4) {
      return `⬆️ ${columnName}: Gạt ${digit} hạt đất LÊN (+${digit})`;
    } else if (digit === 5) {
      return `⬇️ ${columnName}: Gạt hạt trời XUỐNG (+5)`;
    } else {
      // Cần xử lý phức tạp hơn - dùng bạn 5
      const complement5 = 5 - digit;
      if (complement5 > 0 && currentDigit >= complement5) {
        return `⬇️ ${columnName}: Gạt hạt trời XUỐNG (+5)\n⬇️ ${columnName}: Gạt ${complement5} hạt đất XUỐNG (-${complement5})`;
      } else {
        const earth = digit - 5;
        return `⬇️ ${columnName}: Gạt hạt trời XUỐNG (+5)\n⬆️ ${columnName}: Gạt ${earth} hạt đất LÊN (+${earth})`;
      }
    }
  } else {
    // Cần nhớ - dùng bạn 10
    const complement10 = 10 - digit;
    return `⬇️ ${columnName}: Gạt ${complement10} hạt đất XUỐNG (-${complement10})\n⬆️ ${getColumnName(columnIndex - 1)}: Gạt 1 hạt đất LÊN (+1 vào hàng cao hơn)`;
  }
}

/**
 * PHÂN TÍCH VÀ SINH BƯỚC HƯỚNG DẪN CHO PHÉP NHÂN
 *
 * @param {string} problem - Biểu thức nhân (VD: "23 × 4", "2 × 6")
 * @param {number} answer - Kết quả đúng
 * @returns {Array} - Mảng các bước hướng dẫn
 */
export function parseMultiplicationProblem(problem, answer) {
  const steps = [];
  let stepNumber = 1;

  // Parse biểu thức: "số1 × số2" hoặc "số1 * số2"
  const cleanProblem = problem.replace(/\s/g, '');
  const match = cleanProblem.match(/^(\d+)[×\*](\d+)$/);

  if (!match) {
    // Không parse được, trả về bước đơn giản
    return [{
      emoji: '✖️',
      title: `Tính ${problem}`,
      instruction: `Gạt bàn tính để được kết quả ${answer}`,
      demoValue: answer,
      column: null
    }];
  }

  const multiplicand = parseInt(match[1]); // Số bị nhân
  const multiplier = parseInt(match[2]);   // Số nhân

  // ========================================
  // PHƯƠNG PHÁP SOROBAN: NHÂN ĐƠN GIẢN
  // ========================================
  // Với phép nhân đơn giản (1-2 chữ số × 1 chữ số)
  // Ta nhân từng chữ số của số bị nhân với số nhân
  // Rồi cộng dồn vào đúng vị trí

  // Phân tích multiplicand thành các chữ số
  const multiplicandDigits = multiplicand.toString().split('').map(Number);
  const multiplicandLength = multiplicandDigits.length;

  // Với phép nhân đơn giản, ta làm từng bước
  let currentValue = 0;

  // ========== PHƯƠNG PHÁP 1: NHÂN TRỰC TIẾP (Cho 1 chữ số × 1 chữ số) ==========
  if (multiplicand <= 9 && multiplier <= 9) {
    // Nhân đơn giản: chỉ cần tính trực tiếp
    const product = multiplicand * multiplier;

    // Bước 1: Giải thích (không cần thực hành)
    steps.push({
      emoji: '📚',
      title: `${multiplicand} × ${multiplier}`,
      instruction: `Dùng bảng cửu chương:\n${multiplicand} × ${multiplier} = ${product}\n\nBây giờ đặt kết quả ${product} lên Soroban`,
      demoValue: -1, // -1 nghĩa là bước này không cần kiểm tra
      column: null,
      skipCheck: true // Flag đánh dấu bỏ qua kiểm tra
    });

    // Bước 2: Đặt kết quả
    if (product >= 10) {
      const tens = Math.floor(product / 10);
      const ones = product % 10;

      // Đặt hàng chục
      const tensInst = getSetDigitInstruction(tens, 8);
      if (tensInst) {
        steps.push({
          emoji: getStepEmoji(stepNumber++),
          title: `Đặt hàng Chục: ${tens}`,
          instruction: tensInst,
          demoValue: tens * 10,
          column: null
        });
      }

      // Đặt hàng đơn vị
      if (ones > 0) {
        const onesInst = getSetDigitInstruction(ones, 9);
        steps.push({
          emoji: getStepEmoji(stepNumber++),
          title: `Đặt hàng Đơn vị: ${ones}`,
          instruction: onesInst + `\n\n✅ Kết quả: ${multiplicand} × ${multiplier} = ${product}`,
          demoValue: product,
          column: null
        });
      } else {
        // Cập nhật bước cuối
        steps[steps.length - 1].instruction += `\n\n✅ Kết quả: ${multiplicand} × ${multiplier} = ${product}`;
        steps[steps.length - 1].demoValue = product;
      }
    } else {
      // Sản phẩm < 10
      const inst = getSetDigitInstruction(product, 9);
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `Đặt kết quả: ${product}`,
        instruction: inst + `\n\n✅ Kết quả: ${multiplicand} × ${multiplier} = ${product}`,
        demoValue: product,
        column: null
      });
    }

    return steps;
  }

  // ========== PHƯƠNG PHÁP 2: NHÂN SỐ 2 CHỮ SỐ × 1 CHỮ SỐ ==========
  if (multiplicandLength === 2 && multiplier <= 9) {
    const tens = multiplicandDigits[0]; // Chữ số hàng chục
    const ones = multiplicandDigits[1]; // Chữ số hàng đơn vị

    // Giải thích phương pháp (không cần thực hành)
    steps.push({
      emoji: '📚',
      title: `Phương pháp nhân`,
      instruction: `${multiplicand} × ${multiplier} = ?\n\nTách: (${tens}0 + ${ones}) × ${multiplier}\n= ${tens}0 × ${multiplier} + ${ones} × ${multiplier}\n= ${tens * multiplier * 10} + ${ones * multiplier}\n\nLàm từng bước:`,
      demoValue: -1, // Bỏ qua kiểm tra
      column: null,
      skipCheck: true
    });

    // Bước 1: Nhân hàng chục
    const tensProduct = tens * multiplier; // Kết quả nhân hàng chục
    const tensValue = tensProduct * 10; // Giá trị thực (vì là hàng chục)

    steps.push({
      emoji: getStepEmoji(stepNumber++),
      title: `${tens}0 × ${multiplier} = ${tensValue}`,
      instruction: `Tính: ${tens} × ${multiplier} = ${tensProduct}\nĐặt ${tensProduct} vào hàng Chục (= ${tensValue})\n\n` +
                   getSetDigitInstruction(tensProduct, 8),
      demoValue: tensValue,
      column: null
    });

    currentValue = tensValue;

    // Bước 2: Nhân hàng đơn vị
    const onesProduct = ones * multiplier; // Kết quả nhân hàng đơn vị

    // Phân tích onesProduct để cộng dồn
    if (onesProduct < 10) {
      // Đơn giản: chỉ cộng vào cột đơn vị
      const inst = getSetDigitInstruction(onesProduct, 9);
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `${ones} × ${multiplier} = ${onesProduct}`,
        instruction: `Cộng ${onesProduct} vào hàng Đơn vị\n\n` + inst +
                     `\n\n✅ Kết quả: ${tensValue} + ${onesProduct} = ${answer}`,
        demoValue: answer,
        column: null
      });
    } else {
      // onesProduct >= 10: Cần cộng vào cả chục và đơn vị
      const onesProductTens = Math.floor(onesProduct / 10);
      const onesProductOnes = onesProduct % 10;

      // Cộng vào hàng chục trước
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `${ones} × ${multiplier} = ${onesProduct}`,
        instruction: `${onesProduct} = ${onesProductTens}0 + ${onesProductOnes}\n\nĐầu tiên cộng ${onesProductTens} vào hàng Chục:\n` +
                     getAddToColumnInstruction(onesProductTens, 8, currentValue),
        demoValue: currentValue + onesProductTens * 10,
        column: null
      });

      currentValue += onesProductTens * 10;

      // Sau đó cộng vào hàng đơn vị
      if (onesProductOnes > 0) {
        const inst = getSetDigitInstruction(onesProductOnes, 9);
        steps.push({
          emoji: getStepEmoji(stepNumber++),
          title: `Cộng hàng Đơn vị: ${onesProductOnes}`,
          instruction: inst + `\n\n✅ Kết quả: ${multiplicand} × ${multiplier} = ${answer}`,
          demoValue: answer,
          column: null
        });
      } else {
        // Cập nhật bước cuối
        steps[steps.length - 1].instruction += `\n\n✅ Kết quả: ${multiplicand} × ${multiplier} = ${answer}`;
        steps[steps.length - 1].demoValue = answer;
      }
    }

    return steps;
  }

  // ========== PHƯƠNG PHÁP 3: NHÂN N CHỮ SỐ × 1 CHỮ SỐ (TỔNG QUÁT) ==========
  if (multiplier <= 9 && multiplicandLength >= 3) {
    // Giải thích phương pháp
    steps.push({
      emoji: '📚',
      title: `Phương pháp nhân`,
      instruction: `${multiplicand} × ${multiplier} = ?\n\nNhân từng chữ số từ trái sang phải:\n${multiplicandDigits.map((d, i) => {
        const place = Math.pow(10, multiplicandLength - i - 1);
        return `${d} × ${multiplier} = ${d * multiplier} (× ${place})`;
      }).join('\n')}\n\nRồi cộng dồn vào Soroban`,
      demoValue: -1,
      column: null, // Không highlight vì là giải thích
      skipCheck: true
    });

    currentValue = 0;

    // Nhân từng chữ số từ trái sang phải
    for (let i = 0; i < multiplicandLength; i++) {
      const digit = multiplicandDigits[i];
      const product = digit * multiplier;
      const columnIndex = 10 - multiplicandLength + i; // Vị trí cột tương ứng
      const placeValue = Math.pow(10, multiplicandLength - i - 1);

      if (digit === 0) continue; // Bỏ qua nếu chữ số là 0

      // Nếu product < 10: Chỉ cần đặt/cộng vào 1 cột
      if (product < 10) {
        if (currentValue === 0 && i === 0) {
          // Bước đầu tiên: Đặt số
          const inst = getSetDigitInstruction(product, columnIndex);
          steps.push({
            emoji: getStepEmoji(stepNumber++),
            title: `${digit} × ${multiplier} = ${product}`,
            instruction: `Đặt ${product} vào ${getColumnName(columnIndex)}\n\n${inst}`,
            demoValue: product * placeValue,
            column: null
          });
        } else {
          // Các bước sau: Cộng dồn
          const inst = getAddToColumnInstruction(product, columnIndex, currentValue);
          steps.push({
            emoji: getStepEmoji(stepNumber++),
            title: `${digit} × ${multiplier} = ${product}`,
            instruction: `Cộng ${product} vào ${getColumnName(columnIndex)}\n\n${inst}`,
            demoValue: currentValue + product * placeValue,
            column: null
          });
        }
        currentValue += product * placeValue;
      } else {
        // product >= 10: Cần xử lý nhiều cột
        const tens = Math.floor(product / 10);
        const ones = product % 10;

        // Cộng hàng cao hơn trước
        if (tens > 0) {
          const higherColumn = columnIndex - 1;
          const inst = getAddToColumnInstruction(tens, higherColumn, currentValue);
          steps.push({
            emoji: getStepEmoji(stepNumber++),
            title: `${digit} × ${multiplier} = ${product}`,
            instruction: `${product} = ${tens}0 + ${ones}\n\nCộng ${tens} vào ${getColumnName(higherColumn)}:\n${inst}`,
            demoValue: currentValue + tens * placeValue * 10,
            column: null
          });
          currentValue += tens * placeValue * 10;
        }

        // Cộng hàng hiện tại
        if (ones > 0) {
          const inst = getSetDigitInstruction(ones, columnIndex);
          steps.push({
            emoji: getStepEmoji(stepNumber++),
            title: `Cộng ${ones} vào ${getColumnName(columnIndex)}`,
            instruction: inst,
            demoValue: currentValue + ones * placeValue,
            column: null
          });
          currentValue += ones * placeValue;
        }
      }
    }

    // Kết luận
    if (steps.length > 0) {
      steps[steps.length - 1].instruction += `\n\n✅ Kết quả: ${multiplicand} × ${multiplier} = ${answer}`;
      steps[steps.length - 1].demoValue = answer;
    }

    return steps;
  }

  // ========== PHƯƠNG PHÁP 4: NHÂN 2 CHỮ SỐ × 2 CHỮ SỐ ==========
  if (multiplicandLength === 2 && multiplier >= 10 && multiplier <= 99) {
    const m1 = multiplicandDigits[0]; // Chữ số hàng chục của multiplicand
    const m0 = multiplicandDigits[1]; // Chữ số hàng đơn vị của multiplicand
    const multiplierDigits = multiplier.toString().split('').map(Number);
    const n1 = multiplierDigits[0]; // Chữ số hàng chục của multiplier
    const n0 = multiplierDigits[1]; // Chữ số hàng đơn vị của multiplier

    // Giải thích
    steps.push({
      emoji: '📚',
      title: `Phương pháp nhân`,
      instruction: `${multiplicand} × ${multiplier} = (${m1}0 + ${m0}) × (${n1}0 + ${n0})\n\n` +
                   `= ${m1}0 × ${n1}0 + ${m1}0 × ${n0} + ${m0} × ${n1}0 + ${m0} × ${n0}\n` +
                   `= ${m1 * n1 * 100} + ${m1 * n0 * 10} + ${m0 * n1 * 10} + ${m0 * n0}\n\n` +
                   `Làm từng bước:`,
      demoValue: -1,
      column: null,
      skipCheck: true
    });

    currentValue = 0;

    // Bước 1: m1 × n1 (hàng trăm)
    const p11 = m1 * n1;
    if (p11 > 0) {
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `${m1}0 × ${n1}0 = ${p11 * 100}`,
        instruction: `Tính: ${m1} × ${n1} = ${p11}\nĐặt ${p11} vào hàng Trăm (= ${p11 * 100})`,
        demoValue: p11 * 100,
        column: null // Trăm
      });
      currentValue = p11 * 100;
    }

    // Bước 2: m1 × n0 (hàng chục)
    const p10 = m1 * n0;
    if (p10 > 0) {
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `${m1}0 × ${n0} = ${p10 * 10}`,
        instruction: `Tính: ${m1} × ${n0} = ${p10}\nCộng ${p10} vào hàng Chục`,
        demoValue: currentValue + p10 * 10,
        column: null // Chục
      });
      currentValue += p10 * 10;
    }

    // Bước 3: m0 × n1 (hàng chục)
    const p01 = m0 * n1;
    if (p01 > 0) {
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `${m0} × ${n1}0 = ${p01 * 10}`,
        instruction: `Tính: ${m0} × ${n1} = ${p01}\nCộng ${p01} vào hàng Chục`,
        demoValue: currentValue + p01 * 10,
        column: null // Chục
      });
      currentValue += p01 * 10;
    }

    // Bước 4: m0 × n0 (hàng đơn vị)
    const p00 = m0 * n0;
    if (p00 > 0) {
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `${m0} × ${n0} = ${p00}`,
        instruction: `Cộng ${p00} vào hàng Đơn vị\n\n✅ Kết quả: ${multiplicand} × ${multiplier} = ${answer}`,
        demoValue: answer,
        column: null // Đơn vị
      });
    } else {
      // Cập nhật kết quả vào bước cuối
      if (steps.length > 1) {
        steps[steps.length - 1].instruction += `\n\n✅ Kết quả: ${multiplicand} × ${multiplier} = ${answer}`;
        steps[steps.length - 1].demoValue = answer;
      }
    }

    return steps;
  }

  // ========== PHƯƠNG PHÁP 5: NHÂN 2 CHỮ SỐ × 3 CHỮ SỐ (HOẶC 3×2) ==========
  if ((multiplicandLength === 2 && multiplier >= 100 && multiplier <= 999) ||
      (multiplicandLength === 3 && multiplier >= 10 && multiplier <= 99)) {

    // Đảm bảo multiplicand là số lớn hơn (3 chữ số)
    let num1, num2;
    if (multiplicandLength === 3) {
      num1 = multiplicand;
      num2 = multiplier;
    } else {
      num1 = multiplier;
      num2 = multiplicand;
    }

    const num1Digits = num1.toString().split('').map(Number); // 3 chữ số [a2, a1, a0]
    const num2Digits = num2.toString().split('').map(Number); // 2 chữ số [b1, b0]

    const a2 = num1Digits[0];
    const a1 = num1Digits[1];
    const a0 = num1Digits[2];
    const b1 = num2Digits[0];
    const b0 = num2Digits[1];

    // Giải thích
    steps.push({
      emoji: '📚',
      title: `Phương pháp nhân`,
      instruction: `${multiplicand} × ${multiplier}\n\n` +
                   `= ${num1} × ${num2}\n` +
                   `= (${a2}00 + ${a1}0 + ${a0}) × (${b1}0 + ${b0})\n\n` +
                   `Nhân từng phần:`,
      demoValue: -1,
      column: null,
      skipCheck: true
    });

    currentValue = 0;

    // Nhân a2 (hàng trăm) với b1 (hàng chục) → hàng Vạn
    const p21 = a2 * b1;
    if (p21 > 0) {
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `${a2}00 × ${b1}0 = ${p21 * 1000}`,
        instruction: `Tính: ${a2} × ${b1} = ${p21}\nĐặt ${p21} vào hàng Nghìn (= ${p21 * 1000})`,
        demoValue: p21 * 1000,
        column: null
      });
      currentValue = p21 * 1000;
    }

    // Nhân a2 (hàng trăm) với b0 (đơn vị) → hàng Trăm
    const p20 = a2 * b0;
    if (p20 > 0) {
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `${a2}00 × ${b0} = ${p20 * 100}`,
        instruction: `Tính: ${a2} × ${b0} = ${p20}\nCộng ${p20} vào hàng Trăm`,
        demoValue: currentValue + p20 * 100,
        column: null
      });
      currentValue += p20 * 100;
    }

    // Nhân a1 (hàng chục) với b1 (hàng chục) → hàng Trăm
    const p11 = a1 * b1;
    if (p11 > 0) {
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `${a1}0 × ${b1}0 = ${p11 * 100}`,
        instruction: `Tính: ${a1} × ${b1} = ${p11}\nCộng ${p11} vào hàng Trăm`,
        demoValue: currentValue + p11 * 100,
        column: null
      });
      currentValue += p11 * 100;
    }

    // Nhân a1 (hàng chục) với b0 (đơn vị) → hàng Chục
    const p10 = a1 * b0;
    if (p10 > 0) {
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `${a1}0 × ${b0} = ${p10 * 10}`,
        instruction: `Tính: ${a1} × ${b0} = ${p10}\nCộng ${p10} vào hàng Chục`,
        demoValue: currentValue + p10 * 10,
        column: null
      });
      currentValue += p10 * 10;
    }

    // Nhân a0 (đơn vị) với b1 (hàng chục) → hàng Chục
    const p01 = a0 * b1;
    if (p01 > 0) {
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `${a0} × ${b1}0 = ${p01 * 10}`,
        instruction: `Tính: ${a0} × ${b1} = ${p01}\nCộng ${p01} vào hàng Chục`,
        demoValue: currentValue + p01 * 10,
        column: null
      });
      currentValue += p01 * 10;
    }

    // Nhân a0 (đơn vị) với b0 (đơn vị) → Đơn vị
    const p00 = a0 * b0;
    if (p00 > 0) {
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `${a0} × ${b0} = ${p00}`,
        instruction: `Cộng ${p00} vào hàng Đơn vị\n\n✅ Kết quả: ${multiplicand} × ${multiplier} = ${answer}`,
        demoValue: answer,
        column: null
      });
    } else {
      if (steps.length > 1) {
        steps[steps.length - 1].instruction += `\n\n✅ Kết quả: ${multiplicand} × ${multiplier} = ${answer}`;
        steps[steps.length - 1].demoValue = answer;
      }
    }

    return steps;
  }

  // ========== PHƯƠNG PHÁP 6: NHÂN 3 CHỮ SỐ × 3 CHỮ SỐ ==========
  if (multiplicandLength === 3 && multiplier >= 100 && multiplier <= 999) {
    const m = multiplicandDigits; // [m2, m1, m0]
    const nDigits = multiplier.toString().split('').map(Number); // [n2, n1, n0]
    const n = nDigits;

    // Giải thích phương pháp
    steps.push({
      emoji: '📚',
      title: `Phương pháp nhân`,
      instruction: `${multiplicand} × ${multiplier}\n\n` +
                   `= (${m[0]}00 + ${m[1]}0 + ${m[2]}) × (${n[0]}00 + ${n[1]}0 + ${n[2]})\n\n` +
                   `Sẽ có 9 phép nhân nhỏ.\nNhân và cộng dồn từng bước:`,
      demoValue: -1,
      column: null,
      skipCheck: true
    });

    currentValue = 0;

    // 9 phép nhân (theo thứ tự từ cao đến thấp)
    const products = [
      { digits: [m[0], n[0]], power: 10000, name: `${m[0]}00 × ${n[0]}00` },
      { digits: [m[0], n[1]], power: 1000, name: `${m[0]}00 × ${n[1]}0` },
      { digits: [m[0], n[2]], power: 100, name: `${m[0]}00 × ${n[2]}` },
      { digits: [m[1], n[0]], power: 1000, name: `${m[1]}0 × ${n[0]}00` },
      { digits: [m[1], n[1]], power: 100, name: `${m[1]}0 × ${n[1]}0` },
      { digits: [m[1], n[2]], power: 10, name: `${m[1]}0 × ${n[2]}` },
      { digits: [m[2], n[0]], power: 100, name: `${m[2]} × ${n[0]}00` },
      { digits: [m[2], n[1]], power: 10, name: `${m[2]} × ${n[1]}0` },
      { digits: [m[2], n[2]], power: 1, name: `${m[2]} × ${n[2]}` }
    ];

    products.forEach((prod, index) => {
      const [d1, d2] = prod.digits;
      const product = d1 * d2;

      if (product > 0) {
        const value = product * prod.power;
        const isLast = index === products.length - 1;

        steps.push({
          emoji: getStepEmoji(stepNumber++),
          title: `${prod.name} = ${value}`,
          instruction: `Tính: ${d1} × ${d2} = ${product}\n` +
                       `${currentValue === 0 ? 'Đặt' : 'Cộng'} ${product} × ${prod.power} = ${value}` +
                       `${isLast ? `\n\n✅ Kết quả: ${multiplicand} × ${multiplier} = ${answer}` : ''}`,
          demoValue: isLast ? answer : currentValue + value,
          column: null
        });
        currentValue += value;
      }
    });

    return steps;
  }

  // ========== PHƯƠNG PHÁP 7: FALLBACK - NHÂN PHỨC TẠP HƠN (4+ CHỮ SỐ) ==========
  // Với các trường hợp quá phức tạp, không highlight và đưa ra hướng dẫn đơn giản
  return [{
    emoji: '✖️',
    title: `Tính ${problem}`,
    instruction: `Đây là phép nhân nâng cao.\n\nHãy tính: ${multiplicand} × ${multiplier}\n\nDùng bảng cửu chương và cộng dồn từng bước.\n\nKết quả đúng: ${answer}`,
    demoValue: answer,
    column: null // BỎ HIGHLIGHT
  }];
}
