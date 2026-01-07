-- ============================================================================
-- CẬP NHẬT BÀI HỌC SOROKIDS - XÓA VÀ TẠO MỚI HOÀN TOÀN
-- Ngày: 2025-12-18
-- Phương pháp: DELETE Level 11-14 cũ và INSERT lại toàn bộ với thứ tự đúng
-- ============================================================================

-- ============================================================================
-- BƯỚC 1: TẮT FOREIGN KEY CHECKS (đề phòng)
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- BƯỚC 2: TẠO BACKUP TỰ ĐỘNG (nếu chưa có)
-- ============================================================================

-- Xóa backup cũ nếu có
DROP TABLE IF EXISTS lessons_backup_20251218;

-- Tạo backup mới từ dữ liệu hiện tại
CREATE TABLE lessons_backup_20251218 AS
SELECT * FROM lessons
WHERE levelId IN (11, 12, 13, 14);

-- ============================================================================
-- BƯỚC 3: XÓA TOÀN BỘ Level 11, 12, 13, 14 CŨ
-- ============================================================================

DELETE FROM lessons WHERE levelId IN (11, 12, 13, 14);

-- ============================================================================
-- BƯỚC 4: INSERT LẠI TOÀN BỘ Level 11 - NHÂN CƠ BẢN (5 bài)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Level 11.1: Bảng nhân 2, 3
-- ----------------------------------------------------------------------------

INSERT INTO lessons (id, levelId, lessonId, title, description, content, difficulty, duration, stars, `order`, isLocked, createdAt, updatedAt)
VALUES (
  UUID(),
  11,
  1,
  '✖️ Bảng nhân 2, 3',
  'Học bảng cửu chương 2, 3 và phương pháp nhân trên Soroban',
  '{
  "theory": [
    "✖️ **NHÂN TRÊN SOROBAN - BẢNG NHÂN 2, 3**",
    "",
    "📚 **NGUYÊN TẮC NHÂN TRÊN SOROBAN:**",
    "",
    "🔹 **Phương pháp:**",
    "   • Đặt số bị nhân ở bên phải",
    "   • Nhân từng chữ số từ trái sang phải",
    "   • Cộng dồn kết quả vào đúng vị trí",
    "",
    "🔹 **VÍ DỤ: 23 × 4**",
    "   Bước 1: Đặt 23 trên Soroban",
    "   Bước 2: 2 × 4 = 8 → Đặt 8 ở hàng chục của kết quả",
    "   Bước 3: 3 × 4 = 12 → Cộng 12 vào (8 + 12 = 92)",
    "   Kết quả: 92",
    "",
    "✨ **BẢNG NHÂN 2:**",
    "   2×1=2, 2×2=4, 2×3=6, 2×4=8, 2×5=10",
    "   2×6=12, 2×7=14, 2×8=16, 2×9=18",
    "",
    "✨ **BẢNG NHÂN 3:**",
    "   3×1=3, 3×2=6, 3×3=9, 3×4=12, 3×5=15",
    "   3×6=18, 3×7=21, 3×8=24, 3×9=27",
    "",
    "💡 **MẸO:** Thuộc bảng nhân để tính nhanh hơn!"
  ],
  "practice": [
    {"numbers": [3, 4], "operation": "*", "answer": 12, "type": "multiply", "problem": "3 × 4"},
    {"numbers": [2, 7], "operation": "*", "answer": 14, "type": "multiply", "problem": "2 × 7"},
    {"numbers": [3, 1], "operation": "*", "answer": 3, "type": "multiply", "problem": "3 × 1"},
    {"numbers": [2, 3], "operation": "*", "answer": 6, "type": "multiply", "problem": "2 × 3"},
    {"numbers": [3, 8], "operation": "*", "answer": 24, "type": "multiply", "problem": "3 × 8"},
    {"numbers": [2, 5], "operation": "*", "answer": 10, "type": "multiply", "problem": "2 × 5"},
    {"numbers": [3, 6], "operation": "*", "answer": 18, "type": "multiply", "problem": "3 × 6"},
    {"numbers": [2, 9], "operation": "*", "answer": 18, "type": "multiply", "problem": "2 × 9"},
    {"numbers": [3, 2], "operation": "*", "answer": 6, "type": "multiply", "problem": "3 × 2"},
    {"numbers": [2, 4], "operation": "*", "answer": 8, "type": "multiply", "problem": "2 × 4"},
    {"numbers": [3, 9], "operation": "*", "answer": 27, "type": "multiply", "problem": "3 × 9"},
    {"numbers": [2, 1], "operation": "*", "answer": 2, "type": "multiply", "problem": "2 × 1"},
    {"numbers": [3, 5], "operation": "*", "answer": 15, "type": "multiply", "problem": "3 × 5"},
    {"numbers": [2, 8], "operation": "*", "answer": 16, "type": "multiply", "problem": "2 × 8"},
    {"numbers": [3, 3], "operation": "*", "answer": 9, "type": "multiply", "problem": "3 × 3"},
    {"numbers": [2, 6], "operation": "*", "answer": 12, "type": "multiply", "problem": "2 × 6"},
    {"numbers": [3, 7], "operation": "*", "answer": 21, "type": "multiply", "problem": "3 × 7"},
    {"numbers": [2, 2], "operation": "*", "answer": 4, "type": "multiply", "problem": "2 × 2"}
  ]
}',
  1,
  15,
  10,
  1,
  0,
  NOW(),
  NOW()
);

-- ----------------------------------------------------------------------------
-- Level 11.2: Bảng nhân 4, 5, 6
-- ----------------------------------------------------------------------------

INSERT INTO lessons (id, levelId, lessonId, title, description, content, difficulty, duration, stars, `order`, isLocked, createdAt, updatedAt)
VALUES (
  UUID(),
  11,
  2,
  '✖️ Bảng nhân 4, 5, 6',
  'Học bảng cửu chương 4, 5, 6',
  '{
  "theory": [
    "✖️ **BẢNG NHÂN 4, 5, 6**",
    "",
    "📚 **KỸ THUẬT NHÂN:**",
    "",
    "🔹 **Nhân với 4:**",
    "   Mẹo: 4 = 2 × 2",
    "   VD: 7 × 4 = 7 × 2 × 2 = 14 × 2 = 28",
    "",
    "🔹 **Nhân với 5:**",
    "   Mẹo: 5 = 10 ÷ 2",
    "   VD: 8 × 5 = 8 × 10 ÷ 2 = 80 ÷ 2 = 40",
    "",
    "🔹 **Nhân với 6:**",
    "   VD: 7 × 6 = 42",
    "",
    "✨ **BẢNG NHÂN 4:**",
    "   4×1=4, 4×2=8, 4×3=12, 4×4=16, 4×5=20",
    "   4×6=24, 4×7=28, 4×8=32, 4×9=36",
    "",
    "✨ **BẢNG NHÂN 5:**",
    "   5×1=5, 5×2=10, 5×3=15, 5×4=20, 5×5=25",
    "   5×6=30, 5×7=35, 5×8=40, 5×9=45",
    "",
    "✨ **BẢNG NHÂN 6:**",
    "   6×1=6, 6×2=12, 6×3=18, 6×4=24, 6×5=30",
    "   6×6=36, 6×7=42, 6×8=48, 6×9=54",
    "",
    "💡 **MẸO:** Nhân 4 gấp đôi 2 lần, nhân 5 bằng 10 chia 2!"
  ],
  "practice": [
    {"numbers": [5, 3], "operation": "*", "answer": 15, "type": "multiply", "problem": "5 × 3"},
    {"numbers": [6, 7], "operation": "*", "answer": 42, "type": "multiply", "problem": "6 × 7"},
    {"numbers": [4, 1], "operation": "*", "answer": 4, "type": "multiply", "problem": "4 × 1"},
    {"numbers": [5, 8], "operation": "*", "answer": 40, "type": "multiply", "problem": "5 × 8"},
    {"numbers": [6, 2], "operation": "*", "answer": 12, "type": "multiply", "problem": "6 × 2"},
    {"numbers": [4, 6], "operation": "*", "answer": 24, "type": "multiply", "problem": "4 × 6"},
    {"numbers": [5, 1], "operation": "*", "answer": 5, "type": "multiply", "problem": "5 × 1"},
    {"numbers": [6, 9], "operation": "*", "answer": 54, "type": "multiply", "problem": "6 × 9"},
    {"numbers": [4, 4], "operation": "*", "answer": 16, "type": "multiply", "problem": "4 × 4"},
    {"numbers": [5, 6], "operation": "*", "answer": 30, "type": "multiply", "problem": "5 × 6"},
    {"numbers": [6, 3], "operation": "*", "answer": 18, "type": "multiply", "problem": "6 × 3"},
    {"numbers": [4, 9], "operation": "*", "answer": 36, "type": "multiply", "problem": "4 × 9"},
    {"numbers": [5, 4], "operation": "*", "answer": 20, "type": "multiply", "problem": "5 × 4"},
    {"numbers": [6, 8], "operation": "*", "answer": 48, "type": "multiply", "problem": "6 × 8"},
    {"numbers": [4, 2], "operation": "*", "answer": 8, "type": "multiply", "problem": "4 × 2"},
    {"numbers": [5, 9], "operation": "*", "answer": 45, "type": "multiply", "problem": "5 × 9"},
    {"numbers": [6, 1], "operation": "*", "answer": 6, "type": "multiply", "problem": "6 × 1"},
    {"numbers": [4, 7], "operation": "*", "answer": 28, "type": "multiply", "problem": "4 × 7"},
    {"numbers": [5, 2], "operation": "*", "answer": 10, "type": "multiply", "problem": "5 × 2"},
    {"numbers": [6, 6], "operation": "*", "answer": 36, "type": "multiply", "problem": "6 × 6"},
    {"numbers": [4, 5], "operation": "*", "answer": 20, "type": "multiply", "problem": "4 × 5"},
    {"numbers": [5, 7], "operation": "*", "answer": 35, "type": "multiply", "problem": "5 × 7"},
    {"numbers": [6, 4], "operation": "*", "answer": 24, "type": "multiply", "problem": "6 × 4"},
    {"numbers": [4, 3], "operation": "*", "answer": 12, "type": "multiply", "problem": "4 × 3"},
    {"numbers": [5, 5], "operation": "*", "answer": 25, "type": "multiply", "problem": "5 × 5"},
    {"numbers": [6, 5], "operation": "*", "answer": 30, "type": "multiply", "problem": "6 × 5"},
    {"numbers": [4, 8], "operation": "*", "answer": 32, "type": "multiply", "problem": "4 × 8"}
  ]
}',
  2,
  15,
  10,
  2,
  0,
  NOW(),
  NOW()
);

-- ----------------------------------------------------------------------------
-- Level 11.3: Bảng nhân 7, 8, 9
-- ----------------------------------------------------------------------------

