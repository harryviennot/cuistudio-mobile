/**
 * Analytics Hook
 *
 * Provides typed methods for tracking PostHog events and identifying users.
 * All tracking methods are safe to call - they no-op if PostHog is disabled.
 */
import { usePostHog } from "posthog-react-native";
import { useCallback } from "react";
import {
  AnalyticsEvents,
  type OnboardingStepProperties,
  type OnboardingCompletedProperties,
  type ExtractionStartedProperties,
  type ExtractionCompletedProperties,
  type ExtractionFailedProperties,
  type RecipeSavedProperties,
} from "@/lib/posthog";

export function useAnalytics() {
  const posthog = usePostHog();

  // ============================================================================
  // USER IDENTIFICATION
  // ============================================================================

  /**
   * Identify a user with their Supabase ID and optional properties
   */
  const identifyUser = useCallback(
    (userId: string, properties?: { email?: string; created_at?: string }) => {
      posthog.identify(userId, properties);
    },
    [posthog]
  );

  /**
   * Reset user identity (call on sign out)
   */
  const resetUser = useCallback(() => {
    posthog.reset();
  }, [posthog]);

  // ============================================================================
  // ONBOARDING EVENTS
  // ============================================================================

  /**
   * Track when user starts the onboarding questionnaire
   */
  const trackOnboardingStarted = useCallback(() => {
    posthog.capture(AnalyticsEvents.ONBOARDING_STARTED);
    console.log("[PostHog] Onboarding started");
  }, [posthog]);

  /**
   * Track completion of each onboarding step
   */
  const trackOnboardingStep = useCallback(
    (properties: OnboardingStepProperties) => {
      posthog.capture(AnalyticsEvents.ONBOARDING_STEP_COMPLETED, { ...properties });
      console.log("[PostHog] Onboarding step completed:", properties);
    },
    [posthog]
  );

  /**
   * Track when user completes onboarding
   */
  const trackOnboardingCompleted = useCallback(
    (properties?: OnboardingCompletedProperties) => {
      posthog.capture(AnalyticsEvents.ONBOARDING_COMPLETED, properties ? { ...properties } : undefined);
      console.log("[PostHog] Onboarding completed:", properties);
    },
    [posthog]
  );

  // ============================================================================
  // EXTRACTION EVENTS
  // ============================================================================

  /**
   * Track when user starts a recipe extraction
   */
  const trackExtractionStarted = useCallback(
    (properties: ExtractionStartedProperties) => {
      posthog.capture(AnalyticsEvents.EXTRACTION_STARTED, { ...properties });
      console.log("[PostHog] Extraction started:", properties);
    },
    [posthog]
  );

  /**
   * Track when extraction completes successfully
   */
  const trackExtractionCompleted = useCallback(
    (properties: ExtractionCompletedProperties) => {
      posthog.capture(AnalyticsEvents.EXTRACTION_COMPLETED, { ...properties });
      console.log("[PostHog] Extraction completed:", properties);
    },
    [posthog]
  );

  /**
   * Track when extraction fails
   */
  const trackExtractionFailed = useCallback(
    (properties: ExtractionFailedProperties) => {
      posthog.capture(AnalyticsEvents.EXTRACTION_FAILED, { ...properties });
      console.log("[PostHog] Extraction failed:", properties);
    },
    [posthog]
  );

  // ============================================================================
  // RECIPE EVENTS
  // ============================================================================

  /**
   * Track when user saves a recipe
   */
  const trackRecipeSaved = useCallback(
    (properties: RecipeSavedProperties) => {
      posthog.capture(AnalyticsEvents.RECIPE_SAVED, { ...properties });
      console.log("[PostHog] Recipe saved:", properties);
    },
    [posthog]
  );

  return {
    // User identification
    identifyUser,
    resetUser,

    // Onboarding
    trackOnboardingStarted,
    trackOnboardingStep,
    trackOnboardingCompleted,

    // Extraction
    trackExtractionStarted,
    trackExtractionCompleted,
    trackExtractionFailed,

    // Recipes
    trackRecipeSaved,
  };
}
