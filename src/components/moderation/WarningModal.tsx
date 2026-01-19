import React, { useCallback, forwardRef } from "react";
import { View, Text, Image } from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Warning } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import type { UserWarning } from "@/types/auth";
import { ShadowItem } from "@/components/ShadowedSection";
import { ActionButton } from "@/components/ui/ActionButton";

interface WarningModalProps {
  warning: UserWarning;
  onAcknowledge: () => void;
  isLoading?: boolean;
}

export const WarningModal = forwardRef<BottomSheetModal, WarningModalProps>(
  function WarningModal({ warning, onAcknowledge, isLoading = false }, ref) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
          pressBehavior="none"
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        enableDynamicSizing
        enablePanDownToClose={false}
        backdropComponent={renderBackdrop}
        handleComponent={null}
        backgroundStyle={{
          backgroundColor: "#f4f1e8",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
        }}
      >
        <BottomSheetView style={{ paddingBottom: insets.bottom + 24 }}>
          <View className="px-6 pt-8">
            {/* Header Section */}
            <View className="mb-8 items-center">
              <ShadowItem className="mb-6 h-20 w-20 rounded-full bg-amber-50 border-amber-100">
                <Warning size={40} color="#b45309" weight="fill" />
              </ShadowItem>

              <Text
                className="text-center text-3xl text-stone-900"
                style={{ fontFamily: "PlayfairDisplay_700Bold" }}
              >
                {t("warnings.title")}
              </Text>
            </View>

            {/* Recipe Context (if available) */}
            {warning.recipe_image_url && (
              <ShadowItem className="mb-4 w-full overflow-hidden bg-white/50">
                <Image
                  source={{ uri: warning.recipe_image_url }}
                  className="h-40 w-full"
                  resizeMode="cover"
                />
                {warning.recipe_title && (
                  <View className="px-4 py-3">
                    <Text className="text-center text-base font-semibold text-stone-800">
                      {warning.recipe_title}
                    </Text>
                  </View>
                )}
              </ShadowItem>
            )}

            {/* Warning Content */}
            <ShadowItem className="mb-8 w-full overflow-hidden bg-white/50 p-6">
              <View className="mb-3 flex-row items-center gap-2">
                <View className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <Text className="font-semibold uppercase tracking-wider text-xs text-amber-700">
                  Moderation Note
                </Text>
              </View>
              <Text className="text-center text-lg leading-relaxed text-stone-800 font-medium">
                {warning.reason}
              </Text>
            </ShadowItem>

            {/* Acknowledge Action */}
            <View className="gap-4">
              <ActionButton
                title={t("warnings.acknowledge")}
                onPress={onAcknowledge}
                isLoading={isLoading}
                variant="primary"
                size="default"
              />
              <Text className="text-center text-xs text-stone-400">
                {t("warnings.info")}
              </Text>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);
