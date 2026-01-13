-- ============================================================
-- 🧹 CLEANUP: Xóa các Achievement không thể track tự động
-- ============================================================
-- Chạy script này để xóa các achievement mà hệ thống không thể
-- tự động kiểm tra và unlock cho user.
--
-- ⚠️ LƯU Ý QUAN TRỌNG:
-- 1. Backup database trước khi chạy
-- 2. Chạy từng block một để kiểm tra
-- 3. Script này sẽ xóa cả user_achievements liên quan
-- ============================================================

-- Bước 0: Kiểm tra các achievement sẽ bị xóa (CHẠY TRƯỚC ĐỂ XEM)
SELECT id, name, icon, category, 
       JSON_UNQUOTE(JSON_EXTRACT(requirement, '$.type')) as req_type
FROM achievements 
WHERE JSON_UNQUOTE(JSON_EXTRACT(requirement, '$.type')) IN (
    'fast_exercise',      -- Làm bài dưới X giây (cần realtime tracking)
    'fast_streak',        -- Chuỗi bài nhanh liên tiếp (cần realtime)
    'speed_rush',         -- 20 bài trong 1 phút (cần session tracking)
    'speed_master',       -- 50 bài trong 5 phút (cần session tracking)
    'compete_first_place', -- Hạng 1 trong N trận (cần ranking phức tạp)
    'early_adopter',      -- 100 user đầu tiên (không thể check sau)
    'birthday_login'      -- Đăng nhập ngày sinh (không có birthday field)
);

-- ============================================================
-- Bước 1: Xóa user_achievements liên quan (FK constraint)
-- ============================================================
DELETE FROM user_achievements 
WHERE achievementId IN (
    SELECT id FROM achievements 
    WHERE JSON_UNQUOTE(JSON_EXTRACT(requirement, '$.type')) IN (
        'fast_exercise',
        'fast_streak', 
        'speed_rush',
        'speed_master',
        'compete_first_place',
        'early_adopter',
        'birthday_login'
    )
);

-- Kiểm tra số rows đã xóa
SELECT ROW_COUNT() as 'user_achievements deleted';

-- ============================================================
-- Bước 2: Xóa achievements
-- ============================================================
DELETE FROM achievements 
WHERE JSON_UNQUOTE(JSON_EXTRACT(requirement, '$.type')) IN (
    'fast_exercise',
    'fast_streak',
    'speed_rush', 
    'speed_master',
    'compete_first_place',
    'early_adopter',
    'birthday_login'
);

-- Kiểm tra số rows đã xóa
SELECT ROW_COUNT() as 'achievements deleted';

-- ============================================================
-- Bước 3: Cập nhật achievement "Huyền thoại SoroKids"
-- Achievement này yêu cầu unlock ALL achievements, nên cần
-- cập nhật lại requirement count nếu có
-- ============================================================
-- Không cần làm gì vì type là 'unlock_all_achievements' 
-- và code đã check: unlockedCount >= (totalAchievements - 1)

-- ============================================================
-- Bước 4: Kiểm tra kết quả
-- ============================================================
SELECT COUNT(*) as 'Total achievements remaining' FROM achievements;

SELECT category, COUNT(*) as count 
FROM achievements 
GROUP BY category 
ORDER BY count DESC;

-- Danh sách achievement còn lại
SELECT id, name, icon, category,
       JSON_UNQUOTE(JSON_EXTRACT(requirement, '$.type')) as req_type
FROM achievements
ORDER BY category, name;
