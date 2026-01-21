/**
 * Report service for content reports and extraction feedback
 */
import { api } from "../api-client";
import type {
  ContentReportRequest,
  ContentReportResponse,
  ExtractionFeedbackRequest,
  ExtractionFeedbackResponse,
  ReportReasonsResponse,
  FeedbackCategoriesResponse,
  UserReportsResponse,
  UserFeedbackResponse,
} from "@/types/report";

export const reportService = {
  /**
   * Submit a content report for a recipe
   */
  submitContentReport: async (data: ContentReportRequest): Promise<ContentReportResponse> => {
    const response = await api.post<ContentReportResponse>("/reports/content", data);
    return response.data;
  },

  /**
   * Submit extraction feedback for a recipe
   */
  submitExtractionFeedback: async (
    data: ExtractionFeedbackRequest
  ): Promise<ExtractionFeedbackResponse> => {
    const response = await api.post<ExtractionFeedbackResponse>(
      "/reports/extraction-feedback",
      data
    );
    return response.data;
  },

  /**
   * Get available report reasons with descriptions
   */
  getReportReasons: async (): Promise<ReportReasonsResponse> => {
    const response = await api.get<ReportReasonsResponse>("/reports/content/reasons");
    return response.data;
  },

  /**
   * Get available feedback categories with descriptions
   */
  getFeedbackCategories: async (): Promise<FeedbackCategoriesResponse> => {
    const response = await api.get<FeedbackCategoriesResponse>(
      "/reports/extraction-feedback/categories"
    );
    return response.data;
  },

  /**
   * Get user's submitted content reports
   */
  getMyReports: async (limit: number = 50, offset: number = 0): Promise<UserReportsResponse> => {
    const response = await api.get<UserReportsResponse>("/reports/content/my-reports", {
      params: { limit, offset },
    });
    return response.data;
  },

  /**
   * Get user's submitted extraction feedback
   */
  getMyFeedback: async (limit: number = 50, offset: number = 0): Promise<UserFeedbackResponse> => {
    const response = await api.get<UserFeedbackResponse>(
      "/reports/extraction-feedback/my-feedback",
      {
        params: { limit, offset },
      }
    );
    return response.data;
  },
};
