import { NextResponse } from 'next/server';
import { GoogleBusinessProfileClient } from '@/lib/gbpClient';
import { sendHighRiskReviewAlert, DEFAULT_NOTIFICATION_CONFIG, NotificationConfig } from '@/lib/notificationService';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, accountId, locationName, notificationConfig } = body;

    const client = new GoogleBusinessProfileClient(token, accountId);
    const syncResult = await client.syncReviews(locationName || 'Downtown Branch');

    // Run notification alerts for high risk violations
    const alertLogs: string[] = [];
    const activeConfig: NotificationConfig = notificationConfig || DEFAULT_NOTIFICATION_CONFIG;

    for (const review of syncResult.reviews) {
      if (review.analysis?.isViolating && review.analysis.riskLevel === 'HIGH') {
        const alertResult = await sendHighRiskReviewAlert(review, activeConfig);
        alertLogs.push(...alertResult.logs);
      }
    }

    return NextResponse.json({
      success: true,
      syncResult,
      alertLogs
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
