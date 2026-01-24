/**
 * Push Notifications Hook
 *
 * Handles:
 * - Permission requests
 * - Token registration with backend
 * - Notification handling (foreground/background)
 * - Deep linking from notification taps
 */
import { useEffect, useRef, useCallback, useState } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { notificationsService } from "@/api/services/notifications.service";

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationData {
  type?: string;
  screen?: string;
  recipe_id?: string;
  section?: string;
}

export function usePushNotifications() {
  const { isAuthenticated, user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(
    null
  );
  const notificationListener = useRef<ReturnType<
    typeof Notifications.addNotificationReceivedListener
  > | null>(null);
  const responseListener = useRef<ReturnType<
    typeof Notifications.addNotificationResponseReceivedListener
  > | null>(null);

  /**
   * Request notification permissions and get Expo push token
   */
  const registerForPushNotifications = useCallback(async (): Promise<string | null> => {
    // Push notifications require a physical device
    if (!Device.isDevice) {
      if (__DEV__) {
        console.log("[Push] Skipping - not a physical device (simulator)");
      }
      return null;
    }

    try {
      // Check current permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not already granted
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissionStatus(finalStatus);

      if (finalStatus !== "granted") {
        // Permission was denied - this is expected behavior, no need to log
        return null;
      }

      // Get the Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        if (__DEV__) {
          console.log(
            "[Push] EAS project ID not found - ensure you have eas.projectId in app.config.ts"
          );
        }
        return null;
      }

      const tokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      // Configure Android notification channel
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#334d43",
        });
      }

      return tokenResponse.data;
    } catch (error: unknown) {
      // Handle missing entitlements gracefully (Expo Go or dev builds without push capability)
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("aps-environment") || errorMessage.includes("entitlement")) {
        if (__DEV__) {
          console.log(
            "[Push] Skipping - app not built with push notification entitlements (use npx expo run:ios --device for testing)"
          );
        }
        return null;
      }
      // Log other unexpected errors
      console.error("[Push] Error getting token:", error);
      return null;
    }
  }, []);

  /**
   * Handle notification tap - deep link to appropriate screen
   */
  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data as NotificationData;

    if (!data?.screen) {
      return;
    }

    if (__DEV__) {
      console.log("[Push] Handling notification tap:", data.screen);
    }

    switch (data.screen) {
      case "recipe":
        if (data.recipe_id) {
          router.push(`/recipe/${data.recipe_id}`);
        }
        break;
      case "new-recipe":
        router.push("/(protected)/(tabs)/new-recipe");
        break;
      case "library":
        router.push("/(protected)/(tabs)/library");
        break;
      case "settings":
        router.push("/(protected)/settings");
        break;
      default:
        if (__DEV__) {
          console.log("[Push] Unknown notification screen:", data.screen);
        }
    }
  }, []);

  /**
   * Check existing permission status on mount (without requesting)
   * This allows us to know if permission was previously granted
   */
  useEffect(() => {
    const checkExistingPermission = async () => {
      if (!Device.isDevice) return;

      try {
        const { status } = await Notifications.getPermissionsAsync();
        setPermissionStatus(status);

        // If permission already granted, get token and register
        if (status === "granted" && isAuthenticated && user?.id) {
          const projectId = Constants.expoConfig?.extra?.eas?.projectId;
          if (projectId) {
            const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
            setExpoPushToken(tokenResponse.data);

            // Register with backend
            try {
              await notificationsService.registerToken(
                tokenResponse.data,
                Platform.OS as "ios" | "android",
                undefined,
                Constants.expoConfig?.version
              );
              if (__DEV__) {
                console.log("[Push] Token registered with backend");
              }
            } catch (error) {
              console.error("[Push] Failed to register token:", error);
            }
          }
        }
      } catch {
        // Permission check failed - likely missing entitlements, handled elsewhere
      }
    };

    checkExistingPermission();
  }, [isAuthenticated, user?.id]);

  /**
   * Set up notification listeners when authenticated
   * Note: We don't auto-request permission here - that's done via requestPermission()
   * during onboarding or through the NotificationPermissionPrompt for existing users
   */
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      // Clear token when logged out
      setExpoPushToken(null);
      return;
    }

    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      if (__DEV__) {
        console.log("[Push] Notification received:", notification.request.content.title);
      }
    });

    // Listen for notification taps (user interaction)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    return () => {
      // Use .remove() method on subscription objects (removeNotificationSubscription was deprecated)
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated, user?.id, handleNotificationResponse]);

  /**
   * Manually request notification permission
   * Use this in onboarding or settings
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const token = await registerForPushNotifications();

    if (token) {
      setExpoPushToken(token);

      // Register with backend if authenticated
      if (isAuthenticated) {
        try {
          await notificationsService.registerToken(
            token,
            Platform.OS as "ios" | "android",
            undefined,
            Constants.expoConfig?.version
          );
        } catch (error) {
          console.error("Failed to register token:", error);
        }
      }

      return true;
    }

    return false;
  }, [registerForPushNotifications, isAuthenticated]);

  /**
   * Unregister token (call on logout)
   */
  const unregisterToken = useCallback(async () => {
    if (expoPushToken) {
      try {
        await notificationsService.unregisterToken(expoPushToken);
        if (__DEV__) {
          console.log("[Push] Token unregistered");
        }
      } catch (error) {
        console.error("[Push] Failed to unregister token:", error);
      }
    }
    setExpoPushToken(null);
  }, [expoPushToken]);

  return {
    expoPushToken,
    permissionStatus,
    requestPermission,
    unregisterToken,
    isPermissionGranted: permissionStatus === "granted",
  };
}
