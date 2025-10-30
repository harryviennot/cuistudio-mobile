/**
 * Recipe card component for displaying recipe in grid view
 */
import { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Image as ImageIcon, Clock, ForkKnife } from "phosphor-react-native";
import type { Recipe } from "@/types/recipe";

interface RecipeCardProps {
  recipe: Recipe;
  index: number; // Add index for height variation
}

export const RecipeCard = memo(function RecipeCard({ recipe, index }: RecipeCardProps) {
  const handlePress = () => {
    router.push(`/recipe/preview/${recipe.id}` as any);
  };

  // Calculate total time
  const totalTime = recipe.timings?.total_time_minutes ||
    (recipe.timings?.prep_time_minutes || 0) + (recipe.timings?.cook_time_minutes || 0);

  // Get difficulty color
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-500/20 text-green-700";
      case "medium":
        return "bg-yellow-500/20 text-yellow-700";
      case "hard":
        return "bg-red-500/20 text-red-700";
      default:
        return "bg-foreground-secondary/20 text-foreground-secondary";
    }
  };

  // Calculate variable image height for Pinterest effect
  // Use recipe ID hash for consistent but varied heights
  const getImageHeight = () => {
    // Create a simple hash from recipe ID for consistent heights
    const hash = recipe.id.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    // Height variations for Pinterest effect (180-280px range)
    const heightVariations = [180, 200, 220, 240, 260, 280];
    const baseHeight = heightVariations[hash % heightVariations.length];

    // Add small random offset based on hash (0-40px)
    const offset = (hash * 17) % 40;

    return baseHeight + offset;
  };

  const imageHeight = getImageHeight();

  return (
    <Pressable
      onPress={handlePress}
      className="bg-surface-elevated rounded-xl overflow-hidden active:opacity-80"
      style={{ elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}
    >
      {/* Image or Placeholder */}
      {recipe.image_url ? (
        <Image
          source={{ uri: recipe.image_url }}
          style={{ width: "100%", height: imageHeight }}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
          priority="normal"
        />
      ) : (
        <View className="w-full bg-surface items-center justify-center gap-2" style={{ height: imageHeight }}>
          <ImageIcon size={48} color="#8b7a66" weight="duotone" />
          <Text className="text-foreground-secondary text-sm">No Image</Text>
        </View>
      )}

      {/* Content */}
      <View className="p-4 gap-2">
        {/* Title */}
        <Text className="font-playfair-bold text-lg text-foreground-heading" numberOfLines={2}>
          {recipe.title}
        </Text>

        {/* Description */}
        {recipe.description && (
          <Text className="text-sm text-foreground-secondary" numberOfLines={2}>
            {recipe.description}
          </Text>
        )}

        {/* Meta info */}
        <View className="flex-row items-center gap-3 mt-1">
          {/* Difficulty */}
          {recipe.difficulty && (
            <View className={`rounded-full px-2 py-1 ${getDifficultyColor(recipe.difficulty)}`}>
              <Text className={`text-xs font-medium ${getDifficultyColor(recipe.difficulty).split(" ")[1]}`}>
                {recipe.difficulty}
              </Text>
            </View>
          )}

          {/* Time */}
          {totalTime > 0 && (
            <View className="flex-row items-center gap-1">
              <Clock size={16} color="#8b7a66" weight="duotone" />
              <Text className="text-xs text-foreground-secondary">{totalTime}m</Text>
            </View>
          )}

          {/* Servings */}
          {recipe.servings && (
            <View className="flex-row items-center gap-1">
              <ForkKnife size={16} color="#8b7a66" weight="duotone" />
              <Text className="text-xs text-foreground-secondary">{recipe.servings}</Text>
            </View>
          )}
        </View>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1 mt-1">
            {recipe.tags.slice(0, 3).map((tag, index) => (
              <View key={index} className="bg-primary-light/20 rounded-md px-2 py-1">
                <Text className="text-xs text-primary">{tag}</Text>
              </View>
            ))}
            {recipe.tags.length > 3 && (
              <View className="bg-foreground-secondary/10 rounded-md px-2 py-1">
                <Text className="text-xs text-foreground-secondary">+{recipe.tags.length - 3}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
});
