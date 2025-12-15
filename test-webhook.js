const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrder() {
  console.log('=== KIỂM TRA ORDER TRONG DATABASE ===\n');
  
  const orderCode = 'SK1765787324604668DB4';
  console.log('Tìm order với mã:', orderCode);
  
  const order = await prisma.paymentOrder.findFirst({
    where: { orderCode },
    include: {
      user: {
        select: { id: true, name: true, email: true, tier: true }
      }
    }
  });
  
  if (!order) {
    console.log('\n❌ KHÔNG TÌM THẤY ORDER!');
    console.log('Có thể do:');
    console.log('  1. Order chưa được tạo (user chưa click mua gói)');
    console.log('  2. Order code sai');
    
    // Liệt kê các order gần đây
    console.log('\n--- Các order gần đây: ---');
    const recentOrders = await prisma.paymentOrder.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        orderCode: true,
        status: true,
        amount: true,
        tier: true,
        createdAt: true
      }
    });
    console.table(recentOrders);
  } else {
    console.log('\n✅ TÌM THẤY ORDER!');
    console.log('----------------------------');
    console.log('Order Code:', order.orderCode);
    console.log('Status:', order.status);
    console.log('Tier:', order.tier);
    console.log('Amount cần:', order.amount.toLocaleString() + 'đ');
    console.log('Paid Amount:', order.paidAmount ? order.paidAmount.toLocaleString() + 'đ' : 'chưa thanh toán');
    console.log('User:', order.user?.email || order.userId);
    console.log('User current tier:', order.user?.tier);
    console.log('Note:', order.note);
    console.log('Created:', order.createdAt);
    console.log('Paid at:', order.paidAt);
    console.log('----------------------------');
    
    // Phân tích
    console.log('\n=== PHÂN TÍCH ===');
    const sepayAmount = 1000; // Số tiền SePay báo nhận được
    
    if (order.status === 'completed') {
      console.log('✅ Order đã được xử lý thành công!');
    } else if (order.status === 'pending') {
      console.log('⏳ Order đang pending');
      
      if (sepayAmount >= order.amount) {
        console.log(`✅ Số tiền đủ: ${sepayAmount}đ >= ${order.amount}đ`);
        console.log('→ Webhook nên kích hoạt được gói!');
      } else {
        console.log(`❌ Số tiền THIẾU: ${sepayAmount}đ < ${order.amount}đ`);
        console.log(`→ Thiếu ${order.amount - sepayAmount}đ`);
        console.log('→ Webhook sẽ KHÔNG kích hoạt gói, chỉ ghi note');
      }
    }
  }
  
  await prisma.$disconnect();
}

checkOrder().catch(console.error);
