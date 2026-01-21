/**
 * useReportRecipe Hook
 *
 * React Query hooks for submitting content reports and extraction feedback.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { reportService } from "@/api/services/report.service";
import type {
  ContentReportRequest,
  ContentReportResponse,
  ExtractionFeedbackRequest,
  ExtractionFeedbackResponse,
  ReportReasonsResponse,
  FeedbackCategoriesResponse,
} from "@/types/report";

const REPORTS_KEY = "reports";

/**
 * Hook to fetch available report reasons
 */
export function useReportReasons() {
  return useQuery<ReportReasonsResponse, Error>({
    queryKey: [REPORTS_KEY, "reasons"],
    queryFn: reportService.getReportReasons,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour - reasons don't change often
  });
}

/**
 * Hook to fetch available feedback categories
 */
export function useFeedbackCategories() {
  return useQuery<FeedbackCategoriesResponse, Error>({
    queryKey: [REPORTS_KEY, "feedback-categories"],
    queryFn: reportService.getFeedbackCategories,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

/**
 * Hook to submit a content report
 */
export function useSubmitContentReport() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<ContentReportResponse, Error, ContentReportRequest>({
    mutationFn: reportService.submitContentReport,
    onSuccess: () => {
      // Invalidate user's reports list
      queryClient.invalidateQueries({ queryKey: [REPORTS_KEY, "my-reports"] });

      Toast.show({
        type: "success",
        text1: t("report.success.title", "Report Submitted"),
        text2: t("report.success.description", "Thank you for helping keep Cuisto safe"),
      });
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: t("report.error.title", "Couldn't Submit Report"),
        text2: error.message || t("report.error.description", "Please try again later"),
      });
    },
  });
}

/**
 * Hook to submit extraction feedback
 */
export function useSubmitExtractionFeedback() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<ExtractionFeedbackResponse, Error, ExtractionFeedbackRequest>({
    mutationFn: reportService.submitExtractionFeedback,
    onSuccess: () => {
      // Invalidate user's feedback list
      queryClient.invalidateQueries({ queryKey: [REPORTS_KEY, "my-feedback"] });

      Toast.show({
        type: "success",
        text1: t("feedback.success.title", "Feedback Submitted"),
        text2: t("feedback.success.description", "Your feedback helps us improve"),
      });
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: t("feedback.error.title", "Couldn't Submit Feedback"),
        text2: error.message || t("feedback.error.description", "Please try again later"),
      });
    },
  });
}

/**
 * Hook to get user's submitted reports
 */
export function useMyReports(limit = 50, offset = 0) {
  return useQuery({
    queryKey: [REPORTS_KEY, "my-reports", { limit, offset }],
    queryFn: () => reportService.getMyReports(limit, offset),
  });
}

/**
 * Hook to get user's submitted feedback
 */
export function useMyFeedback(limit = 50, offset = 0) {
  return useQuery({
    queryKey: [REPORTS_KEY, "my-feedback", { limit, offset }],
    queryFn: () => reportService.getMyFeedback(limit, offset),
  });
}
