import React, { useCallback, forwardRef } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
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
          opacity={0.6}
          pressBehavior="none" // Prevent closing by tapping backdrop
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        enableDynamicSizing
        enablePanDownToClose={false} // Force user to acknowledge
        backdropComponent={renderBackdrop}
        handleComponent={null}
        backgroundStyle={{
          backgroundColor: "#f4f1e8",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
        }}
      >
        <BottomSheetView style={{ paddingBottom: insets.bottom + 20 }}>
          <View className="px-6 py-6">
            {/* Warning Icon */}
            <View className="mb-4 items-center">
              <View className="rounded-full bg-amber-100 p-4">
                <Warning size={48} color="#f59e0b" weight="fill" />
              </View>
            </View>

            {/* Title */}
            <Text
              className="mb-2 text-center text-2xl text-stone-900"
              style={{ fontFamily: "PlayfairDisplay_700Bold" }}
            >
              {t("warnings.title")}
            </Text>

            {/* Warning Reason */}
            <View className="mb-6 rounded-2xl bg-amber-50 p-4">
              <Text className="text-center text-base text-stone-700">{warning.reason}</Text>
            </View>

            {/* Info Text */}
            <Text className="mb-6 text-center text-sm text-stone-500">{t("warnings.info")}</Text>

            {/* Acknowledge Button */}
            <Pressable
              onPress={onAcknowledge}
              disabled={isLoading}
              className="rounded-full bg-primary px-6 py-4 active:opacity-80"
              style={{ opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center text-lg font-semibold text-white">
                  {t("warnings.acknowledge")}
                </Text>
              )}
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);
