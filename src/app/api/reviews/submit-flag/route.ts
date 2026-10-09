import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Review } from '@/types/review';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { review } = body as { review: Review };

    if (!review || !review.id) {
      return NextResponse.json({ success: false, error: 'Valid review object is required' }, { status: 400 });
    }

    const reviewToSave: Review = {
      ...review,
      status: 'PENDING_GOOGLE_REVIEW',
      flaggedAt: new Date().toISOString().split('T')[0]
    };

    const saved = db.addReview(reviewToSave);
    const updatedStats = db.getDashboardStats();

    return NextResponse.json({
      success: true,
      message: 'Review flag submission saved to database.',
      savedReview: saved,
      stats: updatedStats
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
