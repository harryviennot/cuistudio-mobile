import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Switch, ActivityIndicator, Linking, Platform, Pressable } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import {
  BellIcon,
  BellRingingIcon,
  BellSimpleSlashIcon,
  GiftIcon,
  CheckIcon,
} from "phosphor-react-native";

import { PremiumBottomSheet } from "@/components/ui/PremiumBottomSheet";
import { useNotifications } from "@/contexts/NotificationsContext";
import { NotificationPreferences } from "@/api/services/notifications.service";
import { ShadowItem } from "../ShadowedSection";

// Notification frequency package types
type NotificationFrequency = "frequent" | "medium" | "low";

interface FrequencyPackageCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

function FrequencyPackageCard({
  icon,
  title,
  description,
  isSelected,
  onSelect,
  disabled,
}: FrequencyPackageCardProps) {
  const handlePress = () => {
    if (disabled) return;
    Haptics.selectionAsync();
    onSelect();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={`flex-row items-center py-4 px-4 rounded-2xl mb-3 border ${
        isSelected
          ? "bg-primary/5 border-primary/20"
          : "bg-transparent border-transparent active:bg-surface-elevated"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-4">
        {icon}
      </View>
      <View className="flex-1">
        <Text
          className={`text-base font-medium ${
            isSelected ? "text-primary-dark" : "text-foreground-heading"
          }`}
        >
          {title}
        </Text>
        <Text className="text-sm text-foreground-muted mt-0.5">{description}</Text>
      </View>
      {isSelected && (
        <View className="bg-primary rounded-full p-1">
          <CheckIcon size={14} color="#fff" weight="bold" />
        </View>
      )}
    </Pressable>
  );
}

/**
 * Map a frequency package to individual preference flags
 */
function mapFrequencyToPreferences(
  frequency: NotificationFrequency
): Partial<NotificationPreferences> {
  switch (frequency) {
    case "frequent":
      return {
        cook_tonight: true,
        cooking_streak: true,
        miss_you: true,
        first_recipe_nudge: true,
        weekly_credits_refresh: true,
      };
    case "medium":
      return {
        cook_tonight: false,
        cooking_streak: true,
        miss_you: true,
        first_recipe_nudge: true,
        weekly_credits_refresh: true,
      };
    case "low":
      return {
        cook_tonight: false,
        cooking_streak: false,
        miss_you: false,
        first_recipe_nudge: false,
        weekly_credits_refresh: true,
      };
  }
}

export const NotificationPreferencesBottomSheet = forwardRef<BottomSheetModal>(
  function NotificationPreferencesBottomSheet(_props, ref) {
    const { t } = useTranslation();
    const {
      isLoadingPreferences: isLoading,
      updatePreferences,
      isPermissionGranted,
      requestPermission,
    } = useNotifications();

    // Local state - default to "frequent" when enabled
    const [selectedFrequency, setSelectedFrequency] = useState<NotificationFrequency>("frequent");
    const [referralEnabled, setReferralEnabled] = useState(true);

    // Track if changes were made (for batch save on dismiss)
    const hasChangesRef = useRef(false);
    const initialValuesRef = useRef({
      frequency: "frequent" as NotificationFrequency,
      referral: true,
    });

    // Reset to defaults when sheet opens (if notifications are enabled)
    useEffect(() => {
      if (isPermissionGranted) {
        setSelectedFrequency("frequent");
        setReferralEnabled(true);
        initialValuesRef.current = { frequency: "frequent", referral: true };
        hasChangesRef.current = false;
      }
    }, [isPermissionGranted]);

    const handleDismiss = useCallback(async () => {
      // Save changes on dismiss if any were made
      if (hasChangesRef.current && isPermissionGranted) {
        try {
          const frequencyPrefs = mapFrequencyToPreferences(selectedFrequency);
          await updatePreferences({
            ...frequencyPrefs,
            referral_activated: referralEnabled,
          });
        } catch (error) {
          console.error("[NotificationPreferences] Failed to save preferences:", error);
        }
      }

      if (ref && "current" in ref && ref.current) {
        ref.current.dismiss();
      }
    }, [ref, selectedFrequency, referralEnabled, updatePreferences, isPermissionGranted]);

    const handleFrequencyChange = useCallback((newFrequency: NotificationFrequency) => {
      setSelectedFrequency(newFrequency);
      hasChangesRef.current = true;
    }, []);

    const handleReferralToggle = useCallback((newValue: boolean) => {
      Haptics.selectionAsync();
      setReferralEnabled(newValue);
      hasChangesRef.current = true;
    }, []);

    const handleEnableNotifications = useCallback(async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const granted = await requestPermission();
      if (!granted) {
        // Open settings if permission was denied
        if (Platform.OS === "ios") {
          Linking.openURL("app-settings:");
        } else {
          Linking.openSettings();
        }
      }
    }, [requestPermission]);

    const notificationsDisabled = !isPermissionGranted;

    return (
      <PremiumBottomSheet
        ref={ref}
        title={t("settings.notifications.title")}
        subtitle={t("settings.notifications.subtitle")}
        onClose={handleDismiss}
      >
        <View className="px-6 pb-8">
          {isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#334d43" />
            </View>
          ) : (
            <>
              {/* Permission banner if notifications disabled */}
              {notificationsDisabled && (
                <Pressable
                  onPress={handleEnableNotifications}
                  className="flex-row items-center py-4 px-5 rounded-2xl mb-4 bg-primary/10 border border-primary/20 active:opacity-80"
                >
                  <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
                    <BellSimpleSlashIcon size={20} color="#334d43" weight="fill" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-primary-dark">
                      {t("settings.notifications.permissionBanner.title")}
                    </Text>
                    <Text className="text-sm text-foreground-muted mt-0.5">
                      {t("settings.notifications.permissionBanner.description")}
                    </Text>
                  </View>
                </Pressable>
              )}

              {/* Disabled instructions */}
              {notificationsDisabled && (
                <Text className="text-sm text-foreground-muted  mb-6 px-4">
                  {t("settings.notifications.disabledInstructions")}
                </Text>
              )}

              {/* Frequency section */}
              <Text className="text-sm font-semibold text-foreground-muted uppercase tracking-wide mb-3">
                {t("settings.notifications.frequencySection")}
              </Text>

              <FrequencyPackageCard
                icon={<BellRingingIcon size={20} color="#334d43" weight="fill" />}
                title={t("settings.notifications.packages.frequent.title")}
                description={t("settings.notifications.packages.frequent.description")}
                isSelected={!notificationsDisabled && selectedFrequency === "frequent"}
                onSelect={() => handleFrequencyChange("frequent")}
                disabled={notificationsDisabled}
              />

              <FrequencyPackageCard
                icon={<BellIcon size={20} color="#334d43" weight="fill" />}
                title={t("settings.notifications.packages.medium.title")}
                description={t("settings.notifications.packages.medium.description")}
                isSelected={!notificationsDisabled && selectedFrequency === "medium"}
                onSelect={() => handleFrequencyChange("medium")}
                disabled={notificationsDisabled}
              />

              <FrequencyPackageCard
                icon={<BellIcon size={20} color="#334d43" weight="duotone" />}
                title={t("settings.notifications.packages.low.title")}
                description={t("settings.notifications.packages.low.description")}
                isSelected={!notificationsDisabled && selectedFrequency === "low"}
                onSelect={() => handleFrequencyChange("low")}
                disabled={notificationsDisabled}
              />

              {/* Referral section */}
              <Text className="text-sm font-semibold text-foreground-muted uppercase tracking-wide mb-3 mt-6">
                {t("settings.notifications.referralSection")}
              </Text>

              <ShadowItem
                className={`flex-row items-center py-4 px-4 rounded-2xl bg-surface-elevated ${
                  notificationsDisabled ? "opacity-50" : ""
                }`}
              >
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-4">
                  <GiftIcon size={20} color="#334d43" weight="fill" />
                </View>
                <View className="flex-1 mr-3">
                  <Text className="text-base font-medium text-foreground-heading">
                    {t("settings.notifications.referralToggle.title")}
                  </Text>
                  <Text className="text-sm text-foreground-muted mt-0.5">
                    {t("settings.notifications.referralToggle.description")}
                  </Text>
                </View>
                <Switch
                  value={notificationsDisabled ? false : referralEnabled}
                  onValueChange={handleReferralToggle}
                  disabled={notificationsDisabled}
                  trackColor={{ false: "#3e3e3e", true: "#334d43" }}
                  thumbColor={referralEnabled && !notificationsDisabled ? "#fff" : "#f4f3f4"}
                />
              </ShadowItem>
            </>
          )}
        </View>
      </PremiumBottomSheet>
    );
  }
);
