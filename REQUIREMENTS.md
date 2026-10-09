# Google Review AI Flagging & Moderation Assistant - System Requirements & Roadmap

## 📌 Project Overview
**Google Flag Reviews** is an intelligent web application designed for Google Business Profile managers to continuously monitor, analyze, and flag fake or policy-violating Google reviews. 

While Google does not allow direct programmatic deletion of reviews via API, this tool automates the process of identifying violations against Google's **9 official content policy rules**, drafting evidence-based removal justifications, and tracking report outcomes.

---

## 🎯 Implementation Phasing

### Phase 1: Core System & AI Policy Engine (Completed)
- [x] **Project Scaffolding**: Next.js (App Router), TypeScript, Tailwind CSS.
- [x] **Mock & API Data Integration Layer**: Support for standalone offline development & mock Google Business Profile review sync.
- [x] **AI Policy Violation Analyzer Engine**: Automated rule-based + AI text analysis against Google's 9 official review policies.
- [x] **Review Moderation Dashboard**:
  - Stats overview (Total reviews, Flagged ratio, Pending moderation, Success rate).
  - Advanced Filtering (By rating, policy rule, risk score, moderation status).
  - Detailed Review Modal with violation details and pre-generated Google report text.
  - 1-Click Launch Button to Google's official review reporting dialog.
  - Status management (Active, Pending Google Review, Removed, Dismissed).
- [x] **Manual Review Tester & Analyzer**: Ability to input custom review text to instantly test violation rules.
- [x] **Link Analyzer**: Check & flag any specific Google review URL (`https://www.google.com/maps/reviews/data=...`).

### Phase 2: Live Google Business Profile API Sync & Alert Engine (Completed)
- [x] **Google OAuth 2.0 Integration**:
  - OAuth 2.0 URL generator & token exchange service (`googleAuth.ts`).
  - Auth init API endpoint (`/api/auth/google`) and OAuth callback handler (`/api/auth/callback`).
  - Direct "Connect Google Account" button in Settings Modal.
- [x] **Live Google Business Profile Client (`gbpClient.ts`)**:
  - Direct API integration for account locations & reviews (`mybusinessreviews.googleapis.com`).
  - Multi-location selector (e.g. Downtown Branch, Westside Clinic, Northside Store).
- [x] **Automated Background Sync & Polling**:
  - Background auto-sync (30-second interval polling) and manual "Sync Reviews Now" button.
  - Automatic invocation of AI Policy Engine on newly ingested reviews.
- [x] **Real-Time Notification & Webhook Dispatcher (`notificationService.ts`)**:
  - Webhook dispatcher for Slack, Discord, and custom HTTP endpoints.
  - Email notification builder for High-Risk Fake Reviews.
  - Test Notification dispatch endpoint (`/api/notifications/test`).

### Phase 3: Automated Appeals & Evidence Export (Next Phase)
- [ ] Exportable Evidence PDF reports for denied initial flags to attach to Google Support Appeals.
- [ ] Analytics on Google's average response time and removal success rate per violation category.

---

## ⚖️ Google's 9 Official Policy Rules Supported by Analyzer
1. **Spam & Fake Content**: Bot accounts, repeated generic text, sudden rating surges.
2. **Multiple Reviews from Same Person**: Duplicate reviews across multiple accounts for one experience.
3. **Offensive, Hateful & Discriminatory Content**: Harassment, profanity, or hate speech.
4. **Competitor Conflict of Interest**: Reviews posted by competing businesses or employees.
5. **Wrong Business**: Feedback referencing products or services not offered by the business.
6. **Wrong Location**: Multi-location mix-ups.
7. **Current or Former Employee**: Reviews left by staff or disgruntled ex-employees.
8. **Irrelevant / Off-Topic**: Politics, news commentary, or unrelated personal rants.
9. **Inappropriate Media**: Prohibited images or videos attached to the review.
