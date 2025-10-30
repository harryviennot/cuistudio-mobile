/**
 * Image upload card with loading indicator
 * Shows individual image with upload progress state
 */
import React from "react";
import { View, Image, Pressable, ActivityIndicator } from "react-native";
import { X, CheckCircle, WarningCircle } from "phosphor-react-native";
import type { PickedImage } from "@/hooks/useImagePicker";

type UploadState = "uploading" | "completed" | "error" | undefined;

interface ImageUploadCardProps {
  image: PickedImage;
  uploadState?: UploadState;
  onRemove?: () => void;
}

export function ImageUploadCard({ image, uploadState, onRemove }: ImageUploadCardProps) {
  const showOverlay = uploadState !== undefined;
  const isUploading = uploadState === "uploading";
  const isCompleted = uploadState === "completed";
  const isError = uploadState === "error";

  return (
    <View className="relative overflow-hidden rounded-2xl bg-surface-elevated shadow-sm">
      {/* Image */}
      <Image source={{ uri: image.uri }} className="h-32 w-full" resizeMode="cover" />

      {/* Upload overlay */}
      {showOverlay && (
        <View
          className={`absolute inset-0 items-center justify-center ${
            isUploading ? "bg-black/40" : isCompleted ? "bg-forest-500/20" : "bg-red-500/20"
          }`}
        >
          {isUploading && (
            <View className="items-center gap-2">
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          )}
          {isCompleted && (
            <View className="items-center gap-2">
              <View className="rounded-full bg-forest-500 p-2">
                <CheckCircle size={32} color="#ffffff" weight="fill" />
              </View>
            </View>
          )}
          {isError && (
            <View className="items-center gap-2">
              <View className="rounded-full bg-red-500 p-2">
                <WarningCircle size={32} color="#ffffff" weight="fill" />
              </View>
            </View>
          )}
        </View>
      )}

      {/* Remove button (only show when not uploading) */}
      {onRemove && !showOverlay && (
        <Pressable
          onPress={onRemove}
          className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-surface-elevated shadow-lg active:bg-surface"
        >
          <X size={20} color="#6b5d4a" weight="bold" />
        </Pressable>
      )}
    </View>
  );
}
