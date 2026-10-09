import { NextResponse } from 'next/server';
import { INITIAL_MOCK_REVIEWS } from '@/lib/mockData';
import { analyzeReview } from '@/lib/analyzerEngine';
import { Review } from '@/types/review';

// Simple in-memory store for demo/development
let reviewsStore: Review[] = [...INITIAL_MOCK_REVIEWS];

export async function GET() {
  return NextResponse.json({ success: true, reviews: reviewsStore });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reviewerName, rating, comment, locationName } = body;

    if (!reviewerName || !comment) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      reviewerName,
      rating: Number(rating) || 1,
      comment,
      datePosted: new Date().toISOString().split('T')[0],
      locationName: locationName || 'Downtown Branch',
      status: 'ACTIVE',
      googleReviewUrl: 'https://maps.google.com'
    };

    newReview.analysis = analyzeReview(newReview);

    reviewsStore.unshift(newReview);

    return NextResponse.json({ success: true, review: newReview });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to process review' }, { status: 500 });
  }
}
