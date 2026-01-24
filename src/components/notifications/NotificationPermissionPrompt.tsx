/**
 * Notification Permission Prompt
 *
 * Shows a one-time modal to existing users who haven't granted notification permissions.
 * Uses the same UI as the onboarding notifications step.
 */
import React, { useRef, useEffect, useState, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop, BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Bell, X } from "phosphor-react-native";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useNotifications } from "@/contexts/NotificationsContext";

const PROMPT_SHOWN_KEY = "notification-prompt-shown";

export function NotificationPermissionPrompt() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { isPermissionGranted, requestPermission } = useNotifications();

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

    // Show if: haven't seen prompt AND permission not already granted
    if (!hasSeenPrompt && !isPermissionGranted) {
      // Small delay to let the app settle after login
      const timeout = setTimeout(() => {
        bottomSheetRef.current?.present();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [hasSeenPrompt, isPermissionGranted]);

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

  const handleDismiss = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
        pressBehavior="close"
      />
    ),
    []
  );

  // Don't render anything if already seen or permission already granted
  if (hasSeenPrompt || isPermissionGranted) {
    return null;
  }

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enablePanDownToClose={true}
      enableDynamicSizing={true}
      backdropComponent={renderBackdrop}
      handleComponent={null}
      backgroundStyle={{
        backgroundColor: "#f4f1e8",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
      }}
      onDismiss={markPromptAsSeen}
    >
      <BottomSheetView style={{ paddingBottom: insets.bottom + 20 }}>
        {/* Header with close button */}
        <View className="flex-row items-center justify-end px-6 pt-4">
          <Pressable
            onPress={handleDismiss}
            className="active:scale-90"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={24} color="#57534e" weight="bold" />
          </Pressable>
        </View>

        {/* Content */}
        <View className="px-6 pb-6">
          {/* Icon */}
          <View className="items-center mb-6">
            <View className="rounded-full bg-primary/15 p-5">
              {isEnabled ? (
                <Bell size={48} color="#334d43" weight="fill" />
              ) : (
                <Bell size={48} color="#334d43" weight="regular" />
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
          <Text className="mb-8 text-base text-center text-foreground-muted leading-6">
            {t("onboarding.notifications.description")}
          </Text>

          {/* Benefits list */}
          <View className="mb-8 gap-3">
            <BenefitItem text={t("onboarding.notifications.benefit1")} />
            <BenefitItem text={t("onboarding.notifications.benefit2")} />
            <BenefitItem text={t("onboarding.notifications.benefit3")} />
          </View>

          {/* Buttons */}
          <View className="gap-3">
            {isEnabled ? (
              <View className="flex-row items-center justify-center gap-2 py-4 px-6 rounded-xl bg-primary/10">
                <Bell size={20} color="#334d43" weight="fill" />
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
                  {isLoading
                    ? t("common.loading")
                    : t("onboarding.notifications.enable")}
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
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="w-2 h-2 rounded-full bg-primary" />
      <Text className="text-foreground-body text-base flex-1">{text}</Text>
    </View>
  );
}
