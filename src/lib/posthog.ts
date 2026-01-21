/**
 * PostHog Analytics Configuration
 *
 * Centralizes PostHog initialization and provides typed event tracking.
 * Analytics are disabled in development to avoid polluting data.
 */
import type { PostHog } from "posthog-react-native";

// PostHog API configuration from environment
export const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || "";
export const POSTHOG_HOST = "https://eu.i.posthog.com";

// PostHog provider options
export const posthogOptions = {
  host: POSTHOG_HOST,
  // Disable in development to keep data clean
  disabled: __DEV__ || !POSTHOG_API_KEY,
  // Track app lifecycle events (app opened, backgrounded) for retention metrics
  captureNativeAppLifecycleEvents: true,
};

// ============================================================================
// EVENT NAMES
// ============================================================================

export const AnalyticsEvents = {
  // Onboarding funnel
  ONBOARDING_STARTED: "onboarding_started",
  ONBOARDING_STEP_COMPLETED: "onboarding_step_completed",
  ONBOARDING_COMPLETED: "onboarding_completed",

  // Extraction events
  EXTRACTION_STARTED: "extraction_started",
  EXTRACTION_COMPLETED: "extraction_completed",
  EXTRACTION_FAILED: "extraction_failed",

  // Recipe events
  RECIPE_SAVED: "recipe_saved",
  RECIPE_VIEWED: "recipe_viewed",
  RECIPE_SHARED: "recipe_shared",

  // Cooking events
  COOKING_STARTED: "cooking_started",
  COOKING_COMPLETED: "cooking_completed",

  // Search events
  SEARCH_PERFORMED: "search_performed",
  SEARCH_RESULT_CLICKED: "search_result_clicked",

  // Paywall/Subscription events
  PAYWALL_VIEWED: "paywall_viewed",
  SUBSCRIPTION_STARTED: "subscription_started",
} as const;

// ============================================================================
// EVENT PROPERTY TYPES
// ============================================================================

export interface OnboardingStepProperties {
  step_name: string;
  step_index: number;
  total_steps: number;
}

export interface OnboardingCompletedProperties {
  heard_from?: string;
  cooking_frequency?: string;
  recipe_sources_count?: number;
}

export interface ExtractionStartedProperties {
  method: "image" | "link" | "voice" | "text";
}

export interface ExtractionCompletedProperties {
  method: string;
  source_type?: string;
}

export interface ExtractionFailedProperties {
  method: string;
  error_message?: string;
}

export interface RecipeSavedProperties {
  is_public: boolean;
  source_type?: string;
}

export interface RecipeViewedProperties {
  recipe_id: string;
  source_type?: string;
  is_own_recipe: boolean;
}

export interface RecipeSharedProperties {
  recipe_id: string;
  share_method?: string;
}

export interface CookingStartedProperties {
  recipe_id: string;
  servings?: number;
}

export interface CookingCompletedProperties {
  recipe_id: string;
  duration_seconds: number;
}

export interface SearchPerformedProperties {
  query_length: number;
  has_filters: boolean;
}

export interface SearchResultClickedProperties {
  result_position: number;
  recipe_id: string;
}

export interface PaywallViewedProperties {
  trigger: "credits_empty" | "feature_gate" | "settings" | "other";
}

export interface SubscriptionStartedProperties {
  plan: "monthly" | "yearly";
  is_trial: boolean;
}

// ============================================================================
// DIRECT TRACKING (for use outside React components)
// ============================================================================

// PostHog client reference - set by PostHogProvider, used for non-hook tracking
let posthogClient: PostHog | null = null;

/**
 * Set the PostHog client reference (called from a component that has access to usePostHog)
 */
export function setPostHogClient(client: PostHog) {
  posthogClient = client;
}

/**
 * Identify user directly (for use in AuthContext)
 */
export function identifyUser(userId: string, properties?: { email?: string; created_at?: string }) {
  if (posthogClient) {
    posthogClient.identify(userId, properties);
    console.log("[PostHog] User identified:", userId);
  }
}

/**
 * Reset user identity (for use in AuthContext on sign out)
 */
export function resetUser() {
  if (posthogClient) {
    posthogClient.reset();
    console.log("[PostHog] User reset");
  }
}

/**
 * Track extraction completed (for use in ExtractionContext)
 */
export function trackExtractionCompleted(properties: ExtractionCompletedProperties) {
  if (posthogClient) {
    posthogClient.capture(AnalyticsEvents.EXTRACTION_COMPLETED, { ...properties });
    console.log("[PostHog] Extraction completed:", properties);
  }
}

/**
 * Track extraction failed (for use in ExtractionContext)
 */
export function trackExtractionFailed(properties: ExtractionFailedProperties) {
  if (posthogClient) {
    posthogClient.capture(AnalyticsEvents.EXTRACTION_FAILED, { ...properties });
    console.log("[PostHog] Extraction failed:", properties);
  }
}

/**
 * Track cooking started (for use in CookingSessionContext)
 */
export function trackCookingStarted(properties: CookingStartedProperties) {
  if (posthogClient) {
    posthogClient.capture(AnalyticsEvents.COOKING_STARTED, { ...properties });
    console.log("[PostHog] Cooking started:", properties);
  }
}

/**
 * Track cooking completed (for use in CookingSessionContext)
 */
export function trackCookingCompleted(properties: CookingCompletedProperties) {
  if (posthogClient) {
    posthogClient.capture(AnalyticsEvents.COOKING_COMPLETED, { ...properties });
    console.log("[PostHog] Cooking completed:", properties);
  }
}

/**
 * Track paywall viewed (for use in PaywallScreen)
 */
export function trackPaywallViewed(properties: PaywallViewedProperties) {
  if (posthogClient) {
    posthogClient.capture(AnalyticsEvents.PAYWALL_VIEWED, { ...properties });
    console.log("[PostHog] Paywall viewed:", properties);
  }
}

/**
 * Track subscription started (for use in SubscriptionContext)
 */
export function trackSubscriptionStarted(properties: SubscriptionStartedProperties) {
  if (posthogClient) {
    posthogClient.capture(AnalyticsEvents.SUBSCRIPTION_STARTED, { ...properties });
    console.log("[PostHog] Subscription started:", properties);
  }
}
