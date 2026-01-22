/**
 * Low Credits Banner Component
 *
 * Displays a dismissible banner when user has low credits (1 remaining).
 * Encourages upgrade without being intrusive.
 */
import React, { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { SparkleIcon, XIcon, ArrowRightIcon } from "phosphor-react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";

import { useSubscription } from "@/contexts/SubscriptionContext";
import { trackSoftPaywallShown, trackSoftPaywallDismissed } from "@/lib/posthog";

const DISMISSED_KEY = "low_credits_banner_dismissed";
const DISMISSED_EXPIRY_HOURS = 24; // Re-show after 24 hours

interface LowCreditsBannerProps {
  className?: string;
}

export function LowCreditsBanner({ className }: LowCreditsBannerProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { isPremium, totalCredits, isLoading } = useSubscription();
  const [isDismissed, setIsDismissed] = useState(true); // Start dismissed to avoid flash
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Check if banner was recently dismissed
  useEffect(() => {
    const checkDismissed = async () => {
      try {
        const dismissedAt = await AsyncStorage.getItem(DISMISSED_KEY);
        if (dismissedAt) {
          const dismissedTime = new Date(dismissedAt).getTime();
          const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
          // Re-show after expiry period
          setIsDismissed(hoursSinceDismissed < DISMISSED_EXPIRY_HOURS);
        } else {
          setIsDismissed(false);
        }
      } catch {
        setIsDismissed(false);
      }
    };

    checkDismissed();
  }, []);

  // Track view when banner becomes visible
  useEffect(() => {
    if (!isLoading && !isPremium && totalCredits === 1 && !isDismissed && !hasTrackedView) {
      trackSoftPaywallShown({
        trigger: "low_credits",
        credits_remaining: totalCredits,
      });
      setHasTrackedView(true);
    }
  }, [isLoading, isPremium, totalCredits, isDismissed, hasTrackedView]);

  // Don't show if loading, premium, or more than 1 credit
  if (isLoading || isPremium || totalCredits !== 1 || isDismissed) {
    return null;
  }

  const handleDismiss = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsDismissed(true);
    await AsyncStorage.setItem(DISMISSED_KEY, new Date().toISOString());
    trackSoftPaywallDismissed({
      trigger: "low_credits",
      action: "dismissed",
    });
  };

  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    trackSoftPaywallDismissed({
      trigger: "low_credits",
      action: "upgrade_clicked",
    });
    router.push({ pathname: "/paywall", params: { trigger: "low_credits" } });
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutUp.duration(200)}
      className={className}
    >
      <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3">
          <SparkleIcon size={20} color="#d97706" weight="fill" />
        </View>

        <View className="flex-1 mr-2">
          <Text className="text-amber-900 font-semibold text-sm">
            {t("credits.lowCredits.title")}
          </Text>
          <Text className="text-amber-700 text-xs mt-0.5">{t("credits.lowCredits.message")}</Text>
        </View>

        <Pressable
          onPress={handleUpgrade}
          className="bg-amber-500 rounded-full px-3 py-1.5 flex-row items-center active:bg-amber-600"
        >
          <Text className="text-white font-semibold text-xs mr-1">
            {t("credits.lowCredits.upgrade")}
          </Text>
          <ArrowRightIcon size={12} color="#fff" weight="bold" />
        </Pressable>

        <Pressable
          onPress={handleDismiss}
          className="ml-2 p-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <XIcon size={16} color="#92400e" />
        </Pressable>
      </View>
    </Animated.View>
  );
}
