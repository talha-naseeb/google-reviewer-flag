import { Review, AnalysisResult, PolicyViolation, RiskLevel, ViolationCategory } from '@/types/review';
import { GOOGLE_POLICY_RULES } from './policyRules';

export function analyzeReview(review: Partial<Review>): AnalysisResult {
  const text = (review.comment || '').toLowerCase();
  const rating = review.rating || 5;
  const reviewerName = review.reviewerName || 'Anonymous';
  const locationName = review.locationName || 'Our Business';
  const historyCount = review.reviewerHistoryCount ?? 1;

  const foundViolations: PolicyViolation[] = [];

  // Check 1: Employee Conflict (Rule #7)
  if (
    text.includes('fired') ||
    text.includes('worked here') ||
    text.includes('my boss') ||
    text.includes('ex-employee') ||
    text.includes('former employee') ||
    /worked (for|at) this place/i.test(text)
  ) {
    const rule = GOOGLE_POLICY_RULES.EMPLOYEE_CONFLICT;
    foundViolations.push({
      category: 'EMPLOYEE_CONFLICT',
      ruleNumber: rule.ruleNumber,
      ruleTitle: rule.title,
      confidenceScore: 92,
      evidence: ['Text explicitly mentions employment status or termination ("fired", "ex-employee", "worked here")'],
      justificationTemplate: rule.template({
        reviewerName,
        locationName,
        specificEvidence: 'Review contains explicit mentions of employment history and manager dispute.'
      })
    });
  }

  // Check 2: Competitor Conflict (Rule #4)
  if (
    text.includes('go to') ||
    text.includes('instead go') ||
    text.includes('better alternative') ||
    text.includes('our salon') ||
    text.includes('our shop') ||
    /visit [a-z0-9\s]+ (down the street|across town)/i.test(text)
  ) {
    const rule = GOOGLE_POLICY_RULES.COMPETITOR_CONFLICT;
    foundViolations.push({
      category: 'COMPETITOR_CONFLICT',
      ruleNumber: rule.ruleNumber,
      ruleTitle: rule.title,
      confidenceScore: 88,
      evidence: ['Review redirects customers to a named competing business'],
      justificationTemplate: rule.template({
        reviewerName,
        locationName,
        specificEvidence: 'Review contains commercial redirection promoting a competing business.'
      })
    });
  }

  // Check 3: Offensive or Hate Speech (Rule #3)
  const profanityMatches = text.match(/\b(fck|fuck|shit|bitch|asshole|idiot|scum|racist)\b/gi);
  if (profanityMatches && profanityMatches.length > 0) {
    const rule = GOOGLE_POLICY_RULES.OFFENSIVE_OR_HATE;
    foundViolations.push({
      category: 'OFFENSIVE_OR_HATE',
      ruleNumber: rule.ruleNumber,
      ruleTitle: rule.title,
      confidenceScore: 95,
      evidence: [`Contains explicit prohibited profanity/harassment terms: "${profanityMatches.join(', ')}"`],
      justificationTemplate: rule.template({
        reviewerName,
        locationName,
        specificEvidence: `Contains prohibited harassing terms (${profanityMatches.join(', ')}).`
      })
    });
  }

  // Check 4: Spam / Bot Profile (Rule #1)
  const containsUrl = /(https?:\/\/[^\s]+)/gi.test(text);
  const isGenericShort1Star = rating === 1 && (text === 'bad' || text === 'worst' || text === 'scam' || text === 'terrible');
  const isNewAccountSurge = historyCount === 1 && rating === 1 && text.length < 15;

  if (containsUrl || isGenericShort1Star || isNewAccountSurge) {
    const rule = GOOGLE_POLICY_RULES.SPAM_OR_FAKE;
    const evidenceList: string[] = [];
    if (containsUrl) evidenceList.push('Contains external URL link in review text');
    if (isGenericShort1Star) evidenceList.push('Single-word 1-star generic spam phrase');
    if (isNewAccountSurge) evidenceList.push('Brand new 1-review account with minimal non-specific text');

    foundViolations.push({
      category: 'SPAM_OR_FAKE',
      ruleNumber: rule.ruleNumber,
      ruleTitle: rule.title,
      confidenceScore: containsUrl ? 98 : 85,
      evidence: evidenceList,
      justificationTemplate: rule.template({
        reviewerName,
        locationName,
        specificEvidence: evidenceList.join('; ')
      })
    });
  }

  // Check 5: Irrelevant / Off-Topic (Rule #8)
  if (
    text.includes('biden') ||
    text.includes('trump') ||
    text.includes('politics') ||
    text.includes('saw on news') ||
    text.includes('twitter thread')
  ) {
    const rule = GOOGLE_POLICY_RULES.IRRELEVANT_OFFTOPIC;
    foundViolations.push({
      category: 'IRRELEVANT_OFFTOPIC',
      ruleNumber: rule.ruleNumber,
      ruleTitle: rule.title,
      confidenceScore: 90,
      evidence: ['Review discusses political or news topics unrelated to customer experience'],
      justificationTemplate: rule.template({
        reviewerName,
        locationName,
        specificEvidence: 'Review focuses on external news/political topics rather than first-hand service.'
      })
    });
  }

  // Check 6: Multiple Reviews / Duplicate (Rule #2)
  if (text.includes('posted twice') || text.includes('second review') || text.includes('my husband wrote')) {
    const rule = GOOGLE_POLICY_RULES.MULTIPLE_REVIEWS;
    foundViolations.push({
      category: 'MULTIPLE_REVIEWS',
      ruleNumber: rule.ruleNumber,
      ruleTitle: rule.title,
      confidenceScore: 84,
      evidence: ['Reviewer acknowledges posting multiple reviews for the same encounter'],
      justificationTemplate: rule.template({
        reviewerName,
        locationName,
        specificEvidence: 'Duplicate posting acknowledged by user.'
      })
    });
  }

  // Determine Primary vs Secondary Violation
  if (foundViolations.length === 0) {
    return {
      isViolating: false,
      riskLevel: rating <= 2 ? 'LOW' : 'NONE',
      secondaryViolations: [],
      suggestedAction: rating <= 2 ? 'Respond professionally to attempt customer recovery.' : 'No action required.',
      generatedReportReason: 'No Google Policy violation detected. Rating represents standard subjective feedback.'
    };
  }

  // Sort by confidence score
  foundViolations.sort((a, b) => b.confidenceScore - a.confidenceScore);

  const primaryViolation = foundViolations[0];
  const secondaryViolations = foundViolations.slice(1);

  let riskLevel: RiskLevel = 'MEDIUM';
  if (primaryViolation.confidenceScore >= 90) {
    riskLevel = 'HIGH';
  } else if (primaryViolation.confidenceScore < 75) {
    riskLevel = 'LOW';
  }

  return {
    isViolating: true,
    riskLevel,
    primaryViolation,
    secondaryViolations,
    suggestedAction: `Flag review under Google Policy Rule #${primaryViolation.ruleNumber} (${primaryViolation.ruleTitle}).`,
    generatedReportReason: primaryViolation.justificationTemplate
  };
}
