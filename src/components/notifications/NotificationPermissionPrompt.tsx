/**
 * Notification Permission Prompt
 *
 * Shows a one-time modal to existing users who haven't granted notification permissions.
 * Uses PremiumBottomSheet for consistent styling.
 */
import React, { useRef, useEffect, useState, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { BellIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { PremiumBottomSheet } from "@/components/ui/PremiumBottomSheet";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useAuth } from "@/contexts/AuthContext";

const PROMPT_SHOWN_KEY = "notification-prompt-shown";

export function NotificationPermissionPrompt() {
  const { t } = useTranslation();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { isPermissionGranted, requestPermission } = useNotifications();
  const { user } = useAuth();

  const [hasSeenPrompt, setHasSeenPrompt] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  // Load prompt state from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem(PROMPT_SHOWN_KEY).then((value) => {
      setHasSeenPrompt(value === "true");
    });
  }, []);

  // Show prompt if conditions are met
  useEffect(() => {
    // Wait until we know the hasSeenPrompt state
    if (hasSeenPrompt === null) return;

    // Don't show if user has previously registered a push token
    // This means they consciously disabled notifications - respect their choice
    if (user?.has_registered_push_token) return;

    // Show if: haven't seen prompt AND permission not already granted
    if (!hasSeenPrompt && !isPermissionGranted) {
      // Small delay to let the app settle after login
      const timeout = setTimeout(() => {
        bottomSheetRef.current?.present();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [hasSeenPrompt, isPermissionGranted, user?.has_registered_push_token]);

  // Update enabled state when permission changes
  useEffect(() => {
    setIsEnabled(isPermissionGranted);
  }, [isPermissionGranted]);

  const markPromptAsSeen = useCallback(async () => {
    await AsyncStorage.setItem(PROMPT_SHOWN_KEY, "true");
    setHasSeenPrompt(true);
  }, []);

  const handleEnable = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      const granted = await requestPermission();
      setIsEnabled(granted);

      // Mark as seen regardless of outcome
      await markPromptAsSeen();

      // Dismiss after a short delay to show the success state
      if (granted) {
        setTimeout(() => {
          bottomSheetRef.current?.dismiss();
        }, 800);
      } else {
        // Permission denied, just dismiss
        bottomSheetRef.current?.dismiss();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await markPromptAsSeen();
    bottomSheetRef.current?.dismiss();
  };

  const handleClose = useCallback(async () => {
    await markPromptAsSeen();
    bottomSheetRef.current?.dismiss();
  }, [markPromptAsSeen]);

  // Don't render anything if:
  // - Already seen the prompt
  // - Permission already granted
  // - User has previously registered a token (they consciously disabled notifications)
  if (hasSeenPrompt || isPermissionGranted || user?.has_registered_push_token) {
    return null;
  }

  return (
    <PremiumBottomSheet ref={bottomSheetRef} onClose={handleClose} onDismiss={markPromptAsSeen}>
      <View className="px-6 pb-6">
        {/* Icon */}
        <View className="items-center mb-6">
          <View className="rounded-full bg-primary/15 p-5">
            {isEnabled ? (
              <BellIcon size={48} color="#334d43" weight="fill" />
            ) : (
              <BellIcon size={48} color="#334d43" weight="regular" />
            )}
          </View>
        </View>

        {/* Title */}
        <Text
          className="mb-3 text-3xl text-center text-foreground-heading"
          style={{ fontFamily: "PlayfairDisplay_700Bold" }}
        >
          {t("onboarding.notifications.title")}
        </Text>

        {/* Description */}
        <Text className="mb-6 text-base text-center text-foreground-muted leading-6">
          {t("onboarding.notifications.description")}
        </Text>

        {/* Benefits */}
        <Text className="mb-8 text-sm text-center text-foreground-muted">
          {t("onboarding.notifications.benefits")}
        </Text>

        {/* Buttons */}
        <View className="gap-3">
          {isEnabled ? (
            <View className="flex-row items-center justify-center gap-2 py-4 px-6 rounded-xl bg-primary/10">
              <BellIcon size={20} color="#334d43" weight="fill" />
              <Text className="text-primary font-semibold text-base">
                {t("onboarding.notifications.enabled")}
              </Text>
            </View>
          ) : (
            <Pressable
              className="py-4 px-6 rounded-xl bg-primary items-center active:opacity-80"
              onPress={handleEnable}
              disabled={isLoading}
            >
              <Text className="text-white font-semibold text-lg">
                {isLoading ? t("common.loading") : t("onboarding.notifications.enable")}
              </Text>
            </Pressable>
          )}

          {!isEnabled && (
            <Pressable
              className="py-3 px-6 items-center active:opacity-60"
              onPress={handleSkip}
              disabled={isLoading}
            >
              <Text className="text-foreground-muted text-base">
                {t("onboarding.notifications.skip")}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Hint */}
        <Text className="mt-4 text-xs text-center text-foreground-muted/70">
          {t("onboarding.notifications.hint")}
        </Text>
      </View>
    </PremiumBottomSheet>
  );
}
