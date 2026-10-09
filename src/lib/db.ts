import { Collection } from 'mongodb';
import { Review, ModerationStatus, DashboardStats } from '@/types/review';
import { getDb } from './mongodb';

let indexesReady = false;

async function reviewsCollection(): Promise<Collection<Review>> {
  const database = await getDb();
  const col = database.collection<Review>('reviews');
  if (!indexesReady) {
    await col.createIndex({ id: 1 }, { unique: true });
    await col.createIndex({ googleReviewUrl: 1 });
    indexesReady = true;
  }
  return col;
}

const noId = { projection: { _id: 0 } } as const;

export const db = {
  async getReviews(): Promise<Review[]> {
    const col = await reviewsCollection();
    return col.find({}, noId).sort({ flaggedAt: -1, _id: -1 }).toArray() as Promise<Review[]>;
  },

  async addReview(newReview: Review): Promise<Review> {
    const col = await reviewsCollection();
    // Upsert by id, or by Google URL so re-flagging the same link updates instead of duplicating.
    const filter = newReview.googleReviewUrl
      ? { $or: [{ id: newReview.id }, { googleReviewUrl: newReview.googleReviewUrl }] }
      : { id: newReview.id };

    const existing = await col.findOne(filter, noId);
    if (existing) {
      const { id: _ignored, ...rest } = newReview;
      await col.updateOne({ id: existing.id }, { $set: rest });
      return { ...existing, ...rest } as Review;
    }
    await col.insertOne({ ...newReview });
    return newReview;
  },

  async updateReviewStatus(id: string, status: ModerationStatus, notes?: string): Promise<Review | null> {
    const col = await reviewsCollection();
    const set: Partial<Review> = { status };
    if (status === 'PENDING_GOOGLE_REVIEW') {
      set.flaggedAt = new Date().toISOString().split('T')[0];
    }
    if (notes !== undefined) set.notes = notes;

    const updated = await col.findOneAndUpdate(
      { id },
      { $set: set },
      { returnDocument: 'after', projection: { _id: 0 } }
    );
    return (updated as Review | null) ?? null;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const reviews = await this.getReviews();
    const totalReviews = reviews.length;
    const flaggedCount = reviews.filter((r) => r.status === 'PENDING_GOOGLE_REVIEW' || r.status === 'REMOVED').length;
    const pendingGoogleCount = reviews.filter((r) => r.status === 'PENDING_GOOGLE_REVIEW').length;
    const removedCount = reviews.filter((r) => r.status === 'REMOVED').length;
    const highRiskCount = reviews.filter((r) => r.analysis?.riskLevel === 'HIGH').length;
    const totalStars = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = totalReviews > 0 ? Number((totalStars / totalReviews).toFixed(1)) : 5.0;

    return { totalReviews, flaggedCount, pendingGoogleCount, removedCount, highRiskCount, averageRating };
  }
};
