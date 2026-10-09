import { ViolationCategory } from '@/types/review';

export interface PolicyRuleDefinition {
  ruleNumber: number;
  category: ViolationCategory;
  title: string;
  shortDescription: string;
  fullPolicyReference: string;
  keywords: string[];
  patterns: RegExp[];
  template: (details: { reviewerName: string; locationName: string; specificEvidence: string }) => string;
}

export const GOOGLE_POLICY_RULES: Record<ViolationCategory, PolicyRuleDefinition> = {
  SPAM_OR_FAKE: {
    ruleNumber: 1,
    category: 'SPAM_OR_FAKE',
    title: 'Spam or Fake Content',
    shortDescription: 'Bot accounts, generic copy-paste text, suspicious rating bursts.',
    fullPolicyReference: 'Google Maps User Contributed Content Policy - Spam & Deceptive Content',
    keywords: ['fake', 'scam', 'bot', 'spam', 'paid review', 'buy reviews', 'crypto', 'telegram', 'whatsapp'],
    patterns: [
      /(https?:\/\/[^\s]+)/gi,
      /(reach out to us|whatsapp|telegram|contact @)/gi,
      /^(worst|bad|terrible|scam|avoid)$/i
    ],
    template: ({ reviewerName, specificEvidence }) =>
      `Request for removal under Google's Spam & Deceptive Content Policy. The review from "${reviewerName}" contains characteristics of automated/fake content. Evidence: ${specificEvidence}. This content does not represent a genuine customer experience.`
  },
  MULTIPLE_REVIEWS: {
    ruleNumber: 2,
    category: 'MULTIPLE_REVIEWS',
    title: 'Multiple Reviews for Same Experience',
    shortDescription: 'Duplicates or multiple accounts reviewing a single transaction.',
    fullPolicyReference: 'Google Maps Policy - Conflict of Interest / Duplicate Posting',
    keywords: ['posted twice', 'second review', 'another account', 'my husband wrote', 'my wife wrote'],
    patterns: [
      /(already wrote a review|posted earlier|second account)/gi
    ],
    template: ({ reviewerName, specificEvidence }) =>
      `Request for removal under Google's Duplicate Posting Policy. User "${reviewerName}" has posted multiple reviews regarding the same single service encounter. Evidence: ${specificEvidence}.`
  },
  OFFENSIVE_OR_HATE: {
    ruleNumber: 3,
    category: 'OFFENSIVE_OR_HATE',
    title: 'Offensive, Hateful or Discriminatory Content',
    shortDescription: 'Profanity, hate speech, personal attacks, or harassment.',
    fullPolicyReference: 'Google Prohibited Content Policy - Offensive & Harassing Language',
    keywords: ['idiot', 'stupid', 'bitch', 'asshole', 'racist', 'hate', 'fucking', 'bastard', 'crap'],
    patterns: [
      /\b(fck|fuck|shit|bitch|asshole|idiot|scum)\b/gi
    ],
    template: ({ reviewerName, specificEvidence }) =>
      `Request for removal under Google's Prohibited Content Policy (Harassment & Abusive Language). The review posted by "${reviewerName}" contains explicit profanity or harassing language. Evidence: ${specificEvidence}.`
  },
  COMPETITOR_CONFLICT: {
    ruleNumber: 4,
    category: 'COMPETITOR_CONFLICT',
    title: 'Competitor Conflict of Interest',
    shortDescription: 'Reviews posted by competing businesses or rival staff.',
    fullPolicyReference: 'Google Maps Policy - Conflict of Interest (Competitor Posting)',
    keywords: ['go to', 'better alternative', 'instead go to', 'our salon', 'our shop', 'my company', 'we offer'],
    patterns: [
      /(go to [A-Z0-9\s]+ instead|visit [A-Z0-9\s]+ down the street|our business provides)/gi
    ],
    template: ({ reviewerName, locationName, specificEvidence }) =>
      `Request for removal under Google's Conflict of Interest Policy. The review for "${locationName}" from "${reviewerName}" promotes or originates from a competitor. Evidence: ${specificEvidence}.`
  },
  WRONG_BUSINESS: {
    ruleNumber: 5,
    category: 'WRONG_BUSINESS',
    title: 'Wrong Business Mentioned',
    shortDescription: 'Review references products, staff, or services not offered here.',
    fullPolicyReference: 'Google Maps Policy - Off-Topic & Misattributed Reviews',
    keywords: ['wrong place', 'never been', 'wrong store', 'pizza', 'car repair', 'dentist'], // context dependent
    patterns: [
      /(wrong business|intended for|meant to review)/gi
    ],
    template: ({ reviewerName, locationName, specificEvidence }) =>
      `Request for removal under Google's Misattributed Content Policy. Reviewer "${reviewerName}" describes services or products not provided by "${locationName}". Evidence: ${specificEvidence}.`
  },
  WRONG_LOCATION: {
    ruleNumber: 6,
    category: 'WRONG_LOCATION',
    title: 'Wrong Location Mix-up',
    shortDescription: 'Review intended for a different branch or franchise location.',
    fullPolicyReference: 'Google Maps Policy - Misattributed Location Content',
    keywords: ['other branch', 'downtown branch', 'airport location', 'other store'],
    patterns: [
      /(at the [A-Z0-9\s]+ location|visited your [A-Z0-9\s]+ branch)/gi
    ],
    template: ({ reviewerName, locationName, specificEvidence }) =>
      `Request for removal under Google's Misattributed Location Policy. The review for "${locationName}" explicitly references an event at a different location. Evidence: ${specificEvidence}.`
  },
  EMPLOYEE_CONFLICT: {
    ruleNumber: 7,
    category: 'EMPLOYEE_CONFLICT',
    title: 'Current or Former Employee Review',
    shortDescription: 'Reviews written by current staff or disgruntled ex-employees.',
    fullPolicyReference: 'Google Maps Policy - Conflict of Interest (Employee Reviews)',
    keywords: ['fired me', 'my boss', 'ex-employee', 'former employee', 'worked here', 'management fired'],
    patterns: [
      /(worked here for|when i was employed|fired me|my manager|ex-staff)/gi
    ],
    template: ({ reviewerName, locationName, specificEvidence }) =>
      `Request for removal under Google's Conflict of Interest Policy (Employee Reviews). Reviewer "${reviewerName}" is a current or former employee evaluating their employer "${locationName}". Evidence: ${specificEvidence}.`
  },
  IRRELEVANT_OFFTOPIC: {
    ruleNumber: 8,
    category: 'IRRELEVANT_OFFTOPIC',
    title: 'Irrelevant or Off-Topic Content',
    shortDescription: 'Rants about politics, news stories, or unrelated issues.',
    fullPolicyReference: 'Google Maps Policy - Off-Topic Content',
    keywords: ['government', 'politics', 'biden', 'trump', 'news story', 'boycott', 'social media'],
    patterns: [
      /(saw on the news|political stance|boycott this|read on twitter)/gi
    ],
    template: ({ reviewerName, specificEvidence }) =>
      `Request for removal under Google's Off-Topic Content Policy. The comment from "${reviewerName}" does not describe a first-hand consumer experience. Evidence: ${specificEvidence}.`
  },
  INAPPROPRIATE_MEDIA: {
    ruleNumber: 9,
    category: 'INAPPROPRIATE_MEDIA',
    title: 'Inappropriate Media / Attachments',
    shortDescription: 'Prohibited images, unblurred faces, or unrelated photos.',
    fullPolicyReference: 'Google Maps Policy - Prohibited Media Guidelines',
    keywords: ['photo', 'picture', 'image', 'video'],
    patterns: [
      /(attached photo shows|picture attached|video proves)/gi
    ],
    template: ({ reviewerName, specificEvidence }) =>
      `Request for removal under Google's Prohibited Media Policy. The review submitted by "${reviewerName}" contains non-compliant media attachments. Evidence: ${specificEvidence}.`
  },
  NONE: {
    ruleNumber: 0,
    category: 'NONE',
    title: 'No Policy Violation',
    shortDescription: 'Legitimate customer feedback (negative rating alone is not reportable).',
    fullPolicyReference: 'N/A',
    keywords: [],
    patterns: [],
    template: () => 'No policy violation detected. Standard customer feedback.'
  }
};
