-- =====================================================
-- CLEANUP ORPHAN PROGRESS RECORDS
-- Script: cleanup-orphan-progress.sql
-- Date: 2026-01-18
-- =====================================================
-- 
-- VẤN ĐỀ: Có 35 Progress records trỏ đến lessonId không còn tồn tại
--         trong bảng lessons (đã bị xóa/thay đổi cấu trúc trước đó)
--         Điều này làm sai lệch thống kê tiến độ (>100%)
--
-- =====================================================

-- =====================================================
-- BƯỚC 1: BACKUP TRƯỚC KHI XÓA (BẮT BUỘC!)
-- =====================================================

-- Tạo bảng backup để lưu dữ liệu sẽ bị xóa
CREATE TABLE IF NOT EXISTS progress_backup_orphan_20260118 AS
SELECT p.* 
FROM progress p
LEFT JOIN lessons l ON p.levelId = l.levelId AND p.lessonId = l.lessonId
WHERE l.lessonId IS NULL;

-- Kiểm tra số records đã backup
SELECT 'BACKUP CREATED' AS status, COUNT(*) AS records_backed_up 
FROM progress_backup_orphan_20260118;

-- =====================================================
-- BƯỚC 2: KIỂM TRA TRƯỚC KHI XÓA (XEM TRƯỚC)
-- =====================================================

-- Xem danh sách records sẽ bị xóa (KHÔNG XÓA, CHỈ XEM)
SELECT 
    p.userId,
    u.name AS userName,
    p.levelId,
    p.lessonId,
    p.completed,
    p.starsEarned,
    p.createdAt
FROM progress p
LEFT JOIN lessons l ON p.levelId = l.levelId AND p.lessonId = l.lessonId
LEFT JOIN users u ON p.userId = u.id
WHERE l.lessonId IS NULL
ORDER BY p.levelId, p.lessonId;

-- Đếm số records sẽ bị xóa theo user
SELECT 
    p.userId,
    u.name AS userName,
    COUNT(*) AS orphan_records
FROM progress p
LEFT JOIN lessons l ON p.levelId = l.levelId AND p.lessonId = l.lessonId
LEFT JOIN users u ON p.userId = u.id
WHERE l.lessonId IS NULL
GROUP BY p.userId, u.name;

-- =====================================================
-- BƯỚC 3: XÓA DỮ LIỆU MỒ CÔI
-- =====================================================

-- ⚠️ CHẠY SAU KHI ĐÃ XÁC NHẬN BACKUP THÀNH CÔNG!
DELETE p FROM progress p
LEFT JOIN lessons l ON p.levelId = l.levelId AND p.lessonId = l.lessonId
WHERE l.lessonId IS NULL;

-- Kiểm tra kết quả sau khi xóa
SELECT 'DELETE COMPLETED' AS status, ROW_COUNT() AS records_deleted;

-- =====================================================
-- BƯỚC 4: KIỂM TRA SAU KHI XÓA
-- =====================================================

-- Xác nhận không còn orphan records
SELECT 
    'REMAINING ORPHANS' AS check_type,
    COUNT(*) AS count
FROM progress p
LEFT JOIN lessons l ON p.levelId = l.levelId AND p.lessonId = l.lessonId
WHERE l.lessonId IS NULL;

-- =====================================================
-- ROLLBACK (NẾU CẦN KHÔI PHỤC)
-- =====================================================

-- Nếu cần khôi phục dữ liệu đã xóa:
-- INSERT INTO progress SELECT * FROM progress_backup_orphan_20260118;

-- Sau khi xác nhận mọi thứ OK, có thể xóa bảng backup:
-- DROP TABLE progress_backup_orphan_20260118;

-- =====================================================