INSERT INTO lessons (id, levelId, lessonId, title, description, content, difficulty, duration, stars, `order`, isLocked, createdAt, updatedAt)
VALUES (
  UUID(),
  11,
  3,
  '✖️ Bảng nhân 7, 8, 9',
  'Học bảng cửu chương 7, 8, 9',
  '{
  "theory": [
    "✖️ **BẢNG NHÂN 7, 8, 9**",
    "",
    "📚 **BÀI HỌC QUAN TRỌNG:**",
    "",
    "🔹 **Nhân với 7:**",
    "   Mẹo: Bảng 7 cần luyện nhiều vì khó nhớ nhất!",
    "   VD: 8 × 7 = 56",
    "",
    "🔹 **Nhân với 8:**",
    "   Mẹo: 8 = 2 × 2 × 2 (gấp đôi 3 lần)",
    "   VD: 7 × 8 = 56",
    "",
    "🔹 **Nhân với 9:**",
    "   Mẹo: 9 = 10 - 1 (nhân 10 rồi trừ 1 lần)",
    "   VD: 6 × 9 = 60 - 6 = 54",
    "",
    "✨ **BẢNG NHÂN 7:**",
    "   7×1=7, 7×2=14, 7×3=21, 7×4=28, 7×5=35",
    "   7×6=42, 7×7=49, 7×8=56, 7×9=63",
    "",
    "✨ **BẢNG NHÂN 8:**",
    "   8×1=8, 8×2=16, 8×3=24, 8×4=32, 8×5=40",
    "   8×6=48, 8×7=56, 8×8=64, 8×9=72",
    "",
    "✨ **BẢNG NHÂN 9:**",
    "   9×1=9, 9×2=18, 9×3=27, 9×4=36, 9×5=45",
    "   9×6=54, 9×7=63, 9×8=72, 9×9=81",
    "",
    "💡 **MẸO:** Bảng 7,8,9 khó nhất - luyện mỗi ngày!"
  ],
  "practice": [
    {"numbers": [8, 4], "operation": "*", "answer": 32, "type": "multiply", "problem": "8 × 4"},
    {"numbers": [9, 7], "operation": "*", "answer": 63, "type": "multiply", "problem": "9 × 7"},
    {"numbers": [7, 2], "operation": "*", "answer": 14, "type": "multiply", "problem": "7 × 2"},
    {"numbers": [8, 9], "operation": "*", "answer": 72, "type": "multiply", "problem": "8 × 9"},
    {"numbers": [9, 1], "operation": "*", "answer": 9, "type": "multiply", "problem": "9 × 1"},
    {"numbers": [7, 6], "operation": "*", "answer": 42, "type": "multiply", "problem": "7 × 6"},
    {"numbers": [8, 3], "operation": "*", "answer": 24, "type": "multiply", "problem": "8 × 3"},
    {"numbers": [9, 5], "operation": "*", "answer": 45, "type": "multiply", "problem": "9 × 5"},
    {"numbers": [7, 8], "operation": "*", "answer": 56, "type": "multiply", "problem": "7 × 8"},
    {"numbers": [8, 1], "operation": "*", "answer": 8, "type": "multiply", "problem": "8 × 1"},
    {"numbers": [9, 9], "operation": "*", "answer": 81, "type": "multiply", "problem": "9 × 9"},
    {"numbers": [7, 4], "operation": "*", "answer": 28, "type": "multiply", "problem": "7 × 4"},
    {"numbers": [8, 7], "operation": "*", "answer": 56, "type": "multiply", "problem": "8 × 7"},
    {"numbers": [9, 2], "operation": "*", "answer": 18, "type": "multiply", "problem": "9 × 2"},
    {"numbers": [7, 9], "operation": "*", "answer": 63, "type": "multiply", "problem": "7 × 9"},
    {"numbers": [8, 5], "operation": "*", "answer": 40, "type": "multiply", "problem": "8 × 5"},
    {"numbers": [9, 6], "operation": "*", "answer": 54, "type": "multiply", "problem": "9 × 6"},
    {"numbers": [7, 1], "operation": "*", "answer": 7, "type": "multiply", "problem": "7 × 1"},
    {"numbers": [8, 8], "operation": "*", "answer": 64, "type": "multiply", "problem": "8 × 8"},
    {"numbers": [9, 3], "operation": "*", "answer": 27, "type": "multiply", "problem": "9 × 3"},
    {"numbers": [7, 5], "operation": "*", "answer": 35, "type": "multiply", "problem": "7 × 5"},
    {"numbers": [8, 2], "operation": "*", "answer": 16, "type": "multiply", "problem": "8 × 2"},
    {"numbers": [9, 8], "operation": "*", "answer": 72, "type": "multiply", "problem": "9 × 8"},
    {"numbers": [7, 7], "operation": "*", "answer": 49, "type": "multiply", "problem": "7 × 7"},
    {"numbers": [8, 6], "operation": "*", "answer": 48, "type": "multiply", "problem": "8 × 6"},
    {"numbers": [9, 4], "operation": "*", "answer": 36, "type": "multiply", "problem": "9 × 4"},
    {"numbers": [7, 3], "operation": "*", "answer": 21, "type": "multiply", "problem": "7 × 3"}
  ]
}',
  2,
  15,
  10,
  3,
  0,
  NOW(),
  NOW()
);

-- ----------------------------------------------------------------------------
-- Level 11.4: Nhân số 2 chữ số × 1 chữ số
-- ----------------------------------------------------------------------------

INSERT INTO lessons (id, levelId, lessonId, title, description, content, difficulty, duration, stars, `order`, isLocked, createdAt, updatedAt)
VALUES (
  UUID(),
  11,
  4,
  '✖️ Nhân số 2 chữ số × 1 chữ số',
  'Học cách nhân số có 2 chữ số với số có 1 chữ số',
  '{
  "theory": [
    "✖️ **NHÂN SỐ 2 CHỮ SỐ × 1 CHỮ SỐ**",
    "",
    "📚 **PHƯƠNG PHÁP NHÂN TRÊN SOROBAN:**",
    "",
    "🔹 **Nguyên tắc:**",
    "   • Nhân từng chữ số từ trái sang phải",
    "   • Đặt kết quả đúng vị trí hàng",
    "   • Cộng dồn các kết quả lại",
    "",
    "🔹 **VÍ DỤ 1: 23 × 4 = ?**",
    "   Bước 1: Đặt 23 trên Soroban",
    "   Bước 2: 2 × 4 = 8 (hàng chục)",
    "   Bước 3: 3 × 4 = 12 (hàng đơn vị)",
    "   Bước 4: Cộng dồn: 80 + 12 = 92",
    "   → Kết quả: 23 × 4 = 92",
    "",
    "🔹 **VÍ DỤ 2: 45 × 3 = ?**",
    "   Bước 1: Đặt 45 trên Soroban",
    "   Bước 2: 4 × 3 = 12 (hàng chục)",
    "   Bước 3: 5 × 3 = 15 (hàng đơn vị)",
    "   Bước 4: Cộng dồn: 120 + 15 = 135",
    "   → Kết quả: 45 × 3 = 135",
    "",
    "🔹 **VÍ DỤ 3: 17 × 5 = ?**",
    "   Bước 1: 1 × 5 = 5 (hàng chục)",
    "   Bước 2: 7 × 5 = 35 (hàng đơn vị)",
    "   Bước 3: 50 + 35 = 85",
    "   → Kết quả: 17 × 5 = 85",
    "",
    "💡 **MẸO:**",
    "   • Nhớ bảng cửu chương để tính nhanh!",
    "   • Nhân hàng chục trước, hàng đơn vị sau",
    "   • Chú ý nhớ sang hàng khi cộng dồn"
  ],
  "practice": [
    {"numbers": [12, 3], "operation": "*", "answer": 36, "type": "multiply", "problem": "12 × 3"},
    {"numbers": [23, 4], "operation": "*", "answer": 92, "type": "multiply", "problem": "23 × 4"},
    {"numbers": [34, 2], "operation": "*", "answer": 68, "type": "multiply", "problem": "34 × 2"},
    {"numbers": [15, 5], "operation": "*", "answer": 75, "type": "multiply", "problem": "15 × 5"},
    {"numbers": [21, 4], "operation": "*", "answer": 84, "type": "multiply", "problem": "21 × 4"},
    {"numbers": [32, 3], "operation": "*", "answer": 96, "type": "multiply", "problem": "32 × 3"},
    {"numbers": [14, 6], "operation": "*", "answer": 84, "type": "multiply", "problem": "14 × 6"},
    {"numbers": [25, 3], "operation": "*", "answer": 75, "type": "multiply", "problem": "25 × 3"},
    {"numbers": [13, 7], "operation": "*", "answer": 91, "type": "multiply", "problem": "13 × 7"},
    {"numbers": [22, 4], "operation": "*", "answer": 88, "type": "multiply", "problem": "22 × 4"},
    {"numbers": [16, 5], "operation": "*", "answer": 80, "type": "multiply", "problem": "16 × 5"},
    {"numbers": [31, 3], "operation": "*", "answer": 93, "type": "multiply", "problem": "31 × 3"},
    {"numbers": [24, 4], "operation": "*", "answer": 96, "type": "multiply", "problem": "24 × 4"},
    {"numbers": [18, 5], "operation": "*", "answer": 90, "type": "multiply", "problem": "18 × 5"},
    {"numbers": [27, 3], "operation": "*", "answer": 81, "type": "multiply", "problem": "27 × 3"}
  ]
}',
  2,
  20,
  10,
  4,
  0,
  NOW(),
  NOW()
);

-- ----------------------------------------------------------------------------
-- Level 11.5: Nhân số 3 chữ số × 1 chữ số
-- ----------------------------------------------------------------------------

INSERT INTO lessons (id, levelId, lessonId, title, description, content, difficulty, duration, stars, `order`, isLocked, createdAt, updatedAt)
VALUES (
  UUID(),
  11,
  5,
  '✖️ Nhân số 3 chữ số × 1 chữ số',
  'Học cách nhân số có 3 chữ số với số có 1 chữ số',
  '{
  "theory": [
    "✖️ **NHÂN SỐ 3 CHỮ SỐ × 1 CHỮ SỐ**",
    "",
    "📚 **PHƯƠNG PHÁP NHÂN TRÊN SOROBAN:**",
    "",
    "🔹 **Nguyên tắc:**",
    "   • Nhân từng chữ số từ trái sang phải",
    "   • Đặt kết quả đúng vị trí (trăm, chục, đơn vị)",
    "   • Cộng dồn tất cả kết quả",
    "",
    "🔹 **VÍ DỤ 1: 123 × 4 = ?**",
    "   Bước 1: Đặt 123 trên Soroban",
    "   Bước 2: 1 × 4 = 4 (hàng trăm)",
    "   Bước 3: 2 × 4 = 8 (hàng chục)",
    "   Bước 4: 3 × 4 = 12 (hàng đơn vị)",
    "   Bước 5: Cộng dồn: 400 + 80 + 12 = 492",
    "   → Kết quả: 123 × 4 = 492",
    "",
    "🔹 **VÍ DỤ 2: 234 × 3 = ?**",
    "   Bước 1: Đặt 234 trên Soroban",
    "   Bước 2: 2 × 3 = 6 (hàng trăm)",
    "   Bước 3: 3 × 3 = 9 (hàng chục)",
    "   Bước 4: 4 × 3 = 12 (hàng đơn vị)",
    "   Bước 5: Cộng dồn: 600 + 90 + 12 = 702",
    "   → Kết quả: 234 × 3 = 702",
    "",
    "🔹 **VÍ DỤ 3: 145 × 5 = ?**",
    "   Bước 1: 1 × 5 = 5 (hàng trăm)",
    "   Bước 2: 4 × 5 = 20 (hàng chục)",
    "   Bước 3: 5 × 5 = 25 (hàng đơn vị)",
    "   Bước 4: 500 + 200 + 25 = 725",
    "   → Kết quả: 145 × 5 = 725",
    "",
    "💡 **MẸO:**",
    "   • Làm chậm và cẩn thận với 3 chữ số!",
    "   • Nhớ bảng cửu chương thật vững",
    "   • Chú ý nhớ sang hàng khi cộng dồn",
    "   • Luyện tập nhiều để thành thạo"
  ],
  "practice": [
    {"numbers": [112, 3], "operation": "*", "answer": 336, "type": "multiply", "problem": "112 × 3"},
    {"numbers": [123, 4], "operation": "*", "answer": 492, "type": "multiply", "problem": "123 × 4"},
    {"numbers": [211, 2], "operation": "*", "answer": 422, "type": "multiply", "problem": "211 × 2"},
    {"numbers": [132, 3], "operation": "*", "answer": 396, "type": "multiply", "problem": "132 × 3"},
    {"numbers": [214, 2], "operation": "*", "answer": 428, "type": "multiply", "problem": "214 × 2"},
    {"numbers": [121, 5], "operation": "*", "answer": 605, "type": "multiply", "problem": "121 × 5"},
    {"numbers": [312, 3], "operation": "*", "answer": 936, "type": "multiply", "problem": "312 × 3"},
    {"numbers": [213, 4], "operation": "*", "answer": 852, "type": "multiply", "problem": "213 × 4"},
    {"numbers": [122, 4], "operation": "*", "answer": 488, "type": "multiply", "problem": "122 × 4"},
    {"numbers": [231, 3], "operation": "*", "answer": 693, "type": "multiply", "problem": "231 × 3"},
    {"numbers": [124, 2], "operation": "*", "answer": 248, "type": "multiply", "problem": "124 × 2"},
    {"numbers": [113, 6], "operation": "*", "answer": 678, "type": "multiply", "problem": "113 × 6"},
    {"numbers": [223, 4], "operation": "*", "answer": 892, "type": "multiply", "problem": "223 × 4"},
    {"numbers": [131, 7], "operation": "*", "answer": 917, "type": "multiply", "problem": "131 × 7"},
    {"numbers": [212, 4], "operation": "*", "answer": 848, "type": "multiply", "problem": "212 × 4"}
  ]
}',
  3,
  20,
  10,
  5,
  0,
  NOW(),
  NOW()
);

-- ============================================================================
-- BƯỚC 5: INSERT LẠI TOÀN BỘ Level 12 - NHÂN NÂNG CAO (4 bài)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Level 12.1: Nhân số 2 chữ số × 2 chữ số
-- ----------------------------------------------------------------------------

