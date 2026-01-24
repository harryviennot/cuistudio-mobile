/**
 * PostHog Analytics Configuration
 *
 * Centralizes PostHog initialization and provides typed event tracking.
 * Analytics are disabled in development to avoid polluting data.
 */
import type { PostHog } from "posthog-react-native";
import Constants from "expo-constants";

// PostHog API configuration from environment
export const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || "";
export const POSTHOG_HOST = "https://eu.i.posthog.com";

// Check if this is a development or preview build (based on APP_VARIANT set at build time)
const appVariant = Constants.expoConfig?.extra?.appVariant || "production";
const isDevOrPreviewBuild = appVariant === "development" || appVariant === "preview";

// PostHog provider options
export const posthogOptions = {
  host: POSTHOG_HOST,
  // Disable in dev/preview builds to keep production data clean
  disabled: isDevOrPreviewBuild || !POSTHOG_API_KEY || __DEV__,
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

  // App rating events
  APP_RATING_REQUESTED: "app_rating_requested",

  // Soft paywall events
  SOFT_PAYWALL_SHOWN: "soft_paywall_shown",
  SOFT_PAYWALL_DISMISSED: "soft_paywall_dismissed",
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

export interface AppRatingRequestedProperties {
  extraction_count: number;
  trigger: "first_save" | "manual";
}

export interface SoftPaywallShownProperties {
  trigger: "low_credits" | "credits_exhausted" | "extraction_limit";
  credits_remaining: number;
}

export interface SoftPaywallDismissedProperties {
  trigger: "low_credits" | "credits_exhausted" | "extraction_limit";
  action: "dismissed" | "upgrade_clicked";
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
  posthogClient?.identify(userId, properties);
}

/**
 * Reset user identity (for use in AuthContext on sign out)
 */
export function resetUser() {
  posthogClient?.reset();
}

/**
 * Track extraction completed (for use in ExtractionContext)
 */
export function trackExtractionCompleted(properties: ExtractionCompletedProperties) {
  posthogClient?.capture(AnalyticsEvents.EXTRACTION_COMPLETED, { ...properties });
}

/**
 * Track extraction failed (for use in ExtractionContext)
 */
export function trackExtractionFailed(properties: ExtractionFailedProperties) {
  posthogClient?.capture(AnalyticsEvents.EXTRACTION_FAILED, { ...properties });
}

/**
 * Track cooking started (for use in CookingSessionContext)
 */
export function trackCookingStarted(properties: CookingStartedProperties) {
  posthogClient?.capture(AnalyticsEvents.COOKING_STARTED, { ...properties });
}

/**
 * Track cooking completed (for use in CookingSessionContext)
 */
export function trackCookingCompleted(properties: CookingCompletedProperties) {
  posthogClient?.capture(AnalyticsEvents.COOKING_COMPLETED, { ...properties });
}

/**
 * Track paywall viewed (for use in PaywallScreen)
 */
export function trackPaywallViewed(properties: PaywallViewedProperties) {
  posthogClient?.capture(AnalyticsEvents.PAYWALL_VIEWED, { ...properties });
}

/**
 * Track subscription started (for use in SubscriptionContext)
 */
export function trackSubscriptionStarted(properties: SubscriptionStartedProperties) {
  posthogClient?.capture(AnalyticsEvents.SUBSCRIPTION_STARTED, { ...properties });
}

/**
 * Track app rating requested (for use in storeReview.ts)
 */
export function trackAppRatingRequested(properties: AppRatingRequestedProperties) {
  posthogClient?.capture(AnalyticsEvents.APP_RATING_REQUESTED, { ...properties });
}

/**
 * Track soft paywall shown (for use in credits warning UI)
 */
export function trackSoftPaywallShown(properties: SoftPaywallShownProperties) {
  posthogClient?.capture(AnalyticsEvents.SOFT_PAYWALL_SHOWN, { ...properties });
}

/**
 * Track soft paywall dismissed (for use in credits warning UI)
 */
export function trackSoftPaywallDismissed(properties: SoftPaywallDismissedProperties) {
  posthogClient?.capture(AnalyticsEvents.SOFT_PAYWALL_DISMISSED, { ...properties });
}
