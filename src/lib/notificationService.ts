import { Review, PolicyViolation } from '@/types/review';

export interface NotificationConfig {
  enableEmailAlerts: boolean;
  alertEmailRecipient: string;
  enableWebhookAlerts: boolean;
  webhookUrl: string;
  minRiskLevelToAlert: 'HIGH' | 'MEDIUM' | 'ALL';
}

export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  enableEmailAlerts: true,
  alertEmailRecipient: 'manager@business.com',
  enableWebhookAlerts: false,
  webhookUrl: 'https://hooks.slack.com/services/EXAMPLE/WEBHOOK/12345',
  minRiskLevelToAlert: 'HIGH'
};

export async function sendHighRiskReviewAlert(
  review: Review,
  config: NotificationConfig = DEFAULT_NOTIFICATION_CONFIG
): Promise<{ webhookSuccess: boolean; emailSuccess: boolean; logs: string[] }> {
  const logs: string[] = [];
  let webhookSuccess = false;
  let emailSuccess = false;

  const violation = review.analysis?.primaryViolation;
  const riskLevel = review.analysis?.riskLevel || 'MEDIUM';

  // Check if risk level meets filter
  if (config.minRiskLevelToAlert === 'HIGH' && riskLevel !== 'HIGH') {
    logs.push(`Alert skipped: Risk level (${riskLevel}) below configured threshold (HIGH).`);
    return { webhookSuccess: false, emailSuccess: false, logs };
  }

  // Build Payload
  const payload = {
    event: 'HIGH_RISK_GOOGLE_REVIEW_DETECTED',
    timestamp: new Date().toISOString(),
    review: {
      id: review.id,
      reviewerName: review.reviewerName,
      rating: review.rating,
      comment: review.comment,
      locationName: review.locationName,
      googleReviewUrl: review.googleReviewUrl
    },
    policyViolation: {
      ruleNumber: violation?.ruleNumber,
      ruleTitle: violation?.ruleTitle,
      confidenceScore: violation?.confidenceScore,
      evidence: violation?.evidence
    },
    generatedReportJustification: review.analysis?.generatedReportReason
  };

  // 1. Dispatch Webhook (Slack / Discord / Zapier format)
  if (config.enableWebhookAlerts && config.webhookUrl) {
    try {
      const isSlack = config.webhookUrl.includes('slack.com');
      const formattedBody = isSlack
        ? {
            text: `🚨 *High Risk Fake Google Review Detected!*`,
            attachments: [
              {
                color: '#f43f5e', // rose-500
                fields: [
                  { title: 'Location', value: review.locationName, short: true },
                  { title: 'Rating', value: `${review.rating}/5 Stars`, short: true },
                  { title: 'Reviewer', value: review.reviewerName, short: true },
                  { title: 'Violation Matched', value: `Rule #${violation?.ruleNumber}: ${violation?.ruleTitle}`, short: true },
                  { title: 'Comment', value: `"${review.comment}"`, short: false },
                  { title: 'AI Evidence', value: violation?.evidence.join('; ') || 'N/A', short: false }
                ]
              }
            ]
          }
        : payload;

      const res = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedBody)
      });

      if (res.ok) {
        webhookSuccess = true;
        logs.push(`Successfully dispatched webhook alert to ${config.webhookUrl}`);
      } else {
        logs.push(`Webhook HTTP error: ${res.status} ${res.statusText}`);
      }
    } catch (err: any) {
      logs.push(`Webhook dispatch error: ${err.message}`);
    }
  } else {
    logs.push('Webhook alert disabled or URL not configured.');
  }

  // 2. Dispatch Email Notification Simulation
  if (config.enableEmailAlerts && config.alertEmailRecipient) {
    emailSuccess = true;
    logs.push(`Simulated Email alert sent to ${config.alertEmailRecipient}`);
  }

  return { webhookSuccess, emailSuccess, logs };
}
