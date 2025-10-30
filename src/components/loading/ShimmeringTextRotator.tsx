/**
 * Shimmering text rotator with smooth transitions
 * Displays fun cooking-related sentences with a left-to-right shimmer effect
 */
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  interpolate,
} from "react-native-reanimated";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";

const FUN_SENTENCES = [
  "Reading grandma's secret notes...",
  "Translating chef whispers...",
  "Decoding culinary magic...",
  "Measuring a pinch of this, a dash of that...",
  "Consulting the flavor wizards...",
  "Separating the yolks from the folks...",
  "Preheating the AI oven...",
  "Taste-testing with algorithms...",
  "Whisking up something special...",
  "Sprinkling in some digital seasoning...",
  "Folding in the secret ingredients...",
  "Letting the flavors marry...",
  "Caramelizing the details...",
  "Reducing the complexity...",
  "Simmering down the instructions...",
  "Garnishing with precision...",
  "Plating your masterpiece...",
];

interface ShimmeringTextRotatorProps {
  /** Rotation interval in milliseconds (default: 3000) */
  interval?: number;
  /** Text size class (default: "text-lg") */
  textSize?: string;
}

export function ShimmeringTextRotator({
  interval = 3000,
  textSize = "text-lg",
}: ShimmeringTextRotatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Shimmer animation - moves from left to right continuously
  const shimmerPosition = useSharedValue(-1);

  useEffect(() => {
    // Start continuous left-to-right shimmer (slower)
    shimmerPosition.value = -1;
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 3500, easing: Easing.linear }),
      -1,
      false
    );
  }, [shimmerPosition]);

  useEffect(() => {
    // Simple text rotation without animation callbacks
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FUN_SENTENCES.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  // Animated gradient positions for shimmer
  const animatedGradientStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerPosition.value,
      [-1, 1],
      [-300, 300]
    );

    return {
      transform: [{ translateX }],
    };
  });

  const currentText = FUN_SENTENCES[currentIndex];

  return (
    <View className="px-8 w-full">
      <MaskedView
        style={{
          flexDirection: "row",
          minHeight: 60,
          alignItems: "center",
          justifyContent: "center",
        }}
        maskElement={
          <View
            style={{
              backgroundColor: "transparent",
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 10,
            }}
          >
            <Animated.Text
              className={`${textSize} font-semibold text-center`}
              style={{
                lineHeight: 28,
              }}
            >
              {currentText}
            </Animated.Text>
          </View>
        }
      >
        {/* Base color layer - terracotta orange with reduced opacity */}
        <View style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 10,
        }}>
          <Animated.Text
            className={`${textSize} font-semibold text-center`}
            style={{
              color: "rgba(233, 119, 83, 0.4)",
              lineHeight: 28,
            }}
          >
            {currentText}
          </Animated.Text>
        </View>

        {/* Shimmer gradient layer - terracotta orange */}
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              bottom: 0,
            },
            animatedGradientStyle,
          ]}
        >
          <LinearGradient
            colors={[
              "transparent",
              "rgba(233, 119, 83, 0.3)",
              "rgba(233, 119, 83, 1)",
              "rgba(233, 119, 83, 0.3)",
              "transparent",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: 300,
              height: "100%",
            }}
          />
        </Animated.View>
      </MaskedView>
    </View>
  );
}
