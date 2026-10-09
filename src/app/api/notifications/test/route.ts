import { NextResponse } from 'next/server';
import { sendHighRiskReviewAlert, NotificationConfig } from '@/lib/notificationService';
import { Review } from '@/types/review';
import { analyzeReview } from '@/lib/analyzerEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { webhookUrl, alertEmailRecipient } = body;

    const sampleHighRiskReview: Partial<Review> = {
      id: `test-${Date.now()}`,
      reviewerName: 'Test_Fake_Bot',
      rating: 1,
      comment: 'Fired by manager yesterday! Corrupt staff scum! Go to rival store instead Telegram @scam',
      datePosted: new Date().toISOString().split('T')[0],
      locationName: 'Main Branch Test'
    };

    const reviewObj: Review = {
      ...(sampleHighRiskReview as Review),
      analysis: analyzeReview(sampleHighRiskReview)
    };

    const testConfig: NotificationConfig = {
      enableWebhookAlerts: Boolean(webhookUrl),
      webhookUrl: webhookUrl || '',
      enableEmailAlerts: Boolean(alertEmailRecipient),
      alertEmailRecipient: alertEmailRecipient || '',
      minRiskLevelToAlert: 'HIGH'
    };

    const result = await sendHighRiskReviewAlert(reviewObj, testConfig);

    return NextResponse.json({
      success: true,
      message: 'Test notification dispatch completed.',
      result
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
