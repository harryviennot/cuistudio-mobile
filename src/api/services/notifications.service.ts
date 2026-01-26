/**
 * Push Notifications API service
 *
 * Handles notification token registration and preferences management.
 */
import { api } from "@/api";

export interface NotificationPreferences {
  notifications_enabled: boolean;
  first_recipe_nudge: boolean;
  weekly_credits_refresh: boolean;
  referral_activated: boolean;
  cook_tonight: boolean;
  cooking_streak: boolean;
  miss_you: boolean;
  timezone: string;
}

export interface ActivityStats {
  current_cooking_streak: number;
  longest_cooking_streak: number;
  last_cook_date: string | null;
}

interface RegisterTokenResponse {
  success: boolean;
  message: string;
}

export const notificationsService = {
  /**
   * Register a push notification token
   */
  async registerToken(
    expoPushToken: string,
    platform: "ios" | "android",
    deviceId?: string,
    appVersion?: string,
    language?: string
  ): Promise<RegisterTokenResponse> {
    const response = await api.post<RegisterTokenResponse>("/notifications/register-token", {
      expo_push_token: expoPushToken,
      platform,
      device_id: deviceId,
      app_version: appVersion,
      language,
    });
    return response.data;
  },

  /**
   * Unregister a push notification token (e.g., on logout)
   */
  async unregisterToken(expoPushToken: string): Promise<RegisterTokenResponse> {
    const response = await api.post<RegisterTokenResponse>("/notifications/unregister-token", {
      expo_push_token: expoPushToken,
    });
    return response.data;
  },

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await api.get<NotificationPreferences>("/notifications/preferences");
    return response.data;
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const response = await api.patch<NotificationPreferences>(
      "/notifications/preferences",
      preferences
    );
    return response.data;
  },

  /**
   * Get activity statistics including cooking streaks
   */
  async getActivityStats(): Promise<ActivityStats> {
    const response = await api.get<ActivityStats>("/notifications/activity-stats");
    return response.data;
  },
};
