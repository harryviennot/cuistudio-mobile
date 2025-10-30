import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View, ActivityIndicator } from "react-native";
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

export default function Index() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user, isLoading, isAnonymous } = useAuth();
  const bottomSheetRef = useRef<ExtractionMethodBottomSheetRef>(null);

  // Use the image extraction flow hook
  const {
    handleSelectMethod,
    handleConfirm,
    handleAddMore,
  } = useImageExtractionFlow(IMAGE_EXTRACTION_CONFIG.maxItems);

  const handleFABPress = () => {
    console.log("FAB pressed!");
    console.log("bottomSheetRef.current:", bottomSheetRef.current);

    if (bottomSheetRef.current) {
      console.log("Calling present() on bottom sheet...");
      try {
        bottomSheetRef.current.present();
        console.log("present() called successfully");
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

  // Add icons to methods
  const methodsWithIcons = IMAGE_EXTRACTION_METHODS.map((method) => ({
    ...method,
    icon:
      method.id === "camera" ? (
        <Camera size={32} color="#334d43" weight="duotone" />
      ) : (
        <ImageIcon size={32} color="#334d43" weight="duotone" />
      ),
  }));

  return (
    <View className="flex-1 bg-surface">
      <ScrollView className="flex-1" style={{ paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center gap-6 p-6">
          <Text className="text-2xl font-bold text-foreground-heading">{t("app.title")}</Text>
          <Text className="text-center text-foreground-secondary">{t("app.description")}</Text>
          <Text className="text-lg text-foreground">{t("common.welcome")}!</Text>

          {/* Authentication Status */}
          <View className="w-full rounded-lg bg-surface-elevated p-4 gap-3">
            <Text className="text-xl font-semibold text-foreground-heading">
              Authentication Status
            </Text>

            {isLoading ? (
              <View className="items-center py-4">
                <ActivityIndicator size="large" />
                <Text className="mt-2 text-foreground-secondary">Loading...</Text>
              </View>
            ) : user ? (
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-foreground-secondary">Status:</Text>
                  <View
                    className={`rounded-full px-3 py-1 ${isAnonymous ? "bg-yellow-500/20" : "bg-green-500/20"}`}
                  >
                    <Text
                      className={`font-medium ${isAnonymous ? "text-yellow-700" : "text-green-700"}`}
                    >
                      {isAnonymous ? "Anonymous" : "Authenticated"}
                    </Text>
                  </View>
                </View>

                <View className="gap-1">
                  <Text className="text-foreground-secondary">User ID:</Text>
                  <Text className="font-mono text-xs text-foreground">{user.id}</Text>
                </View>

                {user.email && (
                  <View className="gap-1">
                    <Text className="text-foreground-secondary">Email:</Text>
                    <Text className="text-foreground">{user.email}</Text>
                  </View>
                )}

                {user.phone && (
                  <View className="gap-1">
                    <Text className="text-foreground-secondary">Phone:</Text>
                    <Text className="text-foreground">{user.phone}</Text>
                  </View>
                )}

                <View className="gap-1">
                  <Text className="text-foreground-secondary">Created At:</Text>
                  <Text className="text-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </Text>
                </View>

                {user.user_metadata && Object.keys(user.user_metadata).length > 0 && (
                  <View className="gap-1">
                    <Text className="text-foreground-secondary">Metadata:</Text>
                    <Text className="font-mono text-xs text-foreground">
                      {JSON.stringify(user.user_metadata, null, 2)}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <Text className="text-foreground-secondary">Not authenticated</Text>
            )}
          </View>

          <LanguageSwitcher />
        </View>
      </ScrollView>

      {/* FAB for adding recipes */}
      <FAB onPress={handleFABPress} />

      {/* Bottom sheet for extraction method selection */}
      <ExtractionMethodBottomSheet
        ref={bottomSheetRef}
        methods={methodsWithIcons}
        title="Add Recipe from Image"
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
