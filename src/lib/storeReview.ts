/**
 * App Store Review Module
 *
 * Handles prompting users to rate the app on the App Store.
 * Uses expo-store-review which wraps SKStoreReviewController (iOS)
 * and In-App Review API (Android).
 *
 * Important: Apple limits review prompts to 3x per year per user.
 * We only prompt after the first successful recipe save to maximize
 * the chance of getting a positive review.
 */
import * as StoreReview from "expo-store-review";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { trackAppRatingRequested } from "./posthog";

const STORAGE_KEYS = {
  REVIEW_REQUESTED: "app_review_requested",
  FIRST_EXTRACTION_DATE: "first_extraction_date",
  EXTRACTION_COUNT: "extraction_count",
  APP_INSTALL_DATE: "app_install_date",
  SESSION_COUNT: "session_count",
} as const;

/**
 * Record app installation date (call once on first app launch)
 */
export async function recordAppInstall(): Promise<void> {
  const existingDate = await AsyncStorage.getItem(STORAGE_KEYS.APP_INSTALL_DATE);
  if (!existingDate) {
    await AsyncStorage.setItem(STORAGE_KEYS.APP_INSTALL_DATE, new Date().toISOString());
  }
}

/**
 * Increment session count (call on each app foreground)
 */
export async function incrementSessionCount(): Promise<number> {
  const currentCount = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_COUNT);
  const newCount = (parseInt(currentCount || "0", 10) || 0) + 1;
  await AsyncStorage.setItem(STORAGE_KEYS.SESSION_COUNT, newCount.toString());
  return newCount;
}

/**
 * Record a successful extraction.
 * Returns the new extraction count.
 */
export async function recordExtraction(): Promise<number> {
  // Record first extraction date if not set
  const firstDate = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_EXTRACTION_DATE);
  if (!firstDate) {
    await AsyncStorage.setItem(STORAGE_KEYS.FIRST_EXTRACTION_DATE, new Date().toISOString());
  }

  // Increment extraction count
  const currentCount = await AsyncStorage.getItem(STORAGE_KEYS.EXTRACTION_COUNT);
  const newCount = (parseInt(currentCount || "0", 10) || 0) + 1;
  await AsyncStorage.setItem(STORAGE_KEYS.EXTRACTION_COUNT, newCount.toString());

  console.log("[StoreReview] Extraction recorded, total count:", newCount);
  return newCount;
}

/**
 * Get the current extraction count
 */
export async function getExtractionCount(): Promise<number> {
  const count = await AsyncStorage.getItem(STORAGE_KEYS.EXTRACTION_COUNT);
  return parseInt(count || "0", 10) || 0;
}

/**
 * Check if user has already been prompted for review
 */
export async function hasBeenPromptedForReview(): Promise<boolean> {
  const requested = await AsyncStorage.getItem(STORAGE_KEYS.REVIEW_REQUESTED);
  return requested === "true";
}

/**
 * Mark that review has been requested
 */
async function markReviewRequested(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.REVIEW_REQUESTED, "true");
}

/**
 * Check if conditions are met to request a review.
 *
 * Conditions:
 * 1. User just saved their first extracted recipe (extractionCount === 1)
 * 2. User hasn't been prompted before
 */
export async function shouldRequestReview(): Promise<boolean> {
  // Check if already prompted
  const alreadyPrompted = await hasBeenPromptedForReview();
  if (alreadyPrompted) {
    console.log("[StoreReview] Already prompted, skipping");
    return false;
  }

  // Check extraction count (should be exactly 1 for first save)
  const extractionCount = await getExtractionCount();
  if (extractionCount !== 1) {
    console.log("[StoreReview] Not first extraction (count:", extractionCount, "), skipping");
    return false;
  }

  console.log("[StoreReview] All conditions met, should request review");
  return true;
}

/**
 * Request an App Store review if conditions are met.
 * Call this after user saves their first recipe.
 *
 * @returns true if review was requested, false if skipped
 */
export async function maybeRequestReview(): Promise<boolean> {
  const shouldRequest = await shouldRequestReview();

  if (!shouldRequest) {
    return false;
  }

  // Check if the device supports in-app review
  const isAvailable = await StoreReview.isAvailableAsync();
  if (!isAvailable) {
    console.log("[StoreReview] In-app review not available on this device");
    return false;
  }

  // Mark as requested BEFORE showing (to prevent duplicate prompts)
  await markReviewRequested();

  // Track analytics
  trackAppRatingRequested({ extraction_count: 1, trigger: "first_save" });

  // Request the review
  console.log("[StoreReview] Requesting review...");
  await StoreReview.requestReview();
  console.log("[StoreReview] Review request completed");

  return true;
}

/**
 * Check if in-app review is available on this device
 */
export async function isReviewAvailable(): Promise<boolean> {
  return StoreReview.isAvailableAsync();
}

/**
 * Reset review state (for testing purposes only)
 */
export async function resetReviewState(): Promise<void> {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.REVIEW_REQUESTED,
    STORAGE_KEYS.FIRST_EXTRACTION_DATE,
    STORAGE_KEYS.EXTRACTION_COUNT,
    STORAGE_KEYS.APP_INSTALL_DATE,
    STORAGE_KEYS.SESSION_COUNT,
  ]);
  console.log("[StoreReview] State reset");
}