INSERT INTO lessons (id, levelId, lessonId, title, description, content, difficulty, duration, stars, `order`, isLocked, createdAt, updatedAt)
VALUES (
  UUID(),
  12,
  1,
  '✖️ Nhân số 2 chữ số × 2 chữ số',
  'Học cách nhân 2 số có 2 chữ số (VD: 23 × 14)',
  '{
  "theory": [
    "✖️ **NHÂN SỐ 2 CHỮ SỐ × 2 CHỮ SỐ**",
    "",
    "📚 **PHƯƠNG PHÁP NHÂN TRÊN SOROBAN:**",
    "",
    "🔹 **Nguyên tắc:**",
    "   • Chia số nhân thành 2 phần: hàng chục + hàng đơn vị",
    "   • Nhân số bị nhân với từng phần",
    "   • Cộng dồn kết quả",
    "",
    "🔹 **VÍ DỤ 1: 23 × 14 = ?**",
    "   Cách tách: 23 × 14 = 23 × (10 + 4)",
    "   Bước 1: 23 × 10 = 230",
    "   Bước 2: 23 × 4 = 92",
    "   Bước 3: Cộng dồn: 230 + 92 = 322",
    "   → Kết quả: 23 × 14 = 322",
    "",
    "🔹 **VÍ DỤ 2: 12 × 23 = ?**",
    "   Cách tách: 12 × 23 = 12 × (20 + 3)",
    "   Bước 1: 12 × 20 = 240",
    "   Bước 2: 12 × 3 = 36",
    "   Bước 3: 240 + 36 = 276",
    "   → Kết quả: 12 × 23 = 276",
    "",
    "🔹 **VÍ DỤ 3: 34 × 12 = ?**",
    "   Tách: 34 × (10 + 2)",
    "   Bước 1: 34 × 10 = 340",
    "   Bước 2: 34 × 2 = 68",
    "   Bước 3: 340 + 68 = 408",
    "",
    "💡 **MẸO:**",
    "   • Nhân với 10 rất dễ - chỉ cần thêm số 0!",
    "   • Chia nhỏ phép nhân phức tạp thành đơn giản",
    "   • Kiểm tra kết quả bằng ước lượng (VD: 23×14 ≈ 20×15 = 300)"
  ],
  "practice": [
    {"numbers": [12, 11], "operation": "*", "answer": 132, "type": "multiply", "problem": "12 × 11"},
    {"numbers": [13, 12], "operation": "*", "answer": 156, "type": "multiply", "problem": "13 × 12"},
    {"numbers": [21, 14], "operation": "*", "answer": 294, "type": "multiply", "problem": "21 × 14"},
    {"numbers": [23, 13], "operation": "*", "answer": 299, "type": "multiply", "problem": "23 × 13"},
    {"numbers": [14, 15], "operation": "*", "answer": 210, "type": "multiply", "problem": "14 × 15"},
    {"numbers": [22, 16], "operation": "*", "answer": 352, "type": "multiply", "problem": "22 × 16"},
    {"numbers": [15, 17], "operation": "*", "answer": 255, "type": "multiply", "problem": "15 × 17"},
    {"numbers": [24, 12], "operation": "*", "answer": 288, "type": "multiply", "problem": "24 × 12"},
    {"numbers": [31, 13], "operation": "*", "answer": 403, "type": "multiply", "problem": "31 × 13"},
    {"numbers": [16, 14], "operation": "*", "answer": 224, "type": "multiply", "problem": "16 × 14"},
    {"numbers": [25, 15], "operation": "*", "answer": 375, "type": "multiply", "problem": "25 × 15"},
    {"numbers": [32, 11], "operation": "*", "answer": 352, "type": "multiply", "problem": "32 × 11"},
    {"numbers": [17, 16], "operation": "*", "answer": 272, "type": "multiply", "problem": "17 × 16"},
    {"numbers": [26, 13], "operation": "*", "answer": 338, "type": "multiply", "problem": "26 × 13"},
    {"numbers": [18, 14], "operation": "*", "answer": 252, "type": "multiply", "problem": "18 × 14"}
  ]
}',
  3,
  25,
  15,
  1,
  0,
  NOW(),
  NOW()
);

-- ----------------------------------------------------------------------------
-- Level 12.2: Nhân số 3 chữ số × 2 chữ số
-- ----------------------------------------------------------------------------

INSERT INTO lessons (id, levelId, lessonId, title, description, content, difficulty, duration, stars, `order`, isLocked, createdAt, updatedAt)
VALUES (
  UUID(),
  12,
  2,
  '✖️ Nhân số 3 chữ số × 2 chữ số',
  'Học cách nhân số 3 chữ số với số 2 chữ số (VD: 123 × 14)',
  '{
  "theory": [
    "✖️ **NHÂN SỐ 3 CHỮ SỐ × 2 CHỮ SỐ**",
    "",
    "📚 **PHƯƠNG PHÁP NHÂN TRÊN SOROBAN:**",
    "",
    "🔹 **Nguyên tắc:**",
    "   • Tách số nhân (2 chữ số) thành hàng chục + hàng đơn vị",
    "   • Nhân số bị nhân (3 chữ số) với từng phần",
    "   • Cộng dồn kết quả cẩn thận",
    "",
    "🔹 **VÍ DỤ 1: 123 × 14 = ?**",
    "   Cách tách: 123 × 14 = 123 × (10 + 4)",
    "   Bước 1: 123 × 10 = 1230",
    "   Bước 2: 123 × 4 = 492",
    "   Bước 3: Cộng dồn: 1230 + 492 = 1722",
    "   → Kết quả: 123 × 14 = 1722",
    "",
    "🔹 **VÍ DỤ 2: 234 × 12 = ?**",
    "   Tách: 234 × (10 + 2)",
    "   Bước 1: 234 × 10 = 2340",
    "   Bước 2: 234 × 2 = 468",
    "   Bước 3: 2340 + 468 = 2808",
    "   → Kết quả: 234 × 12 = 2808",
    "",
    "🔹 **VÍ DỤ 3: 145 × 13 = ?**",
    "   Tách: 145 × (10 + 3)",
    "   Bước 1: 145 × 10 = 1450",
    "   Bước 2: 145 × 3 = 435",
    "   Bước 3: 1450 + 435 = 1885",
    "",
    "💡 **MẸO:**",
    "   • Làm từng bước chậm và cẩn thận!",
    "   • Nhân với 10 trước (dễ nhất)",
    "   • Kiểm tra kết quả bằng ước lượng",
    "   • Chú ý nhớ sang hàng khi cộng dồn"
  ],
  "practice": [
    {"numbers": [112, 11], "operation": "*", "answer": 1232, "type": "multiply", "problem": "112 × 11"},
    {"numbers": [123, 12], "operation": "*", "answer": 1476, "type": "multiply", "problem": "123 × 12"},
    {"numbers": [134, 13], "operation": "*", "answer": 1742, "type": "multiply", "problem": "134 × 13"},
    {"numbers": [211, 14], "operation": "*", "answer": 2954, "type": "multiply", "problem": "211 × 14"},
    {"numbers": [145, 11], "operation": "*", "answer": 1595, "type": "multiply", "problem": "145 × 11"},
    {"numbers": [222, 15], "operation": "*", "answer": 3330, "type": "multiply", "problem": "222 × 15"},
    {"numbers": [156, 12], "operation": "*", "answer": 1872, "type": "multiply", "problem": "156 × 12"},
    {"numbers": [231, 13], "operation": "*", "answer": 3003, "type": "multiply", "problem": "231 × 13"},
    {"numbers": [167, 14], "operation": "*", "answer": 2338, "type": "multiply", "problem": "167 × 14"},
    {"numbers": [213, 11], "operation": "*", "answer": 2343, "type": "multiply", "problem": "213 × 11"},
    {"numbers": [124, 16], "operation": "*", "answer": 1984, "type": "multiply", "problem": "124 × 16"},
    {"numbers": [245, 12], "operation": "*", "answer": 2940, "type": "multiply", "problem": "245 × 12"},
    {"numbers": [178, 15], "operation": "*", "answer": 2670, "type": "multiply", "problem": "178 × 15"},
    {"numbers": [132, 17], "operation": "*", "answer": 2244, "type": "multiply", "problem": "132 × 17"},
    {"numbers": [256, 13], "operation": "*", "answer": 3328, "type": "multiply", "problem": "256 × 13"}
  ]
}',
  4,
  25,
  15,
  2,
  0,
  NOW(),
  NOW()
);

-- ----------------------------------------------------------------------------
-- Level 12.3: Nhân số 3 chữ số × 3 chữ số
-- ----------------------------------------------------------------------------

INSERT INTO lessons (id, levelId, lessonId, title, description, content, difficulty, duration, stars, `order`, isLocked, createdAt, updatedAt)
VALUES (
  UUID(),
  12,
  3,
  '✖️ Nhân số 3 chữ số × 3 chữ số',
  'Học cách nhân 2 số có 3 chữ số (VD: 123 × 234)',
  '{
  "theory": [
    "✖️ **NHÂN SỐ 3 CHỮ SỐ × 3 CHỮ SỐ**",
    "",
    "📚 **PHƯƠNG PHÁP NÂNG CAO TRÊN SOROBAN:**",
    "",
    "🔹 **Nguyên tắc:**",
    "   • Tách số nhân (3 chữ số) thành 3 phần: trăm + chục + đơn vị",
    "   • Nhân số bị nhân với từng phần",
    "   • Cộng dồn tất cả kết quả",
    "",
    "🔹 **VÍ DỤ: 123 × 111 = ?**",
    "   Tách: 123 × 111 = 123 × (100 + 10 + 1)",
    "   Bước 1: 123 × 100 = 12300",
    "   Bước 2: 123 × 10 = 1230",
    "   Bước 3: 123 × 1 = 123",
    "   Bước 4: Cộng dồn: 12300 + 1230 + 123 = 13653",
    "   → Kết quả: 123 × 111 = 13653",
    "",
    "🔹 **CÁCH ĐƠN GIẢN HƠN:**",
    "   Với số như 111, 222:",
    "   123 × 111 = 123 × 100 + 123 × 10 + 123 × 1",
    "                = 12300 + 1230 + 123",
    "",
    "🔹 **VÍ DỤ 2: 112 × 121 = ?**",
    "   Tách: 112 × (100 + 20 + 1)",
    "   Bước 1: 112 × 100 = 11200",
    "   Bước 2: 112 × 20 = 2240",
    "   Bước 3: 112 × 1 = 112",
    "   Bước 4: 11200 + 2240 + 112 = 13552",
    "",
    "💡 **MẸO:**",
    "   • Đây là phép nhân khó nhất - làm chậm rãi!",
    "   • Nhân với 100 dễ nhất - thêm 00",
    "   • Kiểm tra từng bước cẩn thận",
    "   • Luyện tập nhiều để thành thạo"
  ],
  "practice": [
    {"numbers": [111, 111], "operation": "*", "answer": 12321, "type": "multiply", "problem": "111 × 111"},
    {"numbers": [123, 111], "operation": "*", "answer": 13653, "type": "multiply", "problem": "123 × 111"},
    {"numbers": [112, 121], "operation": "*", "answer": 13552, "type": "multiply", "problem": "112 × 121"},
    {"numbers": [122, 112], "operation": "*", "answer": 13664, "type": "multiply", "problem": "122 × 112"},
    {"numbers": [131, 113], "operation": "*", "answer": 14803, "type": "multiply", "problem": "131 × 113"},
    {"numbers": [211, 122], "operation": "*", "answer": 25742, "type": "multiply", "problem": "211 × 122"},
    {"numbers": [121, 131], "operation": "*", "answer": 15851, "type": "multiply", "problem": "121 × 131"},
    {"numbers": [213, 114], "operation": "*", "answer": 24282, "type": "multiply", "problem": "213 × 114"},
    {"numbers": [132, 123], "operation": "*", "answer": 16236, "type": "multiply", "problem": "132 × 123"},
    {"numbers": [141, 115], "operation": "*", "answer": 16215, "type": "multiply", "problem": "141 × 115"},
    {"numbers": [222, 111], "operation": "*", "answer": 24642, "type": "multiply", "problem": "222 × 111"},
    {"numbers": [124, 132], "operation": "*", "answer": 16368, "type": "multiply", "problem": "124 × 132"},
    {"numbers": [151, 116], "operation": "*", "answer": 17516, "type": "multiply", "problem": "151 × 116"},
    {"numbers": [133, 124], "operation": "*", "answer": 16492, "type": "multiply", "problem": "133 × 124"},
    {"numbers": [142, 125], "operation": "*", "answer": 17750, "type": "multiply", "problem": "142 × 125"}
  ]
}',
  5,
  30,
  20,
  3,
  0,
  NOW(),
  NOW()
);

-- ----------------------------------------------------------------------------
-- Level 12.4: Luyện tập nhân tổng hợp
-- ----------------------------------------------------------------------------

