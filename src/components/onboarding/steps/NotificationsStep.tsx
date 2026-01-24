/**
 * Notification Permission Step
 *
 * Asks users to enable push notifications during onboarding.
 * Shows value proposition and allows skipping.
 */
import { View, Text, Pressable, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { Bell } from "phosphor-react-native";
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
}: NotificationsStepProps) {
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
    </ScrollView>
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
