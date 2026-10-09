import { NextResponse } from 'next/server';
import { analyzeReview } from '@/lib/analyzerEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { comment, rating, reviewerName, locationName } = body;

    if (!comment) {
      return NextResponse.json({ success: false, error: 'Comment text is required for analysis' }, { status: 400 });
    }

    const analysis = analyzeReview({
      comment,
      rating: rating || 1,
      reviewerName: reviewerName || 'Sample User',
      locationName: locationName || 'Main Business'
    });

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 });
  }
}
