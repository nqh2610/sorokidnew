import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, validateEmail, validatePassword, validateUsername } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { email, username, password, name } = await request.json();
    if (!validateEmail(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    if (!validateUsername(username)) return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
    if (!validatePassword(password)) return NextResponse.json({ error: 'Password too short' }, { status: 400 });
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) return NextResponse.json({ error: 'User exists' }, { status: 409 });
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({ data: { email, username, password: hashedPassword, name, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}` } });
    return NextResponse.json({ message: 'Success', user }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
