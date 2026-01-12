import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username || username.length < 3) {
      return NextResponse.json({ available: false });
    }

    const normalizedUsername = username.trim().toLowerCase();

    // Kiểm tra username có tồn tại không
    const existingUser = await prisma.user.findUnique({
      where: { username: normalizedUsername },
      select: { id: true }
    });

    return NextResponse.json({
      available: !existingUser
    });
  } catch (error) {
    console.error('Check username error:', error);
    return NextResponse.json({ available: false });
  }
}
