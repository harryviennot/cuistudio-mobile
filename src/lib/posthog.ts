/**
 * PostHog Analytics Configuration
 *
 * Centralizes PostHog initialization and provides typed event tracking.
 * Analytics are disabled in development to avoid polluting data.
 */

// PostHog API configuration from environment
export const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || "";
export const POSTHOG_HOST = "https://eu.i.posthog.com";

// PostHog provider options
export const posthogOptions = {
  host: POSTHOG_HOST,
  // Disable in development to keep data clean
  disabled: !POSTHOG_API_KEY,
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

// ============================================================================
// DIRECT TRACKING (for use outside React components)
// ============================================================================

import type { PostHog } from "posthog-react-native";

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
export function identifyUser(
  userId: string,
  properties?: { email?: string; created_at?: string }
) {
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
