/**
 * Hook for managing image extraction flow
 * Encapsulates image picking, confirmation, and submission logic
 */
import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useImagePicker, type PickedImage } from "./useImagePicker";
import { useImageExtraction } from "./useImageExtraction";
import type { ExtractionSourceType } from "@/config/extractionMethods";

interface UseImageExtractionFlowReturn {
  selectedImages: PickedImage[];
  isSubmitting: boolean;
  handleSelectMethod: (method: ExtractionSourceType) => Promise<PickedImage[] | null>;
  handleConfirm: (images: PickedImage[]) => Promise<void>;
  handleAddMore: (method: ExtractionSourceType) => Promise<PickedImage[] | null>;
  resetSelection: () => void;
}

export function useImageExtractionFlow(maxImages: number = 3): UseImageExtractionFlowReturn {
  const router = useRouter();
  const { pickImages } = useImagePicker();
  const { submitImages, isSubmitting } = useImageExtraction();
  const [selectedImages, setSelectedImages] = useState<PickedImage[]>([]);

  const handleSelectMethod = async (
    method: ExtractionSourceType
  ): Promise<PickedImage[] | null> => {
    const images = await pickImages(method as "camera" | "gallery", {
      maxImages,
      allowsMultipleSelection: true,
    });

    if (images && images.length > 0) {
      setSelectedImages(images);
    }

    return images;
  };

  const handleConfirm = async (images: PickedImage[]) => {
    console.log("Submitting images for extraction...", images.length);
    const response = await submitImages(images);
    console.log("Extraction response:", response);

    if (response) {
      console.log("Navigating to extraction screen with job_id:", response.job_id);
      // Navigate to extraction progress screen
      router.push({
        pathname: "/extraction/[jobId]",
        params: { jobId: response.job_id },
      });
      // Reset selection after successful submission
      setSelectedImages([]);
    } else {
      console.error("No response from submit images");
      Alert.alert("Error", "Failed to submit images for extraction. Please try again.");
    }
  };

  const handleAddMore = async (method: ExtractionSourceType): Promise<PickedImage[] | null> => {
    // Calculate how many more images can be added
    const remainingSlots = maxImages - selectedImages.length;

    const images = await pickImages(method as "camera" | "gallery", {
      maxImages: remainingSlots,
      allowsMultipleSelection: true,
    });

    return images;
  };

  const resetSelection = () => {
    setSelectedImages([]);
  };

  return {
    selectedImages,
    isSubmitting,
    handleSelectMethod,
    handleConfirm,
    handleAddMore,
    resetSelection,
  };
}
