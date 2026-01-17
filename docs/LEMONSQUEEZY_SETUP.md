# 🍋 LemonSqueezy International Payment Setup Guide

## Overview

SoroKid sử dụng **LemonSqueezy** để xử lý thanh toán quốc tế cho khách hàng ngoài Việt Nam.

- **Việt Nam (locale: vi)**: Sử dụng VietQR (thanh toán hiện tại)
- **Quốc tế (locale: en, và các ngôn ngữ khác)**: Sử dụng LemonSqueezy

## Tại sao chọn LemonSqueezy?

1. **Merchant of Record**: LemonSqueezy xử lý thuế VAT quốc tế hộ bạn
2. **Phí cạnh tranh**: 5% + $0.50/giao dịch
3. **Hỗ trợ cá nhân**: Không cần thành lập công ty
4. **Dễ tích hợp**: API đơn giản, webhook rõ ràng
5. **95+ loại tiền tệ**: USD, EUR, GBP, JPY, AUD, và nhiều hơn

## Bước 1: Đăng ký LemonSqueezy

1. Truy cập [https://lemonsqueezy.com](https://lemonsqueezy.com)
2. Nhấn "Get Started" để đăng ký tài khoản
3. Hoàn thành quá trình xác minh danh tính (KYC)
4. Kết nối tài khoản nhận tiền (PayPal hoặc Bank Wire)

## Bước 2: Tạo Store

1. Trong dashboard, vào **Stores** > **Create Store**
2. Nhập thông tin:
   - **Store name**: SoroKid
   - **Store slug**: `sorokid` (sẽ dùng trong checkout URL)
   - **Currency**: USD (mặc định)

## Bước 3: Tạo Products

### Product 1: Basic Plan

1. Vào **Products** > **Create Product**
2. Điền thông tin:
   - **Name**: SoroKid Basic
   - **Description**: Learn Addition & Subtraction with Soroban
   - **Price**: $8.00 USD
   - **Type**: One-time payment
3. Lưu và copy **Product ID** và **Variant ID** từ URL

### Product 2: Advanced Plan

1. Tạo product mới
2. Điền thông tin:
   - **Name**: SoroKid Advanced
   - **Description**: Full access to all Soroban lessons and features
   - **Price**: $12.00 USD
   - **Type**: One-time payment
3. Lưu và copy **Product ID** và **Variant ID** từ URL

## Bước 4: Tạo API Key

1. Vào **Settings** > **API**
2. Nhấn **Create API Key**
3. Đặt tên: "SoroKid Production"
4. Copy API Key (chỉ hiện một lần!)

## Bước 5: Cấu hình Webhook

1. Vào **Settings** > **Webhooks**
2. Nhấn **Create Webhook**
3. Điền thông tin:
   - **URL**: `https://sorokid.com/api/payment/international/webhook`
   - **Events**: Chọn các events:
     - `order_created`
     - `order_refunded`
4. Copy **Webhook Secret**

## Bước 6: Cập nhật Environment Variables

Thêm vào file `.env` hoặc `.env.production`:

```env
# LemonSqueezy Configuration
LEMONSQUEEZY_STORE_ID="your_store_id"
LEMONSQUEEZY_STORE_SLUG="sorokid"
LEMONSQUEEZY_API_KEY="your_api_key"
LEMONSQUEEZY_WEBHOOK_SECRET="your_webhook_secret"

# Basic Plan
LEMONSQUEEZY_BASIC_PRODUCT_ID="123456"
LEMONSQUEEZY_BASIC_VARIANT_ID="234567"

# Advanced Plan
LEMONSQUEEZY_ADVANCED_PRODUCT_ID="345678"
LEMONSQUEEZY_ADVANCED_VARIANT_ID="456789"
```

## Bước 7: Test Checkout

1. Mở website với ngôn ngữ English: `https://sorokid.com/en/pricing`
2. Đăng nhập và chọn một gói
3. Sẽ redirect đến LemonSqueezy checkout
4. Test với thẻ test: `4242 4242 4242 4242`

## Cấu trúc Files

```
lib/
  lemonsqueezy.js          # Core LemonSqueezy utilities

app/api/payment/
  international/
    route.js               # POST: Create checkout, GET: Payment info
    webhook/
      route.js             # Handle LemonSqueezy webhooks
```

## Luồng thanh toán

```
User chọn gói (EN locale)
    ↓
POST /api/payment/international
    ↓
Redirect → LemonSqueezy Checkout
    ↓
User thanh toán
    ↓
Webhook → /api/payment/international/webhook
    ↓
Cập nhật user tier trong database
    ↓
Redirect → /pricing?payment=success&tier=xxx
```

## Nhận tiền về Việt Nam

LemonSqueezy hỗ trợ 2 phương thức payout:

### 1. PayPal (Khuyến nghị)
- Kết nối tài khoản PayPal
- Payout tự động 2 lần/tháng
- Rút từ PayPal về bank VN

### 2. Bank Wire
- Cần tài khoản USD
- Phí chuyển cao hơn PayPal
- Thời gian xử lý lâu hơn

## Phí tổng cộng (ước tính)

Với giao dịch $10:
- LemonSqueezy: 5% + $0.50 = $1.00
- PayPal withdrawal: ~2%
- **Tổng phí**: ~12% (~$1.20)
- **Bạn nhận**: ~$8.80

## Troubleshooting

### Webhook không nhận được
1. Kiểm tra URL webhook trong LemonSqueezy dashboard
2. Kiểm tra logs server
3. Đảm bảo HTTPS enabled

### Checkout không redirect
1. Kiểm tra Variant ID đúng chưa
2. Kiểm tra API Key còn hiệu lực
3. Check console logs

### User tier không cập nhật
1. Kiểm tra webhook signature
2. Kiểm tra custom_data có user_id
3. Check database connection

## Support

- LemonSqueezy Docs: https://docs.lemonsqueezy.com
- API Reference: https://docs.lemonsqueezy.com/api
- Help Center: https://lemonsqueezy.com/help
