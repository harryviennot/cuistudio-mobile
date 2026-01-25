/**
 * Notification Permission Step
 *
 * Asks users to enable push notifications during onboarding.
 * Matches the ReferralCodeStep design pattern.
 */
import { View, Text, Pressable, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { BellIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";

interface NotificationsStepProps {
  isEnabled: boolean;
  onEnable: () => Promise<void>;
  onSkip: () => void;
  isLoading: boolean;
}

export function NotificationsStep({
  isEnabled,
  onEnable,
  onSkip,
  isLoading,
}: Readonly<NotificationsStepProps>) {
  const { t } = useTranslation();

  const handleEnable = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await onEnable();
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSkip();
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
      {/* Centered Icon - like ReferralCodeStep */}
      {/* <View className="mb-4 items-center">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Bell size={32} color="#2D5A27" weight={isEnabled ? "fill" : "duotone"} />
        </View>
      </View> */}

      {/* Centered Title */}
      <Text
        className="mb-2 text-3xl text-foreground-heading"
        style={{ fontFamily: "PlayfairDisplay_700Bold" }}
      >
        {t("onboarding.notifications.title")}
      </Text>
      <Text className="mb-8 text-base text-foreground-muted">
        {t("onboarding.notifications.subtitle")}
      </Text>

      {/* Primary Action Button or Enabled State */}
      {isEnabled ? (
        <View className="mb-4 flex-row items-center justify-center gap-2 rounded-xl bg-primary/10 px-6 py-4">
          <BellIcon size={20} color="#2D5A27" weight="fill" />
          <Text className="text-base font-semibold text-primary">
            {t("onboarding.notifications.enabled")}
          </Text>
        </View>
      ) : (
        <Pressable
          className="mb-4 items-center rounded-xl bg-primary px-6 py-4 active:opacity-80"
          onPress={handleEnable}
          disabled={isLoading}
        >
          <Text className="text-lg font-semibold text-white">
            {isLoading ? t("common.loading") : t("onboarding.notifications.enable")}
          </Text>
        </Pressable>
      )}

      {/* Skip hint - like ReferralCodeStep */}
      {!isEnabled && (
        <Pressable onPress={handleSkip} disabled={isLoading} className="active:opacity-60">
          <Text className="text-sm text-foreground-muted">
            {t("onboarding.notifications.skip")}
          </Text>
        </Pressable>
      )}

      {/* Info box - customize later hint */}
      <View className="mt-6 rounded-2xl bg-primary/5 p-4">
        <Text className="text-sm text-foreground-secondary">
          {t("onboarding.notifications.hint")}
        </Text>
      </View>
    </ScrollView>
  );
}
