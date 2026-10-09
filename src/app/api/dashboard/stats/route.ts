import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [stats, reviews] = await Promise.all([db.getDashboardStats(), db.getReviews()]);

    return NextResponse.json({
      success: true,
      stats,
      reviews
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
