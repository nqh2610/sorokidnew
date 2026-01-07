import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';

// GET /api/admin/transactions/export - Xuất danh sách transactions ra CSV
export async function GET(request) {
  try {
    // 🔧 Rate limiting - export là operation nặng
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.STRICT);
    if (rateLimitError) return rateLimitError;

    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const packageType = searchParams.get('package');
    const format = searchParams.get('format') || 'csv'; // csv | json

    // Build where clause
    const where = {};
    if (status && status !== 'all') where.status = status;
    if (packageType && packageType !== 'all') where.tierName = packageType;

    // 🔧 FIX N+1: Dùng include thay vì query từng user
    // Giới hạn 5000 records để tránh memory issue
    const orders = await prisma.paymentOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5000,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    // 🔧 Map trực tiếp - không cần query thêm
    const transactions = orders.map(order => ({
      'Mã đơn': order.orderCode,
      'Khách hàng': order.user?.name || 'N/A',
      'Email': order.user?.email || 'N/A',
      'Gói': order.tierName === 'basic' ? 'Cơ Bản' : order.tierName === 'advanced' ? 'Nâng Cao' : order.tierName,
      'Loại GD': order.transactionType === 'manual' ? 'Admin kích hoạt' : order.transactionType === 'upgrade' ? 'Nâng cấp' : 'Mua mới',
      'Số tiền': order.amount,
      'Đã thanh toán': order.paidAmount || 0,
      'Trạng thái': order.status === 'completed' ? 'Hoàn thành' : order.status === 'pending' ? 'Đang chờ' : order.status === 'cancelled' ? 'Đã hủy' : order.status,
      'Ngày tạo': order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '',
      'Ngày thanh toán': order.paidAt ? new Date(order.paidAt).toLocaleString('vi-VN') : '',
      'Ghi chú': order.note || ''
    }));

    if (format === 'json') {
      return NextResponse.json({ transactions });
    }

    // Convert to CSV
    if (transactions.length === 0) {
      return new NextResponse('Không có dữ liệu', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8'
        }
      });
    }

    const headers = Object.keys(transactions[0]);
    const csvRows = [
      // BOM for Excel UTF-8 compatibility
      '\uFEFF' + headers.join(','),
      ...transactions.map(row => 
        headers.map(h => {
          let val = row[h];
          // Escape quotes and wrap in quotes if contains comma
          if (typeof val === 'string') {
            val = val.replace(/"/g, '""');
            if (val.includes(',') || val.includes('\n')) {
              val = `"${val}"`;
            }
          }
          return val;
        }).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error('Error exporting transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
