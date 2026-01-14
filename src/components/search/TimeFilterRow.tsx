import React, { useCallback, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { CheckIcon, MinusIcon, PlusIcon } from "phosphor-react-native";
import type { Icon } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { ShadowItem } from "@/components/ShadowedSection";
import { formatDuration } from "@/utils/formatDuration";
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
const EXPANDED_HEIGHT = 62;

// Dynamic increment based on current value
function getDynamicIncrement(currentMinutes: number): number {
  if (currentMinutes < 180) return 1;
  if (currentMinutes < 360) return 5;
  if (currentMinutes < 720) return 15;
  return 60;
}

export function TimeFilterRow({
  label,
  icon: IconComponent,
  enabled,
  maxMinutes,
  onToggle,
  onMaxMinutesChange,
}: TimeFilterRowProps) {
  const { t } = useTranslation();
  const expandProgress = useSharedValue(enabled ? 1 : 0);
  const checkboxScale = useSharedValue(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const delayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Smooth animation without bounce
  React.useEffect(() => {
    expandProgress.value = withTiming(enabled ? 1 : 0, {
      duration: 250,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [enabled, expandProgress]);

  const handleToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  }, [onToggle]);

  const handlePressIn = useCallback(() => {
    checkboxScale.value = withTiming(0.97, { duration: 100 });
  }, [checkboxScale]);

  const handlePressOut = useCallback(() => {
    checkboxScale.value = withTiming(1, { duration: 100 });
  }, [checkboxScale]);

  // Time adjuster handlers
  const clearAutoIncrement = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
  }, []);

  const startAutoIncrement = useCallback(
    (direction: 1 | -1) => {
      clearAutoIncrement();
      const timeout = setTimeout(() => {
        let currentValue = maxMinutes;
        const interval = setInterval(() => {
          const increment = getDynamicIncrement(currentValue) * direction;
          currentValue = Math.min(480, Math.max(5, currentValue + increment));
          onMaxMinutesChange(currentValue);
        }, 60);
        intervalRef.current = interval;
      }, 200);
      delayTimeoutRef.current = timeout;
    },
    [maxMinutes, onMaxMinutesChange, clearAutoIncrement]
  );

  const handleIncrement = useCallback(() => {
    const increment = getDynamicIncrement(maxMinutes);
    onMaxMinutesChange(Math.min(480, maxMinutes + increment));
  }, [maxMinutes, onMaxMinutesChange]);

  const handleDecrement = useCallback(() => {
    const increment = getDynamicIncrement(maxMinutes);
    onMaxMinutesChange(Math.max(5, maxMinutes - increment));
  }, [maxMinutes, onMaxMinutesChange]);

  const checkboxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkboxScale.value }],
  }));

  const expandAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(expandProgress.value, [0, 1], [COLLAPSED_HEIGHT, EXPANDED_HEIGHT]),
    opacity: expandProgress.value,
  }));

  return (
    <View className="mb-2">
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
                "flex-1 text-sm font-bold uppercase tracking-widest",
                enabled ? "text-foreground-heading" : "text-foreground-tertiary"
              )}
            >
              {label}
            </Text>
          </ShadowItem>
        </Animated.View>
      </Pressable>

      {/* Compact Time Adjuster - Animated expand/collapse */}
      <Animated.View style={[expandAnimatedStyle, { overflow: "hidden" }]}>
        {enabled && (
          <ShadowItem className="flex-row items-center justify-between rounded-xl px-4 py-3 mt-2">
            <Pressable
              onPress={handleDecrement}
              onPressIn={() => startAutoIncrement(-1)}
              onPressOut={clearAutoIncrement}
              className="h-8 w-8 items-center justify-center"
              hitSlop={10}
            >
              <MinusIcon size={20} color="#3a3226" weight="bold" />
            </Pressable>

            <Text
              className="text-xl text-foreground-heading"
              style={{ fontFamily: "PlayfairDisplay_700Bold" }}
            >
              {formatDuration(maxMinutes, { t })}
            </Text>

            <Pressable
              onPress={handleIncrement}
              onPressIn={() => startAutoIncrement(1)}
              onPressOut={clearAutoIncrement}
              className="h-8 w-8 items-center justify-center"
              hitSlop={10}
            >
              <PlusIcon size={20} color="#3a3226" weight="bold" />
            </Pressable>
          </ShadowItem>
        )}
      </Animated.View>
    </View>
  );
}
