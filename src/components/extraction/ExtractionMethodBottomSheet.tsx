/**
 * Bottom sheet for selecting extraction method and confirming images
 */
import React, { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { Camera, Image as ImageIcon, Check, ArrowLeft } from "phosphor-react-native";
import { ImageUploadCard } from "./ImageUploadCard";
import type { PickedImage } from "@/hooks/useImagePicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface ExtractionMethod {
  id: "camera" | "gallery";
  label: string;
  icon: React.ReactNode;
}

export interface ExtractionMethodBottomSheetRef {
  present: () => void;
  dismiss: () => void;
  showConfirmation: (images: PickedImage[]) => void;
}

interface ExtractionMethodBottomSheetProps {
  onSelectMethod: (method: "camera" | "gallery") => void;
  onConfirmImages: (images: PickedImage[]) => void;
}

export const ExtractionMethodBottomSheet = forwardRef<
  ExtractionMethodBottomSheetRef,
  ExtractionMethodBottomSheetProps
>(({ onSelectMethod, onConfirmImages }, ref) => {
  const bottomSheetRef = React.useRef<BottomSheetModal>(null);
  const [view, setView] = useState<"method" | "confirmation">("method");
  const [selectedImages, setSelectedImages] = useState<PickedImage[]>([]);
  const [uploadingStates, setUploadingStates] = useState<
    Record<number, "uploading" | "completed" | "error">
  >({});

  const { bottom } = useSafeAreaInsets();

  const methods: ExtractionMethod[] = [
    {
      id: "camera",
      label: "Take Photos",
      icon: <Camera size={32} color="#334d43" weight="duotone" />,
    },
    {
      id: "gallery",
      label: "Choose from Gallery",
      icon: <ImageIcon size={32} color="#334d43" weight="duotone" />,
    },
  ];

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    present: () => {
      setView("method");
      setSelectedImages([]);
      setUploadingStates({});
      bottomSheetRef.current?.present();
    },
    dismiss: () => {
      bottomSheetRef.current?.dismiss();
    },
    showConfirmation: (images: PickedImage[]) => {
      setSelectedImages(images);
      setView("confirmation");
      setUploadingStates({});
    },
  }));

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
    ),
    []
  );

  const handleSheetChanges = useCallback((index: number) => {
    console.log("Bottom sheet index changed to:", index);
    if (index === -1) {
      // Reset when dismissed
      setView("method");
      setSelectedImages([]);
      setUploadingStates({});
    }
  }, []);

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    if (selectedImages.length === 0) return;

    // Set all images to uploading state
    const initialStates: Record<number, "uploading"> = {};
    selectedImages.forEach((_, index) => {
      initialStates[index] = "uploading";
    });
    setUploadingStates(initialStates);

    // Call parent callback to handle upload
    onConfirmImages(selectedImages);
  };

  const handleBackToMethod = () => {
    setView("method");
    setSelectedImages([]);
    setUploadingStates({});
  };

  const isUploading = Object.keys(uploadingStates).length > 0;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enableDynamicSizing
      enablePanDownToClose={!isUploading}
      enableHandlePanningGesture={!isUploading}
      backdropComponent={renderBackdrop}
      onChange={handleSheetChanges}
      backgroundStyle={{ backgroundColor: "#fefdfb" }}
      handleIndicatorStyle={{ backgroundColor: "#334d43", width: 40 }}
    >
      {view === "method" ? (
        /* METHOD SELECTION VIEW */
        <BottomSheetView
          className="flex-1 bg-surface-elevated px-6 pt-4"
          style={{ paddingBottom: bottom + 16 }}
        >
          <Text className="mb-6 text-center text-xl font-semibold text-foreground-heading">
            Add Recipe from Image
          </Text>

          <View className="gap-4">
            {methods.map((method) => (
              <Pressable
                key={method.id}
                onPress={() => {
                  console.log("Method selected:", method.id);
                  onSelectMethod(method.id);
                }}
                className="flex-row items-center gap-4 rounded-2xl border-2 border-border bg-surface-elevated p-6 active:bg-surface"
              >
                <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  {method.icon}
                </View>
                <Text className="flex-1 text-lg font-medium text-foreground-heading">
                  {method.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </BottomSheetView>
      ) : (
        /* CONFIRMATION VIEW */
        <BottomSheetView
          className="max-h-[80vh] bg-surface-elevated px-6 pt-4"
          style={{ paddingBottom: bottom + 16 }}
        >
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between">
            {!isUploading && (
              <Pressable onPress={handleBackToMethod} className="p-1">
                <ArrowLeft size={24} color="#6b5d4a" weight="regular" />
              </Pressable>
            )}
            <Text className="flex-1 text-center text-base font-medium text-foreground-secondary">
              {selectedImages.length} {selectedImages.length === 1 ? "image" : "images"} selected
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Image Grid - 3 columns, responsive */}
          <View className="mb-4 flex-row flex-wrap justify-center gap-3">
            {selectedImages.map((image, index) => (
              <View key={`${image.uri}-${index}`} style={{ width: "31%" }}>
                <ImageUploadCard
                  image={image}
                  uploadState={uploadingStates[index]}
                  onRemove={isUploading ? undefined : () => handleRemoveImage(index)}
                />
              </View>
            ))}
          </View>

          {/* Confirm Button */}
          <View className="pb-4 pt-4">
            {isUploading ? (
              <View className="flex-row items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4">
                <ActivityIndicator color="#fefdfb" />
                <Text className="text-base font-semibold text-surface-elevated">
                  Uploading images...
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={handleConfirm}
                disabled={selectedImages.length === 0}
                className={`flex-row items-center justify-center gap-2 rounded-2xl px-6 py-4 ${
                  selectedImages.length === 0
                    ? "bg-interactive-muted opacity-50"
                    : "bg-primary active:bg-primary-dark"
                }`}
              >
                <Check size={20} color="#fefdfb" weight="bold" />
                <Text className="text-base font-semibold text-surface-elevated">
                  Confirm & Extract Recipe
                </Text>
              </Pressable>
            )}
          </View>
        </BottomSheetView>
      )}
    </BottomSheetModal>
  );
});

ExtractionMethodBottomSheet.displayName = "ExtractionMethodBottomSheet";
