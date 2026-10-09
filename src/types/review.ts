export type ViolationCategory =
  | 'SPAM_OR_FAKE'
  | 'MULTIPLE_REVIEWS'
  | 'OFFENSIVE_OR_HATE'
  | 'COMPETITOR_CONFLICT'
  | 'WRONG_BUSINESS'
  | 'WRONG_LOCATION'
  | 'EMPLOYEE_CONFLICT'
  | 'IRRELEVANT_OFFTOPIC'
  | 'INAPPROPRIATE_MEDIA'
  | 'NONE';

export type ModerationStatus = 'ACTIVE' | 'PENDING_GOOGLE_REVIEW' | 'REMOVED' | 'DISMISSED';

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface PolicyViolation {
  category: ViolationCategory;
  ruleNumber: number;
  ruleTitle: string;
  confidenceScore: number; // 0 to 100
  evidence: string[];
  justificationTemplate: string;
}

export interface AnalysisResult {
  isViolating: boolean;
  riskLevel: RiskLevel;
  primaryViolation?: PolicyViolation;
  secondaryViolations: PolicyViolation[];
  suggestedAction: string;
  generatedReportReason: string;
}

export interface AutomatedSubmissionDetails {
  reportId: string;
  submittedAt: string;
  submittedBy: string;
  clientId?: string;
  status: string;
  queueStatus: string;
  policyRuleCited: string;
  channel: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatar?: string;
  reviewerHistoryCount?: number;
  rating: number; // 1 to 5
  comment: string;
  datePosted: string;
  locationName: string;
  googleReviewUrl?: string;
  status: ModerationStatus;
  analysis?: AnalysisResult;
  flaggedAt?: string;
  notes?: string;
  automatedSubmission?: AutomatedSubmissionDetails;
}

export interface DashboardStats {
  totalReviews: number;
  flaggedCount: number;
  pendingGoogleCount: number;
  removedCount: number;
  highRiskCount: number;
  averageRating: number;
}
