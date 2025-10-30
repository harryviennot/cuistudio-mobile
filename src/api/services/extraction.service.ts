/**
 * Recipe extraction service
 */
import { api } from "../api-client";
import type { ExtractionJob, ImageExtractionResponse } from "@/types/extraction";

export const extractionService = {
  /**
   * Submit images for recipe extraction
   */
  submitImages: async (files: FormData): Promise<ImageExtractionResponse> => {
    const response = await api.post<ImageExtractionResponse>("/extraction/submit-images", files, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Get extraction job status
   */
  getJob: async (jobId: string): Promise<ExtractionJob> => {
    const response = await api.get<ExtractionJob>(`/extraction/jobs/${jobId}`);
    return response.data;
  },

  /**
   * Cancel extraction job
   */
  cancelJob: async (jobId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/extraction/jobs/${jobId}`);
    return response.data;
  },
};
