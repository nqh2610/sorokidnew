# SoroKids - Linux Deployment

## Yeu cau
- Node.js 18+ hoac 22+
- MySQL database (da co san)

## Cau hinh
Chinh sua file `.env` voi thong tin database cua ban.

## Khoi chay
```bash
# Neu chua co tables trong database
npx prisma db push

# Chay server
node server.js

# Hoac dung PM2 de chay background
pm2 start server.js --name sorokids
pm2 save
```

## Port
Mac dinh: 3000 (thay doi trong .env)
