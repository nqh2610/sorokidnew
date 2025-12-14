#!/bin/bash
# ============================================================
#   🐧 SCRIPT SETUP TRÊN SERVER LINUX
#   Chạy script này SAU KHI upload thư mục deploy_linux
# ============================================================

set -e

echo ""
echo "============================================================"
echo "  🚀 SETUP SOROKID TRÊN LINUX SERVER"
echo "============================================================"
echo ""

# Kiểm tra Node.js
echo "[1/5] Kiểm tra Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js chưa được cài đặt!"
    echo "   Cài đặt: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "           sudo apt-get install -y nodejs"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "✅ Node.js version: $NODE_VERSION"

# Kiểm tra file .env
echo ""
echo "[2/5] Kiểm tra file .env..."
if [ ! -f ".env" ]; then
    echo "⚠️ File .env chưa tồn tại!"
    echo "   Tạo từ template..."
    cp .env.example .env
    echo ""
    echo "❗ BẮT BUỘC: Chỉnh sửa file .env với thông tin database của bạn!"
    echo "   nano .env"
    echo ""
    read -p "Nhấn Enter sau khi đã chỉnh sửa .env..." 
fi

# Kiểm tra DATABASE_URL
if grep -q "username:password" .env 2>/dev/null; then
    echo "❌ ERROR: DATABASE_URL chưa được cấu hình!"
    echo "   Chỉnh sửa file .env và thay đổi DATABASE_URL"
    exit 1
fi
echo "✅ File .env đã tồn tại"

# Generate Prisma Client cho Linux
echo ""
echo "[3/5] Generate Prisma Client cho Linux..."
if [ -f "prisma/schema.prisma" ]; then
    # Cài prisma nếu cần
    if ! command -v npx &> /dev/null; then
        npm install -g npx
    fi
    
    # Generate prisma client
    npx prisma generate 2>/dev/null || {
        echo "⚠️ Cài đặt Prisma CLI..."
        npm install prisma @prisma/client --save-dev
        npx prisma generate
    }
    echo "✅ Prisma Client đã generate"
else
    echo "⚠️ Không tìm thấy prisma/schema.prisma"
fi

# Set permissions
echo ""
echo "[4/5] Set permissions..."
chmod +x start.sh 2>/dev/null || true
chmod 600 .env 2>/dev/null || true
echo "✅ Permissions đã được set"

# Test database connection
echo ""
echo "[5/5] Test kết nối database..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        await prisma.\$connect();
        console.log('✅ Kết nối database thành công!');
        await prisma.\$disconnect();
    } catch (error) {
        console.log('❌ Lỗi kết nối database:', error.message);
        process.exit(1);
    }
}
test();
" 2>/dev/null || echo "⚠️ Không thể test database (có thể do chưa cấu hình đúng)"

echo ""
echo "============================================================"
echo "  ✅ SETUP HOÀN TẤT!"
echo "============================================================"
echo ""
echo "📝 CÁCH KHỞI ĐỘNG:"
echo ""
echo "   Option 1 - Chạy trực tiếp:"
echo "   ./start.sh"
echo ""
echo "   Option 2 - Chạy với PM2 (khuyến nghị):"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "   Option 3 - Chạy background với nohup:"
echo "   nohup node server.js > app.log 2>&1 &"
echo ""
echo "💡 XEM LOGS:"
echo "   pm2 logs sorokid"
echo "   hoặc: tail -f app.log"
echo ""
echo "🔄 RESTART:"
echo "   pm2 restart sorokid"
echo ""
echo "============================================================"
