/**
 * Recipe preview screen - shows extracted recipe with save/discard options
 */
import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { CheckCircle, X } from "phosphor-react-native";
import { recipeService } from "@/api/services/recipe.service";
import type { Recipe } from "@/types/recipe";

export default function RecipePreviewScreen() {
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  const loadRecipe = async () => {
    if (!recipeId) return;

    try {
      setIsLoading(true);
      const data = await recipeService.getRecipe(recipeId);
      console.log(data);
      setRecipe(data);
    } catch (error) {
      console.error("Error loading recipe:", error);
      Alert.alert("Error", "Failed to load recipe");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!recipe) return;

    try {
      setIsSaving(true);
      // Recipe is already saved in the backend after extraction
      // Just navigate to home
      Alert.alert("Success", "Recipe saved successfully!", [
        {
          text: "OK",
          onPress: () => router.replace("/"),
        },
      ]);
    } catch (error) {
      console.error("Error saving recipe:", error);
      Alert.alert("Error", "Failed to save recipe");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      "Discard Recipe",
      "Are you sure you want to discard this recipe? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: async () => {
            try {
              if (recipeId) {
                await recipeService.deleteRecipe(recipeId);
              }
              router.replace("/");
            } catch (error) {
              console.error("Error discarding recipe:", error);
              Alert.alert("Error", "Failed to discard recipe");
            }
          },
        },
      ]
    );
  };

  if (!recipeId) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <Text className="text-red-600">Invalid recipe</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-foreground-secondary">Loading recipe...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <Text className="text-red-600">Recipe not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <Animated.View
        entering={FadeIn}
        className="border-b border-border bg-surface-elevated px-6 py-4"
      >
        <Text className="text-center text-lg font-semibold text-foreground-heading">
          Recipe Preview
        </Text>
      </Animated.View>

      {/* Recipe content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Animated.View entering={SlideInDown} className="px-6 py-6">
          {/* Title */}
          <Text className="mb-4 text-3xl font-bold text-foreground-heading">{recipe.title}</Text>

          {/* Description */}
          {recipe.description && (
            <Text className="mb-6 text-base leading-relaxed text-foreground">
              {recipe.description}
            </Text>
          )}

          {/* Meta info */}
          <View className="mb-6 flex-row flex-wrap gap-3">
            {recipe.timings?.prep_time_minutes && (
              <View className="rounded-full bg-primary/10 px-4 py-2">
                <Text className="text-sm font-medium text-primary">
                  Prep: {recipe.timings.prep_time_minutes} min
                </Text>
              </View>
            )}
            {recipe.timings?.cook_time_minutes && (
              <View className="rounded-full bg-primary/10 px-4 py-2">
                <Text className="text-sm font-medium text-primary">
                  Cook: {recipe.timings.cook_time_minutes} min
                </Text>
              </View>
            )}
            {recipe.servings && (
              <View className="rounded-full bg-primary/10 px-4 py-2">
                <Text className="text-sm font-medium text-primary">
                  Servings: {recipe.servings}
                </Text>
              </View>
            )}
          </View>

          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <View className="mb-8">
              <Text className="mb-4 text-2xl font-bold text-foreground-heading">Ingredients</Text>
              <View className="gap-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <View
                    key={index}
                    className="flex-row items-start gap-3 rounded-xl bg-surface-elevated p-4"
                  >
                    <View className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <Text className="flex-1 text-base text-foreground-heading">
                      {ingredient.quantity && ingredient.unit
                        ? `${ingredient.quantity} ${ingredient.unit} `
                        : ingredient.quantity
                          ? `${ingredient.quantity} `
                          : ""}
                      {ingredient.item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Instructions */}
          {recipe.instructions && recipe.instructions.length > 0 && (
            <View className="mb-8">
              <Text className="mb-4 text-2xl font-bold text-foreground-heading">Instructions</Text>
              <View className="gap-4">
                {recipe.instructions.map((instruction, index) => (
                  <View key={index} className="flex-row gap-4">
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
                      <Text className="font-bold text-white">
                        {instruction.step_number || index + 1}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-base leading-relaxed text-foreground-heading">
                        {instruction.text}
                      </Text>
                      {instruction.timer_minutes && (
                        <Text className="mt-1 text-sm text-foreground-secondary">
                          ⏱️ {instruction.timer_minutes} minutes
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Action buttons */}
      <Animated.View
        entering={SlideInDown.delay(300)}
        className="border-t border-border bg-surface-elevated px-6 py-4"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <View className="flex-row gap-3">
          <Pressable
            onPress={handleDiscard}
            disabled={isSaving}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border-2 border-border bg-surface-elevated py-4 active:bg-surface-overlay"
          >
            <X size={24} color="#6b5d4a" weight="bold" />
            <Text className="text-base font-semibold text-foreground">Discard</Text>
          </Pressable>

          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-4 active:bg-primary-hover"
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <CheckCircle size={24} color="#FFFFFF" weight="bold" />
                <Text className="text-base font-semibold text-white">Save Recipe</Text>
              </>
            )}
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}
