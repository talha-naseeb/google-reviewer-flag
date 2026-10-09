import { NextResponse } from 'next/server';
import { INITIAL_MOCK_REVIEWS } from '@/lib/mockData';
import { ModerationStatus } from '@/types/review';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, notes } = body as { status?: ModerationStatus; notes?: string };

    const reviewIndex = INITIAL_MOCK_REVIEWS.findIndex((r) => r.id === id);
    if (reviewIndex === -1) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    if (status) {
      INITIAL_MOCK_REVIEWS[reviewIndex].status = status;
      if (status === 'PENDING_GOOGLE_REVIEW') {
        INITIAL_MOCK_REVIEWS[reviewIndex].flaggedAt = new Date().toISOString().split('T')[0];
      }
    }

    if (notes !== undefined) {
      INITIAL_MOCK_REVIEWS[reviewIndex].notes = notes;
    }

    return NextResponse.json({ success: true, review: INITIAL_MOCK_REVIEWS[reviewIndex] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
