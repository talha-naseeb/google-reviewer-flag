import { Review } from '@/types/review';
import { analyzeReview } from './analyzerEngine';

const rawMockReviews: Omit<Review, 'analysis'>[] = [
  {
    id: 'rev-001',
    reviewerName: 'Alex Mercer (Ex-Staff)',
    reviewerHistoryCount: 2,
    rating: 1,
    comment: 'The owner fired me last week just because I was 5 mins late. Terrible place to work, management is total scum and corrupt!',
    datePosted: '2026-10-06',
    locationName: 'Downtown Branch',
    status: 'ACTIVE',
    googleReviewUrl: 'https://maps.google.com/?cid=123456789'
  },
  {
    id: 'rev-002',
    reviewerName: 'CryptoPromoBot_99',
    reviewerHistoryCount: 1,
    rating: 1,
    comment: 'Scam service! Don’t waste your money here. Join Telegram @FastProfitReviews to get guaranteed 5-star ratings or refund https://fake-crypto-site.example.com',
    datePosted: '2026-10-07',
    locationName: 'Downtown Branch',
    status: 'ACTIVE',
    googleReviewUrl: 'https://maps.google.com/?cid=123456789'
  },
  {
    id: 'rev-003',
    reviewerName: 'Apex Dental Competitor',
    reviewerHistoryCount: 4,
    rating: 1,
    comment: 'Horrible experience! Instead go to Apex Dental across town, they have better staff, lower prices and free coffee in waiting area.',
    datePosted: '2026-10-05',
    locationName: 'Westside Clinic',
    status: 'PENDING_GOOGLE_REVIEW',
    flaggedAt: '2026-10-06',
    googleReviewUrl: 'https://maps.google.com/?cid=987654321'
  },
  {
    id: 'rev-004',
    reviewerName: 'David K.',
    reviewerHistoryCount: 19,
    rating: 1,
    comment: 'The staff was completely unhelpful and rude! An absolute idiot behind the counter called me a bitch when I asked for a refund.',
    datePosted: '2026-10-04',
    locationName: 'Downtown Branch',
    status: 'ACTIVE',
    googleReviewUrl: 'https://maps.google.com/?cid=123456789'
  },
  {
    id: 'rev-005',
    reviewerName: 'PoliticalRant2026',
    reviewerHistoryCount: 3,
    rating: 1,
    comment: 'I saw on news that the owners support the new election candidate. Boycott this company! Unacceptable political stance!',
    datePosted: '2026-10-02',
    locationName: 'Westside Clinic',
    status: 'REMOVED',
    flaggedAt: '2026-10-03',
    googleReviewUrl: 'https://maps.google.com/?cid=987654321'
  },
  {
    id: 'rev-006',
    reviewerName: 'Sarah Jenkins',
    reviewerHistoryCount: 42,
    rating: 5,
    comment: 'Absolutely outstanding service! Dr. Smith took time to explain everything clearly and the front desk staff was very welcoming.',
    datePosted: '2026-09-28',
    locationName: 'Downtown Branch',
    status: 'ACTIVE',
    googleReviewUrl: 'https://maps.google.com/?cid=123456789'
  },
  {
    id: 'rev-007',
    reviewerName: 'Michael Brown',
    reviewerHistoryCount: 12,
    rating: 2,
    comment: 'The wait time was longer than scheduled (about 35 minutes late). The treatment was good, but time management needs improvement.',
    datePosted: '2026-09-25',
    locationName: 'Westside Clinic',
    status: 'ACTIVE',
    googleReviewUrl: 'https://maps.google.com/?cid=987654321'
  }
];

export const INITIAL_MOCK_REVIEWS: Review[] = rawMockReviews.map((r) => ({
  ...r,
  analysis: analyzeReview(r)
}));