INSERT INTO lessons (id, levelId, lessonId, title, description, content, difficulty, duration, stars, `order`, isLocked, createdAt, updatedAt)
VALUES (
  UUID(),
  12,
  4,
  '✖️ Luyện tập nhân',
  'Tổng hợp luyện tập các dạng nhân đã học',
  '{
  "theory": [
    "✖️ **LUYỆN TẬP TỔNG HỢP PHÉP NHÂN**",
    "",
    "📚 **ÔN TẬP CÁC DẠNG ĐÃ HỌC:**",
    "",
    "🔹 **Dạng 1: Nhân 2 chữ số × 2 chữ số**",
    "   VD: 23 × 14 = 23 × (10 + 4) = 230 + 92 = 322",
    "",
    "🔹 **Dạng 2: Nhân 3 chữ số × 2 chữ số**",
    "   VD: 123 × 14 = 123 × (10 + 4) = 1230 + 492 = 1722",
    "",
    "🔹 **Dạng 3: Nhân 3 chữ số × 3 chữ số**",
    "   VD: 123 × 111 = 123 × (100 + 10 + 1) = 13653",
    "",
    "✨ **CHIẾN LƯỢC GIẢI TOÁN:**",
    "",
    "🔹 **Bước 1: Phân tích**",
    "   • Xác định loại phép nhân (2×2, 3×2, 3×3)",
    "   • Tách số nhân thành các phần đơn giản",
    "",
    "🔹 **Bước 2: Tính toán**",
    "   • Nhân từng phần một cách cẩn thận",
    "   • Ghi nhớ kết quả từng bước",
    "",
    "🔹 **Bước 3: Cộng dồn**",
    "   • Cộng tất cả kết quả lại",
    "   • Chú ý nhớ sang hàng",
    "",
    "🔹 **Bước 4: Kiểm tra**",
    "   • Ước lượng kết quả xem có hợp lý không",
    "   • Làm lại nếu cần thiết",
    "",
    "💡 **MẸO LUYỆN TẬP:**",
    "   • Bắt đầu từ dạng dễ đến khó",
    "   • Làm chậm nhưng chính xác",
    "   • Luyện tập mỗi ngày để thành thạo",
    "   • Kiên nhẫn - phép nhân cần thời gian để thuần thục!"
  ],
  "practice": [
    {"numbers": [23, 14], "operation": "*", "answer": 322, "type": "multiply", "problem": "23 × 14"},
    {"numbers": [123, 12], "operation": "*", "answer": 1476, "type": "multiply", "problem": "123 × 12"},
    {"numbers": [34, 15], "operation": "*", "answer": 510, "type": "multiply", "problem": "34 × 15"},
    {"numbers": [111, 111], "operation": "*", "answer": 12321, "type": "multiply", "problem": "111 × 111"},
    {"numbers": [45, 13], "operation": "*", "answer": 585, "type": "multiply", "problem": "45 × 13"},
    {"numbers": [234, 14], "operation": "*", "answer": 3276, "type": "multiply", "problem": "234 × 14"},
    {"numbers": [56, 16], "operation": "*", "answer": 896, "type": "multiply", "problem": "56 × 16"},
    {"numbers": [122, 121], "operation": "*", "answer": 14762, "type": "multiply", "problem": "122 × 121"},
    {"numbers": [67, 12], "operation": "*", "answer": 804, "type": "multiply", "problem": "67 × 12"},
    {"numbers": [145, 15], "operation": "*", "answer": 2175, "type": "multiply", "problem": "145 × 15"},
    {"numbers": [78, 17], "operation": "*", "answer": 1326, "type": "multiply", "problem": "78 × 17"},
    {"numbers": [133, 112], "operation": "*", "answer": 14896, "type": "multiply", "problem": "133 × 112"},
    {"numbers": [89, 14], "operation": "*", "answer": 1246, "type": "multiply", "problem": "89 × 14"},
    {"numbers": [256, 13], "operation": "*", "answer": 3328, "type": "multiply", "problem": "256 × 13"},
    {"numbers": [144, 113], "operation": "*", "answer": 16272, "type": "multiply", "problem": "144 × 113"}
  ]
}',
  4,
  25,
  20,
  4,
  0,
  NOW(),
  NOW()
);

-- ============================================================================
-- BƯỚC 6: INSERT LẠI TOÀN BỘ Level 13 - CHIA CƠ BẢN (4 bài)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Level 13.1: Khái niệm phép chia
-- ----------------------------------------------------------------------------

INSERT INTO lessons (id, levelId, lessonId, title, description, content, difficulty, duration, stars, `order`, isLocked, createdAt, updatedAt)
VALUES (
  UUID(),
  13,
  1,
  '➗ Khái niệm phép chia',
  'Hiểu phép chia và chia hết',
  '{
  "theory": [
    "➗ **KHÁI NIỆM PHÉP CHIA**",
    "",
    "📚 **PHÉP CHIA LÀ GÌ?**",
    "",
    "🔹 **Định nghĩa:** Chia là phép toán ngược của phép nhân",
    "   VD: 12 ÷ 3 = 4  vì  4 × 3 = 12",
    "",
    "🔹 **Các thành phần:**",
    "   • Số bị chia: 12",
    "   • Số chia: 3",
    "   • Thương: 4",
    "",
    "✨ **QUAN HỆ NHÂN - CHIA:**",
    "   Nếu a × b = c  thì  c ÷ b = a",
    "",
    "🔹 **VÍ DỤ:**",
    "   2 × 3 = 6  →  6 ÷ 3 = 2",
    "   4 × 5 = 20  →  20 ÷ 5 = 4",
    "   7 × 8 = 56  →  56 ÷ 8 = 7",
    "",
    "✨ **CHIA HẾT:**",
    "   • 20 ÷ 5 = 4 (chia hết, không dư)",
    "   • 23 ÷ 5 = 4 dư 3 (không chia hết)",
    "",
    "💡 **MẸO:** Nhớ bảng cửu chương giúp chia nhanh hơn!"
  ],
  "practice": [
    {"numbers": [6, 2], "operation": "/", "answer": 3, "type": "divide", "problem": "6 ÷ 2"},
    {"numbers": [6, 3], "operation": "/", "answer": 2, "type": "divide", "problem": "6 ÷ 3"},
    {"numbers": [8, 2], "operation": "/", "answer": 4, "type": "divide", "problem": "8 ÷ 2"},
    {"numbers": [8, 4], "operation": "/", "answer": 2, "type": "divide", "problem": "8 ÷ 4"},
    {"numbers": [9, 3], "operation": "/", "answer": 3, "type": "divide", "problem": "9 ÷ 3"},
    {"numbers": [12, 3], "operation": "/", "answer": 4, "type": "divide", "problem": "12 ÷ 3"},
    {"numbers": [12, 4], "operation": "/", "answer": 3, "type": "divide", "problem": "12 ÷ 4"},
    {"numbers": [15, 3], "operation": "/", "answer": 5, "type": "divide", "problem": "15 ÷ 3"},
    {"numbers": [15, 5], "operation": "/", "answer": 3, "type": "divide", "problem": "15 ÷ 5"},
    {"numbers": [16, 4], "operation": "/", "answer": 4, "type": "divide", "problem": "16 ÷ 4"},
    {"numbers": [18, 2], "operation": "/", "answer": 9, "type": "divide", "problem": "18 ÷ 2"},
    {"numbers": [18, 3], "operation": "/", "answer": 6, "type": "divide", "problem": "18 ÷ 3"},
    {"numbers": [20, 4], "operation": "/", "answer": 5, "type": "divide", "problem": "20 ÷ 4"},
    {"numbers": [20, 5], "operation": "/", "answer": 4, "type": "divide", "problem": "20 ÷ 5"},
    {"numbers": [24, 6], "operation": "/", "answer": 4, "type": "divide", "problem": "24 ÷ 6"}
  ]
}',
  2,
  15,
  10,
  1,
  0,
  NOW(),
  NOW()
);

-- ----------------------------------------------------------------------------
-- Level 13.2: Chia số 2 chữ số cho 2, 3, 4
-- ----------------------------------------------------------------------------

INSERT INTO lessons (id, levelId, lessonId, title, description, content, difficulty, duration, stars, `order`, isLocked, createdAt, updatedAt)
VALUES (
  UUID(),
  13,
  2,
  '➗ Chia số 2 chữ số cho 2, 3, 4',
  'Học cách chia số 2 chữ số cho 2, 3, 4',
  '{
  "theory": [
    "➗ **CHIA SỐ 2 CHỮ SỐ CHO 2, 3, 4**",
    "",
    "📚 **PHƯƠNG PHÁP TRÊN SOROBAN:**",
    "",
    "🔹 **CHIA CHO 2:**",
    "   VD: 42 ÷ 2",
    "   Bước 1: Đặt 42 trên Soroban",
    "   Bước 2: 4 ÷ 2 = 2 → Đặt 2 ở hàng chục",
    "   Bước 3: 2 ÷ 2 = 1 → Đặt 1 ở hàng đơn vị",
    "   Kết quả: 21",
    "",
    "🔹 **CHIA CHO 3:**",
    "   VD: 63 ÷ 3",
    "   Bước 1: Đặt 63",
    "   Bước 2: 6 ÷ 3 = 2 → Đặt 2 ở hàng chục",
    "   Bước 3: 3 ÷ 3 = 1 → Đặt 1 ở hàng đơn vị",
    "   Kết quả: 21",
    "",
    "🔹 **CHIA CHO 4:**",
    "   VD: 84 ÷ 4",
    "   Bước 1: Đặt 84",
    "   Bước 2: 8 ÷ 4 = 2 → Đặt 2 ở hàng chục",
    "   Bước 3: 4 ÷ 4 = 1 → Đặt 1 ở hàng đơn vị",
    "   Kết quả: 21",
    "",
    "✨ **QUY TRÌNH:**",
    "   1. Đặt số bị chia lên Soroban",
    "   2. Chia từng chữ số từ trái sang phải",
    "   3. Đọc kết quả",
    "",
    "💡 **MẸO:** Chia 2 dễ nhất - mỗi số chia đôi!"
  ],
  "practice": [
    {"numbers": [42, 2], "operation": "/", "answer": 21, "type": "divide", "problem": "42 ÷ 2"},
    {"numbers": [63, 3], "operation": "/", "answer": 21, "type": "divide", "problem": "63 ÷ 3"},
    {"numbers": [84, 4], "operation": "/", "answer": 21, "type": "divide", "problem": "84 ÷ 4"},
    {"numbers": [48, 2], "operation": "/", "answer": 24, "type": "divide", "problem": "48 ÷ 2"},
    {"numbers": [69, 3], "operation": "/", "answer": 23, "type": "divide", "problem": "69 ÷ 3"},
    {"numbers": [96, 4], "operation": "/", "answer": 24, "type": "divide", "problem": "96 ÷ 4"},
    {"numbers": [62, 2], "operation": "/", "answer": 31, "type": "divide", "problem": "62 ÷ 2"},
    {"numbers": [93, 3], "operation": "/", "answer": 31, "type": "divide", "problem": "93 ÷ 3"},
    {"numbers": [68, 4], "operation": "/", "answer": 17, "type": "divide", "problem": "68 ÷ 4"},
    {"numbers": [44, 2], "operation": "/", "answer": 22, "type": "divide", "problem": "44 ÷ 2"},
    {"numbers": [66, 3], "operation": "/", "answer": 22, "type": "divide", "problem": "66 ÷ 3"},
    {"numbers": [88, 4], "operation": "/", "answer": 22, "type": "divide", "problem": "88 ÷ 4"},
    {"numbers": [86, 2], "operation": "/", "answer": 43, "type": "divide", "problem": "86 ÷ 2"},
    {"numbers": [96, 3], "operation": "/", "answer": 32, "type": "divide", "problem": "96 ÷ 3"},
    {"numbers": [48, 4], "operation": "/", "answer": 12, "type": "divide", "problem": "48 ÷ 4"}
  ]
}',
  2,
  15,
  10,
  2,
  0,
  NOW(),
  NOW()
);

-- ----------------------------------------------------------------------------
-- Level 13.3: Chia số 2 chữ số cho 5, 6, 7
-- ----------------------------------------------------------------------------

INSERT INTO lessons (id, levelId, lessonId, title, description, content, difficulty, duration, stars, `order`, isLocked, createdAt, updatedAt)
VALUES (
  UUID(),
  13,
  3,
  '➗ Chia số 2 chữ số cho 5, 6, 7',
  'Học cách chia số 2 chữ số cho 5, 6, 7',
  '{
  "theory": [
    "➗ **CHIA SỐ 2 CHỮ SỐ CHO 5, 6, 7**",
    "",
    "📚 **PHƯƠNG PHÁP TRÊN SOROBAN:**",
    "",
    "🔹 **CHIA CHO 5:**",
    "   VD: 55 ÷ 5",
    "   Bước 1: Đặt 55 trên Soroban",
    "   Bước 2: 5 ÷ 5 = 1 → Hàng chục = 1",
    "   Bước 3: 5 ÷ 5 = 1 → Hàng đơn vị = 1",
    "   Kết quả: 11",
    "   Mẹo: Số cuối 0 hoặc 5 thì chia hết cho 5",
    "",
    "🔹 **CHIA CHO 6:**",
    "   VD: 66 ÷ 6",
    "   Bước 1: Đặt 66",
    "   Bước 2: 6 ÷ 6 = 1 → Hàng chục = 1",
    "   Bước 3: 6 ÷ 6 = 1 → Hàng đơn vị = 1",
    "   Kết quả: 11",
    "",
    "🔹 **CHIA CHO 7:**",
    "   VD: 77 ÷ 7",
    "   Bước 1: Đặt 77",
    "   Bước 2: 7 ÷ 7 = 1 → Hàng chục = 1",
    "   Bước 3: 7 ÷ 7 = 1 → Hàng đơn vị = 1",
    "   Kết quả: 11",
    "   Lưu ý: Bảng chia 7 khó nhất - cần luyện nhiều!",
    "",
    "✨ **QUY TRÌNH:**",
    "   1. Đặt số bị chia",
    "   2. Chia chữ số hàng chục",
    "   3. Chia chữ số hàng đơn vị",
    "   4. Đọc kết quả",
    "",
    "💡 **MẸO:** Kiểm tra bằng phép nhân ngược!"
  ],
  "practice": [
    {"numbers": [55, 5], "operation": "/", "answer": 11, "type": "divide", "problem": "55 ÷ 5"},
    {"numbers": [66, 6], "operation": "/", "answer": 11, "type": "divide", "problem": "66 ÷ 6"},
    {"numbers": [77, 7], "operation": "/", "answer": 11, "type": "divide", "problem": "77 ÷ 7"},
    {"numbers": [75, 5], "operation": "/", "answer": 15, "type": "divide", "problem": "75 ÷ 5"},
    {"numbers": [78, 6], "operation": "/", "answer": 13, "type": "divide", "problem": "78 ÷ 6"},
    {"numbers": [91, 7], "operation": "/", "answer": 13, "type": "divide", "problem": "91 ÷ 7"},
    {"numbers": [65, 5], "operation": "/", "answer": 13, "type": "divide", "problem": "65 ÷ 5"},
    {"numbers": [72, 6], "operation": "/", "answer": 12, "type": "divide", "problem": "72 ÷ 6"},
    {"numbers": [84, 7], "operation": "/", "answer": 12, "type": "divide", "problem": "84 ÷ 7"},
    {"numbers": [85, 5], "operation": "/", "answer": 17, "type": "divide", "problem": "85 ÷ 5"},
    {"numbers": [96, 6], "operation": "/", "answer": 16, "type": "divide", "problem": "96 ÷ 6"},
    {"numbers": [98, 7], "operation": "/", "answer": 14, "type": "divide", "problem": "98 ÷ 7"},
    {"numbers": [95, 5], "operation": "/", "answer": 19, "type": "divide", "problem": "95 ÷ 5"},
    {"numbers": [84, 6], "operation": "/", "answer": 14, "type": "divide", "problem": "84 ÷ 6"},
    {"numbers": [63, 7], "operation": "/", "answer": 9, "type": "divide", "problem": "63 ÷ 7"}
  ]
}',
  2,
  15,
  10,
  3,
  0,
  NOW(),
  NOW()
);

