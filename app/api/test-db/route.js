import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * 🔧 API Test Database Connection
 * Truy cập: /api/test-db
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = {
    timestamp: new Date().toISOString(),
    database: { status: 'checking...' },
    tables: {}
  };

  try {
    // Test 1: Basic connection
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    result.database.status = 'connected';
    result.database.queryResult = dbTest;

    // Test 2: Count users
    const userCount = await prisma.user.count();
    result.tables.users = userCount;

    // Test 3: Count lessons  
    const lessonCount = await prisma.lesson.count();
    result.tables.lessons = lessonCount;

    // Test 4: Check SystemSettings table
    try {
      const settingsCount = await prisma.systemSettings.count();
      result.tables.systemSettings = settingsCount;
    } catch (e) {
      result.tables.systemSettings = 'ERROR: ' + e.message;
    }

    return NextResponse.json(result);

  } catch (error) {
    result.database.status = 'error';
    result.database.error = {
      name: error.name,
      message: error.message,
      code: error.code
    };
    return NextResponse.json(result, { status: 500 });
  }
}
