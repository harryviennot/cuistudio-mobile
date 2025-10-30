/**
 * Image confirmation view for extraction bottom sheet
 * Shows selected images in a grid with ability to add/remove
 */
import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { Check, ArrowLeft, Camera } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { ImageUploadCard } from "../ImageUploadCard";
import { AddContentCard } from "../AddContentCard";
import type { PickedImage } from "@/hooks/useImagePicker";

type UploadState = "uploading" | "completed" | "error";

interface ImageConfirmationViewProps {
  images: PickedImage[];
  uploadStates: Record<number, UploadState>;
  maxItems: number;
  onRemoveImage: (index: number) => void;
  onAddMore: () => void;
  onConfirm: () => void;
  onBack: () => void;
  isUploading: boolean;
}

export function ImageConfirmationView({
  images,
  uploadStates,
  maxItems,
  onRemoveImage,
  onAddMore,
  onConfirm,
  onBack,
  isUploading,
}: ImageConfirmationViewProps) {
  const { t } = useTranslation();
  const canAddMore = images.length < maxItems && !isUploading;

  return (
    <View className="bg-surface-elevated px-6 pt-4">
      {/* Header */}
      <View className="mb-4 flex-row items-center justify-between">
        {!isUploading && (
          <Pressable onPress={onBack} className="p-1">
            <ArrowLeft size={24} color="#6b5d4a" weight="regular" />
          </Pressable>
        )}
        <Text className="flex-1 text-center text-base font-medium text-foreground-secondary">
          {t("extraction.selectedCount", { count: images.length })}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Image Grid - 3 columns, responsive */}
      <View className="mb-4 flex-row flex-wrap justify-center gap-3">
        {images.map((image, index) => (
          <Animated.View
            key={`${image.uri}-${index}`}
            style={{ width: "31%" }}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            layout={LinearTransition.duration(200)}
          >
            <ImageUploadCard
              image={image}
              uploadState={uploadStates[index]}
              onRemove={isUploading ? undefined : () => onRemoveImage(index)}
            />
          </Animated.View>
        ))}
        {canAddMore && (
          <Animated.View
            style={{ width: "31%" }}
            entering={FadeIn.duration(200)}
            layout={LinearTransition.duration(200)}
          >
            <AddContentCard
              onPress={onAddMore}
              icon={<Camera size={24} color="#334d43" weight="duotone" />}
              label={t("extraction.addPhoto")}
            />
          </Animated.View>
        )}
      </View>

      {/* Confirm Button */}
      <View className="pb-4 pt-4">
        {isUploading ? (
          <View className="flex-row items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4">
            <ActivityIndicator color="#fefdfb" />
            <Text className="text-base font-semibold text-surface-elevated">
              {t("extraction.uploadingImages")}
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={onConfirm}
            disabled={images.length === 0}
            className={`flex-row items-center justify-center gap-2 rounded-2xl px-6 py-4 ${
              images.length === 0
                ? "bg-interactive-muted opacity-50"
                : "bg-primary active:bg-primary-dark"
            }`}
          >
            <Check size={20} color="#fefdfb" weight="bold" />
            <Text className="text-base font-semibold text-surface-elevated">
              {t("extraction.confirmExtract")}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
