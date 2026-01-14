/**
 * SearchResultSection - Wrapper component for grouped search results
 *
 * Displays a section with header, "See All" button, and masonry grid of recipes
 * Handles loading, empty, and populated states
 */
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { MasonryGrid } from "@/components/home/MasonryGrid";
import type { Recipe } from "@/types/recipe";

interface SearchResultSectionProps {
  title: string;
  recipes: Recipe[];
  isLoading: boolean;
  onSeeAll?: () => void;
  seeAllText?: string;
  emptyText?: string;
}

export function SearchResultSection({
  title,
  recipes,
  isLoading,
  onSeeAll,
  seeAllText,
  emptyText,
}: SearchResultSectionProps) {
  const { t } = useTranslation();

  // Show section header even when loading or empty
  const showHeader = isLoading || recipes.length > 0;

  if (!showHeader && !emptyText) {
    return null;
  }

  return (
    <View className="mb-6">
      {/* Section Header */}
      {showHeader && (
        <View className="flex-row items-center justify-between px-5 mb-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg font-playfair-bold text-foreground-heading">{title}</Text>
            {!isLoading && recipes.length > 0 && (
              <View className="bg-surface-elevated rounded-full px-2 py-0.5">
                <Text className="text-xs text-foreground-secondary font-medium">
                  {recipes.length}
                </Text>
              </View>
            )}
          </View>

          {/* See All Button */}
          {onSeeAll && recipes.length > 0 && !isLoading && (
            <Pressable onPress={onSeeAll} className="active:opacity-70">
              <Text className="text-sm font-semibold text-primary">
                {seeAllText || t("common.seeAll")}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Loading State */}
      {isLoading && (
        <View className="px-5 py-12">
          <ActivityIndicator size="large" color="#334d43" />
          <Text className="mt-4 text-center text-foreground-secondary">{t("search.loading")}</Text>
        </View>
      )}

      {/* Empty State */}
      {!isLoading && recipes.length === 0 && emptyText && (
        <View className="px-5 py-12">
          <Text className="text-center text-foreground-secondary">{emptyText}</Text>
        </View>
      )}

      {/* Results Grid */}
      {!isLoading && recipes.length > 0 && (
        <MasonryGrid recipes={recipes} refreshing={false} onRefresh={() => {}} />
      )}
    </View>
  );
}
