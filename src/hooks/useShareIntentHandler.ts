/**
 * Share Intent Handler Hook
 *
 * Handles incoming shared content from iOS Share Extension and Android Intent.
 * When content is shared to the app, this hook:
 * 1. Detects the shared content (URL or images)
 * 2. Shows a toast notification
 * 3. Submits for extraction in the background
 * 4. Resets the share intent state
 */
import { useEffect, useRef } from "react";
import { useShareIntentContext } from "expo-share-intent";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { useExtraction } from "@/contexts/ExtractionContext";
import { useAuth } from "@/contexts/AuthContext";
import type { SourceType } from "@/types/extraction";

export function useShareIntentHandler() {
  const { t } = useTranslation();
  const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntentContext();
  const { startExtraction, startImageExtraction, canStartNewExtraction } = useExtraction();
  const { isAuthenticated } = useAuth();

  // Track if we've already processed the current intent
  const processedIntentRef = useRef<string | null>(null);

  useEffect(() => {
    // Don't process if no share intent or user not authenticated
    if (!hasShareIntent || !shareIntent || !isAuthenticated) {
      return;
    }

    // Create a unique ID for this intent to avoid reprocessing
    const intentId = JSON.stringify({
      webUrl: shareIntent.webUrl,
      text: shareIntent.text,
      files: shareIntent.files?.map((f) => f.path),
    });

    // Skip if we've already processed this intent
    if (processedIntentRef.current === intentId) {
      return;
    }

    // Mark as processed immediately to prevent double processing
    processedIntentRef.current = intentId;

    const handleShareIntent = async () => {
      // Check if user can start a new extraction
      if (!canStartNewExtraction()) {
        Toast.show({
          type: "warning",
          text1: t("shareIntent.extractionInProgress"),
          text2: t("shareIntent.waitForCompletion"),
          visibilityTime: 4000,
        });
        resetShareIntent();
        return;
      }

      try {
        // Handle URL sharing
        if (shareIntent.webUrl) {
          console.log("[ShareIntent] Processing shared URL:", shareIntent.webUrl);

          Toast.show({
            type: "info",
            text1: t("shareIntent.recipeDetected"),
            text2: t("shareIntent.extractingInBackground"),
            visibilityTime: 3000,
          });

          await startExtraction({
            source_type: "link" as SourceType,
            source_url: shareIntent.webUrl,
          });
        }
        // Handle text sharing (might contain a URL)
        else if (shareIntent.text) {
          // Try to extract URL from text
          const urlMatch = shareIntent.text.match(
            /https?:\/\/[^\s]+/i
          );

          if (urlMatch) {
            console.log("[ShareIntent] Processing URL from shared text:", urlMatch[0]);

            Toast.show({
              type: "info",
              text1: t("shareIntent.recipeDetected"),
              text2: t("shareIntent.extractingInBackground"),
              visibilityTime: 3000,
            });

            await startExtraction({
              source_type: "link" as SourceType,
              source_url: urlMatch[0],
            });
          } else {
            // Plain text - treat as paste extraction
            console.log("[ShareIntent] Processing shared text");

            Toast.show({
              type: "info",
              text1: t("shareIntent.textReceived"),
              text2: t("shareIntent.extractingInBackground"),
              visibilityTime: 3000,
            });

            await startExtraction({
              source_type: "paste" as SourceType,
              text_content: shareIntent.text,
            });
          }
        }
        // Handle image sharing
        else if (shareIntent.files && shareIntent.files.length > 0) {
          const imageFiles = shareIntent.files.filter((f) =>
            f.mimeType?.startsWith("image/")
          );

          if (imageFiles.length > 0) {
            console.log("[ShareIntent] Processing shared images:", imageFiles.length);

            Toast.show({
              type: "info",
              text1: t("shareIntent.imagesReceived", { count: imageFiles.length }),
              text2: t("shareIntent.extractingInBackground"),
              visibilityTime: 3000,
            });

            // Create FormData for image upload
            const formData = new FormData();
            imageFiles.forEach((file, index) => {
              formData.append("files", {
                uri: file.path,
                type: file.mimeType || "image/jpeg",
                name: file.fileName || `shared_image_${index}.jpg`,
              } as unknown as Blob);
            });

            await startImageExtraction(formData);
          } else {
            console.log("[ShareIntent] No supported files in share intent");
            Toast.show({
              type: "warning",
              text1: t("shareIntent.unsupportedContent"),
              text2: t("shareIntent.tryDifferentContent"),
              visibilityTime: 4000,
            });
          }
        } else {
          console.log("[ShareIntent] Empty or unsupported share intent");
          Toast.show({
            type: "warning",
            text1: t("shareIntent.unsupportedContent"),
            text2: t("shareIntent.tryDifferentContent"),
            visibilityTime: 4000,
          });
        }
      } catch (err) {
        console.error("[ShareIntent] Failed to process share intent:", err);
        Toast.show({
          type: "error",
          text1: t("shareIntent.extractionFailed"),
          text2: t("shareIntent.pleaseTryAgain"),
          visibilityTime: 4000,
        });
      }

      // Always reset after processing
      resetShareIntent();
    };

    // Small delay to ensure navigation is ready (helps with cold start)
    const timeout = setTimeout(handleShareIntent, 100);

    return () => clearTimeout(timeout);
  }, [
    hasShareIntent,
    shareIntent,
    isAuthenticated,
    canStartNewExtraction,
    startExtraction,
    startImageExtraction,
    resetShareIntent,
    t,
  ]);

  // Log errors from expo-share-intent
  useEffect(() => {
    if (error) {
      console.error("[ShareIntent] Error:", error);
    }
  }, [error]);

  return {
    hasShareIntent,
    shareIntent,
    error,
  };
}
