-- ============================================================
-- 🧹 PRODUCTION SAFE: Xóa Achievement không trackable
-- ============================================================
-- Script này dùng TRANSACTION để có thể ROLLBACK nếu có lỗi
-- 
-- Các achievement bị xóa (7 cái):
-- 1. ⚡ Tia chớp nhỏ (fast_exercise)
-- 2. 🚀 Tên lửa số học (fast_streak) 
-- 3. 🌪️ Cơn bão Soroban (speed_rush)
-- 4. ✨ Siêu thanh tốc (speed_master)
-- 5. 🏆 Quán quân đấu trường (compete_first_place)
-- 6. 👑 Vua đấu trường (compete_first_place)
-- 7. 🎊 Người tiên phong (early_adopter)
-- 8. 🎂 Sinh nhật vui vẻ (birthday_login)
-- ============================================================

START TRANSACTION;

-- Lưu số achievement trước khi xóa
SET @before_count = (SELECT COUNT(*) FROM achievements);

-- Xóa user_achievements trước (FK)
DELETE FROM user_achievements 
WHERE achievementId IN (
    '14149bed-6252-48ce-a7bf-def6caf75cf9', -- Tia chớp nhỏ
    'c82edabf-0ba0-4ff7-98ab-f994d771fe10', -- Tên lửa số học
    '6623ee2a-8a48-4bf2-b373-68b03096d8e8', -- Cơn bão Soroban
    '8f892dab-f8b1-4e52-ad52-59aaa02c5a01', -- Siêu thanh tốc
    '2ecf1ff5-7ca4-441a-b769-b7c3e54589b6', -- Quán quân đấu trường
    '5d02a3e3-52aa-4aaf-b3b6-eb937bd46713', -- Vua đấu trường
    '5ec15a91-0429-4d14-9f9b-fe14ab4b3d73', -- Người tiên phong
    '64ec83b9-5cb7-4366-a33f-f5a6636f5576'  -- Sinh nhật vui vẻ
);

SET @ua_deleted = ROW_COUNT();

-- Xóa achievements
DELETE FROM achievements 
WHERE id IN (
    '14149bed-6252-48ce-a7bf-def6caf75cf9', -- Tia chớp nhỏ
    'c82edabf-0ba0-4ff7-98ab-f994d771fe10', -- Tên lửa số học
    '6623ee2a-8a48-4bf2-b373-68b03096d8e8', -- Cơn bão Soroban
    '8f892dab-f8b1-4e52-ad52-59aaa02c5a01', -- Siêu thanh tốc
    '2ecf1ff5-7ca4-441a-b769-b7c3e54589b6', -- Quán quân đấu trường
    '5d02a3e3-52aa-4aaf-b3b6-eb937bd46713', -- Vua đấu trường
    '5ec15a91-0429-4d14-9f9b-fe14ab4b3d73', -- Người tiên phong
    '64ec83b9-5cb7-4366-a33f-f5a6636f5576'  -- Sinh nhật vui vẻ
);

SET @ach_deleted = ROW_COUNT();
SET @after_count = (SELECT COUNT(*) FROM achievements);

-- Hiển thị kết quả
SELECT 
    @before_count as 'Before',
    @ach_deleted as 'Achievements Deleted',
    @ua_deleted as 'User Achievements Deleted', 
    @after_count as 'After',
    (@before_count - @after_count) as 'Total Removed';

-- ⚠️ KIỂM TRA KẾT QUẢ TRƯỚC KHI COMMIT
-- Nếu @ach_deleted = 8 thì đúng
-- Nếu khác thì ROLLBACK

-- COMMIT;   -- Bỏ comment dòng này khi đã kiểm tra OK
-- ROLLBACK; -- Dùng dòng này nếu muốn hủy
