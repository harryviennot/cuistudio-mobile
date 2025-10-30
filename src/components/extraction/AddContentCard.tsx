/**
 * Generic Add Content card component
 * Shows a button to add more content (images, videos, etc.)
 */
import React from "react";
import { View, Text, Pressable } from "react-native";

interface AddContentCardProps {
  onPress: () => void;
  icon: React.ReactNode;
  label: string;
}

export function AddContentCard({ onPress, icon, label }: AddContentCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface active:bg-surface-elevated"
    >
      <View className="items-center gap-2">
        <View className="rounded-full bg-primary/10 p-3">{icon}</View>
        <Text className="text-xs font-medium text-foreground-secondary">{label}</Text>
      </View>
    </Pressable>
  );
}
