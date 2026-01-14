/**
 * Library Results - Full screen view of all library search results
 *
 * Shows all recipes from user's library matching the search with infinite scroll
 */
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, MagnifyingGlass } from "phosphor-react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { recipeService } from "@/api/services";
import type { Recipe } from "@/types/recipe";
import type { SearchFilters, SortOption } from "@/types/search";
import { TIME_FILTER_RANGES } from "@/types/search";
import { MasonryGrid } from "@/components/home/MasonryGrid";

export default function LibraryResultsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    query: string;
    filters: string;
    sortBy: SortOption;
  }>();

  const query = params.query || "";
  const filters: SearchFilters = params.filters ? JSON.parse(params.filters) : {};
  const sortBy = params.sortBy || "relevance";

  // Convert time filter to min/max
  const timeRange = filters.timeFilter ? TIME_FILTER_RANGES[filters.timeFilter] : {};

  // Infinite query for library results
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery<Recipe[], Error>({
    queryKey: ["search", "library-all", query, filters, sortBy],
    queryFn: ({ pageParam = 0 }) =>
      recipeService.searchRecipesFiltered(query, {
        difficulty: filters.difficulty,
        categorySlug: filters.categorySlug,
        minTime: timeRange.min,
        maxTime: timeRange.max,
        sortBy,
        libraryOnly: true,
        limit: 20,
        offset: pageParam as number,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined;
      return allPages.length * 20;
    },
    initialPageParam: 0,
  });

  // Flatten all pages into single array
  const recipes = data?.pages.flat() ?? [];

  const handleBack = () => {
    router.back();
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View
        className="bg-surface border-b border-border px-4 py-3 flex-row items-center gap-3"
      >
        <Pressable
          onPress={handleBack}
          className="p-2 rounded-full active:bg-surface-elevated"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={24} color="#334d43" weight="bold" />
        </Pressable>

        <View className="flex-1">
          <Text className="text-lg font-playfair-bold text-foreground-heading">
            {t("search.libraryResults.title")}
          </Text>
          <Text className="text-sm text-foreground-secondary">
            {recipes.length > 0
              ? t("search.libraryResults.count", { count: recipes.length })
              : t("search.libraryResults.searching")}
          </Text>
        </View>
      </View>

      {/* Results Grid */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground-secondary">{t("search.loading")}</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-6 gap-4">
          <Text className="text-xl font-playfair-bold text-foreground-heading text-center">
            {t("search.error.title")}
          </Text>
          <Text className="text-foreground-secondary text-center">
            {error.message || t("search.error.description")}
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="bg-primary rounded-lg px-6 py-3 active:opacity-80"
          >
            <Text className="text-white font-semibold">{t("common.tryAgain")}</Text>
          </Pressable>
        </View>
      ) : recipes.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6 gap-4">
          <MagnifyingGlass size={64} color="#8b7a66" weight="duotone" />
          <Text className="text-xl font-playfair-bold text-foreground-heading text-center">
            {t("search.empty.library")}
          </Text>
          <Text className="text-foreground-secondary text-center">
            {t("search.empty.libraryDescription")}
          </Text>
        </View>
      ) : (
        <MasonryGrid
          recipes={recipes}
          refreshing={false}
          onRefresh={refetch}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4">
                <Text className="text-center text-foreground-secondary">
                  {t("common.loadingMore")}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
