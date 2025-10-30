import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRef } from "react";
import { Camera, Image as ImageIcon } from "phosphor-react-native";
import { FAB } from "@/components/extraction/FAB";
import {
  ExtractionMethodBottomSheet,
  type ExtractionMethodBottomSheetRef,
} from "@/components/extraction/ExtractionMethodBottomSheet";
import { ImageConfirmationView } from "@/components/extraction/confirmation/ImageConfirmationView";
import { useImageExtractionFlow } from "@/hooks/useImageExtractionFlow";
import {
  IMAGE_EXTRACTION_METHODS,
  IMAGE_EXTRACTION_CONFIG,
  type ExtractionSourceType,
} from "@/config/extractionMethods";
import { RecipeMasonryGrid } from "@/components/recipe/RecipeMasonryGrid";

export default function Index() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<ExtractionMethodBottomSheetRef>(null);

  // Use the image extraction flow hook
  const { handleSelectMethod, handleConfirm, handleAddMore } = useImageExtractionFlow(
    IMAGE_EXTRACTION_CONFIG.maxItems
  );

  const handleFABPress = () => {
    if (bottomSheetRef.current) {
      try {
        bottomSheetRef.current.present();
      } catch (error) {
        console.error("Error calling present():", error);
      }
    } else {
      console.error("bottomSheetRef.current is null!");
    }
  };

  const handleMethodSelect = async (method: ExtractionSourceType) => {
    const images = await handleSelectMethod(method);
    if (images && images.length > 0) {
      // Show confirmation view in bottom sheet
      bottomSheetRef.current?.showConfirmation(images);
    }
  };

  const handleConfirmImages = async (images: any[]) => {
    await handleConfirm(images);
    // Dismiss bottom sheet after successful submission
    bottomSheetRef.current?.dismiss();
  };

  // Add icons and translated labels to methods
  const methodsWithIcons = IMAGE_EXTRACTION_METHODS.map((method) => ({
    ...method,
    label:
      method.id === "camera"
        ? t("extraction.methods.takePhotos")
        : t("extraction.methods.chooseGallery"),
    icon:
      method.id === "camera" ? (
        <Camera size={32} color="#334d43" weight="duotone" />
      ) : (
        <ImageIcon size={32} color="#334d43" weight="duotone" />
      ),
  }));

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      {/* Recipe Grid */}
      <RecipeMasonryGrid />

      {/* FAB for adding recipes */}
      <FAB onPress={handleFABPress} />

      {/* Bottom sheet for extraction method selection */}
      <ExtractionMethodBottomSheet
        ref={bottomSheetRef}
        methods={methodsWithIcons}
        title={t("extraction.addRecipeFromImage")}
        onSelectMethod={handleMethodSelect}
        onConfirm={handleConfirmImages}
        onAddMore={handleAddMore}
        renderConfirmation={(props) => (
          <ImageConfirmationView
            images={props.items}
            uploadStates={props.uploadStates}
            maxItems={IMAGE_EXTRACTION_CONFIG.maxItems}
            onRemoveImage={props.onRemove}
            onAddMore={props.onAddMore}
            onConfirm={props.onConfirm}
            onBack={props.onBack}
            isUploading={props.isUploading}
          />
        )}
      />
    </View>
  );
}
