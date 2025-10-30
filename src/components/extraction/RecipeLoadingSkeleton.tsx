/**
 * Loading skeleton for recipe extraction
 */
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export function RecipeLoadingSkeleton() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 1000 }), withTiming(0.3, { duration: 1000 })),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View className="px-6">
      {/* Title skeleton */}
      <Animated.View style={animatedStyle} className="mb-6 h-8 w-3/4 rounded-lg bg-gray-300" />

      {/* Description skeleton */}
      <Animated.View style={animatedStyle} className="mb-4 h-4 w-full rounded bg-gray-200" />
      <Animated.View style={animatedStyle} className="mb-8 h-4 w-5/6 rounded bg-gray-200" />

      {/* Section title */}
      <Animated.View style={animatedStyle} className="mb-4 h-6 w-1/3 rounded bg-gray-300" />

      {/* List items */}
      {[1, 2, 3, 4].map((i) => (
        <Animated.View
          key={i}
          style={animatedStyle}
          className="mb-3 h-4 w-full rounded bg-gray-200"
        />
      ))}

      {/* Section title */}
      <Animated.View style={animatedStyle} className="mb-4 mt-6 h-6 w-1/3 rounded bg-gray-300" />

      {/* List items */}
      {[1, 2, 3].map((i) => (
        <Animated.View
          key={i}
          style={animatedStyle}
          className="mb-3 h-4 w-full rounded bg-gray-200"
        />
      ))}
    </View>
  );
}
