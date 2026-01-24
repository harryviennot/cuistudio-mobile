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
import { Platform, AppState, AppStateStatus } from "react-native";
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
  const [permissionStatus, setPermissionStatus] =
    useState<Notifications.PermissionStatus | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const appState = useRef(AppState.currentState);

  /**
   * Request notification permissions and get Expo push token
   */
  const registerForPushNotifications = useCallback(async (): Promise<
    string | null
  > => {
    // Push notifications require a physical device
    if (!Device.isDevice) {
      console.log("Push notifications require a physical device");
      return null;
    }

    try {
      // Check current permission status
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not already granted
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissionStatus(finalStatus);

      if (finalStatus !== "granted") {
        console.log("Push notification permission not granted");
        return null;
      }

      // Get the Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.error("EAS project ID not found in config");
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
    } catch (error) {
      console.error("Error getting push token:", error);
      return null;
    }
  }, []);

  /**
   * Handle notification tap - deep link to appropriate screen
   */
  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content
        .data as NotificationData;

      if (!data?.screen) {
        console.log("Notification has no screen data, ignoring");
        return;
      }

      console.log("Handling notification tap:", data);

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
          console.log("Unknown notification screen:", data.screen);
      }
    },
    []
  );

  /**
   * Track app open for smart notification timing
   */
  const trackAppOpen = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const currentHour = new Date().getUTCHours();
      await notificationsService.trackAppOpen(currentHour);
    } catch (error) {
      // Silently fail - tracking is not critical
      console.log("Failed to track app open:", error);
    }
  }, [isAuthenticated]);

  /**
   * Initialize push notifications when user authenticates
   */
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      // Clear token when logged out
      setExpoPushToken(null);
      return;
    }

    let isMounted = true;

    const init = async () => {
      const token = await registerForPushNotifications();

      if (token && isMounted) {
        setExpoPushToken(token);

        // Register token with backend
        try {
          await notificationsService.registerToken(
            token,
            Platform.OS as "ios" | "android",
            undefined, // device_id
            Constants.expoConfig?.version
          );
          console.log("Push token registered with backend");
        } catch (error) {
          console.error("Failed to register push token with backend:", error);
        }
      }
    };

    init();

    // Track initial app open
    trackAppOpen();

    // Listen for notifications received while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received in foreground:", notification);
      });

    // Listen for notification taps (user interaction)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );

    return () => {
      isMounted = false;
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [
    isAuthenticated,
    user?.id,
    registerForPushNotifications,
    handleNotificationResponse,
    trackAppOpen,
  ]);

  /**
   * Track app state changes for smart timing
   */
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        // Track when app comes to foreground
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          trackAppOpen();
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [trackAppOpen]);

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
        console.log("Push token unregistered");
      } catch (error) {
        console.error("Failed to unregister push token:", error);
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
