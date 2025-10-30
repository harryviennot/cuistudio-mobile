/**
 * Extraction progress indicator
 * Compact version for embedding in preview screens
 */
import React from "react";
import { View, Text } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";

interface ExtractionProgressProps {
  progress: number;
  currentStep?: string;
  compact?: boolean;
}

export function ExtractionProgress({
  progress,
  currentStep,
  compact = false
}: ExtractionProgressProps) {
  const progressBarStyle = useAnimatedStyle(() => ({
    width: withSpring(`${Math.min(progress, 100)}%`, {
      damping: 20,
      stiffness: 90,
    }),
  }));

  // Get user-friendly step message
  const stepMessage = currentStep || "Analyzing images...";

  return (
    <View className={compact ? "w-full px-6 py-3" : "w-full px-6 py-4"}>
      {/* Progress percentage */}
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-foreground-heading">
          {compact ? "Extracting..." : "Extracting recipe..."}
        </Text>
        <Text className="text-sm font-semibold text-primary">{Math.round(progress)}%</Text>
      </View>

      {/* Progress bar */}
      <View className="mb-2 h-2 overflow-hidden rounded-full bg-surface-elevated">
        <Animated.View style={progressBarStyle} className="h-full rounded-full bg-primary" />
      </View>

      {/* Current step */}
      {currentStep && (
        <Text className="text-xs text-foreground-secondary">{stepMessage}</Text>
      )}
    </View>
  );
}
