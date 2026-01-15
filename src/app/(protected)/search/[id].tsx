/**
 * Recipe detail screen within search modal
 * Allows viewing recipe details while staying in the search context
 */
import { View, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { recipeService } from "@/api/services";
import { RecipeDetail } from "@/components/recipe/RecipeDetail";

export default function SearchRecipeScreen() {
  const { id, title, imageUrl } = useLocalSearchParams<{
    id: string;
    title?: string;
    imageUrl?: string;
  }>();
  const router = useRouter();

  const {
    data: recipe,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["recipe", id],
    queryFn: () => recipeService.getRecipe(id!),
    enabled: !!id,
  });

  if (!id) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <Text className="text-foreground-secondary">Invalid recipe ID</Text>
      </View>
    );
  }

  return (
    <RecipeDetail
      recipe={recipe}
      isLoading={isLoading}
      error={error as Error | null}
      onBack={() => router.back()}
      onRetry={() => refetch()}
      optimisticTitle={title}
      optimisticImageUrl={imageUrl}
    />
  );
}
