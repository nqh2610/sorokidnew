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
  // PHƯƠNG PHÁP SOROBAN: Chỉ tách SỐ NHÂN theo hàng, làm từ trái sang phải
  // VD: 23 × 13 = 23 × 10 + 23 × 3 = 230 + 69 = 299
  if (multiplicandLength === 2 && multiplier >= 10 && multiplier <= 99) {
    const m1 = multiplicandDigits[0]; // Chữ số hàng chục của số bị nhân
    const m0 = multiplicandDigits[1]; // Chữ số hàng đơn vị của số bị nhân
    const multiplierDigits = multiplier.toString().split('').map(Number);
    const n1 = multiplierDigits[0]; // Chữ số hàng chục của số nhân
    const n0 = multiplierDigits[1]; // Chữ số hàng đơn vị của số nhân

    // Tính kết quả từng phần
    const part1 = multiplicand * n1 * 10; // VD: 12 × 10 = 120
    const part2 = multiplicand * n0;      // VD: 12 × 1 = 12

    // Bước 1: Tổng quan - ngắn gọn, dễ đọc
    let overviewParts = [];
    if (n1 > 0) overviewParts.push(`${multiplicand} × ${n1}0 = ${part1}`);
    if (n0 > 0) overviewParts.push(`${multiplicand} × ${n0} = ${part2}`);

    steps.push({
      emoji: '📚',
      title: `${multiplicand} × ${multiplier} = ?`,
      instruction: `Tách số nhân ${multiplier}:\n${overviewParts.join('\n')}\n\nTổng = ${answer}`,
      demoValue: -1,
      column: null,
      skipCheck: true
    });

    currentValue = 0;
    let partNum = 1;

    // ===== PHẦN 1: multiplicand × (n1 × 10) =====
    if (n1 > 0) {
      const p1_tens = m1 * n1;
      const p1_ones = m0 * n1;

      // Bước đầu tiên của phần 1
      if (p1_tens > 0) {
        steps.push({
          emoji: getStepEmoji(stepNumber++),
          title: `Phần ${partNum}: ${multiplicand} × ${n1}0`,
          instruction: `${m1} × ${n1} = ${p1_tens} → Trăm\nĐặt ${p1_tens} vào hàng Trăm`,
          demoValue: p1_tens * 100,
          column: null
        });
        currentValue = p1_tens * 100;
      }

      // Bước thứ hai của phần 1 (nếu có)
      if (p1_ones > 0) {
        const newValue = currentValue + p1_ones * 10;
        let inst = `${m0} × ${n1} = ${p1_ones} → Chục`;
        if (p1_ones >= 10) {
          const carry = Math.floor(p1_ones / 10);
          const rem = p1_ones % 10;
          inst = `${m0} × ${n1} = ${p1_ones}\n+${carry} Trăm, +${rem} Chục`;
        }
        inst += `\n\n✓ ${multiplicand} × ${n1}0 = ${newValue}`;

        steps.push({
          emoji: getStepEmoji(stepNumber++),
          title: `Tiếp: ${m0} × ${n1} = ${p1_ones}`,
          instruction: inst,
          demoValue: newValue,
          column: null
        });
        currentValue = newValue;
      } else if (p1_tens > 0) {
        steps[steps.length - 1].instruction += `\n\n✓ ${multiplicand} × ${n1}0 = ${currentValue}`;
      }

      partNum++;
    }

    // ===== PHẦN 2: multiplicand × n0 =====
    if (n0 > 0) {
      const p2_tens = m1 * n0;
      const p2_ones = m0 * n0;
      const isLastPart = true;

      // Bước đầu tiên của phần 2
      if (p2_tens > 0) {
        let inst = `${m1} × ${n0} = ${p2_tens} → Chục`;
        if (p2_tens >= 10) {
          const carry = Math.floor(p2_tens / 10);
          const rem = p2_tens % 10;
          inst = `${m1} × ${n0} = ${p2_tens}\n+${carry} Trăm, +${rem} Chục`;
        }

        steps.push({
          emoji: getStepEmoji(stepNumber++),
          title: `Phần ${partNum}: ${multiplicand} × ${n0}`,
          instruction: inst,
          demoValue: currentValue + p2_tens * 10,
          column: null
        });
        currentValue += p2_tens * 10;
      }

      // Bước cuối
      if (p2_ones > 0) {
        let inst = `${m0} × ${n0} = ${p2_ones} → Đơn vị`;
        if (p2_ones >= 10) {
          const carry = Math.floor(p2_ones / 10);
          const rem = p2_ones % 10;
          inst = `${m0} × ${n0} = ${p2_ones}\n+${carry} Chục, +${rem} Đơn vị`;
        }
        inst += `\n\n✅ ${multiplicand} × ${multiplier} = ${answer}`;

        const title = p2_tens > 0 ? `Tiếp: ${m0} × ${n0} = ${p2_ones}` : `Phần ${partNum}: ${multiplicand} × ${n0}`;
        steps.push({
          emoji: getStepEmoji(stepNumber++),
          title: title,
          instruction: inst,
          demoValue: answer,
          column: null
        });
      } else if (p2_tens > 0) {
        steps[steps.length - 1].instruction += `\n\n✅ ${multiplicand} × ${multiplier} = ${answer}`;
        steps[steps.length - 1].demoValue = answer;
      }
    } else {
      // n0 = 0, kết thúc ở phần 1
      steps[steps.length - 1].instruction += `\n\n✅ ${multiplicand} × ${multiplier} = ${answer}`;
      steps[steps.length - 1].demoValue = answer;
    }

    return steps;
  }

  // ========== PHƯƠNG PHÁP 5 & 6: NHÂN NHIỀU CHỮ SỐ ==========
  // Áp dụng cho: 2×3, 3×2, 3×3 chữ số
  // PHƯƠNG PHÁP SOROBAN: Chỉ tách SỐ NHÂN theo hàng, làm từ trái sang phải
  if ((multiplicandLength === 2 && multiplier >= 100 && multiplier <= 999) ||
      (multiplicandLength === 3 && multiplier >= 10 && multiplier <= 99) ||
      (multiplicandLength === 3 && multiplier >= 100 && multiplier <= 999)) {

    // Lấy các chữ số của số nhân
    const multiplierDigits = multiplier.toString().split('').map(Number);

    // Tính kết quả từng phần
    const parts = [];
    for (let i = 0; i < multiplierDigits.length; i++) {
      const digit = multiplierDigits[i];
      const placeValue = Math.pow(10, multiplierDigits.length - 1 - i);
      if (digit > 0) {
        parts.push({
          digit: digit,
          placeValue: placeValue,
          displayValue: digit * placeValue,
          result: multiplicand * digit * placeValue
        });
      }
    }

    // Bước 1: Tổng quan ngắn gọn
    const overviewParts = parts.map(p => `${multiplicand} × ${p.displayValue} = ${p.result}`).join('\n');
    steps.push({
      emoji: '📚',
      title: `${multiplicand} × ${multiplier} = ?`,
      instruction: `Tách số nhân ${multiplier}:\n${overviewParts}\n\nTổng = ${answer}`,
      demoValue: -1,
      column: null,
      skipCheck: true
    });

    currentValue = 0;

    // Xử lý từng phần
    for (let partIndex = 0; partIndex < parts.length; partIndex++) {
      const part = parts[partIndex];
      const isLastPart = partIndex === parts.length - 1;
      let subStepCount = 0;

      // Nhân từng chữ số của số bị nhân
      for (let i = 0; i < multiplicandDigits.length; i++) {
        const mDigit = multiplicandDigits[i];
        if (mDigit === 0) continue;

        const mPlaceValue = Math.pow(10, multiplicandLength - 1 - i);
        const product = mDigit * part.digit;
        const actualValue = product * mPlaceValue * part.placeValue;
        const isFirstSubStep = subStepCount === 0;

        // Đếm số bước con còn lại
        let remainingSubSteps = 0;
        for (let j = i + 1; j < multiplicandDigits.length; j++) {
          if (multiplicandDigits[j] !== 0) remainingSubSteps++;
        }
        const isLastSubStep = remainingSubSteps === 0;
        const isLastStep = isLastPart && isLastSubStep;

        // Tạo tiêu đề ngắn gọn
        let title;
        if (isFirstSubStep) {
          title = `Phần ${partIndex + 1}: ${multiplicand} × ${part.displayValue}`;
        } else {
          title = `${mDigit} × ${part.digit} = ${product}`;
        }

        // Tạo hướng dẫn ngắn gọn
        let inst = `${mDigit} × ${part.digit} = ${product}`;
        if (product >= 10) {
          const carry = Math.floor(product / 10);
          const rem = product % 10;
          inst += ` (+${carry}, +${rem})`;
        }

        // Thêm tổng phần hoặc kết quả cuối
        currentValue += actualValue;
        if (isLastStep) {
          inst += `\n\n✅ ${multiplicand} × ${multiplier} = ${answer}`;
        } else if (isLastSubStep) {
          inst += `\n\n✓ ${multiplicand} × ${part.displayValue} = ${part.result}`;
        }

        steps.push({
          emoji: getStepEmoji(stepNumber++),
          title: title,
          instruction: inst,
          demoValue: isLastStep ? answer : currentValue,
          column: null
        });

        subStepCount++;
      }
    }

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