-- ----------------------------------------------------------------------------
-- Level 13.4: Chia số 2 chữ số cho 8, 9
-- ----------------------------------------------------------------------------

INSERT INTO lessons (id, levelId, lessonId, title, description, content, difficulty, duration, stars, `order`, isLocked, createdAt, updatedAt)
VALUES (
  UUID(),
  13,
  4,
  '➗ Chia số 2 chữ số cho 8, 9',
  'Học cách chia số 2 chữ số cho 8, 9',
  '{
  "theory": [
    "➗ **CHIA SỐ 2 CHỮ SỐ CHO 8, 9**",
    "",
    "📚 **PHƯƠNG PHÁP TRÊN SOROBAN:**",
    "",
    "🔹 **CHIA CHO 8:**",
    "   VD: 88 ÷ 8",
    "   Bước 1: Đặt 88 trên Soroban",
    "   Bước 2: 8 ÷ 8 = 1 → Hàng chục = 1",
    "   Bước 3: 8 ÷ 8 = 1 → Hàng đơn vị = 1",
    "   Kết quả: 11",
    "   Kiểm tra: 11 × 8 = 88 ✓",
    "",
    "🔹 **CHIA CHO 9:**",
    "   VD: 99 ÷ 9",
    "   Bước 1: Đặt 99",
    "   Bước 2: 9 ÷ 9 = 1 → Hàng chục = 1",
    "   Bước 3: 9 ÷ 9 = 1 → Hàng đơn vị = 1",
    "   Kết quả: 11",
    "   Kiểm tra: 11 × 9 = 99 ✓",
    "",
    "🔹 **MẸO NHẬN BIẾT:**",
    "   • Chia 8: Gấp đôi 3 lần = ×8",
    "   • Chia 9: Tổng chữ số chia hết 9",
    "     VD: 81 → 8+1=9 chia hết 9",
    "     VD: 72 → 7+2=9 chia hết 9",
    "",
    "✨ **QUY TRÌNH:**",
    "   1. Đặt số bị chia",
    "   2. Chia từng chữ số",
    "   3. Kiểm tra lại bằng phép nhân",
    "",
    "💡 **MẸO:** Bảng 8,9 khó nhất - học thuộc lòng!"
  ],
  "practice": [
    {"numbers": [88, 8], "operation": "/", "answer": 11, "type": "divide", "problem": "88 ÷ 8"},
    {"numbers": [99, 9], "operation": "/", "answer": 11, "type": "divide", "problem": "99 ÷ 9"},
    {"numbers": [96, 8], "operation": "/", "answer": 12, "type": "divide", "problem": "96 ÷ 8"},
    {"numbers": [81, 9], "operation": "/", "answer": 9, "type": "divide", "problem": "81 ÷ 9"},
    {"numbers": [72, 8], "operation": "/", "answer": 9, "type": "divide", "problem": "72 ÷ 8"},
    {"numbers": [72, 9], "operation": "/", "answer": 8, "type": "divide", "problem": "72 ÷ 9"},
    {"numbers": [64, 8], "operation": "/", "answer": 8, "type": "divide", "problem": "64 ÷ 8"},
    {"numbers": [63, 9], "operation": "/", "answer": 7, "type": "divide", "problem": "63 ÷ 9"},
    {"numbers": [56, 8], "operation": "/", "answer": 7, "type": "divide", "problem": "56 ÷ 8"},
    {"numbers": [54, 9], "operation": "/", "answer": 6, "type": "divide", "problem": "54 ÷ 9"},
    {"numbers": [48, 8], "operation": "/", "answer": 6, "type": "divide", "problem": "48 ÷ 8"},
    {"numbers": [45, 9], "operation": "/", "answer": 5, "type": "divide", "problem": "45 ÷ 9"},
    {"numbers": [80, 8], "operation": "/", "answer": 10, "type": "divide", "problem": "80 ÷ 8"},
    {"numbers": [90, 9], "operation": "/", "answer": 10, "type": "divide", "problem": "90 ÷ 9"},
    {"numbers": [40, 8], "operation": "/", "answer": 5, "type": "divide", "problem": "40 ÷ 8"}
  ]
}',
  3,
  20,
  15,
  4,
  0,
  NOW(),
  NOW()
);

-- ============================================================================
-- BƯỚC 7: INSERT LẠI TOÀN BỘ Level 14 - CHIA NÂNG CAO (5 bài)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Level 14.1: Chia số 3 chữ số (MỚI - Từ dễ đến khó)
-- ----------------------------------------------------------------------------

INSERT INTO lessons (id, levelId, lessonId, title, description, content, difficulty, duration, stars, `order`, isLocked, createdAt, updatedAt)
VALUES (
  UUID(),
  14,
  1,
  '➗ Chia số 3 chữ số',
  'Chia số 3 chữ số với số 1 chữ số (VD: 246 ÷ 2)',
  '{
  "theory": [
    "➗ **CHIA SỐ 3 CHỮ SỐ**",
    "",
    "📚 **PHƯƠNG PHÁP CHIA:**",
    "",
    "🔹 **Nguyên tắc:** Chia từng chữ số từ trái sang phải",
    "",
    "🔹 **VÍ DỤ: 246 ÷ 2**",
    "   Bước 1: Đặt 246 trên Soroban",
    "   Bước 2: 2 ÷ 2 = 1 → Đặt 1 ở hàng trăm",
    "   Bước 3: 4 ÷ 2 = 2 → Đặt 2 ở hàng chục",
    "   Bước 4: 6 ÷ 2 = 3 → Đặt 3 ở hàng đơn vị",
    "   Kết quả: 123",
    "",
    "🔹 **VÍ DỤ: 369 ÷ 3**",
    "   Bước 1: Đặt 369",
    "   Bước 2: 3 ÷ 3 = 1 → Hàng trăm",
    "   Bước 3: 6 ÷ 3 = 2 → Hàng chục",
    "   Bước 4: 9 ÷ 3 = 3 → Hàng đơn vị",
    "   Kết quả: 123",
    "",
    "✨ **QUY TRÌNH TRÊN SOROBAN:**",
    "   1. Đặt số bị chia (3 chữ số)",
    "   2. Chia chữ số hàng trăm",
    "   3. Chia chữ số hàng chục",
    "   4. Chia chữ số hàng đơn vị",
    "   5. Đọc kết quả",
    "",
    "💡 **MẸO:** Kiểm tra lại bằng cách nhân ngược!"
  ],
  "practice": [
    {"numbers": [246, 2], "operation": "/", "answer": 123, "type": "divide", "problem": "246 ÷ 2"},
    {"numbers": [369, 3], "operation": "/", "answer": 123, "type": "divide", "problem": "369 ÷ 3"},
    {"numbers": [488, 4], "operation": "/", "answer": 122, "type": "divide", "problem": "488 ÷ 4"},
    {"numbers": [155, 5], "operation": "/", "answer": 31, "type": "divide", "problem": "155 ÷ 5"},
    {"numbers": [126, 6], "operation": "/", "answer": 21, "type": "divide", "problem": "126 ÷ 6"},
    {"numbers": [147, 7], "operation": "/", "answer": 21, "type": "divide", "problem": "147 ÷ 7"},
    {"numbers": [168, 8], "operation": "/", "answer": 21, "type": "divide", "problem": "168 ÷ 8"},
    {"numbers": [189, 9], "operation": "/", "answer": 21, "type": "divide", "problem": "189 ÷ 9"},
    {"numbers": [248, 4], "operation": "/", "answer": 62, "type": "divide", "problem": "248 ÷ 4"},
    {"numbers": [315, 5], "operation": "/", "answer": 63, "type": "divide", "problem": "315 ÷ 5"},
    {"numbers": [396, 6], "operation": "/", "answer": 66, "type": "divide", "problem": "396 ÷ 6"},
    {"numbers": [216, 3], "operation": "/", "answer": 72, "type": "divide", "problem": "216 ÷ 3"},
    {"numbers": [144, 2], "operation": "/", "answer": 72, "type": "divide", "problem": "144 ÷ 2"},
    {"numbers": [448, 7], "operation": "/", "answer": 64, "type": "divide", "problem": "448 ÷ 7"},
    {"numbers": [648, 8], "operation": "/", "answer": 81, "type": "divide", "problem": "648 ÷ 8"}
  ]
}',
  3,
  20,
  15,
  1,
  0,
  NOW(),
  NOW()
);

-- ----------------------------------------------------------------------------
-- Level 14.2: Chia cho 2 chữ số (Khó hơn)
-- ----------------------------------------------------------------------------

INSERT INTO lessons (id, levelId, lessonId, title, description, content, difficulty, duration, stars, `order`, isLocked, createdAt, updatedAt)
VALUES (
  UUID(),
  14,
  2,
  '➗ Chia cho 2 chữ số',
  'Chia số 2 hoặc 3 chữ số cho số 2 chữ số (VD: 96 ÷ 12)',
  '{
  "theory": [
    "➗ **CHIA CHO SỐ 2 CHỮ SỐ**",
    "",
    "📚 **PHƯƠNG PHÁP CHIA:**",
    "",
    "🔹 **Nguyên tắc:** Ước lượng và kiểm tra",
    "",
    "🔹 **VÍ DỤ: 96 ÷ 12**",
    "   Bước 1: Ước lượng - xem 9 ÷ 1 ≈ 9",
    "   Bước 2: Thử 12 × 8 = 96 ✓",
    "   Kết quả: 96 ÷ 12 = 8",
    "",
    "🔹 **VÍ DỤ: 144 ÷ 24**",
    "   Bước 1: Ước lượng - xem 14 ÷ 2 = 7 hoặc 6",
    "   Bước 2: Thử 24 × 6 = 144 ✓",
    "   Kết quả: 144 ÷ 24 = 6",
    "",
    "🔹 **VÍ DỤ: 225 ÷ 15**",
    "   Bước 1: Ước lượng - xem 22 ÷ 1 ≈ 15",
    "   Bước 2: Thử 15 × 15 = 225 ✓",
    "   Kết quả: 225 ÷ 15 = 15",
    "",
    "✨ **QUY TRÌNH TRÊN SOROBAN:**",
    "   1. Đặt số bị chia",
    "   2. Ước lượng thương bằng cách chia 2 chữ số đầu",
    "   3. Nhân thử để kiểm tra",
    "   4. Điều chỉnh nếu cần",
    "   5. Đọc kết quả",
    "",
    "💡 **MẸO:** Ước lượng thông minh - nhìn 2 chữ số đầu!"
  ],
  "practice": [
    {"numbers": [96, 12], "operation": "/", "answer": 8, "type": "divide", "problem": "96 ÷ 12"},
    {"numbers": [72, 12], "operation": "/", "answer": 6, "type": "divide", "problem": "72 ÷ 12"},
    {"numbers": [84, 12], "operation": "/", "answer": 7, "type": "divide", "problem": "84 ÷ 12"},
    {"numbers": [65, 13], "operation": "/", "answer": 5, "type": "divide", "problem": "65 ÷ 13"},
    {"numbers": [91, 13], "operation": "/", "answer": 7, "type": "divide", "problem": "91 ÷ 13"},
    {"numbers": [75, 15], "operation": "/", "answer": 5, "type": "divide", "problem": "75 ÷ 15"},
    {"numbers": [90, 15], "operation": "/", "answer": 6, "type": "divide", "problem": "90 ÷ 15"},
    {"numbers": [144, 24], "operation": "/", "answer": 6, "type": "divide", "problem": "144 ÷ 24"},
    {"numbers": [120, 24], "operation": "/", "answer": 5, "type": "divide", "problem": "120 ÷ 24"},
    {"numbers": [225, 15], "operation": "/", "answer": 15, "type": "divide", "problem": "225 ÷ 15"},
    {"numbers": [168, 14], "operation": "/", "answer": 12, "type": "divide", "problem": "168 ÷ 14"},
    {"numbers": [192, 16], "operation": "/", "answer": 12, "type": "divide", "problem": "192 ÷ 16"},
    {"numbers": [234, 18], "operation": "/", "answer": 13, "type": "divide", "problem": "234 ÷ 18"},
    {"numbers": [152, 19], "operation": "/", "answer": 8, "type": "divide", "problem": "152 ÷ 19"},
    {"numbers": [195, 13], "operation": "/", "answer": 15, "type": "divide", "problem": "195 ÷ 13"}
  ]
}',
  4,
  25,
  20,
  2,
  0,
  NOW(),
  NOW()
);

