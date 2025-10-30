import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import { FAB } from "@/components/extraction/FAB";
import {
  ExtractionMethodBottomSheet,
  type ExtractionMethodBottomSheetRef,
} from "@/components/extraction/ExtractionMethodBottomSheet";
import { ImagePreviewGrid } from "@/components/extraction/ImagePreviewGrid";
import { useImagePicker, type PickedImage } from "@/hooks/useImagePicker";
import { useImageExtraction } from "@/hooks/useImageExtraction";

export default function Index() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user, isLoading, isAnonymous } = useAuth();
  const router = useRouter();
  const bottomSheetRef = useRef<ExtractionMethodBottomSheetRef>(null);
  const [selectedImages, setSelectedImages] = useState<PickedImage[]>([]);
  const { pickImages, isPickingImage } = useImagePicker();
  const { submitImages, isSubmitting } = useImageExtraction();

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

  const handleSelectMethod = async (method: "camera" | "gallery") => {
    // Pick images from camera or gallery
    const images = await pickImages(method, {
      maxImages: 5,
      allowsMultipleSelection: true,
    });

    if (images && images.length > 0) {
      setSelectedImages(images);
      // Show confirmation view in bottom sheet
      bottomSheetRef.current?.showConfirmation(images);
    }
  };

  const handleConfirmImages = async (images: PickedImage[]) => {
    console.log("Submitting images for extraction...", images.length);
    const response = await submitImages(images);
    console.log("Extraction response:", response);

    if (response) {
      console.log("Navigating to extraction screen with job_id:", response.job_id);
      // Dismiss bottom sheet and navigate to extraction progress screen
      bottomSheetRef.current?.dismiss();
      router.push({
        pathname: "/extraction/[jobId]",
        params: { jobId: response.job_id },
      });
    } else {
      console.error("No response from submit images");
      Alert.alert("Error", "Failed to submit images for extraction. Please try again.");
    }
  };

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
        onSelectMethod={handleSelectMethod}
        onConfirmImages={handleConfirmImages}
      />
    </View>
  );
}
