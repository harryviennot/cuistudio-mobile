/**
 * Extraction progress screen
 */
import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { extractionService } from "@/api/services/extraction.service";
import { usePolling } from "@/hooks/usePolling";
import { ExtractionProgress } from "@/components/extraction/ExtractionProgress";
import { RecipeLoadingSkeleton } from "@/components/extraction/RecipeLoadingSkeleton";
import { ExtractionStatus } from "@/types/extraction";

export default function ExtractionProgressScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: job, isPolling } = usePolling({
    fn: async () => {
      if (!jobId) throw new Error("Job ID is required");
      return await extractionService.getJob(jobId);
    },
    shouldStopPolling: (job) => {
      return job.status === ExtractionStatus.COMPLETED || job.status === ExtractionStatus.FAILED;
    },
    interval: 2000,
    enabled: !!jobId,
    onComplete: (job) => {
      if (job.status === ExtractionStatus.COMPLETED && job.recipe_id) {
        // Navigate to recipe preview after a short delay for UX
        setTimeout(() => {
          router.replace({
            pathname: "/recipe/preview/[recipeId]" as any,
            params: { recipeId: job.recipe_id! },
          });
        }, 500);
      }
    },
  });

  if (!jobId) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <Text className="text-red-600">Invalid extraction job</Text>
      </View>
    );
  }

  if (job?.status === ExtractionStatus.FAILED) {
    return (
      <View
        className="flex-1 items-center justify-center bg-surface px-6"
        style={{ paddingTop: insets.top }}
      >
        <Text className="mb-4 text-center text-xl font-semibold text-red-600">
          Extraction Failed
        </Text>
        <Text className="text-center text-gray-600">
          {job.error_message || "An error occurred while extracting the recipe"}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-6 py-4">
        <Text className="text-center text-lg font-semibold text-gray-900">Extracting Recipe</Text>
      </View>

      {/* Progress */}
      <ExtractionProgress
        progress={job?.progress_percentage ?? 0}
        currentStep={job?.current_step}
      />

      {/* Loading skeleton */}
      <View className="flex-1 py-6">
        <RecipeLoadingSkeleton />
      </View>

      {/* Debug info (optional - remove in production) */}
      {__DEV__ && job && (
        <View className="border-t border-gray-200 bg-gray-50 px-4 py-3">
          <Text className="font-mono text-xs text-gray-600">
            Status: {job.status} | Progress: {job.progress_percentage}%
          </Text>
        </View>
      )}
    </View>
  );
}