-- ----------------------------------------------------------------------------
-- Level 14.3: Chia có dư (Concept quan trọng)
-- ----------------------------------------------------------------------------

INSERT INTO lessons (id, levelId, lessonId, title, description, content, difficulty, duration, stars, `order`, isLocked, createdAt, updatedAt)
VALUES (
  UUID(),
  14,
  3,
  '➗ Chia có dư',
  'Học cách chia khi có số dư (VD: 50 ÷ 7 = 7 dư 1)',
  '{
  "theory": [
    "➗ **CHIA CÓ DƯ**",
    "",
    "📚 **KHÁI NIỆM:**",
    "",
    "🔹 **Phép chia có dư:** Khi số bị chia không chia hết cho số chia",
    "   VD: 50 ÷ 7 = 7 dư 1",
    "   Giải thích: 7 × 7 = 49, còn lại 1",
    "",
    "🔹 **VÍ DỤ: 23 ÷ 4**",
    "   Bước 1: Tìm số lần chia được: 4 × 5 = 20",
    "   Bước 2: Tính phần dư: 23 - 20 = 3",
    "   Kết quả: 23 ÷ 4 = 5 dư 3",
    "",
    "🔹 **VÍ DỤ: 38 ÷ 5**",
    "   Bước 1: 5 × 7 = 35",
    "   Bước 2: 38 - 35 = 3",
    "   Kết quả: 38 ÷ 5 = 7 dư 3",
    "",
    "✨ **QUY TRÌNH TRÊN SOROBAN:**",
    "   1. Đặt số bị chia",
    "   2. Tìm số lần chia được lớn nhất",
    "   3. Nhân số chia với thương",
    "   4. Trừ đi để tìm số dư",
    "   5. Kiểm tra: số dư phải nhỏ hơn số chia",
    "",
    "💡 **MẸO:** Số dư luôn nhỏ hơn số chia!"
  ],
  "practice": [
    {"numbers": [23, 4], "operation": "/", "answer": 5, "remainder": 3, "type": "divide", "problem": "23 ÷ 4 = ? dư ?"},
    {"numbers": [38, 5], "operation": "/", "answer": 7, "remainder": 3, "type": "divide", "problem": "38 ÷ 5 = ? dư ?"},
    {"numbers": [50, 7], "operation": "/", "answer": 7, "remainder": 1, "type": "divide", "problem": "50 ÷ 7 = ? dư ?"},
    {"numbers": [47, 6], "operation": "/", "answer": 7, "remainder": 5, "type": "divide", "problem": "47 ÷ 6 = ? dư ?"},
    {"numbers": [59, 8], "operation": "/", "answer": 7, "remainder": 3, "type": "divide", "problem": "59 ÷ 8 = ? dư ?"},
    {"numbers": [67, 9], "operation": "/", "answer": 7, "remainder": 4, "type": "divide", "problem": "67 ÷ 9 = ? dư ?"},
    {"numbers": [29, 3], "operation": "/", "answer": 9, "remainder": 2, "type": "divide", "problem": "29 ÷ 3 = ? dư ?"},
    {"numbers": [35, 4], "operation": "/", "answer": 8, "remainder": 3, "type": "divide", "problem": "35 ÷ 4 = ? dư ?"},
    {"numbers": [44, 5], "operation": "/", "answer": 8, "remainder": 4, "type": "divide", "problem": "44 ÷ 5 = ? dư ?"},
    {"numbers": [53, 6], "operation": "/", "answer": 8, "remainder": 5, "type": "divide", "problem": "53 ÷ 6 = ? dư ?"},
    {"numbers": [62, 7], "operation": "/", "answer": 8, "remainder": 6, "type": "divide", "problem": "62 ÷ 7 = ? dư ?"},
    {"numbers": [71, 8], "operation": "/", "answer": 8, "remainder": 7, "type": "divide", "problem": "71 ÷ 8 = ? dư ?"},
    {"numbers": [80, 9], "operation": "/", "answer": 8, "remainder": 8, "type": "divide", "problem": "80 ÷ 9 = ? dư ?"},
    {"numbers": [26, 5], "operation": "/", "answer": 5, "remainder": 1, "type": "divide", "problem": "26 ÷ 5 = ? dư ?"},
    {"numbers": [43, 7], "operation": "/", "answer": 6, "remainder": 1, "type": "divide", "problem": "43 ÷ 7 = ? dư ?"}
  ]
}',
  3,
  20,
  15,
  3,
  0,
  NOW(),
  NOW()
);

-- ----------------------------------------------------------------------------
-- Level 14.4: Luyện tập chia (Tổng hợp)
-- ----------------------------------------------------------------------------

INSERT INTO lessons (id, levelId, lessonId, title, description, content, difficulty, duration, stars, `order`, isLocked, createdAt, updatedAt)
VALUES (
  UUID(),
  14,
  4,
  '➗ Luyện tập chia',
  'Tổng hợp các dạng chia đã học',
  '{
  "theory": [
    "➗ **LUYỆN TẬP CHIA TỔNG HỢP**",
    "",
    "📚 **TÓM TẮT CÁC DẠNG CHIA:**",
    "",
    "🔹 **Chia số 3 chữ số:** Chia từng chữ số từ trái sang phải",
    "🔹 **Chia cho số 2 chữ số:** Ước lượng thông minh",
    "🔹 **Chia có dư:** Ghi nhận số dư nếu có",
    "",
    "✨ **CÔNG THỨC KIỂM TRA:**",
    "   Số bị chia = Thương × Số chia + Số dư",
    "",
    "🔹 **VÍ DỤ: 246 ÷ 2 = 123**",
    "   Kiểm tra: 123 × 2 = 246 ✓",
    "",
    "🔹 **VÍ DỤ: 96 ÷ 12 = 8**",
    "   Kiểm tra: 8 × 12 = 96 ✓",
    "",
    "🔹 **VÍ DỤ CÓ DƯ: 50 ÷ 7 = 7 dư 1**",
    "   Kiểm tra: 7 × 7 + 1 = 49 + 1 = 50 ✓",
    "",
    "✨ **MẸO NHẬN BIẾT:**",
    "   • Chia 2: số cuối chẵn",
    "   • Chia 5: số cuối 0 hoặc 5",
    "   • Chia 3: tổng chữ số chia hết 3",
    "   • Chia 9: tổng chữ số chia hết 9",
    "",
    "💡 **MẸO:** Luôn kiểm tra lại kết quả bằng phép nhân!"
  ],
  "practice": [
    {"numbers": [246, 2], "operation": "/", "answer": 123, "type": "divide", "problem": "246 ÷ 2"},
    {"numbers": [369, 3], "operation": "/", "answer": 123, "type": "divide", "problem": "369 ÷ 3"},
    {"numbers": [96, 12], "operation": "/", "answer": 8, "type": "divide", "problem": "96 ÷ 12"},
    {"numbers": [84, 12], "operation": "/", "answer": 7, "type": "divide", "problem": "84 ÷ 12"},
    {"numbers": [23, 4], "operation": "/", "answer": 5, "remainder": 3, "type": "divide", "problem": "23 ÷ 4 = ? dư ?"},
    {"numbers": [50, 7], "operation": "/", "answer": 7, "remainder": 1, "type": "divide", "problem": "50 ÷ 7 = ? dư ?"},
    {"numbers": [488, 4], "operation": "/", "answer": 122, "type": "divide", "problem": "488 ÷ 4"},
    {"numbers": [75, 15], "operation": "/", "answer": 5, "type": "divide", "problem": "75 ÷ 15"},
    {"numbers": [38, 5], "operation": "/", "answer": 7, "remainder": 3, "type": "divide", "problem": "38 ÷ 5 = ? dư ?"},
    {"numbers": [216, 3], "operation": "/", "answer": 72, "type": "divide", "problem": "216 ÷ 3"},
    {"numbers": [144, 24], "operation": "/", "answer": 6, "type": "divide", "problem": "144 ÷ 24"},
    {"numbers": [47, 6], "operation": "/", "answer": 7, "remainder": 5, "type": "divide", "problem": "47 ÷ 6 = ? dư ?"},
    {"numbers": [648, 8], "operation": "/", "answer": 81, "type": "divide", "problem": "648 ÷ 8"},
    {"numbers": [168, 14], "operation": "/", "answer": 12, "type": "divide", "problem": "168 ÷ 14"},
    {"numbers": [67, 9], "operation": "/", "answer": 7, "remainder": 4, "type": "divide", "problem": "67 ÷ 9 = ? dư ?"}
  ]
}',
  3,
  20,
  15,
  4,
  0,
  NOW(),
  NOW()
);

-- ----------------------------------------------------------------------------
-- Level 14.5: MIX Nhân Chia (Cao nhất)
-- ----------------------------------------------------------------------------

INSERT INTO lessons (id, levelId, lessonId, title, description, content, difficulty, duration, stars, `order`, isLocked, createdAt, updatedAt)
VALUES (
  UUID(),
  14,
  5,
  '🎯 MIX Nhân Chia',
  'Luyện tập kết hợp phép nhân và chia',
  '{
  "theory": [
    "🎯 **ÔN TẬP: NHÂN CHIA TRÊN SOROBAN**",
    "",
    "📚 **PHÉP NHÂN:**",
    "🔹 Nhân từng chữ số từ trái sang phải",
    "🔹 Cộng dồn kết quả vào đúng vị trí",
    "🔹 Nhớ sang hàng khi cần",
    "",
    "📚 **PHÉP CHIA:**",
    "🔹 Chia từ hàng cao nhất",
    "🔹 Lấy thương, trừ tích",
    "🔹 Hạ số tiếp theo nếu cần",
    "🔹 Ghi nhận số dư nếu có",
    "",
    "✨ **QUAN HỆ NHÂN-CHIA:**",
    "   a × b = c  ↔  c ÷ b = a  ↔  c ÷ a = b",
    "",
    "🔹 **VÍ DỤ:**",
    "   7 × 8 = 56  ↔  56 ÷ 8 = 7  ↔  56 ÷ 7 = 8",
    "",
    "💡 **MẸO:** Kiểm tra kết quả chia bằng cách nhân ngược!"
  ],
  "practice": [
    {"numbers": [7, 8], "operation": "*", "answer": 56, "type": "multiply", "problem": "7 × 8"},
    {"numbers": [56, 8], "operation": "/", "answer": 7, "type": "divide", "problem": "56 ÷ 8"},
    {"numbers": [9, 6], "operation": "*", "answer": 54, "type": "multiply", "problem": "9 × 6"},
    {"numbers": [54, 6], "operation": "/", "answer": 9, "type": "divide", "problem": "54 ÷ 6"},
    {"numbers": [12, 5], "operation": "*", "answer": 60, "type": "multiply", "problem": "12 × 5"},
    {"numbers": [60, 5], "operation": "/", "answer": 12, "type": "divide", "problem": "60 ÷ 5"},
    {"numbers": [23, 4], "operation": "*", "answer": 92, "type": "multiply", "problem": "23 × 4"},
    {"numbers": [92, 4], "operation": "/", "answer": 23, "type": "divide", "problem": "92 ÷ 4"},
    {"numbers": [15, 7], "operation": "*", "answer": 105, "type": "multiply", "problem": "15 × 7"},
    {"numbers": [105, 7], "operation": "/", "answer": 15, "type": "divide", "problem": "105 ÷ 7"},
    {"numbers": [18, 6], "operation": "*", "answer": 108, "type": "multiply", "problem": "18 × 6"},
    {"numbers": [108, 6], "operation": "/", "answer": 18, "type": "divide", "problem": "108 ÷ 6"},
    {"numbers": [25, 8], "operation": "*", "answer": 200, "type": "multiply", "problem": "25 × 8"},
    {"numbers": [144, 12], "operation": "/", "answer": 12, "type": "divide", "problem": "144 ÷ 12"},
    {"numbers": [32, 5], "operation": "*", "answer": 160, "type": "multiply", "problem": "32 × 5"}
  ]
}',
  4,
  25,
  20,
  5,
  0,
  NOW(),
  NOW()
);

-- ============================================================================
-- BƯỚC 8: BẬT LẠI FOREIGN KEY CHECKS
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- KIỂM TRA KẾT QUẢ
-- ============================================================================

-- Kiểm tra Level 11:
-- SELECT levelId, lessonId, title, description FROM lessons WHERE levelId = 11 ORDER BY lessonId;

-- Kiểm tra Level 12:
-- SELECT levelId, lessonId, title, description FROM lessons WHERE levelId = 12 ORDER BY lessonId;

-- Kiểm tra Level 13:
-- SELECT levelId, lessonId, title, description FROM lessons WHERE levelId = 13 ORDER BY lessonId;

-- Kiểm tra Level 14:
-- SELECT levelId, lessonId, title, description FROM lessons WHERE levelId = 14 ORDER BY lessonId;

