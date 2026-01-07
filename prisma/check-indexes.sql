-- ============================================
-- 🔧 KIỂM TRA VÀ TỐI ƯU INDEX CHO LOGIN
-- Chạy trên phpMyAdmin để xác nhận indexes
-- ============================================

-- 1. Xem indexes hiện tại của bảng users
SHOW INDEX FROM users;

-- 2. Xác nhận email đã có index (từ UNIQUE constraint)
-- Nếu không có, tạo index:
-- CREATE INDEX idx_users_email ON users(email);

-- 3. Kiểm tra performance query login
-- EXPLAIN SELECT id, email, password, name, username, avatar 
-- FROM users WHERE email = 'test@example.com';

-- 4. Nếu cần thêm composite index cho lastLoginDate:
-- ALTER TABLE users ADD INDEX idx_users_last_login (lastLoginDate);

-- ============================================
-- 📊 QUERY KIỂM TRA PROCESS MySQL
-- ============================================

-- Xem số connections hiện tại
SHOW STATUS LIKE 'Threads_connected';

-- Xem các process đang chạy
SHOW PROCESSLIST;

-- Xem max connections được phép
SHOW VARIABLES LIKE 'max_connections';
