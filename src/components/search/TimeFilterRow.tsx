import React, { useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { CheckIcon } from "phosphor-react-native";
import type { Icon } from "phosphor-react-native";
import { ShadowItem } from "@/components/ShadowedSection";
import { TimeAdjuster } from "@/components/recipe/shared/TimeAdjuster";
import { cn } from "@/utils/cn";

interface TimeFilterRowProps {
  label: string;
  icon: Icon;
  enabled: boolean;
  maxMinutes: number;
  onToggle: () => void;
  onMaxMinutesChange: (minutes: number) => void;
}

const COLLAPSED_HEIGHT = 0;
const EXPANDED_HEIGHT = 90;

export function TimeFilterRow({
  label,
  icon: IconComponent,
  enabled,
  maxMinutes,
  onToggle,
  onMaxMinutesChange,
}: TimeFilterRowProps) {
  const expandProgress = useSharedValue(enabled ? 1 : 0);
  const checkboxScale = useSharedValue(1);

  // Update animation when enabled changes
  React.useEffect(() => {
    expandProgress.value = withSpring(enabled ? 1 : 0, {
      damping: 20,
      stiffness: 300,
    });
  }, [enabled, expandProgress]);

  const handleToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  }, [onToggle]);

  const handlePressIn = useCallback(() => {
    checkboxScale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  }, [checkboxScale]);

  const handlePressOut = useCallback(() => {
    checkboxScale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, [checkboxScale]);

  const checkboxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkboxScale.value }],
  }));

  const expandAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(expandProgress.value, [0, 1], [COLLAPSED_HEIGHT, EXPANDED_HEIGHT]),
    opacity: expandProgress.value,
    marginTop: interpolate(expandProgress.value, [0, 1], [0, 12]),
  }));

  return (
    <View className="mb-3">
      {/* Checkbox Row */}
      <Pressable onPress={handleToggle} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={checkboxAnimatedStyle}>
          <ShadowItem
            className={cn(
              "flex-row items-center gap-3 px-4 py-3.5 rounded-xl",
              enabled && "border-primary bg-primary/5"
            )}
          >
            {/* Custom Checkbox */}
            <View
              className={cn(
                "w-6 h-6 rounded-lg border-2 items-center justify-center",
                enabled ? "bg-primary border-primary" : "border-stone-300 bg-white"
              )}
            >
              {enabled && <CheckIcon size={16} color="white" weight="bold" />}
            </View>

            {/* Icon */}
            <IconComponent
              size={20}
              color={enabled ? "#334d43" : "#8a8177"}
              weight={enabled ? "fill" : "duotone"}
            />

            {/* Label */}
            <Text
              className={cn(
                "flex-1 text-base font-semibold",
                enabled ? "text-foreground-heading" : "text-foreground-secondary"
              )}
            >
              {label}
            </Text>
          </ShadowItem>
        </Animated.View>
      </Pressable>

      {/* TimeAdjuster - Animated expand/collapse */}
      <Animated.View style={[expandAnimatedStyle, { overflow: "hidden" }]}>
        {enabled && (
          <TimeAdjuster
            label=""
            value={maxMinutes}
            onChange={onMaxMinutesChange}
            min={5}
            max={480}
            className="flex-none"
          />
        )}
      </Animated.View>
    </View>
  );
}