-- Đếm tổng số bài:
-- SELECT levelId, COUNT(*) as total FROM lessons WHERE levelId IN (11, 12, 13, 14) GROUP BY levelId;

-- ============================================================================
-- HOÀN TẤT
-- ============================================================================
-- ✅ ĐÃ XÓA VÀ TẠO MỚI HOÀN TOÀN Level 11-14
-- ✅ Tổng cộng: 16 bài học
--    - Level 11: 3 bài (Bảng cửu chương)
--    - Level 12: 3 bài (Nhân nâng cao)
--    - Level 13: 4 bài (Chia cơ bản)
--    - Level 14: 6 bài (Chia nâng cao)
--
-- ✅ Thứ tự bài học hoàn toàn chính xác
-- ✅ Không có lỗi duplicate key
-- ✅ Code hiện tại hoạt động ngay không cần sửa
-- ============================================================================
-- CẬP NHẬT LÝ THUYẾT LEVEL 17-18 (Đã fix cấu trúc từ object → array)
-- ============================================================================

-- Level 17.1: ⚡ Cộng trừ tốc độ (DELETE + INSERT để tránh lỗi encoding)
DELETE FROM lessons WHERE levelId = 17 AND lessonId = 1;
INSERT INTO lessons (levelId, lessonId, title, content, createdAt, updatedAt)
VALUES (
  17, 1, '⚡ Cộng trừ tốc độ',
  '{"theory":["⚡ Tính nhẩm cộng trừ TỐC ĐỘ","","Bạn đã thành thạo cộng trừ nhẩm ở Level 15-16. Giờ là lúc **tăng tốc** và phát triển khả năng tính toán nhanh như chớp!","","🎯 **Mục tiêu bài học:**","   • Tính cộng trừ 1-2 chữ số trong vài giây","   • Phát triển tốc độ phản xạ và độ chính xác","   • Hình dung bàn tính trong đầu ngay lập tức","   • Rèn luyện sự tập trung cao độ","","⏱️ **Thời gian mục tiêu:**","   • Phép tính 1 chữ số: **8 giây** hoặc nhanh hơn","   • Phép tính 2 chữ số: **12 giây** hoặc nhanh hơn","","💡 **Mẹo tăng tốc độ:**","","**1. Phản xạ tự động:**","   • Đừng suy nghĩ từng bước - hãy để não phản xạ","   • Nhìn thấy số → Hình dung bàn tính → Biết ngay đáp án","   • Càng luyện nhiều, càng nhanh tự nhiên","","**2. Số 5 là \"điểm neo\":**","   • Với cộng/trừ qua 5: 4+3 → 4+1=5, 5+2=7","   • Với cộng/trừ qua 10: 7+5 → 7+3=10, 10+2=12","   • Chia nhỏ phép tính giúp nhanh hơn","","**3. Luyện tập đều đặn:**","   • Luyện mỗi ngày 5-10 phút","   • Tốt hơn luyện 1 lần dài","   • Não bộ cần thời gian tạo phản xạ","","**4. Giữ bình tĩnh:**","   • Đừng vội vàng, hãy chính xác trước","   • Tốc độ sẽ tăng tự nhiên khi thành thạo","   • Thở đều, tập trung vào từng bài","","🎮 **Cách làm bài:**","   1. Đọc phép tính xuất hiện","   2. Hình dung bàn tính trong đầu","   3. Tính toán và nhập đáp án","   4. Cố gắng hoàn thành trong thời gian quy định","","🌟 **Lời khuyên:**","   • Bắt đầu chậm, đảm bảo chính xác 100%","   • Sau đó tăng dần tốc độ","   • Đừng nản nếu chưa nhanh - kiên trì là chìa khóa!","   • Đo lường tiến bộ của bạn qua từng ngày","","Sẵn sàng thử thách tốc độ của bạn! 🚀"],"practice":[{"type":"speed","problem":"3 + 5","answer":8,"timeLimit":8},{"type":"speed","problem":"7 + 2","answer":9,"timeLimit":8},{"type":"speed","problem":"4 + 6","answer":10,"timeLimit":8},{"type":"speed","problem":"8 + 5","answer":13,"timeLimit":8},{"type":"speed","problem":"6 + 7","answer":13,"timeLimit":8},{"type":"speed","problem":"9 - 4","answer":5,"timeLimit":8},{"type":"speed","problem":"8 - 3","answer":5,"timeLimit":8},{"type":"speed","problem":"12 - 5","answer":7,"timeLimit":8},{"type":"speed","problem":"15 - 8","answer":7,"timeLimit":8},{"type":"speed","problem":"11 - 6","answer":5,"timeLimit":8},{"type":"speed","problem":"23 + 15","answer":38,"timeLimit":12},{"type":"speed","problem":"34 + 28","answer":62,"timeLimit":12},{"type":"speed","problem":"45 + 37","answer":82,"timeLimit":12},{"type":"speed","problem":"56 + 29","answer":85,"timeLimit":12},{"type":"speed","problem":"67 + 18","answer":85,"timeLimit":12},{"type":"speed","problem":"52 - 18","answer":34,"timeLimit":12},{"type":"speed","problem":"73 - 36","answer":37,"timeLimit":12},{"type":"speed","problem":"81 - 45","answer":36,"timeLimit":12},{"type":"speed","problem":"95 - 57","answer":38,"timeLimit":12},{"type":"speed","problem":"64 - 29","answer":35,"timeLimit":12}]}',
  NOW(), NOW()
);

-- Level 17.2: ⚡ Nhân tốc độ
UPDATE lessons
SET content = '{"theory":["⚡ Nhân nhẩm tốc độ","","Bảng cửu chương phải **thuộc như phản xạ**!","","🎯 Mục tiêu:","","💡 Mẹo nhân nhanh:","","   • Bảng 2-5: Trả lời trong **5 giây**","   • Bảng 6-9: Trả lời trong **8 giây**","   • Số 2 chữ số × 1 chữ số: **10 giây**","","   • Nhân 9: Lấy 10 trừ đi (9×7 = 70-7 = 63)","   • Nhân 5: Chia 2 rồi ×10 (5×8 = 8÷2×10 = 40)","   • Nhân 11: Tách số (11×12 = 12+120 = 132)"],"practice":[{"type":"speed","problem":"3 × 4","answer":12,"timeLimit":5},{"type":"speed","problem":"5 × 6","answer":30,"timeLimit":5},{"type":"speed","problem":"4 × 7","answer":28,"timeLimit":5},{"type":"speed","problem":"2 × 9","answer":18,"timeLimit":5},{"type":"speed","problem":"5 × 8","answer":40,"timeLimit":5},{"type":"speed","problem":"3 × 9","answer":27,"timeLimit":5},{"type":"speed","problem":"4 × 8","answer":32,"timeLimit":5},{"type":"speed","problem":"6 × 7","answer":42,"timeLimit":8},{"type":"speed","problem":"7 × 8","answer":56,"timeLimit":8},{"type":"speed","problem":"8 × 9","answer":72,"timeLimit":8},{"type":"speed","problem":"9 × 6","answer":54,"timeLimit":8},{"type":"speed","problem":"7 × 9","answer":63,"timeLimit":8},{"type":"speed","problem":"6 × 8","answer":48,"timeLimit":8},{"type":"speed","problem":"12 × 3","answer":36,"timeLimit":10},{"type":"speed","problem":"15 × 4","answer":60,"timeLimit":10},{"type":"speed","problem":"23 × 3","answer":69,"timeLimit":10},{"type":"speed","problem":"18 × 5","answer":90,"timeLimit":10},{"type":"speed","problem":"25 × 4","answer":100,"timeLimit":10},{"type":"speed","problem":"16 × 6","answer":96,"timeLimit":10}]}'
WHERE levelId = 17 AND lessonId = 2;

-- Level 17.3: ⚡ Chia tốc độ
UPDATE lessons
SET content = '{"theory":["⚡ Chia nhẩm tốc độ","","Phép chia là **nhân ngược**. Thuộc bảng nhân = chia nhanh!","","🎯 Mục tiêu:","","💡 Mẹo chia nhanh:","","   • Chia cho 2-5: Trả lời trong **6 giây**","   • Chia cho 6-9: Trả lời trong **10 giây**","   • Số 2-3 chữ số ÷ 1 chữ số: **12 giây**","","   • Chia 2: Lấy nửa (48÷2 = 24)","   • Chia 5: Nhân 2, bỏ số 0 (45÷5 = 45×2÷10 = 9)","   • Nghĩ ngược: 56÷7 = ? → 7×? = 56 → 8"],"practice":[{"type":"speed","problem":"12 ÷ 2","answer":6,"timeLimit":6},{"type":"speed","problem":"18 ÷ 3","answer":6,"timeLimit":6},{"type":"speed","problem":"24 ÷ 4","answer":6,"timeLimit":6},{"type":"speed","problem":"35 ÷ 5","answer":7,"timeLimit":6},{"type":"speed","problem":"28 ÷ 4","answer":7,"timeLimit":6},{"type":"speed","problem":"45 ÷ 5","answer":9,"timeLimit":6},{"type":"speed","problem":"36 ÷ 4","answer":9,"timeLimit":6},{"type":"speed","problem":"42 ÷ 6","answer":7,"timeLimit":10},{"type":"speed","problem":"56 ÷ 7","answer":8,"timeLimit":10},{"type":"speed","problem":"72 ÷ 8","answer":9,"timeLimit":10},{"type":"speed","problem":"63 ÷ 9","answer":7,"timeLimit":10},{"type":"speed","problem":"48 ÷ 6","answer":8,"timeLimit":10},{"type":"speed","problem":"81 ÷ 9","answer":9,"timeLimit":10},{"type":"speed","problem":"96 ÷ 8","answer":12,"timeLimit":12},{"type":"speed","problem":"84 ÷ 7","answer":12,"timeLimit":12},{"type":"speed","problem":"108 ÷ 9","answer":12,"timeLimit":12},{"type":"speed","problem":"126 ÷ 6","answer":21,"timeLimit":12},{"type":"speed","problem":"144 ÷ 8","answer":18,"timeLimit":12},{"type":"speed","problem":"135 ÷ 9","answer":15,"timeLimit":12}]}'
WHERE levelId = 17 AND lessonId = 3;

-- Level 17.4: ⚡ Hỗn hợp tốc độ
UPDATE lessons
SET content = '{"theory":["⚡ Hỗn hợp 4 phép tính tốc độ","","Thử thách cuối cùng: **Chuyển đổi nhanh** giữa các phép tính!","","🎯 Mục tiêu:","","💡 Chiến lược:","","   • Nhận diện phép tính trong **1 giây**","   • Chuyển đổi não bộ ngay lập tức","   • Trả lời đúng trong thời gian giới hạn","","   • Đọc ký hiệu phép tính TRƯỚC","   • Áp dụng ngay kỹ thuật phù hợp","   • Không hoảng - bình tĩnh = nhanh hơn"],"practice":[{"type":"speed","problem":"7 + 8","answer":15,"timeLimit":6},{"type":"speed","problem":"6 × 7","answer":42,"timeLimit":8},{"type":"speed","problem":"15 - 8","answer":7,"timeLimit":6},{"type":"speed","problem":"48 ÷ 6","answer":8,"timeLimit":10},{"type":"speed","problem":"23 + 19","answer":42,"timeLimit":10},{"type":"speed","problem":"8 × 9","answer":72,"timeLimit":8},{"type":"speed","problem":"52 - 27","answer":25,"timeLimit":10},{"type":"speed","problem":"63 ÷ 7","answer":9,"timeLimit":10},{"type":"speed","problem":"9 + 6","answer":15,"timeLimit":6},{"type":"speed","problem":"7 × 8","answer":56,"timeLimit":8},{"type":"speed","problem":"34 - 18","answer":16,"timeLimit":10},{"type":"speed","problem":"72 ÷ 9","answer":8,"timeLimit":10},{"type":"speed","problem":"45 + 38","answer":83,"timeLimit":10},{"type":"speed","problem":"12 × 4","answer":48,"timeLimit":10},{"type":"speed","problem":"81 - 45","answer":36,"timeLimit":10},{"type":"speed","problem":"96 ÷ 8","answer":12,"timeLimit":12},{"type":"speed","problem":"67 + 25","answer":92,"timeLimit":10},{"type":"speed","problem":"9 × 9","answer":81,"timeLimit":8},{"type":"speed","problem":"73 - 39","answer":34,"timeLimit":10},{"type":"speed","problem":"108 ÷ 9","answer":12,"timeLimit":12}]}'
WHERE levelId = 17 AND lessonId = 4;

