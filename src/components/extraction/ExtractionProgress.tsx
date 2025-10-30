/**
 * Extraction progress indicator with smooth interpolation and shimmering text
 * Features:
 * - Smooth progress bar that interpolates 25% of remaining on each poll
 * - Shimmer effect on title text (OpenAI style)
 * - Rotating text with fun cooking-related sentences
 */
import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { ShimmeringTextRotator } from "../loading";

interface ExtractionProgressProps {
  progress: number;
  currentStep?: string;
}

export function ExtractionProgress({ progress, currentStep }: ExtractionProgressProps) {
  const { t } = useTranslation();

  // Interpolated progress for smooth animation between polling updates
  const interpolatedProgress = useSharedValue(0);
  const lastRealProgress = useRef(0);
  const pollCountRef = useRef(0);

  // Display progress that matches the animated bar
  const [displayProgress, setDisplayProgress] = useState(0);

  // Shimmer animation for title (OpenAI style)
  const shimmerAnimation = useSharedValue(0);

  useEffect(() => {
    // Start shimmer animation
    shimmerAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmerAnimation.value, [0, 0.5, 1], [0.6, 1, 0.6]);
    return { opacity };
  });

  useEffect(() => {
    // Every poll, add 25% of remaining distance and cap at 95%
    const currentProgress = interpolatedProgress.value;

    // If this is a real backend update, jump to it first
    if (progress !== lastRealProgress.current && progress > currentProgress) {
      lastRealProgress.current = progress;
      pollCountRef.current = 0;

      interpolatedProgress.value = withTiming(
        progress,
        {
          duration: 600,
          easing: Easing.out(Easing.cubic),
        },
        () => {
          runOnJS(setDisplayProgress)(progress);
        }
      );
    } else if (progress === lastRealProgress.current) {
      // This is a poll without backend update - add 25% of remaining
      pollCountRef.current += 1;

      const gap = 95 - currentProgress; // Max out at 95%
      const increment = gap * 0.25;
      const nextTarget = Math.min(currentProgress + increment, 95);

      if (nextTarget > currentProgress) {
        interpolatedProgress.value = withTiming(
          nextTarget,
          {
            duration: 1500,
            easing: Easing.out(Easing.quad),
          },
          () => {
            runOnJS(setDisplayProgress)(Math.round(nextTarget));
          }
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]); // Trigger on every poll

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${Math.min(interpolatedProgress.value, 100)}%`,
  }));

  return (
    <View className="flex-1 w-full">
      {/* Progress Bar Section at top */}
      <View className="w-full px-6 pt-6 pb-4">
        {/* Progress percentage with shimmer */}
        <View className="mb-3 flex-row items-center justify-between">
          <Animated.Text
            style={shimmerStyle}
            className="text-base font-semibold text-foreground-heading"
          >
            {t("extraction.extractingRecipe")}
          </Animated.Text>
          <View className="rounded-full bg-primary/10 px-3 py-1">
            <Text className="text-sm font-bold text-primary">{displayProgress}%</Text>
          </View>
        </View>

        {/* Enhanced progress bar */}
        <View className="mb-2 h-3 overflow-hidden rounded-full bg-surface-elevated shadow-sm">
          <Animated.View style={progressBarStyle} className="h-full rounded-full bg-primary" />
        </View>

        {/* Current step */}
        {currentStep && (
          <Text className="text-center text-sm text-foreground-secondary">{currentStep}</Text>
        )}
      </View>

      {/* Shimmering text rotator centered in remaining space */}
      <View className="flex-1 items-center justify-center">
        <ShimmeringTextRotator interval={3000} textSize="text-lg" />
      </View>
    </View>
  );
}
