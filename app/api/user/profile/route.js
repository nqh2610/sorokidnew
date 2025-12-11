import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/user/profile - Lấy thông tin profile
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        level: true,
        totalStars: true,
        diamonds: true,
        streak: true,
        lastLoginDate: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get tier info
    let tier = 'free';
    try {
      const userTier = await prisma.userTier.findUnique({
        where: { userId: user.id }
      });
      if (userTier && (!userTier.expiresAt || new Date(userTier.expiresAt) > new Date())) {
        tier = userTier.tierName;
      }
    } catch (e) {
      // Table might not exist
    }

    return NextResponse.json({ 
      user: { ...user, tier }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/user/profile - Cập nhật profile
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, username, avatar, age } = await request.json();

    // Validate username
    if (username) {
      // Check format
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return NextResponse.json({ 
          error: 'Username chỉ được chứa chữ, số và dấu gạch dưới' 
        }, { status: 400 });
      }

      if (username.length < 3) {
        return NextResponse.json({ 
          error: 'Username phải có ít nhất 3 ký tự' 
        }, { status: 400 });
      }

      // Check if username already taken
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: session.user.id }
        }
      });

      if (existingUser) {
        return NextResponse.json({ 
          error: 'Username này đã được sử dụng' 
        }, { status: 400 });
      }
    }

    // Build update data
    const updateData = {};
    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (avatar) updateData.avatar = avatar;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
