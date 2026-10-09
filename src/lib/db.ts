import fs from 'fs';
import path from 'path';
import { Review, ModerationStatus, DashboardStats } from '@/types/review';
import { INITIAL_MOCK_REVIEWS } from './mockData';

const DB_FILE_PATH = path.join(process.cwd(), 'data_store.json');

export interface DBData {
  reviews: Review[];
  userSession?: {
    isLoggedIn: boolean;
    email: string;
  };
}

// Initialize database file with initial mock dataset if not existing
function getDBData(): DBData {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const initialData: DBData = {
        reviews: INITIAL_MOCK_REVIEWS,
        userSession: { isLoggedIn: true, email: 'admin@googleflags.com' }
      };
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Database Read Error:', err);
    return { reviews: INITIAL_MOCK_REVIEWS };
  }
}

function saveDBData(data: DBData): void {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Database Write Error:', err);
  }
}

export const db = {
  getReviews(): Review[] {
    const data = getDBData();
    return data.reviews;
  },

  addReview(newReview: Review): Review {
    const data = getDBData();
    // Prevent duplicates by ID or Google URL
    const existingIndex = data.reviews.findIndex(
      (r) => r.id === newReview.id || (newReview.googleReviewUrl && r.googleReviewUrl === newReview.googleReviewUrl)
    );

    if (existingIndex >= 0) {
      data.reviews[existingIndex] = { ...data.reviews[existingIndex], ...newReview };
    } else {
      data.reviews.unshift(newReview);
    }

    saveDBData(data);
    return newReview;
  },

  updateReviewStatus(id: string, status: ModerationStatus, notes?: string): Review | null {
    const data = getDBData();
    const index = data.reviews.findIndex((r) => r.id === id);
    if (index === -1) return null;

    data.reviews[index].status = status;
    if (status === 'PENDING_GOOGLE_REVIEW') {
      data.reviews[index].flaggedAt = new Date().toISOString().split('T')[0];
    }
    if (notes !== undefined) {
      data.reviews[index].notes = notes;
    }

    saveDBData(data);
    return data.reviews[index];
  },

  getDashboardStats(): DashboardStats {
    const reviews = this.getReviews();
    const totalReviews = reviews.length;
    const flaggedCount = reviews.filter((r) => r.status === 'PENDING_GOOGLE_REVIEW' || r.status === 'REMOVED').length;
    const pendingGoogleCount = reviews.filter((r) => r.status === 'PENDING_GOOGLE_REVIEW').length;
    const removedCount = reviews.filter((r) => r.status === 'REMOVED').length;
    const highRiskCount = reviews.filter((r) => r.analysis?.riskLevel === 'HIGH').length;
    const totalStars = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = totalReviews > 0 ? Number((totalStars / totalReviews).toFixed(1)) : 5.0;

    return {
      totalReviews,
      flaggedCount,
      pendingGoogleCount,
      removedCount,
      highRiskCount,
      averageRating
    };
  }
};
