/**
 * Report types for content reports and extraction feedback
 */

// =============================================================================
// ENUMS
// =============================================================================

export enum ContentReportReason {
  INAPPROPRIATE_CONTENT = "inappropriate_content",
  HATE_SPEECH = "hate_speech",
  COPYRIGHT_VIOLATION = "copyright_violation",
  SPAM_ADVERTISING = "spam_advertising",
  MISINFORMATION = "misinformation",
  OTHER = "other",
}

export enum ExtractionFeedbackCategory {
  WRONG_INGREDIENTS = "wrong_ingredients",
  MISSING_STEPS = "missing_steps",
  INCORRECT_STEPS = "incorrect_steps",
  BAD_FORMATTING = "bad_formatting",
  WRONG_MEASUREMENTS = "wrong_measurements",
  WRONG_SERVINGS = "wrong_servings",
  AI_HALLUCINATION = "ai_hallucination",
  WRONG_TITLE = "wrong_title",
  WRONG_IMAGE = "wrong_image",
  OTHER = "other",
}

export enum ReportStatus {
  PENDING = "pending",
  IN_REVIEW = "in_review",
  RESOLVED = "resolved",
  ESCALATED = "escalated",
}

// =============================================================================
// REQUEST TYPES
// =============================================================================

export interface ContentReportRequest {
  recipe_id: string;
  reason: ContentReportReason;
  description?: string;
}

export interface ExtractionFeedbackRequest {
  recipe_id: string;
  category: ExtractionFeedbackCategory;
  description?: string;
  extraction_job_id?: string;
}

// =============================================================================
// RESPONSE TYPES
// =============================================================================

export interface RecipeSummary {
  id: string;
  title: string;
  image_url?: string;
}

export interface ContentReportResponse {
  id: string;
  recipe_id: string;
  reason: string;
  description?: string;
  status: string;
  priority: number;
  created_at: string;
  updated_at?: string;
  resolved_at?: string;
  recipes?: RecipeSummary;
}

export interface ExtractionFeedbackResponse {
  id: string;
  recipe_id: string;
  category: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at?: string;
  resolved_at?: string;
  was_helpful?: boolean;
  recipes?: RecipeSummary;
}

export interface ReportReasonOption {
  value: string;
  label: string;
  description: string;
}

export interface ReportReasonsResponse {
  reasons: ReportReasonOption[];
}

export interface FeedbackCategoriesResponse {
  categories: ReportReasonOption[];
}

export interface UserReportsResponse {
  reports: ContentReportResponse[];
  total: number;
}

export interface UserFeedbackResponse {
  feedback: ExtractionFeedbackResponse[];
  total: number;
}