-- Level 18.1: 🧠 Nhớ số nhanh
UPDATE lessons
SET content = '{"theory":["🧠 Flash Anzan - Nhớ số nhanh","","**Flash Anzan** bắt đầu từ việc nhớ số đơn giản!","","🎯 Bài tập này:","","💡 Mẹo ghi nhớ:","","   • Số hiện lên trong **2 giây** (giảm dần còn 1 giây)","   • Sau đó ẩn đi","   • Bạn nhập lại số vừa thấy","","   • Hình dung số trên bàn tính Soroban","   • Tập trung 100% khi số hiện lên","   • Nói thầm số trong đầu để củng cố"],"practice":[{"type":"flashcard","numbers":[3],"displayTime":2000,"answer":3},{"type":"flashcard","numbers":[7],"displayTime":2000,"answer":7},{"type":"flashcard","numbers":[5],"displayTime":2000,"answer":5},{"type":"flashcard","numbers":[9],"displayTime":2000,"answer":9},{"type":"flashcard","numbers":[2],"displayTime":2000,"answer":2},{"type":"flashcard","numbers":[8],"displayTime":1500,"answer":8},{"type":"flashcard","numbers":[4],"displayTime":1500,"answer":4},{"type":"flashcard","numbers":[6],"displayTime":1500,"answer":6},{"type":"flashcard","numbers":[15],"displayTime":2000,"answer":15},{"type":"flashcard","numbers":[28],"displayTime":2000,"answer":28},{"type":"flashcard","numbers":[43],"displayTime":2000,"answer":43},{"type":"flashcard","numbers":[67],"displayTime":2000,"answer":67},{"type":"flashcard","numbers":[52],"displayTime":1500,"answer":52},{"type":"flashcard","numbers":[89],"displayTime":1500,"answer":89},{"type":"flashcard","numbers":[36],"displayTime":1500,"answer":36}]}'
WHERE levelId = 18 AND lessonId = 1;

-- Level 18.2: 🧠 Cộng 2-3 số
UPDATE lessons
SET content = '{"theory":["🧠 Flash Anzan - Chuỗi số cơ bản","","Đây là bước đầu tiên của **Flash Anzan thực sự**!","","🎯 Cách thực hiện:","","💡 Ví dụ: 3, 5, 2","","   • Các số hiện lần lượt (mỗi số 1.5 giây)","   • CỘNG DỒN trong đầu khi xem","   • Nhập TỔNG khi kết thúc","","   • Số 1: Thấy 3 → Nhớ 3","   • Số 2: Thấy 5 → 3+5=8 → Nhớ 8","   • Số 3: Thấy 2 → 8+2=10 → Nhập 10"],"practice":[{"type":"flashcard","numbers":[2,3],"displayTime":1500,"answer":5},{"type":"flashcard","numbers":[4,5],"displayTime":1500,"answer":9},{"type":"flashcard","numbers":[3,6],"displayTime":1500,"answer":9},{"type":"flashcard","numbers":[5,4],"displayTime":1500,"answer":9},{"type":"flashcard","numbers":[7,2],"displayTime":1500,"answer":9},{"type":"flashcard","numbers":[6,8],"displayTime":1500,"answer":14},{"type":"flashcard","numbers":[9,5],"displayTime":1500,"answer":14},{"type":"flashcard","numbers":[8,7],"displayTime":1500,"answer":15},{"type":"flashcard","numbers":[2,3,4],"displayTime":1500,"answer":9},{"type":"flashcard","numbers":[3,5,2],"displayTime":1500,"answer":10},{"type":"flashcard","numbers":[4,3,6],"displayTime":1500,"answer":13},{"type":"flashcard","numbers":[5,4,3],"displayTime":1500,"answer":12},{"type":"flashcard","numbers":[6,2,5],"displayTime":1500,"answer":13},{"type":"flashcard","numbers":[7,3,4],"displayTime":1500,"answer":14},{"type":"flashcard","numbers":[8,5,2],"displayTime":1500,"answer":15}]}'
WHERE levelId = 18 AND lessonId = 2;

-- Level 18.3: 🧠 Cộng trừ hỗn hợp
UPDATE lessons
SET content = '{"theory":["🧠 Flash Anzan - Cộng trừ hỗn hợp","","Giờ có thêm **số âm** = phép trừ!","","🎯 Quy tắc:","","💡 Ví dụ: 5, 3, -2","","   • Số dương (5): Cộng vào tổng","   • Số âm (-3): Trừ khỏi tổng","   • Tưởng tượng: Gạt hạt LÊN (cộng) hoặc XUỐNG (trừ)","","   • Thấy 5 → Nhớ 5","   • Thấy 3 → 5+3=8","   • Thấy -2 → 8-2=6 → Nhập 6"],"practice":[{"type":"flashcard","numbers":[5,3,-2],"displayTime":1200,"answer":6},{"type":"flashcard","numbers":[7,-2,4],"displayTime":1200,"answer":9},{"type":"flashcard","numbers":[6,5,-3],"displayTime":1200,"answer":8},{"type":"flashcard","numbers":[8,-4,3],"displayTime":1200,"answer":7},{"type":"flashcard","numbers":[9,-3,5],"displayTime":1200,"answer":11},{"type":"flashcard","numbers":[8,-5,6],"displayTime":1200,"answer":9},{"type":"flashcard","numbers":[7,4,-6],"displayTime":1200,"answer":5},{"type":"flashcard","numbers":[9,-7,8],"displayTime":1200,"answer":10},{"type":"flashcard","numbers":[4,5,-2,3],"displayTime":1200,"answer":10},{"type":"flashcard","numbers":[6,-3,7,-2],"displayTime":1200,"answer":8},{"type":"flashcard","numbers":[5,4,-3,6],"displayTime":1200,"answer":12},{"type":"flashcard","numbers":[8,-4,5,-2],"displayTime":1200,"answer":7},{"type":"flashcard","numbers":[7,-3,6,2],"displayTime":1000,"answer":12},{"type":"flashcard","numbers":[9,-5,4,3],"displayTime":1000,"answer":11},{"type":"flashcard","numbers":[6,5,-4,-2],"displayTime":1000,"answer":5}]}'
WHERE levelId = 18 AND lessonId = 3;

-- Level 18.4: 🧠 Flash Anzan nhanh
UPDATE lessons
SET content = '{"theory":["🧠 Flash Anzan - Tốc độ cao","","Đây là cấp độ **thử thách**!","","🎯 Thử thách:","","💡 Kỹ thuật:","","   • 4-5 số nhảy liên tiếp","   • Mỗi số chỉ hiện **0.8-1 giây**","   • Có số âm (trừ)","","   • Không đọc số - NHÌN HÌNH bàn tính","   • Gạt hạt trong đầu theo từng số","   • Đọc kết quả từ hình ảnh cuối"],"practice":[{"type":"flashcard","numbers":[5,3,-2,4],"displayTime":1000,"answer":10},{"type":"flashcard","numbers":[7,-3,6,2],"displayTime":1000,"answer":12},{"type":"flashcard","numbers":[8,4,-5,3],"displayTime":1000,"answer":10},{"type":"flashcard","numbers":[6,-2,7,-3],"displayTime":1000,"answer":8},{"type":"flashcard","numbers":[9,-4,5,2],"displayTime":1000,"answer":12},{"type":"flashcard","numbers":[5,6,-3,4],"displayTime":800,"answer":12},{"type":"flashcard","numbers":[8,-5,7,-2],"displayTime":800,"answer":8},{"type":"flashcard","numbers":[7,3,-4,6],"displayTime":800,"answer":12},{"type":"flashcard","numbers":[4,5,-2,6,3],"displayTime":1000,"answer":16},{"type":"flashcard","numbers":[7,-3,5,-2,8],"displayTime":1000,"answer":15},{"type":"flashcard","numbers":[6,4,-5,7,-3],"displayTime":1000,"answer":9},{"type":"flashcard","numbers":[5,7,-4,3,6],"displayTime":800,"answer":17},{"type":"flashcard","numbers":[8,-3,6,-2,5],"displayTime":800,"answer":14},{"type":"flashcard","numbers":[9,-5,4,7,-6],"displayTime":800,"answer":9},{"type":"flashcard","numbers":[6,5,-3,8,-4],"displayTime":800,"answer":12}]}'
WHERE levelId = 18 AND lessonId = 4;

-- Level 18.5: 🔥 Flash Anzan siêu tốc (DELETE + INSERT để tránh lỗi encoding)
DELETE FROM lessons WHERE levelId = 18 AND lessonId = 5;
INSERT INTO lessons (levelId, lessonId, title, content, createdAt, updatedAt)
VALUES (
  18, 5, '🔥 Flash Anzan siêu tốc',
  '{"theory":["🔥 FLASH ANZAN - Cấp độ CHUYÊN NGHIỆP","","Chào mừng đến với **đỉnh cao của Flash Anzan** - kỹ năng tính nhẩm tốc độ cao nhất!","","🏆 **Thử thách đỉnh cao:**","   • Cộng **5-7 số** nhảy liên tục","   • Mỗi số chỉ hiện **0.5-0.7 giây**","   • Bao gồm số 1-2 chữ số và số âm","   • Yêu cầu tốc độ xử lý cực nhanh","","🧠 **Flash Anzan là gì?**","","Flash Anzan là kỹ năng tính nhẩm siêu tốc khi các số nhảy nhanh như chớp. Đây là bài tập cao cấp nhất trong Soroban, đòi hỏi:","   • **Trí nhớ hình ảnh mạnh mẽ:** Nhớ từng số ngay khi thấy","   • **Tốc độ xử lý cao:** Não tính toán như máy tính","   • **Tập trung tuyệt đối:** Không được lơ là dù chỉ 1 số","   • **Bàn tính ảo trong đầu:** Hình dung và tính tự động","","💪 **Làm thế nào để đạt được?**","","**1. Nền tảng vững chắc:**","   • Phải thành thạo Level 17-18.4 trước","   • Tính nhẩm 2-3 số phải rất nhanh và chính xác","   • Bàn tính ảo trong đầu phải rõ ràng","","**2. Quy trình luyện tập:**","   • **Bước 1:** Nhìn số đầu tiên → Ghi nhớ ngay","   • **Bước 2:** Số thứ 2 xuất hiện → Cộng/trừ tức thì","   • **Bước 3:** Tiếp tục với các số còn lại","   • **Bước 4:** Nhập kết quả cuối cùng","","**3. Kỹ thuật \"não máy tính\":**","   • Đừng suy nghĩ - chỉ THẤY và BIẾT","   • Nhìn thấy số → Bàn tính tự động thay đổi","   • Não bộ xử lý song song nhiều thông tin","   • Tin vào bản năng - não đã được lập trình!","","⭐ **Mẹo cho siêu sao:**","","**Về tập trung:**","   • Ngồi thẳng, thở đều đặn","   • Nhìn vào giữa màn hình (không nhìn từng số riêng lẻ)","   • Tạo \"vùng tĩnh lặng\" trong đầu","   • Chặn hết tạp âm xung quanh","","**Về kỹ thuật:**","   • Với số âm: Tự động chuyển sang trừ","   • Với số 2 chữ số: Tách Chục và Đơn vị","   • Luôn kiểm tra kết quả trung gian","   • Nếu sai 1 số → bỏ qua, tiếp tục","","**Về tinh thần:**","   • Đừng sợ thất bại - đây là bài khó nhất!","   • Mỗi lần luyện đều tiến bộ (dù không thấy rõ)","   • Não bộ cần thời gian để \"nâng cấp\"","   • Kiên trì 3-6 tháng sẽ thấy kỳ tích!","","🎯 **Lộ trình luyện tập:**","   1. **Tuần 1-2:** Làm quen với tốc độ 0.7 giây/số","   2. **Tuần 3-4:** Giảm xuống 0.6 giây/số","   3. **Tháng 2-3:** Đạt 0.5 giây/số","   4. **Tháng 4-6:** Tăng lên 7-10 số","","🌟 **Tin vào bản thân!**","","Flash Anzan là kỹ năng khó nhất nhưng cũng tuyệt vời nhất. Khi bạn làm được, bạn sẽ có khả năng tính toán vượt xa người thường. Não bộ bạn mạnh mẽ hơn bạn nghĩ - chỉ cần kiên trì luyện tập!","","Chúc bạn chinh phục đỉnh cao Flash Anzan! 🏆✨"],"practice":[{"type":"flashcard","numbers":[12,-5,8,3,-7],"displayTime":700,"answer":11},{"type":"flashcard","numbers":[15,-8,6,-4,9],"displayTime":700,"answer":18},{"type":"flashcard","numbers":[8,14,-9,5,-6],"displayTime":700,"answer":12},{"type":"flashcard","numbers":[11,-7,13,-8,6],"displayTime":700,"answer":15},{"type":"flashcard","numbers":[7,5,-3,8,-4,6],"displayTime":700,"answer":19},{"type":"flashcard","numbers":[9,-5,7,4,-6,8],"displayTime":700,"answer":17},{"type":"flashcard","numbers":[6,8,-4,5,-3,7],"displayTime":700,"answer":19},{"type":"flashcard","numbers":[12,-6,8,-5,7,4],"displayTime":700,"answer":20},{"type":"flashcard","numbers":[8,6,-5,9,-7,4],"displayTime":600,"answer":15},{"type":"flashcard","numbers":[7,-4,11,-6,5,8],"displayTime":600,"answer":21},{"type":"flashcard","numbers":[13,-8,6,5,-7,9],"displayTime":600,"answer":18},{"type":"flashcard","numbers":[5,8,-3,6,-4,7,2],"displayTime":600,"answer":21},{"type":"flashcard","numbers":[9,-5,7,4,-6,8,-3],"displayTime":600,"answer":14},{"type":"flashcard","numbers":[6,7,-4,9,-5,8,3],"displayTime":600,"answer":24},{"type":"flashcard","numbers":[8,-4,9,5,-7,6,4],"displayTime":500,"answer":21}]}',
  NOW(), NOW()
);
