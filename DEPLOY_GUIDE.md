# 🚀 HƯỚNG DẪN BUILD & DEPLOY SOROKID LÊN LINUX SHARED HOST

## 📋 YÊU CẦU

### Trên máy Windows (build):
- Node.js >= 18.x
- npm hoặc yarn

### Trên Server Linux:
- Node.js >= 18.x
- MySQL database
- RAM tối thiểu: 1GB (khuyến nghị 2GB)

---

## 🔨 BƯỚC 1: BUILD TRÊN WINDOWS

```batch
# Chạy script build
build_linux.bat
```

Script sẽ:
1. Clean build cũ
2. Cài đặt dependencies
3. Generate Prisma Client với Linux binaries
4. Build Next.js standalone mode
5. Copy tất cả files cần thiết vào `deploy_linux/`
6. Tạo các file config cho production

### Cấu trúc output `deploy_linux/`:
```
deploy_linux/
├── server.js              # ✅ Entry point (BẮT BUỘC)
├── .next/                 # ✅ Build output (BẮT BUỘC)
│   ├── standalone/
│   │   └── ...
│   └── static/            # ✅ Static assets (BẮT BUỘC)
│       ├── chunks/
│       ├── css/
│       └── media/
├── node_modules/          # ✅ Dependencies (BẮT BUỘC)
│   ├── next/
│   ├── react/
│   ├── react-dom/
│   ├── @prisma/
│   │   └── client/
│   │       └── query-engine-linux*  # Linux binaries
│   └── .prisma/
│       └── client/
├── public/                # Static files
│   ├── images/
│   ├── favicon.ico
│   └── robots.txt
├── prisma/
│   └── schema.prisma
├── .env.example           # Template config
├── package.json           # Minimal package.json
├── start.sh               # Linux startup script
├── ecosystem.config.js    # PM2 config
├── setup_linux.sh         # Setup script cho server
└── BUILD_OK.txt           # Build verification
```

---

## 📤 BƯỚC 2: UPLOAD LÊN SERVER

### Option A: Dùng FTP/SFTP
1. Nén thư mục `deploy_linux/` thành file ZIP
2. Upload lên server
3. Giải nén

### Option B: Dùng SCP
```bash
scp -r deploy_linux/* user@server:/home/user/sorokid/
```

### Option C: Dùng Git (nếu có)
```bash
# Trên server
git clone <repo> sorokid
cd sorokid
# Copy các file từ deploy_linux
```

---

## ⚙️ BƯỚC 3: CẤU HÌNH TRÊN SERVER

### 3.1 Truy cập vào thư mục project
```bash
cd /home/user/sorokid
```

### 3.2 Tạo file .env
```bash
cp .env.example .env
nano .env
```

### 3.3 Điền thông tin:
```env
# Database MySQL
DATABASE_URL="mysql://username:password@localhost:3306/sorokid_db"

# NextAuth (BẮT BUỘC)
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-characters-long"

# Environment
NODE_ENV=production
PORT=3000
```

### 3.4 Chạy setup script
```bash
chmod +x setup_linux.sh
./setup_linux.sh
```

---

## 🚀 BƯỚC 4: KHỞI ĐỘNG SERVER

### Option 1: Chạy trực tiếp (test)
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Dùng PM2 (KHUYẾN NGHỊ cho production)
```bash
# Cài PM2 nếu chưa có
npm install -g pm2

# Khởi động
pm2 start ecosystem.config.js

# Lưu config để auto-start
pm2 save
pm2 startup
```

### Option 3: Chạy với nohup (backup option)
```bash
nohup node server.js > app.log 2>&1 &
```

---

## 🔧 CÁC LỆNH QUẢN LÝ (PM2)

```bash
# Xem status
pm2 status

# Xem logs
pm2 logs sorokid

# Restart
pm2 restart sorokid

# Stop
pm2 stop sorokid

# Xem memory usage
pm2 monit
```

---

## 🐛 TROUBLESHOOTING

### Lỗi 1: "Prisma binary not found"
```bash
# Generate lại Prisma trên server
npx prisma generate
```

### Lỗi 2: "ENOENT: no such file or directory"
- Kiểm tra `.next/static` đã được copy chưa
- Kiểm tra `public/` đã được copy chưa

### Lỗi 3: "FATAL ERROR: Reached heap limit"
- Tăng memory limit trong `start.sh`:
```bash
export NODE_OPTIONS="--max-old-space-size=768"
```

### Lỗi 4: "Database connection failed"
- Kiểm tra DATABASE_URL trong `.env`
- Kiểm tra MySQL đang chạy
- Kiểm tra firewall cho phép port 3306

### Lỗi 5: "NextAuth error"
- Đảm bảo NEXTAUTH_URL đúng domain
- NEXTAUTH_SECRET phải >= 32 ký tự

---

## 💡 TỐI ƯU CHO RAM THẤP

File `start.sh` đã được cấu hình với:
```bash
NODE_OPTIONS="--max-old-space-size=512"
```

Nếu vẫn lỗi memory:
1. Giảm xuống 384MB
2. Tắt các process khác
3. Nâng cấp RAM server

PM2 `ecosystem.config.js` đã set:
```javascript
max_memory_restart: '500M'  // Auto restart nếu vượt 500MB
```

---

## 📊 KIỂM TRA HEALTH

```bash
# Kiểm tra server đang chạy
curl http://localhost:3000/api/health

# Hoặc từ bên ngoài
curl https://yourdomain.com/api/health
```

---

## 🔄 CẬP NHẬT CODE

1. Build lại trên Windows: `build_linux.bat`
2. Upload `deploy_linux/` mới
3. Restart: `pm2 restart sorokid`

---

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Kiểm tra logs: `pm2 logs sorokid`
2. Kiểm tra file `BUILD_OK.txt` tồn tại
3. Đảm bảo tất cả files trong cấu trúc ở trên đều có
