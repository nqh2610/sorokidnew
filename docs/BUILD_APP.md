# 📱 HƯỚNG DẪN BUILD APP SOROKID

## Tổng quan

Sorokid hỗ trợ 3 phương thức cài đặt:
1. **PWA** - Cài trực tiếp từ web
2. **Android App** - Lên Google Play Store  
3. **iOS App** - Lên Apple App Store

---

## 1️⃣ PWA (Progressive Web App)

PWA đã được cấu hình sẵn! Người dùng có thể:

### Trên Android (Chrome):
1. Truy cập https://sorokid.com
2. Nhấn menu ⋮ → "Thêm vào màn hình chính"
3. Nhấn "Cài đặt"

### Trên iOS (Safari):
1. Truy cập https://sorokid.com
2. Nhấn nút Share ↑
3. Chọn "Thêm vào MH chính"
4. Nhấn "Thêm"

### Trên Desktop (Chrome/Edge):
1. Truy cập https://sorokid.com
2. Click icon ⊕ trên thanh địa chỉ
3. Click "Install"

---

## 2️⃣ Android App (Google Play)

### Bước 1: Cài đặt dependencies

```bash
# Cài Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/splash-screen @capacitor/status-bar

# Cài Sharp để generate icons
npm install --save-dev sharp
```

### Bước 2: Build và khởi tạo

```bash
# Build Next.js static export
npm run build:static

# Khởi tạo Capacitor (nếu chưa có)
npx cap init Sorokid com.sorokid.app

# Thêm Android project
npx cap add android

# Generate icons
npm run generate:icons

# Sync web assets
npx cap sync android
```

### Bước 3: Mở Android Studio

```bash
npx cap open android
```

### Bước 4: Build APK/AAB

Trong Android Studio:
1. **Debug APK**: Build → Build Bundle(s)/APK(s) → Build APK(s)
2. **Release AAB** (cho Play Store): Build → Generate Signed Bundle/APK

### Bước 5: Upload lên Google Play Console

1. Truy cập https://play.google.com/console
2. Tạo app mới
3. Upload file .aab
4. Điền thông tin app
5. Submit review

---

## 3️⃣ iOS App (App Store)

### Yêu cầu:
- macOS với Xcode
- Apple Developer Account ($99/năm)

### Bước 1: Cài đặt dependencies

```bash
npm install @capacitor/ios
```

### Bước 2: Build và khởi tạo

```bash
# Build Next.js static export
npm run build:static

# Thêm iOS project
npx cap add ios

# Generate icons
npm run generate:icons

# Sync web assets
npx cap sync ios
```

### Bước 3: Mở Xcode

```bash
npx cap open ios
```

### Bước 4: Cấu hình trong Xcode

1. Chọn Team (Apple Developer account)
2. Set Bundle Identifier: `com.sorokid.app`
3. Cấu hình signing

### Bước 5: Build và Submit

1. Product → Archive
2. Distribute App → App Store Connect
3. Upload

### Bước 6: App Store Connect

1. Truy cập https://appstoreconnect.apple.com
2. Điền thông tin app
3. Submit for Review

---

## 📦 NPM Scripts

Thêm vào `package.json`:

```json
{
  "scripts": {
    "build:static": "next build && next export",
    "generate:icons": "node scripts/generate-icons.js",
    "cap:sync": "npx cap sync",
    "android:build": "npm run build:static && npx cap sync android && npx cap open android",
    "ios:build": "npm run build:static && npx cap sync ios && npx cap open ios"
  }
}
```

---

## 🔧 Troubleshooting

### Lỗi: "Cannot find module 'sharp'"
```bash
npm install --save-dev sharp
```

### Lỗi: "Capacitor could not find the web assets directory"
```bash
npm run build:static
```

### Lỗi Android: "SDK location not found"
1. Mở Android Studio
2. Tools → SDK Manager
3. Cài Android SDK

### Lỗi iOS: "No signing certificate"
1. Đăng nhập Apple Developer Account trong Xcode
2. Xcode → Preferences → Accounts → Add

---

## 📋 Checklist trước khi Submit

### Android:
- [ ] Icon 512x512 PNG
- [ ] Feature graphic 1024x500
- [ ] Screenshots (min 2)
- [ ] App description (ngắn + dài)
- [ ] Privacy policy URL
- [ ] Age rating

### iOS:
- [ ] Icon 1024x1024 PNG (không alpha)
- [ ] Screenshots cho các device
- [ ] App description
- [ ] Keywords
- [ ] Privacy policy URL
- [ ] Age rating

---

## 🎯 Thông tin App

- **App ID**: com.sorokid.app
- **Tên**: Sorokid - Học Soroban & Toán Tư Duy  
- **Tên ngắn**: Sorokid
- **Mô tả ngắn**: Ứng dụng học Soroban cho học sinh tiểu học
- **Danh mục**: Education / Kids

---

## 💡 Tips

1. **Test trên device thật** trước khi submit
2. **Sử dụng Internal Testing** (Android) / TestFlight (iOS) để test beta
3. **Chuẩn bị screenshots đẹp** - ảnh hưởng lớn đến download
4. **Viết mô tả SEO-friendly** với keywords
5. **Reply reviews** để tăng ranking

---

## 🆘 Hỗ trợ

Nếu gặp vấn đề, liên hệ: support@sorokid.com
