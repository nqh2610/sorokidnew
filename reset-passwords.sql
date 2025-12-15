-- =====================================================
-- SCRIPT: Reset tất cả mật khẩu user thành zxcv1357*
-- Chạy trên phpMyAdmin hoặc MySQL CLI
-- =====================================================

-- Mật khẩu: zxcv1357*
-- Hash bcrypt: $2a$12$Qlv2OEWqoM0ydl/Z9KIOieG197CKB63N/lijVYszm539g2eNS8Jhu

-- Cập nhật TẤT CẢ user
UPDATE User SET password = '$2a$12$Qlv2OEWqoM0ydl/Z9KIOieG197CKB63N/lijVYszm539g2eNS8Jhu';

-- Kiểm tra kết quả
SELECT id, email, username, name, LEFT(password, 30) as password_preview FROM User LIMIT 10;

-- =====================================================
-- HOẶC nếu chỉ muốn reset user cụ thể:
-- =====================================================
-- UPDATE User SET password = '$2a$12$Qlv2OEWqoM0ydl/Z9KIOieG197CKB63N/lijVYszm539g2eNS8Jhu' 
-- WHERE email = 'nqh2610@gmail.com';

-- UPDATE User SET password = '$2a$12$Qlv2OEWqoM0ydl/Z9KIOieG197CKB63N/lijVYszm539g2eNS8Jhu' 
-- WHERE email IN ('user1@example.com', 'user2@example.com');
