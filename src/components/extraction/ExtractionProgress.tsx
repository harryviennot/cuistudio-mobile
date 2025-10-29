/**
 * Extraction progress indicator
 */
import React from "react"
import { View, Text } from "react-native"
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated"

interface ExtractionProgressProps {
  progress: number
  currentStep?: string
}

export function ExtractionProgress({
  progress,
  currentStep,
}: ExtractionProgressProps) {
  const progressBarStyle = useAnimatedStyle(() => ({
    width: withSpring(`${Math.min(progress, 100)}%`, {
      damping: 20,
      stiffness: 90,
    }),
  }))

  return (
    <View className="w-full px-6 py-4">
      {/* Progress percentage */}
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-gray-700">
          Extracting recipe...
        </Text>
        <Text className="text-sm font-semibold text-blue-600">
          {Math.round(progress)}%
        </Text>
      </View>

      {/* Progress bar */}
      <View className="mb-3 h-2 overflow-hidden rounded-full bg-gray-200">
        <Animated.View
          style={progressBarStyle}
          className="h-full rounded-full bg-blue-600"
        />
      </View>

      {/* Current step */}
      {currentStep && (
        <Text className="text-xs text-gray-500">{currentStep}</Text>
      )}
    </View>
  )
}
