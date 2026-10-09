import { Review } from '@/types/review';
import { analyzeReview } from './analyzerEngine';
import { parseGoogleReviewUrl } from './urlParser';

export interface CSVRowData {
  url?: string;
  comment?: string;
  rating?: number | string;
  name?: string;
  location?: string;
}

export function parseCSVContent(csvText: string): Review[] {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // Check if first line is header
  const firstLine = lines[0].toLowerCase();
  const hasHeader = firstLine.includes('url') || firstLine.includes('comment') || firstLine.includes('text') || firstLine.includes('rating');

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const parsedReviews: Review[] = [];

  dataLines.forEach((line, index) => {
    // Basic CSV comma splitting (handling simple quotes)
    const columns = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map((col) => col.replace(/^"|"$/g, '').trim());

    let url = '';
    let comment = '';
    let rating = 1;
    let name = `Reviewer #${index + 1}`;
    let location = 'Google Business';

    if (hasHeader) {
      const headerCols = lines[0].toLowerCase().split(',').map((h) => h.replace(/^"|"$/g, '').trim());
      headerCols.forEach((h, colIdx) => {
        const val = columns[colIdx] || '';
        if (h.includes('url') || h.includes('link')) url = val;
        else if (h.includes('comment') || h.includes('text') || h.includes('review')) comment = val;
        else if (h.includes('rating') || h.includes('star')) rating = Number(val) || 1;
        else if (h.includes('name') || h.includes('author') || h.includes('user')) name = val;
        else if (h.includes('location') || h.includes('branch')) location = val;
      });
    } else {
      // Fallback: If 1st column starts with http, treat as URL
      if (columns[0]?.startsWith('http')) {
        url = columns[0];
        comment = columns[1] || '';
        rating = Number(columns[2]) || 1;
      } else {
        comment = columns[0] || '';
        rating = Number(columns[1]) || 1;
      }
    }

    const parsedUrl = parseGoogleReviewUrl(url);

    const reviewObj: Partial<Review> = {
      id: `csv-${Date.now()}-${index}`,
      reviewerName: name || 'Google User',
      rating: Number(rating) || 1,
      comment: comment || 'Review imported via CSV.',
      datePosted: new Date().toISOString().split('T')[0],
      locationName: location,
      status: 'ACTIVE',
      googleReviewUrl: parsedUrl.directReportUrl || url || 'https://maps.google.com'
    };

    parsedReviews.push({
      ...(reviewObj as Review),
      analysis: analyzeReview(reviewObj)
    });
  });

  return parsedReviews;
}

export function generateSampleCSV(): string {
  return `URL,Reviewer_Name,Rating,Comment_Text
https://www.google.com/maps/reviews/data=!4m8!14m7!,Alex Mercer (Ex-Staff),1,The manager fired me last week just because I asked for my paycheck. Corrupt workplace!
https://www.google.com/maps/reviews/data=!4m8!14m7!,CryptoBot99,1,Scam business! Join Telegram @FastCryptoProfit to get refund or paid 5 star reviews https://scam-site.com
https://www.google.com/maps/reviews/data=!4m8!14m7!,Apex Competitor,1,Horrible experience! Instead go to Apex Dental across town they have better staff and lower prices.
https://www.google.com/maps/reviews/data=!4m8!14m7!,Sarah Jenkins,5,Great service and friendly doctors!
`;
}
