/**
 * Notifications Context
 *
 * Provides notification state and preferences management to the app.
 * Wraps the usePushNotifications hook with React Query for preferences caching.
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
  notificationsService,
  NotificationPreferences,
  ActivityStats,
} from "@/api/services/notifications.service";
import { useAuth } from "./AuthContext";

export interface NotificationsContextType {
  // Push notification state
  expoPushToken: string | null;
  permissionStatus: string | null;
  isPermissionGranted: boolean;

  // Preferences
  preferences: NotificationPreferences | null;
  isLoadingPreferences: boolean;

  // Activity stats
  activityStats: ActivityStats | null;

  // Actions
  requestPermission: () => Promise<boolean>;
  unregisterToken: () => Promise<void>;
  updatePreference: (
    key: keyof NotificationPreferences,
    value: boolean | string
  ) => Promise<void>;
  updatePreferences: (
    preferences: Partial<NotificationPreferences>
  ) => Promise<void>;
  refreshPreferences: () => Promise<void>;
  refreshActivityStats: () => Promise<void>;
}

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Push notification hook
  const {
    expoPushToken,
    permissionStatus,
    requestPermission,
    unregisterToken,
    isPermissionGranted,
  } = usePushNotifications();

  // Fetch preferences with React Query
  const {
    data: preferences,
    isLoading: isLoadingPreferences,
    refetch: refetchPreferences,
  } = useQuery({
    queryKey: ["notificationPreferences"],
    queryFn: () => notificationsService.getPreferences(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch activity stats with React Query
  const { data: activityStats, refetch: refetchActivityStats } = useQuery({
    queryKey: ["activityStats"],
    queryFn: () => notificationsService.getActivityStats(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for updating preferences
  const updatePreferenceMutation = useMutation({
    mutationFn: (preferences: Partial<NotificationPreferences>) =>
      notificationsService.updatePreferences(preferences),
    onSuccess: (data) => {
      // Update cache with new preferences
      queryClient.setQueryData(["notificationPreferences"], data);
    },
  });

  /**
   * Update a single preference
   */
  const updatePreference = useCallback(
    async (key: keyof NotificationPreferences, value: boolean | string) => {
      await updatePreferenceMutation.mutateAsync({ [key]: value });
    },
    [updatePreferenceMutation]
  );

  /**
   * Update multiple preferences at once (for batch/package updates)
   */
  const updatePreferences = useCallback(
    async (newPreferences: Partial<NotificationPreferences>) => {
      await updatePreferenceMutation.mutateAsync(newPreferences);
    },
    [updatePreferenceMutation]
  );

  /**
   * Refresh preferences from server
   */
  const refreshPreferences = useCallback(async () => {
    await refetchPreferences();
  }, [refetchPreferences]);

  /**
   * Refresh activity stats from server
   */
  const refreshActivityStats = useCallback(async () => {
    await refetchActivityStats();
  }, [refetchActivityStats]);

  // Clear data on logout
  useEffect(() => {
    if (!isAuthenticated) {
      queryClient.removeQueries({ queryKey: ["notificationPreferences"] });
      queryClient.removeQueries({ queryKey: ["activityStats"] });
    }
  }, [isAuthenticated, queryClient]);

  const value: NotificationsContextType = {
    // Push notification state
    expoPushToken,
    permissionStatus: permissionStatus as string | null,
    isPermissionGranted,

    // Preferences
    preferences: preferences ?? null,
    isLoadingPreferences,

    // Activity stats
    activityStats: activityStats ?? null,

    // Actions
    requestPermission,
    unregisterToken,
    updatePreference,
    updatePreferences,
    refreshPreferences,
    refreshActivityStats,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
}
