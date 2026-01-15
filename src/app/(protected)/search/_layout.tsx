/**
 * Search Layout
 * Provides a nested Stack navigator for the search modal,
 * allowing drill-down navigation to recipe details while preserving search state.
 */
import { Stack } from "expo-router";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export default function SearchLayout() {
  return (
    <BottomSheetModalProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="[id]"
          options={{
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </BottomSheetModalProvider>
  );
}
