/**
 * Floating Action Button for adding recipes
 */
import React from "react";
import { Pressable } from "react-native";
import { PlusIcon } from "phosphor-react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FABProps {
  onPress: () => void;
}

export function FAB({ onPress }: FABProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        {
          position: "absolute",
          bottom: 32,
          right: 32,
          zIndex: 1000,
        },
      ]}
      className="h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg"
    >
      <PlusIcon size={32} color="#ffffff" weight="bold" />
    </AnimatedPressable>
  );
}
