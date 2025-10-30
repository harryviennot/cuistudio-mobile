/**
 * Grid preview of selected images
 */
import React from "react";
import { View, Image, Pressable, Text, ScrollView } from "react-native";
import { X } from "phosphor-react-native";
import type { PickedImage } from "@/hooks/useImagePicker";

interface ImagePreviewGridProps {
  images: PickedImage[];
  onRemoveImage?: (index: number) => void;
  editable?: boolean;
}

export function ImagePreviewGrid({
  images,
  onRemoveImage,
  editable = true,
}: ImagePreviewGridProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <View className="py-4">
      <Text className="mb-3 px-4 text-sm font-medium text-gray-600">
        {images.length} {images.length === 1 ? "image" : "images"} selected
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4"
        contentContainerClassName="gap-3"
      >
        {images.map((image, index) => (
          <View key={index} className="relative">
            <Image
              source={{ uri: image.uri }}
              className="h-24 w-24 rounded-xl"
              resizeMode="cover"
            />
            {editable && onRemoveImage && (
              <Pressable
                onPress={() => onRemoveImage(index)}
                className="absolute -right-2 -top-2 h-7 w-7 items-center justify-center rounded-full bg-red-500 shadow-lg"
              >
                <X size={16} color="#ffffff" weight="bold" />
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
