/**
 * Analytics Hook
 *
 * Provides typed methods for tracking PostHog events and identifying users.
 * PostHog is disabled in dev/preview builds via posthogOptions.disabled.
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
  type RecipeViewedProperties,
  type RecipeSharedProperties,
  type CookingStartedProperties,
  type CookingCompletedProperties,
  type SearchPerformedProperties,
  type SearchResultClickedProperties,
  type PaywallViewedProperties,
  type SubscriptionStartedProperties,
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
  }, [posthog]);

  /**
   * Track completion of each onboarding step
   */
  const trackOnboardingStep = useCallback(
    (properties: OnboardingStepProperties) => {
      posthog.capture(AnalyticsEvents.ONBOARDING_STEP_COMPLETED, { ...properties });
    },
    [posthog]
  );

  /**
   * Track when user completes onboarding
   */
  const trackOnboardingCompleted = useCallback(
    (properties?: OnboardingCompletedProperties) => {
      posthog.capture(
        AnalyticsEvents.ONBOARDING_COMPLETED,
        properties ? { ...properties } : undefined
      );
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
    },
    [posthog]
  );

  /**
   * Track when extraction completes successfully
   */
  const trackExtractionCompleted = useCallback(
    (properties: ExtractionCompletedProperties) => {
      posthog.capture(AnalyticsEvents.EXTRACTION_COMPLETED, { ...properties });
    },
    [posthog]
  );

  /**
   * Track when extraction fails
   */
  const trackExtractionFailed = useCallback(
    (properties: ExtractionFailedProperties) => {
      posthog.capture(AnalyticsEvents.EXTRACTION_FAILED, { ...properties });
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
    },
    [posthog]
  );

  /**
   * Track when user views a recipe detail
   */
  const trackRecipeViewed = useCallback(
    (properties: RecipeViewedProperties) => {
      posthog.capture(AnalyticsEvents.RECIPE_VIEWED, { ...properties });
    },
    [posthog]
  );

  /**
   * Track when user shares a recipe
   */
  const trackRecipeShared = useCallback(
    (properties: RecipeSharedProperties) => {
      posthog.capture(AnalyticsEvents.RECIPE_SHARED, { ...properties });
    },
    [posthog]
  );

  // ============================================================================
  // COOKING EVENTS
  // ============================================================================

  /**
   * Track when user starts cooking mode
   */
  const trackCookingStarted = useCallback(
    (properties: CookingStartedProperties) => {
      posthog.capture(AnalyticsEvents.COOKING_STARTED, { ...properties });
    },
    [posthog]
  );

  /**
   * Track when user completes cooking mode
   */
  const trackCookingCompleted = useCallback(
    (properties: CookingCompletedProperties) => {
      posthog.capture(AnalyticsEvents.COOKING_COMPLETED, { ...properties });
    },
    [posthog]
  );

  // ============================================================================
  // SEARCH EVENTS
  // ============================================================================

  /**
   * Track when user performs a search
   */
  const trackSearchPerformed = useCallback(
    (properties: SearchPerformedProperties) => {
      posthog.capture(AnalyticsEvents.SEARCH_PERFORMED, { ...properties });
    },
    [posthog]
  );

  /**
   * Track when user clicks a search result
   */
  const trackSearchResultClicked = useCallback(
    (properties: SearchResultClickedProperties) => {
      posthog.capture(AnalyticsEvents.SEARCH_RESULT_CLICKED, { ...properties });
    },
    [posthog]
  );

  // ============================================================================
  // PAYWALL/SUBSCRIPTION EVENTS
  // ============================================================================

  /**
   * Track when user views the paywall
   */
  const trackPaywallViewed = useCallback(
    (properties: PaywallViewedProperties) => {
      posthog.capture(AnalyticsEvents.PAYWALL_VIEWED, { ...properties });
    },
    [posthog]
  );

  /**
   * Track when user starts a subscription
   */
  const trackSubscriptionStarted = useCallback(
    (properties: SubscriptionStartedProperties) => {
      posthog.capture(AnalyticsEvents.SUBSCRIPTION_STARTED, { ...properties });
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
    trackRecipeViewed,
    trackRecipeShared,

    // Cooking
    trackCookingStarted,
    trackCookingCompleted,

    // Search
    trackSearchPerformed,
    trackSearchResultClicked,

    // Paywall/Subscription
    trackPaywallViewed,
    trackSubscriptionStarted,
  };
}
