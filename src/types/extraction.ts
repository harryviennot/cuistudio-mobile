/**
 * Recipe extraction types
 */

export enum SourceType {
  URL = "url",
  PHOTO = "photo",
  PASTE = "paste",
  VOICE = "voice",
}

export enum ExtractionStatus {
  PENDING = "pending",
  PROCESSING = "processing", // Fixed: backend uses "processing" not "in_progress"
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface ExtractionJob {
  id: string;
  user_id: string;
  source_type: SourceType;
  source_urls?: string[];
  status: ExtractionStatus;
  recipe_id?: string;
  error_message?: string;
  progress_percentage: number;
  current_step?: string;
  created_at: string;
  updated_at: string;
}

export interface ImageExtractionResponse {
  job_id: string;
  message: string;
  image_count: number;
}
