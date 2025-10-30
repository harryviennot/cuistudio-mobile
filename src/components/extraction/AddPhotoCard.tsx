/**
 * Add Photo card component
 * Shows a button to add more photos to the selection
 */
import React from "react";
import { View, Text, Pressable } from "react-native";
import { Camera } from "phosphor-react-native";

interface AddPhotoCardProps {
  onPress: () => void;
}

export function AddPhotoCard({ onPress }: AddPhotoCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface active:bg-surface-elevated"
    >
      <View className="items-center gap-2">
        <View className="rounded-full bg-primary/10 p-3">
          <Camera size={24} color="#334d43" weight="duotone" />
        </View>
        <Text className="text-xs font-medium text-foreground-secondary">Add Photo</Text>
      </View>
    </Pressable>
  );
}
