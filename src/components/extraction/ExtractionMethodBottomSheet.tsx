/**
 * Bottom sheet for selecting extraction method
 */
import React, { forwardRef, useMemo, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { Camera, Image as ImageIcon } from "phosphor-react-native";

export interface ExtractionMethod {
  id: "camera" | "gallery";
  label: string;
  icon: React.ReactNode;
}

interface ExtractionMethodBottomSheetProps {
  onSelectMethod: (method: "camera" | "gallery") => void;
}

export const ExtractionMethodBottomSheet = forwardRef<
  BottomSheetModal,
  ExtractionMethodBottomSheetProps
>(({ onSelectMethod }, ref) => {
  const snapPoints = useMemo(() => ["45%"], []);

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

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
    ),
    []
  );

  const handleSheetChanges = useCallback((index: number) => {
    console.log("Bottom sheet index changed to:", index);
  }, []);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      enableHandlePanningGesture={true}
      backdropComponent={renderBackdrop}
      onChange={handleSheetChanges}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handleIndicator}
      style={styles.modal}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={styles.title}>
          Add Recipe from Image
        </Text>

        <View style={styles.methodsContainer}>
          {methods.map((method) => (
            <Pressable
              key={method.id}
              onPress={() => {
                console.log("Method selected:", method.id);
                onSelectMethod(method.id);
              }}
              style={styles.methodButton}
            >
              <View style={styles.iconContainer}>
                {method.icon}
              </View>
              <Text style={styles.methodLabel}>
                {method.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  modal: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  background: {
    backgroundColor: "#fefdfb",
  },
  handleIndicator: {
    backgroundColor: "#334d43",
    width: 40,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: "#fefdfb",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
    color: "#3a3226",
  },
  methodsContainer: {
    gap: 16,
  },
  methodButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#d4c5a9",
    backgroundColor: "#fefdfb",
    padding: 24,
  },
  iconContainer: {
    height: 48,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(51, 77, 67, 0.1)",
  },
  methodLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: "500",
    color: "#3a3226",
  },
});

ExtractionMethodBottomSheet.displayName = "ExtractionMethodBottomSheet";
