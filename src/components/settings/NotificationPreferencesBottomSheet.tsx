import React, { forwardRef, useCallback } from "react";
import { View, Text, Switch, ActivityIndicator, Linking, Platform } from "react-native";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import {
  BellIcon,
  GiftIcon,
  ChefHatIcon,
  FireIcon,
  ClockIcon,
  SparkleIcon,
} from "phosphor-react-native";

import { PremiumBottomSheet } from "@/components/ui/PremiumBottomSheet";
import { useNotifications } from "@/contexts/NotificationsContext";

interface PreferenceToggleProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

function PreferenceToggle({
  icon,
  title,
  description,
  value,
  onValueChange,
  disabled,
}: PreferenceToggleProps) {
  const handleToggle = (newValue: boolean) => {
    Haptics.selectionAsync();
    onValueChange(newValue);
  };

  return (
    <View
      className={`flex-row items-start py-4 px-4 rounded-xl mb-3 bg-surface-elevated ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
        {icon}
      </View>
      <View className="flex-1 mr-3">
        <Text className="text-base font-medium text-foreground-heading">{title}</Text>
        <Text className="text-sm text-foreground-muted mt-0.5">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={handleToggle}
        disabled={disabled}
        trackColor={{ false: "#3e3e3e", true: "#334d43" }}
        thumbColor={value ? "#fff" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
      />
    </View>
  );
}

export const NotificationPreferencesBottomSheet = forwardRef<BottomSheetModal>(
  function NotificationPreferencesBottomSheet(_props, ref) {
    const { t } = useTranslation();
    const {
      preferences,
      isLoadingPreferences: isLoading,
      updatePreference,
      isPermissionGranted,
      requestPermission,
    } = useNotifications();

    const handleDismiss = () => {
      if (ref && "current" in ref && ref.current) {
        ref.current.dismiss();
      }
    };

    const handleMasterToggle = useCallback(
      async (value: boolean) => {
        if (value && !isPermissionGranted) {
          // Need to request permission first
          const granted = await requestPermission();
          if (!granted) {
            // Open settings if permission was denied
            if (Platform.OS === "ios") {
              Linking.openURL("app-settings:");
            } else {
              Linking.openSettings();
            }
            return;
          }
        }
        await updatePreference("notifications_enabled", value);
      },
      [isPermissionGranted, requestPermission, updatePreference]
    );

    const masterEnabled = preferences?.notifications_enabled ?? true;

    return (
      <PremiumBottomSheet
        ref={ref}
        snapPoints={["85%"]}
        title={t("settings.notifications.title")}
        subtitle={t("settings.notifications.subtitle")}
        onClose={handleDismiss}
      >
        <BottomSheetScrollView className="flex-1">
          <View className="px-6 pb-8">
            {isLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#334d43" />
              </View>
            ) : (
              <>
                {/* Master toggle */}
                <View className="mb-6">
                  <PreferenceToggle
                    icon={<BellIcon size={20} color="#334d43" weight="fill" />}
                    title={t("settings.notifications.masterToggle.title")}
                    description={
                      isPermissionGranted
                        ? t("settings.notifications.masterToggle.description")
                        : t("settings.notifications.masterToggle.permissionRequired")
                    }
                    value={masterEnabled && isPermissionGranted}
                    onValueChange={handleMasterToggle}
                  />
                </View>

                {/* Individual preferences */}
                <Text className="text-sm font-semibold text-foreground-muted uppercase tracking-wide mb-3">
                  {t("settings.notifications.categories")}
                </Text>

                <PreferenceToggle
                  icon={<SparkleIcon size={20} color="#334d43" weight="fill" />}
                  title={t("settings.notifications.weeklyCredits.title")}
                  description={t("settings.notifications.weeklyCredits.description")}
                  value={preferences?.weekly_credits_refresh ?? true}
                  onValueChange={(v) => updatePreference("weekly_credits_refresh", v)}
                  disabled={!masterEnabled}
                />

                <PreferenceToggle
                  icon={<GiftIcon size={20} color="#334d43" weight="fill" />}
                  title={t("settings.notifications.referral.title")}
                  description={t("settings.notifications.referral.description")}
                  value={preferences?.referral_activated ?? true}
                  onValueChange={(v) => updatePreference("referral_activated", v)}
                  disabled={!masterEnabled}
                />

                <PreferenceToggle
                  icon={<ChefHatIcon size={20} color="#334d43" weight="fill" />}
                  title={t("settings.notifications.cookTonight.title")}
                  description={t("settings.notifications.cookTonight.description")}
                  value={preferences?.cook_tonight ?? true}
                  onValueChange={(v) => updatePreference("cook_tonight", v)}
                  disabled={!masterEnabled}
                />

                <PreferenceToggle
                  icon={<FireIcon size={20} color="#334d43" weight="fill" />}
                  title={t("settings.notifications.cookingStreak.title")}
                  description={t("settings.notifications.cookingStreak.description")}
                  value={preferences?.cooking_streak ?? true}
                  onValueChange={(v) => updatePreference("cooking_streak", v)}
                  disabled={!masterEnabled}
                />

                <PreferenceToggle
                  icon={<ClockIcon size={20} color="#334d43" weight="fill" />}
                  title={t("settings.notifications.missYou.title")}
                  description={t("settings.notifications.missYou.description")}
                  value={preferences?.miss_you ?? true}
                  onValueChange={(v) => updatePreference("miss_you", v)}
                  disabled={!masterEnabled}
                />

                <PreferenceToggle
                  icon={<BellIcon size={20} color="#334d43" weight="fill" />}
                  title={t("settings.notifications.firstRecipe.title")}
                  description={t("settings.notifications.firstRecipe.description")}
                  value={preferences?.first_recipe_nudge ?? true}
                  onValueChange={(v) => updatePreference("first_recipe_nudge", v)}
                  disabled={!masterEnabled}
                />
              </>
            )}
          </View>
        </BottomSheetScrollView>
      </PremiumBottomSheet>
    );
  }
);
